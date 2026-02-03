#include "video_engine.h"
extern "C" {
#include <libavcodec/avcodec.h>
#include <libavformat/avformat.h>
#include <libavutil/imgutils.h>
#include <libswscale/swscale.h>
}
#include <map>
#include <mutex>

namespace revo {

// LRU cache for decoded frames
class FrameCache {
public:
    explicit FrameCache(size_t max_size = 100) : max_size_(max_size) {}
    
    void put(double timestamp, std::unique_ptr<VideoFrame> frame) {
        std::lock_guard<std::mutex> lock(mutex_);
        auto key = static_cast<int64_t>(timestamp * 1000);
        cache_[key] = std::move(frame);
        access_order_.push_back(key);
        
        while (cache_.size() > max_size_) {
            auto oldest = access_order_.front();
            access_order_.pop_front();
            cache_.erase(oldest);
        }
    }
    
    VideoFrame* get(double timestamp) {
        std::lock_guard<std::mutex> lock(mutex_);
        auto key = static_cast<int64_t>(timestamp * 1000);
        auto it = cache_.find(key);
        if (it != cache_.end()) {
            return it->second.get();
        }
        return nullptr;
    }

private:
    size_t max_size_;
    std::map<int64_t, std::unique_ptr<VideoFrame>> cache_;
    std::list<int64_t> access_order_;
    std::mutex mutex_;
};

// ============================================================================
// VIDEO DECODER IMPLEMENTATION
// ============================================================================

class VideoDecoder::Impl {
public:
    Impl() : format_ctx_(nullptr), codec_ctx_(nullptr), 
             sws_ctx_(nullptr), video_stream_idx_(-1) {}
    
    ~Impl() {
        close();
    }
    
    bool open(const std::string& path) {
        // Open video file
        if (avformat_open_input(&format_ctx_, path.c_str(), nullptr, nullptr) < 0) {
            return false;
        }
        
        // Retrieve stream information
        if (avformat_find_stream_info(format_ctx_, nullptr) < 0) {
            avformat_close_input(&format_ctx_);
            return false;
        }
        
        // Find video stream
        for (unsigned i = 0; i < format_ctx_->nb_streams; i++) {
            if (format_ctx_->streams[i]->codecpar->codec_type == AVMEDIA_TYPE_VIDEO) {
                video_stream_idx_ = i;
                break;
            }
        }
        
        if (video_stream_idx_ == -1) {
            avformat_close_input(&format_ctx_);
            return false;
        }
        
        // Get codec parameters
        AVCodecParameters* codecpar = format_ctx_->streams[video_stream_idx_]->codecpar;
        
        // Find decoder
        const AVCodec* codec = avcodec_find_decoder(codecpar->codec_id);
        if (!codec) {
            avformat_close_input(&format_ctx_);
            return false;
        }
        
        // Allocate codec context
        codec_ctx_ = avcodec_alloc_context3(codec);
        if (!codec_ctx_) {
            avformat_close_input(&format_ctx_);
            return false;
        }
        
        // Copy codec parameters to context
        if (avcodec_parameters_to_context(codec_ctx_, codecpar) < 0) {
            avcodec_free_context(&codec_ctx_);
            avformat_close_input(&format_ctx_);
            return false;
        }
        
        // Enable hardware acceleration if available
        codec_ctx_->thread_count = 4;  // Multi-threaded decoding
        
        // Open codec
        if (avcodec_open2(codec_ctx_, codec, nullptr) < 0) {
            avcodec_free_context(&codec_ctx_);
            avformat_close_input(&format_ctx_);
            return false;
        }
        
        // Initialize scaler for RGBA conversion
        sws_ctx_ = sws_getContext(
            codec_ctx_->width, codec_ctx_->height, codec_ctx_->pix_fmt,
            codec_ctx_->width, codec_ctx_->height, AV_PIX_FMT_RGBA,
            SWS_BILINEAR, nullptr, nullptr, nullptr
        );
        
        return true;
    }
    
    VideoInfo get_info() const {
        VideoInfo info{};
        if (!codec_ctx_) return info;
        
        info.width = codec_ctx_->width;
        info.height = codec_ctx_->height;
        info.framerate_num = format_ctx_->streams[video_stream_idx_]->avg_frame_rate.num;
        info.framerate_den = format_ctx_->streams[video_stream_idx_]->avg_frame_rate.den;
        info.duration = format_ctx_->duration / static_cast<double>(AV_TIME_BASE);
        info.codec_name = avcodec_get_name(codec_ctx_->codec_id);
        
        return info;
    }
    
    bool seek(double timestamp) {
        if (!format_ctx_) return false;
        
        int64_t seek_target = static_cast<int64_t>(timestamp * AV_TIME_BASE);
        if (av_seek_frame(format_ctx_, -1, seek_target, AVSEEK_FLAG_BACKWARD) < 0) {
            return false;
        }
        
        avcodec_flush_buffers(codec_ctx_);
        return true;
    }
    
    std::unique_ptr<VideoFrame> decode_frame() {
        if (!codec_ctx_) return nullptr;
        
        AVPacket* packet = av_packet_alloc();
        AVFrame* frame = av_frame_alloc();
        
        std::unique_ptr<VideoFrame> result = nullptr;
        
        while (av_read_frame(format_ctx_, packet) >= 0) {
            if (packet->stream_index == video_stream_idx_) {
                if (avcodec_send_packet(codec_ctx_, packet) >= 0) {
                    if (avcodec_receive_frame(codec_ctx_, frame) >= 0) {
                        result = convert_to_rgba(frame);
                        break;
                    }
                }
            }
            av_packet_unref(packet);
        }
        
        av_frame_free(&frame);
        av_packet_free(&packet);
        
        return result;
    }
    
    std::unique_ptr<VideoFrame> get_frame_at(double timestamp) {
        // Check cache first
        if (auto* cached = frame_cache_.get(timestamp)) {
            auto copy = std::make_unique<VideoFrame>();
            *copy = *cached;
            return copy;
        }
        
        // Seek and decode
        if (!seek(timestamp)) return nullptr;
        
        auto frame = decode_frame();
        if (frame) {
            // Cache the frame
            auto frame_copy = std::make_unique<VideoFrame>(*frame);
            frame_cache_.put(timestamp, std::move(frame_copy));
        }
        
        return frame;
    }
    
    void close() {
        if (sws_ctx_) {
            sws_freeContext(sws_ctx_);
            sws_ctx_ = nullptr;
        }
        if (codec_ctx_) {
            avcodec_free_context(&codec_ctx_);
            codec_ctx_ = nullptr;
        }
        if (format_ctx_) {
            avformat_close_input(&format_ctx_);
            format_ctx_ = nullptr;
        }
    }

private:
    std::unique_ptr<VideoFrame> convert_to_rgba(AVFrame* frame) {
        auto video_frame = std::make_unique<VideoFrame>();
        video_frame->width = codec_ctx_->width;
        video_frame->height = codec_ctx_->height;
        video_frame->pts = frame->pts * av_q2d(format_ctx_->streams[video_stream_idx_]->time_base);
        
        // Allocate RGBA buffer
        int rgba_size = video_frame->width * video_frame->height * 4;
        video_frame->data.resize(rgba_size);
        
        // Convert to RGBA
        uint8_t* dst_data[1] = { video_frame->data.data() };
        int dst_linesize[1] = { video_frame->width * 4 };
        
        sws_scale(
            sws_ctx_,
            frame->data, frame->linesize,
            0, codec_ctx_->height,
            dst_data, dst_linesize
        );
        
        return video_frame;
    }
    
    AVFormatContext* format_ctx_;
    AVCodecContext* codec_ctx_;
    SwsContext* sws_ctx_;
    int video_stream_idx_;
    FrameCache frame_cache_;
};

// ============================================================================
// PUBLIC API
// ============================================================================

VideoDecoder::VideoDecoder() : impl_(std::make_unique<Impl>()) {}
VideoDecoder::~VideoDecoder() = default;

bool VideoDecoder::open(const std::string& path) {
    return impl_->open(path);
}

VideoInfo VideoDecoder::get_info() const {
    return impl_->get_info();
}

bool VideoDecoder::seek(double timestamp) {
    return impl_->seek(timestamp);
}

std::unique_ptr<VideoFrame> VideoDecoder::decode_frame() {
    return impl_->decode_frame();
}

std::unique_ptr<VideoFrame> VideoDecoder::get_frame_at(double timestamp) {
    return impl_->get_frame_at(timestamp);
}

void VideoDecoder::close() {
    impl_->close();
}

} // namespace revo

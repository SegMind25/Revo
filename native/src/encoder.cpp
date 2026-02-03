#include "video_engine.h"
extern "C" {
#include <libavcodec/avcodec.h>
#include <libavformat/avformat.h>
#include <libavutil/opt.h>
#include <libswscale/swscale.h>
}

namespace revo {

// ============================================================================
// VIDEO ENCODER IMPLEMENTATION
// ============================================================================

class VideoEncoder::Impl {
public:
    Impl() : format_ctx_(nullptr), codec_ctx_(nullptr), stream_(nullptr),
             sws_ctx_(nullptr), frame_count_(0), total_frames_(0) {}
    
    ~Impl() {
        if (codec_ctx_) {
            avcodec_free_context(&codec_ctx_);
        }
        if (format_ctx_) {
            if (format_ctx_->pb) {
                avio_closep(&format_ctx_->pb);
            }
            avformat_free_context(format_ctx_);
        }
        if (sws_ctx_) {
            sws_freeContext(sws_ctx_);
        }
    }
    
    bool initialize(const ExportSettings& settings) {
        settings_ = settings;
        
        // Allocate output context
        avformat_alloc_output_context2(&format_ctx_, nullptr, nullptr, 
                                       settings.output_path.c_str());
        if (!format_ctx_) {
            return false;
        }
        
        // Find encoder
        const AVCodec* codec = nullptr;
        if (settings.codec == "h264") {
            codec = avcodec_find_encoder_by_name("libx264");
        } else if (settings.codec == "h265") {
            codec = avcodec_find_encoder_by_name("libx265");
        } else if (settings.codec == "vp9") {
            codec = avcodec_find_encoder_by_name("libvpx-vp9");
        }
        
        if (!codec) {
            codec = avcodec_find_encoder(AV_CODEC_ID_H264);  // Fallback
        }
        
        if (!codec) {
            return false;
        }
        
        // Create stream
        stream_ = avformat_new_stream(format_ctx_, nullptr);
        if (!stream_) {
            return false;
        }
        
        // Allocate codec context
        codec_ctx_ = avcodec_alloc_context3(codec);
        if (!codec_ctx_) {
            return false;
        }
        
        // Configure encoder
        codec_ctx_->width = settings.width;
        codec_ctx_->height = settings.height;
        codec_ctx_->time_base = AVRational{1, settings.framerate};
        codec_ctx_->framerate = AVRational{settings.framerate, 1};
        codec_ctx_->bit_rate = settings.bitrate;
        codec_ctx_->pix_fmt = AV_PIX_FMT_YUV420P;
        codec_ctx_->gop_size = 12;
        codec_ctx_->max_b_frames = 2;
        
        // Codec-specific options
        if (codec->id == AV_CODEC_ID_H264) {
            av_opt_set(codec_ctx_->priv_data, "preset", "medium", 0);
            av_opt_set(codec_ctx_->priv_data, "tune", "film", 0);
        }
        
        if (format_ctx_->oformat->flags & AVFMT_GLOBALHEADER) {
            codec_ctx_->flags |= AV_CODEC_FLAG_GLOBAL_HEADER;
        }
        
        // Open codec
        if (avcodec_open2(codec_ctx_, codec, nullptr) < 0) {
            return false;
        }
        
        // Copy parameters to stream
        avcodec_parameters_from_context(stream_->codecpar, codec_ctx_);
        stream_->time_base = codec_ctx_->time_base;
        
        // Open output file
        if (!(format_ctx_->oformat->flags & AVFMT_NOFILE)) {
            if (avio_open(&format_ctx_->pb, settings.output_path.c_str(), 
                         AVIO_FLAG_WRITE) < 0) {
                return false;
            }
        }
        
        // Write header
        if (avformat_write_header(format_ctx_, nullptr) < 0) {
            return false;
        }
        
        // Initialize scaler
        sws_ctx_ = sws_getContext(
            settings.width, settings.height, AV_PIX_FMT_RGBA,
            settings.width, settings.height, AV_PIX_FMT_YUV420P,
            SWS_BILINEAR, nullptr, nullptr, nullptr
        );
        
        return true;
    }
    
    bool encode_frame(const VideoFrame& frame) {
        AVFrame* av_frame = av_frame_alloc();
        av_frame->format = AV_PIX_FMT_YUV420P;
        av_frame->width = codec_ctx_->width;
        av_frame->height = codec_ctx_->height;
        av_frame->pts = frame_count_++;
        
        av_frame_get_buffer(av_frame, 0);
        
        // Convert RGBA to YUV420P
        const uint8_t* src_data[1] = { frame.data.data() };
        int src_linesize[1] = { frame.width * 4 };
        
        sws_scale(
            sws_ctx_,
            src_data, src_linesize,
            0, frame.height,
            av_frame->data, av_frame->linesize
        );
        
        // Send frame to encoder
        int ret = avcodec_send_frame(codec_ctx_, av_frame);
        av_frame_free(&av_frame);
        
        if (ret < 0) {
            return false;
        }
        
        // Receive encoded packets
        AVPacket* packet = av_packet_alloc();
        while (ret >= 0) {
            ret = avcodec_receive_packet(codec_ctx_, packet);
            if (ret == AVERROR(EAGAIN) || ret == AVERROR_EOF) {
                break;
            }
            if (ret < 0) {
                av_packet_free(&packet);
                return false;
            }
            
            av_packet_rescale_ts(packet, codec_ctx_->time_base, stream_->time_base);
            packet->stream_index = stream_->index;
            
            av_interleaved_write_frame(format_ctx_, packet);
            av_packet_unref(packet);
        }
        av_packet_free(&packet);
        
        return true;
    }
    
    bool finalize() {
        // Flush encoder
        avcodec_send_frame(codec_ctx_, nullptr);
        
        AVPacket* packet = av_packet_alloc();
        int ret;
        while ((ret = avcodec_receive_packet(codec_ctx_, packet)) >= 0) {
            av_packet_rescale_ts(packet, codec_ctx_->time_base, stream_->time_base);
            packet->stream_index = stream_->index;
            av_interleaved_write_frame(format_ctx_, packet);
            av_packet_unref(packet);
        }
        av_packet_free(&packet);
        
        // Write trailer
        av_write_trailer(format_ctx_);
        
        return true;
    }
    
    float get_progress() const {
        if (total_frames_ == 0) return 0.0f;
        return static_cast<float>(frame_count_) / total_frames_;
    }

private:
    ExportSettings settings_;
    AVFormatContext* format_ctx_;
    AVCodecContext* codec_ctx_;
    AVStream* stream_;
    SwsContext* sws_ctx_;
    int64_t frame_count_;
    int64_t total_frames_;
};

// ============================================================================
// PUBLIC API
// ============================================================================

VideoEncoder::VideoEncoder() : impl_(std::make_unique<Impl>()) {}
VideoEncoder::~VideoEncoder() = default;

bool VideoEncoder::initialize(const ExportSettings& settings) {
    return impl_->initialize(settings);
}

bool VideoEncoder::encode_frame(const VideoFrame& frame) {
    return impl_->encode_frame(frame);
}

bool VideoEncoder::finalize() {
    return impl_->finalize();
}

float VideoEncoder::get_progress() const {
    return impl_->get_progress();
}

} // namespace revo

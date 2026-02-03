#include "video_engine.h"
#include <algorithm>
#include <list>

namespace revo {

// ============================================================================
// TIMELINE ENGINE IMPLEMENTATION
// ============================================================================

class TimelineEngine::Impl {
public:
    Impl(int width, int height, int framerate)
        : width_(width), height_(height), framerate_(framerate),
          compositor_(width, height) {
        compositor_.initialize();
    }
    
    void add_clip(const TimelineClip& clip) {
        clips_.push_back(clip);
        
        // Load video decoder for this clip
        auto decoder = std::make_unique<VideoDecoder>();
        if (decoder->open(clip.video_path)) {
            decoders_[clip.id] = std::move(decoder);
        }
    }
    
    void remove_clip(uint32_t clip_id) {
        clips_.erase(
            std::remove_if(clips_.begin(), clips_.end(),
                [clip_id](const TimelineClip& c) { return c.id == clip_id; }),
            clips_.end()
        );
        decoders_.erase(clip_id);
    }
    
    std::unique_ptr<VideoFrame> render_frame(double timestamp) {
        std::vector<VideoFrame*> layers;
        std::vector<float> opacities;
        
        // Find all clips that are active at this timestamp
        for (const auto& clip : clips_) {
            double clip_end = clip.start_time + clip.duration;
            
            if (timestamp >= clip.start_time && timestamp < clip_end) {
                // Calculate position in source video
                double offset = timestamp - clip.start_time;
                double source_time = clip.source_start + offset;
                
                // Decode frame from clip
                auto it = decoders_.find(clip.id);
                if (it != decoders_.end()) {
                    auto frame = it->second->get_frame_at(source_time);
                    if (frame) {
                        temp_frames_.push_back(std::move(frame));
                        layers.push_back(temp_frames_.back().get());
                        opacities.push_back(1.0f);
                    }
                }
            }
        }
        
        // Composite all layers
        auto result = layers.empty() ? create_blank_frame() : 
                     compositor_.composite(layers, opacities);
        
        temp_frames_.clear();
        return result;
    }
    
    double get_duration() const {
        double max_end = 0.0;
        for (const auto& clip : clips_) {
            double clip_end = clip.start_time + clip.duration;
            max_end = std::max(max_end, clip_end);
        }
        return max_end;
    }

private:
    std::unique_ptr<VideoFrame> create_blank_frame() {
        auto frame = std::make_unique<VideoFrame>();
        frame->width = width_;
        frame->height = height_;
        frame->data.resize(width_ * height_ * 4, 0);  // Black frame
        return frame;
    }
    
    int width_;
    int height_;
    int framerate_;
    std::vector<TimelineClip> clips_;
    std::map<uint32_t, std::unique_ptr<VideoDecoder>> decoders_;
    Compositor compositor_;
    std::vector<std::unique_ptr<VideoFrame>> temp_frames_;
};

// ============================================================================
// PUBLIC API
// ============================================================================

TimelineEngine::TimelineEngine(int width, int height, int framerate)
    : impl_(std::make_unique<Impl>(width, height, framerate)) {}

TimelineEngine::~TimelineEngine() = default;

void TimelineEngine::add_clip(const TimelineClip& clip) {
    impl_->add_clip(clip);
}

void TimelineEngine::remove_clip(uint32_t clip_id) {
    impl_->remove_clip(clip_id);
}

std::unique_ptr<VideoFrame> TimelineEngine::render_frame(double timestamp) {
    return impl_->render_frame(timestamp);
}

double TimelineEngine::get_duration() const {
    return impl_->get_duration();
}

} // namespace revo

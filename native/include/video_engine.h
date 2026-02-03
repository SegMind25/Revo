#ifndef REVO_VIDEO_ENGINE_H
#define REVO_VIDEO_ENGINE_H

#include <cstdint>
#include <string>
#include <vector>
#include <memory>

namespace revo {

// Forward declarations
struct VideoFrame;
struct AudioFrame;
struct TimelineClip;
struct Effect;

// Video metadata structure
struct VideoInfo {
    int width;
    int height;
    int framerate_num;
    int framerate_den;
    double duration;
    std::string codec_name;
};

// Export settings
struct ExportSettings {
    std::string output_path;
    std::string format;       // "mp4", "webm", "mov"
    std::string codec;        // "h264", "h265", "vp9"
    int width;
    int height;
    int bitrate;
    int framerate;
};

// ============================================================================
// VIDEO DECODER
// ============================================================================
class VideoDecoder {
public:
    VideoDecoder();
    ~VideoDecoder();
    
    // Open video file and initialize decoder
    bool open(const std::string& path);
    
    // Get video metadata
    VideoInfo get_info() const;
    
    // Seek to specific timestamp (seconds)
    bool seek(double timestamp);
    
    // Decode next frame
    std::unique_ptr<VideoFrame> decode_frame();
    
    // Get frame at specific timestamp (with caching)
    std::unique_ptr<VideoFrame> get_frame_at(double timestamp);
    
    void close();

private:
    class Impl;
    std::unique_ptr<Impl> impl_;
};

// ============================================================================
// TIMELINE ENGINE
// ============================================================================
class TimelineEngine {
public:
    TimelineEngine(int width, int height, int framerate);
    ~TimelineEngine();
    
    // Add clip to timeline
    void add_clip(const TimelineClip& clip);
    
    // Remove clip by ID
    void remove_clip(uint32_t clip_id);
    
    // Render frame at specific time
    std::unique_ptr<VideoFrame> render_frame(double timestamp);
    
    // Get timeline duration
    double get_duration() const;

private:
    class Impl;
    std::unique_ptr<Impl> impl_;
};

// ============================================================================
// GPU COMPOSITOR
// ============================================================================
class Compositor {
public:
    Compositor(int width, int height);
    ~Compositor();
    
    // Initialize OpenGL context
    bool initialize();
    
    // Composite multiple layers
    std::unique_ptr<VideoFrame> composite(
        const std::vector<VideoFrame*>& layers,
        const std::vector<float>& opacities
    );
    
    // Apply transform (scale, rotate, position)
    void set_transform(int layer_idx, float scale_x, float scale_y, 
                      float rotation, float pos_x, float pos_y);

private:
    class Impl;
    std::unique_ptr<Impl> impl_;
};

// ============================================================================
// EFFECTS PIPELINE
// ============================================================================
class EffectsPipeline {
public:
    EffectsPipeline();
    ~EffectsPipeline();
    
    // Apply color correction
    void color_correct(VideoFrame& frame, float brightness, float contrast, 
                      float saturation);
    
    // Apply Gaussian blur
    void blur(VideoFrame& frame, float amount);
    
    // Apply chroma key (green screen)
    void chroma_key(VideoFrame& frame, uint8_t r, uint8_t g, uint8_t b, 
                   float threshold);

private:
    class Impl;
    std::unique_ptr<Impl> impl_;
};

// ============================================================================
// AUDIO MIXER
// ============================================================================
class AudioMixer {
public:
    AudioMixer(int sample_rate);
    ~AudioMixer();
    
    // Start real-time audio playback
    bool start_playback();
    
    // Stop playback
    void stop_playback();
    
    // Mix audio frames
    std::unique_ptr<AudioFrame> mix(
        const std::vector<AudioFrame*>& tracks,
        const std::vector<float>& volumes
    );

private:
    class Impl;
    std::unique_ptr<Impl> impl_;
};

// ============================================================================
// VIDEO ENCODER
// ============================================================================
class VideoEncoder {
public:
    VideoEncoder();
    ~VideoEncoder();
    
    // Initialize encoder with settings
    bool initialize(const ExportSettings& settings);
    
    // Encode single frame
    bool encode_frame(const VideoFrame& frame);
    
    // Finalize and write output file
    bool finalize();
    
    // Get export progress (0.0 - 1.0)
    float get_progress() const;

private:
    class Impl;
    std::unique_ptr<Impl> impl_;
};

// ============================================================================
// DATA STRUCTURES
// ============================================================================

struct VideoFrame {
    int width;
    int height;
    std::vector<uint8_t> data;  // RGBA format
    double pts;  // Presentation timestamp
};

struct AudioFrame {
    int sample_rate;
    int channels;
    std::vector<float> data;
    double pts;
};

struct TimelineClip {
    uint32_t id;
    std::string video_path;
    double start_time;      // Timeline position
    double duration;
    double source_start;    // Trim start in source video
};

} // namespace revo

#endif // REVO_VIDEO_ENGINE_H

#include "video_engine.h"
#include <algorithm>
#include <cmath>

namespace revo {

// ============================================================================
// EFFECTS PIPELINE IMPLEMENTATION
// ============================================================================

class EffectsPipeline::Impl {
public:
    void color_correct(VideoFrame& frame, float brightness, float contrast, float saturation) {
        for (size_t i = 0; i < frame.data.size(); i += 4) {
            // Get RGB values
            float r = frame.data[i + 0] / 255.0f;
            float g = frame.data[i + 1] / 255.0f;
            float b = frame.data[i + 2] / 255.0f;
            
            // Apply brightness
            r += brightness;
            g += brightness;
            b += brightness;
            
            // Apply contrast
            r = (r - 0.5f) * contrast + 0.5f;
            g = (g - 0.5f) * contrast + 0.5f;
            b = (b - 0.5f) * contrast + 0.5f;
            
            // Apply saturation
            float gray = 0.299f * r + 0.587f * g + 0.114f * b;
            r = gray + saturation * (r - gray);
            g = gray + saturation * (g - gray);
            b = gray + saturation * (b - gray);
            
            // Clamp
            frame.data[i + 0] = static_cast<uint8_t>(std::clamp(r, 0.0f, 1.0f) * 255);
            frame.data[i + 1] = static_cast<uint8_t>(std::clamp(g, 0.0f, 1.0f) * 255);
            frame.data[i + 2] = static_cast<uint8_t>(std::clamp(b, 0.0f, 1.0f) * 255);
        }
    }
    
    void blur(VideoFrame& frame, float amount) {
        // Simple box blur
        int radius = static_cast<int>(amount * 10);
        if (radius < 1) return;
        
        std::vector<uint8_t> temp = frame.data;
        
        for (int y = 0; y < frame.height; y++) {
            for (int x = 0; x < frame.width; x++) {
                int r_sum = 0, g_sum = 0, b_sum = 0, count = 0;
                
                for (int dy = -radius; dy <= radius; dy++) {
                    for (int dx = -radius; dx <= radius; dx++) {
                        int nx = x + dx;
                        int ny = y + dy;
                        
                        if (nx >= 0 && nx < frame.width && ny >= 0 && ny < frame.height) {
                            int idx = (ny * frame.width + nx) * 4;
                            r_sum += temp[idx + 0];
                            g_sum += temp[idx + 1];
                            b_sum += temp[idx + 2];
                            count++;
                        }
                    }
                }
                
                int idx = (y * frame.width + x) * 4;
                frame.data[idx + 0] = r_sum / count;
                frame.data[idx + 1] = g_sum / count;
                frame.data[idx + 2] = b_sum / count;
            }
        }
    }
    
    void chroma_key(VideoFrame& frame, uint8_t r, uint8_t g, uint8_t b, float threshold) {
        for (size_t i = 0; i < frame.data.size(); i += 4) {
            uint8_t pr = frame.data[i + 0];
            uint8_t pg = frame.data[i + 1];
            uint8_t pb = frame.data[i + 2];
            
            // Calculate color distance
            float dr = (pr - r) / 255.0f;
            float dg = (pg - g) / 255.0f;
            float db = (pb - b) / 255.0f;
            float distance = std::sqrt(dr*dr + dg*dg + db*db);
            
            // If close to key color, make transparent
            if (distance < threshold) {
                frame.data[i + 3] = 0;  // Fully transparent
            }
        }
    }
};

// ============================================================================
// PUBLIC API
// ============================================================================

EffectsPipeline::EffectsPipeline() : impl_(std::make_unique<Impl>()) {}
EffectsPipeline::~EffectsPipeline() = default;

void EffectsPipeline::color_correct(VideoFrame& frame, float brightness, 
                                    float contrast, float saturation) {
    impl_->color_correct(frame, brightness, contrast, saturation);
}

void EffectsPipeline::blur(VideoFrame& frame, float amount) {
    impl_->blur(frame, amount);
}

void EffectsPipeline::chroma_key(VideoFrame& frame, uint8_t r, uint8_t g,
                                uint8_t b, float threshold) {
    impl_->chroma_key(frame, r, g, b, threshold);
}

} // namespace revo

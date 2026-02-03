#include "video_engine.h"
#include <GL/gl.h>
#include <cstring>

namespace revo {

// ============================================================================
// GPU COMPOSITOR IMPLEMENTATION
// ============================================================================

class Compositor::Impl {
public:
    Impl(int width, int height) : width_(width), height_(height), 
                                   initialized_(false) {}
    
    ~Impl() {
        // Cleanup OpenGL resources
        if (texture_id_ != 0) {
            glDeleteTextures(1, &texture_id_);
        }
    }
    
    bool initialize() {
        // For now, we'll do CPU-based compositing since OpenGL context
        // creation requires a window/display connection
        // In a full implementation, this would initialize GL context
        initialized_ = true;
        return true;
    }
    
    std::unique_ptr<VideoFrame> composite(
        const std::vector<VideoFrame*>& layers,
        const std::vector<float>& opacities
    ) {
        if (layers.empty()) return nullptr;
        
        auto result = std::make_unique<VideoFrame>();
        result->width = width_;
        result->height = height_;
        result->data.resize(width_ * height_ * 4, 0);
        
        // Simple alpha blending (CPU-based for now)
        for (size_t i = 0; i < layers.size(); i++) {
            const auto* layer = layers[i];
            float opacity = opacities[i];
            
            for (int y = 0; y < height_ && y < layer->height; y++) {
                for (int x = 0; x < width_ && x < layer->width; x++) {
                    int dst_idx = (y * width_ + x) * 4;
                    int src_idx = (y * layer->width + x) * 4;
                    
                    // Get source pixel
                    uint8_t sr = layer->data[src_idx + 0];
                    uint8_t sg = layer->data[src_idx + 1];
                    uint8_t sb = layer->data[src_idx + 2];
                    uint8_t sa = layer->data[src_idx + 3];
                    
                    // Apply layer opacity
                    float alpha = (sa / 255.0f) * opacity;
                    
                    // Get destination pixel
                    uint8_t dr = result->data[dst_idx + 0];
                    uint8_t dg = result->data[dst_idx + 1];
                    uint8_t db = result->data[dst_idx + 2];
                    uint8_t da = result->data[dst_idx + 3];
                    
                    // Alpha blending
                    float dst_alpha = da / 255.0f;
                    float out_alpha = alpha + dst_alpha * (1.0f - alpha);
                    
                    if (out_alpha > 0) {
                        result->data[dst_idx + 0] = static_cast<uint8_t>(
                            (sr * alpha + dr * dst_alpha * (1.0f - alpha)) / out_alpha
                        );
                        result->data[dst_idx + 1] = static_cast<uint8_t>(
                            (sg * alpha + dg * dst_alpha * (1.0f - alpha)) / out_alpha
                        );
                        result->data[dst_idx + 2] = static_cast<uint8_t>(
                            (sb * alpha + db * dst_alpha * (1.0f - alpha)) / out_alpha
                        );
                        result->data[dst_idx + 3] = static_cast<uint8_t>(out_alpha * 255);
                    }
                }
            }
        }
        
        return result;
    }
    
    void set_transform(int layer_idx, float scale_x, float scale_y,
                      float rotation, float pos_x, float pos_y) {
        // Store transform for GPU shader
        // For now, this is a placeholder
        (void)layer_idx;
        (void)scale_x;
        (void)scale_y;
        (void)rotation;
        (void)pos_x;
        (void)pos_y;
    }

private:
    int width_;
    int height_;
    bool initialized_;
    GLuint texture_id_ = 0;
};

// ============================================================================
// PUBLIC API
// ============================================================================

Compositor::Compositor(int width, int height)
    : impl_(std::make_unique<Impl>(width, height)) {}

Compositor::~Compositor() = default;

bool Compositor::initialize() {
    return impl_->initialize();
}

std::unique_ptr<VideoFrame> Compositor::composite(
    const std::vector<VideoFrame*>& layers,
    const std::vector<float>& opacities
) {
    return impl_->composite(layers, opacities);
}

void Compositor::set_transform(int layer_idx, float scale_x, float scale_y,
                              float rotation, float pos_x, float pos_y) {
    impl_->set_transform(layer_idx, scale_x, scale_y, rotation, pos_x, pos_y);
}

} // namespace revo

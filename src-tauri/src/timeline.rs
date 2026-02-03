use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VideoInfo {
    pub width: u32,
    pub height: u32,
    pub framerate: f64,
    pub duration: f64,
    pub codec_name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Clip {
    pub id: u32,
    pub video_path: String,
    pub track_id: u32,
    pub start_time: f64,
    pub duration: f64,
    pub source_start: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Effect {
    pub effect_type: String,
    pub params: HashMap<String, f64>,
}

#[derive(Debug, Default)]
pub struct TimelineState {
    pub clips: Vec<Clip>,
    pub current_time: f64,
    pub playing: bool,
    pub zoom_level: f64,
    pub next_clip_id: u32,
}

impl TimelineState {
    pub fn new() -> Self {
        Self {
            clips: Vec::new(),
            current_time: 0.0,
            playing: false,
            zoom_level: 1.0,
            next_clip_id: 1,
        }
    }
    
    pub fn add_clip(&mut self, clip: Clip) {
        self.clips.push(clip);
    }
    
    pub fn remove_clip(&mut self, clip_id: u32) {
        self.clips.retain(|c| c.id != clip_id);
    }
    
    pub fn get_duration(&self) -> f64 {
        self.clips
            .iter()
            .map(|c| c.start_time + c.duration)
            .max_by(|a, b| a.partial_cmp(b).unwrap())
            .unwrap_or(0.0)
    }
    
    pub fn seek(&mut self, time: f64) {
        self.current_time = time.max(0.0);
    }
    
    pub fn toggle_playback(&mut self) -> bool {
        self.playing = !self.playing;
        self.playing
    }
}

pub type SharedTimeline = Arc<Mutex<TimelineState>>;

pub fn create_timeline() -> SharedTimeline {
    Arc::new(Mutex::new(TimelineState::new()))
}

use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use anyhow::Result;

use crate::timeline::{Clip, TimelineState};

#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectData {
    pub name: String,
    pub width: u32,
    pub height: u32,
    pub framerate: u32,
    pub clips: Vec<Clip>,
}

impl ProjectData {
    pub fn new(name: String, width: u32, height: u32, framerate: u32) -> Self {
        Self {
            name,
            width,
            height,
            framerate,
            clips: Vec::new(),
        }
    }
    
    pub fn save(&self, path: &PathBuf) -> Result<()> {
        let json = serde_json::to_string_pretty(self)?;
        std::fs::write(path, json)?;
        Ok(())
    }
    
    pub fn load(path: &PathBuf) -> Result<Self> {
        let json = std::fs::read_to_string(path)?;
        let project: ProjectData = serde_json::from_str(&json)?;
        Ok(project)
    }
    
    pub fn from_timeline(timeline: &TimelineState, name: String) -> Self {
        Self {
            name,
            width: 1920,
            height: 1080,
            framerate: 30,
            clips: timeline.clips.clone(),
        }
    }
    
    pub fn apply_to_timeline(&self, timeline: &mut TimelineState) {
        timeline.clips = self.clips.clone();
    }
}

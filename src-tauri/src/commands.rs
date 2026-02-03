use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use tauri::State;

use crate::timeline::*;
use crate::project::*;

// Global timeline state
pub struct AppState {
    pub timeline: SharedTimeline,
    pub project_path: Arc<Mutex<Option<PathBuf>>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            timeline: create_timeline(),
            project_path: Arc::new(Mutex::new(None)),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImportVideoResult {
    pub success: bool,
    pub video_info: Option<VideoInfo>,
    pub error: Option<String>,
}

#[tauri::command]
pub fn import_video(path: String) -> ImportVideoResult {
    // In a real implementation, this would use the C++ decoder
    // For now, return mock data
    ImportVideoResult {
        success: true,
        video_info: Some(VideoInfo {
            width: 1920,
            height: 1080,
            framerate: 30.0,
            duration: 10.0,
            codec_name: "h264".to_string(),
        }),
        error: None,
    }
}

#[tauri::command]
pub fn add_clip_to_timeline(
    clip: Clip,
    state: State<'_, Arc<Mutex<AppState>>>
) -> Result<(), String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;
    let mut timeline = app_state.timeline.lock().map_err(|e| e.to_string())?;
    timeline.add_clip(clip);
    Ok(())
}

#[tauri::command]
pub fn remove_clip(
    clip_id: u32,
    state: State<'_, Arc<Mutex<AppState>>>
) -> Result<(), String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;
    let mut timeline = app_state.timeline.lock().map_err(|e| e.to_string())?;
    timeline.remove_clip(clip_id);
    Ok(())
}

#[tauri::command]
pub fn seek_timeline(
    time: f64,
    state: State<'_, Arc<Mutex<AppState>>>
) -> Result<(), String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;
    let mut timeline = app_state.timeline.lock().map_err(|e| e.to_string())?;
    timeline.seek(time);
    Ok(())
}

#[tauri::command]
pub fn toggle_playback(
    state: State<'_, Arc<Mutex<AppState>>>
) -> Result<bool, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;
    let mut timeline = app_state.timeline.lock().map_err(|e| e.to_string())?;
    Ok(timeline.toggle_playback())
}

#[tauri::command]
pub fn apply_effect(
    clip_id: u32,
    effect: Effect,
    state: State<'_, Arc<Mutex<AppState>>>
) -> Result<(), String> {
    // In real implementation, this would apply effect via C++ pipeline
    let _ = clip_id;
    let _ = effect;
    let _ = state;
    Ok(())
}

#[tauri::command]
pub fn save_project(
    path: String,
    state: State<'_, Arc<Mutex<AppState>>>
) -> Result<(), String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;
    let timeline = app_state.timeline.lock().map_err(|e| e.to_string())?;
    
    let project = ProjectData::from_timeline(&timeline, "Untitled".to_string());
    let path_buf = PathBuf::from(path.clone());
    project.save(&path_buf).map_err(|e| e.to_string())?;
    
    *app_state.project_path.lock().unwrap() = Some(path_buf);
    Ok(())
}

#[tauri::command]
pub fn load_project(
    path: String,
    state: State<'_, Arc<Mutex<AppState>>>
) -> Result<(), String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;
    let path_buf = PathBuf::from(path.clone());
    
    let project = ProjectData::load(&path_buf).map_err(|e| e.to_string())?;
    
    let mut timeline = app_state.timeline.lock().map_err(|e| e.to_string())?;
    project.apply_to_timeline(&mut timeline);
    
    *app_state.project_path.lock().unwrap() = Some(path_buf);
    Ok(())
}

#[tauri::command]
pub fn export_video(
    output_path: String,
    format: String,
    codec: String,
    state: State<'_, Arc<Mutex<AppState>>>
) -> Result<String, String> {
    // In real implementation, this would use the C++ encoder
    let _ = output_path;
    let _ = format;
    let _ = codec;
    let _ = state;
    Ok("export_job_123".to_string())
}

#[tauri::command]
pub fn get_timeline_duration(
    state: State<'_, Arc<Mutex<AppState>>>
) -> Result<f64, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;
    let timeline = app_state.timeline.lock().map_err(|e| e.to_string())?;
    Ok(timeline.get_duration())
}

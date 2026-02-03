// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod timeline;
mod project;

use std::sync::{Arc, Mutex};
use commands::*;

fn main() {
    // Initialize application state
    let app_state = Arc::new(Mutex::new(commands::AppState::new()));
    
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            import_video,
            add_clip_to_timeline,
            remove_clip,
            seek_timeline,
            toggle_playback,
            apply_effect,
            save_project,
            load_project,
            export_video,
            get_timeline_duration
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

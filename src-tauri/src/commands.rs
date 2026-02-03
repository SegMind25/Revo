use tauri::api::dialog::FileDialogBuilder;
use std::path::PathBuf;

#[tauri::command]
pub async fn open_video_file() -> Result<Option<String>, String> {
    let (tx, rx) = std::sync::mpsc::channel();
    
    FileDialogBuilder::new()
        .add_filter("Video Files", &["mp4", "avi", "mov", "mkv", "webm"])
        .add_filter("All Files", &["*"])
        .pick_file(move |file_path| {
            let _ = tx.send(file_path);
        });
    
    match rx.recv() {
        Ok(Some(path)) => Ok(Some(path.to_string_lossy().to_string())),
        Ok(None) => Ok(None),
        Err(_) => Err("Failed to receive file path".to_string()),
    }
}

#[tauri::command]
pub async fn save_video_file(default_name: String) -> Result<Option<String>, String> {
    let (tx, rx) = std::sync::mpsc::channel();
    
    FileDialogBuilder::new()
        .add_filter("MP4 Video", &["mp4"])
        .add_filter("WebM Video", &["webm"])
        .set_file_name(&default_name)
        .save_file(move |file_path| {
            let _ = tx.send(file_path);
        });
    
    match rx.recv() {
        Ok(Some(path)) => Ok(Some(path.to_string_lossy().to_string())),
        Ok(None) => Ok(None),
        Err(_) => Err("Failed to receive file path".to_string()),
    }
}

#[derive(serde::Serialize)]
pub struct FileMetadata {
    pub name: String,
    pub size: u64,
    pub path: String,
}

#[tauri::command]
pub async fn get_file_metadata(file_path: String) -> Result<FileMetadata, String> {
    let path = PathBuf::from(&file_path);
    
    let metadata = std::fs::metadata(&path)
        .map_err(|e| format!("Failed to read file metadata: {}", e))?;
    
    let file_name = path
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("unknown")
        .to_string();
    
    Ok(FileMetadata {
        name: file_name,
        size: metadata.len(),
        path: file_path,
    })
}

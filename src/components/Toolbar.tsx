import type { FC } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { useVideoStore } from '../store/videoStore';
import { loadVideoFile, getVideoDuration, generateLayerId } from '../utils/videoUtils';
import { VideoLayerData, TextLayerData } from '../types';

export const Toolbar: FC = () => {
    const { addLayer, setDuration, playing, setPlaying } = useVideoStore();

    const handleImportVideo = async () => {
        try {
            const filePath = await invoke<string | null>('open_video_file');

            if (!filePath) return;

            // Load video file
            const response = await fetch(`file://${filePath}`);
            const blob = await response.blob();
            const file = new File([blob], filePath.split('/').pop() || 'video.mp4');

            const videoElement = await loadVideoFile(file);
            const duration = getVideoDuration(videoElement);

            const layer: VideoLayerData = {
                id: generateLayerId(),
                type: 'video',
                name: file.name,
                startTime: 0,
                duration,
                zIndex: 0,
                visible: true,
                locked: false,
                filePath,
                videoElement,
            };

            addLayer(layer);
            setDuration(duration);
        } catch (error) {
            console.error('Failed to import video:', error);
            alert('Failed to import video. Please try again.');
        }
    };

    const handleAddText = () => {
        const textLayer: TextLayerData = {
            id: generateLayerId(),
            type: 'text',
            name: 'Text Layer',
            startTime: 0,
            duration: 5,
            zIndex: 1,
            visible: true,
            locked: false,
            content: 'Double click to edit',
            fontSize: 48,
            fontFamily: 'Arial',
            color: '#ffffff',
            x: 100,
            y: 100,
        };

        addLayer(textLayer);
    };

    const handlePlayPause = () => {
        setPlaying(!playing);
    };

    return (
        <div className="toolbar">
            <div className="toolbar-section">
                <button className="toolbar-btn primary" onClick={handleImportVideo}>
                    <span className="btn-icon">📁</span>
                    Import Video
                </button>

                <button className="toolbar-btn" onClick={handleAddText}>
                    <span className="btn-icon">📝</span>
                    Add Text
                </button>
            </div>

            <div className="toolbar-section playback">
                <button className="toolbar-btn icon-btn" onClick={handlePlayPause}>
                    <span className="btn-icon">{playing ? '⏸️' : '▶️'}</span>
                </button>
            </div>

            <div className="toolbar-section">
                <button className="toolbar-btn success">
                    <span className="btn-icon">💾</span>
                    Export Video
                </button>
            </div>
        </div>
    );
};

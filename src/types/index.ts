// Video layer types
export interface VideoLayer {
    id: string;
    type: 'video' | 'text' | 'image';
    name: string;
    startTime: number;
    duration: number;
    zIndex: number;
    visible: boolean;
    locked: boolean;
}

export interface VideoLayerData extends VideoLayer {
    type: 'video';
    filePath: string;
    videoElement?: HTMLVideoElement;
}

export interface TextLayerData extends VideoLayer {
    type: 'text';
    content: string;
    fontSize: number;
    fontFamily: string;
    color: string;
    x: number;
    y: number;
}

export interface ImageLayerData extends VideoLayer {
    type: 'image';
    filePath: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

export type AnyLayer = VideoLayerData | TextLayerData | ImageLayerData;

// Project state
export interface ProjectState {
    layers: AnyLayer[];
    currentTime: number;
    duration: number;
    playing: boolean;
    zoom: number;
    selectedLayerId: string | null;
}

// Export configuration
export interface ExportConfig {
    format: 'mp4' | 'webm';
    quality: 'low' | 'medium' | 'high';
    resolution: '720p' | '1080p' | '4k';
    fps: 24 | 30 | 60;
}

export interface ExportProgress {
    status: 'idle' | 'processing' | 'complete' | 'error';
    progress: number;
    message: string;
}

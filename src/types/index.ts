export interface VideoInfo {
    width: number;
    height: number;
    framerate: number;
    duration: number;
    codec_name: string;
}

export interface Clip {
    id: number;
    video_path: string;
    track_id: number;
    start_time: number;
    duration: number;
    source_start: number;
}

export interface Effect {
    effect_type: string;
    params: Record<string, number>;
}

export interface ExportSettings {
    output_path: string;
    format: string;
    codec: string;
    width: number;
    height: number;
    bitrate: number;
    framerate: number;
}

export interface TimelineState {
    clips: Clip[];
    currentTime: number;
    playing: boolean;
    zoomLevel: number;
    duration: number;
}

export interface EditorStore extends TimelineState {
    // Actions
    setCurrentTime: (time: number) => void;
    togglePlayback: () => void;
    setZoomLevel: (level: number) => void;
    addClip: (clip: Clip) => void;
    removeClip: (clipId: number) => void;
    updateDuration: () => void;
}

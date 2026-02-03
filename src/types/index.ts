import { fabric } from 'fabric';

export type ClipType = 'video' | 'audio' | 'text' | 'image' | 'shape';

export interface TimelineClip {
    id: string;
    type: ClipType;
    trackId: string;
    startTime: number; // milliseconds
    duration: number; // milliseconds
    offset: number; // milliseconds from start of source
    trimStart: number; // milliseconds
    trimEnd: number; // milliseconds
    source?: string; // file path or data URL
    name: string;
    color?: string;
}

export interface TimelineTrack {
    id: string;
    type: ClipType;
    name: string;
    clips: TimelineClip[];
    muted: boolean;
    locked: boolean;
    visible: boolean;
    height: number;
}

export interface CanvasObject {
    id: string;
    fabricObject: fabric.Object;
    clipId: string;
    type: 'text' | 'image' | 'shape' | 'video';
}

export interface ProjectSettings {
    width: number;
    height: number;
    fps: number;
    duration: number; // milliseconds
    backgroundColor: string;
}

export interface ExportSettings {
    format: 'mp4' | 'webm';
    quality: 'low' | 'medium' | 'high';
    fps: number;
}

export interface PlaybackState {
    isPlaying: boolean;
    currentTime: number; // milliseconds
    playbackSpeed: number;
}

export interface EditorTool {
    id: string;
    name: string;
    icon: string;
    cursor?: string;
}

export interface VideoFile {
    file: File;
    url: string;
    duration: number;
    width: number;
    height: number;
    thumbnail?: string;
}

export interface AudioFile {
    file: File;
    url: string;
    duration: number;
    waveform?: number[];
}

export interface TextStyle {
    fontFamily: string;
    fontSize: number;
    fontWeight: string | number;
    color: string;
    strokeColor?: string;
    strokeWidth?: number;
    textAlign: 'left' | 'center' | 'right';
    backgroundColor?: string;
}

export interface Transform {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
    opacity: number;
}

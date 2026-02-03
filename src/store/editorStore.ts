import { create } from 'zustand';
import { ProjectSettings, PlaybackState, EditorTool } from '@/types';

interface EditorState {
    // Project settings
    project: ProjectSettings;
    setProject: (project: Partial<ProjectSettings>) => void;

    // Playback
    playback: PlaybackState;
    setPlayback: (playback: Partial<PlaybackState>) => void;
    play: () => void;
    pause: () => void;
    seek: (time: number) => void;

    // Tools
    activeTool: EditorTool | null;
    setActiveTool: (tool: EditorTool | null) => void;

    // UI State
    zoom: number;
    setZoom: (zoom: number) => void;
    timelineZoom: number;
    setTimelineZoom: (zoom: number) => void;

    // Export
    isExporting: boolean;
    exportProgress: number;
    setExporting: (isExporting: boolean, progress?: number) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
    // Initial project settings
    project: {
        width: 1920,
        height: 1080,
        fps: 30,
        duration: 60000, // 60 seconds
        backgroundColor: '#000000',
    },
    setProject: (project) =>
        set((state) => ({ project: { ...state.project, ...project } })),

    // Initial playback state
    playback: {
        isPlaying: false,
        currentTime: 0,
        playbackSpeed: 1,
    },
    setPlayback: (playback) =>
        set((state) => ({ playback: { ...state.playback, ...playback } })),
    play: () =>
        set((state) => ({
            playback: { ...state.playback, isPlaying: true },
        })),
    pause: () =>
        set((state) => ({
            playback: { ...state.playback, isPlaying: false },
        })),
    seek: (time) =>
        set((state) => ({
            playback: { ...state.playback, currentTime: time },
        })),

    // Tools
    activeTool: null,
    setActiveTool: (tool) => set({ activeTool: tool }),

    // UI State
    zoom: 1,
    setZoom: (zoom) => set({ zoom }),
    timelineZoom: 10, // pixels per second
    setTimelineZoom: (timelineZoom) => set({ timelineZoom }),

    // Export
    isExporting: false,
    exportProgress: 0,
    setExporting: (isExporting, progress = 0) =>
        set({ isExporting, exportProgress: progress }),
}));

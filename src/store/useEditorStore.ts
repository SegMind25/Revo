import { create } from 'zustand';
import type { EditorStore, Clip } from '@/types';

export const useEditorStore = create<EditorStore>((set, get) => ({
    // Initial state
    clips: [],
    currentTime: 0,
    playing: false,
    zoomLevel: 1.0,
    duration: 0,

    // Actions
    setCurrentTime: (time: number) => {
        set({ currentTime: Math.max(0, time) });
    },

    togglePlayback: () => {
        set((state) => ({ playing: !state.playing }));
    },

    setZoomLevel: (level: number) => {
        set({ zoomLevel: Math.max(0.1, Math.min(10, level)) });
    },

    addClip: (clip: Clip) => {
        set((state) => ({
            clips: [...state.clips, clip],
        }));
        get().updateDuration();
    },

    removeClip: (clipId: number) => {
        set((state) => ({
            clips: state.clips.filter((c) => c.id !== clipId),
        }));
        get().updateDuration();
    },

    updateDuration: () => {
        const clips = get().clips;
        const maxEnd = clips.reduce(
            (max, clip) => Math.max(max, clip.start_time + clip.duration),
            0
        );
        set({ duration: maxEnd });
    },
}));

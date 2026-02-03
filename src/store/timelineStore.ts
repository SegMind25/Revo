import { create } from 'zustand';
import { TimelineTrack, TimelineClip } from '@/types';

interface TimelineState {
    tracks: TimelineTrack[];
    selectedClipIds: string[];

    // Track operations
    addTrack: (track: TimelineTrack) => void;
    removeTrack: (trackId: string) => void;
    updateTrack: (trackId: string, updates: Partial<TimelineTrack>) => void;

    // Clip operations
    addClip: (clip: TimelineClip) => void;
    removeClip: (clipId: string) => void;
    updateClip: (clipId: string, updates: Partial<TimelineClip>) => void;
    moveClip: (clipId: string, trackId: string, startTime: number) => void;

    // Selection
    selectClip: (clipId: string, multi?: boolean) => void;
    clearSelection: () => void;

    // Utilities
    getClipById: (clipId: string) => TimelineClip | undefined;
    getTrackById: (trackId: string) => TimelineTrack | undefined;
    getTotalDuration: () => number;
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
    tracks: [
        {
            id: 'video-1',
            type: 'video',
            name: 'Video Track 1',
            clips: [],
            muted: false,
            locked: false,
            visible: true,
            height: 80,
        },
        {
            id: 'audio-1',
            type: 'audio',
            name: 'Audio Track 1',
            clips: [],
            muted: false,
            locked: false,
            visible: true,
            height: 60,
        },
        {
            id: 'text-1',
            type: 'text',
            name: 'Text Track 1',
            clips: [],
            muted: false,
            locked: false,
            visible: true,
            height: 60,
        },
    ],
    selectedClipIds: [],

    addTrack: (track) =>
        set((state) => ({ tracks: [...state.tracks, track] })),

    removeTrack: (trackId) =>
        set((state) => ({
            tracks: state.tracks.filter((t) => t.id !== trackId),
        })),

    updateTrack: (trackId, updates) =>
        set((state) => ({
            tracks: state.tracks.map((t) =>
                t.id === trackId ? { ...t, ...updates } : t
            ),
        })),

    addClip: (clip) =>
        set((state) => ({
            tracks: state.tracks.map((track) =>
                track.id === clip.trackId
                    ? { ...track, clips: [...track.clips, clip] }
                    : track
            ),
        })),

    removeClip: (clipId) =>
        set((state) => ({
            tracks: state.tracks.map((track) => ({
                ...track,
                clips: track.clips.filter((c) => c.id !== clipId),
            })),
            selectedClipIds: state.selectedClipIds.filter((id) => id !== clipId),
        })),

    updateClip: (clipId, updates) =>
        set((state) => ({
            tracks: state.tracks.map((track) => ({
                ...track,
                clips: track.clips.map((clip) =>
                    clip.id === clipId ? { ...clip, ...updates } : clip
                ),
            })),
        })),

    moveClip: (clipId, trackId, startTime) =>
        set((state) => {
            const clip = get().getClipById(clipId);
            if (!clip) return state;

            return {
                tracks: state.tracks.map((track) => {
                    // Remove from old track
                    const clipsWithoutMoved = track.clips.filter((c) => c.id !== clipId);

                    // Add to new track if this is the target
                    if (track.id === trackId) {
                        return {
                            ...track,
                            clips: [...clipsWithoutMoved, { ...clip, trackId, startTime }],
                        };
                    }

                    return { ...track, clips: clipsWithoutMoved };
                }),
            };
        }),

    selectClip: (clipId, multi = false) =>
        set((state) => ({
            selectedClipIds: multi
                ? [...state.selectedClipIds, clipId]
                : [clipId],
        })),

    clearSelection: () => set({ selectedClipIds: [] }),

    getClipById: (clipId) => {
        const state = get();
        for (const track of state.tracks) {
            const clip = track.clips.find((c) => c.id === clipId);
            if (clip) return clip;
        }
        return undefined;
    },

    getTrackById: (trackId) => {
        const state = get();
        return state.tracks.find((t) => t.id === trackId);
    },

    getTotalDuration: () => {
        const state = get();
        let maxDuration = 0;

        state.tracks.forEach((track) => {
            track.clips.forEach((clip) => {
                const clipEnd = clip.startTime + clip.duration - clip.trimStart - clip.trimEnd;
                if (clipEnd > maxDuration) {
                    maxDuration = clipEnd;
                }
            });
        });

        return maxDuration;
    },
}));

import { create } from 'zustand';
import { AnyLayer, ProjectState, ExportConfig, ExportProgress } from '../types';

interface VideoStore extends ProjectState {
    // Layer management
    addLayer: (layer: AnyLayer) => void;
    removeLayer: (layerId: string) => void;
    updateLayer: (layerId: string, updates: Partial<AnyLayer>) => void;
    reorderLayers: (layerIds: string[]) => void;
    selectLayer: (layerId: string | null) => void;

    // Playback controls
    setCurrentTime: (time: number) => void;
    setPlaying: (playing: boolean) => void;
    setDuration: (duration: number) => void;
    setZoom: (zoom: number) => void;

    // Export
    exportConfig: ExportConfig;
    exportProgress: ExportProgress;
    setExportConfig: (config: Partial<ExportConfig>) => void;
    setExportProgress: (progress: Partial<ExportProgress>) => void;

    // Project management
    resetProject: () => void;
}

const initialState: ProjectState = {
    layers: [],
    currentTime: 0,
    duration: 0,
    playing: false,
    zoom: 1,
    selectedLayerId: null,
};

const initialExportConfig: ExportConfig = {
    format: 'mp4',
    quality: 'high',
    resolution: '1080p',
    fps: 30,
};

const initialExportProgress: ExportProgress = {
    status: 'idle',
    progress: 0,
    message: '',
};

export const useVideoStore = create<VideoStore>((set) => ({
    ...initialState,
    exportConfig: initialExportConfig,
    exportProgress: initialExportProgress,

    addLayer: (layer) =>
        set((state) => ({
            layers: [...state.layers, layer],
            duration: Math.max(state.duration, layer.startTime + layer.duration),
        })),

    removeLayer: (layerId) =>
        set((state) => ({
            layers: state.layers.filter((l) => l.id !== layerId),
            selectedLayerId: state.selectedLayerId === layerId ? null : state.selectedLayerId,
        })),

    updateLayer: (layerId, updates) =>
        set((state) => ({
            layers: state.layers.map((l) =>
                l.id === layerId ? ({ ...l, ...updates } as AnyLayer) : l
            ),
        })),

    reorderLayers: (layerIds) =>
        set((state) => ({
            layers: layerIds
                .map((id) => state.layers.find((l) => l.id === id))
                .filter((l): l is AnyLayer => l !== undefined)
                .map((l, index) => ({ ...l, zIndex: index })) as AnyLayer[],
        })),

    selectLayer: (layerId) => set({ selectedLayerId: layerId }),

    setCurrentTime: (time) => set({ currentTime: time }),

    setPlaying: (playing) => set({ playing }),

    setDuration: (duration) => set({ duration }),

    setZoom: (zoom) => set({ zoom }),

    setExportConfig: (config) =>
        set((state) => ({
            exportConfig: { ...state.exportConfig, ...config },
        })),

    setExportProgress: (progress) =>
        set((state) => ({
            exportProgress: { ...state.exportProgress, ...progress },
        })),

    resetProject: () =>
        set({
            ...initialState,
            exportConfig: initialExportConfig,
            exportProgress: initialExportProgress,
        }),
}));

import { create } from 'zustand';
import { fabric } from 'fabric';
import { CanvasObject } from '@/types';

interface CanvasState {
    canvas: fabric.Canvas | null;
    objects: CanvasObject[];
    selectedObjectIds: string[];

    // Canvas operations
    setCanvas: (canvas: fabric.Canvas | null) => void;

    // Object operations
    addObject: (obj: CanvasObject) => void;
    removeObject: (id: string) => void;
    updateObject: (id: string, updates: Partial<CanvasObject>) => void;

    // Selection
    selectObject: (id: string, multi?: boolean) => void;
    clearSelection: () => void;

    // Utilities
    getObjectById: (id: string) => CanvasObject | undefined;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
    canvas: null,
    objects: [],
    selectedObjectIds: [],

    setCanvas: (canvas) => set({ canvas }),

    addObject: (obj) =>
        set((state) => ({ objects: [...state.objects, obj] })),

    removeObject: (id) =>
        set((state) => ({
            objects: state.objects.filter((o) => o.id !== id),
            selectedObjectIds: state.selectedObjectIds.filter((oid) => oid !== id),
        })),

    updateObject: (id, updates) =>
        set((state) => ({
            objects: state.objects.map((obj) =>
                obj.id === id ? { ...obj, ...updates } : obj
            ),
        })),

    selectObject: (id, multi = false) =>
        set((state) => ({
            selectedObjectIds: multi
                ? [...state.selectedObjectIds, id]
                : [id],
        })),

    clearSelection: () => set({ selectedObjectIds: [] }),

    getObjectById: (id) => {
        const state = get();
        return state.objects.find((o) => o.id === id);
    },
}));

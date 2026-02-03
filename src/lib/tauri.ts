import { invoke } from '@tauri-apps/api/core';
import type { VideoInfo, Clip, Effect, ExportSettings } from '@/types';

// Tauri command wrappers

export async function importVideo(path: string): Promise<{ success: boolean; video_info?: VideoInfo; error?: string }> {
    return await invoke('import_video', { path });
}

export async function addClipToTimeline(clip: Clip): Promise<void> {
    await invoke('add_clip_to_timeline', { clip });
}

export async function removeClipFromTimeline(clipId: number): Promise<void> {
    await invoke('remove_clip', { clipId });
}

export async function seekTimeline(time: number): Promise<void> {
    await invoke('seek_timeline', { time });
}

export async function togglePlayback(): Promise<boolean> {
    return await invoke('toggle_playback');
}

export async function applyEffect(clipId: number, effect: Effect): Promise<void> {
    await invoke('apply_effect', { clipId, effect });
}

export async function saveProject(path: string): Promise<void> {
    await invoke('save_project', { path });
}

export async function loadProject(path: string): Promise<void> {
    await invoke('load_project', { path });
}

export async function exportVideo(
    outputPath: string,
    format: string,
    codec: string
): Promise<string> {
    return await invoke('export_video', { outputPath, format, codec });
}

export async function getTimelineDuration(): Promise<number> {
    return await invoke('get_timeline_duration');
}

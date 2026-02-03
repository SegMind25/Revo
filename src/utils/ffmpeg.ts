import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;
let isLoaded = false;

export async function loadFFmpeg(onProgress?: (progress: number) => void): Promise<FFmpeg> {
    if (ffmpeg && isLoaded) {
        return ffmpeg;
    }

    ffmpeg = new FFmpeg();

    ffmpeg.on('log', ({ message }) => {
        console.log('[FFmpeg]', message);
    });

    ffmpeg.on('progress', ({ progress }) => {
        if (onProgress) {
            onProgress(Math.round(progress * 100));
        }
    });

    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';

    await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    isLoaded = true;
    return ffmpeg;
}

export async function exportVideo(
    videoBlob: Blob,
    format: 'mp4' | 'webm',
    quality: 'low' | 'medium' | 'high',
    onProgress?: (progress: number) => void
): Promise<Blob> {
    const ffmpegInstance = await loadFFmpeg(onProgress);

    // Write input file
    await ffmpegInstance.writeFile('input.mp4', await fetchFile(videoBlob));

    // Configure quality settings
    const qualityMap = {
        low: { crf: '28', preset: 'fast' },
        medium: { crf: '23', preset: 'medium' },
        high: { crf: '18', preset: 'slow' },
    };

    const { crf, preset } = qualityMap[quality];

    // Build FFmpeg command based on format
    const outputFile = `output.${format}`;
    const args = format === 'mp4'
        ? ['-i', 'input.mp4', '-c:v', 'libx264', '-crf', crf, '-preset', preset, '-c:a', 'aac', '-b:a', '128k', outputFile]
        : ['-i', 'input.mp4', '-c:v', 'libvpx-vp9', '-crf', crf, '-b:v', '0', '-c:a', 'libopus', outputFile];

    // Execute FFmpeg
    await ffmpegInstance.exec(args);

    // Read output file
    const data = await ffmpegInstance.readFile(outputFile);

    // Clean up
    await ffmpegInstance.deleteFile('input.mp4');
    await ffmpegInstance.deleteFile(outputFile);

    // Convert to Blob
    const mimeType = format === 'mp4' ? 'video/mp4' : 'video/webm';
    return new Blob([data.buffer], { type: mimeType });
}

export async function extractFrame(
    videoFile: File,
    timeInSeconds: number
): Promise<string> {
    const ffmpegInstance = await loadFFmpeg();

    // Write input file
    await ffmpegInstance.writeFile('input.mp4', await fetchFile(videoFile));

    // Extract frame at specific time
    await ffmpegInstance.exec([
        '-i', 'input.mp4',
        '-ss', timeInSeconds.toString(),
        '-vframes', '1',
        '-f', 'image2',
        'frame.jpg'
    ]);

    // Read output frame
    const data = await ffmpegInstance.readFile('frame.jpg');

    // Clean up
    await ffmpegInstance.deleteFile('input.mp4');
    await ffmpegInstance.deleteFile('frame.jpg');

    // Convert to data URL
    const blob = new Blob([data.buffer], { type: 'image/jpeg' });
    return URL.createObjectURL(blob);
}

export function getFFmpegInstance(): FFmpeg | null {
    return ffmpeg;
}

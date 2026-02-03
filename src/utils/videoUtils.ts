export async function loadVideoFile(file: File): Promise<HTMLVideoElement> {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const url = URL.createObjectURL(file);

        video.src = url;
        video.preload = 'metadata';

        video.onloadedmetadata = () => {
            resolve(video);
        };

        video.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load video file'));
        };
    });
}

export function getVideoDuration(video: HTMLVideoElement): number {
    return video.duration;
}

export async function captureVideoFrame(
    video: HTMLVideoElement,
    timeInSeconds: number
): Promise<string> {
    return new Promise((resolve, reject) => {
        video.currentTime = timeInSeconds;

        video.onseeked = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }

                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                resolve(dataUrl);
            } catch (error) {
                reject(error);
            }
        };

        video.onerror = () => {
            reject(new Error('Failed to seek video'));
        };
    });
}

export async function generateThumbnail(
    video: HTMLVideoElement,
    width: number = 120,
    height: number = 68
): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Failed to get canvas context');
    }

    // Capture frame at 10% of video duration
    const captureTime = video.duration * 0.1;
    video.currentTime = captureTime;

    await new Promise<void>((resolve) => {
        video.onseeked = () => resolve();
    });

    ctx.drawImage(video, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', 0.7);
}

export function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function parseTime(timeString: string): number {
    const parts = timeString.split(':').map(Number);

    if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }

    return 0;
}

export function generateLayerId(): string {
    return `layer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

import React, { useRef, useEffect, useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

export function Preview() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { playing, currentTime, togglePlayback } = useEditorStore();
    const [zoomLevel, setZoomLevel] = useState(100);

    useEffect(() => {
        // Render current frame to canvas
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas with black background
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Display time code
        ctx.fillStyle = '#fff';
        ctx.font = '24px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(
            formatTime(currentTime),
            canvas.width / 2,
            canvas.height / 2
        );
    }, [currentTime]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const frames = Math.floor((seconds % 1) * 30);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
    };

    return (
        <div className="preview-container flex flex-col" style={{ flex: 1, background: 'var(--color-bg-secondary)' }}>
            {/* Preview Header */}
            <div className="preview-header flex items-center justify-between p-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                    Preview
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={zoomLevel}
                        onChange={(e) => setZoomLevel(Number(e.target.value))}
                        style={{ fontSize: '0.75rem', padding: 'var(--space-1) var(--space-2)' }}
                    >
                        <option value={25}>25%</option>
                        <option value={50}>50%</option>
                        <option value={100}>100%</option>
                        <option value={200}>200%</option>
                    </select>
                </div>
            </div>

            {/* Canvas */}
            <div className="preview-canvas flex items-center justify-center" style={{ flex: 1, padding: 'var(--space-4)' }}>
                <canvas
                    ref={canvasRef}
                    width={1920}
                    height={1080}
                    style={{
                        width: `${zoomLevel}%`,
                        height: 'auto',
                        maxWidth: '100%',
                        maxHeight: '100%',
                        background: '#000',
                        borderRadius: 'var(--radius-md)',
                    }}
                />
            </div>

            {/* Playback Controls */}
            <div className="playback-controls flex items-center justify-center gap-2 p-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                <button className="btn btn-icon btn-ghost" title="Previous Frame">
                    <SkipBack size={18} />
                </button>
                <button
                    className="btn btn-icon btn-primary"
                    onClick={togglePlayback}
                    title={playing ? 'Pause' : 'Play'}
                >
                    {playing ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button className="btn btn-icon btn-ghost" title="Next Frame">
                    <SkipForward size={18} />
                </button>
            </div>

            {/* Timecode Display */}
            <div className="timecode flex items-center justify-center" style={{ padding: 'var(--space-2)', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                {formatTime(currentTime)}
            </div>
        </div>
    );
}

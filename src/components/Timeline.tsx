import React, { useRef, useState, useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import type { Clip } from '@/types';

export function Timeline() {
    const timelineRef = useRef<HTMLDivElement>(null);
    const { clips, currentTime, setCurrentTime, zoomLevel, setZoomLevel, duration } = useEditorStore();
    const [isDragging, setIsDragging] = useState(false);

    // Constants
    const PIXELS_PER_SECOND = 100 * zoomLevel;
    const TRACK_HEIGHT = 60;
    const TRACKS_COUNT = 4;

    const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!timelineRef.current) return;

        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const time = x / PIXELS_PER_SECOND;
        setCurrentTime(time);
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            setZoomLevel(zoomLevel + delta);
        }
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const renderTimeMarkers = () => {
        const markers = [];
        const maxTime = Math.max(duration, 60); // At least 60 seconds
        const interval = zoomLevel > 2 ? 1 : zoomLevel > 1 ? 2 : 5; // Adaptive interval

        for (let i = 0; i <= maxTime; i += interval) {
            const x = i * PIXELS_PER_SECOND;
            markers.push(
                <div
                    key={i}
                    style={{
                        position: 'absolute',
                        left: x,
                        top: 0,
                        bottom: 0,
                        borderLeft: '1px solid var(--color-border)',
                        pointerEvents: 'none',
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            top: 4,
                            left: 4,
                            fontSize: '0.75rem',
                            color: 'var(--color-text-tertiary)',
                        }}
                    >
                        {formatTime(i)}
                    </div>
                </div>
            );
        }
        return markers;
    };

    const renderPlayhead = () => {
        const x = currentTime * PIXELS_PER_SECOND;

        return (
            <div
                style={{
                    position: 'absolute',
                    left: x,
                    top: 0,
                    bottom: 0,
                    width: 2,
                    background: 'var(--color-accent-primary)',
                    zIndex: 100,
                    pointerEvents: 'none',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: -8,
                        left: -6,
                        width: 14,
                        height: 14,
                        background: 'var(--color-accent-primary)',
                        borderRadius: '50%',
                        border: '2px solid var(--color-bg-secondary)',
                    }}
                />
            </div>
        );
    };

    const renderClip = (clip: Clip) => {
        const x = clip.start_time * PIXELS_PER_SECOND;
        const width = clip.duration * PIXELS_PER_SECOND;
        const y = clip.track_id * TRACK_HEIGHT;

        return (
            <div
                key={clip.id}
                style={{
                    position: 'absolute',
                    left: x,
                    top: y + 4,
                    width,
                    height: TRACK_HEIGHT - 8,
                    background: 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    cursor: 'move',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 'var(--space-2)',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-md)',
                }}
            >
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Clip {clip.id}
                </div>
            </div>
        );
    };

    return (
        <div
            className="timeline-container flex flex-col"
            style={{
                height: 300,
                background: 'var(--color-bg-secondary)',
                borderTop: '1px solid var(--color-border)',
            }}
        >
            {/* Timeline Header */}
            <div
                className="timeline-header flex items-center justify-between p-3"
                style={{ borderBottom: '1px solid var(--color-border)' }}
            >
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                    Timeline
                </div>
                <div className="flex items-center gap-2">
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                        Zoom: {Math.round(zoomLevel * 100)}%
                    </span>
                </div>
            </div>

            {/* Timeline Tracks */}
            <div
                ref={timelineRef}
                className="timeline-tracks"
                style={{
                    flex: 1,
                    position: 'relative',
                    overflow: 'auto',
                    cursor: 'crosshair',
                }}
                onClick={handleTimelineClick}
                onWheel={handleWheel}
            >
                {/* Time markers */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 30, background: 'var(--color-bg-tertiary)' }}>
                    {renderTimeMarkers()}
                </div>

                {/* Tracks background */}
                <div style={{ position: 'absolute', top: 30, left: 0, right: 0, bottom: 0 }}>
                    {Array.from({ length: TRACKS_COUNT }).map((_, i) => (
                        <div
                            key={i}
                            style={{
                                position: 'absolute',
                                top: i * TRACK_HEIGHT,
                                left: 0,
                                right: 0,
                                height: TRACK_HEIGHT,
                                borderBottom: '1px solid var(--color-border)',
                                background: i % 2 === 0 ? 'var(--color-bg-secondary)' : 'var(--color-bg-tertiary)',
                            }}
                        >
                            <div
                                style={{
                                    position: 'absolute',
                                    left: 8,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    fontSize: '0.75rem',
                                    color: 'var(--color-text-tertiary)',
                                }}
                            >
                                Track {i + 1}
                            </div>
                        </div>
                    ))}

                    {/* Clips */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                        {clips.map(renderClip)}
                    </div>

                    {/* Playhead */}
                    {renderPlayhead()}
                </div>
            </div>
        </div>
    );
}

import { useRef, type FC } from 'react';
import { useVideoStore } from '../store/videoStore';
import { formatTime } from '../utils/videoUtils';

export const Timeline: FC = () => {
    const timelineRef = useRef<HTMLDivElement>(null);
    const { layers, currentTime, duration, setCurrentTime } = useVideoStore();

    const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!timelineRef.current) return;

        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        const newTime = percentage * duration;
        setCurrentTime(Math.max(0, Math.min(newTime, duration)));
    };

    const playheadPosition = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="timeline">
            <div className="timeline-header">
                <div className="timeline-time">{formatTime(currentTime)} / {formatTime(duration)}</div>
            </div>

            <div
                className="timeline-tracks"
                ref={timelineRef}
                onClick={handleTimelineClick}
            >
                {/* Time markers */}
                <div className="timeline-markers">
                    {Array.from({ length: Math.ceil(duration) + 1 }, (_, i) => (
                        <div
                            key={i}
                            className="timeline-marker"
                            style={{ left: `${(i / duration) * 100}%` }}
                        >
                            <span>{formatTime(i)}</span>
                        </div>
                    ))}
                </div>

                {/* Layer tracks */}
                {layers.map((layer) => (
                    <div key={layer.id} className="timeline-track">
                        <div className="track-label">{layer.name}</div>
                        <div
                            className="track-clip"
                            style={{
                                left: `${(layer.startTime / duration) * 100}%`,
                                width: `${(layer.duration / duration) * 100}%`,
                                backgroundColor: layer.type === 'video' ? '#4a9eff' : '#9b59b6',
                            }}
                        >
                            <span className="clip-name">{layer.name}</span>
                        </div>
                    </div>
                ))}

                {/* Playhead */}
                <div
                    className="timeline-playhead"
                    style={{ left: `${playheadPosition}%` }}
                >
                    <div className="playhead-line"></div>
                    <div className="playhead-handle"></div>
                </div>
            </div>
        </div>
    );
};

import { useRef, useEffect, useState } from 'react';
import { useTimelineStore } from '@/store/timelineStore';
import { useEditorStore } from '@/store/editorStore';
import TimelineTrack from './TimelineTrack';
import Playhead from './Playhead';
import TimelineRuler from './TimelineRuler';
import './Timeline.css';

const Timeline = () => {
    const timelineRef = useRef<HTMLDivElement>(null);
    const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);

    const tracks = useTimelineStore((state) => state.tracks);
    const { playback, seek, timelineZoom } = useEditorStore();

    const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!timelineRef.current) return;

        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const time = (x / timelineZoom) * 1000; // Convert to milliseconds

        seek(Math.max(0, time));
    };

    const handlePlayheadDragStart = () => {
        setIsDraggingPlayhead(true);
    };

    const handlePlayheadDrag = (e: MouseEvent) => {
        if (!isDraggingPlayhead || !timelineRef.current) return;

        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const time = (x / timelineZoom) * 1000;

        seek(Math.max(0, time));
    };

    const handlePlayheadDragEnd = () => {
        setIsDraggingPlayhead(false);
    };

    useEffect(() => {
        if (isDraggingPlayhead) {
            document.addEventListener('mousemove', handlePlayheadDrag);
            document.addEventListener('mouseup', handlePlayheadDragEnd);

            return () => {
                document.removeEventListener('mousemove', handlePlayheadDrag);
                document.removeEventListener('mouseup', handlePlayheadDragEnd);
            };
        }
    }, [isDraggingPlayhead]);

    return (
        <div className="timeline">
            <div className="timeline-header">
                <div className="timeline-track-labels">
                    {tracks.map((track) => (
                        <div key={track.id} className="timeline-track-label" style={{ height: track.height }}>
                            <span className="timeline-track-name">{track.name}</span>
                        </div>
                    ))}
                </div>

                <div className="timeline-ruler-container">
                    <TimelineRuler />
                </div>
            </div>

            <div className="timeline-content" ref={timelineRef} onClick={handleTimelineClick}>
                <div className="timeline-tracks">
                    {tracks.map((track) => (
                        <TimelineTrack key={track.id} track={track} />
                    ))}
                </div>

                <Playhead
                    position={playback.currentTime}
                    onDragStart={handlePlayheadDragStart}
                />
            </div>
        </div>
    );
};

export default Timeline;

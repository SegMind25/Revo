import { useRef, useState, useEffect } from 'react';
import { TimelineClip as TimelineClipType } from '@/types';
import { useTimelineStore } from '@/store/timelineStore';
import { useEditorStore } from '@/store/editorStore';

interface TimelineClipProps {
    clip: TimelineClipType;
}

const TimelineClip = ({ clip }: TimelineClipProps) => {
    const clipRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, time: 0 });

    const { updateClip, selectClip, selectedClipIds } = useTimelineStore();
    const { timelineZoom } = useEditorStore();

    const isSelected = selectedClipIds.includes(clip.id);

    const visibleDuration = clip.duration - clip.trimStart - clip.trimEnd;
    const left = (clip.startTime / 1000) * timelineZoom;
    const width = (visibleDuration / 1000) * timelineZoom;

    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        selectClip(clip.id, e.shiftKey);
        setIsDragging(true);
        setDragStart({ x: e.clientX, time: clip.startTime });
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;

        const dx = e.clientX - dragStart.x;
        const dt = (dx / timelineZoom) * 1000;
        const newStartTime = Math.max(0, dragStart.time + dt);

        updateClip(clip.id, { startTime: newStartTime });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, dragStart]);

    const clipClassName = `timeline-clip timeline-clip-${clip.type} ${isSelected ? 'selected' : ''}`;

    return (
        <div
            ref={clipRef}
            className={clipClassName}
            style={{ left: `${left}px`, width: `${width}px` }}
            onMouseDown={handleMouseDown}
        >
            <span className="timeline-clip-name">{clip.name}</span>
            <div className="timeline-clip-handle timeline-clip-handle-left" />
            <div className="timeline-clip-handle timeline-clip-handle-right" />
        </div>
    );
};

export default TimelineClip;

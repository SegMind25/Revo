import { useEditorStore } from '@/store/editorStore';
import './TimelineRuler.css';

const TimelineRuler = () => {
    const { timelineZoom } = useEditorStore();

    // Generate time markers (every second)
    const markers = [];
    const totalSeconds = 300; // 5 minutes max

    for (let i = 0; i <= totalSeconds; i++) {
        const left = i * timelineZoom;
        const isMajor = i % 5 === 0;

        markers.push(
            <div
                key={i}
                className={`ruler-marker ${isMajor ? 'ruler-marker-major' : ''}`}
                style={{ left: `${left}px` }}
            >
                {isMajor && <span className="ruler-label">{formatTime(i * 1000)}</span>}
            </div>
        );
    }

    return <div className="timeline-ruler">{markers}</div>;
};

const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default TimelineRuler;

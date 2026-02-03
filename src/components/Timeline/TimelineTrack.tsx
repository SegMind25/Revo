import { TimelineTrack as TimelineTrackType } from '@/types';
import TimelineClip from './TimelineClip';

interface TimelineTrackProps {
    track: TimelineTrackType;
}

const TimelineTrack = ({ track }: TimelineTrackProps) => {
    return (
        <div className="timeline-track" style={{ height: track.height }}>
            {track.clips.map((clip) => (
                <TimelineClip key={clip.id} clip={clip} />
            ))}
        </div>
    );
};

export default TimelineTrack;

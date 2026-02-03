import { useEditorStore } from '@/store/editorStore';
import './Playhead.css';

interface PlayheadProps {
    position: number; // milliseconds
    onDragStart: () => void;
}

const Playhead = ({ position, onDragStart }: PlayheadProps) => {
    const { timelineZoom } = useEditorStore();

    const left = (position / 1000) * timelineZoom;

    return (
        <div className="playhead" style={{ left: `${left}px` }}>
            <div className="playhead-handle" onMouseDown={onDragStart} />
            <div className="playhead-line" />
        </div>
    );
};

export default Playhead;

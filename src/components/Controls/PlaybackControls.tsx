import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import './PlaybackControls.css';

const PlaybackControls = () => {
    const { playback, play, pause, seek } = useEditorStore();

    const handlePlayPause = () => {
        if (playback.isPlaying) {
            pause();
        } else {
            play();
        }
    };

    const handleSkipBack = () => {
        seek(Math.max(0, playback.currentTime - 1000));
    };

    const handleSkipForward = () => {
        seek(playback.currentTime + 1000);
    };

    const formatTime = (ms: number): string => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = Math.floor((ms % 1000) / 10);
        return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="playback-controls">
            <div className="playback-buttons">
                <button className="btn btn-ghost btn-icon" onClick={handleSkipBack} title="Skip back 1s">
                    <SkipBack size={18} />
                </button>

                <button className="btn btn-primary btn-icon" onClick={handlePlayPause} title={playback.isPlaying ? 'Pause' : 'Play'}>
                    {playback.isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </button>

                <button className="btn btn-ghost btn-icon" onClick={handleSkipForward} title="Skip forward 1s">
                    <SkipForward size={18} />
                </button>
            </div>

            <div className="playback-time">
                {formatTime(playback.currentTime)}
            </div>
        </div>
    );
};

export default PlaybackControls;

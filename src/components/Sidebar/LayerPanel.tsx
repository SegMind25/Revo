import { useTimelineStore } from '@/store/timelineStore';
import { Eye, EyeOff, Lock, Unlock, Trash2 } from 'lucide-react';
import './LayerPanel.css';

const LayerPanel = () => {
    const { tracks, updateTrack, removeClip } = useTimelineStore();

    const handleToggleVisible = (trackId: string, visible: boolean) => {
        updateTrack(trackId, { visible: !visible });
    };

    const handleToggleLocked = (trackId: string, locked: boolean) => {
        updateTrack(trackId, { locked: !locked });
    };

    return (
        <div className="layer-panel">
            <div className="panel-header">Layers</div>

            <div className="layer-list">
                {tracks.map((track) => (
                    <div key={track.id} className="layer-track">
                        <div className="layer-track-header">
                            <span className="layer-track-name">{track.name}</span>
                            <div className="layer-track-actions">
                                <button
                                    className="btn btn-ghost btn-icon"
                                    onClick={() => handleToggleVisible(track.id, track.visible)}
                                    title={track.visible ? 'Hide' : 'Show'}
                                >
                                    {track.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>
                                <button
                                    className="btn btn-ghost btn-icon"
                                    onClick={() => handleToggleLocked(track.id, track.locked)}
                                    title={track.locked ? 'Unlock' : 'Lock'}
                                >
                                    {track.locked ? <Lock size={16} /> : <Unlock size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="layer-clips">
                            {track.clips.map((clip) => (
                                <div key={clip.id} className="layer-clip">
                                    <span className="layer-clip-name">{clip.name}</span>
                                    <button
                                        className="btn btn-ghost btn-icon"
                                        onClick={() => removeClip(clip.id)}
                                        title="Delete clip"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LayerPanel;

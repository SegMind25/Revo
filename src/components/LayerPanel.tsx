import { type FC } from 'react';
import { useVideoStore } from '../store/videoStore';

export const LayerPanel: FC = () => {
    const { layers, selectedLayerId, selectLayer, updateLayer, removeLayer } = useVideoStore();

    const handleToggleVisibility = (layerId: string, visible: boolean) => {
        updateLayer(layerId, { visible: !visible });
    };

    const handleToggleLock = (layerId: string, locked: boolean) => {
        updateLayer(layerId, { locked: !locked });
    };

    const handleDelete = (layerId: string) => {
        if (confirm('Are you sure you want to delete this layer?')) {
            removeLayer(layerId);
        }
    };

    return (
        <div className="layer-panel">
            <div className="layer-panel-header">
                <h3>Layers</h3>
            </div>

            <div className="layer-list">
                {layers.length === 0 ? (
                    <div className="layer-empty">
                        <p>No layers yet</p>
                        <span>Import a video or add text to get started</span>
                    </div>
                ) : (
                    layers
                        .slice()
                        .sort((a, b) => b.zIndex - a.zIndex)
                        .map((layer) => (
                            <div
                                key={layer.id}
                                className={`layer-item ${selectedLayerId === layer.id ? 'selected' : ''}`}
                                onClick={() => selectLayer(layer.id)}
                            >
                                <div className="layer-icon">
                                    {layer.type === 'video' && '🎬'}
                                    {layer.type === 'text' && '📝'}
                                    {layer.type === 'image' && '🖼️'}
                                </div>

                                <div className="layer-info">
                                    <div className="layer-name">{layer.name}</div>
                                    <div className="layer-time">
                                        {layer.startTime.toFixed(1)}s - {(layer.startTime + layer.duration).toFixed(1)}s
                                    </div>
                                </div>

                                <div className="layer-controls">
                                    <button
                                        className={`layer-btn ${!layer.visible ? 'inactive' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleVisibility(layer.id, layer.visible);
                                        }}
                                        title={layer.visible ? 'Hide layer' : 'Show layer'}
                                    >
                                        {layer.visible ? '👁️' : '👁️‍🗨️'}
                                    </button>

                                    <button
                                        className={`layer-btn ${layer.locked ? 'active' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleLock(layer.id, layer.locked);
                                        }}
                                        title={layer.locked ? 'Unlock layer' : 'Lock layer'}
                                    >
                                        {layer.locked ? '🔒' : '🔓'}
                                    </button>

                                    <button
                                        className="layer-btn delete"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(layer.id);
                                        }}
                                        title="Delete layer"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))
                )}
            </div>
        </div>
    );
};

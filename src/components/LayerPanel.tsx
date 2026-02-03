import React from 'react';
import { Layers, Eye, EyeOff, Lock, Unlock } from 'lucide-react';

interface Layer {
    id: number;
    name: string;
    visible: boolean;
    locked: boolean;
    opacity: number;
    blendMode: string;
}

export function LayerPanel() {
    const [layers, setLayers] = React.useState<Layer[]>([
        { id: 1, name: 'Video 1', visible: true, locked: false, opacity: 100, blendMode: 'normal' },
        { id: 2, name: 'Video 2', visible: true, locked: false, opacity: 100, blendMode: 'normal' },
    ]);

    const toggleVisibility = (id: number) => {
        setLayers(layers.map(layer =>
            layer.id === id ? { ...layer, visible: !layer.visible } : layer
        ));
    };

    const toggleLock = (id: number) => {
        setLayers(layers.map(layer =>
            layer.id === id ? { ...layer, locked: !layer.locked } : layer
        ));
    };

    return (
        <div className="panel" style={{ width: 280, display: 'flex', flexDirection: 'column' }}>
            <div className="panel-header flex items-center gap-2">
                <Layers size={14} />
                Layers
            </div>
            <div className="panel-body" style={{ flex: 1, overflow: 'auto' }}>
                <div className="flex flex-col gap-1">
                    {layers.map((layer) => (
                        <div
                            key={layer.id}
                            className="layer-item flex items-center gap-2 p-2 rounded-md"
                            style={{
                                background: 'var(--color-bg-tertiary)',
                                border: '1px solid var(--color-border)',
                                opacity: layer.visible ? 1 : 0.5,
                            }}
                        >
                            <button
                                className="btn-icon btn-ghost"
                                style={{ padding: '4px' }}
                                onClick={() => toggleVisibility(layer.id)}
                            >
                                {layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                            </button>
                            <button
                                className="btn-icon btn-ghost"
                                style={{ padding: '4px' }}
                                onClick={() => toggleLock(layer.id)}
                            >
                                {layer.locked ? <Lock size={16} /> : <Unlock size={16} />}
                            </button>
                            <div style={{ flex: 1, fontSize: '0.875rem' }}>
                                {layer.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                                {layer.opacity}%
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

import React from 'react';
import { Sparkles, Palette, Droplet, Scissors } from 'lucide-react';

interface EffectCategory {
    name: string;
    icon: React.ReactNode;
    effects: string[];
}

export function EffectsPanel() {
    const categories: EffectCategory[] = [
        {
            name: 'Color',
            icon: <Palette size={14} />,
            effects: ['Brightness/Contrast', 'Saturation', 'Color Curves', 'HSL'],
        },
        {
            name: 'Blur',
            icon: <Droplet size={14} />,
            effects: ['Gaussian Blur', 'Motion Blur', 'Radial Blur'],
        },
        {
            name: 'Transform',
            icon: <Scissors size={14} />,
            effects: ['Scale', 'Rotate', 'Position', 'Crop'],
        },
    ];

    return (
        <div className="panel" style={{ width: 280, display: 'flex', flexDirection: 'column' }}>
            <div className="panel-header flex items-center gap-2">
                <Sparkles size={14} />
                Effects
            </div>
            <div className="panel-body" style={{ flex: 1, overflow: 'auto' }}>
                <div className="flex flex-col gap-4">
                    {categories.map((category) => (
                        <div key={category.name}>
                            <div
                                className="flex items-center gap-2"
                                style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    color: 'var(--color-text-secondary)',
                                    marginBottom: 'var(--space-2)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                }}
                            >
                                {category.icon}
                                {category.name}
                            </div>
                            <div className="flex flex-col gap-1">
                                {category.effects.map((effect) => (
                                    <button
                                        key={effect}
                                        className="btn btn-secondary"
                                        style={{
                                            justifyContent: 'flex-start',
                                            width: '100%',
                                            fontSize: '0.8125rem',
                                            padding: 'var(--space-2) var(--space-3)',
                                        }}
                                        title={`Apply ${effect}`}
                                    >
                                        {effect}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

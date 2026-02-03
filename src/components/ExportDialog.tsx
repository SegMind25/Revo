import React, { useState } from 'react';
import { X, Download } from 'lucide-react';

interface ExportDialogProps {
    onClose: () => void;
}

export function ExportDialog({ onClose }: ExportDialogProps) {
    const [format, setFormat] = useState('mp4');
    const [codec, setCodec] = useState('h264');
    const [preset, setPreset] = useState('youtube');
    const [exporting, setExporting] = useState(false);
    const [progress, setProgress] = useState(0);

    const presets = [
        { id: 'youtube', name: 'YouTube 1080p60', width: 1920, height: 1080, fps: 60 },
        { id: 'instagram', name: 'Instagram Square', width: 1080, height: 1080, fps: 30 },
        { id: 'tiktok', name: 'TikTok Vertical', width: 1080, height: 1920, fps: 30 },
        { id: 'custom', name: 'Custom Settings', width: 1920, height: 1080, fps: 30 },
    ];

    const handleExport = async () => {
        setExporting(true);
        setProgress(0);

        // Simulate export progress
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setExporting(false);
                    return 100;
                }
                return prev + 10;
            });
        }, 500);
    };

    return (
        <div
            className="modal-overlay flex items-center justify-center"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                zIndex: 1000,
            }}
            onClick={onClose}
        >
            <div
                className="modal glass-strong animate-slide-in"
                style={{
                    width: 500,
                    padding: 0,
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    className="modal-header flex items-center justify-between p-4"
                    style={{ background: 'var(--color-bg-tertiary)', borderBottom: '1px solid var(--color-border)' }}
                >
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Export Video</h3>
                    <button className="btn-icon btn-ghost" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="modal-body p-6" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {/* Presets */}
                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--space-2)', display: 'block' }}>
                            Preset
                        </label>
                        <div className="flex flex-col gap-2">
                            {presets.map((p) => (
                                <button
                                    key={p.id}
                                    className={preset === p.id ? 'btn btn-primary' : 'btn btn-secondary'}
                                    style={{ justifyContent: 'flex-start', width: '100%' }}
                                    onClick={() => setPreset(p.id)}
                                >
                                    <div className="flex flex-col items-start">
                                        <span>{p.name}</span>
                                        <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                                            {p.width}x{p.height} @ {p.fps}fps
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Format */}
                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--space-2)', display: 'block' }}>
                            Format
                        </label>
                        <select value={format} onChange={(e) => setFormat(e.target.value)} style={{ width: '100%' }}>
                            <option value="mp4">MP4 (H.264)</option>
                            <option value="mp4-h265">MP4 (H.265)</option>
                            <option value="webm">WebM (VP9)</option>
                        </select>
                    </div>

                    {/* Progress */}
                    {exporting && (
                        <div>
                            <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-2)' }}>
                                <span style={{ fontSize: '0.875rem' }}>Exporting...</span>
                                <span style={{ fontSize: '0.875rem', color: 'var(--color-accent-primary)' }}>
                                    {progress}%
                                </span>
                            </div>
                            <div
                                style={{
                                    width: '100%',
                                    height: 8,
                                    background: 'var(--color-bg-tertiary)',
                                    borderRadius: 'var(--radius-sm)',
                                    overflow: 'hidden',
                                }}
                            >
                                <div
                                    style={{
                                        width: `${progress}%`,
                                        height: '100%',
                                        background: 'var(--color-accent-gradient)',
                                        transition: 'width 0.3s ease',
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary"
                            style={{ flex: 1 }}
                            onClick={handleExport}
                            disabled={exporting}
                        >
                            <Download size={16} />
                            {exporting ? 'Exporting...' : 'Export'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

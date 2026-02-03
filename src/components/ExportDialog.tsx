import { type FC } from 'react';
import { useVideoStore } from '../store/videoStore';

interface ExportDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ExportDialog: FC<ExportDialogProps> = ({ isOpen, onClose }) => {
    const { exportConfig, setExportConfig } = useVideoStore();

    if (!isOpen) return null;

    return (
        <div className="dialog-overlay" onClick={onClose}>
            <div className="dialog" onClick={(e) => e.stopPropagation()}>
                <div className="dialog-header">
                    <h2>Export Video</h2>
                    <button className="dialog-close" onClick={onClose}>✕</button>
                </div>

                <div className="dialog-content">
                    <div className="form-group">
                        <label>Format</label>
                        <select
                            value={exportConfig.format}
                            onChange={(e) => setExportConfig({ format: e.target.value as 'mp4' | 'webm' })}
                        >
                            <option value="mp4">MP4</option>
                            <option value="webm">WebM</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Resolution</label>
                        <select
                            value={exportConfig.resolution}
                            onChange={(e) => setExportConfig({ resolution: e.target.value as any })}
                        >
                            <option value="720p">720p (1280x720)</option>
                            <option value="1080p">1080p (1920x1080)</option>
                            <option value="4k">4K (3840x2160)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Quality</label>
                        <select
                            value={exportConfig.quality}
                            onChange={(e) => setExportConfig({ quality: e.target.value as any })}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Frame Rate</label>
                        <select
                            value={exportConfig.fps}
                            onChange={(e) => setExportConfig({ fps: Number(e.target.value) as any })}
                        >
                            <option value="24">24 FPS</option>
                            <option value="30">30 FPS</option>
                            <option value="60">60 FPS</option>
                        </select>
                    </div>
                </div>

                <div className="dialog-footer">
                    <button className="btn secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="btn primary">
                        Export
                    </button>
                </div>
            </div>
        </div>
    );
};

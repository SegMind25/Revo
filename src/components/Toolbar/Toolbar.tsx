import { Upload, Type, Download, Layers, Settings } from 'lucide-react';
import { useRef } from 'react';
import { useTimelineStore } from '@/store/timelineStore';
import './Toolbar.css';

interface ToolbarProps {
    onToggleLayerPanel: () => void;
    onTogglePropertyPanel: () => void;
}

const Toolbar = ({ onToggleLayerPanel, onTogglePropertyPanel }: ToolbarProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addClip } = useTimelineStore();

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        const url = URL.createObjectURL(file);

        // Determine file type
        const type = file.type.startsWith('video/') ? 'video' :
            file.type.startsWith('image/') ? 'image' :
                file.type.startsWith('audio/') ? 'audio' : null;

        if (!type) {
            alert('Unsupported file type');
            return;
        }

        // For video files, get duration
        if (type === 'video') {
            const video = document.createElement('video');
            video.src = url;
            video.onloadedmetadata = () => {
                const duration = video.duration * 1000; // Convert to ms

                addClip({
                    id: `clip-${Date.now()}`,
                    type: 'video',
                    trackId: 'video-1',
                    startTime: 0,
                    duration,
                    offset: 0,
                    trimStart: 0,
                    trimEnd: 0,
                    source: url,
                    name: file.name,
                });
            };
        } else if (type === 'image') {
            addClip({
                id: `clip-${Date.now()}`,
                type: 'image',
                trackId: 'video-1',
                startTime: 0,
                duration: 5000, // 5 seconds default
                offset: 0,
                trimStart: 0,
                trimEnd: 0,
                source: url,
                name: file.name,
            });
        }

        // Reset input
        e.target.value = '';
    };

    const handleAddText = () => {
        addClip({
            id: `clip-${Date.now()}`,
            type: 'text',
            trackId: 'text-1',
            startTime: 0,
            duration: 5000,
            offset: 0,
            trimStart: 0,
            trimEnd: 0,
            name: 'Text Layer',
        });
    };

    return (
        <div className="toolbar">
            <div className="toolbar-section">
                <h1 className="toolbar-logo">Revo</h1>
            </div>

            <div className="toolbar-section">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*,image/*,audio/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                />

                <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload media"
                >
                    <Upload size={20} />
                </button>

                <button className="btn btn-ghost btn-icon" onClick={handleAddText} title="Add text">
                    <Type size={20} />
                </button>

                <div className="toolbar-divider" />

                <button className="btn btn-ghost btn-icon" onClick={onToggleLayerPanel} title="Toggle layers">
                    <Layers size={20} />
                </button>

                <button className="btn btn-ghost btn-icon" onClick={onTogglePropertyPanel} title="Toggle properties">
                    <Settings size={20} />
                </button>
            </div>

            <div className="toolbar-section">
                <button className="btn btn-primary" title="Export video">
                    <Download size={18} />
                    Export
                </button>
            </div>
        </div>
    );
};

export default Toolbar;

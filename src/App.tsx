import React, { useState } from 'react';
import { File, Download, Save, FolderOpen } from 'lucide-react';
import { Preview } from '@/components/Preview';
import { Timeline } from '@/components/Timeline';
import { LayerPanel } from '@/components/LayerPanel';
import { EffectsPanel } from '@/components/EffectsPanel';
import { ExportDialog } from '@/components/ExportDialog';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useEditorStore } from '@/store/useEditorStore';
import '@/styles/theme.css';

function App() {
    const [showExportDialog, setShowExportDialog] = useState(false);
    const { togglePlayback } = useEditorStore();

    // Setup keyboard shortcuts
    useKeyboardShortcuts({
        ' ': togglePlayback,
        'ctrl+s': () => console.log('Save project'),
        'ctrl+e': () => setShowExportDialog(true),
        'ctrl+o': () => console.log('Open project'),
    });

    return (
        <div className="app" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* Menu Bar */}
            <div
                className="menu-bar flex items-center gap-4 p-3"
                style={{
                    background: 'var(--color-bg-tertiary)',
                    borderBottom: '1px solid var(--color-border)',
                }}
            >
                <div style={{ fontSize: '1.125rem', fontWeight: 700, background: 'var(--color-accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Revo
                </div>
                <div className="flex gap-2">
                    <button className="btn btn-ghost" title="New Project">
                        <File size={16} />
                        New
                    </button>
                    <button className="btn btn-ghost" title="Open Project">
                        <FolderOpen size={16} />
                        Open
                    </button>
                    <button className="btn btn-ghost" title="Save Project">
                        <Save size={16} />
                        Save
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowExportDialog(true)} title="Export Video">
                        <Download size={16} />
                        Export
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content flex" style={{ flex: 1, overflow: 'hidden' }}>
                {/* Left Panel - Effects */}
                <div style={{ width: 280, borderRight: '1px solid var(--color-border)' }}>
                    <EffectsPanel />
                </div>

                {/* Center - Preview and Timeline */}
                <div className="center-panel flex flex-col" style={{ flex: 1 }}>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <Preview />
                    </div>
                    <Timeline />
                </div>

                {/* Right Panel - Layers */}
                <div style={{ width: 280, borderLeft: '1px solid var(--color-border)' }}>
                    <LayerPanel />
                </div>
            </div>

            {/* Export Dialog */}
            {showExportDialog && <ExportDialog onClose={() => setShowExportDialog(false)} />}
        </div>
    );
}

export default App;

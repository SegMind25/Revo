import { useState } from 'react';
import { VideoCanvas } from './components/VideoCanvas';
import { Timeline } from './components/Timeline';
import { LayerPanel } from './components/LayerPanel';
import { Toolbar } from './components/Toolbar';
import { ExportDialog } from './components/ExportDialog';
import './App.css';

function App() {
    const [showExportDialog, setShowExportDialog] = useState(false);

    return (
        <div className="app">
            <header className="app-header">
                <div className="logo">
                    <h1>Revo</h1>
                    <span className="tagline">Video Editor</span>
                </div>
            </header>

            <Toolbar />

            <div className="editor-workspace">
                <div className="canvas-area">
                    <VideoCanvas />
                </div>

                <div className="side-panel">
                    <LayerPanel />
                </div>
            </div>

            <div className="timeline-area">
                <Timeline />
            </div>

            <ExportDialog
                isOpen={showExportDialog}
                onClose={() => setShowExportDialog(false)}
            />
        </div>
    );
}

export default App;

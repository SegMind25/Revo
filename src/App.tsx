import { useState } from 'react';
import Toolbar from './components/Toolbar/Toolbar';
import VideoCanvas from './components/Canvas/VideoCanvas';
import Timeline from './components/Timeline/Timeline';
import LayerPanel from './components/Sidebar/LayerPanel';
import PropertyPanel from './components/Sidebar/PropertyPanel';
import PlaybackControls from './components/Controls/PlaybackControls';
import './App.css';

function App() {
    const [showLayerPanel, setShowLayerPanel] = useState(true);
    const [showPropertyPanel, setShowPropertyPanel] = useState(true);

    return (
        <div className="app">
            <Toolbar
                onToggleLayerPanel={() => setShowLayerPanel(!showLayerPanel)}
                onTogglePropertyPanel={() => setShowPropertyPanel(!showPropertyPanel)}
            />

            <div className="app-main">
                {showLayerPanel && (
                    <aside className="app-sidebar app-sidebar-left">
                        <LayerPanel />
                    </aside>
                )}

                <main className="app-content">
                    <div className="canvas-container">
                        <VideoCanvas />
                    </div>

                    <div className="timeline-container">
                        <PlaybackControls />
                        <Timeline />
                    </div>
                </main>

                {showPropertyPanel && (
                    <aside className="app-sidebar app-sidebar-right">
                        <PropertyPanel />
                    </aside>
                )}
            </div>
        </div>
    );
}

export default App;

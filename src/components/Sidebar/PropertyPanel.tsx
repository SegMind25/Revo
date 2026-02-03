import { useTimelineStore } from '@/store/timelineStore';
import './PropertyPanel.css';

const PropertyPanel = () => {
    const { selectedClipIds, getClipById, updateClip } = useTimelineStore();

    const selectedClip = selectedClipIds.length === 1
        ? getClipById(selectedClipIds[0])
        : null;

    if (!selectedClip) {
        return (
            <div className="property-panel">
                <div className="panel-header">Properties</div>
                <div className="property-panel-empty">
                    <p>Select a clip to edit properties</p>
                </div>
            </div>
        );
    }

    const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const duration = parseFloat(e.target.value) * 1000;
        updateClip(selectedClip.id, { duration });
    };

    const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const startTime = parseFloat(e.target.value) * 1000;
        updateClip(selectedClip.id, { startTime });
    };

    return (
        <div className="property-panel">
            <div className="panel-header">Properties</div>

            <div className="property-panel-content">
                <div className="property-section">
                    <h3 className="property-section-title">Clip Info</h3>

                    <div className="property-field">
                        <label className="property-label">Name</label>
                        <input
                            type="text"
                            className="input"
                            value={selectedClip.name}
                            onChange={(e) => updateClip(selectedClip.id, { name: e.target.value })}
                        />
                    </div>

                    <div className="property-field">
                        <label className="property-label">Type</label>
                        <div className="property-value">{selectedClip.type}</div>
                    </div>
                </div>

                <div className="property-section">
                    <h3 className="property-section-title">Timing</h3>

                    <div className="property-field">
                        <label className="property-label">Start Time (s)</label>
                        <input
                            type="number"
                            className="input"
                            value={(selectedClip.startTime / 1000).toFixed(2)}
                            onChange={handleStartTimeChange}
                            step="0.1"
                            min="0"
                        />
                    </div>

                    <div className="property-field">
                        <label className="property-label">Duration (s)</label>
                        <input
                            type="number"
                            className="input"
                            value={(selectedClip.duration / 1000).toFixed(2)}
                            onChange={handleDurationChange}
                            step="0.1"
                            min="0.1"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyPanel;

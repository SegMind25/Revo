import { useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import { useCanvasStore } from '@/store/canvasStore';
import { useEditorStore } from '@/store/editorStore';
import './VideoCanvas.css';

const VideoCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const { setCanvas } = useCanvasStore();
    const { project } = useEditorStore();

    useEffect(() => {
        if (!canvasRef.current) return;

        const fabricCanvas = new fabric.Canvas(canvasRef.current, {
            width: project.width,
            height: project.height,
            backgroundColor: project.backgroundColor,
            preserveObjectStacking: true,
        });

        setCanvas(fabricCanvas);

        return () => {
            fabricCanvas.dispose();
            setCanvas(null);
        };
    }, []);

    useEffect(() => {
        const canvas = useCanvasStore.getState().canvas;
        if (canvas) {
            canvas.setWidth(project.width);
            canvas.setHeight(project.height);
            canvas.setBackgroundColor(project.backgroundColor, () => {
                canvas.renderAll();
            });
        }
    }, [project.width, project.height, project.backgroundColor]);

    return (
        <div ref={containerRef} className="video-canvas-container">
            <div className="video-canvas-wrapper">
                <canvas ref={canvasRef} className="video-canvas" />
            </div>

            <div className="canvas-info">
                <span>{project.width} × {project.height}</span>
                <span>{project.fps} FPS</span>
            </div>
        </div>
    );
};

export default VideoCanvas;

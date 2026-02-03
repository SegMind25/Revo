import { useRef, useEffect, type FC } from 'react';
import { fabric } from 'fabric';
import { useVideoStore } from '../store/videoStore';
import { TextLayerData } from '../types';

export const VideoCanvas: FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<any>(null);
    const { layers, currentTime, selectedLayerId } = useVideoStore();

    useEffect(() => {
        if (!canvasRef.current) return;

        // Initialize Fabric.js canvas
        const canvas = new fabric.Canvas(canvasRef.current, {
            width: 1280,
            height: 720,
            backgroundColor: '#000000',
        });

        fabricCanvasRef.current = canvas;

        return () => {
            canvas.dispose();
        };
    }, []);

    useEffect(() => {
        if (!fabricCanvasRef.current) return;

        const canvas = fabricCanvasRef.current;
        canvas.clear();
        canvas.backgroundColor = '#000000';

        // Render layers at current time
        layers
            .filter((layer) => {
                if (!layer.visible) return false;
                const endTime = layer.startTime + layer.duration;
                return currentTime >= layer.startTime && currentTime <= endTime;
            })
            .sort((a, b) => a.zIndex - b.zIndex)
            .forEach((layer) => {
                if (layer.type === 'text') {
                    const textLayer = layer as TextLayerData;
                    const text = new fabric.Text(textLayer.content, {
                        left: textLayer.x,
                        top: textLayer.y,
                        fontSize: textLayer.fontSize,
                        fontFamily: textLayer.fontFamily,
                        fill: textLayer.color,
                        selectable: layer.id === selectedLayerId && !layer.locked,
                    });
                    canvas.add(text);
                }
                // Video and image layers would be rendered here
            });

        canvas.renderAll();
    }, [layers, currentTime, selectedLayerId]);

    return (
        <div className="canvas-container">
            <canvas ref={canvasRef} />
        </div>
    );
};

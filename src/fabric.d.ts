declare module 'fabric' {
    export const fabric: any;
    export namespace fabric {
        export class Canvas {
            constructor(el: HTMLCanvasElement, options?: any);
            clear(): void;
            add(...objects: any[]): void;
            renderAll(): void;
            dispose(): void;
            backgroundColor: string | null;
        }
        export class Text {
            constructor(text: string, options?: any);
        }
    }
}

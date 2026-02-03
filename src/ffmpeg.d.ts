declare module '@ffmpeg/ffmpeg' {
    export class FFmpeg {
        on(event: string, callback: (data: any) => void): void;
        load(config?: any): Promise<void>;
        writeFile(path: string, data: any): Promise<void>;
        readFile(path: string): Promise<any>;
        deleteFile(path: string): Promise<void>;
        exec(args: string[]): Promise<void>;
    }
}

declare module '@ffmpeg/util' {
    export function fetchFile(data: any): Promise<any>;
    export function toBlobURL(url: string, type: string): Promise<string>;
}

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
    plugins: [react()],

    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },

    clearScreen: false,

    server: {
        host: host || false,
        port: 5173,
        strictPort: true,
        hmr: host
            ? {
                protocol: "ws",
                host: host,
                port: 5173,
            }
            : undefined,
    },

    envPrefix: ["VITE_", "TAURI_"],

    build: {
        target: ["es2021", "chrome100", "safari13"],
        minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
        sourcemap: !!process.env.TAURI_DEBUG,
    },
});

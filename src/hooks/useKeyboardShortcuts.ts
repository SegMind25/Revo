import { useEffect } from 'react';

interface KeyboardShortcuts {
    [key: string]: () => void;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcuts) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            const ctrl = e.ctrlKey || e.metaKey;
            const shift = e.shiftKey;

            // Build shortcut key
            let shortcutKey = '';
            if (ctrl) shortcutKey += 'ctrl+';
            if (shift) shortcutKey += 'shift+';
            shortcutKey += key;

            // Also check for single key shortcuts
            const handler = shortcuts[shortcutKey] || shortcuts[key];

            if (handler) {
                e.preventDefault();
                handler();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);
}

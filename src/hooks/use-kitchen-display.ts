'use client';
import { useRef, useCallback, useEffect } from 'react';

export const KITCHEN_DISPLAY_KEY = 'kitchenDisplayData';

export function useKitchenDisplay() {
    const windowRef = useRef<Window | null>(null);

    const openDisplay = useCallback(() => {
        if (windowRef.current && !windowRef.current.closed) {
            windowRef.current.focus();
            return windowRef.current;
        } else {
            const newWindow = window.open('/kitchen-display', 'kitchenDisplay', 'width=1200,height=800');
            windowRef.current = newWindow;
            return newWindow;
        }
    }, []);

    const closeDisplay = useCallback(() => {
        if (windowRef.current && !windowRef.current.closed) {
            windowRef.current.close();
            windowRef.current = null;
        }
    }, []);

    const updateDisplay = useCallback((data: any) => {
        try {
            localStorage.setItem(KITCHEN_DISPLAY_KEY, JSON.stringify(data));
        } catch (error) {
            console.error("Failed to write to localStorage", error);
        }
    }, []);

    useEffect(() => {
        return () => {
            closeDisplay();
        };
    }, [closeDisplay]);

    return { openDisplay, closeDisplay, updateDisplay, windowRef };
}

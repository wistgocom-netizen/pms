
'use client';
import { useRef, useCallback, useEffect } from 'react';

export const CUSTOMER_DISPLAY_KEY = 'customerDisplayData';

export function useCustomerDisplay() {
    const windowRef = useRef<Window | null>(null);

    const openDisplay = useCallback(() => {
        if (windowRef.current && !windowRef.current.closed) {
            windowRef.current.focus();
            return windowRef.current;
        } else {
            const newWindow = window.open('/customer-display', 'customerDisplay', 'width=800,height=600');
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
            localStorage.setItem(CUSTOMER_DISPLAY_KEY, JSON.stringify(data));
        } catch (error) {
            console.error("Failed to write to localStorage", error);
        }
    }, []);

    useEffect(() => {
        // This effect runs when the component using the hook unmounts.
        // It's a good place to ensure the customer display window is closed.
        return () => {
            closeDisplay();
        };
    }, [closeDisplay]);

    return { openDisplay, closeDisplay, updateDisplay, windowRef };
}

'use client';

import { Button } from '@/components/ui/button';
import { Delete } from 'lucide-react';

interface NumericKeypadProps {
    onKeyClick: (key: string) => void;
}

export function NumericKeypad({ onKeyClick }: NumericKeypadProps) {
    
    const keypadButtons = [
        '1', '2', '3',
        '4', '5', '6',
        '7', '8', '9',
        '.', '0', 'backspace'
    ];

    return (
        <div className="grid grid-cols-3 gap-2">
            {keypadButtons.map((key) => (
                <Button
                    key={key}
                    type="button"
                    variant="outline"
                    className="h-16 text-2xl font-semibold"
                    onClick={() => onKeyClick(key)}
                >
                    {key === 'backspace' ? <Delete className="h-6 w-6" /> : key}
                </Button>
            ))}
        </div>
    );
}

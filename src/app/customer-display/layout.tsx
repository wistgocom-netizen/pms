
import { StoreProvider } from '@/context/StoreContext';
import '../globals.css';

export const metadata = {
    title: 'Customer Display',
    description: 'Customer-facing display for POS.',
};

export default function CustomerDisplayLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <StoreProvider>
            {children}
        </StoreProvider>
    );
}

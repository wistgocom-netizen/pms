
import { StoreProvider } from '@/context/StoreContext';
import '../globals.css';

export const metadata = {
    title: 'Orders',
    description: 'Order Display Screen.',
};

export default function OrdersDisplayLayout({
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

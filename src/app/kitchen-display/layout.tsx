
import { StoreProvider } from '@/context/StoreContext';
import '../globals.css';

export const metadata = {
    title: 'Orders',
    description: 'Kitchen Order Display Screen.',
};

export default function KitchenDisplayLayout({
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

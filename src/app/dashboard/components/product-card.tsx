'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/context/StoreContext';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  className?: string;
}

export function ProductCard({ product, onAddToCart, className }: ProductCardProps) {
  const { formatCurrency, t } = useStore();
  
  return (
    <Card
      className={cn("overflow-hidden flex flex-col cursor-pointer hover:bg-card/60 transition-colors duration-200 h-full group", className)}
      onClick={() => onAddToCart(product)}
      role="button"
      aria-label={t('Add {name} to cart', { name: product.name })}
    >
      <CardHeader className="p-4 items-center justify-center flex-grow">
        <div className="text-5xl h-16 w-16 flex items-center justify-center">
            {product.emoji}
        </div>
      </CardHeader>
      <CardContent className="p-3 text-center">
        <h3 className="font-semibold text-sm truncate">{product.name}</h3>
        <p className="text-xs text-muted-foreground">{t('SKU: {id}', { id: product.id })}</p>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex justify-between items-center">
        <span className="font-bold text-xs text-primary">{formatCurrency(product.price)}</span>
        <Button size="icon" variant="outline" className="h-7 w-7">
          <Plus className="h-4 w-4" />
          <span className="sr-only">{t('Add to cart')}</span>
        </Button>
      </CardFooter>
    </Card>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/context/StoreContext';
import type { Product } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSidebar } from '@/components/ui/sidebar';

interface QuickAddBarProps {
  onAddItem: (item: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    discount: number; // This is now passed as a percentage (0-100)
    emoji: string;
    category: string;
    stock: number;
  }) => void;
}

export function QuickAddBar({ onAddItem }: QuickAddBarProps) {
  const { products, registerBarcodeFocusHandler } = useStore();
  const { toast } = useToast();
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  
  const barcodeRef = useRef<HTMLInputElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);
  const { isMobile, state: sidebarState } = useSidebar();

  useEffect(() => {
    const focusInput = () => {
      setTimeout(() => {
        barcodeRef.current?.focus();
      }, 100);
    };
    
    registerBarcodeFocusHandler(focusInput);
    focusInput(); // Initial focus
  }, [registerBarcodeFocusHandler]);

  useEffect(() => {
    if (barcode) {
      const product = products.find(p => p.id === barcode);
      if (product) {
        setName(product.name);
        setPrice(product.price.toString());
        quantityRef.current?.focus();
        quantityRef.current?.select();
      } else {
        // For custom items
        setName('');
        setPrice('');
      }
    } else {
        setName('');
        setPrice('');
    }
  }, [barcode, products]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(price);
    const parsedQuantity = parseFloat(quantity);
    
    if (!name.trim() || isNaN(parsedPrice) || parsedPrice < 0 || isNaN(parsedQuantity) || parsedQuantity <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Item',
        description: 'Please ensure product name, price, and quantity are valid.',
      });
      return;
    }

    const isCustomItem = !barcode.trim();
    const itemId = isCustomItem ? `custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` : barcode;

    const product = products.find(p => p.id === barcode) || {
        emoji: '📦',
        category: 'Custom',
        stock: Infinity,
    };
    
    const discountPercentage = parseFloat(discount) || 0;

    onAddItem({
      id: itemId,
      name,
      quantity: parsedQuantity,
      price: parsedPrice,
      discount: discountPercentage,
      emoji: product.emoji,
      category: product.category,
      stock: product.stock,
    });

    // Reset form
    setBarcode('');
    setName('');
    setQuantity('1');
    setPrice('');
    setDiscount('');
    barcodeRef.current?.focus();
  };

  const getLeftOffset = () => {
    if (isMobile) {
      return '0';
    }
    if (sidebarState === 'expanded') {
      return 'var(--sidebar-width)';
    }
    return 'var(--sidebar-width-icon)';
  }

  return (
    <div
      className="fixed bottom-0 right-0 bg-card border-t p-1 md:p-2 z-20 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_12px_rgba(0,0,0,0.2)] transition-[left] duration-200 ease-linear"
      style={{ left: getLeftOffset() }}
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-row gap-1 md:gap-2 items-center max-w-screen-2xl mx-auto"
      >
        <Input
          id="quick-add-barcode"
          ref={barcodeRef}
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="Barcode"
          className="basis-[20%] h-9 md:h-10 text-xs md:text-sm"
        />

        <Input
          id="quick-add-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="basis-[30%] h-9 md:h-10 text-xs md:text-sm"
        />

        <Input
          id="quick-add-quantity"
          ref={quantityRef}
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Qty"
          min="0"
          step="0.01"
          className="basis-[10%] h-9 md:h-10 text-xs md:text-sm"
        />

        <Input
          id="quick-add-price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
          step="0.01"
          min="0"
          className="basis-[15%] h-9 md:h-10 text-xs md:text-sm"
        />
        
        <Input
          id="quick-add-discount"
          type="number"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          placeholder="Discount %"
          step="0.01"
          min="0"
          max="100"
          className="basis-[15%] h-9 md:h-10 text-xs md:text-sm"
        />

        <Button type="submit" size="default" className="h-9 md:h-10 text-xs md:text-sm">
            <Plus className="mr-1 md:mr-2 h-4 w-4" /> Add
        </Button>
      </form>
    </div>
  );
}

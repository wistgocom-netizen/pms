'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { CheckCircle, Printer } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useStore } from '@/context/StoreContext';

interface PaymentSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrint: () => void;
  onNewSale: () => void;
}

export function PaymentSuccessDialog({
  open,
  onOpenChange,
  onPrint,
  onNewSale,
}: PaymentSuccessDialogProps) {
  const isMobile = useIsMobile();
  const { t } = useStore();

  const handleInteractionClose = (isOpen: boolean) => {
    // If the dialog is closing for any reason (overlay click, Esc key),
    // trigger the same action as clicking the "New Sale" button.
    if (!isOpen) {
      onNewSale();
    }
  };
  
  const dialogContent = (
      <>
          <DialogHeader className="items-center text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <DialogTitle className="text-2xl">{t('Payment Complete!')}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex flex-col gap-3">
            <Button size="lg" onClick={onPrint}>
              <Printer className="mr-2 h-4 w-4" />
              {t('Print Receipt')}
            </Button>
            <Button size="lg" variant="outline" onClick={onNewSale}>
              {t('New Sale')}
            </Button>
          </div>
      </>
  );
  
  const sheetContent = (
      <>
          <SheetHeader className="p-6 items-center text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <SheetTitle className="text-xl">{t('Payment Complete!')}</SheetTitle>
          </SheetHeader>
          <SheetFooter className="p-4 mt-auto grid grid-cols-2 gap-2">
              <Button size="default" variant="outline" onClick={onNewSale}>
                  {t('New Sale')}
              </Button>
              <Button size="default" onClick={onPrint}>
                  <Printer className="mr-2 h-4 w-4" />
                  {t('Print Receipt')}
              </Button>
          </SheetFooter>
      </>
  );

  if (isMobile) {
      return (
          <Sheet open={open} onOpenChange={handleInteractionClose}>
              <SheetContent side="top" className="p-0 flex flex-col h-auto rounded-b-lg">
                  {sheetContent}
              </SheetContent>
          </Sheet>
      );
  }
  
  return (
    <Dialog open={open} onOpenChange={handleInteractionClose}>
      <DialogContent className="sm:max-w-md">
        {dialogContent}
      </DialogContent>
    </Dialog>
  );
}

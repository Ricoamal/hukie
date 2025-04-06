
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Minus, Plus, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/use-toast';

interface CartItem {
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
  };
  quantity: number;
}

interface ShoppingCartDrawerProps {
  open: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  cartTotal: number;
}

const ShoppingCartDrawer: React.FC<ShoppingCartDrawerProps> = ({
  open,
  onClose,
  cartItems,
  setCartItems,
  cartTotal
}) => {
  const updateQuantity = (productId: number, change: number) => {
    setCartItems(prevItems => 
      prevItems.map(item => {
        if (item.product.id === productId) {
          const newQuantity = Math.max(1, item.quantity + change);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeItem = (productId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
    toast({
      title: "Item removed",
      description: "The item has been removed from your cart",
    });
  };

  const handleCheckout = () => {
    toast({
      title: "Checkout initiated",
      description: `Processing payment for $${cartTotal.toFixed(2)}`,
    });
    // In a real app, this would navigate to checkout page or open payment modal
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
        </SheetHeader>
        
        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground">Your cart is empty</p>
            <Button variant="outline" className="mt-4" onClick={onClose}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 my-4">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex py-4">
                  <img 
                    src={item.product.image} 
                    alt={item.product.name}
                    className="h-16 w-16 rounded object-cover"
                  />
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{item.product.name}</h4>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6" 
                        onClick={() => removeItem(item.product.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-hukie-primary font-medium">
                      ${item.product.price.toFixed(2)}
                    </p>
                    <div className="flex items-center mt-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7" 
                        onClick={() => updateQuantity(item.product.id, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7" 
                        onClick={() => updateQuantity(item.product.id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
            
            <Separator />
            
            <div className="py-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
            </div>
            
            <SheetFooter>
              <Button 
                className="w-full" 
                onClick={handleCheckout}
              >
                Checkout
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ShoppingCartDrawer;

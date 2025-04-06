import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@/contexts/UserContext';
import { initiateMpesaPayment } from '../lib/mpesa';
import { createVoucher } from '../lib/vouchers';

export const VoucherPurchase = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [amount, setAmount] = useState<string>('500');
  const [isLoading, setIsLoading] = useState(false);
  
  const predefinedAmounts = ['300', '500', '800', '1000', '1500'];
  
  const handlePurchase = async () => {
    if (!amount || parseInt(amount) < 100) {
      toast({
        title: "Invalid amount",
        description: "Please enter at least 100 KES",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 1. Initiate M-Pesa payment
      const paymentResponse = await initiateMpesaPayment({
        phoneNumber: user?.phoneNumber || '',
        amount: parseInt(amount),
        accountReference: `HUkie-Voucher-${Date.now()}`,
        transactionDesc: 'Ride Voucher Purchase'
      });
      
      if (paymentResponse.success) {
        // 2. Create voucher in the system
        const voucher = await createVoucher({
          amount: parseInt(amount),
          senderId: user?.email || '',
          transactionId: paymentResponse.transactionId
        });
        
        toast({
          title: "Voucher purchased!",
          description: `Your ${amount} KES ride voucher is ready to use.`
        });
      }
    } catch (error) {
      console.error('Voucher purchase failed', error);
      toast({
        title: "Purchase failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h2 className="text-lg font-bold mb-3">Purchase Ride Voucher</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Amount (KES)
        </label>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {predefinedAmounts.map((value) => (
            <Button
              key={value}
              type="button"
              variant={amount === value ? "default" : "outline"}
              onClick={() => setAmount(value)}
              className="text-center"
            >
              {value} KES
            </Button>
          ))}
        </div>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter custom amount"
          min="100"
          className="mt-2"
        />
      </div>
      
      <Button
        className="w-full bg-teal-600 hover:bg-teal-700"
        disabled={isLoading}
        onClick={handlePurchase}
      >
        {isLoading ? "Processing..." : `Purchase ${amount} KES Voucher`}
      </Button>
      
      <p className="text-xs text-gray-500 mt-3 text-center">
        Vouchers are valid for 30 days and can only be redeemed for rides with Uber, Bolt, or Farasi.
      </p>
    </div>
  );
};






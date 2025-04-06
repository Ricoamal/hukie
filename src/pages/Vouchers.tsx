import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { VoucherPurchase } from '@/components/VoucherPurchase';
import { VoucherCard } from '@/components/VoucherCard';
import { RideVoucher } from '@/types/voucher';
import { getUserVouchers } from '@/lib/vouchers';
import HukieHeader from '@/components/HukieHeader';
import BottomNavigation from '@/components/BottomNavigation';
import { useUser } from '@/contexts/UserContext';

const Vouchers = () => {
  const { user } = useUser();
  const [vouchers, setVouchers] = useState<RideVoucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPurchase, setShowPurchase] = useState(false);
  
  useEffect(() => {
    loadVouchers();
  }, []);
  
  const loadVouchers = async () => {
    setIsLoading(true);
    try {
      const data = await getUserVouchers(user?.id || '');
      setVouchers(data);
    } catch (error) {
      console.error('Failed to load vouchers', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const activeVouchers = vouchers.filter(v => v.status === 'active');
  const sentVouchers = vouchers.filter(v => v.status === 'sent');
  const redeemedVouchers = vouchers.filter(v => 
    v.status === 'redeemed' || v.status === 'expired' || v.status === 'cancelled'
  );
  
  return (
    <div className="flex flex-col min-h-screen">
      <HukieHeader />
      
      <main className="flex-1 pb-16 px-4 max-w-2xl mx-auto">
        <div className="flex justify-between items-center mt-6 mb-4">
          <h1 className="text-2xl font-bold">Ride Vouchers</h1>
          <Button 
            onClick={() => setShowPurchase(true)}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Voucher
          </Button>
        </div>
        
        {showPurchase ? (
          <div className="mb-6">
            <VoucherPurchase />
            <Button 
              variant="ghost" 
              className="w-full mt-2"
              onClick={() => setShowPurchase(false)}
            >
              Cancel
            </Button>
          </div>
        ) : null}
        
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="active" className="flex-1">
              Available ({activeVouchers.length})
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex-1">
              Sent ({sentVouchers.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1">
              History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-4">
            {activeVouchers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No available vouchers</p>
                <Button 
                  variant="link" 
                  onClick={() => setShowPurchase(true)}
                  className="mt-2"
                >
                  Purchase a voucher
                </Button>
              </div>
            ) : (
              activeVouchers.map(voucher => (
                <VoucherCard 
                  key={voucher.id} 
                  voucher={voucher} 
                  onUpdate={loadVouchers}
                />
              ))
            )}
          </TabsContent>
          
          <TabsContent value="sent" className="space-y-4">
            {sentVouchers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No sent vouchers</p>
              </div>
            ) : (
              sentVouchers.map(voucher => (
                <VoucherCard 
                  key={voucher.id} 
                  voucher={voucher}
                />
              ))
            )}
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            {redeemedVouchers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No voucher history</p>
              </div>
            ) : (
              redeemedVouchers.map(voucher => (
                <VoucherCard 
                  key={voucher.id} 
                  voucher={voucher}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default Vouchers;
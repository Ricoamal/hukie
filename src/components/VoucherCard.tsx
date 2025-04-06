import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Car, Gift, Clock, Check, X } from 'lucide-react';
import { RideVoucher } from '@/types/voucher';
import { formatDate } from '@/lib/utils';
import { sendVoucher } from '../lib/vouchers';
import { useToast } from '@/components/ui/use-toast';
import { useSystemDate } from '@/hooks/use-system-date';

interface VoucherCardProps {
  voucher: RideVoucher;
  onUpdate?: () => void;
}

export const VoucherCard: React.FC<VoucherCardProps> = ({ 
  voucher, 
  onUpdate 
}) => {
  const { toast } = useToast();
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const currentDate = useSystemDate();
  const isExpired = new Date(voucher.expiresAt) < currentDate;
  const canSend = voucher.status === 'active' && !isExpired;
  
  const getStatusColor = () => {
    if (voucher.status === 'active') return 'text-green-600';
    if (voucher.status === 'sent') return 'text-blue-600';
    if (voucher.status === 'redeemed') return 'text-purple-600';
    if (voucher.status === 'expired' || voucher.status === 'cancelled') return 'text-red-600';
    return 'text-gray-600';
  };
  
  const getStatusLabel = () => {
    if (voucher.status === 'active') return 'Available';
    if (voucher.status === 'sent') return 'Sent';
    if (voucher.status === 'redeemed') return 'Redeemed';
    if (voucher.status === 'expired') return 'Expired';
    if (voucher.status === 'cancelled') return 'Cancelled';
    return voucher.status;
  };
  
  const handleSendVoucher = async () => {
    if (!selectedContact) return;
    
    setIsLoading(true);
    try {
      await sendVoucher(voucher.id, selectedContact);
      toast({
        title: "Voucher sent!",
        description: "Your date will receive the ride voucher notification."
      });
      setShowSendDialog(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to send voucher', error);
      toast({
        title: "Failed to send voucher",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <div className={`relative bg-white border rounded-xl p-4 shadow-sm ${isExpired ? 'opacity-70' : ''}`}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center">
            <div className="bg-teal-100 p-2 rounded-full mr-3">
              <Car className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{voucher.amount} KES</h3>
              <p className="text-xs text-gray-500">Ride Voucher</p>
            </div>
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor()} bg-opacity-10`}>
            {getStatusLabel()}
          </span>
        </div>
        
        {voucher.status === 'sent' && voucher.recipientId && (
          <div className="mb-3 p-2 bg-blue-50 rounded-md text-sm">
            <p className="font-medium text-blue-700">Sent to: Jane Doe</p>
          </div>
        )}
        
        {voucher.status === 'redeemed' && voucher.rideDetails && (
          <div className="mb-3 p-2 bg-purple-50 rounded-md text-sm">
            <p className="font-medium text-purple-700">
              Redeemed via {voucher.rideDetails.provider.charAt(0).toUpperCase() + voucher.rideDetails.provider.slice(1)}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {voucher.rideDetails.pickupLocation} → {voucher.rideDetails.dropoffLocation}
            </p>
          </div>
        )}
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>Expires: {formatDate(voucher.expiresAt)}</span>
          </div>
          <div>
            <span className="font-mono">#{voucher.code}</span>
          </div>
        </div>
        
        {canSend && (
          <Button 
            className="w-full bg-teal-600 hover:bg-teal-700"
            onClick={() => setShowSendDialog(true)}
          >
            <Gift className="h-4 w-4 mr-2" />
            Send to Date
          </Button>
        )}
        
        {!canSend && voucher.status === 'sent' && (
          <Button 
            variant="outline"
            className="w-full"
            disabled
          >
            Waiting for Redemption
          </Button>
        )}
      </div>
      
      {/* Send Voucher Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Ride Voucher</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              Select who you'd like to send this {voucher.amount} KES ride voucher to:
            </p>
            
            {/* Contact selection would go here */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {['contact1', 'contact2', 'contact3'].map(contactId => (
                <div 
                  key={contactId}
                  className={`p-3 border rounded-lg cursor-pointer flex items-center ${
                    selectedContact === contactId ? 'border-teal-500 bg-teal-50' : ''
                  }`}
                  onClick={() => setSelectedContact(contactId)}
                >
                  {/* Contact info would go here */}
                  <div className="ml-3 flex-1">
                    <p className="font-medium">Jane Doe</p>
                    <p className="text-sm text-gray-500">Last messaged 2 days ago</p>
                  </div>
                  {selectedContact === contactId && (
                    <Check className="h-5 w-5 text-teal-600" />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-3 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setShowSendDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              disabled={!selectedContact || isLoading}
              onClick={handleSendVoucher}
            >
              Send Voucher
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};


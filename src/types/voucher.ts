export interface RideVoucher {
  id: string;            // Unique identifier
  code: string;          // Redemption code (for user display)
  amount: number;        // Value in KES
  senderId: string;      // User who purchased the voucher
  recipientId?: string;  // User who received the voucher (if sent)
  status: 'active' | 'sent' | 'redeemed' | 'expired' | 'cancelled';
  createdAt: string;     // ISO date string
  expiresAt: string;     // ISO date string (typically 30 days after creation)
  redeemedAt?: string;   // When the voucher was used
  rideDetails?: {        // Populated when redeemed
    provider: 'uber' | 'bolt' | 'farasi';
    rideId: string;      // Reference ID from the provider
    pickupLocation: string;
    dropoffLocation: string;
    rideStatus: 'booked' | 'in_progress' | 'completed' | 'cancelled';
  };
  transactionId?: string; // M-Pesa transaction reference
}
import { RideVoucher } from '@/types/voucher';
import { generateUniqueCode } from '@/lib/utils';

// In a real app, these would be API calls to your backend
export const createVoucher = async (data: {
  amount: number;
  senderId: string;
  transactionId?: string;
}): Promise<RideVoucher> => {
  // This would be an API call in a real implementation
  const now
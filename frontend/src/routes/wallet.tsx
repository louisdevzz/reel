import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react';
import { Spool, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { useAuth } from '../lib/authContext';
import { useUser } from '../lib/userContext';
import { PaymentLoadingModal, PaymentStatus } from '../components/PaymentLoadingModal';
import { transactionService } from '../lib/transactionService';

export const Route = createFileRoute('/wallet')({
  component: WalletPage,
})

const tokenOptions = [
  { amount: 200, price: 0.5 },
  { amount: 500, price: 1.2 },
  { amount: 900, price: 2.1 },
  { amount: 1200, price: 2.8 },
  { amount: 1800, price: 4.0 },
  { amount: 2800, price: 6.5 },
  { amount: 3500, price: 8.2 },
  { amount: 5000, price: 11.5 },
];

function WalletPage() {
  const [selected, setSelected] = useState(0);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    status: 'processing',
    message: 'Processing payment...'
  });
  const [userTransactions, setUserTransactions] = useState<any[]>([]);
  const [userDepositStats, setUserDepositStats] = useState<any>(null);
  
  // Get real-time user data from contexts
  const { account, isConnected, loginType } = useAuth();
  const { currentUser } = useUser();

  // Use real transaction data from API
  const transactions = userTransactions.length > 0 ? userTransactions : [];

  const handleSelect = (idx: number) => {
    setSelected(idx);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Load user deposit data
  useEffect(() => {
    if (currentUser?.id) {
      loadUserTransactionData();
    }
  }, [currentUser?.id]);

  const loadUserTransactionData = async () => {
    if (!currentUser?.id) return;
    
    try {
      const [transactions, stats] = await Promise.all([
        transactionService.getUserTransactions(currentUser.id, 10, 0),
        transactionService.getUserTransactionStats(currentUser.id)
      ]);
      
      setUserTransactions(transactions);
      setUserDepositStats(stats);
    } catch (error) {
      console.error('Error loading user transaction data:', error);
    }
  };

  const handlePayment = async () => {
    if (!currentUser?.id || !account) {
      alert('Please connect your wallet first');
      return;
    }

    const selectedOption = tokenOptions[selected];
    if (!selectedOption) return;

    setShowPaymentModal(true);
    setPaymentStatus({
      status: 'processing',
      message: 'Initiating deposit transaction...'
    });

    try {
      const depositRequest = {
        amount: selectedOption.amount,
        price: selectedOption.price,
        rate: 400, // Calculate rate
        userId: currentUser.id,
        userAddr: account,
        referralCode: undefined // Optional referral code
      };

      await transactionService.processDepositWithStatus(
        depositRequest,
        (status) => setPaymentStatus(status)
      );

      // Reload user data after successful payment
      if (paymentStatus.status === 'success') {
        await loadUserTransactionData();
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus({
        status: 'failed',
        message: 'Payment failed. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'confirmed':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  // Show loading state if user data is not yet loaded
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#18181b] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold mb-2">Please connect your wallet</div>
          <div className="text-gray-400">You need to be connected to view your wallet</div>
        </div>
      </div>
    );
  }

  // Show loading state while user data is being fetched
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#18181b] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <div className="text-gray-400">Loading user data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#18181b] text-white pb-20">
      <div className="mx-auto pt-10 px-4 flex flex-col gap-8 max-w-5xl">
        {/* User Info Card */}
        <div className="flex flex-col justify-between md:flex-row gap-4 items-start bg-[#23232a] rounded-xl p-6 border border-[#27272a]">
          <div className="flex items-center gap-4">
            <img src={currentUser.avatar} alt={currentUser.username} className="w-16 h-16 rounded-full border-2 border-purple-500" />
            <div className="flex-1 flex flex-col gap-1">
              <span className="font-bold text-lg">{currentUser.username}</span>
              <span className="text-gray-400 text-sm">
                Gift Balance: ${currentUser.totalDonation.toFixed(2)} ({currentUser.totalDonationCount} gifts received)
              </span>
              <span className="text-xs text-gray-500">
                Connected via {loginType === 'wallet' ? 'Petra Wallet' : 'Google Account'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={showTransactionHistory} onOpenChange={setShowTransactionHistory}>
              <DialogTrigger asChild>
                <button className="hover:underline">
                  <span className="text-xs text-white">Show History Transaction</span>
                </button>
              </DialogTrigger>
              <DialogContent className="bg-[#23232a] border-[#27272a] text-white md:min-w-4xl max-h-[80vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-white">Transaction History</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto max-h-[60vh] pr-2">
                  <div className="space-y-3">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 bg-[#18181b] rounded-lg border border-[#27272a]">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${transaction.type === 'purchase' ? 'bg-blue-500/20' : 'bg-green-500/20'}`}>
                            {transaction.type === 'purchase' ? (
                              <ArrowDownLeft className="w-4 h-4 text-blue-400" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4 text-green-400" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-white">{transaction.description}</span>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Clock className="w-3 h-3" />
                              {formatDate(transaction.date)}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1">
                            <Spool className="w-4 h-4 text-yellow-400" />
                            <span className="font-semibold text-white">{transaction.amount}</span>
                          </div>
                          {transaction.price > 0 && (
                            <span className="text-xs text-gray-400">{transaction.price} APT</span>
                          )}
                          <span className={`text-xs font-medium ${getStatusColor(transaction.status)}`}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Token Options Grid */}
        <div className="bg-[#23232a] rounded-xl p-6 border border-[#27272a]">
          <div className="text-pink-400 font-semibold mb-4">Top up REEL tokens: Fast and secure payments on Aptos blockchain.</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            {tokenOptions.map((opt, idx) => (
              <button
                key={opt.amount}
                className={`flex flex-col items-center justify-center rounded-lg border px-4 py-6 transition-all font-semibold text-lg gap-2 ${selected === idx ? 'border-pink-500 bg-[#18181b]' : 'border-[#27272a] bg-[#23232a] hover:border-pink-400'}`}
                onClick={() => handleSelect(idx)}
              >
                <div className="flex items-center gap-1 text-yellow-400 text-2xl font-bold">
                  <Spool className="w-6 h-6 text-yellow-400" />
                  <span>{opt.amount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-400 text-sm">{opt.price} APT</span>
                  <span className="text-gray-500 text-xs">~${(opt.price * 4.49).toFixed(2)}</span>
                </div>
              </button>
            ))}
          </div>
          <div className="flex justify-end">
            <button 
              onClick={handlePayment}
              className="bg-pink-500 hover:bg-pink-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Pay {tokenOptions[selected]?.price} APT
            </button>
          </div>
        </div>
      </div>

      {/* Payment Loading Modal */}
      <PaymentLoadingModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        paymentStatus={paymentStatus}
        amount={tokenOptions[selected]?.amount || 0}
        price={tokenOptions[selected]?.price || 0}
        type="deposit"
      />
    </div>
  );
}
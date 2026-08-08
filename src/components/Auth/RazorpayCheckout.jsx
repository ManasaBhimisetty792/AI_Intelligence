import React from 'react';
import usePayment from '../../hooks/usePayment';
import LoadingPayment from '../payments/LoadingPayment';
import MockPaymentModal from '../payments/MockPaymentModal';

/**
 * RazorpayCheckout component — backward-compatible component wrapper.
 * Delegates all state and flow logic to the centralized `usePayment` hook.
 */
const RazorpayCheckout = ({
  planName = 'Student Premium',
  amount = 1499,
  currency = 'INR',
  children,
}) => {
  const {
    initiatePayment,
    isLoading,
    status,
    showMockModal,
    mockOrderInfo,
    handleConfirmMockPayment,
    handleCloseMockModal,
  } = usePayment();

  const handleCheckout = () => {
    initiatePayment('student_premium');
  };

  return (
    <>
      {isLoading && <LoadingPayment message={status === 'verifying' ? 'Verifying payment...' : 'Opening gateway...'} />}

      <MockPaymentModal
        isOpen={showMockModal}
        onClose={handleCloseMockModal}
        onConfirmPay={handleConfirmMockPayment}
        planDetails={mockOrderInfo?.plan || { planName, amount, currency }}
        userDetails={mockOrderInfo?.user}
      />

      {children ? (
        React.cloneElement(React.Children.only(children), {
          onClick: handleCheckout,
          disabled: isLoading,
        })
      ) : (
        <button
          onClick={handleCheckout}
          disabled={isLoading}
          className="w-full py-3.5 px-6 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : `Upgrade to Premium — ₹${amount}`}
        </button>
      )}
    </>
  );
};

export default RazorpayCheckout;

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiCreditCard, FiDownload, FiCheckCircle, FiXCircle, FiClock, FiFileText, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { useAuth } from '../../hooks/useAuth';
import paymentService from '../../services/paymentService';

export const PaymentHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchHistory() {
      if (user?.id) {
        const history = await paymentService.getPaymentHistory(user.id);
        if (isMounted) {
          setPayments(history);
          setLoading(false);
        }
      } else {
        if (isMounted) setLoading(false);
      }
    }
    fetchHistory();
    return () => { isMounted = false; };
  }, [user]);

  const handleDownloadInvoice = (item) => {
    const invoiceContent = `========================================================
SKILLTRACK AI — OFFICIAL PAYMENT INVOICE
========================================================
Invoice Number : ${item.invoice_number || 'INV-2026-01'}
Date           : ${new Date(item.created_at).toLocaleDateString()}
Plan Purchased : ${item.plan_name || 'Student Premium'}
Amount Paid    : ₹${item.amount} ${item.currency || 'INR'}
Status         : ${(item.payment_status || 'SUCCESS').toUpperCase()}
Payment Method : ${item.payment_method || 'Razorpay'}
Transaction Ref: ${item.transaction_reference || item.payment_id}

Customer Email : ${user?.email || 'N/A'}
========================================================
Thank you for subscribing to SkillTrack AI Premium!
========================================================`;

    const blob = new Blob([invoiceContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${item.invoice_number || 'SkillTrack_Invoice'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div style={{ padding: '0.5rem 0' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <button
              onClick={() => navigate('/student/dashboard')}
              className="btn-glass"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginBottom: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <FiArrowLeft /> Back to Dashboard
            </button>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <FiCreditCard style={{ color: 'var(--color-primary)' }} /> Payment & Invoice History
            </h2>
            <p style={{ color: 'var(--color-muted)', margin: '0.35rem 0 0', fontSize: '0.9rem' }}>
              View all your past transactions, active subscriptions, and download official billing invoices.
            </p>
          </div>
        </div>

        {/* History Table */}
        <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '1.25rem' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--color-muted)' }}>Loading billing records...</p>
            </div>
          ) : payments.length === 0 ? (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--color-muted)' }}>
              <FiFileText style={{ fontSize: '3rem', opacity: 0.4, marginBottom: '0.75rem' }} />
              <h4>No Payment History Found</h4>
              <p style={{ fontSize: '0.88rem' }}>You are currently on the Free tier. Upgrade to Premium to see your invoices here.</p>
              <button onClick={() => navigate('/pricing')} className="btn-primary" style={{ marginTop: '1rem' }}>
                View Premium Plans
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--color-muted)' }}>
                    <th style={{ padding: '0.85rem' }}>Invoice</th>
                    <th style={{ padding: '0.85rem' }}>Plan</th>
                    <th style={{ padding: '0.85rem' }}>Amount</th>
                    <th style={{ padding: '0.85rem' }}>Date</th>
                    <th style={{ padding: '0.85rem' }}>Status</th>
                    <th style={{ padding: '0.85rem' }}>Transaction ID</th>
                    <th style={{ padding: '0.85rem', textAlign: 'right' }}>Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((item, idx) => (
                    <tr
                      key={item.id || idx}
                      style={{
                        borderBottom: idx === payments.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.04)',
                      }}
                    >
                      <td style={{ padding: '1rem 0.85rem', fontWeight: 700, color: '#fff' }}>
                        {item.invoice_number || `INV-2026-${idx+101}`}
                      </td>
                      <td style={{ padding: '1rem 0.85rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                        {item.plan_name || 'Student Premium'}
                      </td>
                      <td style={{ padding: '1rem 0.85rem', fontWeight: 700, color: '#10b981' }}>
                        ₹{item.amount} {item.currency || 'INR'}
                      </td>
                      <td style={{ padding: '1rem 0.85rem', color: 'var(--color-muted)' }}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '1rem 0.85rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: item.payment_status === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: item.payment_status === 'success' ? '#10b981' : '#ef4444',
                            border: `1px solid ${item.payment_status === 'success' ? '#10b981' : '#ef4444'}`,
                          }}
                        >
                          {item.payment_status === 'success' ? <FiCheckCircle /> : <FiXCircle />}
                          {(item.payment_status || 'SUCCESS').toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.85rem', fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--color-muted)' }}>
                        {item.payment_id || item.order_id || 'N/A'}
                      </td>
                      <td style={{ padding: '1rem 0.85rem', textAlign: 'right' }}>
                        <button
                          onClick={() => handleDownloadInvoice(item)}
                          className="btn-glass"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <FiDownload /> Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PaymentHistory;

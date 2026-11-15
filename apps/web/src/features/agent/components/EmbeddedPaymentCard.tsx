'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { QrCode, Maximize2, ShieldCheck, ArrowRight, Clock } from 'lucide-react';
import type { PaymentMethod } from '../model/types.ts';
import { formatCurrency } from '../model/agent-logic.ts';
import styles from '../styles/embedded-cards.module.css';

interface EmbeddedPaymentCardProps {
  totalPrice?: number;
  selectedSeats?: string[];
  bookingCode?: string;
  onExecutePayment?: (method: PaymentMethod) => void;
  disabled?: boolean;
}

export const EmbeddedPaymentCard: React.FC<EmbeddedPaymentCardProps> = ({
  totalPrice = 320000,
  selectedSeats = ['H7', 'H8'],
  bookingCode = 'MB-2026-000128',
  onExecutePayment,
  disabled = false,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('vnpay');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [hasConsented, setHasConsented] = useState<boolean>(true);

  const handlePay = () => {
    if (disabled || isProcessing || !hasConsented) return;
    setIsProcessing(true);
    // Simulate instantaneous gateway verification
    setTimeout(() => {
      const mappedMethod: PaymentMethod =
        selectedMethod === 'momo' ? 'momo' : selectedMethod === 'vnpay' ? 'vnpay' : 'card';
      onExecutePayment?.(mappedMethod);
      setIsProcessing(false);
    }, 600);
  };

  const paymentTabs = [
    { id: 'vnpay', label: 'VNPay-QR' },
    { id: 'momo', label: 'Ví MoMo' },
    { id: 'zalopay', label: 'ZaloPay' },
    { id: 'atm', label: 'Thẻ ATM' },
    { id: 'visamc', label: 'Visa / MC' },
  ];

  return (
    <div className={`${styles.cardBase} ${styles.paymentCard}`} data-testid="embedded-payment-card">
      {/* Header - Figma Node 769:2199 */}
      <div className={styles.cardHeader}>
        <div>
          <h4 className={styles.cardTitle}>Phương thức thanh toán</h4>
          <span className={styles.cardSubtitle}>
            Đơn hàng: {bookingCode} · {selectedSeats.length} Vé VIP ({selectedSeats.join(', ')})
          </span>
        </div>

        <div className={styles.cardBadge} style={{ color: 'var(--color-rosso-corsa, #da291c)', borderColor: 'var(--color-rosso-corsa, #da291c)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Clock size={13} aria-hidden="true" />
          <span>GIỮ CHỖ CÒN: 08:42</span>
        </div>
      </div>

      {/* 5 Payment Tabs - Figma Node 769:2205 */}
      <div className={styles.paymentTabsRow}>
        {paymentTabs.map((tab) => {
          const isActive = selectedMethod === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`${styles.paymentTabBtn} ${isActive ? styles.paymentTabBtnActive : ''}`}
              onClick={() => setSelectedMethod(tab.id)}
              disabled={disabled || isProcessing}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Payment Method Detail Box - Figma Node 769:2216 */}
      <div className={styles.vnpayDetailsBox}>
        {/* Left QR Box */}
        <div className={styles.vnpayQrSide}>
          <QrCode size={54} color="#000000" aria-hidden="true" />
          <span className={styles.vnpayQrCaption}>Quét bằng ứng dụng ngân hàng</span>
        </div>

        {/* Right Info */}
        <div className={styles.vnpayTextSide}>
          <h5 className={styles.vnpayTitle}>Cổng thanh toán bảo mật VNPAY-QR</h5>
          <p className={styles.vnpayDesc}>
            Mở ứng dụng Mobile Banking của bạn, chọn quét QR để thanh toán an toàn tức thì. Kết quả giao dịch được Cinema Core ghi nhận tự động.
          </p>

          <div className={styles.vnpayAmountRow}>
            <span style={{ fontSize: '13px', color: 'var(--color-fumo, #8f8f8f)' }}>Số tiền:</span>
            <span className={styles.vnpayAmountValue}>{formatCurrency(totalPrice)}</span>
            <span className={styles.vnpaySeatsBadge}>Ghế: {selectedSeats.join(', ')} (VIP)</span>
          </div>
        </div>
      </div>

      {/* Consent & Legal Links - Figma Node 769:2228 */}
      <div className={styles.paymentConsentRow}>
        <label className={styles.consentCheckboxLabel}>
          <input
            type="checkbox"
            className={styles.consentCheckbox}
            checked={hasConsented}
            onChange={(e) => setHasConsented(e.target.checked)}
          />
          <span>Tôi đồng ý với Điều khoản sử dụng và Quy chế hoàn/hủy vé của rạp.</span>
        </label>

        <div className={styles.consentLinks}>
          <a href="#terms" className={styles.consentLink} onClick={(e) => e.preventDefault()}>
            Xem điều khoản
          </a>
          <a href="#refund" className={styles.consentLink} onClick={(e) => e.preventDefault()}>
            Chính sách hoàn/hủy
          </a>
        </div>
      </div>

      {/* Action Row - Figma Node 769:2239 (500px + 268px) */}
      <div className={styles.summaryFooterActions}>
        <button
          type="button"
          className={styles.summaryPrimaryBtn}
          style={{ backgroundColor: 'var(--color-bianco-ferrari, #ffffff)', color: '#000000' }}
          onClick={handlePay}
          disabled={disabled || isProcessing || !hasConsented}
        >
          {isProcessing ? (
            <span>Đang xác thực giao dịch qua Cinema Core...</span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              XÁC NHẬN THANH TOÁN {formatCurrency(totalPrice)}
              <ArrowRight size={14} aria-hidden="true" />
            </span>
          )}
        </button>

        <Link href="/checkout/MB-2026-000128" className={styles.summarySecondaryBtn}>
          <Maximize2 size={14} aria-hidden="true" />
          <span>Thanh toán toàn màn hình</span>
        </Link>
      </div>

      <div className={styles.cardFootnote}>
        * Chỉ xác nhận thanh toán một lần. Đơn hàng được bảo vệ bởi chứng chỉ mã hóa Cinema Core SSL 256-bit.
      </div>
    </div>
  );
};

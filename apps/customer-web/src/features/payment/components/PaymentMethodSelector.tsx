'use client';

import React from 'react';
import styles from '../styles/checkout.module.css';
import type { PaymentMethod } from '../model/types.ts';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
  disabled?: boolean;
}

const METHODS: { id: PaymentMethod; label: string }[] = [
  { id: 'vnpay', label: 'VNPay-QR' },
  { id: 'momo', label: 'Ví MoMo' },
  { id: 'zalopay', label: 'ZaloPay' },
  { id: 'atm', label: 'ATM' },
  { id: 'card', label: 'Visa / MC' },
];

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelectMethod,
  disabled = false,
}) => {
  return (
    <div className={styles.methodTabs} role="tablist" aria-label="Phương thức thanh toán">
      {METHODS.map((method) => {
        const isActive = selectedMethod === method.id;
        return (
          <button
            key={method.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            className={`${styles.methodTab} ${isActive ? styles.methodTabActive : ''}`}
            onClick={() => onSelectMethod(method.id)}
            disabled={disabled}
          >
            {method.label}
          </button>
        );
      })}
    </div>
  );
};

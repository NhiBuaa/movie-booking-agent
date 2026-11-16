'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Ticket, Clock, Check, Copy } from 'lucide-react';
import type { VoucherItem } from '../model/types.ts';
import styles from '../styles/vouchers.module.css';

interface VouchersViewProps {
  initialVouchers: VoucherItem[];
}

export const VouchersView: React.FC<VouchersViewProps> = ({ initialVouchers }) => {
  const [vouchers, setVouchers] = useState<VoucherItem[]>(initialVouchers);
  const [inputCode, setInputCode] = useState('');
  const [activeTab, setActiveTab] = useState<'MY_VOUCHERS' | 'DISCOVER' | 'EXPIRED'>('MY_VOUCHERS');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleApplyCode = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputCode.trim().toUpperCase();
    if (!trimmed) return;

    if (vouchers.some((v) => v.code === trimmed)) {
      setToastMsg(`Mã voucher "${trimmed}" đã có sẵn trong ví của bạn!`);
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }

    const newVoucher: VoucherItem = {
      id: `voucher-${Date.now()}`,
      code: trimmed,
      stubTitle: 'GIẢM 30K',
      stubSubtitle: 'VOUCHER MỚI',
      title: `ƯU ĐÃI ĐẶT VÉ ${trimmed}`,
      description: 'Áp dụng cho mọi suất chiếu đặt trực tuyến qua Cinora.',
      expiryDate: '31/12/2026',
      discountType: 'amount',
      discountValue: 30000,
    };

    setVouchers([newVoucher, ...vouchers]);
    setInputCode('');
    setToastMsg(`Đã thêm mã "${trimmed}" vào Ví Voucher thành công!`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCopyCode = async (code: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        {/* Heading & Breadcrumb */}
        <section className={styles.headingSection} aria-label="Tiêu đề trang">
          <div>
            <h1 className={styles.pageTitle}>Ưu Đãi & Ví Voucher</h1>
            <p className={styles.pageSubtitle}>
              Quản lý mã giảm giá của bạn và áp dụng ưu đãi cho các suất chiếu.
            </p>
          </div>
          <div className={styles.breadcrumbText}>Trang chủ › Tài khoản › Ưu đãi & Ví Voucher</div>
        </section>

        {/* Toast */}
        {toastMsg && (
          <div
            style={{
              marginTop: 16,
              padding: '12px 20px',
              backgroundColor: '#0d281e',
              border: '1px solid #2e7d5b',
              color: '#ffffff',
              fontSize: 13,
            }}
          >
            {toastMsg}
          </div>
        )}

        {/* Redeem Voucher Input Bar */}
        <form onSubmit={handleApplyCode} className={styles.redeemBar} aria-label="Nhập mã voucher">
          <Ticket size={20} className={styles.voucherIcon} aria-hidden="true" />
          <div className={styles.redeemInputWrapper}>
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="- Nhập mã voucher hoặc mã quà tặng... -"
              className={styles.redeemInput}
              aria-label="Mã voucher"
            />
          </div>
          <button type="submit" className={styles.redeemBtn}>
            ÁP DỤNG / LƯU VÀO VÍ
          </button>
        </form>

        {/* Filter tabs */}
        <div className={styles.filterTabsRow} role="tablist" aria-label="Bộ lọc voucher">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'MY_VOUCHERS'}
            className={`${styles.tabBtn} ${activeTab === 'MY_VOUCHERS' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('MY_VOUCHERS')}
          >
            Ví voucher của tôi ({vouchers.length.toString().padStart(2, '0')})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'DISCOVER'}
            className={`${styles.tabBtn} ${activeTab === 'DISCOVER' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('DISCOVER')}
          >
            Khám phá ưu đãi rạp
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'EXPIRED'}
            className={`${styles.tabBtn} ${activeTab === 'EXPIRED' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('EXPIRED')}
          >
            Đã sử dụng / Hết hạn
          </button>
        </div>

        {/* Coupons List */}
        <section className={styles.couponsList} aria-label="Danh sách phiếu ưu đãi">
          {activeTab === 'MY_VOUCHERS' &&
            vouchers.map((coupon) => (
              <article key={coupon.id} className={styles.couponCard}>
                <div className={styles.couponStub}>
                  <div className={styles.stubTitle}>{coupon.stubTitle}</div>
                  <div className={styles.stubSubtitle}>{coupon.stubSubtitle}</div>
                </div>

                <div className={styles.perforationLine} />

                <div className={styles.couponMain}>
                  <div className={styles.couponTitleRow}>
                    <h2 className={styles.couponTitle}>{coupon.title}</h2>
                    <button
                      type="button"
                      className={styles.couponCodeChip}
                      onClick={() => handleCopyCode(coupon.code)}
                      title="Sao chép mã"
                    >
                      {copiedCode === coupon.code ? (
                        <>
                          <Check size={12} style={{ display: 'inline', marginRight: 4 }} aria-hidden="true" />
                          ĐÃ SAO CHÉP
                        </>
                      ) : (
                        <>
                          <Copy size={12} style={{ display: 'inline', marginRight: 4 }} aria-hidden="true" />
                          MÃ: {coupon.code}
                        </>
                      )}
                    </button>
                  </div>

                  <p className={styles.couponDesc}>{coupon.description}</p>

                  <div className={styles.couponExpiryRow}>
                    <Clock size={14} aria-hidden="true" />
                    <span>
                      HSD: {coupon.expiryDate} {coupon.daysRemaining ? `(Còn ${coupon.daysRemaining} ngày)` : ''}
                    </span>
                  </div>
                </div>

                <div className={styles.couponActionCol}>
                  <Link href={`/search?voucher=${coupon.code}`} className={styles.useNowBtn}>
                    DÙNG NGAY
                  </Link>
                </div>
              </article>
            ))}

          {activeTab === 'DISCOVER' && (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#8f8f8f' }}>
              <p>Khám phá các ưu đãi đặc quyền từ rạp IMAX, Gold Class và các đối tác ngân hàng.</p>
            </div>
          )}

          {activeTab === 'EXPIRED' && (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#8f8f8f' }}>
              <p>Không có voucher nào đã hết hạn hoặc đã sử dụng.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

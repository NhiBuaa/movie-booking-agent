'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Phone,
  Mail,
  Bot,
  HelpCircle,
  FileText,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import styles from '../styles/help.module.css';

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'Hoàn vé & Giao dịch',
    question: 'Quy chế hủy vé và hoàn tiền tự động được áp dụng như thế nào?',
    answer:
      'Quý khách có thể yêu cầu hủy vé trực tuyến tại mục "Vé của tôi" tối thiểu 60 phút trước giờ chiếu ghi trên vé. Tiền sẽ được hoàn trả 100% giá trị vé về tài khoản nguồn (Ví điện tử MoMo/ZaloPay trong 15 phút, thẻ ngân hàng trong 1–3 ngày làm việc). Vé đã qua giờ chiếu hoặc vé ưu đãi đặc biệt không áp dụng hoàn trả.',
  },
  {
    id: 'faq-2',
    category: 'Hoàn vé & Giao dịch',
    question: 'Tài khoản ngân hàng đã trừ tiền nhưng giao dịch báo thất bại hoặc chưa có vé?',
    answer:
      'Đừng lo lắng, hệ thống Cinora Core tự động đối soát giao dịch trong vòng 15–30 phút. Quý khách vui lòng truy cập trang "Tra soát đối soát giao dịch" hoặc cung cấp mã giao dịch (FT Code) cho nhân viên CSKH qua hotline 1900 6017 để được cấp vé tức thì hoặc hoàn tiền tự động.',
  },
  {
    id: 'faq-3',
    category: 'Rạp & Độ tuổi',
    question: 'Quy định phân loại độ tuổi xem phim (T13, T16, T18) tại rạp chiếu?',
    answer:
      'Theo Thông tư của Bộ Văn hóa, Thể thao và Du lịch: Phim T18 dành cho khán giả từ đủ 18 tuổi trở lên; T16 dành cho khán giả từ đủ 16 tuổi trở lên; T13 từ đủ 13 tuổi trở lên; P là phim phổ biến mọi lứa tuổi. Nhân viên soát vé có quyền kiểm tra CCCD hoặc giấy tờ tùy thân có ảnh trước khi vào phòng chiếu.',
  },
  {
    id: 'faq-4',
    category: 'Thành viên & Ưu đãi',
    question: 'Chính sách giá vé ưu đãi U22 (Học sinh - Sinh viên) áp dụng ra sao?',
    answer:
      'Thành viên CineMember từ 22 tuổi trở xuống được áp dụng mức giá đồng giá 55.000đ (2D Standard) từ thứ Hai đến thứ Sáu tại tất cả cụm rạp đối tác. Quý khách chỉ cần cập nhật ngày sinh tại mục Hồ sơ cá nhân và xuất trình thẻ HSSV/CCCD khi nhận vé.',
  },
  {
    id: 'faq-5',
    category: 'Bắp nước & Dịch vụ',
    question: 'Cách nhận bắp nước combo F&B đã mua trực tuyến tại rầy rạp?',
    answer:
      'Sau khi đặt vé kèm combo bắp nước thành công, mã QR vé điện tử của bạn sẽ tích hợp phần thông tin F&B. Bạn chỉ cần đưa mã QR tại quầy Concessions riêng dành cho khách hàng đặt trước (Fast-Track Pickup) để nhận bắp nước ngay mà không cần xếp hàng mua vé.',
  },
  {
    id: 'faq-6',
    category: 'Trợ lý AI',
    question: 'Trợ lý Buaa AI có thể giúp tôi những gì trong quá trình đặt vé?',
    answer:
      'Buaa AI hỗ trợ gợi ý phim theo tâm trạng, tìm rạp gần bạn nhất, kiểm tra suất chiếu IMAX/ScreenX còn ghế đẹp, áp mã giảm giá tối ưu nhất và hoàn tất toàn bộ quy trình đặt vé trực tiếp trong khung trò chuyện bằng ngôn ngữ tự nhiên.',
  },
];

export const HelpCenterView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({ 'faq-1': true });

  const toggleFaq = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return FAQ_DATA;
    const q = searchQuery.toLowerCase();
    return FAQ_DATA.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.navRow}>
          <Link href="/" className={styles.backBtn} title="Quay lại trang chủ">
            <ArrowLeft size={14} aria-hidden="true" />
            <span>TRANG CHỦ</span>
          </Link>
          <span className={styles.breadcrumbText}>TRỢ GIÚP & HỎI ĐÁP (FAQ)</span>
        </div>

        <section className={styles.helpHero}>
          <h1 className={styles.helpTitle}>TRUNG TÂM TRỢ GIÚP CINORA</h1>
          <p className={styles.helpSubtitle}>
            Giải đáp mọi thắc mắc về quy chế đặt vé, hoàn tiền tự động, đối soát giao dịch và chính sách ưu đãi thành viên.
          </p>

          <div className={styles.searchBoxWrapper}>
            <Search size={18} className={styles.searchIcon} aria-hidden="true" />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Tìm kiếm câu hỏi, chính sách hoàn vé, quy định độ tuổi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Tìm kiếm câu hỏi trợ giúp"
            />
          </div>
        </section>

        <section className={styles.faqSection} aria-label="Danh sách câu hỏi thường gặp">
          <h2 className={styles.faqHeading}>CÂU HỎI THƯỜNG GẶP</h2>

          <div className={styles.faqList}>
            {filteredFaqs.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#8f8f8f' }}>
                <HelpCircle size={32} style={{ margin: '0 auto 12px', display: 'block' }} />
                <p>Không tìm thấy câu hỏi phù hợp với từ khóa &ldquo;{searchQuery}&rdquo;.</p>
                <p style={{ marginTop: '8px', fontSize: '13px' }}>
                  Vui lòng thử từ khóa khác hoặc liên hệ hotline 1900 6017 để được hỗ trợ tức thì.
                </p>
              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const isOpen = !!openIds[faq.id];
                return (
                  <div
                    key={faq.id}
                    className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ''}`}
                  >
                    <button
                      type="button"
                      className={styles.faqQuestionBtn}
                      onClick={() => toggleFaq(faq.id)}
                      aria-expanded={isOpen}
                    >
                      <span>{faq.question}</span>
                      {isOpen ? (
                        <ChevronUp size={18} color="#da291c" aria-hidden="true" />
                      ) : (
                        <ChevronDown size={18} color="#8f8f8f" aria-hidden="true" />
                      )}
                    </button>
                    {isOpen && <div className={styles.faqAnswer}>{faq.answer}</div>}
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className={styles.contactBanner} aria-label="Kênh hỗ trợ trực tiếp">
          <div>
            <h3 className={styles.contactTitle}>CẦN HỖ TRỢ TRỰC TIẾP TỨC THÌ?</h3>
            <p className={styles.contactDesc}>
              Đội ngũ chăm sóc khách hàng và trợ lý Buaa AI hoạt động 24/7 để hỗ trợ bạn.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/chat" className={styles.hotlineBtn} style={{ backgroundColor: '#181818', color: '#ffffff', border: '1px solid #303030' }}>
              <Bot size={16} color="#da291c" aria-hidden="true" />
              <span>CHAT VỚI BUAA AI</span>
            </Link>
            <a href="tel:19006017" className={styles.hotlineBtn}>
              <Phone size={16} aria-hidden="true" />
              <span>GỌI HOTLINE 1900 6017</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

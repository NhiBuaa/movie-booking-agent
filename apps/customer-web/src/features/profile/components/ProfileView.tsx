'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User,
  Crown,
  Gift,
  Bell,
  HelpCircle,
  CheckCircle2,
  Key,
  ShieldCheck,
  RefreshCw,
  Bot,
  ArrowRight,
  X,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import {
  DEFAULT_PERSONAL_INFO,
  DEFAULT_CINE_PREFERENCES,
  CINEMA_OPTIONS,
  GENRE_OPTIONS,
  SHOWTIME_SLOT_OPTIONS,
  FORMAT_OPTIONS,
  SEAT_POSITION_OPTIONS,
  type PersonalInfoState,
  type CinePreferencesState,
} from '../model/profile-types.ts';
import styles from '../styles/profile.module.css';

export const ProfileView: React.FC = () => {
  // Form states
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoState>(DEFAULT_PERSONAL_INFO);
  const [cinePrefs, setCinePrefs] = useState<CinePreferencesState>(DEFAULT_CINE_PREFERENCES);

  // UI interaction states
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Handle Personal Info Update
  const handleSavePersonalInfo = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Đã lưu thông tin cá nhân & bảo mật thành công!');
  };

  // Toggle Genre
  const toggleGenre = (genreId: string) => {
    setCinePrefs((prev) => {
      const exists = prev.preferredGenres.includes(genreId);
      const updated = exists
        ? prev.preferredGenres.filter((id) => id !== genreId)
        : [...prev.preferredGenres, genreId];
      return { ...prev, preferredGenres: updated };
    });
  };

  // Toggle Showtime Slot
  const toggleShowtimeSlot = (slotId: string) => {
    setCinePrefs((prev) => {
      const exists = prev.preferredShowtimeSlots.includes(slotId);
      const updated = exists
        ? prev.preferredShowtimeSlots.filter((id) => id !== slotId)
        : [...prev.preferredShowtimeSlots, slotId];
      return { ...prev, preferredShowtimeSlots: updated };
    });
  };

  // Toggle Format
  const toggleFormat = (formatId: string) => {
    setCinePrefs((prev) => {
      const exists = prev.preferredFormats.includes(formatId);
      const updated = exists
        ? prev.preferredFormats.filter((id) => id !== formatId)
        : [...prev.preferredFormats, formatId];
      return { ...prev, preferredFormats: updated };
    });
  };

  // Save CinePreferences
  const handleSaveCinePreferences = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      showToast('Đã lưu CinePreferences & đồng bộ thành công với Buaa AI!');
    }, 400);
  };

  // Restore Default CinePreferences
  const handleRestoreDefault = () => {
    setCinePrefs(DEFAULT_CINE_PREFERENCES);
    showToast('Đã khôi phục CinePreferences về thiết lập mặc định!');
  };

  // Password Modal Submit
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPasswordModalOpen(false);
    setOldPassword('');
    setNewPassword('');
    showToast('Đã cập nhật mật khẩu mới thành công!');
  };

  return (
    <div className={styles.pageWrapper} data-testid="s27-profile-view">
      <div className={styles.container}>
        {/* ================= 02 / Title & Breadcrumb ================= */}
        <section className={styles.titleSection} aria-label="Page Header">
          <div className={styles.titleRow}>
            <h1 className={styles.pageTitle}>HỒ SƠ CÁ NHÂN &amp; CINEPREFERENCES</h1>
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <Link href="/" className={styles.breadcrumbLink}>Trang chủ</Link>
              <span>›</span>
              <span className={styles.breadcrumbLink}>Tài khoản</span>
              <span>›</span>
              <span className={styles.breadcrumbActive}>Hồ sơ &amp; Sở thích cá nhân</span>
            </nav>
          </div>
          <p className={styles.pageSubtitle}>
            Quản lý thông tin tài khoản hội viên và thiết lập CinePreferences để Buaa AI tối ưu gợi ý suất chiếu &amp; trải nghiệm đặt vé.
          </p>
        </section>

        {/* ================= 03 / Profile overview and shortcuts ================= */}
        <section className={styles.overviewCard} aria-label="Tổng quan tài khoản">
          <div className={styles.overviewLeft}>
            <div className={styles.avatarSquare} aria-hidden="true">
              <User size={38} color="#ffffff" />
            </div>

            <div className={styles.identityMeta}>
              <h2 className={styles.profileName}>{personalInfo.fullName} (Nhi Buaa)</h2>
              <p className={styles.contactLine}>
                {personalInfo.email} · {personalInfo.phone}
              </p>
              <div className={styles.membershipLine}>
                <span className={styles.vipBadge}>
                  <Crown size={12} color="#d4af37" aria-hidden="true" />
                  <span>CineGold VIP</span>
                </span>
                <p className={styles.memberCodePoints}>
                  Mã HV: CINORA-GOLD-88991 · <strong>1.250 Điểm CinePoints</strong>
                </p>
              </div>
            </div>
          </div>

          <div className={styles.shortcutsGrid} role="navigation" aria-label="Lối tắt tài khoản">
            <Link
              href="/membership"
              className={styles.shortcutBtn}
              title="Xem thẻ hội viên và đổi quà"
              data-testid="shortcut-membership"
            >
              <div className={styles.shortcutLabelGroup}>
                <Crown size={14} color="#d4af37" aria-hidden="true" />
                <span>Hội viên CineMember &amp; Đổi Quà</span>
              </div>
              <ChevronRight size={14} color="#8F8F8F" aria-hidden="true" />
            </Link>

            <Link
              href="/vouchers"
              className={styles.shortcutBtn}
              title="Xem ví voucher và mã giảm giá"
              data-testid="shortcut-vouchers"
            >
              <div className={styles.shortcutLabelGroup}>
                <Gift size={14} color="#ffffff" aria-hidden="true" />
                <span>Ví Voucher &amp; Ưu đãi độc quyền</span>
              </div>
              <ChevronRight size={14} color="#8F8F8F" aria-hidden="true" />
            </Link>

            <Link
              href="/notifications"
              className={styles.shortcutBtn}
              title="Xem thông báo hệ thống"
              data-testid="shortcut-notifications"
            >
              <div className={styles.shortcutLabelGroup}>
                <Bell size={14} color="#ffffff" aria-hidden="true" />
                <span>Thông báo &amp; Cảnh báo suất chiếu</span>
              </div>
              <ChevronRight size={14} color="#8F8F8F" aria-hidden="true" />
            </Link>

            <Link
              href="/help"
              className={styles.shortcutBtn}
              title="Trung tâm hỗ trợ và giải đáp"
              data-testid="shortcut-help"
            >
              <div className={styles.shortcutLabelGroup}>
                <HelpCircle size={14} color="#ffffff" aria-hidden="true" />
                <span>Trung tâm trợ giúp &amp; CSKH</span>
              </div>
              <ChevronRight size={14} color="#8F8F8F" aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* ================= Main 2-Column Section (04 & 05) ================= */}
        <div className={styles.mainGrid}>
          {/* ================= 04 / Personal information and security ================= */}
          <form
            className={styles.personalColumn}
            onSubmit={handleSavePersonalInfo}
            aria-label="Thông tin cá nhân & Bảo mật"
            data-testid="personal-info-form"
          >
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionHeading}>THÔNG TIN CÁ NHÂN &amp; BẢO MẬT</h2>
              <p className={styles.sectionDesc}>Cập nhật thông tin định danh và bảo mật tài khoản.</p>
            </div>

            {/* Field: Full Name */}
            <div className={styles.fieldGroup}>
              <label htmlFor="fullName" className={styles.fieldLabel}>HỌ VÀ TÊN</label>
              <input
                id="fullName"
                type="text"
                value={personalInfo.fullName}
                onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                className={styles.inputControl}
                required
              />
            </div>

            {/* Field: Phone with Verified Badge */}
            <div className={styles.fieldGroup}>
              <label htmlFor="phone" className={styles.fieldLabel}>SỐ ĐIỆN THOẠI</label>
              <div className={styles.phoneRow}>
                <input
                  id="phone"
                  type="tel"
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                  className={styles.inputControl}
                  required
                />
                <span className={styles.verifiedBadge}>
                  <CheckCircle2 size={12} aria-hidden="true" />
                  <span>Đã xác thực</span>
                </span>
              </div>
            </div>

            {/* Field: Email */}
            <div className={styles.fieldGroup}>
              <label htmlFor="email" className={styles.fieldLabel}>ĐỊA CHỈ EMAIL</label>
              <input
                id="email"
                type="email"
                value={personalInfo.email}
                onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                className={styles.inputControl}
                required
              />
            </div>

            {/* Field: Date of Birth */}
            <div className={styles.fieldGroup}>
              <label htmlFor="dob" className={styles.fieldLabel}>NGÀY SINH</label>
              <input
                id="dob"
                type="text"
                value={personalInfo.dateOfBirth}
                onChange={(e) => setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value })}
                className={styles.inputControl}
                placeholder="DD/MM/YYYY"
              />
            </div>

            {/* Field: Gender */}
            <div className={styles.fieldGroup}>
              <span className={styles.fieldLabel}>GIỚI TÍNH</span>
              <div className={styles.radioGroupRow} role="radiogroup" aria-label="Giới tính">
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={personalInfo.gender === 'male'}
                    onChange={() => setPersonalInfo({ ...personalInfo, gender: 'male' })}
                    className={styles.radioInput}
                  />
                  <span>Nam</span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={personalInfo.gender === 'female'}
                    onChange={() => setPersonalInfo({ ...personalInfo, gender: 'female' })}
                    className={styles.radioInput}
                  />
                  <span>Nữ</span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="gender"
                    value="other"
                    checked={personalInfo.gender === 'other'}
                    onChange={() => setPersonalInfo({ ...personalInfo, gender: 'other' })}
                    className={styles.radioInput}
                  />
                  <span>Khác</span>
                </label>
              </div>
            </div>

            {/* Security Sub-section */}
            <div className={styles.securitySubSection}>
              <h3 className={styles.securityHeading}>BẢO MẬT TÀI KHOẢN</h3>
              <p className={styles.securityStatusText}>
                Mật khẩu đã đổi {personalInfo.passwordLastChangedDays} ngày trước.
              </p>

              <button
                type="button"
                className={styles.changePasswordBtn}
                onClick={() => setIsPasswordModalOpen(true)}
                data-testid="open-password-modal-btn"
              >
                <Key size={13} aria-hidden="true" />
                <span>ĐỔI MẬT KHẨU</span>
              </button>

              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={personalInfo.twoFactorAuth}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, twoFactorAuth: e.target.checked })}
                  className={styles.checkboxInput}
                />
                <span>Xác thực 2 bước khi thanh toán vé (2FA OTP)</span>
              </label>

              <button
                type="button"
                className={styles.logoutBtn}
                onClick={() => showToast('Bạn đã đăng xuất khỏi thiết bị này an toàn.')}
              >
                <LogOut size={13} style={{ display: 'inline', marginRight: 6 }} aria-hidden="true" />
                <span>ĐĂNG XUẤT THIẾT BỊ NÀY</span>
              </button>
            </div>

            <button
              type="submit"
              className={styles.savePersonalBtn}
              data-testid="save-personal-info-btn"
            >
              LƯU THÔNG TIN CÁ NHÂN
            </button>
          </form>

          {/* ================= 05 / CinePreferences for Buaa AI ================= */}
          <section
            className={styles.preferencesColumn}
            aria-label="CinePreferences cho Buaa AI"
            data-testid="cine-preferences-section"
          >
            <div className={styles.prefHeaderRow}>
              <div>
                <h2 className={styles.sectionHeading}>CINEPREFERENCES — THIẾT LẬP CHO TRỢ LÝ BUAA AI</h2>
                <p className={styles.sectionDesc}>
                  Buaa AI dùng thiết lập bên dưới làm ngữ cảnh để tự động ưu tiên suất chiếu, rạp và chỗ ngồi phù hợp nhất.
                </p>
              </div>
              <span className={styles.aiBadge}>
                <Bot size={13} aria-hidden="true" />
                <span>AI CONTEXT ENABLED</span>
              </span>
            </div>

            {/* Group 1: Default Cinema */}
            <div className={styles.prefGroup}>
              <h3 className={styles.prefGroupHeading}>1. Cụm rạp mặc định ưu tiên (Thường đến nhất)</h3>
              <select
                value={cinePrefs.defaultCinemaId}
                onChange={(e) => setCinePrefs({ ...cinePrefs, defaultCinemaId: e.target.value })}
                className={styles.cinemaSelect}
                aria-label="Chọn cụm rạp ưu tiên mặc định"
              >
                {CINEMA_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <label className={styles.checkboxRow} style={{ marginTop: 6 }}>
                <input
                  type="checkbox"
                  checked={cinePrefs.autoPreferredCinema}
                  onChange={(e) => setCinePrefs({ ...cinePrefs, autoPreferredCinema: e.target.checked })}
                  className={styles.checkboxInput}
                />
                <span>Tự động chọn cụm rạp này khi tôi nhắn &quot;Tìm suất chiếu gần tôi&quot;</span>
              </label>
            </div>

            {/* Group 2: Preferred Genres */}
            <div className={styles.prefGroup}>
              <h3 className={styles.prefGroupHeading}>
                2. Thể loại phim ưa chuộng (Buaa sẽ ưu tiên gợi ý khi tìm kiếm)
              </h3>
              <div className={styles.checkboxGrid4}>
                {GENRE_OPTIONS.map((genre) => {
                  const isChecked = cinePrefs.preferredGenres.includes(genre.id);
                  return (
                    <div
                      key={genre.id}
                      className={`${styles.prefCheckboxCard} ${isChecked ? styles.prefCheckboxCardSelected : ''}`}
                      onClick={() => toggleGenre(genre.id)}
                      role="checkbox"
                      aria-checked={isChecked}
                      tabIndex={0}
                      onKeyDown={(e) => e.key === ' ' && toggleGenre(genre.id)}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className={styles.checkboxInput}
                        tabIndex={-1}
                      />
                      <span>{genre.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Group 3: Preferred Showtime Slots */}
            <div className={styles.prefGroup}>
              <h3 className={styles.prefGroupHeading}>3. Khung giờ xem phim thường chọn</h3>
              <div className={styles.checkboxGrid4}>
                {SHOWTIME_SLOT_OPTIONS.map((slot) => {
                  const isChecked = cinePrefs.preferredShowtimeSlots.includes(slot.id);
                  return (
                    <div
                      key={slot.id}
                      className={`${styles.prefCheckboxCard} ${isChecked ? styles.prefCheckboxCardSelected : ''}`}
                      onClick={() => toggleShowtimeSlot(slot.id)}
                      role="checkbox"
                      aria-checked={isChecked}
                      tabIndex={0}
                      onKeyDown={(e) => e.key === ' ' && toggleShowtimeSlot(slot.id)}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className={styles.checkboxInput}
                        tabIndex={-1}
                      />
                      <span>{slot.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Group 4: Formats & Seat Habit */}
            <div className={styles.prefGroup}>
              <h3 className={styles.prefGroupHeading}>
                4. Định dạng phòng chiếu &amp; Thói quen vị trí ngồi
              </h3>
              <div className={styles.checkboxGrid4}>
                {FORMAT_OPTIONS.map((fmt) => {
                  const isChecked = cinePrefs.preferredFormats.includes(fmt.id);
                  return (
                    <div
                      key={fmt.id}
                      className={`${styles.prefCheckboxCard} ${isChecked ? styles.prefCheckboxCardSelected : ''}`}
                      onClick={() => toggleFormat(fmt.id)}
                      role="checkbox"
                      aria-checked={isChecked}
                      tabIndex={0}
                      onKeyDown={(e) => e.key === ' ' && toggleFormat(fmt.id)}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className={styles.checkboxInput}
                        tabIndex={-1}
                      />
                      <span>{fmt.label}</span>
                    </div>
                  );
                })}
              </div>

              <div className={styles.prefRadioGrid3} role="radiogroup" aria-label="Thói quen vị trí ngồi">
                {SEAT_POSITION_OPTIONS.map((pos) => {
                  const isSelected = cinePrefs.preferredSeatPosition === pos.id;
                  return (
                    <div
                      key={pos.id}
                      className={`${styles.prefRadioCard} ${isSelected ? styles.prefRadioCardSelected : ''}`}
                      onClick={() => setCinePrefs({ ...cinePrefs, preferredSeatPosition: pos.id as any })}
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onKeyDown={(e) => e.key === ' ' && setCinePrefs({ ...cinePrefs, preferredSeatPosition: pos.id as any })}
                    >
                      <input
                        type="radio"
                        name="seatPosition"
                        checked={isSelected}
                        onChange={() => {}}
                        className={styles.radioInput}
                        tabIndex={-1}
                      />
                      <span>{pos.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Group 5: AI Privacy & Learning */}
            <div className={styles.prefGroup}>
              <h3 className={styles.prefGroupHeading}>5. Dữ liệu hội thoại &amp; Học máy</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={cinePrefs.learnFromTicketHistory}
                    onChange={(e) => setCinePrefs({ ...cinePrefs, learnFromTicketHistory: e.target.checked })}
                    className={styles.checkboxInput}
                  />
                  <span>Cho phép Buaa AI ghi nhớ lịch sử đặt vé để học thói quen chọn phim</span>
                </label>
                <label className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={cinePrefs.showtimeReminders}
                    onChange={(e) => setCinePrefs({ ...cinePrefs, showtimeReminders: e.target.checked })}
                    className={styles.checkboxInput}
                  />
                  <span>Nhận thông báo nhắc giờ chiếu trước 60 phút qua AI chat &amp; SMS</span>
                </label>
              </div>
            </div>

            {/* Sync status bar */}
            <div className={styles.syncStatusBar}>
              <RefreshCw
                size={14}
                color="#da291c"
                className={isSyncing ? 'spin' : ''}
                aria-hidden="true"
              />
              <span>Đã đồng bộ ngữ cảnh với Buaa AI · Phiên bản Profile V2.4 ({cinePrefs.lastSyncedTimestamp})</span>
            </div>

            {/* Action Row */}
            <div className={styles.prefActionsRow}>
              <button
                type="button"
                className={styles.restoreDefaultBtn}
                onClick={handleRestoreDefault}
                data-testid="restore-default-prefs-btn"
              >
                KHÔI PHỤC MẶC ĐỊNH
              </button>

              <button
                type="button"
                className={styles.saveCinePrefBtn}
                onClick={handleSaveCinePreferences}
                data-testid="save-cine-prefs-btn"
              >
                LƯU CINEPREFERENCES
              </button>

              <Link
                href="/chat"
                className={styles.talkToBuaaBtn}
                title="Mở Buaa AI Chat Workspace"
                data-testid="talk-to-buaa-cta"
              >
                <Bot size={15} color="#ffffff" aria-hidden="true" />
                <span>TRÒ CHUYỆN VỚI BUAA AI</span>
                <ArrowRight size={13} color="#ffffff" aria-hidden="true" />
              </Link>
            </div>
          </section>
        </div>
      </div>

      {/* ================= Toast Notification ================= */}
      {toastMessage && (
        <div className={styles.toast} role="status" aria-live="polite">
          <CheckCircle2 size={16} color="#da291c" aria-hidden="true" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================= Password Change Modal ================= */}
      {isPasswordModalOpen && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setIsPasswordModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Cửa sổ đổi mật khẩu"
        >
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>ĐỔI MẬT KHẨU TÀI KHOẢN</h3>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setIsPasswordModalOpen(false)}
                aria-label="Đóng"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>MẬT KHẨU HIỆN TẠI</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className={styles.inputControl}
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>MẬT KHẨU MỚI</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={styles.inputControl}
                  minLength={8}
                  required
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.modalCancelBtn}
                  onClick={() => setIsPasswordModalOpen(false)}
                >
                  HỦY
                </button>
                <button type="submit" className={styles.modalSubmitBtn}>
                  CẬP NHẬT MẬT KHẨU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Phone,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { SubNavHeader } from './SubNavHeader';
import { calculatePasswordStrength, maskIdentifier } from '../model/auth-state';
import styles from '../styles/auth.module.css';

type RecoveryStep = 1 | 2 | 3 | 4;

export const ForgotPasswordView: React.FC = () => {
  const router = useRouter();
  const [step, setStep] = useState<RecoveryStep>(1);

  // Step 1: Identifier
  const [identifier, setIdentifier] = useState('0908 123 890');
  const [isSubmittingIdentifier, setIsSubmittingIdentifier] = useState(false);

  // Step 2: OTP (6 digits)
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(105); // 01:45
  const [resendCooldown, setResendCooldown] = useState(45);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Step 3: New Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Password strength & match
  const strength = calculatePasswordStrength(newPassword);
  const passwordsMatch = newPassword && confirmNewPassword && newPassword === confirmNewPassword;

  // Countdown timer for OTP
  useEffect(() => {
    if (step !== 2) return;
    const interval = setInterval(() => {
      setOtpSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Step 1 Submit
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingIdentifier(true);
    setTimeout(() => {
      setIsSubmittingIdentifier(false);
      setStep(2);
      setOtpSecondsLeft(105);
      setResendCooldown(45);
    }, 500);
  };

  // OTP Box Change
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-advance
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().slice(0, 6);
    if (/^\d+$/.test(pasted)) {
      const digits = pasted.split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtp(newOtp);
      otpInputRefs.current[Math.min(digits.length, 5)]?.focus();
    }
  };

  // Step 2 Submit
  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      alert('Vui lòng nhập đủ 6 chữ số mã OTP xác thực!');
      return;
    }
    setIsVerifyingOtp(true);
    setTimeout(() => {
      setIsVerifyingOtp(false);
      setStep(3);
    }, 500);
  };

  // Step 3 Submit
  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordsMatch) {
      alert('Mật khẩu mới và xác nhận mật khẩu chưa trùng khớp!');
      return;
    }
    setIsSavingPassword(true);
    setTimeout(() => {
      setIsSavingPassword(false);
      setStep(4);
    }, 600);
  };

  const breadcrumbText =
    step === 1
      ? 'Khôi phục mật khẩu (Bước 1: Nhập thông tin)'
      : step === 2
      ? 'Xác thực danh tính (Bước 2: Nhập OTP)'
      : step === 3
      ? 'Thiết lập mật khẩu mới (Bước 3: Hoàn tất)'
      : 'Khôi phục thành công';

  return (
    <div className={styles.pageWrapper}>
      {/* 01 / Subnav Bar */}
      <SubNavHeader
        backHref="/auth/login"
        backLabel={step === 1 ? 'Quay lại Đăng nhập' : '← Hủy bỏ & Quay lại'}
        breadcrumbCurrent={breadcrumbText}
      />

      {/* 02 / Main Content */}
      <main className={styles.mainContainer}>
        <div className={styles.doubleStageLayout}>
          {/* Cột trái: Stepper tiến trình & Hướng dẫn bảo mật */}
          <div className={styles.stageLeft}>
            {/* 01 / Landscape Backdrop Banner (Đồng bộ Figma S31) */}
            <div className={styles.landscapeBanner}>
              <img
                src="/images/artworks/backdrop_chuyen_tau_cuoi_he.png"
                alt="Chuyến Tàu Cuối Hè"
                className={styles.bannerImg}
              />
              <div className={styles.bannerOverlay}>
                <h4 className={styles.bannerTitle}>
                  Chuyến Tàu Cuối Hè — Định dạng IMAX Laser tại CGV Vincom Đồng Khởi
                </h4>
                <p className={styles.bannerMeta}>
                  Tác phẩm điện ảnh được yêu thích nhất tuần · Đã xác thực 12.450 lượt vé
                </p>
              </div>
            </div>

            {/* 02 / Hero Pitch */}
            <div className={styles.heroPitchCol}>
              <h2 className={styles.leftHeroTitle}>Quy Trình Khôi Phục Mật Khẩu 3 Bước</h2>
              <p className={styles.leftHeroSubtitle}>
                Hệ thống xác minh danh tính đa lớp bảo vệ quyền lợi hội viên CineMember, số dư điểm thưởng CinePoints và vé xem phim điện tử.
              </p>
            </div>

            {/* Stepper (S31-ST05) */}
            <div className={styles.stepper} aria-label="Tiến trình khôi phục">
              <div
                className={`${styles.stepItem} ${
                  step > 1 ? styles.stepItemCompleted : step === 1 ? styles.stepItemActive : ''
                }`}
              >
                <div
                  className={`${styles.stepBadge} ${
                    step > 1 ? styles.stepBadgeCompleted : step === 1 ? styles.stepBadgeActive : ''
                  }`}
                >
                  {step > 1 ? <Check size={14} /> : '1'}
                </div>
                <div className={styles.stepInfoCol}>
                  <span className={styles.stepItemTitle}>Bước 1: Nhập Email hoặc Số điện thoại</span>
                  <span className={styles.stepItemStatus}>
                    {step > 1 ? 'Đã hoàn thành' : 'Đang thực hiện'}
                  </span>
                </div>
              </div>

              <div
                className={`${styles.stepItem} ${
                  step > 2 ? styles.stepItemCompleted : step === 2 ? styles.stepItemActive : ''
                }`}
              >
                <div
                  className={`${styles.stepBadge} ${
                    step > 2 ? styles.stepBadgeCompleted : step === 2 ? styles.stepBadgeActive : ''
                  }`}
                >
                  {step > 2 ? <Check size={14} /> : '2'}
                </div>
                <div className={styles.stepInfoCol}>
                  <span className={styles.stepItemTitle}>Bước 2: Xác thực mã OTP 6 số</span>
                  <span className={styles.stepItemStatus}>
                    {step > 2 ? 'Đã xác minh' : step === 2 ? 'Đang thực hiện' : 'Chưa đến'}
                  </span>
                </div>
              </div>

              <div
                className={`${styles.stepItem} ${
                  step > 3 ? styles.stepItemCompleted : step === 3 ? styles.stepItemActive : ''
                }`}
              >
                <div
                  className={`${styles.stepBadge} ${
                    step > 3 ? styles.stepBadgeCompleted : step === 3 ? styles.stepBadgeActive : ''
                  }`}
                >
                  {step > 3 ? <Check size={14} /> : '3'}
                </div>
                <div className={styles.stepInfoCol}>
                  <span className={styles.stepItemTitle}>Bước 3: Thiết lập mật khẩu mới</span>
                  <span className={styles.stepItemStatus}>
                    {step > 3 ? 'Hoàn tất' : step === 3 ? 'Đang thực hiện' : 'Chưa đến'}
                  </span>
                </div>
              </div>
            </div>

            {/* Hotline support */}
            <div className={styles.supportHotlineBox}>
              <strong>Cần hỗ trợ đổi mật khẩu khẩn cấp?</strong>
              <p style={{ marginTop: 4 }}>
                Hotline Chăm sóc khách hàng <strong>1900 - Cinora (Phím 2)</strong> trực 24/7 để hỗ trợ khôi phục tài khoản khi mất SIM/Email.
              </p>
            </div>

            {/* 04 / Bottom Cinematic Quote */}
            <p className={styles.bottomQuote}>
              “Điện ảnh không chỉ là giải trí, đó là những khoảnh khắc cảm xúc kết nối tâm hồn.”
            </p>
          </div>

          {/* Cột phải: Form tương ứng với từng Step */}
          <div className={styles.stageRight}>
            <div className={styles.authCard}>
              {/* STEP 1: S31-ST03 - Nhập Email hoặc SĐT */}
              {step === 1 && (
                <>
                  <div className={styles.otpCardHeader}>
                    <h1 className={styles.cardTitle}>Khôi Phục Mật Khẩu</h1>
                    <p className={styles.cardSubtitle}>
                      Vui lòng nhập địa chỉ Email hoặc Số điện thoại đã liên kết với tài khoản CineMember của bạn. CinoraAgent sẽ gửi mã OTP gồm 6 chữ số để xác minh quyền sở hữu tài khoản.
                    </p>
                  </div>

                  <form onSubmit={handleStep1Submit} className={styles.form}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="forgot-identifier" className={styles.label}>
                        Email hoặc Số điện thoại đã đăng ký
                      </label>
                      <div className={styles.inputWrapper}>
                        <Mail size={16} className={styles.inputIcon} aria-hidden="true" />
                        <input
                          id="forgot-identifier"
                          type="text"
                          className={styles.inputField}
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="Nhập email hoặc số điện thoại của bạn"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className={styles.submitBtn}
                      disabled={isSubmittingIdentifier}
                    >
                      <span>
                        {isSubmittingIdentifier ? 'ĐANG GỬI MÃ...' : 'GỬI MÃ XÁC THỰC OTP →'}
                      </span>
                    </button>
                  </form>

                  <div className={styles.supportHotlineBox} style={{ marginTop: 24 }}>
                    <strong>Không còn sử dụng Email hoặc Số điện thoại cũ?</strong>
                    <p style={{ marginTop: 4 }}>
                      Vui lòng liên hệ Hotline <strong>1900 - Cinora (Phím 2)</strong> để được chuyên viên hỗ trợ xác minh danh tính và khôi phục trực tiếp.
                    </p>
                  </div>

                  <div className={styles.switchAuthRow}>
                    <Link href="/auth/login" className={styles.forgotLink}>
                      ← Quay lại Đăng nhập
                    </Link>
                  </div>
                </>
              )}

              {/* STEP 2: S31-ST04 - Nhập mã OTP 6 số */}
              {step === 2 && (
                <>
                  <div className={styles.otpCardHeader}>
                    <span className={styles.stepBadgePill}>Bước 2 / 3 — Xác thực OTP</span>
                    <h1 className={styles.cardTitle}>Xác Thực Mã OTP</h1>
                    <p className={styles.cardSubtitle}>
                      Mã xác thực gồm 6 chữ số đã được gửi tới số/email{' '}
                      <strong>{maskIdentifier(identifier)}</strong>. Vui lòng kiểm tra tin nhắn và nhập mã xác thực bên dưới.
                    </p>
                  </div>

                  <form onSubmit={handleStep2Submit} className={styles.form}>
                    {/* 6 Segmented Input Boxes */}
                    <div className={styles.otpGrid}>
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => {
                            otpInputRefs.current[idx] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          className={styles.otpBox}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          onPaste={idx === 0 ? handleOtpPaste : undefined}
                          autoFocus={idx === 0}
                          aria-label={`Ký tự OTP thứ ${idx + 1}`}
                        />
                      ))}
                    </div>

                    {/* Timer row */}
                    <div className={styles.timerRow}>
                      <span className={styles.timerBadge}>
                        <Clock size={14} aria-hidden="true" />
                        <span>Mã có hiệu lực: {formatTimer(otpSecondsLeft)}</span>
                      </span>

                      {resendCooldown > 0 ? (
                        <span className={styles.resendBtnDisabled}>
                          Gửi lại mã ({resendCooldown}s)
                        </span>
                      ) : (
                        <button
                          type="button"
                          className={styles.resendBtn}
                          onClick={() => {
                            setOtpSecondsLeft(105);
                            setResendCooldown(45);
                            alert('Đã gửi lại mã OTP mới!');
                          }}
                        >
                          Gửi lại mã OTP
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      className={styles.submitBtn}
                      disabled={isVerifyingOtp}
                    >
                      <span>
                        {isVerifyingOtp ? 'ĐANG XÁC THỰC...' : 'XÁC THỰC MÃ OTP & TIẾP TỤC →'}
                      </span>
                    </button>
                  </form>

                  <div className={styles.guestRecoveryBox}>
                    <button
                      type="button"
                      className={styles.guestBtn}
                      onClick={() => setStep(1)}
                    >
                      <span>Thay đổi thông tin nhận mã</span>
                    </button>
                    <Link
                      href="/showtimes/st-3/seats?cinema=Cinora%20Landmark%2081&movie=Chuy%E1%BA%BFn%20T%C3%A0u%20Cu%E1%BB%91i%20H%C3%A8"
                      className={styles.forgotLink}
                      style={{ fontSize: 11, textAlign: 'center', marginTop: 4 }}
                    >
                      Bỏ qua bước này và tiếp tục đặt vé với tư cách Khách
                    </Link>
                  </div>
                </>
              )}

              {/* STEP 3: S31-ST05 - Thiết lập mật khẩu mới */}
              {step === 3 && (
                <>
                  <div className={styles.otpCardHeader}>
                    <span className={styles.stepBadgePill}>
                      Bước 3 / 3 — Hoàn tất khôi phục
                    </span>
                    <h1 className={styles.cardTitle}>Thiết Lập Mật Khẩu Mới</h1>
                    <p className={styles.cardSubtitle}>
                      Xác thực danh tính thành công. Vui lòng nhập mật khẩu mới bảo mật cho tài khoản CineMember của bạn.
                    </p>
                  </div>

                  <form onSubmit={handleStep3Submit} className={styles.form}>
                    {/* Field 1: Mật khẩu mới */}
                    <div className={styles.inputGroup}>
                      <div className={styles.inputLabelRow}>
                        <label htmlFor="new-password" className={styles.label}>
                          Mật khẩu mới
                        </label>
                        {newPassword && (
                          <span style={{ fontSize: 11, color: strength.color, fontWeight: 700 }}>
                            {strength.label}
                          </span>
                        )}
                      </div>
                      <div className={styles.inputWrapper}>
                        <Lock size={16} className={styles.inputIcon} aria-hidden="true" />
                        <input
                          id="new-password"
                          type={showNewPassword ? 'text' : 'password'}
                          className={styles.inputField}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          className={styles.eyeBtn}
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          aria-label={showNewPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>

                      {/* Password Strength Meter */}
                      {newPassword && (
                        <div className={styles.strengthMeter}>
                          <div className={styles.strengthBars}>
                            <div
                              className={styles.strengthBar}
                              style={{ backgroundColor: strength.score >= 1 ? strength.color : undefined }}
                            />
                            <div
                              className={styles.strengthBar}
                              style={{ backgroundColor: strength.score >= 2 ? strength.color : undefined }}
                            />
                            <div
                              className={styles.strengthBar}
                              style={{ backgroundColor: strength.score >= 3 ? strength.color : undefined }}
                            />
                          </div>
                          <span className={styles.strengthText}>{strength.description}</span>
                        </div>
                      )}
                    </div>

                    {/* Field 2: Xác nhận mật khẩu mới */}
                    <div className={styles.inputGroup}>
                      <label htmlFor="confirm-new-password" className={styles.label}>
                        Xác nhận mật khẩu mới
                      </label>
                      <div className={styles.inputWrapper}>
                        <Lock size={16} className={styles.inputIcon} aria-hidden="true" />
                        <input
                          id="confirm-new-password"
                          type={showConfirmNewPassword ? 'text' : 'password'}
                          className={styles.inputField}
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="Nhập lại mật khẩu mới để đối khớp"
                          required
                        />
                        <button
                          type="button"
                          className={styles.eyeBtn}
                          onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                          aria-label={showConfirmNewPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                        >
                          {showConfirmNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {confirmNewPassword && (
                        <div className={styles.matchFeedback}>
                          {passwordsMatch ? (
                            <span className={styles.matchSuccess}>
                              ✓ Mật khẩu xác nhận trùng khớp hoàn toàn
                            </span>
                          ) : (
                            <span className={styles.matchError}>
                              ✕ Mật khẩu chưa trùng khớp
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className={styles.supportHotlineBox} style={{ fontSize: 11 }}>
                      Tài khoản sẽ tự động đăng xuất trên các thiết bị khác sau khi cập nhật mật khẩu mới thành công để đảm bảo an toàn tuyệt đối.
                    </div>

                    <button
                      type="submit"
                      className={styles.submitBtn}
                      disabled={isSavingPassword}
                    >
                      <KeyRound size={16} aria-hidden="true" />
                      <span>
                        {isSavingPassword ? 'ĐANG LƯU MẬT KHẨU...' : 'LƯU MẬT KHẨU MỚI & ĐĂNG NHẬP →'}
                      </span>
                    </button>
                  </form>
                </>
              )}

              {/* STEP 4: SUCCESS STATE */}
              {step === 4 && (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <CheckCircle2
                    size={52}
                    color="#22c55e"
                    style={{ margin: '0 auto 16px', display: 'block' }}
                  />
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>
                    CẬP NHẬT MẬT KHẨU THÀNH CÔNG!
                  </h2>
                  <p style={{ fontSize: 13, color: '#8f8f8f', lineHeight: 1.6, marginBottom: 28 }}>
                    Mật khẩu tài khoản CineMember của bạn đã được cập nhật an toàn trên hệ thống Cinema Core API. Bạn có thể tiến hành đăng nhập ngay bây giờ.
                  </p>

                  <button
                    type="button"
                    className={`${styles.submitBtn} ${styles.submitBtnWhite}`}
                    onClick={() => router.push('/auth/login')}
                  >
                    <span>TIẾN HÀNH ĐĂNG NHẬP NGAY</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Phone, Mail, Lock, Eye, EyeOff, UserPlus, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SubNavHeader } from './SubNavHeader';
import { AuthStageLeft } from './AuthStageLeft';
import { calculatePasswordStrength } from '../model/auth-state';
import styles from '../styles/auth.module.css';

export const RegisterView: React.FC = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const strength = calculatePasswordStrength(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordsMatch) {
      alert('Mật khẩu xác nhận chưa trùng khớp!');
      return;
    }
    if (!agreeTerms) {
      alert('Vui lòng chấp thuận Điều khoản dịch vụ và Chính sách bảo mật!');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      router.push('/profile');
    }, 600);
  };

  const handleGuestContinue = () => {
    router.push('/showtimes/st-3/seats?cinema=Cinora%20Landmark%2081&movie=Chuy%E1%BA%BFn%20T%C3%A0u%20Cu%E1%BB%91i%20H%C3%A8');
  };

  return (
    <div className={styles.pageWrapper}>
      {/* 01 / Subnav Bar */}
      <SubNavHeader
        backHref="/"
        backLabel="Quay lại Khám phá"
        breadcrumbCurrent="Xác thực & Tạo tài khoản mới"
      />

      {/* 02 / Double-Stage Sân khấu kép */}
      <main className={styles.mainContainer}>
        <div className={styles.doubleStageLayout}>
          {/* Cột trái: Cảm hứng điện ảnh & Quyền lợi CineMember */}
          <AuthStageLeft customSubtitle="Đăng ký tài khoản CineMember để đồng bộ lịch sử vé, cá nhân hóa gợi ý cùng trợ lý Buaa AI và tận hưởng những đặc quyền thành viên độc quyền trên toàn hệ thống rạp." />

          {/* Cột phải: Form đăng ký S31-ST02 */}
          <div className={styles.stageRight}>
            <div className={styles.authCard}>
              {/* Segmented Switcher (44px) */}
              <div className={styles.segmentedSwitcher} role="tablist">
                <Link
                  href="/auth/login"
                  className={styles.switcherTab}
                  role="tab"
                  aria-selected="false"
                >
                  Đăng nhập
                </Link>
                <div
                  className={`${styles.switcherTab} ${styles.switcherTabActive}`}
                  role="tab"
                  aria-selected="true"
                >
                  Đăng ký tài khoản
                </div>
              </div>

              {/* Social SSO Buttons */}
              <div className={styles.socialButtonsRow}>
                <button
                  type="button"
                  className={styles.socialBtn}
                  onClick={() => alert('Đăng ký nhanh bằng tài khoản Google')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  className={styles.socialBtn}
                  onClick={() => alert('Đăng ký nhanh bằng tài khoản Apple')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.65-.79 1.1-1.9 1-3-.97.04-2.13.65-2.79 1.42-.58.67-1.1 1.76-.96 2.83 1.08.08 2.15-.55 2.75-1.25z"/>
                  </svg>
                  <span>Apple</span>
                </button>
              </div>

              {/* Divider */}
              <div className={styles.dividerRow}>
                <div className={styles.dividerLine} />
                <span>Hoặc tạo tài khoản bằng Email & Số điện thoại</span>
                <div className={styles.dividerLine} />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className={styles.form}>
                {/* Field 1: Họ và tên */}
                <div className={styles.inputGroup}>
                  <label htmlFor="reg-fullname" className={styles.label}>
                    Họ và tên
                  </label>
                  <div className={styles.inputWrapper}>
                    <User size={16} className={styles.inputIcon} aria-hidden="true" />
                    <input
                      id="reg-fullname"
                      type="text"
                      className={styles.inputField}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nhập họ và tên đầy đủ của bạn"
                      required
                    />
                  </div>
                </div>

                {/* Field 2 & 3: Hàng đôi Số điện thoại & Email */}
                <div className={styles.inputRowTwoCol}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="reg-phone" className={styles.label}>
                      Số điện thoại
                    </label>
                    <div className={styles.inputWrapper}>
                      <Phone size={16} className={styles.inputIcon} aria-hidden="true" />
                      <input
                        id="reg-phone"
                        type="tel"
                        className={styles.inputField}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="VD: 0901234567"
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="reg-email" className={styles.label}>
                      Địa chỉ Email
                    </label>
                    <div className={styles.inputWrapper}>
                      <Mail size={16} className={styles.inputIcon} aria-hidden="true" />
                      <input
                        id="reg-email"
                        type="email"
                        className={styles.inputField}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="VD: name@example.com"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Field 4: Mật khẩu khởi tạo */}
                <div className={styles.inputGroup}>
                  <div className={styles.inputLabelRow}>
                    <label htmlFor="reg-password" className={styles.label}>
                      Mật khẩu khởi tạo
                    </label>
                    {password && (
                      <span style={{ fontSize: 11, color: strength.color, fontWeight: 700 }}>
                        {strength.label}
                      </span>
                    )}
                  </div>
                  <div className={styles.inputWrapper}>
                    <Lock size={16} className={styles.inputIcon} aria-hidden="true" />
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      className={styles.inputField}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu (tối thiểu 8 ký tự)"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {password && (
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

                {/* Field 5: Xác nhận mật khẩu */}
                <div className={styles.inputGroup}>
                  <label htmlFor="reg-confirm-password" className={styles.label}>
                    Xác nhận mật khẩu
                  </label>
                  <div className={styles.inputWrapper}>
                    <Lock size={16} className={styles.inputIcon} aria-hidden="true" />
                    <input
                      id="reg-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={styles.inputField}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu để đối khớp"
                      required
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {confirmPassword && (
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

                {/* Checkbox Terms */}
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    required
                  />
                  <span>
                    Tôi đồng ý với <Link href="/help" className={styles.forgotLink}>Điều khoản dịch vụ</Link> và <Link href="/help" className={styles.forgotLink}>Chính sách bảo mật</Link> của CinoraAgent
                  </span>
                </label>

                {/* Submit CTA */}
                <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                  <UserPlus size={16} aria-hidden="true" />
                  <span>{isLoading ? 'ĐANG KHỞI TẠO TÀI KHOẢN...' : 'TẠO TÀI KHOẢN CINEMEMBER NGAY'}</span>
                </button>
              </form>

              {/* Guest Recovery Box */}
              <div className={styles.guestRecoveryBox}>
                <span className={styles.guestRecoveryTitle}>
                  Bạn đang vội giữ suất chiếu và thanh toán vé?
                </span>
                <button
                  type="button"
                  className={styles.guestBtn}
                  onClick={handleGuestContinue}
                >
                  <span>Tiếp tục với tư cách Khách (Đặt vé nhanh)</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </button>
              </div>

              {/* Switch Auth Row */}
              <div className={styles.switchAuthRow}>
                <span>Đã có tài khoản CineMember?</span>
                <Link href="/auth/login" className={styles.switchAuthLink}>
                  Đăng nhập ngay
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

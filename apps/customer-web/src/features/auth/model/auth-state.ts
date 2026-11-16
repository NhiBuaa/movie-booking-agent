/**
 * S31 Auth State Machine & Validation Utilities
 * Thẩm quyền dữ liệu: Auth Gateway & Cinema Core Identity Registry
 */

export interface PasswordStrength {
  score: 1 | 2 | 3;
  label: 'Yếu' | 'Khá' | 'Mạnh';
  percent: number;
  color: string;
  description: string;
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  if (!password || password.length < 6) {
    return {
      score: 1,
      label: 'Yếu',
      percent: 33,
      color: '#da291c',
      description: 'Mật khẩu quá ngắn (cần tối thiểu 8 ký tự)',
    };
  }

  const hasLetters = /[a-zA-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const isLongEnough = password.length >= 8;

  let score: 1 | 2 | 3 = 1;
  if (isLongEnough && hasLetters && hasNumbers && hasSpecial) {
    score = 3;
  } else if (isLongEnough && ((hasLetters && hasNumbers) || (hasLetters && hasSpecial))) {
    score = 2;
  } else {
    score = 1;
  }

  if (score === 3) {
    return {
      score: 3,
      label: 'Mạnh',
      percent: 100,
      color: '#22c55e',
      description: 'Mật khẩu rất an toàn (bao gồm chữ hoa, chữ thường, số & ký tự đặc biệt)',
    };
  }

  if (score === 2) {
    return {
      score: 2,
      label: 'Khá',
      percent: 66,
      color: '#eab308',
      description: 'Độ mạnh: Khá (gồm chữ cái, số & ký tự đặc biệt)',
    };
  }

  return {
    score: 1,
    label: 'Yếu',
    percent: 33,
    color: '#da291c',
    description: 'Nên thêm chữ số và ký tự đặc biệt để tăng tính bảo mật',
  };
}

export function isValidEmailOrPhone(identifier: string): boolean {
  const trimmed = identifier.trim();
  if (!trimmed) return false;

  // Phone regex (VN phone: 10-11 digits starting with 0 or +84)
  const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
  if (phoneRegex.test(trimmed.replace(/\s+/g, ''))) return true;

  // Email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
}

export function maskIdentifier(identifier: string): string {
  const trimmed = identifier.trim();
  if (trimmed.includes('@')) {
    const [user, domain] = trimmed.split('@');
    if (user.length <= 2) return `${user}••••@${domain}`;
    return `${user.slice(0, 2)}••••${user.slice(-1)}@${domain}`;
  }
  // Phone
  const cleaned = trimmed.replace(/\s+/g, '');
  if (cleaned.length >= 10) {
    return `${cleaned.slice(0, 3)}••••${cleaned.slice(-3)}`;
  }
  return '090••••567';
}

export interface CineMemberProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  tier: 'CineGold VIP' | 'CineMember' | 'CinePlatinum';
  cPoints: number;
}

export const DEFAULT_MOCK_USER: CineMemberProfile = {
  id: 'CINORA-GOLD-88991',
  name: 'Nguyễn Minh An (Nhi Buaa)',
  email: 'nhibuaa@cinora.vn',
  phone: '0908 123 890',
  tier: 'CineGold VIP',
  cPoints: 1250,
};

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePasswordStrength,
  isValidEmailOrPhone,
  maskIdentifier,
  DEFAULT_MOCK_USER,
} from '../src/features/auth/model/auth-state.ts';

describe('S31 Authentication Flow & Logic Tests', () => {
  describe('Password Strength Calculation (calculatePasswordStrength)', () => {
    it('should classify passwords under 6 characters as Yếu', () => {
      const res = calculatePasswordStrength('123');
      assert.strictEqual(res.score, 1);
      assert.strictEqual(res.label, 'Yếu');
      assert.strictEqual(res.percent, 33);
    });

    it('should classify standard alphanumeric passwords as Khá', () => {
      const res = calculatePasswordStrength('cinora2026');
      assert.strictEqual(res.score, 2);
      assert.strictEqual(res.label, 'Khá');
      assert.strictEqual(res.percent, 66);
    });

    it('should classify complex passwords with letters, numbers, and special symbols as Mạnh', () => {
      const res = calculatePasswordStrength('Ferrari#2026@Corsa');
      assert.strictEqual(res.score, 3);
      assert.strictEqual(res.label, 'Mạnh');
      assert.strictEqual(res.percent, 100);
      assert.strictEqual(res.color, '#22c55e');
    });
  });

  describe('Identifier Validation (isValidEmailOrPhone)', () => {
    it('should validate Vietnamese mobile numbers correctly', () => {
      assert.strictEqual(isValidEmailOrPhone('0908123890'), true);
      assert.strictEqual(isValidEmailOrPhone('0901234567'), true);
      assert.strictEqual(isValidEmailOrPhone('+84908123890'), true);
    });

    it('should validate email addresses correctly', () => {
      assert.strictEqual(isValidEmailOrPhone('nhibuaa@cinora.vn'), true);
      assert.strictEqual(isValidEmailOrPhone('user@example.com'), true);
    });

    it('should reject invalid identifiers', () => {
      assert.strictEqual(isValidEmailOrPhone(''), false);
      assert.strictEqual(isValidEmailOrPhone('abc'), false);
      assert.strictEqual(isValidEmailOrPhone('12345'), false);
    });
  });

  describe('Identifier Masking for OTP (maskIdentifier)', () => {
    it('should mask email address properly', () => {
      const masked = maskIdentifier('nhibuaa@cinora.vn');
      assert.ok(masked.includes('••••'));
      assert.ok(masked.endsWith('@cinora.vn'));
    });

    it('should mask phone number properly', () => {
      const masked = maskIdentifier('0908123890');
      assert.strictEqual(masked, '090••••890');
    });
  });

  describe('CineMember Identity Profile Integrity', () => {
    it('should contain default mock profile with CineGold VIP tier', () => {
      assert.strictEqual(DEFAULT_MOCK_USER.id, 'CINORA-GOLD-88991');
      assert.strictEqual(DEFAULT_MOCK_USER.name, 'Nguyễn Minh An (Nhi Buaa)');
      assert.strictEqual(DEFAULT_MOCK_USER.tier, 'CineGold VIP');
      assert.ok(DEFAULT_MOCK_USER.cPoints >= 1000);
    });
  });
});

/**
 * A-01 Customer Registration Contract Definitions
 * 
 * Path: docs/05-specs/007-customer-registration/contracts/auth-registration.contract.ts
 * Target Package: packages/contracts/src/auth/registration.ts (sau khi merge feature)
 * 
 * Tuân thủ nghiêm ngặt:
 * - Constitution v2.0.1 Principle III & ADR-0014: Sử dụng native Zod 4 `z.toJSONSchema()` với dialect
 *   JSON Schema Draft-07 (`target: 'draft-07'`, `io: 'input'`) phục vụ sinh mã Pydantic v2 (AI Agent Service).
 *   Loại bỏ hoàn toàn thư viện ngoài zod-to-json-schema.
 * - P1-PL5: Khắc phục triệt để hồi quy email có khoảng trắng (US2 Scenario 2). Wire Schema chỉ kiểm tra giới hạn
 *   an toàn tài nguyên đầu vào thô (max 254 ký tự), KHÔNG gọi .email() hay .trim() trong Wire Schema. Việc trim,
 *   lowercase và kiểm tra định dạng email canonical được thực thi tại Tầng Application (normalizeAndValidateCustomerRegisterData).
 * - P1-PL5: Wire schema đặt giới hạn tài nguyên mật khẩu thô max 1024 ký tự chống DoS, không ép max 128 ở wire.
 * - P2-PL1/PL2: Thống nhất duy nhất endpoint Identity Service là `POST /api/v1/identity/register`.
 *   Thống nhất định danh sự kiện: `eventType: 'CUSTOMER_REGISTERED'`, `eventVersion: 'v1'`, Kafka topic `identity.customer-registered`.
 * - P1-PL6: Application validator phía server bắt buộc có hàm kiểm tra blocklist PWD-004 (fail-secure);
 *   ghim dataset SecLists chính xác.
 * - FR-007 (Phương án B): Phản hồi tiếp nhận trung tính chống Account Enumeration.
 * - FR-021 (F4): Mô hình 3 trạng thái lỗi hệ thống trung thực (RegisterSystemErrorResponse).
 */

import { z } from 'zod';

// ============================================================================
// 1. Regex Ràng buộc Nghiệp vụ Canonical
// ============================================================================

/**
 * Regex chuẩn số điện thoại di động Việt Nam:
 * Bắt đầu bằng 0 hoặc +84, theo sau là các đầu số 3, 5, 7, 8, 9 và 8 chữ số tiếp theo.
 * Sử dụng [35789], tuyệt đối không dùng [3|5|7|8|9] để tránh chấp nhận ký tự '|'.
 */
export const VIETNAMESE_PHONE_REGEX = /^(0|\+84)[35789][0-9]{8}$/;

/**
 * Regex kiểm tra định dạng Email Canonical tại Tầng Application (sau trim/lowercase).
 * Hòa giải chuẩn xác với Validator mặc định của Better Auth (v1.1.x+) và Zod standard email validator:
 * /^(?!\.)(?!.*\.\.)([A-Za-z0-9_\'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/i
 * 
 * Quy tắc kỹ thuật:
 * - Local-part:
 *   + Không bắt đầu bằng dấu chấm: (?!\.)
 *   + Không chứa hai dấu chấm liên tiếp: (?!.*\.\.)
 *   + Ký tự cho phép: chữ cái, chữ số, dấu gạch dưới (_), nháy đơn ('), dấu cộng (+), gạch ngang (-), và dấu chấm (.).
 *   + Tuyệt đối không nhận các ký tự đặc biệt RFC 5322 hiếm dùng bị Zod/Better Auth từ chối như `!` (ví dụ: a!b@example.com).
 *   + Kết thúc bằng [A-Za-z0-9_+-] (không kết thúc bằng dấu chấm).
 * - Domain-part:
 *   + Nhãn bắt đầu bằng alnum, phân tách bởi dấu chấm: ([A-Za-z0-9][A-Za-z0-9\-]*\.)+
 *   + TLD (Top-Level Domain) bắt buộc tối thiểu 2 ký tự chữ cái: [A-Za-z]{2,}$ (loại bỏ TLD 1 ký tự như a@example.c).
 * - Bảo đảm: 100% email được A-01 tiếp nhận đều đi qua an toàn luồng xác thực và đăng nhập dự kiến của A-03 qua Better Auth.
 */
export const CANONICAL_EMAIL_REGEX = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/i;

// ============================================================================
// 2. Wire Schemas (Hợp đồng truyền tải qua mạng - Native Zod 4 JSON Schema Exportable)
// ============================================================================

/**
 * Wire Schema cho yêu cầu đăng ký khách hàng (CustomerRegisterRequestSchema).
 * 
 * Ranh giới thiết kế (PL5 & ADR-0014):
 * - Wire Schema là pure structural schema, tương thích 100% với JSON Schema Draft-07 qua native `z.toJSONSchema()`.
 * - Cú pháp error message tuân thủ Zod 4: `{ error: '...' }` (loại bỏ hoàn toàn required_error của Zod 3).
 * - TUYỆT ĐỐI KHÔNG sử dụng .trim(), .toLowerCase(), hay .email() trong Wire Schema:
 *   + Chuỗi email thô gửi từ client có thể chứa khoảng trắng ngoài rìa (ví dụ: "  Test.User@Example.COM  ").
 *   + Nếu gọi .email() ở Wire Schema, chuỗi có khoảng trắng sẽ bị từ chối ngay lập tức, vi phạm spec US2 Scenario 2.
 *   + Wire Schema chỉ bảo vệ tài nguyên máy chủ: kiểm tra kiểu string, độ dài thô tối đa 254 ký tự.
 * - Giới hạn password thô max 1024 ký tự chống DoS/Memory Flood.
 */
export const CustomerRegisterRequestSchema = z.object({
  fullName: z
    .string({ error: 'Vui lòng nhập họ và tên đầy đủ.' })
    .min(1, { error: 'Họ và tên không được để trống.' })
    .max(100, { error: 'Họ và tên không được vượt quá 100 ký tự.' }),
  
  email: z
    .string({ error: 'Vui lòng nhập địa chỉ email.' })
    .min(1, { error: 'Địa chỉ email không được để trống.' })
    .max(254, { error: 'Địa chỉ email thô không được vượt quá 254 ký tự.' }),
  
  password: z
    .string({ error: 'Vui lòng nhập mật khẩu.' })
    .min(1, { error: 'Mật khẩu không được để trống.' })
    .max(1024, { error: 'Độ dài chuỗi mật khẩu thô vượt quá giới hạn an toàn truyền tải (tối đa 1024 ký tự).' }),
  
  // BR-02: Số điện thoại là tùy chọn (optional)
  phone: z
    .string()
    .regex(VIETNAMESE_PHONE_REGEX, { error: 'Số điện thoại không đúng định dạng số di động Việt Nam.' })
    .optional()
    .or(z.literal('')),
});

export type CustomerRegisterRequest = z.infer<typeof CustomerRegisterRequestSchema>;

// ============================================================================
// 3. Application Layer Normalization & Canonical Domain Validation (PL5)
// ============================================================================

export interface NormalizedCustomerRegisterData {
  fullName: string;
  email: string;
  password: string; // Giữ nguyên khoảng trắng thô theo PWD-002
  phone?: string;
}

export class CustomerRegistrationDomainError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = 'CustomerRegistrationDomainError';
  }
}

/**
 * Chuẩn hóa và xác thực dữ liệu đầu vào tại Tầng Application của Identity Service.
 * Được ánh xạ tương đương tại Python AI Agent Service.
 * 
 * Các bước thực thi:
 * 1. fullName: trim khoảng trắng đầu/cuối; sau khi trim nếu độ dài < 1 thì báo lỗi FULL_NAME_REQUIRED.
 * 2. email: trim khoảng trắng đầu/cuối và chuyển về chữ thường (lowercase). Sau đó kiểm tra định dạng
 *    email canonical theo CANONICAL_EMAIL_REGEX và độ dài tối đa 254 ký tự. Nếu sai định dạng báo lỗi INVALID_EMAIL_FORMAT.
 * 3. phone: nếu là chuỗi rỗng "" hoặc undefined thì chuyển thành undefined; nếu có thì trim.
 * 4. password: giữ nguyên khoảng trắng đầu/cuối theo quy định của NIST SP 800-63B và PWD-002.
 */
export function normalizeAndValidateCustomerRegisterData(
  raw: CustomerRegisterRequest
): NormalizedCustomerRegisterData {
  const trimmedName = raw.fullName.trim();
  if (trimmedName.length < 1) {
    throw new CustomerRegistrationDomainError(
      'FULL_NAME_REQUIRED',
      'Họ và tên không được chỉ chứa khoảng trắng.'
    );
  }

  const normalizedEmail = raw.email.trim().toLowerCase();
  if (!CANONICAL_EMAIL_REGEX.test(normalizedEmail) || normalizedEmail.length > 254) {
    throw new CustomerRegistrationDomainError(
      'INVALID_EMAIL_FORMAT',
      'Địa chỉ email không đúng định dạng chuẩn sau khi chuẩn hóa.'
    );
  }

  let normalizedPhone: string | undefined = undefined;
  if (raw.phone && raw.phone.trim() !== '') {
    normalizedPhone = raw.phone.trim();
  }

  return {
    fullName: trimmedName,
    email: normalizedEmail,
    password: raw.password,
    phone: normalizedPhone,
  };
}

// ============================================================================
// 4. Response DTO Schemas
// ============================================================================

/**
 * Phản hồi tiếp nhận trung tính chuẩn hóa (HTTP 200 OK)
 * Áp dụng đồng nhất 100% cho CẢ trường hợp email mới và email đã tồn tại (Phương án B).
 */
export const RegisterResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
});

export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;

/**
 * Thông điệp tiếp nhận trung tính chuẩn hóa dùng chung trên toàn hệ thống
 */
export const UNIFIED_REGISTRATION_SUCCESS_MESSAGE =
  'Yêu cầu đăng ký đã được tiếp nhận. Nếu địa chỉ email hợp lệ và chưa có tài khoản, hướng dẫn xác minh tài khoản sẽ được gửi đến hộp thư của bạn. Nếu bạn đã có tài khoản từ trước, vui lòng đăng nhập hoặc sử dụng chức năng khôi phục mật khẩu.';

/**
 * Phản hồi lỗi Client (HTTP 400 Bad Request / HTTP 429 Too Many Requests)
 */
export const RegisterClientErrorResponseSchema = z.object({
  success: z.literal(false),
  code: z.enum([
    'VALIDATION_ERROR',
    'FULL_NAME_REQUIRED',
    'INVALID_EMAIL_FORMAT',
    'PWD_LENGTH_INVALID',
    'PASSWORD_IN_BLOCKLIST',
    'PASSWORD_CONFIRM_MISMATCH',
    'RATE_LIMIT_EXCEEDED',
  ]),
  message: z.string(),
  fieldErrors: z.record(z.string(), z.string()).optional(),
});

export type RegisterClientErrorResponse = z.infer<typeof RegisterClientErrorResponseSchema>;

/**
 * Phản hồi lỗi Hệ thống máy chủ (HTTP 500 Internal Server Error / HTTP 503 Service Unavailable)
 * Dùng khi xảy ra sự cố máy chủ trước commit mà máy chủ/gateway còn sống (F4).
 */
export const RegisterSystemErrorResponseSchema = z.object({
  success: z.literal(false),
  code: z.enum(['INTERNAL_ERROR', 'SERVICE_UNAVAILABLE']),
  message: z.string(),
});

export type RegisterSystemErrorResponse = z.infer<typeof RegisterSystemErrorResponseSchema>;

/**
 * Phản hồi lỗi giao tiếp nội bộ giữa Web BFF và Identity Service (HTTP 400 / HTTP 401)
 * Dành riêng cho ranh giới nội bộ VPC (Internal Service-to-Service Contract):
 * - HTTP 401 UNAUTHORIZED_INTERNAL_CALL: Header bí mật X-Internal-Service-Key bị thiếu hoặc sai.
 * - HTTP 400 MALFORMED_FORWARDED_IP: Header X-Original-Client-IP bị sai định dạng, chứa mảng, hoặc chứa dấu phẩy.
 * 
 * Quy tắc phân nhánh và chuyển đổi tại Next.js Web BFF (FR-021):
 * Phân định dựa trên CẢ HTTP status VÀ payload schema/code (không chỉ dựa trên status code đơn thuần):
 * 1. Nhánh lỗi giao tiếp nội bộ (Internal Forwarding Errors):
 *    - Nhận HTTP 401 + code 'UNAUTHORIZED_INTERNAL_CALL': BFF log ERROR cảnh báo cấu hình bí mật nội bộ.
 *    - Nhận HTTP 400 + code 'MALFORMED_FORWARDED_IP': BFF log ERROR cảnh báo lỗi hạ tầng forward IP.
 *    -> BFF TUYỆT ĐỐI KHÔNG chuyển tiếp HTTP 401 ra trình duyệt khách hàng (tránh hiểu nhầm là cần đăng nhập).
 *    -> Cả 2 trường hợp nội bộ này được BFF chuyển đổi thành HTTP 500 Internal Server Error (code: 'INTERNAL_ERROR',
 *       message: 'Hệ thống đang bận hoặc gặp sự cố xử lý, vui lòng thử lại sau ít phút.') trả về cho trình duyệt.
 * 2. Nhánh lỗi nhập liệu người dùng (Client Validation Errors - RegisterClientErrorResponseSchema):
 *    - Nhận HTTP 400 + code thuộc RegisterClientErrorResponseSchema (ví dụ: 'INVALID_EMAIL_FORMAT',
 *      'PWD_LENGTH_INVALID', 'PASSWORD_IN_BLOCKLIST', 'PASSWORD_CONFIRM_MISMATCH', 'FULL_NAME_REQUIRED',...):
 *    -> BFF GIỮ NGUYÊN HTTP 400 Bad Request và chuyển tiếp payload nguyên vẹn để client hiển thị hướng dẫn nhập liệu cho người dùng.
 * 3. Nhánh giới hạn tần suất (Rate Limiting):
 *    - Nhận HTTP 429 + code 'RATE_LIMIT_EXCEEDED':
 *    -> BFF GIỮ NGUYÊN HTTP 429 và chuyển tiếp header 'Retry-After' cùng payload lỗi ra client.
 * 4. Nhánh phản hồi dị thường / không khớp schema / status-code mâu thuẫn:
 *    - Response từ Identity không parse được theo bất kỳ schema hợp lệ nào (thân rỗng, HTML lỗi, mã lạ):
 *    -> BFF ghi log ERROR có cấu trúc chỉ bao gồm metadata an toàn theo allowlist (upstream status, correlation ID,
 *       loại lỗi xác thực schema; tuyệt đối không log raw body/headers, mật khẩu, token, cookie hay internal service key
 *       theo FR-013, SC-005, PWD-006), chuyển đổi an toàn thành HTTP 500 (code: 'INTERNAL_ERROR'),
 *       tuyệt đối KHÔNG trả HTTP 200 tiếp nhận giả và KHÔNG chuyển tiếp HTTP 401 ra trình duyệt.
 */
export const InternalForwardingErrorResponseSchema = z.object({
  success: z.literal(false),
  code: z.enum([
    'UNAUTHORIZED_INTERNAL_CALL',
    'MALFORMED_FORWARDED_IP',
  ]),
  message: z.string(),
});

export type InternalForwardingErrorResponse = z.infer<typeof InternalForwardingErrorResponseSchema>;

/**
 * Union Schema biểu diễn toàn bộ các phản hồi lỗi từ Identity Service
 */
export const CustomerRegistrationErrorResponseSchema = z.union([
  RegisterClientErrorResponseSchema,
  RegisterSystemErrorResponseSchema,
  InternalForwardingErrorResponseSchema,
]);

export type CustomerRegistrationErrorResponse = z.infer<typeof CustomerRegistrationErrorResponseSchema>;

// ============================================================================
// 5. Outbox Event Contract (Identity -> Kafka -> Cinema Core — PL2, PL5)
// ============================================================================

export const CustomerRegisteredEventPayloadSchema = z.object({
  eventId: z.string().uuid(), // Chuỗi UUID canonical 36 ký tự
  eventType: z.literal('CUSTOMER_REGISTERED'),
  eventVersion: z.literal('v1'),
  timestamp: z.string().datetime(),
  data: z.object({
    userId: z.string().uuid(), // Chuỗi UUID canonical 36 ký tự
    email: z.string(),
    fullName: z.string(),
    phone: z.string().optional(),
    emailVerified: z.literal(false),
    role: z.literal('CUSTOMER'), // Chỉ cấp duy nhất vai trò CUSTOMER (PL4)
  }),
});

export type CustomerRegisteredEventPayload = z.infer<typeof CustomerRegisteredEventPayloadSchema>;

// ============================================================================
// 6. Application Password Validation Functions (Identity Service — PL5, PL6)
// ============================================================================

/**
 * Đếm số lượng Unicode code points sau khi chuẩn hóa Unicode Normalization Form C (NFC)
 * theo đúng yêu cầu của PWD-001 và PWD-002.
 */
export function countUnicodeCodePointsNFC(input: string): number {
  const normalized = input.normalize('NFC');
  return Array.from(normalized).length;
}

export interface PasswordValidationResult {
  valid: boolean;
  lengthNFC: number;
  code?: 'PWD_LENGTH_INVALID' | 'PASSWORD_IN_BLOCKLIST' | 'BLOCKLIST_SERVICE_UNAVAILABLE';
  message?: string;
}

/**
 * Kiểm tra nghiệp vụ mật khẩu tại Application Layer của Identity Service (Server-side bắt buộc).
 * Bắt buộc phải truyền hàm kiểm tra blocklist isBlocked (không có cờ optional).
 * Áp dụng nguyên tắc Fail-Secure: nếu hàm isBlocked không khả dụng, từ chối xử lý và báo lỗi hệ thống.
 * 
 * @param password Mật khẩu thô nhận được từ client (giữ nguyên khoảng trắng đầu/cuối theo PWD-002)
 * @param isBlocked Hàm kiểm tra mật khẩu trong bộ nhớ blocklist PWD-004 (Bắt buộc)
 */
export function validateCustomerPasswordServer(
  password: string,
  isBlocked: (normalizedLower: string) => boolean
): PasswordValidationResult {
  if (typeof isBlocked !== 'function') {
    return {
      valid: false,
      lengthNFC: 0,
      code: 'BLOCKLIST_SERVICE_UNAVAILABLE',
      message: 'Dịch vụ kiểm tra an toàn mật khẩu tạm thời không khả dụng. Vui lòng thử lại sau.',
    };
  }

  // Bước 1: Chuẩn hóa NFC
  const normalized = password.normalize('NFC');
  const len = Array.from(normalized).length;

  // Bước 2: PWD-001 kiểm tra độ dài 15 đến 128 Unicode code points sau NFC
  if (len < 15 || len > 128) {
    return {
      valid: false,
      lengthNFC: len,
      code: 'PWD_LENGTH_INVALID',
      message: 'Mật khẩu phải có độ dài từ 15 đến 128 ký tự (sau khi chuẩn hóa Unicode NFC).',
    };
  }

  // Bước 3: PWD-004 kiểm tra danh sách mật khẩu phổ biến/đã lộ
  const lower = normalized.toLowerCase();
  if (isBlocked(lower)) {
    return {
      valid: false,
      lengthNFC: len,
      code: 'PASSWORD_IN_BLOCKLIST',
      message: 'Mật khẩu này quá phổ biến hoặc đã từng bị lộ. Vui lòng chọn mật khẩu khác an toàn hơn.',
    };
  }

  return {
    valid: true,
    lengthNFC: len,
  };
}

export interface ClientPasswordValidationResult {
  valid: boolean;
  lengthNFC: number;
  message?: string;
}

/**
 * Kiểm tra mật khẩu sơ bộ phía Client (chỉ phục vụ phản hồi UI tức thì).
 * Cảnh báo: Việc kiểm tra tại Client chỉ mang tính hỗ trợ UX; máy chủ Identity Service
 * bắt buộc phải thực thi validateCustomerPasswordServer trước khi băm và lưu trữ.
 */
export function validateCustomerPasswordClient(password: string): ClientPasswordValidationResult {
  const normalized = password.normalize('NFC');
  const len = Array.from(normalized).length;

  if (len < 15 || len > 128) {
    return {
      valid: false,
      lengthNFC: len,
      message: 'Mật khẩu phải có độ dài từ 15 đến 128 ký tự.',
    };
  }

  return {
    valid: true,
    lengthNFC: len,
  };
}

// ============================================================================
// 7. Contract Test Fixtures Matrix (Cross-language Compatibility: TS & Python)
// ============================================================================

export const CROSS_LANGUAGE_CONTRACT_FIXTURES = [
  {
    name: 'Tên chỉ chứa khoảng trắng',
    input: {
      fullName: '   ',
      email: 'test@example.com',
      password: 'mat khau hop le tren 15 ky tu',
    },
    wireSchemaPass: true, // Wire schema kiểm tra chuỗi thô length=3 >= 1
    applicationExpectedCode: 'FULL_NAME_REQUIRED', // Application layer trim() -> length=0 -> fail
  },
  {
    name: 'Email có khoảng trắng và chữ hoa (US2 Scenario 2)',
    input: {
      fullName: 'Nguyễn Văn Test',
      email: '  Test.User@Example.COM  ',
      password: 'mat khau hop le tren 15 ky tu',
    },
    wireSchemaPass: true, // Wire schema chấp nhận chuỗi thô độ dài 25 ký tự <= 254
    normalizedEmailExpected: 'test.user@example.com', // Application layer trim & lowercase hợp lệ
    applicationExpectedValid: true,
  },
  {
    name: 'Email hợp lệ có subdomain và dấu cộng (RFC 5322)',
    input: {
      fullName: 'Nguyễn Văn Test',
      email: 'alice.bob+tag@sub.example.com',
      password: 'mat khau hop le tren 15 ky tu',
    },
    wireSchemaPass: true,
    normalizedEmailExpected: 'alice.bob+tag@sub.example.com',
    applicationExpectedValid: true,
  },
  {
    name: 'Email sai: Dấu chấm ở đầu local-part (.alice@example.com)',
    input: {
      fullName: 'Nguyễn Văn Test',
      email: '.alice@example.com',
      password: 'mat khau hop le tren 15 ky tu',
    },
    wireSchemaPass: true,
    applicationExpectedCode: 'INVALID_EMAIL_FORMAT',
  },
  {
    name: 'Email sai: Hai dấu chấm liên tiếp (alice..bob@example.com)',
    input: {
      fullName: 'Nguyễn Văn Test',
      email: 'alice..bob@example.com',
      password: 'mat khau hop le tren 15 ky tu',
    },
    wireSchemaPass: true,
    applicationExpectedCode: 'INVALID_EMAIL_FORMAT',
  },
  {
    name: 'Email sai: Dấu chấm ở cuối local-part (alice.@example.com)',
    input: {
      fullName: 'Nguyễn Văn Test',
      email: 'alice.@example.com',
      password: 'mat khau hop le tren 15 ky tu',
    },
    wireSchemaPass: true,
    applicationExpectedCode: 'INVALID_EMAIL_FORMAT',
  },
  {
    name: 'Email sai theo Better Auth/Zod: Chứa ký tự chấm than (a!b@example.com)',
    input: {
      fullName: 'Nguyễn Văn Test',
      email: 'a!b@example.com',
      password: 'mat khau hop le tren 15 ky tu',
    },
    wireSchemaPass: true,
    applicationExpectedCode: 'INVALID_EMAIL_FORMAT',
  },
  {
    name: 'Email sai theo Better Auth/Zod: TLD chỉ có 1 ký tự (a@example.c)',
    input: {
      fullName: 'Nguyễn Văn Test',
      email: 'a@example.c',
      password: 'mat khau hop le tren 15 ky tu',
    },
    wireSchemaPass: true,
    applicationExpectedCode: 'INVALID_EMAIL_FORMAT',
  },
  {
    name: 'Email hợp lệ có dấu gạch dưới và tên miền quốc gia (user_name@domain.vn)',
    input: {
      fullName: 'Nguyễn Văn Test',
      email: 'user_name@domain.vn',
      password: 'mat khau hop le tren 15 ky tu',
    },
    wireSchemaPass: true,
    normalizedEmailExpected: 'user_name@domain.vn',
    applicationExpectedValid: true,
  },
  {
    name: 'Số điện thoại rỗng',
    input: {
      fullName: 'Nguyễn Văn Test',
      email: 'test@example.com',
      password: 'mat khau hop le tren 15 ky tu',
      phone: '',
    },
    wireSchemaPass: true,
    applicationPhoneExpected: undefined,
  },
  {
    name: 'Unicode NFD thô 256 ký tự (PL5)',
    input: {
      fullName: 'Nguyễn Văn Test',
      email: 'test@example.com',
      password: ('e\u0301').repeat(128), // 256 code units thô NFD
    },
    wireSchemaPass: true, // 256 <= 1024
    applicationLengthNFC: 128, // Sau NFC là 128 ký tự 'é'
    applicationExpectedValid: true,
  },
  {
    name: 'Mật khẩu 14 ký tự (Biên dưới)',
    input: {
      fullName: 'Nguyễn Văn Test',
      email: 'test@example.com',
      password: 'Pass#Word12345', // 14 code points
    },
    wireSchemaPass: true, // 14 <= 1024
    applicationExpectedCode: 'PWD_LENGTH_INVALID',
  },
  {
    name: 'Mật khẩu thuộc SecLists blocklist (18 ký tự)',
    input: {
      fullName: 'Nguyễn Văn Test',
      email: 'test@example.com',
      password: '123456789123456789', // Nằm trong dataset SecLists 100k dòng 12960
    },
    wireSchemaPass: true,
    applicationExpectedCode: 'PASSWORD_IN_BLOCKLIST',
  },
];

/**
 * Fixtures kiểm chứng hợp đồng lỗi giao tiếp nội bộ (Internal Forwarding Error Responses)
 */
export const FORWARDING_ERROR_CONTRACT_FIXTURES = [
  {
    name: 'Lỗi xác thực khóa nội bộ BFF (HTTP 401)',
    status: 401,
    payload: {
      success: false,
      code: 'UNAUTHORIZED_INTERNAL_CALL',
      message: 'Khóa dịch vụ nội bộ không hợp lệ hoặc bị thiếu.',
    },
    schemaPass: true,
  },
  {
    name: 'Lỗi IP chuyển tiếp sai định dạng (HTTP 400)',
    status: 400,
    payload: {
      success: false,
      code: 'MALFORMED_FORWARDED_IP',
      message: 'Địa chỉ IP chuyển tiếp không đúng định dạng đơn trị IPv4 hoặc IPv6.',
    },
    schemaPass: true,
  },
  {
    name: 'Mã lỗi ngoài hợp đồng (Từ chối)',
    status: 400,
    payload: {
      success: false,
      code: 'UNKNOWN_INTERNAL_ERROR',
      message: 'Lỗi không xác định.',
    },
    schemaPass: false,
  },
];

// ============================================================================
// 8. Web BFF Response Dispatching Logic & Contract Fixtures (FR-021)
// ============================================================================

export interface BffDispatchResult {
  clientStatus: number;
  clientPayload: {
    success: false;
    code: string;
    message: string;
    fieldErrors?: Record<string, string>;
  };
  retryAfterHeader?: string;
  internalLoggedAsError: boolean;
}

/**
 * Thuật toán phân nhánh phản hồi lỗi tại Next.js Web BFF sang client (FR-021).
 * Phân định dựa trên CẢ HTTP Status VÀ Payload/Schema/Code, giải quyết triệt để
 * lỗi gom nhầm lỗi nhập liệu người dùng (HTTP 400) thành lỗi máy chủ (HTTP 500).
 */
export function resolveBffDispatchedResponse(
  identityStatus: number,
  identityBody: unknown,
  headers?: { retryAfter?: string }
): BffDispatchResult {
  // 1. Nhận diện lỗi chuyển tiếp nội bộ (Internal Forwarding Errors)
  const forwardingParse = InternalForwardingErrorResponseSchema.safeParse(identityBody);
  if (forwardingParse.success) {
    if (
      (identityStatus === 401 && forwardingParse.data.code === 'UNAUTHORIZED_INTERNAL_CALL') ||
      (identityStatus === 400 && forwardingParse.data.code === 'MALFORMED_FORWARDED_IP')
    ) {
      return {
        clientStatus: 500,
        clientPayload: {
          success: false,
          code: 'INTERNAL_ERROR',
          message: 'Hệ thống đang bận hoặc gặp sự cố xử lý, vui lòng thử lại sau ít phút.',
        },
        internalLoggedAsError: true,
      };
    }
  }

  // 2. Nhận diện lỗi nhập liệu người dùng (Client Validation Errors)
  if (identityStatus === 400) {
    const clientErrorParse = RegisterClientErrorResponseSchema.safeParse(identityBody);
    if (clientErrorParse.success && clientErrorParse.data.code !== 'RATE_LIMIT_EXCEEDED') {
      return {
        clientStatus: 400,
        clientPayload: clientErrorParse.data,
        internalLoggedAsError: false,
      };
    }
  }

  // 3. Nhận diện lỗi giới hạn tần suất (Rate Limiting)
  if (identityStatus === 429) {
    const rateLimitParse = RegisterClientErrorResponseSchema.safeParse(identityBody);
    if (rateLimitParse.success && rateLimitParse.data.code === 'RATE_LIMIT_EXCEEDED') {
      return {
        clientStatus: 429,
        clientPayload: rateLimitParse.data,
        retryAfterHeader: headers?.retryAfter,
        internalLoggedAsError: false,
      };
    }
  }

  // 4. Nhận diện lỗi hệ thống tường minh từ Identity Service (HTTP 500, 503)
  if (identityStatus === 500 || identityStatus === 503) {
    const systemErrorParse = RegisterSystemErrorResponseSchema.safeParse(identityBody);
    if (systemErrorParse.success) {
      return {
        clientStatus: identityStatus,
        clientPayload: systemErrorParse.data,
        internalLoggedAsError: true,
      };
    }
  }

  // 5. Phản hồi dị thường: không khớp schema, status/code mâu thuẫn hoặc payload rác
  // Xử lý an toàn: Báo lỗi hệ thống HTTP 500 INTERNAL_ERROR, ghi log ERROR nội bộ theo metadata allowlist
  // (upstreamStatus, correlationId, errorType; tuyệt đối không log raw body/secrets theo FR-013, SC-005, PWD-006),
  // tuyệt đối KHÔNG trả HTTP 200 tiếp nhận giả và KHÔNG chuyển tiếp HTTP 401 ra trình duyệt.
  return {
    clientStatus: 500,
    clientPayload: {
      success: false,
      code: 'INTERNAL_ERROR',
      message: 'Hệ thống đang bận hoặc gặp sự cố xử lý, vui lòng thử lại sau ít phút.',
    },
    internalLoggedAsError: true,
  };
}

/**
 * Bộ Fixtures đối chứng phân nhánh phản hồi qua Next.js Web BFF
 * Bao phủ đầy đủ 7 trường hợp theo yêu cầu của Finding P2.
 */
export const BFF_DISPATCH_CONTRACT_FIXTURES = [
  {
    name: '400 PWD_LENGTH_INVALID -> Giữ nguyên client 400',
    identityStatus: 400,
    identityBody: {
      success: false,
      code: 'PWD_LENGTH_INVALID',
      message: 'Mật khẩu phải chứa ít nhất 15 ký tự.',
    },
    expectedClientStatus: 400,
    expectedClientCode: 'PWD_LENGTH_INVALID',
    expectedInternalErrorLogged: false,
  },
  {
    name: '400 PASSWORD_IN_BLOCKLIST -> Giữ nguyên client 400',
    identityStatus: 400,
    identityBody: {
      success: false,
      code: 'PASSWORD_IN_BLOCKLIST',
      message: 'Mật khẩu nằm trong danh sách mật khẩu không an toàn, vui lòng chọn mật khẩu khác.',
    },
    expectedClientStatus: 400,
    expectedClientCode: 'PASSWORD_IN_BLOCKLIST',
    expectedInternalErrorLogged: false,
  },
  {
    name: '400 INVALID_EMAIL_FORMAT -> Giữ nguyên client 400',
    identityStatus: 400,
    identityBody: {
      success: false,
      code: 'INVALID_EMAIL_FORMAT',
      message: 'Địa chỉ email không đúng định dạng chuẩn sau khi chuẩn hóa.',
    },
    expectedClientStatus: 400,
    expectedClientCode: 'INVALID_EMAIL_FORMAT',
    expectedInternalErrorLogged: false,
  },
  {
    name: '400 MALFORMED_FORWARDED_IP -> Chuyển đổi thành client 500 INTERNAL_ERROR',
    identityStatus: 400,
    identityBody: {
      success: false,
      code: 'MALFORMED_FORWARDED_IP',
      message: 'Địa chỉ IP chuyển tiếp không đúng định dạng đơn trị IPv4 hoặc IPv6.',
    },
    expectedClientStatus: 500,
    expectedClientCode: 'INTERNAL_ERROR',
    expectedInternalErrorLogged: true,
  },
  {
    name: '401 UNAUTHORIZED_INTERNAL_CALL -> Chuyển đổi thành client 500 INTERNAL_ERROR (chặn lộ 401)',
    identityStatus: 401,
    identityBody: {
      success: false,
      code: 'UNAUTHORIZED_INTERNAL_CALL',
      message: 'Khóa dịch vụ nội bộ không hợp lệ hoặc bị thiếu.',
    },
    expectedClientStatus: 500,
    expectedClientCode: 'INTERNAL_ERROR',
    expectedInternalErrorLogged: true,
  },
  {
    name: '429 RATE_LIMIT_EXCEEDED -> Giữ nguyên client 429 và header Retry-After',
    identityStatus: 429,
    identityBody: {
      success: false,
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Bạn đã gửi quá nhiều yêu cầu đăng ký từ địa chỉ này. Vui lòng thử lại sau 15 phút.',
    },
    headers: { retryAfter: '900' },
    expectedClientStatus: 429,
    expectedClientCode: 'RATE_LIMIT_EXCEEDED',
    expectedRetryAfter: '900',
    expectedInternalErrorLogged: false,
  },
  {
    name: 'Response sai schema / status-code mâu thuẫn -> Fail-safe client 500 INTERNAL_ERROR',
    identityStatus: 400,
    identityBody: {
      unexpectedKey: 'malformed_data',
    },
    expectedClientStatus: 500,
    expectedClientCode: 'INTERNAL_ERROR',
    expectedInternalErrorLogged: true,
  },
];

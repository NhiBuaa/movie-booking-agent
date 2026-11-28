# Nguồn và hiện trạng đối chiếu — A-01 Đăng ký tài khoản khách hàng (Web và Mobile)

Ngày đọc: 2026-11-20 (cập nhật v0.3.2 ngày 2026-11-21 sau đợt review độc lập lần 2). Code nền: `2a007797ac9ce542d9747aad0f44f3e430eec581`.
Đây là dấu kiểm đầu vào cho [spec v0.3.2](spec.md), không thay trạng thái Issue/PR hoặc kiểm chứng runtime.

## Nguồn trong repository

| Nguồn | Phần dùng cho A-01 |
|---|---|
| [AGENTS](../../../AGENTS.md), `C:/Users/NhiBuaa/.agents/AGENTS.md` | Quyền hạn, worktree riêng, thẩm quyền tài liệu và kiểm chứng |
| [Constitution v2.0.1](../../../.specify/memory/constitution.md) | Quyền hạn danh tính, chủ dữ liệu và bằng chứng kiểm chứng |
| [PROJECT-OVERVIEW](../../../PROJECT-OVERVIEW.md), [CONTEXT](../../../CONTEXT.md) | Phân biệt bốn app/bảy service mục tiêu với scaffold/mô phỏng hiện có |
| [Use cases](../../03-product/use-cases.md), [mô tả use case mục A-01](../../03-product/use-case-descriptions.md), [GLOSSARY](../../../GLOSSARY.md) | A-01, A-02, BR-01, BR-02, BR-14, BR-33, BR-36, BR-38, BR-41; Q19, Q21, Q25 |
| [Kiến trúc](../../05-specs/004-service-decomposition/spec.md), [quyết định](../../05-specs/004-service-decomposition/decisions.md), [Identity README](../../../services/identity-service/README.md) | Identity Service sở hữu danh tính/tài khoản/thông tin xác thực; Cinema Core sở hữu module Hội viên (`loyalty_members`); không gọi SQL chéo, không giao dịch xuyên database |
| [ADR-0008](../../06-decisions/0008-better-auth-with-direct-login.md) | Better Auth, form xác thực trực tiếp, email/mật khẩu, ranh giới Identity |
| [ADR-0002](../../06-decisions/0002-customer-organizer-app-boundaries.md), [ADR-0016](../../06-decisions/0016-expo-router-and-mobile-native-foundation.md), [ADR-0023](../../06-decisions/0023-encrypted-mmkv-for-offline-mobile-tickets.md) | Hai app Customer Web và Customer Mobile độc lập; tương tác native, bảo vệ dữ liệu cục bộ |
| [Chính sách mật khẩu v0.2.0](../../04-standards/password-policy.md) | Kế thừa PWD-001…PWD-004, PWD-006 đã được duyệt cho khách hàng; PWD-005 không áp dụng cho đăng ký mới; PWD-007 do Plan thiết kế |
| [DESIGN.md](../../../DESIGN.md), [Customer Web PRODUCT](../../../apps/customer-web/PRODUCT.md), [Customer Mobile PRODUCT](../../../apps/customer-mobile/PRODUCT.md), [Chuẩn UI](../../04-standards/ui-quality.md), [UI routing](../../../.agents/rules/ui-skill-routing.md) | Nhận diện Ferrari Dark Cinema, bố cục Double-Stage, trợ năng WCAG 2.2 AA và native accessibility |
| [Feature directory](../README.md) | Bộ tài liệu feature chuẩn tại `docs/05-specs/007-customer-registration/` |

## Quyết định của Chủ sản phẩm ghi nhận ngày 2026-11-21

Trong hội thoại ngày 2026-11-21, chủ sản phẩm đã trực tiếp phê duyệt hai quyết định thiết kế cho tính năng A-01:
1. **Quyết định 1 (FR-007 - Cơ chế phản hồi khi email đã được đăng ký)**: Chọn **Phương án B** (Phản hồi trung tính chống Account Enumeration theo khuyến nghị OWASP). Máy chủ từ chối tạo mới nhưng trả về cùng mã HTTP 200 và cùng cấu trúc payload thành công chung, giao diện hiển thị thông điệp tiếp nhận trung tính hướng dẫn kiểm tra email kèm gợi ý nếu đã có tài khoản thì đăng nhập (A-03) hoặc khôi phục mật khẩu (A-05).
2. **Quyết định 2 (FR-012 - Trạng thái phiên sau khi tạo tài khoản)**: Chọn **Phương án A** (Không cấp phiên tự động). Giao diện chuyển sang màn hình thông báo tiếp nhận đăng ký, hướng dẫn sang A-02 để xác minh email, kèm nút "Đăng nhập ngay" (A-03) và nút "Gửi lại email xác minh" (khi A-02 sẵn sàng). Giữ vững ranh giới độc lập giữa A-01 và A-03.

## Nguồn chưa hợp nhất, chỉ đọc (Đối chiếu delta snapshot mốc 2026-11-21)

Kế thừa các quyết định đã duyệt từ phiên A-03 và các worktree liên quan:

### NFR (Worktree: `docs-nfr-requirements`)
- File: `docs/05-specs/domain-context.md`.
- **Snapshot đối chiếu thực tế hiện hành**: SHA-256 là `75FDB7F32BCACF5896D7F99C97EEA8D7D0BDAF5B3BFC5B9C6B1C97B8DB85BB73`.
- **Kết quả đối chiếu delta nội dung**:
  + Mục 9.13 & 9.13.2 (NFR-ACC-01): Bộ tham chiếu A đã duyệt ngày 2026-11-20 giữ nguyên toàn bộ nội dung: Web máy tính dùng Edge/Narrator/Windows; Web iPhone dùng Safari/VoiceOver trên **iPhone 11 Pro Max thật**; Mobile iOS dùng VoiceOver trên **iPhone 11 Pro Max thật**; Mobile Android dùng TalkBack trên **Android emulator có Android Accessibility Suite**, công bố giới hạn thiết bị thật.
  + Mục 9.14 (NFR-SEC-01): Kiểm soát quyền và bí mật giữ nguyên hiệu lực.
  + Mục 9.9 và 9.10 (NFR-PERF): Hiệu năng Web và khoảng trống Android thật mốc demo giữ nguyên hiệu lực.
  + *Kết luận delta*: Các thay đổi gần đây trong `domain-context.md` không làm thay đổi các quyết định đã duyệt liên quan tới A-01. Mốc snapshot `75FDB7F3...` là căn cứ đối chiếu; nếu nguồn tiếp tục thay đổi ở worktree riêng, phần delta phát sinh sẽ tiếp tục được kiểm tra trước khi lập Plan.

### Thiết kế DB (Worktree: `docs-data-design`)
- File: `docs/05-specs/005-data-design/databases/identity.md`.
- **Snapshot đối chiếu thực tế hiện hành**: SHA-256 là `F5DCE0B6B95DD0A74E671E39DDAB6E636A918459BF87E74B37AC962C2E828C60`.
- File: `docs/05-specs/005-data-design/databases/cinema-core.md`, trạng thái Draft v1.1.0.
- **Kết quả đối chiếu delta nội dung**:
  + Bảng `users` trong `identity.md` gồm các cột: `id` (tiền tố `usr_`), `name`, `email`, `email_verified`, `phone_number`.
  + Bảng `accounts` gồm: `id`, `user_id`, `account_id`, `provider_id`, `password_hash`.
  + Bảng `user_role_assignments` gồm: `id` (tiền tố `ura_`), `user_id`, `role_code` (`CHECK role_code IN ('CUSTOMER', ...)`), `cinema_id` (NULL đối với CUSTOMER).
  + Bảng `loyalty_members` trong `cinema-core.md` gồm: `user_id`, `current_tier = 'BASIC'`, `points_balance = 0`, `total_spending_12m = 0`.
  + *Kết luận delta*: Cột vai trò chính xác là `role_code` (không phải `role`). Không có bảng hội viên trong Identity. Delta thay đổi hash trong `identity.md` không làm đổi ranh giới thực thể của A-01.
  + *Lưu ý*: DB draft là tài liệu tham chiếu cấu trúc, KHÔNG PHẢI quyết định schema triển khai vật lý đã duyệt; chi tiết schema sẽ do bước Plan thiết kế.

## Hiện trạng code nền đối chiếu và bảng sai lệch

Khảo sát tại commit nền `2a007797ac9ce542d9747aad0f44f3e430eec581`:

| Nguồn code | Hiện trạng quan sát | Sai lệch so với yêu cầu đã duyệt A-01 | Hệ quả với Spec và Plan |
|---|---|---|---|
| [RegisterView](../../../apps/customer-web/src/features/auth/components/RegisterView.tsx) | `handleSubmit` chỉ `setTimeout(600ms)` rồi đẩy sang `/profile`; mạng xã hội Google/Apple alert; nút đặt vé khách dẫn link tĩnh | Hoàn toàn là mock/giả lập; chưa gọi backend Identity; vi phạm FR-001 (không nút mạng xã hội giả); chưa tích hợp bàn giao sang A-02 | Spec yêu cầu form thật, gọi Identity, loại bỏ mạng xã hội giả; điều hướng sang bước xác minh email A-02 |
| [RegisterView — Mật khẩu](../../../apps/customer-web/src/features/auth/components/RegisterView.tsx#L199-L202) | `minLength={8}`, placeholder "tối thiểu 8 ký tự", hiển thị thanh đo độ mạnh | Vi phạm PWD-001 (mật khẩu mới dài 15–128 Unicode code points sau NFC); vi phạm PWD-003 (không bắt buộc phối hợp loại ký tự) | Spec quy định chuẩn PWD-001..004; UI chỉ báo độ dài 15–128 ký tự và kiểm tra blacklist |
| [RegisterView — Số điện thoại](../../../apps/customer-web/src/features/auth/components/RegisterView.tsx#L143-L157) | Trường `reg-phone` có thuộc tính `required` | Vi phạm BR-02: "Email + mật khẩu; số điện thoại tùy chọn" | Spec xác định số điện thoại là trường tùy chọn (optional), không bắt buộc |
| [auth-state.ts](../../../apps/customer-web/src/features/auth/model/auth-state.ts#L14-L66) | Hàm `calculatePasswordStrength` chấm điểm dựa trên độ dài (`<6` yếu, `cinora2026` khá, `Ferrari#2026@Corsa` mạnh) bằng regex chữ cái, số, ký hiệu. Hàm không kiểm tra hoa/thường riêng và KHÔNG chặn submit | Không khớp tiêu chí PWD-001/PWD-003 cho mật khẩu mới. Hàm này đang được `ForgotPasswordView` sử dụng và có test trong `tests/auth-flow.test.ts` | Không tự ý sửa hàm chung này trong phạm vi A-01 để tránh phá vỡ test/luồng khác; luồng đăng ký A-01 sẽ sử dụng validator riêng phù hợp PWD-001..004 |
| [Auth DTO](../../../packages/contracts/src/auth/types.ts#L52-L57) | `RegisterRequest`: `phone` là bắt buộc (`string`), `password` là tùy chọn (`password?: string`) | Ngược với BR-02 và luồng A-01: password phải bắt buộc, phone là tùy chọn | Cần chuẩn hóa lại DTO trong giai đoạn Plan/Contracts để phản ánh đúng BR-02 và phản hồi trung tính theo Phương án B |
| [Customer Mobile](../../../apps/customer-mobile/README.md) | Thư mục chỉ có `README.md` và `PRODUCT.md`, chưa có code app Expo/React Native | Thiếu toàn bộ triển khai Mobile | Spec thiết kế chung cho Web và Mobile; hỗ trợ phân kỳ triển khai Web trước, Mobile sau trong Plan |
| [Identity Service](../../../services/identity-service/README.md) | Thư mục chỉ có `README.md`, chưa có code runtime | Chưa có API đăng ký tài khoản thật | Plan cần phần nền tối thiểu của Identity service để phục vụ tạo tài khoản |

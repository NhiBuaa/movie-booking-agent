# Password Policy Checklist: A-01 — Đăng ký tài khoản khách hàng (Web và Mobile)

**Purpose**: Rà soát chất lượng yêu cầu mật khẩu và tính nhất quán với Chính sách mật khẩu dùng chung v0.2.0 trước khi trình chủ sản phẩm phê duyệt spec; không kiểm phần mềm đã triển khai.  
**Created**: 2026-11-20 (cập nhật v0.3.2 ngày 2026-11-21 sau khi chủ sản phẩm chốt quyết định và hoàn thiện sau đợt review độc lập lần 2)  
**Feature**: [spec v0.3.2](../spec.md)  
**Review Ownership**: Reviewer độc lập đánh giá và xác nhận. Agent chỉ hỗ trợ rà soát sơ bộ và cập nhật căn cứ theo finding R4.

## Shared Policies & Dependencies

- [x] **CHK001**: Spec đã xác định rõ nguồn sở hữu, mã/phiên bản, trạng thái và phạm vi của từng chính sách mật khẩu áp dụng (PWD-001…PWD-004, PWD-006, PWD-007) chưa? [Completeness, Spec §Phạm vi và nguồn thẩm quyền, Bảng truy vết]
- [x] **CHK002**: Đã ghi rõ PWD-005 (xác minh mật khẩu cũ / legacy) KHÔNG ÁP DỤNG cho luồng tạo mật khẩu mới A-01 chưa? [Clarity, Boundary, Spec §Bảng truy vết]
- [x] **CHK003**: Mỗi mục chính sách áp dụng đã được ánh xạ cụ thể tới Functional Requirements (FR) và Success Criteria (SC) chưa? [Traceability, Spec §Bảng truy vết]

## Requirement Completeness & Clarity

- [x] **CHK004**: PWD-001 đã chốt rõ giới hạn độ dài (15–128 Unicode code points sau chuẩn hóa NFC) cho mật khẩu mới của khách hàng và tiêu chí kiểm tra biên (14, 15, 128, 129 ký tự) chưa? [PWD-001, Spec §FR-003, US3, SC-003]
- [x] **CHK005**: PWD-002 đã quy định xử lý chuẩn hóa NFC, chấp nhận ký tự Unicode tiếng Việt có dấu, giữ nguyên khoảng trắng đầu/cuối và phân biệt hoa/thường (không tự ý trim mật khẩu) chưa? [PWD-002, Spec §FR-003, Edge Cases, SC-003]
- [x] **CHK006**: PWD-003 đã quy định rõ KHÔNG bắt buộc phối hợp chữ hoa, chữ thường, số hoặc ký hiệu; chấp nhận cụm từ mật khẩu (passphrase) nhưng PHẢI ĐẢM BẢO độ dài 15–128 ký tự sau NFC VÀ không thuộc danh sách mật khẩu phổ biến/đã lộ (PWD-004) chưa? [PWD-003, PWD-004, Spec §FR-003, FR-004, US3, SC-003]
- [x] **CHK007**: PWD-004 đã xác định cơ chế từ chối mật khẩu phổ biến hoặc đã từng bị lộ bằng danh sách nội bộ kiểm tra tại máy chủ, cấm gửi mật khẩu ra dịch vụ bên ngoài chưa? [PWD-004, Spec §FR-003, US3, SC-003, Assumptions]

## Requirement Consistency & Security Criteria

- [x] **CHK008**: PWD-006 đã quy định bảo vệ nghiêm ngặt thông tin xác thực: tuyệt đối không ghi mật khẩu thô vào log hệ thống, telemetry, crash report hoặc trả về client trong phản hồi API (đo lường tại SC-005) chưa? [PWD-006, Spec §FR-013, SC-005]
- [x] **CHK009**: PWD-007 đã được phân định rõ là cơ chế kỹ thuật bảo vệ khi lưu (thuật toán băm Argon2id / bcrypt, salt duy nhất, versioning) thuộc phạm vi thiết kế chi tiết trong bước Plan của Identity Service, không đồng nhất SC-005 (chống rò rỉ log) với chứng minh bảo vệ khi lưu chưa? [PWD-007, Spec §FR-014, Bảng truy vết, Assumptions]
- [x] **CHK010**: Yêu cầu xác nhận mật khẩu (Confirm Password) có tiêu chí đối khớp chính xác từng ký tự và phản hồi trực quan trên giao diện chưa? [Completeness, Spec §FR-002, FR-006, US3]

## Bổ sung phạm vi Web và Mobile

- [x] **CHK011**: Chính sách mật khẩu được áp dụng nhất quán 100% trên cả Customer Web và Customer Mobile (iOS/Android), không có ngoại lệ hay tiêu chí khác biệt giữa các nền tảng chưa? [Consistency, Spec §Bảng phạm vi nền tảng, FR-003]
- [x] **CHK012**: Ứng dụng Mobile có yêu cầu tích hợp trình quản lý mật khẩu của hệ điều hành (iCloud Keychain trên iOS, Google Password Manager trên Android) để đề xuất và lưu mật khẩu an toàn chưa? [Native Coverage, Spec §FR-017, US4]

---

## Bảng đánh giá chi tiết từng mục và căn cứ kiểm chứng

| Mã mục | Đánh giá sơ bộ | Căn cứ chất lượng yêu cầu / Đối chiếu tài liệu v0.2.0 |
|---|---|---|
| **CHK001** | **Đạt** | Spec §Phạm vi và nguồn thẩm quyền dẫn chiếu trực tiếp `password-policy.md v0.2.0`; Bảng truy vết liệt kê đầy đủ PWD-001…004, PWD-006, PWD-007 cùng mã FR/SC tương ứng. |
| **CHK002** | **Đạt** | Bảng truy vết ghi chú rõ ràng: PWD-005 không áp dụng cho luồng tạo mật khẩu mới A-01 (chỉ áp dụng cho đăng nhập/khôi phục). |
| **CHK003** | **Đạt** | Ánh xạ: PWD-001/002/003/004 → FR-003, SC-003; PWD-006 → FR-013, SC-005; PWD-007 → FR-014 (Plan Scope). |
| **CHK004** | **Đạt** | FR-003 và US3 Scenarios 1–2 nêu rõ biên 15–128 Unicode code points sau chuẩn hóa NFC; kiểm tra các ca biên 14, 15, 128, 129 ký tự. |
| **CHK005** | **Đạt** | FR-003, US3 Scenario 4 và Edge Cases xác định rõ: chuẩn hóa NFC, chấp nhận tiếng Việt có dấu, giữ nguyên khoảng trắng đầu/cuối (không trim mật khẩu), phân biệt hoa/thường. |
| **CHK006** | **Đạt sau sửa R4** | FR-003, US3 Scenario 3 và SC-003 đã được chuẩn hóa: Passphrase chỉ được chấp nhận nếu đủ 15–128 ký tự NFC VÀ không nằm trong blocklist phổ biến/đã lộ. Loại bỏ thanh đo cũ khỏi form đăng ký. |
| **CHK007** | **Đạt** | FR-003, US3 Scenario 5 và Assumptions quy định máy chủ kiểm tra danh sách mật khẩu yếu/lộ nội bộ; cấm gọi dịch vụ ngoài mang theo mật khẩu. |
| **CHK008** | **Đạt** | FR-013 và SC-005 đặt chỉ tiêu 0 trường hợp mật khẩu dạng bản rõ xuất hiện trong log, telemetry hoặc phản hồi API (chống rò rỉ theo PWD-006). |
| **CHK009** | **Đạt sau sửa R4** | FR-014 và Bảng truy vết phân định rõ: PWD-007 do Plan của Identity Service thiết kế cơ chế băm và lưu an toàn; không đồng nhất SC-005 với PWD-007. |
| **CHK010** | **Đạt** | FR-002, FR-006 và US3 Scenario 6 yêu cầu trường xác nhận mật khẩu đối khớp hoàn toàn từng ký tự, có phản hồi trực quan inline. |
| **CHK011** | **Đạt** | Bảng phạm vi nền tảng và FR-003 khẳng định cùng một chính sách mật khẩu cho Web, iOS và Android; không chia tách logic mật khẩu. |
| **CHK012** | **Đạt** | FR-017 và US4 Scenario 1 yêu cầu ứng dụng Mobile gắn đúng thuộc tính native autofill để hệ điều hành lưu mật khẩu an toàn. |

## Kết luận rà soát sơ bộ

Tất cả 12 tiêu chí chất lượng yêu cầu mật khẩu đã được cập nhật chính xác căn cứ trong [spec v0.3.2](../spec.md) theo đúng phản hồi từ finding R4.
Tài liệu sẵn sàng bàn giao cho Reviewer độc lập thực hiện xác nhận chính thức.
Chưa băm/lưu mật khẩu, chưa nạp dataset kiểm tra hay chạy vectors kiểm thử; các công việc này thuộc phạm vi kế hoạch triển khai (Plan/Tasks) sau khi được duyệt.

## Xác nhận Reviewer độc lập — 2026-11-22

**Reviewer**: Codex (AI, vai trò Reviewer độc lập theo yêu cầu của Chủ sản phẩm trong hội thoại này). Giữ nguyên đánh giá sơ bộ phía trên làm lịch sử.

- [x] Xác nhận CHK001–CHK012 ở mức chất lượng yêu cầu cho spec v0.3.2 được bảo toàn; đây không phải kết quả kiểm thử phần mềm.
- [x] CHK008 / PWD-006: thiết kế BFF đã cấm log raw body/headers, mật khẩu, token, cookie và internal service key; chỉ log metadata allowlist. Ca sentinel trong [quickstart](../quickstart.md) yêu cầu không rò rỉ qua response, log hoặc telemetry, khớp FR-013 và SC-005.
- [x] CHK009 / PWD-007: giữ ranh giới giữa thiết kế băm/lưu và tiêu chí chống rò rỉ; không dùng kết quả kiểm tài liệu làm bằng chứng Argon2id hoặc tích hợp A-03 đã chạy đạt.

**Phiên bản và kết luận**: áp dụng đúng 8 SHA-256 trong [xác nhận Reviewer tại requirements](requirements.md#xác-nhận-reviewer-độc-lập--2026-11-22), nhánh `docs/customer-registration`, HEAD nền `2a007797ac9ce542d9747aad0f44f3e430eec581`. Không còn finding mật khẩu mở trong phạm vi tái thẩm định này; đủ trình Chủ sản phẩm xem xét duyệt Plan trước bước `speckit-tasks`.

**Giới hạn**: chưa chạy vectors mật khẩu, nạp blocklist, kiểm thử hash/adapter hoặc ca sentinel thực tế. Xác nhận này không thay phê duyệt của Chủ sản phẩm, không phải nghiệm thu bảo mật runtime và không cấp quyền triển khai.

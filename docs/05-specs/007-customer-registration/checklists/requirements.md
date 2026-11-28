# Specification Quality Checklist: A-01 — Đăng ký tài khoản khách hàng (Web và Mobile)

**Purpose**: Rà soát sơ bộ chất lượng yêu cầu, tính đầy đủ, rõ ràng, nhất quán và khả năng nghiệm thu của [spec v0.3.2](../spec.md) để hỗ trợ Reviewer độc lập thẩm định lại lần 2; không kiểm phần mềm đã triển khai.  
**Created**: 2026-11-20 (cập nhật v0.3.2 ngày 2026-11-21 sau xử lý dứt điểm các điểm còn sót F1, F4 và delta nguồn F3)  
**Feature**: [spec v0.3.2](../spec.md)  
**Review Ownership**: Reviewer độc lập sở hữu và xác nhận các mục đánh giá. Agent chỉ hỗ trợ rà soát sơ bộ và cập nhật căn cứ kỹ thuật; không tự đánh dấu thay reviewer hoặc dùng kết quả tự rà làm phê duyệt độc lập.

## Content Quality

- [x] Mô tả rõ kết quả người dùng và hành vi hệ thống, không gán ghép chi tiết triển khai công nghệ nội bộ hoặc schema vật lý vào yêu cầu sản phẩm.
- [x] Tập trung vào giá trị cốt lõi của use case A-01 trên cả hai kênh Customer Web và Customer Mobile (iOS/Android), phân định rõ yêu cầu chung và phần riêng từng nền tảng.
- [x] Người duyệt sản phẩm dễ dàng theo dõi các luồng thành công, luồng ngoại lệ, ranh giới vai trò và kết quả đạt được.
- [x] Đáp ứng đầy đủ các phần bắt buộc của template Spec Kit đã được chuẩn hóa trong repository.

## Requirement Completeness

- [x] Không còn đánh dấu `NEEDS CLARIFICATION`; hai quyết định sản phẩm đã được chủ sản phẩm phê duyệt chính thức ngày 2026-11-21 (FR-007: Phương án B - phản hồi trung tính chống Account Enumeration; FR-012: Phương án A - không cấp phiên tự động, hướng dẫn A-02 và bộ nút điều hướng đồng nhất).
- [x] Mọi yêu cầu chức năng (FR-001…FR-021) đều có tiêu chí kết quả cụ thể và có thể kiểm chứng độc lập.
- [x] Tiêu chí thành công (SC-001…SC-009) phân biệt rõ giữa ngưỡng đã duyệt (NFR-PERF-01, PWD, NFR-ACC-01 §9.13.2 Bộ tham chiếu A) với các chỉ số đề xuất UX (thao tác < 2 phút, tỷ lệ hoàn tất >= 85%, thời gian p95 API < 1.5s cần đo baseline trong Plan).
- [x] Bao phủ toàn diện các ca kiểm thử: đăng ký thành công (có số điện thoại và không có số điện thoại), email trùng lặp (phản hồi trung tính anti-enumeration), email sai định dạng, mật khẩu ngắn/dài/passphrase/ký tự Unicode/mật khẩu phổ biến bị lộ, mất kết nối mạng.
- [x] Bổ sung đầy đủ mô hình 3 trạng thái lỗi hệ thống và mất phản hồi mạng (FR-021, SC-009): phân biệt rõ lỗi trước commit (HTTP 5xx trung thực), timeout sau commit (retry idempotent an toàn) và mất kết nối tại thời điểm commit (client báo lỗi kết nối trung thực).
- [x] Bao phủ các tình huống cạnh tranh và biên: nhấn nút liên tiếp (double click), spam yêu cầu đăng ký (Rate Limiting), khoảng trắng đầu/cuối của email và mật khẩu, gián đoạn kết nối tới Cinema Core khi đồng bộ hội viên.
- [x] Phân định ranh giới trong phạm vi và ngoài phạm vi rõ ràng: không tự ý mở rộng sang A-02, A-03, vai trò vận hành, mạng xã hội Google/Apple hay đặt vé trực tiếp.
- [x] Nêu rõ các phụ thuộc nền tảng: Identity Service thật, cơ chế băm mật khẩu, Dịch vụ Email (A-02), chuẩn UI và hợp đồng API.

## Feature Readiness

- [x] Ánh xạ yêu cầu đầy đủ:
  - US1 (Đăng ký thành công & Bù đắp hội viên): FR-001, FR-002, FR-008, FR-009, FR-010, FR-011, FR-012, FR-020; SC-001, SC-002, SC-007, SC-008.
  - US2 (Xử lý email trùng & phản hồi trung tính): FR-007, FR-015; SC-004.
  - US3 (Chính sách mật khẩu & bảo vệ credential): FR-003, FR-004, FR-005, FR-006, FR-013, FR-014; SC-003, SC-005.
  - US4 (Trải nghiệm Mobile native & trợ năng Bộ tham chiếu A): FR-016, FR-017, FR-018, FR-019; SC-006.
  - Xử lý lỗi hệ thống & khôi phục kết nối: FR-021; SC-009.
- [x] Cung cấp đầy đủ cơ sở để chuyển sang bước lập kế hoạch kỹ thuật (Plan) sau khi reviewer thẩm định đạt và chủ sản phẩm duyệt spec v0.3.2.
- [x] Kết quả nghiệm thu độc lập theo từng nền tảng: Cho phép Web nghiệm thu trước, Mobile nghiệm thu sau (FR-020, SC-008).

---

## Bảng theo dõi xử lý 4 findings (F1–F4) từ các đợt review độc lập

| Finding | Vấn đề reviewer nêu | Nội dung xử lý kỹ thuật trong Spec v0.3.2 | Căn cứ tài liệu / Vị trí |
|---|---|---|---|
| **F1 (P1)** | Màn hình kết quả còn làm lộ nhánh email qua các nút điều hướng riêng biệt (Đăng nhập + Gửi lại vs Đăng nhập + Khôi phục) | Quy định một màn hình tiếp nhận trung tính DUY NHẤT cho cả hai nhánh. Cùng thông điệp chuẩn hóa, cùng bộ 3 nút điều hướng ("Đăng nhập ngay" A-03, "Khôi phục mật khẩu" A-05, "Gửi lại email xác minh" A-02). Trạng thái kích hoạt của nút gửi lại chỉ phụ thuộc vào tính sẵn sàng của A-02 và cooldown chung, hoàn toàn độc lập với việc email có tồn tại hay không. Mở rộng ma trận A-02 bao phủ HTTP code, JSON payload, UI message, Action buttons và Button states. | Spec §US1 Scenario 6, US2 Scenario 1, FR-007, FR-010, FR-012, SC-004, Ma trận Anti-enumeration |
| **F2 (P2)** | Ma trận trợ năng sai nguồn; liệt kê NVDA/JAWS và để iOS thật tùy điều kiện | Kế thừa chính xác NFR-ACC-01 §9.13.2 (Bộ tham chiếu A đã duyệt ngày 2026-11-20): Web Windows dùng bàn phím + Narrator + Edge; Web iPhone dùng Safari/VoiceOver trên iPhone 11 Pro Max thật; Mobile iOS dùng VoiceOver trên iPhone 11 Pro Max thật; Mobile Android dùng TalkBack trên emulator (công bố khoảng trống máy thật theo NFR-PERF-02). | Spec §Bảng phạm vi nền tảng, FR-016, FR-018, SC-006 |
| **F3 (P2)** | NFR snapshot thay đổi đồng thời; mapping role_code trong DB draft; rà soát delta nguồn | Đối chiếu delta nguồn thực tế: NFR snapshot SHA-256 `75FDB7F32BCACF5896D7F99C97EEA8D7D0BDAF5B3BFC5B9C6B1C97B8DB85BB73` (xác nhận §9.13.2 Bộ tham chiếu A và §9.14 không đổi đối với A-01). DB Identity snapshot SHA-256 `F5DCE0B6B95DD0A74E671E39DDAB6E636A918459BF87E74B37AC962C2E828C60` (xác nhận cấu trúc `user_role_assignments.role_code = 'CUSTOMER'`). | sources.md, Spec §Key Entities, Bảng truy vết |
| **F4 (P2)** | Chưa phân biệt phản hồi HTTP với mất phản hồi mạng / crash (SC-009 bắt crash phải trả HTTP 5xx) | Chuẩn hóa mô hình 3 trạng thái lỗi: (1) Lỗi trước commit máy chủ còn sống -> trả HTTP 500/503 trung thực kèm `RegisterSystemErrorResponse`; (2) Đã commit nhưng mất phản hồi -> client timeout / retry idempotent an toàn không tạo duplicate; (3) Mất kết nối lúc commit -> client báo lỗi kết nối trung thực, server bảo đảm tính toàn vẹn (rollback hoặc bảo toàn, không tạo orphan data). | Spec §Edge Cases, FR-021, Key Entities (`RegisterSystemErrorResponse`), SC-009 |

## Kết luận rà soát sơ bộ

Tài liệu [spec v0.3.2](../spec.md) và [sources.md](../sources.md) đã hoàn tất việc xử lý triệt để toàn bộ các điểm cần khắc phục:
- Đã đồng nhất 100% màn hình tiếp nhận kết quả (F1), xóa bỏ hoàn toàn kênh lộ thông tin qua các nút điều hướng.
- Đã phân định rạch ròi mô hình 3 trạng thái lỗi hệ thống và mất phản hồi mạng (F4), loại bỏ yêu cầu phi lý bắt tiến trình crash phải trả HTTP response.
- Đã đối chiếu delta nguồn thực tế và đồng bộ dấu kiểm hash NFR / DB Identity (F3), bảo toàn chuẩn trợ năng Bộ tham chiếu A (F2).

Toàn bộ tài liệu được chuyển giao cho Reviewer độc lập tiến hành thẩm định và đánh giá chính thức trên các checklist theo quyền của Reviewer.
Chưa tự ý công bố spec đã được phê duyệt chính thức hoặc tự chuyển sang bước lập Plan.

## Xác nhận Reviewer độc lập — 2026-11-22

**Reviewer**: Codex (AI, vai trò Reviewer độc lập theo yêu cầu của Chủ sản phẩm trong hội thoại này). Xác nhận dưới đây bổ sung kết luận chính thức; giữ nguyên phần rà soát sơ bộ phía trên làm lịch sử.

- [x] Xác nhận các mục Reviewer-owned thuộc Content Quality, Requirement Completeness và Feature Readiness cho spec v0.3.2 đã review; spec và sources được bảo toàn theo snapshot dưới đây.
- [x] Đóng P2 về log BFF ở mức thiết kế: [endpoints](../contracts/endpoints.md), [research](../research.md) và [contract](../contracts/auth-registration.contract.ts) quy định metadata allowlist, cấm raw body/headers và bí mật trong log/telemetry; [quickstart](../quickstart.md) có ca sentinel kiểm tra response, log và telemetry theo FR-013, SC-005, PWD-006.
- [x] Đóng P3 về enum: ví dụ mã lỗi không được định nghĩa đã được loại bỏ; các ví dụ lỗi nhập liệu khớp `RegisterClientErrorResponseSchema`.
- [x] Ba bảng đối chứng BFF cùng 7 ca thống nhất status/schema/code/kết quả; lỗi nhập liệu giữ 400, lỗi chuyển tiếp nội bộ và phản hồi dị thường về 500 an toàn, rate limit giữ 429.
- [x] Kiểm tra cấu trúc 9 tài liệu Markdown và 72 liên kết nội bộ: không có đích tệp thiếu, code fence chưa đóng hoặc lệch số cột bảng tại thời điểm xác nhận trước khi bổ sung phần này.

**Snapshot đã thẩm định**: worktree `C:\Users\NhiBuaa\.codex\worktrees\docs-customer-registration\movie-booking-agent`, nhánh `docs/customer-registration`, HEAD nền `2a007797ac9ce542d9747aad0f44f3e430eec581`. Các artifact đang chưa commit; SHA-256 là định danh phiên bản nội dung.

| Artifact | SHA-256 |
|---|---|
| `spec.md` | `162F68FB4017802FFF9B77042AE70F67D2696609D1D69A6C0CBB8F9C47829642` |
| `sources.md` | `366DFF204E05B4CA64E4EF708B4CDEBEE02E1CE1A20EF001589A3DDCD1EC583F` |
| `data-model.md` | `CFE758E9EE619A5A1133246A2FF32A8A7E000691D5D2B0BF623A0FE777F4BF9D` |
| `plan.md` | `682BAF7CB91FCD8DA374B254297A886BCF09D022EFB85C8270B7DD4C79090390` |
| `research.md` | `5668818AA7C949885722F16E0E3E98465E138D8DA292638A8AA9A8FE3524B65E` |
| `contracts/auth-registration.contract.ts` | `39692A2F9423885B667DE7C437515189C4F1768B3CD7DE8C1356BB9D8F76F6FD` |
| `contracts/endpoints.md` | `FC9D5E4467E73FBB19E863DE8740DB362795C2A09010668FCB29E09480A89791` |
| `quickstart.md` | `A9B85B6C65D853C967C19A7AED006270E1D2DA6ABB978349F377BF936F868FC8` |

**Kết luận theo giai đoạn**: Đạt ở mức tài liệu để Chủ sản phẩm xem xét ký duyệt Implementation Plan và cho phép chuyển sang `speckit-tasks`. Không còn finding mở trong phạm vi tái thẩm định này. Xác nhận Reviewer không thay phê duyệt của Chủ sản phẩm và không cấp quyền triển khai.

**Giới hạn bằng chứng**: chưa chạy runtime, typecheck, codegen hoặc ca sentinel thực tế; ca kiểm chứng mới là thiết kế. Chưa có `tasks.md`, chưa thực hiện `speckit-analyze`, chưa xác nhận truy vết đến tasks hoặc nghiệm thu phần mềm. Đợt này chỉ bổ sung xác nhận vào hai checklist, không sửa artifact thiết kế hay commit/push.

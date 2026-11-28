# Specification Quality Checklist: A-03 — Đăng nhập khách hàng Web và Mobile

**Purpose**: Kiểm chất lượng yêu cầu trước duyệt spec, không kiểm phần mềm đã triển khai.
**Created**: 2026-11-20
**Feature**: [spec v0.3.2](../spec.md)

## Content Quality

- [x] Mô tả kết quả người dùng, không chọn API/schema/thuật toán triển khai.
- [x] Tập trung giá trị và phạm vi Customer Web/Mobile, phân biệt Web desktop/trình duyệt điện thoại với app iOS/Android.
- [x] Người duyệt sản phẩm đọc được luồng, quyền, ngoại lệ và kết quả.
- [x] Đủ các phần bắt buộc của template spec đã resolve.

## Requirement Completeness

- [x] Không còn marker NEEDS CLARIFICATION; ba câu trả lời ban đầu và ba nhóm quyết định mật khẩu sau phê duyệt đã ghi đúng nguồn/phiên bản.
- [x] Yêu cầu có kết quả có thể kiểm; tham số phiên/rate/hash là đề xuất plan phải duyệt trước giao code.
- [x] Success Criteria đo được theo bộ ca và số vi phạm, không bịa SLA/tải mới.
- [x] Success Criteria không phụ thuộc thư viện/cấu trúc mã.
- [x] Có ca đúng/sai, email chưa xác minh, thiếu quyền, lỗi nguồn danh tính, legacy đúng/sai và mật khẩu bị lộ.
- [x] Có cạnh tranh tab/logout, phản hồi muộn, đổi tài khoản và đích không hợp lệ.
- [x] Phạm vi trong/ngoài rõ, phần hỗ trợ mới ghi là đề nghị duyệt.
- [x] Nêu phụ thuộc Identity thật, tài khoản thử, NFR và DB draft.

## Feature Readiness

- [x] Ánh xạ FR: 001–003/006 → US1; 004–005/009–011/022 → US2; 007–008/012–014/018 → US3; 015–017/019 → US1/US4/Edge Cases/SC-004–006; 020 → Shared Policies & Dependencies/Edge Cases/SC-007; 021/023/024 → US4/SC-004–005/SC-008.
- [x] Bao phủ login, duy trì/kết thúc phiên và từ chối sai quyền.
- [x] Kết quả đo được theo SC, không suy code mẫu thành đạt nghiệm thu.
- [x] Không đưa endpoint/migration/mặc định thư viện vào yêu cầu sản phẩm.

## Notes

- Bản v0.1.0 từng được tự rà 16/16 nhưng bỏ sót chính sách mật khẩu. Đối chiếu v0.2.0: 12/16 đạt, 4 mục chuyển về chưa đạt; không có mục mới chuyển sang đạt. Đây là kiểm chất lượng yêu cầu, không là phê duyệt hoặc nghiệm thu phần mềm.
- Bản v0.3.0 mở rộng sang Web/iOS/Android: rà lại cùng 16 mục, vẫn 12/16 đạt và 4 mục mật khẩu chưa đạt; chưa có kết quả kiểm phần mềm. Giữ các mục reviewer-owned riêng chưa đánh dấu.
- Ở v0.3.0, các mục chưa đạt là PWD thiếu hành vi/ca legacy. Sau đó chủ sản phẩm trực tiếp chọn A cho ba nhóm mật khẩu mới/Unicode/legacy, ghi tại [chuẩn v0.2.0](../../../04-standards/password-policy.md). Spec v0.3.1 tích hợp US1 ca 6/7 và SC-007; tự rà nền 12/16 → 16/16, bốn mục trên chuyển sang đạt, không có mục hồi quy. Đây chỉ là chất lượng yêu cầu, không là runtime hoặc phê duyệt plan.
- Chủ sản phẩm đã duyệt spec nền v0.3.0 trong hội thoại ngày 2026-11-20, gắn SHA256 tại mục Approval; ba nhóm trả lời sau đó là nguồn phê duyệt bổ sung riêng, không suy từ lần duyệt chung.
- Tham số phiên/chống thử sai, token/thu hồi, topology và hòa giải DB draft để bước plan; chưa có quyết định bắt buộc thì chưa giao code.
- Sau làm rõ mật khẩu đã lập Phase 1 plan/data model/contracts/quickstart để duyệt. Sau đó chủ sản phẩm yêu cầu “phân thành task đi”; đã tạo [tasks v0.1.0](../tasks.md) từ plan v0.2.0. Kết quả analyze báo riêng trong hội thoại; implement/converge chưa chạy, không tự đánh dấu checklist reviewer-owned.
- Vòng hoàn tất chuẩn bị theo yêu cầu riêng ngày 2026-11-20 đã rà spec v0.3.2/plan v0.3.0/tasks v0.2.0. Quyết định thử sai được hỏi và đồng ý riêng; hai custom checklist được đánh giá theo ủy quyền, có nhận xét từng mục. Bộ tự rà nền vẫn 16/16, không dùng nó thay kết quả custom hoặc nghiệm thu phần mềm.

## Kết quả rà làm rõ

Ba câu hỏi ban đầu và ba nhóm câu hỏi mật khẩu sau phê duyệt đã được trả lời và tích hợp. Các tham số phiên/rate/hash/version thuộc đúng plan được chủ sản phẩm yêu cầu dùng để chia tasks; chưa là quyền code hoặc kết quả qualification. Checklist reviewer-owned không tự đổi marker theo tự rà nền này.

| Nhóm | Kết luận |
|---|---|
| Phạm vi/hành vi, actor và quyền | Spec chung Customer Web và Customer Mobile iOS/Android theo yêu cầu mới; không cấp quyền vận hành |
| Khái niệm dữ liệu và vòng đời | Rõ ở mức yêu cầu; schema cụ thể dành cho plan |
| Hành trình, lỗi, khả năng tiếp cận | US1–US3 chung, US4 native; có phần riêng và bằng chứng Web/iOS/Android, ma trận cụ thể thiết kế ở plan |
| Bảo mật và riêng tư | PWD khách hàng đã chốt/ghi ca legacy; tham số phiên/chống thử sai/hash theo plan được dùng chia tasks |
| Tích hợp và phụ thuộc | Đã nêu owner/hiện trạng; hợp đồng/topology/thu hồi dành cho plan |
| Ngoại lệ và xử lý cạnh tranh | Tab Web, phiên độc lập Web/Mobile, logout, đổi người dùng, app nền/mở lại, mất mạng, lỗi lưu phiên, liên kết và phản hồi muộn |
| Ràng buộc và thuật ngữ | Kế thừa nguồn; không đổi stack hoặc chính sách chưa duyệt |
| Hiệu năng và điều kiện đo | Chưa tạo SLA login; xác định NFR áp dụng ở plan, giữ giới hạn bằng chứng Android thật đã duyệt |
| Dấu hiệu hoàn thành | Spec nền/PWD được duyệt; đã được yêu cầu chia tasks theo plan, chưa giao code hoặc nghiệm thu runtime |

## Kiểm tra tài liệu

- Kiểm cấu trúc/liên kết bằng `check-kit.ps1` chỉ chứng minh tính toàn vẹn tài liệu; không thay kết luận các mục yêu cầu còn thiếu ở trên. Kết quả lần chạy hiện hành được báo trong hội thoại.
- Spec Kit `-Json -PathsOnly` phân giải đúng `006-customer-login`; trường BRANCH của script là tên feature suy ra, không là bằng chứng đã tạo nhánh Git.
- Ở giai đoạn chỉ soạn spec, `check-prerequisites.ps1 -Json -RequireSpec` đồng thời đòi plan nên chưa qua. Sau duyệt spec đã chạy setup-plan thật; không tạo plan giả để vượt kiểm hoặc coi prerequisite qua là thiết kế đã hoàn tất.
- Không có `.specify/extensions.yml` trong worktree, không có hook trước/sau specify/checklist cần thực thi.
- Chưa chạy test/build/runtime vì chỉ thay tài liệu; không có sơ đồ mới hoặc sửa sơ đồ trong bộ này.
- Với speckit-checklist ở giai đoạn spec trước phê duyệt, đã dùng `-PathsOnly` để phân giải feature và `resolve-template.ps1 checklist-template -Json` để lấy template được phối hợp vì prerequisite đòi plan; không sửa script hoặc mở plan trước bước duyệt.

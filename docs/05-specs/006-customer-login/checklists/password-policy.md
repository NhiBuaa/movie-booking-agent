# Password Policy Checklist: A-03 — Đăng nhập khách hàng Web và Mobile

**Purpose**: Rà chất lượng yêu cầu mật khẩu và tính nhất quán với nguồn chung trước duyệt spec; không kiểm phần mềm.
**Created**: 2026-11-20
**Feature**: [spec v0.3.2](../spec.md)
**Review context**: Plan v0.3.0/tasks v0.2.0, theo yêu cầu hoàn tất chuẩn bị ngày 2026-11-20; chỉ đánh giá chất lượng yêu cầu.

**Note**: Sinh bằng speckit-checklist từ template được resolve của dự án; mức rà tiêu chuẩn, tập trung nguồn chung và yêu cầu mật khẩu.
**Review Ownership**: Reviewer đánh giá các mục. Mục mới giữ `[ ]`; `[x]` chỉ nghĩa đã rà và đạt chất lượng yêu cầu, không là implementation hoàn tất.

## Shared Policies & Dependencies

- [x] CHK001 Spec đã xác định nguồn sở hữu, mã/phiên bản, trạng thái và phạm vi từng chính sách mật khẩu áp dụng chưa? [Completeness, Spec §Shared Policies & Dependencies]
- [x] CHK002 Quyết định thiếu/mâu thuẫn đã được giải quyết hoặc ghi rõ phạm vi, người quyết định và bước bị chặn, không kết luận phần phụ thuộc đã sẵn sàng chưa? [Clarity, Gap, Spec §Shared Policies & Dependencies]
- [x] CHK003 Mỗi mục áp dụng đã ánh xạ tới FR/SC và, khi được lập, thiết kế/task/cách kiểm; các artifact chưa có được ghi rõ chưa đánh giá chưa? [Traceability, Spec §Shared Policies & Dependencies]

## Requirement Completeness & Clarity

- [x] CHK004 PWD-001 đã chốt giới hạn/đơn vị đếm và phân biệt giới hạn tạo mật khẩu mới với đầu vào đăng nhập chưa? [Gap, PWD-001, Spec §FR-020]
- [x] CHK005 PWD-002 đã quy định cách xử lý khoảng trắng/Unicode nhất quán cho tạo mới và xác minh, đủ để xác định kết quả các ca biên chưa? [Gap, PWD-002, Spec §Edge Cases]
- [x] CHK006 PWD-003/PWD-004 đã có quyết định về quy tắc mật khẩu mới, danh sách mật khẩu bị chặn và quan hệ áp dụng ở A-03, thay vì kế thừa từ helper/UI mẫu chưa? [Gap, PWD-003–004, Spec §FR-020]
- [x] CHK007 PWD-005 đã xác định hành vi đăng nhập/chuyển đổi cho mật khẩu cũ và bằng chứng bị lộ, kể cả ảnh hưởng phiên nếu có chưa? [Gap, PWD-005, Spec §Edge Cases/SC-007]

## Requirement Consistency & Acceptance Criteria

- [x] CHK008 Yêu cầu A-03 có nhất quán với nguồn chung cho A-01/A-04/A-05, giữ phạm vi chưa triển khai các luồng đó và không tự đặt ngoại lệ chưa duyệt chưa? [Consistency, Spec §Phạm vi và nguồn thẩm quyền/FR-020]
- [x] CHK009 SC-007 đã có đủ chính sách được duyệt để xác định kết quả mong đợi cho độ dài/ký tự/mật khẩu cũ, cùng phiên bản ca nghiệm thu chưa? [Measurability, Gap, Spec §SC-007]
- [x] CHK010 PWD-006 đã có tiêu chí không lộ bí mật và PWD-007 được ghi rõ là cơ chế cần thiết kế/duyệt ở plan, không coi tham số DB draft là quyết định chưa? [Consistency, Spec §FR-014/SC-005/Shared Policies & Dependencies]

## Bổ sung phạm vi Web và Mobile — v0.3.0

- [x] CHK011 Yêu cầu mật khẩu và cách xử lý mật khẩu cũ có cùng nguồn/phiên bản cho Web/iOS/Android, các khác biệt UI/nhập liệu không tự thành chính sách mật khẩu khác chưa? [Consistency, Spec §FR-020/Shared Policies & Dependencies]
- [x] CHK012 Yêu cầu ghi nhớ/lưu phiên native phân biệt credential phiên với mật khẩu và có ca lỗi dữ liệu phiên, không suy ghi nhớ thành lưu mật khẩu chưa? [Coverage, Spec §FR-004/FR-021/US4]

## Notes

- Tại mốc sinh ban đầu, 10 mục mới chưa được reviewer đánh giá; không tự đánh dấu đạt từ việc sinh checklist.
- Mốc mở rộng v0.3.0 giữ nội dung/trạng thái CHK001…CHK010, cập nhật tên/link phiên bản và thêm CHK011…CHK012; tổng 12 mục chưa được đánh giá ở mốc đó. Hai mục bổ sung không là kết luận 10 mục cũ đã đạt.
- Nguồn chính sách hiện hành: [password-policy v0.2.0](../../../04-standards/password-policy.md); chủ sản phẩm chọn ba nhóm A, đã chốt hành vi PWD khách hàng. Cơ chế PWD-007/dataset và phiên/rate theo plan v0.2.0 được dùng chia tasks qua yêu cầu chuyển bước, chưa là quyền triển khai hoặc kết quả qualification.
- Khi sinh checklist v0.3.0 chưa có plan/tasks. Sau đó tasks v0.1.0 được lập nhưng chưa đánh giá 12 marker. Vòng rà được chủ sản phẩm giao sau đó đọc bộ hiện hành và ghi từng nhận xét bên dưới; không coi có liên kết là đủ để đánh dấu đạt.
- speckit-implement chỉ đọc trạng thái checklist như một điều kiện, không sửa checkbox. Bản tự rà nền [requirements.md](requirements.md) có vòng đời riêng do specify/clarify duy trì.

## Đánh giá theo yêu cầu hoàn tất chuẩn bị — 2026-11-20

Chủ sản phẩm yêu cầu “thực hiện nốt các phần còn lại” sau khi được báo 12 mục mật khẩu còn cần rà.
Codex hỗ trợ đánh giá tài liệu theo quyền đó; không phải nghiệm thu verifier/hash hoặc phê duyệt chính sách mới.
Nguồn: [W — password-policy v0.2.0](../../../04-standards/password-policy.md), [S — spec v0.3.2](../spec.md),
[P — plan v0.3.0](../plan.md), [D — data model](../data-model.md), [T — tasks v0.2.0](../tasks.md),
[Q — quickstart](../quickstart.md). Mốc phê duyệt giữ tại [sources](../sources.md).

| Mục | Kết luận chất lượng yêu cầu / căn cứ |
|---|---|
| CHK001 | Đạt — W PWD-001…007 và S Shared Policies có owner/phiên bản/phạm vi/nguồn duyệt, không dùng form mẫu làm chuẩn. |
| CHK002 | Đạt — P §4/§8 tách hành vi đã chốt với qualification dataset/legacy/cost; D chặn profile chưa nhận diện, không cho tự suy policy. |
| CHK003 | Đạt — S FR-020/SC-007 → P §4 → T005/T009/T011/T013/T018/T043 và Q §2/§4, có ca và nguồn cần đối chiếu. |
| CHK004 | Đạt — W PWD-001 giới hạn tạo mới sau NFC; W PWD-005/S US1 ca 6/D manifest tách input legacy, không áp minimum tạo mới cho login. |
| CHK005 | Đạt — W PWD-002 nêu NFC/code point/whitespace/case; S Edge Cases/P §4/T011 phân verifier/version cũ và vectors mới. |
| CHK006 | Đạt — W PWD-003/004 không bắt composition, blocklist có phiên bản ở server và không gửi mật khẩu ngoài; P §4/R-08 pin candidate/giấy phép, lỗi dataset dừng fixture. |
| CHK007 | Đạt — W PWD-005/S US1 ca 6–7/P §4 phân yếu với bị lộ, giữ verifier cũ, không rehash hoặc tự mở reset/thu hồi mọi phiên; phiên hiện có vẫn theo FR-009/010. |
| CHK008 | Đạt — W §4/S ngoài scope giữ A-01/04/05 tham chiếu chung, chưa triển khai thêm hoặc dùng chuẩn khác cho A-03. |
| CHK009 | Đạt — S SC-007 có kết quả rõ cho mới/legacy/compromised; T011 nêu biên mới và D manifest là prerequisite cho vectors legacy, không nhận đã chạy. |
| CHK010 | Đạt sau hòa giải — W PWD-006/007, P §4/§5.1 và T002/T013/T033 tách bí mật/cơ chế A-03/cost/runtime, không biến tham số DB draft thành chuẩn. |
| CHK011 | Đạt — S FR-020/022, H snapshot và T036/T038/T043 cùng policy/version; không tạo quy tắc Unicode/độ mạnh riêng cho native. |
| CHK012 | Đạt — S FR-004/021/US4, P §2–3/D native/T036–037 phân mật khẩu với credential, kho từng mode và lỗi không fallback mất an toàn. |

**Kết luận**: 12/12 tiêu chí chất lượng yêu cầu mật khẩu được đáp ứng ở phạm vi A-03 trên tài liệu.
Chưa cài thư viện, lấy dataset, băm/xác minh mật khẩu hoặc chạy vectors; các việc đó vẫn là task triển khai.

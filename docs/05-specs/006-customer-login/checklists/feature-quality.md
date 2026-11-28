# Requirements Quality Checklist: A-03 — Đăng nhập khách hàng Web và Mobile

**Purpose**: Rà toàn diện chất lượng yêu cầu A-03: đầy đủ, rõ ràng, nhất quán, bao phủ tình huống và có thể nghiệm thu trước bàn giao cho agent code.
**Created**: 2026-11-20
**Version**: v0.2.0 — đã đánh giá chất lượng tài liệu theo yêu cầu hoàn tất phần chuẩn bị.
**Feature**: [Spec v0.3.2](../spec.md)
**Context**: [Plan v0.3.0](../plan.md), [tasks v0.2.0](../tasks.md), [nguồn và phê duyệt](../sources.md).
**Depth / Audience / Timing**: Toàn diện trong phạm vi A-03, ưu tiên rủi ro danh tính/phiên/quyền; dành cho reviewer rà tài liệu trước bàn giao triển khai.

**Note**: Sinh bằng `speckit-checklist` theo template được resolve của repository và yêu cầu trực tiếp của chủ sản phẩm. Các câu hỏi đánh giá nội dung yêu cầu đã viết; không phải ca kiểm thử phần mềm.
**Review Ownership**: Reviewer sở hữu đánh giá từng mục. Tất cả mục mới giữ `[ ]`; agent chỉ hỗ trợ đánh giá khi reviewer yêu cầu rõ.
**Marker Semantics**: `[x]` nghĩa reviewer xác định tiêu chí chất lượng yêu cầu đã được đáp ứng; không nghĩa đã viết code, kiểm thử đạt hoặc nghiệm thu phần mềm.

## Shared Policies & Dependencies — Nguồn chính sách dùng chung

- [x] CHK001 Các chính sách BR/PWD/NFR/ADR áp dụng đã có nguồn sở hữu, mã/phiên bản, trạng thái phê duyệt và phạm vi Customer được xác định, đồng thời phân biệt phần đã duyệt với đề xuất từ NFR/DB chưa hợp nhất chưa? [Completeness, Spec §Shared Policies & Dependencies, Sources §Nguồn chưa hợp nhất]
- [x] CHK002 Mỗi quyết định chính sách còn thiếu hoặc mâu thuẫn đã được giải quyết hoặc ghi rõ phạm vi hoãn, người quyết định và phần việc bị chặn, thay vì coi nguồn nháp hoặc mặc định công cụ là quyết định chưa? [Clarity, Gap, Spec §Shared Policies & Dependencies, Plan §Constitution Check]
- [x] CHK003 Mỗi chính sách áp dụng đã truy được tới FR/SC, thiết kế, task và tiêu chí kiểm chứng tương ứng trong bộ tài liệu hiện có; các mục không áp dụng có lý do thay vì bị bỏ khỏi phạm vi rà chưa? [Traceability, Spec §Shared Policies & Dependencies, Tasks §Ánh xạ yêu cầu – thiết kế – task – hiện trạng]

## Requirement Completeness — Tính đầy đủ

- [x] CHK004 Phạm vi đã xác định một tính năng chung cho Customer Web/iOS/Android, phần riêng từng nền tảng và các loại đăng nhập/vai trò/luồng tài khoản bị loại khỏi A-03 đủ để tránh mở rộng chức năng ngoài ý định chưa? [Completeness, Spec §Phạm vi và nguồn thẩm quyền, Spec §FR-001/FR-008/FR-022]
- [x] CHK005 Yêu cầu form đã bao phủ trạng thái ban đầu, nhãn, trình quản lý mật khẩu, ẩn/hiện mật khẩu, lựa chọn ghi nhớ và các trạng thái chờ/lỗi mà không dùng thông tin mẫu như dữ liệu khách thật chưa? [Completeness, Spec §FR-002/FR-004/FR-012/FR-017/FR-024]
- [x] CHK006 Quyền theo trạng thái tài khoản và xác minh email đã nêu đủ khác biệt giữa đăng nhập, duy trì phiên, đọc đơn cũ và giữ/mua mới; tài khoản chờ đóng được phân biệt với khóa/đã xóa chưa? [Completeness, Spec §FR-006/FR-008/FR-009, Spec §Edge Cases, Data model §Chuyển trạng thái]
- [x] CHK007 Yêu cầu nhận diện đã xác định dữ liệu tối thiểu được phép hiển thị và ranh giới dữ liệu riêng tư của hồ sơ/đơn/vé/QR/chat, kể cả khi chưa có dữ liệu thật; không tự tạo hồ sơ mẫu hoặc gộp hành vi khách chưa? [Completeness, Spec §FR-003/FR-005/FR-011/FR-019]
- [x] CHK008 Ranh giới bảo vệ đã được liệt kê đầy đủ cho giữ/hủy chỗ, đơn, thanh toán và vé, đồng thời nêu riêng dữ liệu công khai và thông báo thanh toán có bằng chứng xác thực độc lập chưa? [Coverage, Spec §US3/FR-007/FR-018, Plan §1]

## Requirement Clarity — Tính rõ ràng

- [x] CHK009 Các khái niệm tài khoản, định danh ổn định, phiên logic, tab chung phiên và phiên độc lập đã được phân biệt đủ rõ để người triển khai không đồng nhất email, thiết bị hoặc dữ liệu lưu cục bộ với bằng chứng danh tính chưa? [Clarity, Spec §Key Entities/FR-007/FR-010/FR-022]
- [x] CHK010 Hai loại phiên đã được mô tả không mơ hồ về mặc định, thời hạn không hoạt động/tối đa và khả năng giữ trạng thái qua tải lại, đóng/mở trình duyệt, ra nền và kết thúc tiến trình app trên từng nền tảng chưa? [Clarity, Spec §FR-004/FR-021/FR-023, Plan §2]
- [x] CHK011 Khái niệm hoạt động hợp lệ để gia hạn đã được định nghĩa cùng nguồn thời gian, giới hạn gia hạn và các hoạt động không được tính, đủ để xác định khách còn phiên hay phải xác thực lại chưa? [Clarity, Spec §FR-004/FR-009, Plan §2, Data model §Chuyển trạng thái]
- [x] CHK012 Yêu cầu đăng xuất đã phân biệt kết thúc được máy chủ xác nhận, không có bằng chứng phiên hợp lệ cục bộ và chưa xác nhận do sự cố; mỗi kết quả có ý nghĩa rõ với dữ liệu riêng tư và quyền thử lại chưa? [Clarity, Spec §US2/FR-010/FR-011/FR-012, Plan §3, Contract §Kết quả và lỗi]
- [x] CHK013 Quy tắc điểm đến hợp lệ, đích mặc định, đích không thuộc quyền và hành động sau xác thực đã đủ cụ thể để không suy đăng nhập thành quyền tự phát lại giao dịch hoặc kéo dài giữ ghế chưa? [Clarity, Spec §US1/US4/FR-015/FR-016]

## Requirement Consistency — Tính nhất quán

- [x] CHK014 Yêu cầu chung về danh tính, mật khẩu, quyền và hai loại phiên có nhất quán giữa Web/iOS/Android, trong khi khác biệt lưu phiên, tương tác và vòng đời chỉ nằm ở phần riêng nền tảng chưa? [Consistency, Spec §Phạm vi nền tảng và nghiệm thu/FR-020/FR-021/FR-022/FR-024, Plan §2]
- [x] CHK015 Các yêu cầu bảo vệ tài nguyên có thống nhất rằng quyền do phía có thẩm quyền quyết định, không từ định danh/quyền khách tự khai; quyền Customer không bị diễn giải thành quyền vận hành chưa? [Consistency, Spec §FR-006/FR-007/FR-008, Plan §1, Contract §AuthContext cho API BFF và owner]
- [x] CHK016 Yêu cầu A-03 có giữ nguyên thẩm quyền giao dịch của Core, giới hạn credential của Agent và bằng chứng xác nhận tiền/vé độc lập; không coi bridge hiện tại là hoàn tất xác thực mọi service chưa? [Consistency, Spec §FR-014/FR-018/Assumptions, Plan §1, Constitution §I/II/III]
- [x] CHK017 Thiết kế và phạm vi task có giữ nguyên các quyền, ngoại lệ và tiêu chí của spec; mọi việc bổ sung đều truy được tới yêu cầu hoặc phụ thuộc cần thiết, không mở thêm đăng ký/reset/Organizer/toàn bộ booking native chưa? [Consistency, Spec §Phạm vi và nguồn thẩm quyền, Plan §Technical Context (Scale/Scope), Tasks §Implementation Strategy]

## Acceptance Criteria Quality — Chất lượng tiêu chí nghiệm thu

- [x] CHK018 Mỗi FR-001…FR-024 đã có kết quả mong đợi đủ xác định và được ánh xạ tới SC/hành trình, thiết kế cùng task tương ứng; độ phủ liên kết được phân biệt với bằng chứng đạt chưa? [Measurability, Spec §Requirements/Success Criteria, Tasks §Ánh xạ yêu cầu – thiết kế – task – hiện trạng]
- [x] CHK019 Các tiêu chí “0” vi phạm ở SC-001/002/005/006/007/008 đã xác định phạm vi ca, đối tượng dữ liệu/tác dụng phụ và nguồn đối chiếu, bao gồm cả kết quả đúng quyền, đủ để tránh kết luận chỉ từ màn hình hoặc thông báo thành công chưa? [Measurability, Spec §SC-001/SC-002/SC-005/SC-006/SC-007/SC-008, Quickstart §4]
- [x] CHK020 Tiêu chí về phiên và trợ năng đã có biên điều kiện, tập tiêu chí áp dụng và ma trận nền tảng được xác định hoặc dẫn tới nguồn phiên bản rõ; phần chưa chốt có được ghi là điều kiện chặn thay vì để người triển khai tự chọn chưa? [Measurability, Gap, Spec §SC-003/SC-004/SC-008, Plan §2, Quickstart §5]
- [x] CHK021 Yêu cầu bằng chứng đã tách Web desktop/trình duyệt điện thoại, iOS, Android, môi trường mô phỏng/máy thật và từng đợt nghiệm thu; giới hạn chưa kiểm có ngăn suy kết quả một kênh thành hoàn tất cả A-03 chưa? [Acceptance Criteria, Spec §Phạm vi nền tảng và nghiệm thu/SC-008, Quickstart §5/§6]

## Scenario Coverage — Bao phủ hành trình

- [x] CHK022 Các hành trình chính và thay thế đã nêu kết quả cho khách có/không có phiên, email đã/chưa xác minh, tài khoản chờ đóng và lựa chọn thường/ghi nhớ mà không tạo thêm quyền hoặc tự xác minh thông tin chưa? [Coverage, Spec §US1/US2/FR-003/FR-006]
- [x] CHK023 Yêu cầu ngoại lệ đã phân biệt đầu vào sai, thông tin xác thực sai, phiên không hợp lệ, thiếu quyền, giới hạn thử sai và nguồn danh tính không đáp ứng, kèm thông điệp/khả năng tiếp tục trung thực chưa? [Coverage, Spec §US3/FR-009/FR-012/FR-013, Contract §Kết quả và lỗi]
- [x] CHK024 Yêu cầu khôi phục đã mô tả rõ quyền thử lại sau đăng xuất chưa xác nhận hoặc lỗi lưu phiên, trạng thái riêng tư trong thời gian chờ và việc không tự khôi phục giao dịch/phiên/dữ liệu người cũ chưa? [Coverage, Recovery, Spec §US2/US4/FR-011/FR-021, Plan §3]
- [x] CHK025 Yêu cầu đồng thời đã bao phủ gửi lặp, đăng nhập/đăng xuất/gia hạn cạnh tranh, nhiều tab và phản hồi muộn khi A chuyển sang B, gồm cả ảnh hưởng tới bằng chứng phiên chứ không chỉ trạng thái giao diện chưa? [Coverage, Spec §US2/US3/FR-010/FR-011/FR-023, Contract §Logout, đồng thời và retry]
- [x] CHK026 Các đường thay thế về khám phá công khai, chức năng đăng ký/khôi phục/xác minh chưa hỗ trợ và thông báo thanh toán độc lập đã có yêu cầu rõ khi đăng nhập không khả dụng, không tạo lời hứa chức năng giả chưa? [Coverage, Spec §US3/FR-016/FR-018, Spec §Phạm vi và nguồn thẩm quyền]

## Edge Case Coverage — Bao phủ điều kiện biên

- [x] CHK027 Chất lượng yêu cầu mật khẩu đã được dẫn tới checklist chuyên sâu, phân biệt chuẩn hóa email với mật khẩu mới/cũ và phân biệt yếu theo policy mới với có bằng chứng bị lộ; giới hạn chưa xác định có được giữ là khoảng trống cần xử lý chưa? [Coverage, Gap, Spec §Edge Cases/FR-020/SC-007, Password checklist §Requirement Completeness & Clarity]
- [x] CHK028 Các điều kiện ngay trước/đúng/sau hạn, phiên đã bị vô hiệu và trạng thái tài khoản thay đổi đã có yêu cầu nhất quán về từ chối/gia hạn, không cho phép phục hồi phiên từ dữ liệu cũ hoặc sự cố nguồn chưa? [Edge Case, Spec §FR-004/FR-009/SC-003, Data model §Chuyển trạng thái]
- [x] CHK029 Yêu cầu native đã bao phủ mở mới, kết thúc tiến trình, ra nền/quay lại, liên kết cũ/sai/ngoài quyền, mất hoặc hỏng dữ liệu phiên và phản hồi đến sau đổi tài khoản, với kết quả danh tính/đích đủ rõ chưa? [Edge Case, Spec §US4/FR-015/FR-021/FR-023]
- [x] CHK030 Yêu cầu cách ly dữ liệu đã phân biệt hết phiên, đăng xuất, đổi tài khoản và mất mạng; phạm vi QR/vé offline, lưu giữ/backup/cài lại còn thuộc B-07 có được nêu rõ để tránh tự xóa dữ liệu nghiệp vụ hoặc tự quyết quyền xem offline chưa? [Edge Case, Spec §Edge Cases/FR-011/FR-019, Plan §3]

## Non-Functional Requirements — Yêu cầu phi chức năng

- [x] CHK031 Yêu cầu bảo vệ bí mật và dữ liệu cá nhân đã bao phủ cả đường thành công/lỗi, chẩn đoán, liên kết, AI và bằng chứng công bố, với giới hạn dữ liệu tối thiểu và nguồn NFR riêng tư rõ ràng chưa? [Completeness, Spec §FR-014/FR-021/SC-005, Spec §Shared Policies & Dependencies]
- [x] CHK032 Yêu cầu chống thử sai đã xác định phạm vi tính, ngưỡng, thời gian chờ/khôi phục, công suất hữu hạn và phản ứng khi nguồn bắt buộc lỗi, đồng thời nhất quán với yêu cầu không tiết lộ tài khoản tồn tại chưa? [Clarity, Spec §FR-012/FR-013, Plan §4]
- [x] CHK033 Ranh giới tin cậy và bảo vệ yêu cầu thay đổi trạng thái đã được mô tả cho cả hai kênh, gồm nguồn gửi không hợp lệ, giả định danh/quyền và thiếu chủ tài nguyên; dấu hiệu khai loại client có được phân biệt với bằng chứng danh tính chưa? [Completeness, Spec §FR-007/FR-008/FR-014, Plan §5, Contract §Các điều kiện an toàn HTTP]
- [x] CHK034 Yêu cầu trợ năng và phản hồi tương tác đã bao phủ form, lỗi, chờ và khôi phục trên Web lẫn native, chỉ rõ bàn phím/trình đọc màn hình/cỡ chữ/focus/vùng chạm theo nguồn chuẩn áp dụng thay vì từ chung chung “dễ dùng” chưa? [Completeness, Spec §FR-002/FR-017/FR-024/SC-004, Quickstart §4]
- [x] CHK035 Phạm vi hiệu năng áp dụng đã có nguồn mục tiêu, điều kiện đo và giới hạn bằng chứng rõ; việc chưa đặt SLA đăng nhập mới và ngoại lệ hiệu năng Android máy thật đã được phân biệt với miễn nghiệm thu chức năng hoặc tự giảm bảo mật chưa? [Clarity, Spec §Assumptions, Plan §Performance Goals, Quickstart §2/§5]

## Dependencies & Assumptions — Phụ thuộc và giả định

- [x] CHK036 Các giả định về Identity thật, tài khoản thử, giao dịch mô phỏng, nguồn dữ liệu mật khẩu và nền Mobile chưa có đã được ghi cùng ảnh hưởng tới nghiệm thu, thay vì coi tài liệu thiết kế hoặc mock là khả năng đã tồn tại chưa? [Assumption, Spec §Assumptions, Sources §Hiện trạng code đã đọc, Plan §Technical Context]
- [x] CHK037 Điều kiện trước phần việc phụ thuộc đã nêu rõ quyền thực hiện, môi trường/tài nguyên thử sở hữu, khả năng tương thích, thiết kế native được duyệt và nguồn hỗ trợ iOS/Android; thiếu điều kiện có xác định rõ phần bị chặn chưa? [Dependency, Gap, Plan §6, Tasks §Phase 1/Phase 6, Quickstart §1/§5]
- [x] CHK038 Phạm vi tiếp nhận dữ liệu cũ đã xác định điều kiện hợp lệ và cách dừng an toàn khi định dạng/chủ dữ liệu không nhận diện được hoặc bước thay đổi dữ liệu thất bại; việc không tiếp nhận dữ liệu thật trong A-03 có được phân biệt với đã có phương án chuyển đổi production chưa? [Dependency, Gap, Plan §4, Data model §Qualification dữ liệu trước triển khai, Tasks §T005/T006/T010/T013/T031]

## Ambiguities & Conflicts — Điểm mơ hồ và mâu thuẫn

- [x] CHK039 Cách diễn đạt trạng thái duyệt/đề xuất trong các phần spec, plan, nguồn chung và checklist chuyên sâu có cùng mốc phiên bản, tránh một yêu cầu vừa được mô tả là đã chốt vừa là quyết định còn mở mà không có giải thích lịch sử chưa? [Ambiguity, Conflict, Spec §Status/Shared Policies & Dependencies/Assumptions, Plan §Status, Sources §Chuyển sang chia tasks]
- [x] CHK040 Các giới hạn còn cần chứng minh hoặc quyết định đã có người chịu trách nhiệm, phần việc bị chặn và điều kiện giải quyết rõ; yêu cầu xử lý sai lệch tài liệu có được phân biệt với quyền đổi sản phẩm/kiến trúc/tiêu chí hoặc quyền implement/merge/deploy chưa? [Clarity, Gap, Plan §Constitution Check/§6, Tasks §Giới hạn quyền và cách đọc/Implementation Strategy]

## Notes

- Tại mốc sinh v0.1.0, 40 mục CHK001…CHK040 đều chưa được đánh giá. Vòng đánh giá theo yêu cầu riêng được ghi bên dưới; marker `[Gap]`, `[Ambiguity]`, `[Conflict]` chỉ vùng cần rà, không tự kết luận có lỗi.
- Nguồn đọc: [spec](../spec.md), [plan](../plan.md), [tasks](../tasks.md), [data model](../data-model.md), [hợp đồng](../contracts/auth-http.md), [quickstart](../quickstart.md), [sources](../sources.md), [constitution v2.0.1](../../../../.specify/memory/constitution.md) và [chính sách mật khẩu v0.2.0](../../../04-standards/password-policy.md). Tham chiếu mục trong dấu ngoặc chỉ vị trí nội dung, không là kết quả kiểm.
- `Spec §US1…US4` chỉ các User Story tương ứng; `Plan §1…§6`, `Quickstart §1…§6` chỉ các mục được đánh số. `Tasks §Txxx` chỉ task cùng mã; bảng ánh xạ trong tasks là nguồn đối chiếu, không phải tiến độ triển khai.
- [Checklist mật khẩu](password-policy.md) giữ 12 mục chuyên sâu và vòng đời riêng; CHK027 dẫn sang nguồn đó để không sao chép toàn bộ. Hai checklist có ID cục bộ; khi ghi nhận xét dùng cả tên file và CHK để tránh nhầm.
- [requirements.md](requirements.md) là checklist nền do specify/clarify duy trì; 16 mục tự rà ở đó không thay đánh giá của reviewer cho checklist này hoặc checklist mật khẩu.
- Reviewer chỉ đánh dấu `[x]` sau khi đối chiếu nội dung và ghi nhận xét/nguồn liên quan. Mục chưa rõ hoặc chưa đủ căn cứ giữ `[ ]`; không áp dụng phải có lý do. Agent không tự đánh dấu chỉ từ việc tạo checklist, được duyệt spec hoặc có task.
- Checklist không bổ sung hoặc phê duyệt yêu cầu sản phẩm. Nếu việc đánh giá dẫn tới đổi sản phẩm, kiến trúc hoặc tiêu chí nghiệm thu, trình chủ sản phẩm; sai lệch tài liệu trong phạm vi đã duyệt xử lý theo quyền hiện có.
- `speckit-implement` chỉ đọc trạng thái checklist như điều kiện trước triển khai, không sửa marker. Đợt sinh chỉ tạo câu hỏi; vòng đánh giá sau không chạy implement/converge hoặc kiểm phần mềm.

## Đánh giá theo yêu cầu hoàn tất chuẩn bị — 2026-11-20

**Ủy quyền**: Chủ sản phẩm yêu cầu “thực hiện nốt các phần còn lại” sau khi được báo còn 40 mục này
và 12 mục mật khẩu chưa đánh giá. Codex hỗ trợ đánh giá từng mục trên tài liệu; không tự nhận phê duyệt
sản phẩm/kiến trúc mới, review code độc lập hoặc nghiệm thu runtime. Quyết định bổ sung về thử sai đã được
hỏi riêng và chủ sản phẩm đồng ý, ghi tại plan §4/sources.

**Nguồn ký hiệu**: S = [spec v0.3.2](../spec.md); P = [plan v0.3.0](../plan.md); T = [tasks v0.2.0](../tasks.md);
D = [data model](../data-model.md); H = [hợp đồng](../contracts/auth-http.md); Q = [quickstart](../quickstart.md);
N = [nguồn/duyệt](../sources.md); W = [chuẩn mật khẩu v0.2.0](../../../04-standards/password-policy.md).
Mỗi nhận xét dưới đây đánh giá nội dung và ranh giới đã viết, không đánh giá khả năng chạy đúng của cơ chế.

| Mục | Kết luận chất lượng yêu cầu / căn cứ |
|---|---|
| CHK001 | Đạt — S Shared Policies, N NFR/DB pin riêng; W sở hữu PWD, P sở hữu cơ chế A-03, không nhận draft thành approval. |
| CHK002 | Đạt — S dependency table và P §8 có owner/phần bị chặn; nguồn còn draft và qualification không được nhận đã hoàn tất. |
| CHK003 | Đạt — S FR/SC → P §7 → T bảng ánh xạ; Q §4/§5 chỉ nơi lấy bằng chứng, không đồng nhất liên kết với đạt. |
| CHK004 | Đạt — S phạm vi/nền tảng và FR-001/008/022 phân Customer/Organizer, một spec và các luồng ngoài scope rõ. |
| CHK005 | Đạt — S FR-002/004/012/017/024, US3 ca 5; T016/T039 bao gồm trạng thái ban đầu/chờ/lỗi, không giữ dữ liệu mẫu. |
| CHK006 | Đạt — S BR-02/38/FR-006/009, P §1 và D chuyển trạng thái phân login/touch/đọc cũ/giữ-mua mới; khóa/xóa bị từ chối. |
| CHK007 | Đạt — S FR-003/005/011/019, H Public snapshot xác định trường tối thiểu; T017/T025/T041 không dựng dữ liệu cá nhân giả. |
| CHK008 | Đạt — S US3, P §1 và T029–034 liệt kê biên hold/release/order/payment/ticket; public/webhook có bằng chứng riêng. |
| CHK009 | Đạt — S Key Entities/FR-010/022, D Session phân subject, phiên logic, tab và phiên độc lập, không dùng email làm quyền. |
| CHK010 | Đạt — P §2 xác định hai mode, idle/max, persistence Web/native, mặc định tắt; T019/T036 nêu biên cần evidence. |
| CHK011 | Đạt sau làm rõ — P §2 định nghĩa hoạt động foreground, loại timer/poll/retry nền; clock/deadline server, mode/max không đổi. |
| CHK012 | Đạt — P §3, H lỗi/logout tách ba kết quả; UI khóa trong khi chờ, retry đúng phiên và không replay giao dịch. |
| CHK013 | Đạt — S FR-015/016, H an toàn HTTP, T016/T040 xác định đích nội bộ/đúng quyền, Khám phá fallback và no replay. |
| CHK014 | Đạt — S bảng nền tảng, P §2/H snapshot chung; T035–043 chỉ khác storage/lifecycle/interaction, không tạo policy mật khẩu riêng. |
| CHK015 | Đạt — P §1/H owner chỉ dùng danh tính authoritative, T030/T031 bỏ căn cứ tự khai; S FR-008 không mở quyền vận hành. |
| CHK016 | Đạt — P Summary/§1, H service độc lập giữ Core/Agent/chứng cứ tiền-vé; bridge không nhận đã tích hợp JWT mọi service. |
| CHK017 | Đạt — T vẫn 48 task, vùng nền/US1–4/closeout theo S/P; Q §7 giữ native shell tối thiểu và Web trước. |
| CHK018 | Đạt — 24 FR và 8 SC có vùng thiết kế/task/cách kiểm ở P §7/T; độ phủ chỉ là traceability, không là test đạt. |
| CHK019 | Đạt — S SC và Q §4 đối chiếu Identity/owner/data/side effects, có dương tính và lỗi; không lấy thông báo/HTTP làm đủ chứng cứ. |
| CHK020 | Đạt sau cụ thể hóa — P §2, Q §5.1/§5.2 có biên/nhóm tiêu chí/ma trận; inventory OS/tool thực là gate T001/T045, không để tự miễn tiêu chí. |
| CHK021 | Đạt — S SC-008/Q §5.1/§7 báo riêng từng kênh/build/thật-mô phỏng; giữ ngoại lệ nguồn, không lấy Web đóng native. |
| CHK022 | Đạt — S US1/US2/FR-006, P §1–2/D định nghĩa verified/unverified/pending và hai mode, không tự xác minh/cấp quyền. |
| CHK023 | Đạt — S US3/H error table phân invalid/input/unauthenticated/forbidden/rate/outage, thông điệp không enumeration. |
| CHK024 | Đạt — S US2/US4, P §3/D native, T021/T036/T037 quy định privacy lock và retry; không khôi phục từ cache hoặc kho thường. |
| CHK025 | Đạt — S US3 ca 5/H logout-race/P §8/T019/T023/T026 có cạnh tranh và late credential; thiếu bảo đảm thì chặn nghiệm thu nhánh đó. |
| CHK026 | Đạt — S FR-016/018, Q §4/T017/T029/T034 giữ khám phá/webhook khi Identity lỗi, luồng chưa chạy không được quảng cáo như thật. |
| CHK027 | Đạt — W/S Edge Cases và checklist mật khẩu có NFC/code point/legacy/compromised; D manifest chặn profile chưa nhận diện. |
| CHK028 | Đạt — D chuyển trạng thái, P §1–2, T019/T020 nêu clock/expiry/status và UPDATE không phục hồi phiên đã mất. |
| CHK029 | Đạt — S US4, Q ma trận native/T036/T040/T043 nêu restart/resume/link/mất dữ liệu/switch; kết quả thuộc tài khoản hiện hành. |
| CHK030 | Đạt — S FR-011/019 và P §3/D native giữ B-07 ngoài scope; mất mạng không tự logout/xóa vé hoặc đổi giao dịch Core. |
| CHK031 | Đạt sau cụ thể hóa — P §5.1/H/Q §4 và T008/T033 chỉ trường kỹ thuật, lọc trước ghi; lưu/xuất cần expiry/quyền theo NFR nguồn. |
| CHK032 | Đạt sau quyết định riêng — chủ sản phẩm đồng ý window/cooldown/reset; P §4/H và T027/T028 đồng bộ biên/reset/chờ/IP, không tính lỗi nguồn là sai mật khẩu. |
| CHK033 | Đạt — P §5/H HTTP/owner xác định origin/CSRF/credential riêng, marker native không là identity; missing owner fail closed. |
| CHK034 | Đạt — S FR-017/024, Q §5.2 dẫn chuẩn UI/NFR; form/lỗi/chờ/khôi phục có nhãn/focus/chữ/vùng chạm, không chỉ trạng thái đẹp mặc định. |
| CHK035 | Đạt sau chỉ rõ phạm vi — P Performance Goals/Q §5.3 phân latency login với NFR Web/native mở app; giữ mẫu/mạng/ngoại lệ tại nguồn, không tạo SLA mới. |
| CHK036 | Đạt — S Assumptions/N code baseline và P Technical Context tách Identity/native chưa có với giao dịch mock; fixture/legacy có điều kiện rõ. |
| CHK037 | Đạt — P §8/Q §5/§7/T001/T003 nêu người giao quyền, qualification, inventory và Figma; gate chưa thực hiện không biến thành đã đạt. |
| CHK038 | Đạt sau cụ thể hóa — D qualification/Q §2/T009/T010 định nghĩa manifest và lỗi migration trên DB test; production cutover không được giao hoặc suy từ seed. |
| CHK039 | Đạt sau hòa giải — S v0.3.2/P v0.3.0/N lịch sử và W PWD-007 phân chính sách chung/cơ chế feature; giữ hash/mốc phê duyệt gốc, không hồi tố. |
| CHK040 | Đạt — P §8/Q §7/T authority ghi gate/owner/điều kiện mở, quyền sửa doc khác với quyền đổi sản phẩm hoặc code/cài/chạy/merge/deploy. |

**Kết luận**: 40/40 tiêu chí chất lượng yêu cầu được đáp ứng trên bộ tài liệu nêu trên sau hòa giải.
Không có mục được đánh dấu đạt chỉ vì đã sinh checklist hoặc có task. Các điều kiện triển khai chưa
thực hiện vẫn thuộc P §8/T001 và không bị checklist này mở khóa; review code/runtime độc lập còn ở đợt triển khai.

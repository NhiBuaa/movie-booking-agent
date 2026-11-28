---
status: draft
version: 0.2.0
---

# Chính sách mật khẩu dùng chung

## 1. Phạm vi và thẩm quyền

Đây là nơi sở hữu chính sách mật khẩu chung cho A-01 đăng ký, A-03 đăng nhập, A-04 đổi mật khẩu
và A-05 khôi phục mật khẩu, trên các kênh Customer/Organizer Web/Mobile được phép.
Phạm vi áp dụng của chính sách không cấp quyền triển khai thêm app hoặc use case.

Chủ sản phẩm cho phép bổ sung cấu trúc nguồn chung và liên kết từ A-03 trong hội thoại ngày
2026-11-20, qua yêu cầu “thực hiện bổ sung phần này vào cho tôi”. Xác nhận này chưa chọn độ dài,
độ phức tạp, danh sách mật khẩu bị chặn hoặc cách xử lý mật khẩu cũ. Sau khi duyệt spec A-03,
chủ sản phẩm tiếp tục chọn A cho ba nhóm câu hỏi mật khẩu mới, Unicode và mật khẩu cũ trong cùng
hội thoại ngày 2026-11-20. Bản v0.2.0 ghi các quyết định PWD-001…PWD-005 cho khách hàng;
cơ chế PWD-007 do plan của từng feature cụ thể hóa. Riêng A-03 đã có [plan](../05-specs/006-customer-login/plan.md)
được dùng chia tasks; việc đó không tự chọn cơ chế chung cho mọi use case/vai trò hoặc chứng minh runtime.

- [Mô hình sản phẩm](../03-product/use-cases.md) tiếp tục sở hữu actor, BR/OPEN, phương thức email/mật khẩu và quyền.
- [ADR-0008](../06-decisions/0008-better-auth-with-direct-login.md) sở hữu lựa chọn Better Auth và ranh giới Identity; [kiến trúc](../05-specs/004-service-decomposition/spec.md) sở hữu chủ dữ liệu.
- NFR tiếp tục giữ các yêu cầu bảo mật/phiên/MFA đã được duyệt tại nguồn của nó. Tài liệu này không thay phạm vi MFA hoặc thu hồi phiên/token.
- Identity & Access là chủ thực thi chính sách mật khẩu tại máy chủ. UI giải thích và phản hồi theo cùng chính sách; tiêu chí chấm độ mạnh mẫu trong code chưa là chính sách được duyệt.

## 2. Mã, phiên bản và thay đổi chính sách

Mã `PWD-001`…`PWD-007` ổn định, không tái sử dụng cho nghĩa khác. Mỗi bản quy tắc được xác định
bằng mã và phiên bản tài liệu; hiện là v0.2.0. Mỗi mục phải ghi trạng thái, nội dung, phạm vi áp dụng,
nguồn duyệt và tiêu chí để viết ca nghiệm thu. Các mục hiện còn mở phải giữ nguyên trạng thái đó.

Khi thay đổi hành vi, cập nhật phiên bản và nguồn phê duyệt; nêu các luồng/tài khoản hiện có chịu ảnh hưởng.
Trạng thái `đã duyệt` của yêu cầu không chứng minh đã triển khai, kiểm thử hoặc phát hành.
Spec ghi mã/phiên bản và cách áp dụng; plan chọn cơ chế kỹ thuật đáp ứng; tasks liên kết tới yêu cầu
và cách kiểm. Ngoại lệ cần chủ sản phẩm duyệt rõ phạm vi và lý do tại nguồn chung trước khi áp dụng.

## 3. Danh mục chính sách

| Mã | Nội dung và quyết định còn thiếu | Phạm vi | Trạng thái / nguồn | Tiêu chí cần có khi hoàn thiện |
|---|---|---|---|---|
| PWD-001 | Mật khẩu mới của khách hàng dài 15–128 Unicode code point, đếm sau chuẩn hóa NFC theo PWD-002. Không áp ngưỡng tạo mới để tự chặn mật khẩu cũ ở login; giới hạn đầu vào legacy được thiết kế riêng để bảo vệ tài nguyên mà không cắt chuỗi. | Customer A-01/A-04/A-05; A-03 theo PWD-005 | Đã duyệt: nhóm mật khẩu mới A và Unicode A, hội thoại A-03 ngày 2026-11-20 | Biên 14/15/128/129 code point sau NFC, chuỗi rỗng, ký tự ngoài BMP; phân biệt giới hạn tạo mới và mật khẩu hiện có |
| PWD-002 | Chấp nhận Unicode và khoảng trắng; chuẩn hóa NFC khi tạo/xác minh theo policy mới, đếm code point; giữ khoảng trắng đầu/cuối và phân biệt hoa/thường, không trim hoặc cắt mật khẩu. Mật khẩu cũ theo cơ chế/phiên bản đã lưu ở PWD-005, không tự áp chuẩn hóa mới lên hash cũ. | Customer A-01/A-03/A-04/A-05 | Đã duyệt: Unicode A, hội thoại A-03 ngày 2026-11-20 | Hai biểu diễn tương đương NFC có cùng kết quả theo policy mới; khoảng trắng/hoa-thường khác phải giữ khác; UI/máy chủ nhất quán, legacy có vectors riêng |
| PWD-003 | Không bắt phối hợp chữ hoa, chữ thường, số hoặc ký hiệu cho mật khẩu mới của khách hàng. Hướng dẫn/chỉ báo UI phải khớp PWD-001/002/004, không dùng điểm chấm mẫu để tự thêm điều kiện bắt buộc. | Customer A-01/A-04/A-05; không tự áp tiêu chí tạo mới để chặn A-03 | Đã duyệt: nhóm mật khẩu mới A, hội thoại A-03 ngày 2026-11-20 | Passphrase đủ điều kiện được nhận dù không trộn loại ký tự; các ca bị chặn có lý do từ độ dài/danh sách, chỉ báo UI không thay kiểm máy chủ |
| PWD-004 | Từ chối mật khẩu mới phổ biến/đã lộ bằng danh sách có phiên bản kiểm tại máy chủ; không gửi mật khẩu ra dịch vụ ngoài. Dataset/giấy phép, đối sánh và xử lý lỗi tập dữ liệu phải nêu trong plan; không hứa biết mọi mật khẩu từng bị lộ. | Mật khẩu mới Customer ở A-01/A-04/A-05; ảnh hưởng mật khẩu cũ theo PWD-005 | Đã duyệt nguyên tắc: nhóm mật khẩu mới A, hội thoại A-03 ngày 2026-11-20; cơ chế/dữ liệu chờ plan | Ghi danh sách/phiên bản thử và phạm vi, ca trùng/không trùng/lỗi nguồn; không phát sinh lời gọi ngoài mang mật khẩu |
| PWD-005 | Mật khẩu cũ chỉ chưa đạt chính sách mới vẫn được xác minh theo cơ chế/phiên bản đã lưu; không tự sửa/cắt hoặc đổi cách xác minh hash cũ. Có bằng chứng mật khẩu bị lộ thì không cấp phiên mới, hướng đổi/reset khi luồng đó được hỗ trợ; luồng chưa triển khai phải nói đúng khả năng. | Customer A-03 và luồng đổi/khôi phục liên quan | Đã duyệt: mật khẩu cũ A, hội thoại A-03 ngày 2026-11-20 | Tài khoản legacy đúng/sai mật khẩu, khác chuẩn hóa, bằng chứng bị lộ; không cấp phiên mới khi bị lộ, không tự tạo đường reset. Tác động tới phiên/token đã có và lộ trình đổi hash được thiết kế riêng trong plan |
| PWD-006 | Bảo vệ mật khẩu và credential khỏi log, prompt LLM và dữ liệu client không phù hợp; không trả dữ liệu bí mật không cần thiết. | Mọi luồng xử lý mật khẩu | Kế thừa ràng buộc đã duyệt tại ADR-0008; phạm vi kiểm cụ thể ở spec | Ca thành công/lỗi không lộ mật khẩu/credential trong chẩn đoán hoặc phản hồi ngoài hợp đồng |
| PWD-007 | Cách lưu bằng chứng mật khẩu: yêu cầu bảo vệ khi lưu, thuật toán/chi phí băm, salt, version và cách chuyển đổi khi nâng cấp. Cơ chế từng feature do plan sở hữu, không mặc định là chính sách chung mọi luồng. | Identity; các luồng ghi/xác minh bằng chứng mật khẩu | Riêng A-03 tham chiếu plan §4 đúng bản được dùng chia tasks; các feature khác phải tham chiếu thiết kế phù hợp được duyệt, không kế thừa DB draft | Plan nêu cơ chế bảo vệ, tương thích thư viện, điều kiện đo chi phí và ca chuyển đổi; bằng chứng triển khai kiểm riêng |

PWD-001…PWD-005 đã chốt hành vi khách hàng ở phạm vi nêu trên; dataset, giới hạn bảo vệ tài nguyên
cho legacy, hash/version và cơ chế thu hồi do plan thiết kế và phải kiểm khi triển khai. PWD-007 không
ghi một bộ tham số chung ngoài quyết định feature; A-03 đã có thiết kế cụ thể tại nguồn liên kết. Có quyết định sản phẩm không đồng nghĩa đã đủ thiết kế hoặc sẵn sàng giao code;
thay đổi hành vi tương thích phải quay lại PWD-005.

## 4. Cách áp dụng theo tính năng

| Use case | Trách nhiệm spec |
|---|---|
| A-01 — Đăng ký | Dẫn chính sách mật khẩu mới và nêu kết quả/lỗi tạo tài khoản; không viết bộ ngưỡng riêng |
| A-03 — Đăng nhập | Dẫn quy tắc xác minh, giới hạn đầu vào và tương thích mật khẩu cũ; không tự suy mật khẩu cũ phải đạt tiêu chí tạo mới |
| A-04 — Đổi mật khẩu | Dẫn kiểm mật khẩu mới và xác minh trước thay đổi; nêu tác động phiên theo chính sách phiên được duyệt |
| A-05 — Khôi phục mật khẩu | Dẫn cùng kiểm mật khẩu mới; bằng chứng reset và phạm vi phiên/MFA thuộc chính sách tương ứng |

Spec của từng luồng phải ánh xạ các mục áp dụng tới FR/SC. Việc chưa triển khai A-01/A-04/A-05
không cho phép A-03 tự định nghĩa chính sách đối nghịch. Cách rà và xử lý phụ thuộc chung nằm trong
[playbook phát triển tính năng](../07-guides/feature-development-playbook.md).

## 5. Căn cứ để trình các quyết định còn mở

[NIST SP 800-63B-4, mục Password Verifiers](https://pages.nist.gov/800-63-4/sp800-63b.html#passwordver)
là căn cứ nghiên cứu về độ dài, ký tự, danh sách mật khẩu phổ biến/đã lộ, xử lý bí mật bị lộ và bảo vệ
bằng chứng mật khẩu khi lưu. Cần trình phương án và đánh đổi phù hợp dự án trước khi chốt.
Tham chiếu hướng dẫn này không tự làm toàn bộ ngưỡng của NIST thành quyết định dự án hoặc là tuyên bố tuân thủ NIST.

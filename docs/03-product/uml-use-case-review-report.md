# Báo cáo review độc lập bộ UML Use Case — Movie Booking Platform

> Ghi chú tra cứu sau chuyển thư mục: đường dẫn/mốc code trong báo cáo giữ nguyên như lúc review.
> Vị trí ứng dụng hiện tại theo [ADR-0002](../06-decisions/0002-customer-organizer-app-boundaries.md).
> Ghi chú này không sửa kết luận hoặc tái xác nhận bằng chứng của reviewer.

**Ngày thực hiện:** 2026-11-16  
**Người thực hiện:** Antigravity (Độc lập)  
**Phạm vi bàn giao:** Handoff `C:/Users/NhiBuaa/AppData/Local/Temp/movie-booking-use-case-review-handoff-20261116.md`  
**Worktree làm việc:** `C:/Users/NhiBuaa/.codex/worktrees/docs-product-use-cases/movie-booking-agent`  
**Nhánh Git:** `docs/product-use-cases`  
**Commit nền đối chiếu:** `549d7b2f76e63aefe34e0c3799c3d28495cdf868`  
**Tài nguyên thẩm định:**
- `docs/04-standards/use-case-modeling.md` (Quy chuẩn mô hình hóa use case)
- `docs/03-product/use-cases.md` (Sơ đồ General, ánh xạ, sơ đồ chi tiết, danh mục, quy tắc, OPEN và đối chiếu)
- `docs/03-product/use-case-descriptions.md` (Mô tả chi tiết 39 use case và ngoại lệ)
- `GLOSSARY.md` (Thuật ngữ nghiệp vụ)
- Mã nguồn đối chiếu: `packages/contracts/src/tickets/types.ts`, `packages/contracts/src/common/enums.ts`, `apps/web/src/server/hold-adapter.ts`, `apps/web/src/server/order-adapter.ts`.

---

## I. TỔNG QUAN VÀ KẾT LUẬN REVIEW

Bộ tài liệu và sơ đồ UML Use Case của **Movie Booking Platform** được xây dựng với chất lượng kỹ thuật và độ chỉn chu rất cao:
1. **Tuân thủ xuất sắc chuẩn OMG UML 2.5.1 (chương 18):** Ngữ nghĩa `«include»` và `«extend»` được áp dụng chuẩn xác về chiều mũi tên, điểm mở rộng (Extension Point) và điều kiện rẽ nhánh. Hoàn toàn không lạm dụng `include`/`extend` để biểu diễn thứ tự thời gian, quy trình giao dịch hay điều kiện tiền đề.
2. **Cấu trúc tài liệu mạch lạc:** Tuân thủ đúng phân tầng từ *Tổng quát (General)* → *Bảng ánh xạ/phân rã* → *Sơ đồ chi tiết* → *Danh mục use case* → *Mô tả use case & ngoại lệ*. Khớp hoàn toàn 39 use case (34 chính + 5 hành vi hỗ trợ).
3. **Kỷ luật ranh giới và phân quyền nghiêm ngặt:** Giữ vững vai trò trung tâm có thẩm quyền tối thượng của Cinema Core; tách biệt rạch ròi giữa kênh tương tác (Web/Mobile/AI) và Actor bên ngoài; phân định quyền chặt chẽ giữa Khách hàng, Nhân viên soát vé, Nhân viên quầy bắp nước, Quản lý rạp và Quản trị viên toàn chuỗi.
4. **Xử lý tình huống biên và nghiệp vụ phức tạp xuất sắc:** Cơ chế một mã QR chung nhưng quản lý quyền và soát vé theo từng ghế; khóa giữ ghế nguyên tử (Atomic Hold TTL 300s); xử lý tiền về muộn sau khi giải phóng ghế; hủy Sweetbox cả cặp; điểm hội viên chỉ cộng sau khi vé đã soát.
5. **Minh bạch hiện trạng và truy vết quyết định:** Phân biệt rõ ràng giữa mô hình sản phẩm mục tiêu đã chốt (các vòng Q1–Q31) với hiện trạng mã nguồn tại commit đối chiếu; 10 nhóm vấn đề mở (`OPEN-01` đến `OPEN-10`) được nhận diện chính xác, không tự ý gán giá trị mặc định.

**Tổng kết phát hiện (Findings):**
- **0 lỗi vi phạm nghiêm trọng (Critical/High).**
- **3 phát hiện mức Trung bình (Medium):** Sự không đồng bộ về Actor giữa sơ đồ Mermaid và Bảng danh mục/Mô tả đối với `R-04` và `R-03`; vấn đề tỷ lệ khung hình cực cao (Aspect Ratio > 4:1) của sơ đồ General ảnh hưởng khả năng hiển thị trên khung hẹp / thiết bị di động.
- **2 phát hiện mức Thấp (Low):** Thiếu ghi nhận `Dịch vụ email` trong bảng danh mục use case `L-06`; chưa thể hiện rõ tác nhân gửi email vé ở use case `B-06` trong sơ đồ 2.3.2.
- **3 câu hỏi / điểm lưu ý nghiệp vụ cần chủ sản phẩm quyết định:** Chi tiết hóa quy trình ngoại lệ khi khách mất mạng/mất email ở `O-02` (`OPEN-06`), xử lý combo khi hủy một phần đơn (`OPEN-02`/`OPEN-07`), và quyền đánh giá của người đi cùng (`OPEN-08`).

---

## II. ĐÁNH GIÁ CHI TIẾT THEO 8 NHÓM KIỂM TRA

### 1. Phạm vi, ràng buộc và ranh giới hệ thống
- **Đánh giá:** Đạt xuất sắc.
- **Chi tiết:**
  - Subject được định nghĩa thống nhất: `Movie Booking Platform`, phục vụ một chuỗi rạp duy nhất (`BR-01`).
  - Các thành phần kỹ thuật nội bộ (`apps/web`, `apps/mobile`, `apps/organizer`, `services/agent-service`, `services/cinema-core`) đều nằm trọn vẹn bên trong ranh giới hệ thống. AI Agent và Cinema Core không bị vẽ thành actor bên ngoài.
  - Các yếu tố ngoài phạm vi (Out of Scope) được bảo vệ nghiêm ngặt: không bán vé tiền mặt tại quầy, không quản lý kho hàng bắp nước vật lý, không hỗ trợ sàn đa cụm rạp, không soát vé ngoại tuyến.
  - Không tự ý thêm tính năng đổi suất/đổi ghế sau khi mua vé.
- **Finding:** Không có.

### 2. Actor, quyền và phạm vi dữ liệu
- **Đánh giá:** Đạt tốt, có điểm cần đồng bộ nhẹ giữa sơ đồ và danh mục.
- **Chi tiết:**
  - Hệ thống xác định chính xác 8 actor duy nhất: `Khách chưa đăng nhập (guest)`, `Khách hàng (customer)`, `Nhân viên soát vé (scanner)`, `Nhân viên quầy bắp nước (concession)`, `Quản lý rạp (manager)`, `Quản trị viên toàn chuỗi (admin)`, `Cổng thanh toán (pay)`, `Dịch vụ email (mail)`.
  - Trong sơ đồ General và các sơ đồ chi tiết, mỗi vai trò actor chỉ xuất hiện đúng một nút duy nhất, không nhân bản nút ID để ép bố cục.
  - Không sử dụng kế thừa actor (generalization) để ngầm cấp quyền. Quyền soát vé (`ACT-SCANNER`) và giao combo (`ACT-CONCESSION`) được tách bạch hoàn toàn (`BR-13`). Quản lý rạp chỉ có quyền trong phạm vi rạp được giao; chỉ Quản trị viên toàn chuỗi mới có thẩm quyền duyệt hủy suất (`BR-12`) hoặc ẩn đánh giá (`BR-16`).
- **Finding:** Có sự chênh lệch về việc gán actor quản lý/vận hành vào `R-04` và `R-03` giữa sơ đồ và bảng danh mục (xem chi tiết tại Mục III, Finding F-01 và F-02).

### 3. Mục tiêu use case và mức độ chi tiết
- **Đánh giá:** Đạt xuất sắc.
- **Chi tiết:**
  - Danh mục gồm đúng 39 use case (34 use case chính trên General và 5 hành vi hỗ trợ ở mức chi tiết).
  - Từng use case thể hiện mục tiêu hoàn chỉnh mang lại kết quả quan sát được cho tác nhân (observable value). Không bị vụn vặt hóa thành các thao tác giao diện đơn lẻ (như "Bấm nút", "Nhập trường dữ liệu") hay các endpoint API.
  - Phân định rõ 5 hành vi hỗ trợ: `B-02` (Giữ ghế nguyên tử - bắt buộc trong B-01), `B-06` (Xử lý kết quả thanh toán và phát hành vé - xử lý bất đồng bộ từ cổng), `R-07` (Thực thi quyết định hủy suất - xử lý sau duyệt R-06), `O-02` (Xác minh khách không có QR - mở rộng từ O-01), `O-05` (Kiểm tra quyền vào rạp của các ghế - bắt buộc trong O-01).
- **Finding:** Không có.

### 4. Ngữ nghĩa UML và quan hệ include / extend
- **Đánh giá:** Đạt chuẩn xác theo OMG UML 2.5.1 (chương 18).
- **Chi tiết:**
  - **Quan hệ `«include»` (2 quan hệ):**
    + `B-01 -.->|"«include»"| B-02`: Mũi tên nét đứt từ use case gọi (B-01) trỏ sang hành vi được bao gồm (B-02). Đúng chiều.
    + `O-01 -.->|"«include»"| O-05`: Mũi tên nét đứt từ use case gọi (O-01) trỏ sang hành vi được bao gồm (O-05). Đúng chiều.
  - **Quan hệ `«extend»` (3 quan hệ):**
    + `B-03 -.->|"«extend» [khách chọn combo] EP-COMBO"| B-01`: Mũi tên nét đứt từ use case mở rộng (B-03) trỏ về use case cơ sở (B-01). Khai báo Extension Point `EP-COMBO` và điều kiện `[khách chọn combo]` rõ ràng. B-01 có ý nghĩa độc lập ngay cả khi không có combo.
    + `B-04 -.->|"«extend» [khách chọn voucher] EP-VOUCHER"| B-01`: Mũi tên nét đứt từ B-04 trỏ về B-01. Khai báo Extension Point `EP-VOUCHER` và điều kiện `[khách chọn voucher]`. B-01 có ý nghĩa độc lập khi không áp dụng voucher.
    + `O-02 -.->|"«extend» [không có QR] EP-PROOF"| O-01`: Mũi tên nét đứt từ O-02 trỏ về O-01. Khai báo Extension Point `EP-PROOF` và điều kiện `[không có QR]`. O-01 bằng mã QR là luồng cơ bản đầy đủ.
  - **Negative cases (Các quan hệ cố ý không vẽ):**
    + Không include "Đăng nhập" vào các use case (đăng nhập là điều kiện trước - Precondition).
    + Không include "Xác minh email" vào Đăng ký (tài khoản có thể chưa xác minh ngay).
    + Không nối include/extend giữa B-01, B-05, B-06, B-07 (đây là tiến trình giao dịch, không phải quan hệ cấu trúc use case).
    + Không include Hoàn tiền (R-03) vào Xét duyệt yêu cầu hủy (R-02) (vì duyệt có thể từ chối và hoàn tiền diễn ra bất đồng bộ).
    + Không dùng quan hệ giữa R-06 và R-07 để biểu diễn thứ tự kích hoạt.
    + Không include Cộng điểm vào Soát vé.
    + Tất cả đường actor–use case đều là association đường liền không hướng (`---`).
- **Finding:** Không có.

### 5. Tính nhất quán giữa các tài liệu
- **Đánh giá:** Đạt rất cao (39/39 mã khớp 100%, tên gọi khớp 100%), có phát hiện nhỏ về bảng danh mục.
- **Chi tiết:**
  - Đối chiếu tự động bằng kịch bản kiểm thử:
    + 39 mã ID use case xuất hiện đầy đủ, thống nhất tuyệt đối giữa General, Bảng phân rã, Sơ đồ chi tiết, Danh mục mục 3 và Mô tả chi tiết trong `use-case-descriptions.md`.
    + Tên tiếng Việt của 39 use case khớp từng từ giữa Bảng danh mục, Sơ đồ chi tiết và Mô tả use case.
    + 34 use case trên General có tập association khớp hoàn toàn với các sơ đồ chi tiết tương ứng.
- **Finding:** Thiếu ghi chú actor `Dịch vụ email` ở use case `L-06` trong bảng Danh mục mục 3 (Mục III, Finding F-03).

### 6. Quy tắc nghiệp vụ, điều kiện và ngoại lệ
- **Đánh giá:** Đạt xuất sắc, bao quát chặt chẽ các tình huống nghiệp vụ trọng điểm.
- **Chi tiết 4 tình huống ưu tiên theo handoff:**
  1. *Một QR chung nhưng soát từng ghế, khách đến riêng / quét lặp / thiếu QR:*
     - `BR-07`, `BR-08`, `O-01`, `O-05` quy định rõ: Một mã QR đại diện cho cả đơn đặt, nhưng trạng thái quyền sử dụng và lịch sử soát vé được Core quản lý độc lập theo từng ghế.
     - Khách quét lại QR để người sau vào cửa là hợp lệ; Core kiểm tra chống dùng lặp trên từng ghế.
     - Sweetbox được quản lý theo cặp khi đặt/hủy nhưng có thể ghi nhận vào rạp riêng từng người (`O-01`).
     - Khách thiếu QR: Sử dụng `O-02` tra cứu đơn và xác minh OTP qua email đã xác minh của tài khoản đặt vé; không chấp nhận chỉ dựa trên họ tên hay số điện thoại (`BR-09`).
  2. *Giữ ghế hết hạn và kết quả thanh toán đến muộn / lặp:*
     - Khóa giữ ghế nguyên tử trong 300 giây (`BR-04`). Hết hạn không tự động kết luận thanh toán thất bại nếu trạng thái tại cổng chưa rõ (`BR-05`).
     - Trường hợp khoản thu được cổng xác nhận sau khi ghế đã bị giải phóng (`BR-06`, `B-06`): Hệ thống tuyệt đối không tự ý gán sang ghế khác; Core khởi tạo luồng trả lại khoản thu qua `R-03` mà không bắt khách hàng phải làm đơn xin hủy.
     - Webhook/callback đến lặp: `B-06` kiểm tra tính duy nhất (idempotency), không phát hành vé hoặc thu tiền lặp.
  3. *Hủy một phần / hoàn tiền thất bại / hủy suất đã bán vé và thẩm quyền duyệt:*
     - `BR-10` cho phép khách gửi yêu cầu hủy một phần hoặc toàn bộ trước giờ chiếu, chỉ áp dụng cho vé chưa soát; Sweetbox bắt buộc hủy cả cặp.
     - Quản lý rạp xét duyệt hủy theo chính sách (`R-02`, `BR-11`). Khi duyệt phải kiểm tra lại vé chưa bị sử dụng trong thời gian chờ. Quyết định duyệt chỉ vô hiệu quyền vào rạp của ghế, việc hoàn tiền (`R-03`) là tiến trình riêng.
     - Quản lý rạp chỉ có quyền đề nghị hủy suất (`R-05`), thẩm quyền duyệt hủy suất thuộc Quản trị viên toàn chuỗi (`R-06`, `BR-12`). Khi thực thi (`R-07`), hệ thống đóng bán, vô hiệu hóa quyền vé, gửi email thông báo và khởi tạo lệnh hoàn tiền.
     - Khi giao dịch hoàn tiền gặp lỗi (`R-03`): Lưu giữ căn cứ đối soát, không báo thành công sớm, không tự khôi phục vé đã hủy (`OPEN-03`).
  4. *Giao combo lặp, điểm / voucher khi hoàn tiền:*
     - Quyền giao combo tách biệt với quyền soát vé (`BR-13`, `O-04`). Quầy bắp nước phải ghi nhận trực tiếp vào Core để chống giao lặp.
     - Điểm hội viên (`BR-14`): Điểm chỉ được tích lũy theo phần vé **đã được soát vào rạp**, không tích lũy ngay khi thanh toán. Do đó, vé hủy trước giờ chiếu hoàn toàn không phát sinh điểm thừa cần thu hồi.
     - Voucher (`BR-15`, `OPEN-02`): Đổi điểm lấy voucher (`L-02`) tách biệt với áp dụng voucher (`B-04`). Chính sách hoàn voucher khi hủy vé được ghi nhận chính xác tại `OPEN-02`.
- **Finding:** Không có lỗi vi phạm quy tắc. Đã ghi nhận các điểm mở nghiệp vụ cần chốt tại Mục IV.

### 7. Bố cục, render và khả năng hiển thị
- **Đánh giá:** Parse và render thành công 100%, bố cục các sơ đồ chi tiết rất đẹp; sơ đồ General có vấn đề về tỷ lệ hiển thị (Aspect Ratio).
- **Bằng chứng kỹ thuật:**
  - Render thực tế 7 khối Mermaid bằng `@mermaid-js/mermaid-cli` (v12.2.0) sang định dạng SVG và PNG (chi tiết tại thư mục scratch: `01-general.png`, `02-account-discovery.png`, `03-booking-payment.png`, `04-cancellation-refund.png`, `05-checkin-concession.png`, `06-community-loyalty.png`, `07-operation-admin.png`).
  - Toàn bộ 7 khối Mermaid parse thành công 100%, không phát sinh bất kỳ lỗi cú pháp nào.
  - Các sơ đồ chi tiết (2.3.1 đến 2.3.6) có bố cục cực kỳ thoáng đãng, các đường association và include/extend không bị giao cắt, nhãn văn bản rõ ràng, kích thước viewBox chuẩn (~800–1100px chiều rộng).
  - **Vấn đề tại sơ đồ General (2.1):**
    + Kích thước viewBox thực tế của `01-general.svg` là `1327px × 5377px`. Chiều cao gấp hơn 4 lần chiều rộng.
    + Toàn bộ 34 use case được xếp thành một cột dọc duy nhất dài dằng dặc.
    + Nút `customer` phát sinh chùm 15 đường song song; nút `admin` phát sinh chùm 10 đường song song.
    + Khi hiển thị trên khung hẹp (thiết bị di động 375–450px hoặc sidebar preview Markdown bị ép `max-width: 100%`), sơ đồ bị thu nhỏ khoảng 3–4 lần, chữ bị co xuống cỡ ~4px, hoàn toàn không đọc được nếu không phóng to và cuộn trang liên tục.
- **Finding:** Chi tiết tại Mục III, Finding F-05.

### 8. Truy vết quyết định và phân biệt hiện trạng vs mục tiêu
- **Đánh giá:** Đạt xuất sắc.
- **Chi tiết:**
  - Bảng truy vết mục 8 liên kết đầy đủ các vòng quyết định Q1 đến Q31 đã được chủ sản phẩm thông qua.
  - 10 mã quyết định còn mở (`OPEN-01` đến `OPEN-10`) được trình bày minh bạch, ghi rõ phạm vi use case bị ảnh hưởng và cấp có thẩm quyền quyết định. Không có tình trạng tự ý "bịa" chính sách mặc định.
  - Bảng mục 7 đối chiếu chi tiết với hiện trạng mã nguồn tại commit `549d7b2f76e63aefe34e0c3799c3d28495cdf868`: chỉ rõ điểm khác biệt giữa scaffold/BFF in-memory hiện tại với yêu cầu mục tiêu (như xác thực thật, kiểm tra HMAC chữ ký webhook, hỗ trợ sơ đồ ghế linh hoạt thay cho mẫu cố định 64 ghế, và bổ sung vai trò phân quyền chi tiết).
- **Finding:** Không có.

---

## III. DANH SÁCH FINDINGS CHI TIẾT

### Finding F-01: Bất nhất về Actor giữa Sơ đồ và Bảng danh mục / Mô tả đối với use case `R-04`
- **Mức độ ảnh hưởng:** Trung bình (Medium)
- **Phân loại:** Lỗi không nhất quán mô hình (Model Inconsistency)
- **Vị trí file:dòng:**
  - `docs/03-product/use-cases.md:158` (Sơ đồ General)
  - `docs/03-product/use-cases.md:313` (Sơ đồ chi tiết 2.3.3)
  - `docs/03-product/use-cases.md:441` (Bảng Danh mục use case)
  - `docs/03-product/use-case-descriptions.md:172` (Mô tả R-04)
- **Căn cứ:**
  - Tại bảng Danh mục mục 3 (`use-cases.md:441`): `R-04 | Theo dõi yêu cầu hủy và hoàn tiền | Khách hàng; quản lý/quản trị theo phạm vi`.
  - Tại mô tả chi tiết (`use-case-descriptions.md:172`): `Actor/kích hoạt: khách hàng; quản lý/quản trị theo phạm vi muốn biết tiến độ.`
  - Tuy nhiên, tại cả sơ đồ General (`dòng 158`) và sơ đồ chi tiết 2.3.3 (`dòng 313`): `R-04` **chỉ có duy nhất đường nối với Khách hàng (`customer --- R_04`)**, hoàn toàn không có association nào nối với Quản lý rạp (`manager`) hay Quản trị viên toàn chuỗi (`admin`).
- **Tình huống gây lỗi:** Người đọc khi quan sát sơ đồ kiến trúc sẽ kết luận `R-04` chỉ phục vụ khách hàng, nhưng khi đọc sang phần mô tả và danh mục lại thấy cấp quản lý và quản trị viên tham gia, tạo ra sự mâu thuẫn giữa sơ đồ và tài liệu.
- **Đề xuất sửa:**
  - *Phương án A (Khuyến nghị):* Nếu Quản lý và Quản trị viên thực sự theo dõi tiến độ hoàn tiền thông qua giao diện `R-04`: Bổ sung đường nối `manager --- R_04` và `R_04 --- admin` vào sơ đồ chi tiết 2.3.3 (và cân nhắc bổ sung ở General nếu đây là mục tiêu chính).
  - *Phương án B:* Nếu Quản lý theo dõi qua màn hình xét duyệt `R-02` và Quản trị viên theo dõi qua báo cáo `M-07`: Sửa lại cột Actor trong bảng Danh mục mục 3 và Mô tả R-04 thành chỉ có `Khách hàng`.

---

### Finding F-02: Bất nhất về Actor người vận hành đối với use case `R-03`
- **Mức độ ảnh hưởng:** Trung bình (Medium)
- **Phân loại:** Lỗi không nhất quán mô hình (Model Inconsistency)
- **Vị trí file:dòng:**
  - `docs/03-product/use-cases.md:163` (Sơ đồ General)
  - `docs/03-product/use-cases.md:318` (Sơ đồ chi tiết 2.3.3)
  - `docs/03-product/use-cases.md:440` (Bảng Danh mục use case)
  - `docs/03-product/use-case-descriptions.md:163` (Mô tả R-03)
- **Căn cứ:**
  - Tại bảng Danh mục (`use-cases.md:440`): `R-03 | Thực hiện và theo dõi giao dịch hoàn tiền | Cổng thanh toán; người vận hành có thẩm quyền theo phạm vi`.
  - Tại mô tả (`use-case-descriptions.md:163`): `Actor/kích hoạt: cổng thanh toán phối hợp; vận hành có thẩm quyền theo dõi.`
  - Trong sơ đồ General (`dòng 163`) và sơ đồ 2.3.3 (`dòng 318`): `R-03` chỉ có duy nhất association với Cổng thanh toán (`R_03 --- pay`).
- **Tình huống gây lỗi:** Tương tự F-01, sơ đồ thể hiện R-03 là tương tác giao dịch thuần túy giữa hệ thống và Cổng thanh toán, trong khi danh mục và mô tả lại định nghĩa có người vận hành trực tiếp tham gia.
- **Đề xuất sửa:**
  - Nếu người vận hành chỉ can thiệp khi có sự cố đối soát hoặc theo dõi tiến trình: Làm rõ trong mô tả R-03 rằng đây là tương tác chính giữa nền tảng và `Cổng thanh toán`, việc vận hành can thiệp là ngoại lệ hỗ trợ; hoặc bổ sung association giữa `admin` với `R_03` trong sơ đồ chi tiết 2.3.3.

---

### Finding F-03: Thiếu actor `Dịch vụ email` trong Bảng Danh mục use case đối với `L-06`
- **Mức độ ảnh hưởng:** Thấp (Low)
- **Phân loại:** Lỗi trình bày / Thiếu sót bảng dữ liệu (Presentation Omission)
- **Vị trí file:dòng:**
  - `docs/03-product/use-cases.md:455` (Bảng Danh mục use case)
  - Đối chiếu với `docs/03-product/use-cases.md:173`, `:382` và `docs/03-product/use-case-descriptions.md:302`
- **Căn cứ:**
  - Trong sơ đồ General (`dòng 173`) và sơ đồ chi tiết 2.3.5 (`dòng 382`): Đều có đường nối `L_06 --- mail`.
  - Trong mô tả `L-06` (`use-case-descriptions.md:302`): Ghi rõ `Actor/kích hoạt: khách hàng mở thông báo/email giao dịch; dịch vụ email phối hợp gửi.`
  - Tuy nhiên, tại bảng Danh mục mục 3 (`dòng 455`), cột "Actor chính/phối hợp" chỉ ghi: `Khách hàng`.
  - Trong khi đó, các use case khác có sự phối hợp của dịch vụ email như `A-02`, `A-05`, `O-02`, `R-07` đều được ghi rõ `; dịch vụ email` trong bảng danh mục này.
- **Tình huống gây lỗi:** Không gây sai lệch logic nghiệp vụ, nhưng làm giảm tính nhất quán hình thức khi đối chiếu chéo bảng danh mục với sơ đồ Mermaid.
- **Đề xuất sửa:** Cập nhật dòng 455 của bảng Danh mục thành: `Khách hàng; dịch vụ email`.

---

### Finding F-04: Chưa làm rõ actor nhận thông báo email vé trong sơ đồ chi tiết 2.3.2 (`B-06`)
- **Mức độ ảnh hưởng:** Thấp (Low)
- **Phân loại:** Câu hỏi ranh giới mô hình (Model Boundary Question)
- **Vị trí file:dòng:**
  - `docs/03-product/use-cases.md:269`, `:281` (Sơ đồ chi tiết 2.3.2)
  - `docs/03-product/use-case-descriptions.md:118`, `:121` (Mô tả B-06)
- **Căn cứ:**
  - Trong mô tả B-06 (`use-case-descriptions.md:118`): Ghi nhận bước `(4) cho khách tra cứu, gửi thông báo` và quy tắc `Email lỗi không biến vé đã xác nhận thành chưa thanh toán.`
  - Nhưng trong sơ đồ chi tiết 2.3.2 (Đặt vé và thanh toán), chỉ có 2 actor là `Khách hàng (customer)` và `Cổng thanh toán (pay)`; hoàn toàn không xuất hiện actor `Dịch vụ email (mail)`.
  - Đối chiếu với sơ đồ 2.3.3 (Hủy vé và hủy suất): Use case `R-07 (Thực thi quyết định hủy suất)` khi gửi email thông báo hủy suất cho khách hàng thì có đường nối rõ ràng với actor `mail` (`R_07 --- mail`).
- **Tình huống gây lỗi:** Người phát triển backend có thể băn khoăn: Việc gửi email chứa vé QR sau khi B-06 phát hành vé là do chính tiến trình B-06 kích hoạt actor `mail`, hay là một sự kiện bất đồng bộ tách rời được xử lý qua `L-06`?
- **Đề xuất sửa:**
  - Nếu B-06 trực tiếp kích hoạt Dịch vụ email để gửi vé: Bổ sung actor `mail` và đường nối `B_06 --- mail` vào sơ đồ chi tiết 2.3.2.
  - Nếu việc gửi email là trách nhiệm của dịch vụ thông báo nền (thuộc phạm vi L-06): Bổ sung một câu giải thích rõ trong mô tả B-06 để thống nhất cách hiểu.

---

### Finding F-05: Sơ đồ General (2.1) có tỷ lệ chiều cao quá lớn gây khó đọc trên khung hẹp / thiết bị di động
- **Mức độ ảnh hưởng:** Trung bình (Medium)
- **Phân loại:** Lỗi trình bày / Khả năng hiển thị thực tế (Layout & Readability)
- **Vị trí file:dòng:**
  - `docs/03-product/use-cases.md:75-185` (Khối mã Mermaid 2.1)
  - `docs/04-standards/use-case-modeling.md:84-85`, `:115-116`
- **Căn cứ:**
  - Đo lường thực tế từ bản render SVG và PNG:
    + Kích thước viewBox: `1327px × 5377px` (tỷ lệ chiều cao / chiều rộng là ~4.05:1).
    + Toàn bộ 34 use case được xếp dọc liên tiếp thành một dải dài hơn 5300px.
    + Nút `Khách hàng` phát sinh chùm 15 đường song song chạy dọc cạnh trái; nút `Quản trị viên` phát sinh chùm 10 đường song song chạy dọc cạnh phải.
  - Quan sát ở khung hẹp (mobile viewport 375px - 414px hoặc trình xem markdown chia đôi màn hình / split pane):
    + Nếu trình xem tự động co giãn (`max-width: 100%`), sơ đồ bị thu nhỏ khoảng 3.5 đến 4 lần. Cỡ chữ 14px giảm còn ~3.5–4px, hoàn toàn không thể đọc được nội dung chữ bên trong các nút use case.
    + Người xem buộc phải phóng to và cuộn trang liên tục trên khoảng cách rất dài.
    + Các chùm đường nối dày đặc chạy song song sát nhau gây hiện tượng mỏi mắt khi dò đường (line tracing fatigue).
- **Tình huống gây lỗi:** Người dùng hoặc nhà phát triển đọc tài liệu trên thiết bị di động hoặc trong panel xem trước của IDE (như VS Code Markdown Preview) sẽ gặp khó khăn lớn trong việc bao quát sơ đồ General.
- **Đề xuất cải tiến:**
  - Giữ nguyên sơ đồ General hiện tại làm bản tham chiếu đầy đủ (như quy chuẩn mục 2 yêu cầu).
  - Bổ sung khuyến nghị rõ ràng ở đầu mục 2.1: *Khuyến khích người xem mở toàn màn hình (full-width) khi xem General, hoặc tham khảo trực tiếp các sơ đồ chi tiết từ 2.3.1 đến 2.3.6*. (Các sơ đồ chi tiết có kích thước chuẩn từ 800–1100px, tỷ lệ cân đối và độ trực quan cực kỳ cao).
  - Khi công cụ vẽ nâng cao cho phép, có thể cấu hình Mermaid bố trí các subgraph thành 2 cột song song (nếu trình render hỗ trợ) để giảm chiều cao tổng thể xuống còn khoảng 2500px.

---

## IV. CÁC ĐIỂM NGHIỆP VỤ CẦN CHỦ SẢN PHẨM QUYẾT ĐỊNH (OPEN POLICIES)

Theo đúng handoff, reviewer không tự ý quyết định hay áp đặt giá trị mặc định cho các chính sách còn mở. Dưới đây là 3 điểm nghiệp vụ thực tế phát sinh trong quá trình rà soát:

1. **Quy trình ngoại lệ cho người đi cùng khi thiếu mã QR (`O-02` và `OPEN-06`):**
   - *Hiện trạng:* `O-02` yêu cầu xác minh bằng mã gửi qua email của tài khoản đứng tên đơn vé.
   - *Vấn đề thực tế:* Nếu khách đi theo nhóm (1 người mua cho 4 người), người đi cùng đến rạp một mình mà không mang theo ảnh QR và không có quyền truy cập email của người đặt vé thì không thể qua cửa bằng `O-02`.
   - *Cần quyết định:* Cần chủ sản phẩm xác định quy trình xử lý ngoại lệ tại rạp (ví dụ: liên hệ quản lý rạp đối chiếu thông tin cá nhân, hay chuyển sang quầy vé).

2. **Xử lý combo bắp nước khi hủy vé một phần (`BR-10`, `OPEN-02` và `OPEN-07`):**
   - *Hiện trạng:* `BR-10` cho phép hủy vé một phần; `OPEN-02` ghi nhận việc xử lý combo đã/chưa nhận.
   - *Vấn đề thực tế:* Nếu đơn hàng gồm 2 vé + 1 combo lớn, khi khách hủy 1 vé thì combo có bị hủy theo không? Nếu khách đã nhận combo tại quầy (`O-04`) trước giờ chiếu thì có được phép hủy vé xem phim còn lại không?
   - *Cần quyết định:* Chủ sản phẩm và bộ phận vận hành rạp cần chốt quy tắc liên kết giữa quyền nhận combo và quyền sử dụng vé khi có yêu cầu hủy một phần.

3. **Quyền đánh giá phim của người đi cùng (`BR-16`, `OPEN-08`):**
   - *Hiện trạng:* `BR-16` gắn quyền viết đánh giá với tài khoản có vé đã soát (tài khoản đặt vé).
   - *Vấn đề thực tế:* Người đi cùng được soát vé vào xem phim nhưng không đứng tên tài khoản đặt vé thì không thể viết đánh giá.
   - *Cần quyết định:* Giữ nguyên quy tắc để chống spam đánh giá (mỗi tài khoản mua vé 1 đánh giá), hay mở rộng cơ chế cho người đi cùng trong tương lai theo `OPEN-08`.

---

## V. CÁC PHẦN CHƯA KIỂM CHỨNG (LIMITATIONS & SCOPE BOUNDARIES)

1. **Trình xem Markdown đích:** Việc kiểm tra bố cục và render đã được thực hiện bằng Mermaid CLI v12.2.0 (engine Chromium Puppeteer tiêu chuẩn) xuất ra SVG/PNG. Chưa kiểm chứng trên mọi biến thể renderer Markdown cá nhân của người dùng (như các plugin Markdown preview trên VS Code, Obsidian, hay giao diện web GitHub/GitLab trên các độ phân giải màn hình cụ thể).
2. **Triển khai runtime của các dịch vụ bên ngoài:** Đánh giá này dựa trên mô hình hóa tài liệu và đối chiếu hợp đồng mã nguồn (`contracts`). Các dịch vụ tích hợp thực tế như Cổng thanh toán MoMo/VNPAY và Dịch vụ gửi email chưa được kiểm chứng tích hợp end-to-end do mã nguồn hiện tại đang dùng adapter mô phỏng in-memory.

---

## VI. BẢNG TỔNG HỢP THEO DÕI FINDINGS

| Mã | Nội dung tóm tắt | Phân loại | Mức độ | Vị trí chính | Hành động đề xuất |
|---|---|---|---|---|---|
| **F-01** | Bất nhất actor quản lý/quản trị ở `R-04` | Lỗi mô hình | Trung bình | `use-cases.md:158`, `:313`, `:441` | Bổ sung association vào sơ đồ 2.3.3 hoặc chuẩn hóa lại bảng danh mục/mô tả. |
| **F-02** | Bất nhất actor người vận hành ở `R-03` | Lỗi mô hình | Trung bình | `use-cases.md:163`, `:318`, `:440` | Làm rõ vai trò vận hành trong mô tả hoặc bổ sung association trong 2.3.3. |
| **F-03** | Thiếu ghi `Dịch vụ email` ở `L-06` trong bảng danh mục | Lỗi trình bày | Thấp | `use-cases.md:455` | Cập nhật thêm `; dịch vụ email` vào cột Actor. |
| **F-04** | Chưa rõ ranh giới gửi email vé ở `B-06` trong sơ đồ 2.3.2 | Ranh giới mô hình | Thấp | `use-cases.md:281`, Mô tả B-06 | Bổ sung association với `mail` trong 2.3.2 hoặc ghi chú rõ xử lý qua kênh thông báo. |
| **F-05** | Sơ đồ General có tỷ lệ chiều cao quá lớn (~4:1) khó đọc trên khung hẹp | Hiển thị/Render | Trung bình | `use-cases.md:75-185` | Bổ sung hướng dẫn xem toàn màn hình và khuyến khích dùng sơ đồ chi tiết 2.3.1–2.3.6. |

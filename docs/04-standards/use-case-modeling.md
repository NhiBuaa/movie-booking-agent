# Quy chuẩn phân tích và trình bày UML use case

**Trạng thái:** được chủ sản phẩm chấp thuận ngày 2026-11-16 trong hội thoại thiết kế use case.
Áp dụng khi tạo hoặc cập nhật mô hình use case của dự án. Chuẩn này sở hữu **cách làm và cách
trình bày**; [mô hình sản phẩm](../03-product/use-cases.md) sở hữu actor, mục tiêu và quy tắc nghiệp vụ.
Không sao chép chính sách nghiệp vụ vào chuẩn hoặc coi tài liệu đã duyệt là code đã hoạt động.

## 1. Phân tích trước khi vẽ

1. Đọc nguồn có thẩm quyền và code liên quan. Phân biệt hiện trạng đã quan sát, yêu cầu đã xác nhận,
   đề xuất và điều chưa biết; nêu nguồn/commit đối chiếu khi mô tả hiện trạng.
2. Chốt mục đích sơ đồ (hiện trạng hay sản phẩm mục tiêu), ranh giới hệ thống, đối tượng phục vụ
   và phần ngoài phạm vi trước khi chốt actor. Không tự mở rộng phạm vi vì muốn sản phẩm “đầy đủ”.
3. Hỏi từng vòng ngắn bằng tiếng Việt rõ ràng; thường 1–2 quyết định liên quan mỗi vòng.
   Nêu lựa chọn, đề xuất và đánh đổi. Tra cứu sự thật trong nguồn trước, không bắt người dùng trả lời
   điều có thể đọc được. Chờ câu trả lời trước khi quyết định phần phụ thuộc.
4. Làm rõ actor, mục tiêu, quyền/phạm vi dữ liệu, thuật ngữ và ngoại lệ bằng tình huống cụ thể.
   Không tự gán giá trị cho chính sách còn thiếu; đặt mã quyết định còn mở và ghi ảnh hưởng.
5. Tổng hợp các điểm đã chốt và các điểm được phép để mở; người dùng xác nhận cách hiểu chung
   trước khi hoàn thiện sơ đồ. Câu hỏi “vì sao” hoặc yêu cầu so sánh chỉ cần trả lời, không tự sửa tài liệu.

Giữ lại quyền phê duyệt hiện hành. Phân tích/viết tài liệu không tự cấp quyền sửa code, cài công cụ,
đổi cấu hình trình xem, commit/push, merge hoặc triển khai.

## 2. Cấu trúc tài liệu bắt buộc

Trình bày theo thứ tự **General toàn hệ thống → bảng ánh xạ → sơ đồ chi tiết theo chức năng**.
Kèm danh mục/mô tả use case, quy tắc nghiệp vụ, nguồn quyết định, đối chiếu hiện trạng và các mục còn mở.

| Thành phần | Nội dung cần có |
|---|---|
| General | Các actor và **mục tiêu cụ thể chính** mà từng actor tham gia. Những tên rộng như “quản lý tài khoản” hay “hội viên” chỉ làm khung nhóm, không thay toàn bộ các use case bên trong. |
| Bảng ánh xạ | Mỗi nhóm dẫn tới sơ đồ chi tiết; chỉ rõ use case nào hiện trên General, hành vi hỗ trợ nào bổ sung ở chi tiết. Bao phủ đủ danh mục, không âm thầm bỏ chức năng. |
| Chi tiết | Giữ cùng mã/tên/nghĩa với General; thêm hành vi hỗ trợ và quan hệ UML thực sự cần thiết. Không bắt mỗi nhóm phải có include/extend. |
| Mô tả | Mã/tên, actor, kích hoạt, điều kiện trước, luồng chính, kết quả sau, ngoại lệ và quy tắc/quyết định còn mở liên quan. |

Mỗi use case biểu diễn mục tiêu có kết quả quan sát được, không phải một nút bấm, endpoint hoặc
thành phần kỹ thuật. Các góc nhìn là cùng một mô hình; bảng phân rã không tự sinh quan hệ UML.
Số actor, nhóm và use case phải theo phạm vi thực tế, không có hạn ngạch cố định.

## 3. Ngữ nghĩa UML và quyền truy cập

- Actor là **vai trò bên ngoài ranh giới đang xét**, có thể là người hoặc hệ thống khác.
  Thành phần nội bộ, ứng dụng/kênh tương tác không tự trở thành actor.
- Association là đường liền không hướng; không diễn tả thứ tự xử lý hoặc quyền đối với mọi mục tiêu
  trong cùng khung nhóm. Nối actor với đúng use case mà vai trò tham gia.
- Phân biệt actor chính, actor phối hợp, tham gia gián tiếp qua use case gọi và tham gia khi có ngoại lệ.
  Từng use case phải khớp tập actor giữa các góc nhìn; phần chỉ hỗ trợ qua include có thể ghi rõ actor
  qua use case gọi, không cần thêm association trực tiếp để cho đủ số. Ngoại lệ không tự cấp quyền mới.
- Khi mô tả có tương tác dịch vụ ngoài, thể hiện actor phối hợp hoặc ghi rõ trách nhiệm thuộc mục tiêu khác.
  Association không quy định gửi đồng bộ hay xử lý nền; trình tự/asynchronous không tự sinh include/extend.
- `include`: mũi tên nét đứt từ use case gọi **đến hành vi được bao gồm**; hành vi đó bắt buộc
  tại vị trí tương ứng. Không dùng chỉ vì hai tác vụ xảy ra nối tiếp.
- `extend`: mũi tên nét đứt từ use case bổ sung **về use case gốc**; ghi điều kiện và điểm mở rộng
  thuộc use case gốc. Use case gốc phải có nghĩa ngay cả khi phần bổ sung không chạy.
- Phiên đăng nhập/quyền đã có thường là điều kiện trước; không include “Đăng nhập” vào mọi thao tác.
  Tác vụ sau mua, callback, kiểm duyệt sau đăng hoặc hoàn tiền bất đồng bộ không tự là extend/include.
- Không dùng generalization để ngầm cấp quyền. Chỉ dùng khi vai trò chuyên biệt thực sự thay thế
  vai trò tổng quát và kế thừa các quan hệ đúng nghĩa.
- Kiểm kê các quan hệ include/extend trong bảng: nguồn, đích, loại, vị trí/điều kiện và lý do.
  Đồng nhất hướng mũi tên và điều kiện giữa bảng, sơ đồ và mô tả.

Chuẩn ngữ nghĩa: [OMG UML 2.5.1, chương 18](https://www.omg.org/spec/UML/2.5.1/PDF).

## 4. Mã sơ đồ trong Markdown

- Dùng khối mã `mermaid` trực tiếp trong `.md` làm nguồn sơ đồ; không mặc định sinh ảnh, trang HTML
  hoặc bản nguồn riêng phải đồng bộ. Ảnh tạm để kiểm tra không phải tài liệu bàn giao bắt buộc.
- Với trình xem đang dùng, `flowchart` có thể biểu diễn mô hình use case bằng quy ước: actor là hộp
  có nhãn `«actor»`, use case là nút bo tròn, hệ thống là khung `subgraph`, nhóm chức năng là khung
  phụ. Phải nói rõ đây là cách trình bày UML bằng Mermaid, không phải sơ đồ luồng xử lý hay bộ vẽ UML chuyên biệt.
- Giữ mã/tên use case ổn định. Các khung nhóm là nhãn bố trí, không phải actor, use case hoặc
  ranh giới dịch vụ mới. Dùng `<br/>` để ngắt nhãn tại cụm từ dễ hiểu.
- `---` biểu diễn association; `-.->` kèm nhãn `«include»`/`«extend»` giữ chiều theo mục 3.
  Không thêm đường có nghĩa nghiệp vụ chỉ để ép layout. Mọi đường vô hình dùng thuần bố trí phải có chú thích.
- Không mặc định thêm renderer/plugin hoặc đổi cài đặt người dùng. Tính tương thích phải được kiểm tra
  với trình xem Markdown đích; nếu có giới hạn ký hiệu/hình dạng thì ghi rõ.

## 5. Bố cục ưu tiên khả năng đọc

1. Đặt use case trong khung hệ thống, actor ở ngoài. Actor có thể đặt hai bên để giảm đường cắt nhau;
   đảo thứ tự hai đầu đường `---` để bố trí không làm đổi nghĩa association.
2. **Mỗi vai trò actor chỉ xuất hiện một lần trong mỗi sơ đồ, đặc biệt là General**, với một ID
   ổn định; nối mọi use case liên quan về đúng nút đó. Có thể dùng lại cùng actor ở các sơ đồ
   chi tiết khác nhau. Trong Mermaid, hai ID khác nhau tạo hai nút riêng; cùng tên hoặc lời ghi chú
   không tự biến chúng thành một phần tử mô hình UML.
3. Tăng khoảng cách giữa nút/cột, dùng đường thẳng hoặc gấp đoạn; không để đường đi xuyên qua chữ
   hoặc nút không liên quan. Không chỉ đổi màu để che vấn đề đường chồng nhau.
4. Giữ chữ đọc được; sơ đồ lớn có thể cần kéo ngang/thu phóng. Không ép toàn bộ vào chiều rộng hẹp
   khiến nhãn quá nhỏ. Vẫn phải có một General đầy đủ trước các sơ đồ chi tiết.
   Với General lớn, hướng dẫn xem toàn màn hình và dẫn tới các sơ đồ chi tiết theo chức năng.
5. Nếu tăng khoảng cách chưa đủ, thử đổi bên actor, thứ tự khai báo/nối, hướng bố trí và cách đi đường;
   kiểm tra bản render sau mỗi thay đổi. Dùng các sơ đồ chi tiết để đọc sâu, vẫn giữ General có các
   mục tiêu chính cụ thể. Không tự lặp actor hoặc xóa chức năng/quyền đã duyệt để làm gọn.
   Nếu trình xem không đáp ứng, nêu giới hạn và đề xuất công cụ vẽ UML phù hợp để thống nhất trước
   khi thay định dạng; không tự cài renderer/plugin hoặc đổi cài đặt người dùng.

Quy tắc một actor/một sơ đồ là quy ước trình bày của dự án, không phải tuyên bố UML cấm mọi cách
biểu diễn lặp. Ngoại lệ chỉ xem xét khi được chấp thuận rõ và công cụ duy trì các hình hiển thị như
tham chiếu tới **cùng một phần tử mô hình** có thể truy vết; không áp dụng bằng cách nhân ID Mermaid.

Thông số khởi điểm đã dùng trong dự án, **được điều chỉnh theo bản render**, không phải giá trị bắt buộc:

```text
%%{init: {"flowchart":{"nodeSpacing":55,"rankSpacing":100,"curve":"linear","useMaxWidth":false,"padding":18}}}%%
```

Sao chép dòng trên vào đầu khối `mermaid` khi phù hợp. Mermaid có thể bỏ qua `direction` riêng của
nhóm khi nút bên trong nối ra ngoài; không hứa thứ tự nhóm chỉ dựa trên thứ tự viết mã.
Renderer ELK phụ thuộc hỗ trợ của trình xem, không mặc định có sẵn.
Cú pháp/thông số tham khảo: [Mermaid flowchart](https://mermaid.js.org/syntax/flowchart.html).

## 6. Kiểm tra trước khi bàn giao

- [ ] Đúng phạm vi, actor bên ngoài, quyền dữ liệu và điều kiện nghiệp vụ đã được xác nhận.
- [ ] General hiện các mục tiêu chính; bảng ánh xạ bao phủ danh mục; mã/tên khớp với chi tiết/mô tả.
- [ ] Actor chính/phối hợp và phạm vi khớp General, chi tiết, danh mục và mô tả; tham gia qua include
  hoặc ngoại lệ được ghi rõ, không suy quan hệ thành quyền chưa được duyệt.
- [ ] Tương tác dịch vụ ngoài có association hoặc giải thích ranh giới trách nhiệm; không bịa cơ chế tích hợp.
- [ ] Mỗi vai trò có đúng một nút actor trong từng sơ đồ; ID ổn định, không nhân nút để rút ngắn đường.
- [ ] Tập actor, use case và association trước/sau chỉnh layout không thay đổi về ngữ nghĩa.
- [ ] Include/extend đúng chiều, điểm mở rộng và điều kiện; không dùng làm mũi tên thời gian.
- [ ] Toàn bộ khối Mermaid parse/render được. Không khẳng định dễ đọc chỉ từ parse thành công.
- [ ] Nhìn bản render, gồm khung hẹp tương tự preview người dùng và các nhóm nhiều đường nối;
  kiểm tra nút/nhãn không chồng, đường không xuyên nút/chữ, đường hai chiều không bị hiểu nhầm.
- [ ] Sau khi đổi association, render và quan sát lại sơ đồ bị ảnh hưởng dù bản trước đã đạt.
- [ ] Kiểm tra liên kết và diff; không thay đổi nội dung nghiệp vụ trong một lần sửa thuần layout.
- [ ] Nêu rõ phần đã kiểm tra, phần chưa xem được trên trình đích và chính sách còn mở.

Chỉ kiểm tra tài liệu khi thay đổi thuần tài liệu; không lấy test ứng dụng làm bằng chứng hình vẽ đúng.
Nếu cần đổi model/phạm vi/quyền để xử lý vấn đề trình bày, phải chốt thay đổi đó với chủ sản phẩm.

## 7. Nguồn mẫu của dự án

- [General, ánh xạ và các sơ đồ Mermaid chi tiết](../03-product/use-cases.md).
- [Mô tả từng use case và ngoại lệ](../03-product/use-case-descriptions.md).
- [Thuật ngữ nghiệp vụ](../../GLOSSARY.md).

Chủ sản phẩm đã chấp thuận cách phân tích, cấu trúc và bố cục này trong hội thoại ngày 2026-11-16.
Đây là chấp thuận phương pháp/tài liệu, không xác nhận sản phẩm đã vận hành hoặc mọi trình xem đều render giống nhau.
Khi đưa vào một bộ kit dùng chung, chỉ khái quát hóa phương pháp; không mang theo actor, số lượng,
chính sách đặt vé/hoàn tiền hoặc các đường dẫn máy cá nhân như yêu cầu của dự án khác.

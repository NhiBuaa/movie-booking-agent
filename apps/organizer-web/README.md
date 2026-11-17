# Cinema Organizer Portal (`apps/organizer-web`)

Portal mục tiêu phục vụ quản trị viên toàn chuỗi và quản lý rạp của một đơn vị/chuỗi rạp.
Đây là mô tả trách nhiệm, không xác nhận scaffold đã triển khai đầy đủ; xem [CONTEXT](../../CONTEXT.md).

## Kênh sử dụng mục tiêu

[Phạm vi dự án](../../PROJECT-OVERVIEW.md#in-scope) xác định Organizer có cả bản Web và ứng dụng
Mobile riêng tại [Organizer Mobile](../organizer-mobile/PRODUCT.md).
`apps/organizer-web` là vị trí bản Web; [PRODUCT](PRODUCT.md) ghi bối cảnh của ứng dụng này.
Organizer phục vụ quản trị viên/quản lý rạp và có bối cảnh riêng với ứng dụng khách hàng.
Thêm kênh Mobile không mở rộng quyền theo vai trò hoặc rạp được giao.

Hiện chỉ có tài liệu phạm vi; framework Web chưa chốt, chưa có build/runtime Organizer.

## Responsibilities

- Danh mục phim/trailer, giá vé/ưu đãi, phòng và sơ đồ ghế riêng, lịch chiếu, cấp/thu hồi quyền,
  báo cáo vận hành/doanh thu; danh mục/giá combo, bật/tắt cung cấp tại rạp, chính sách hội viên theo
  M-01–M-10 và phạm vi actor đã chốt.
- Xét yêu cầu hủy, theo dõi hủy/hoàn, đề nghị và duyệt hủy suất theo R-02–R-06.
  Quyết định duyệt chưa đồng nghĩa tiền đã hoàn; quản lý không tự có quyền duyệt hủy suất.
- Phân biệt quyền toàn chuỗi và rạp được giao; không ngầm cấp quyền soát vé hoặc giao combo cho quản lý.
- R-08 lập hồ sơ lỗi dịch vụ, O-06/O-07 giám sát nhận khách/xử lý sự cố combo; L-05/L-08 kiểm duyệt/xét lại,
  L-09/L-10 đề nghị/duyệt sửa sai quyền lợi và A-08 xử lý ngoại lệ xóa dữ liệu theo đúng vai trò.
  Hộp thông báo/cảnh báo và email vận hành theo L-06/N-01; nhận cảnh báo không tự cấp quyền xử lý hồ sơ.

[Mô hình use case](../../docs/03-product/use-cases.md) sở hữu quyền/mục tiêu;
[mô tả use case](../../docs/03-product/use-case-descriptions.md) sở hữu điều kiện và ngoại lệ.
Q173-A đã đồng bộ các chính sách đã chọn; OPEN-01–OPEN-10 giữ phần đặc tả/kiểm chứng còn lại,
không phải quyền combo/hoàn/báo cáo vẫn chưa chốt. Nhà cung cấp/hợp đồng, bảng lưu/xóa, pháp lý,
phân quyền và nhân sự chưa được xác nhận sẵn sàng. Không coi dữ liệu mẫu hay vai trò “movie distributor”
là yêu cầu được duyệt.

# Cinema Organizer Portal (`apps/organizer`)

Portal mục tiêu phục vụ quản trị viên toàn chuỗi và quản lý rạp của một đơn vị/chuỗi rạp.
Đây là mô tả trách nhiệm, không xác nhận scaffold đã triển khai đầy đủ; xem [CONTEXT](../../CONTEXT.md).

## Responsibilities

- Danh mục phim/trailer, giá vé/ưu đãi, phòng và sơ đồ ghế riêng, lịch chiếu, cấp/thu hồi quyền,
  báo cáo vận hành/doanh thu theo M-01–M-07 và phạm vi actor đã chốt.
- Xét yêu cầu hủy, theo dõi hủy/hoàn, đề nghị và duyệt hủy suất theo R-02–R-06.
  Quyết định duyệt chưa đồng nghĩa tiền đã hoàn; quản lý không tự có quyền duyệt hủy suất.
- Phân biệt quyền toàn chuỗi và rạp được giao; không ngầm cấp quyền soát vé hoặc giao combo cho quản lý.

[Mô hình use case](../../docs/03-product/use-cases.md) sở hữu quyền/mục tiêu;
[mô tả use case](../../docs/03-product/use-case-descriptions.md) sở hữu điều kiện và ngoại lệ.
Quyền quản lý danh mục/giá combo, cách xử lý hoàn và chỉ số báo cáo còn theo OPEN-01–OPEN-10;
không coi dữ liệu mẫu hay vai trò “movie distributor” là yêu cầu được duyệt.

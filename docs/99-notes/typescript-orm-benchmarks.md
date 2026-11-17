# Benchmark ORM TypeScript — nguồn và giới hạn

Tra cứu ngày 2026-11-16. Ghi chú tham khảo, không phải quyết định ORM hoặc bằng chứng chạy thử
Movie Booking. Không chạy benchmark, cài dependency hay gọi database/provider trong lần nghiên cứu này.
Lựa chọn Drizzle ORM + Kit đã được ghi tại
[ADR-0005](../06-decisions/0005-drizzle-orm-and-kit-for-cinema-core.md); benchmark bên dưới không thay
bằng chứng hiệu năng của Cinema Core trên workload thực.

## Nguồn công khai

### Prisma

[Benchmark năm 2024](https://www.prisma.io/blog/performance-benchmarks-comparing-query-latency-across-typescript-orms-and-databases)
đo 14 query và có đủ Prisma, Drizzle, TypeORM. [Snapshot chứa kết quả](https://github.com/prisma/orm-benchmarks/tree/7008cef534c29d02bfd5cc19494040d8732c06a0)
có lockfile Prisma 5.15.0, Drizzle 0.31.4, TypeORM 0.3.20; không gán manifest HEAD mới vào CSV cũ.
Lockfile chưa tự chứng minh đúng dependency đã được cài trong lần đo.

[Bộ benchmark mới](https://github.com/prisma/prisma-orm-benchmarks/tree/8d1e89ff78003e3d0e0a6b9a60ebbd95c95de655)
có Prisma 7/8 RC, Drizzle beta và raw pg, không có TypeORM. Không trộn kết quả hai thế hệ hoặc
xem cùng endpoint là bằng chứng SQL/payload tương đương. Cả hai do vendor Prisma sở hữu.

### Drizzle

[Trang benchmark chính thức](https://orm.drizzle.team/benchmarks) và
[mã nguồn](https://github.com/drizzle-team/drizzle-benchmarks) công khai cách chạy.
Trang hiện liệt kê cả Drizzle RC/beta và Prisma nhiều thế hệ; phần TypeORM ghi “coming soon”.
Đây là nguồn do Drizzle công bố. Cần xác định đúng bộ cấu hình, runtime và lần chạy trước khi dùng số liệu;
không gắn số liệu ở phần mô tả cũ với một cấu hình RC đang được chọn trên dashboard.

### ts-orm-benchmark của Roger Padilla

[Snapshot b102750eee680db97eb12705eecb8fe3a18a84c7](https://github.com/rogerpadilla/ts-orm-benchmark/blob/b102750eee680db97eb12705eecb8fe3a18a84c7/README.md#runtimes):
Drizzle 0.45.4, Prisma 7.10.1, TypeORM 1.1.2; Node 24.20.0, PostgreSQL 18.6, Apple M4 Max.
Đo chuỗi bảy bước trên một connection, không pooling. Tác giả cũng phát triển UQL;
không gọi đây là nguồn hoàn toàn độc lập. Không đại diện tải giao dịch đồng thời của ứng dụng.

## Áp dụng cho dự án — nhận định thiết kế

- Các nguồn có giá trị để xây câu hỏi và kịch bản kiểm chứng. Chúng không tự quyết định ORM phù hợp nhất.
- Không so trực tiếp thời gian của một query, cả chuỗi thao tác và HTTP request nếu phạm vi khác nhau.
- Phân biệt độ trễ trung vị, độ trễ phần đuôi, thông lượng và bộ nhớ cấp phát; không biến một chỉ số thành mọi chỉ số.
- Với Cinema Core, còn phải đo đúng transaction giữ nhiều ghế, ràng buộc/chỉ mục, tranh chấp,
  xử lý chạy lại và dự phòng PostgreSQL khi Redis lỗi. Đây là đề xuất kiểm chứng, chưa phải test đã chạy.
- Khi so sánh tại dự án cần cố định SQL/kết quả mong đợi, phiên bản, driver, pool, schema/index,
  kích thước dữ liệu và môi trường; công khai cách đo và kiểm tra dữ liệu đúng sau khi chạy.

Khảo sát này được thực hiện trước khi chủ sản phẩm chọn Drizzle ORM + Kit tại
[ADR-0005](../06-decisions/0005-drizzle-orm-and-kit-for-cinema-core.md).
Quyết định đó không biến các benchmark tham khảo thành bằng chứng Drizzle nhanh hơn Prisma/TypeORM cho hệ thống này.

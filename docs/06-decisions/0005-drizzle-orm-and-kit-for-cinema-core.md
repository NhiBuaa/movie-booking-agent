# ADR-0005 — Drizzle ORM và Kit cho Cinema Core

## Status

Accepted — chủ sản phẩm xác nhận ngày 2026-11-16 trong hội thoại **Tech Stack**
(`01a1e2f4-4de8-75d2-a43e-efd7365dbd58`): “tôi đồng ý lựa chọn Drizzle ORM + Kit”.
Đây là lựa chọn công nghệ, chưa phải chấp thuận cài package, triển khai code hoặc vận hành migration.

## Context

Cinema Core đã chọn [NestJS + Fastify](0036-nestjs-fastify-for-cinema-core.md),
[PostgreSQL và Redis](0003-postgresql-and-redis-for-platform-data.md).
[ADR-0004](0004-redis-roles-and-seat-hold-coordination.md) chọn Redis tham gia điều phối hold,
với PostgreSQL bảo vệ giao dịch cuối cùng và làm đường dự phòng khi Redis gặp sự cố.

Core có transaction nhiều bước, kiểm tra tranh chấp ghế, chống lặp và các ràng buộc PostgreSQL
cần rà soát rõ. Người phát triển có kinh nghiệm backend; mục tiêu portfolio gồm giải thích được
SQL, ranh giới giao dịch, đánh đổi và bằng chứng kiểm chứng theo
[tiêu chí dự án](../../PROJECT-OVERVIEW.md#technology-selection-criteria).

Đã đối chiếu Drizzle, Prisma và TypeORM bằng tài liệu chính thức, đồng thời khảo sát
[benchmark công khai](../99-notes/typescript-orm-benchmarks.md). Các bộ đo khác phiên bản,
môi trường và workload; chưa chứng minh một ORM nhanh nhất cho Cinema Core.

## Decision

- Chọn **Drizzle ORM** cho lớp truy cập PostgreSQL trong `services/cinema-core`: truy vấn có kiểu,
  theo hướng SQL và có thể dùng SQL tùy chỉnh khi cần.
- Chọn **Drizzle Kit** để quản lý schema/migration. Migration là thay đổi cấu trúc database có
  phiên bản; SQL sinh tự động hoặc tùy chỉnh vẫn cần review và kiểm chứng trước khi áp dụng.
- Các tính năng PostgreSQL đặc thù có thể dùng SQL migration tùy chỉnh khi bộ công cụ/phiên bản
  đã chọn chưa biểu diễn đủ. Cần giữ schema, migration và trạng thái database nhất quán.
- Kiểu TypeScript không thay kiểm tra dữ liệu lúc chạy. Validation, phân quyền và các bất biến
  trong [mô hình sản phẩm](../03-product/use-cases.md) vẫn phải được bảo vệ tại ranh giới phù hợp.

Lý do chính là khả năng đọc/rà truy vấn và thể hiện rõ quyết định giao dịch cùng lợi ích kiểu dữ liệu
TypeScript. Chi phí tiền tệ không dùng để xếp hạng. Không suy từ lựa chọn Drizzle rằng các transaction,
khóa hoặc đường dự phòng PostgreSQL đã an toàn hay có hiệu năng tốt hơn phương án khác.

## Alternatives Considered

| Phương án | Điểm phù hợp | Đánh đổi / kết quả |
|---|---|---|
| **Drizzle ORM + Kit** | SQL-like và truy vấn quan hệ có kiểu; transaction và migration SQL tùy chỉnh. | Được chọn. Người viết chủ động kiểm soát SQL, retry, migration và kết quả khi chạy. |
| **Prisma ORM + Migrate** | Client sinh có kiểu, thuận tiện thao tác dữ liệu/quan hệ; có transaction và SQL tùy chỉnh. | Hợp lệ, nhưng Core ưu tiên cách tiếp cận gần SQL; các đường PostgreSQL đặc thù vẫn cần SQL và quản lý schema/migration nhất quán. Không bị loại vì một kết luận tốc độ hoặc hạn chế của phiên bản cũ. |
| **TypeORM** | Entity/repository, QueryBuilder có khóa và tích hợp NestJS. | Hợp lệ nếu ưu tiên mô hình repository/decorator; cần dùng đúng manager/connection trong transaction và rà truy vấn/quan hệ được nạp. Không được chọn theo phong cách tổ chức dữ liệu mong muốn cho Core. |

## Consequences

- Có thể trình bày và rà SQL, ranh giới transaction cùng các ràng buộc trong một quy trình phát triển TypeScript.
- Cần tích hợp database qua dependency của NestJS, chọn driver/pool và giữ phạm vi transaction rõ.
  Mọi đường cập nhật có thẩm quyền vẫn đi qua Core; Drizzle không tạo transaction chung Redis–PostgreSQL.
- Khóa/cập nhật có điều kiện, retry có giới hạn và khôi phục kết quả chưa rõ vẫn là trách nhiệm thiết kế
  của ứng dụng. Cần kiểm chứng cạnh tranh, rollback, Redis lỗi và migration trên database thật.
- Chưa pin phiên bản ORM/Kit/driver. Trước triển khai phải kiểm tra tương thích và trạng thái phát hành
  ổn định; không tự lấy bản beta/RC hoặc phiên bản trong một benchmark làm phiên bản được duyệt.
- Schema vật lý, cách triển khai/khôi phục migration và quyền vận hành database còn cần thiết kế.
  ADR này không chọn ORM cho Agent Service hoặc cho phép Web/BFF truy cập dữ liệu Core trái ranh giới.
- Lõi công cụ là mã nguồn mở; không chọn dịch vụ cloud thương mại bổ sung trong quyết định này.
  Phí database, hosting, backup và các dịch vụ quản lý phải báo riêng khi chọn triển khai.

## References

- [Drizzle overview](https://orm.drizzle.team/docs/overview).
- [Drizzle transactions](https://orm.drizzle.team/docs/transactions).
- [Drizzle SQL template](https://orm.drizzle.team/docs/sql).
- [Drizzle Kit custom migrations](https://orm.drizzle.team/docs/kit-custom-migrations).
- [Prisma ORM 7 transactions](https://www.prisma.io/docs/orm/v7/prisma-client/queries/transactions).
- [TypeORM transactions](https://typeorm.io/docs/transactions/).
- [TypeORM QueryBuilder](https://typeorm.io/docs/query-builder/select-query-builder/).
- [Ghi chú nguồn và giới hạn benchmark](../99-notes/typescript-orm-benchmarks.md).

Đối chiếu tài liệu chính thức và Context7 ngày 2026-11-16; không chạy benchmark hoặc runtime.

# ADR-0036 — NestJS và Fastify cho Cinema Core

Mã ADR ban đầu trong nhánh tech stack là 0002; đổi sang 0036 khi hòa giải PR #5 vì
[ADR-0002](0002-customer-organizer-app-boundaries.md) đã được hợp nhất cho ranh giới bốn app.
Nguồn duyệt, ngày và lựa chọn framework bên dưới giữ nguyên; việc đổi mã không là phê duyệt mới.

## Status

Accepted — quyết định công nghệ được chủ sản phẩm chấp thuận ngày 2026-11-16.

Nguồn chấp thuận: hội thoại **Tech Stack** (`01a1e2f4-4de8-75d2-a43e-efd7365dbd58`),
phản hồi của người dùng: “tôi đồng ý chọn phương án NestJS + Fastify”.
Chấp thuận này áp dụng cho lựa chọn framework; không phải bằng chứng triển khai hoặc hiệu năng.

## Context

[Mô hình sản phẩm](../03-product/use-cases.md) đã chốt một đơn vị/chuỗi rạp, quyền theo rạp
được giao và nhiều nghiệp vụ liên kết: giữ ghế, thanh toán, vé theo ghế, hủy/hoàn tiền,
soát vé, combo và hội viên. [ADR-0001](0001-monorepo-platform-and-microservices-boundaries.md)
đặt Cinema Core là nguồn thẩm quyền giao dịch, độc lập với Web/BFF và AI Agent.

Bối cảnh lựa chọn là portfolio công khai, có đủ Web, Organizer, Mobile và AI;
dữ liệu lưu thật, AI thật và thanh toán thử nghiệm.
Người phát triển có kinh nghiệm sâu triển khai backend; đường học không phải tiêu chí hạn chế.
Monorepo hiện dùng TypeScript và có package hợp đồng dùng chung.

Ban đầu chủ sản phẩm ưu tiên miễn phí. Sau khi chấp thuận framework, chủ sản phẩm điều chỉnh
cùng ngày: chi phí không được ảnh hưởng việc chọn stack; ưu tiên công nghệ hiện đại, phù hợp và
hiệu suất tốt, đồng thời phải thông báo thành phần có phí. Tiêu chí hiện hành do
[PROJECT-OVERVIEW](../../PROJECT-OVERVIEW.md#technology-selection-criteria) sở hữu.
Lý do chọn NestJS + Fastify dưới đây không phụ thuộc gói hosting miễn phí.

## Decision

Chọn **NestJS với Fastify làm HTTP adapter** cho `services/cinema-core`, dùng TypeScript trên Node.js.
NestJS tổ chức controller, service, module và dependency; Fastify cung cấp tầng HTTP.
Đây là một ứng dụng Core, không phải hai dịch vụ NestJS và Fastify riêng biệt.

Ưu tiên cấu trúc nhất quán xuyên các nhóm nghiệp vụ và khả năng dùng chung hệ sinh thái TypeScript.
Chia module theo trách nhiệm nghiệp vụ; số lượng use case không quyết định số module.

Quyết định này không chọn framework cho Agent Service, database, ORM, cơ chế giữ ghế,
nhà cung cấp AI/email, phiên bản package hoặc cách bố trí triển khai.
Các quy tắc `BR-*` và chính sách `OPEN-*` tiếp tục do mô hình sản phẩm sở hữu.

## Alternatives Considered

| Phương án | Điểm phù hợp | Lý do chọn hoặc chưa chọn |
|---|---|---|
| **NestJS + Fastify** | Module và dependency có quy ước chung; dùng cùng TypeScript với Web/contracts. | Được chọn để tổ chức nhiều nhóm nghiệp vụ và kiểm thử theo cấu trúc nhất quán. |
| **Fastify trực tiếp** | Ít lớp framework; có plugin, schema validation và công cụ kiểm thử HTTP. | Khả thi, nhưng phải tự duy trì quy ước ghép dependency, phân quyền và ánh xạ lỗi xuyên các nhóm nghiệp vụ. |
| **Go + net/http** | HTTP và kiểm thử HTTP có trong thư viện chuẩn; là ứng viên đáng khảo sát về tài nguyên. | Thêm ngôn ngữ/toolchain và cơ chế đồng bộ hợp đồng với TypeScript; chưa có phép đo dự án chứng minh lợi ích đủ bù chi phí đó. |

## Consequences

### Positive

- Có cấu trúc chung cho nghiệp vụ, phân quyền và thay dependency khi kiểm thử.
- Dùng chung ngôn ngữ và tooling với các phần TypeScript hiện có trong monorepo.
- Giữ nguyên ranh giới Core có thẩm quyền theo ADR-0001.

### Negative / Trade-offs

- Thêm quy ước dependency injection, decorator và một lớp framework so với Fastify trực tiếp.
- Thành phần phụ thuộc API Express không tự tương thích; cần chọn thành phần tương ứng của Fastify.
- TypeScript types không thay validation khi chạy. Chống bán trùng, dùng vé lặp hoặc đổi điểm lặp
  vẫn phụ thuộc mô hình trạng thái, transaction, ràng buộc lưu trữ và kiểm thử cạnh tranh.
- Chưa có phép đo RAM, thời gian khởi động hoặc tải của ứng dụng Core. Không suy từ lựa chọn
  framework rằng hệ thống đã nhanh hơn, ít RAM hơn hoặc đáp ứng mục tiêu tải/độ trễ chưa được đo.

## References

- [Mô hình sản phẩm và quy tắc đã chốt](../03-product/use-cases.md).
- [Ranh giới hệ thống](../02-architecture/system-boundaries.md).
- [NestJS modules](https://docs.nestjs.com/modules).
- [NestJS Fastify adapter và tương thích nền tảng](https://docs.nestjs.com/techniques/performance).
- [NestJS testing](https://docs.nestjs.com/fundamentals/testing).
- [NestJS validation và giới hạn TypeScript interfaces](https://docs.nestjs.com/techniques/validation).
- [Fastify plugin encapsulation](https://fastify.dev/docs/latest/Reference/Encapsulation/).
- [Fastify validation](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/).
- [Go net/http](https://pkg.go.dev/net/http), [httptest](https://pkg.go.dev/net/http/httptest).

Nguồn thư viện được tra qua Context7 trong phiên nghiên cứu ngày 2026-11-16.

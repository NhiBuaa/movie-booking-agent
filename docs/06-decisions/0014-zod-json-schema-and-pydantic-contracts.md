# ADR-0014 — Zod 4, JSON Schema và Pydantic v2 cho hợp đồng chung

## Status

Accepted — ngày 2026-11-17, chủ sản phẩm xác nhận “tôi đồng ý với đề xuất A” trong hội thoại
Tech Stack (`01a1e2f4-4de8-75d2-a43e-efd7365dbd58`): Zod 4 → JSON Schema →
datamodel-code-generator → Pydantic v2. Chỉ chọn công nghệ; chưa cài dependency, chuyển DTO,
xuất schema, sinh model, sửa ứng dụng hoặc chạy pipeline.

## Context

Cinema Core và các client dùng TypeScript; [Agent](0009-python-fastapi-langgraph-and-uv-for-agent-service.md)
dùng Python. [Constitution III](../../.specify/memory/constitution.md) và ADR-0001 định hướng Zod
schemas trong `packages/contracts`. Package hiện chỉ có interfaces/types/constants, không có
Zod dependency hoặc pipeline sinh Python; kiểu TypeScript không tự kiểm dữ liệu lúc chạy.
Cần một nguồn hợp đồng và đầu ra dẫn xuất để tránh viết tay hai bản dễ lệch.

## Decision

- Dùng **Zod 4 schemas trong `packages/contracts` làm nguồn hợp đồng được sửa tay**;
  suy kiểu TypeScript từ schema, tránh duy trì interface trùng nghĩa bằng tay.
  Chỉ chia sẻ public API/event/boundary contracts có service sở hữu; domain model nội bộ, ORM/schema
  và migration ở service owner theo [thiết kế bảy service](../05-specs/004-service-decomposition/spec.md).
  Pipeline Zod/codegen không cho phép import persistence model hoặc SQL chéo service.
- Dùng **`z.toJSONSchema()` native** xuất JSON Schema; **`datamodel-code-generator`** sinh
  **Pydantic v2**, với đầu ra `pydantic_v2.BaseModel`. JSON Schema/model Python là đầu ra dẫn xuất,
  không sửa tay thành nguồn hợp đồng thứ hai.
- Codegen thuộc bước phát triển/build/CI. Runtime Python dùng model Pydantic đã sinh; runtime TS
  dùng validation đã đấu nối. Đặt schema trong package không tự nối validator vào Nest/Fastify
  hoặc kiểm mọi API/tool payload.
- Chỉ dùng phần schema trao đổi được qua JSON. Profile request/response, dialect, phiên bản,
  đường dẫn đầu ra và migration còn cần đặc tả; không coi mặc định 2020-12 của Zod tự tương thích
  mọi validator Fastify. Quyết định này không thay chủ sở hữu chính sách nghiệp vụ là Core/product model.

## Alternatives Considered

| Phương án | Lý do và đánh đổi |
|---|---|
| **Zod 4 → JSON Schema → Pydantic v2** | Được chọn: khớp hướng Zod hiện hành, có nguồn validation TS và đường sinh Python. Cần giới hạn schema và kiểm tương thích hai phía. |
| Interfaces TS → ts-json-schema-generator → Pydantic | Tận dụng DTO hiện có; kiểu TS không tự suy đầy đủ ràng buộc hoặc sinh validator TS. Không chọn làm pipeline chuẩn. |
| TypeBox/JSON Schema làm nguồn chính | Nguồn schema trung lập, suy kiểu TS được; cần hòa giải hướng Zod hiện hành. Không chọn, không sửa Constitution. |

## Consequences

- Schema giống nhau không chứng minh parse giống nhau. Kiểm missing/null/default, coercion,
  extra fields, enum/union, bounds, regex/formats, alias, ngày giờ, số/tiền và refs bằng cùng fixture
  chấp nhận/từ chối ở TS và Python.
- Export Zod mặc định mô tả output; default/coercion/pipe có thể khiến input khác output. Date,
  BigInt, transform/custom và kiểm tra JavaScript tùy ý không tự dịch sang Python. Không âm thầm
  thay schema không biểu diễn được bằng `{}` hoặc bỏ ràng buộc để codegen thành công.
- Quy tắc phụ thuộc DB/quyền/trạng thái như giữ ghế, TTL và thanh toán vẫn được Core kiểm.
  Model Pydantic hợp lệ không chứng minh người dùng có quyền hoặc giao dịch đã thành công.
- Khi triển khai, pin công cụ, sinh lại xác định và kiểm đầu ra không lệch trong CI; migration
  phải đối chiếu consumer và compatibility. Chưa chuyển DTO hay đo bundle/overhead validation.
- README contracts phải phân biệt hiện trạng không dependency với hướng có Zod runtime validation.

### Chi phí

Zod, datamodel-code-generator và Pydantic công bố MIT; không có phí API theo lượt của các công cụ này.
Chi phí nằm ở migration/bảo trì, build/CI và CPU/memory validation; chưa có tải/host để quy tiền.
Codegen không chạy ở từng request. ADR không cấp quyền cài đặt hoặc mua dịch vụ.

## References

- [Nghiên cứu hợp đồng/codegen](../99-notes/contracts-codegen-research.md).
- [Contracts hiện có](../../packages/contracts/README.md).
- [Zod JSON Schema](https://zod.dev/json-schema).
- [Generator JSON Schema](https://datamodel-code-generator.koxudaxi.dev/jsonschema/).
- [Generator output models](https://datamodel-code-generator.koxudaxi.dev/output-model-types/).
- [Pydantic fields](https://docs.pydantic.dev/latest/concepts/fields/).
- [Fastify validation](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/).
- [Zod license](https://github.com/colinhacks/zod/blob/main/LICENSE).
- [Generator license](https://github.com/datamodel-code-generator/datamodel-code-generator/blob/main/LICENSE).
- [Pydantic license](https://github.com/pydantic/pydantic/blob/main/LICENSE).

Nguồn/Context7 đối chiếu ngày 2026-11-17; chưa cài công cụ, sinh model hoặc chạy kiểm tra liên ngôn ngữ.

# Shared contracts TypeScript–Python: nguồn schema và sinh Pydantic

Tra cứu 2026-11-17. **Ghi chú nghiên cứu, không phải nguồn quyết định.**
Chủ sản phẩm đã chọn A tại [ADR-0014](../06-decisions/0014-zod-json-schema-and-pydantic-contracts.md).
Các đề xuất bên dưới giữ bối cảnh lúc nghiên cứu; ADR sở hữu lựa chọn hiện hành. Chưa triển khai.
Chỉ đọc nguồn chính thức và code hiện có; không cài dependency, sinh code hoặc gọi runtime/provider.

## Điểm xuất phát và ba phương án

[Constitution III](../../.specify/memory/constitution.md) yêu cầu domain models, **Zod schemas** và DTOs ở `packages/contracts`.
[Package hiện có](../../packages/contracts/package.json) chưa khai báo dependency/exporter; `src/` là interfaces/types/constants,
không phải runtime validators. Ví dụ [order DTOs](../../packages/contracts/src/orders/types.ts) có `quantity: number`,
`userEmail: string`: riêng kiểu đó không định nghĩa số lượng dương hoặc định dạng email.

| Hướng | Nguồn được sửa tay và luồng sinh | Đánh đổi — nhận định |
|---|---|---|
| **A. Zod 4 trước** | Zod trong contracts → `z.infer` cho TS; `z.toJSONSchema` native → datamodel-code-generator → Pydantic v2 | Phù hợp Constitution; thêm validation runtime TS, cần giới hạn schema ở phần chuyển được sang JSON. |
| **B. Interfaces TS trước** | Interfaces → ts-json-schema-generator → JSON Schema → cùng generator Python | Tận dụng hình dạng DTO hiện có; constraints cần annotation/schema bổ sung và validator TS riêng, dễ lệch nếu viết hai bản. |
| **C. JSON Schema/TypeBox 1.x trước** | TypeBox dựng JSON Schema + suy TS; cùng JSON Schema sinh Python | Hợp đồng trung lập JSON hơn; cần hòa giải/sửa nguyên tắc Zod trước khi thay nguồn chuẩn, không tự nhận được duyệt. |

Nguồn: [Zod export](https://zod.dev/json-schema), [TS generator](https://github.com/vega/ts-json-schema-generator),
[TypeBox 1.0 release](https://github.com/sinclairzx81/typebox/releases/tag/1.0.0), [TypeBox model](https://github.com/sinclairzx81/typebox#readme).
TypeBox có cả kiểu mở rộng cho JavaScript; chỉ subset tương thích JSON mới đem trao đổi Python.
TS generator đọc AST/JSDoc và có tùy chọn validation keywords; nó không suy ra business checks từ interface hoặc sinh validator TS.
Không hứa B giữ toàn bộ TS types/generics/custom logic; phải kiểm exporter trên chính contracts.

## Giới hạn cần thiết kế rõ trước implementation

- **Dialect:** Zod native export mặc định JSON Schema 2020-12, cũng có draft-07/OpenAPI 3.0.
  Generator Python công bố hỗ trợ draft 4–2020-12, `$ref`/`$defs`; phải ghi `$schema`, ID/reference ổn định và pin phiên bản.
  Hỗ trợ dialect không chứng minh mọi keyword có cùng hành vi khi sinh Python.
- **Không mất kiểm tra âm thầm:** Zod `bigint`, `date`, transform/custom không có biểu diễn JSON trực tiếp; export mặc định báo lỗi.
  Không dùng `unrepresentable:'any'` để làm build xanh vì có thể nới schema thành `{}`.
- **Input/output:** export mặc định mô tả output; default/coerce/pipe có thể làm input khác output. Phải chọn rõ request/response profile.
  Ngày giờ trên wire dùng chuỗi có định dạng; BigInt cần biểu diễn JSON và giới hạn độ chính xác được quyết định riêng.

Nguồn: [Zod JSON Schema](https://zod.dev/json-schema), [generator dialects](https://datamodel-code-generator.koxudaxi.dev/supported_formats/),
[generator refs/features](https://datamodel-code-generator.koxudaxi.dev/jsonschema/).

- **Missing ≠ null:** JSON Schema `required` và kiểu cho phép `null` là hai việc; Python `T | None` không tự cho phép bỏ field.
  Pydantic v2 không còn tự thêm default `None` cho `Optional`. Cần fixture đủ missing/null/value/default và kiểm model sinh thực tế.
- **Default:** JSON Schema `default` là annotation, không tự điền giá trị; Zod/Pydantic có hành vi điền/validate default riêng.
  Không suy từ schema giống nhau sang kết quả parse giống nhau; cần thống nhất serialization và trường thực sự được gửi.
- **Custom validation:** `.refine()`/async checks, effects/transform và code tra DB không tự được dịch sang Python.
  Dùng constraints khai báo được cho hợp đồng; Core giữ quyền/ghế/giá/thanh toán và các kiểm tra phụ thuộc trạng thái.
- **Bảo toàn strictness:** kiểm extra fields, coercion số/boolean, bounds, email/date formats, regex, enum/discriminated union và references.
  Có thể dùng `--field-constraints`/`--use-annotated` cho ràng buộc Python, nhưng phải xem output/warnings và fixture hợp lệ/lỗi.

Nguồn: [Pydantic fields](https://docs.pydantic.dev/latest/concepts/fields/), [JSON Schema default](https://json-schema.org/understanding-json-schema/reference/annotations),
[Zod refinements/defaults](https://zod.dev/api), [generator constraints](https://datamodel-code-generator.koxudaxi.dev/field-constraints/).

## Tích hợp, chi phí và hướng đề xuất

Generator hỗ trợ rõ `--output-model-type pydantic_v2.BaseModel`; đây là bước build/CI, không phải dependency cần chạy mỗi request.
Pydantic/Zod hoặc JSON Schema validator là thành phần runtime khi ứng dụng gọi validation; chưa đo overhead, không tuyên bố nhanh nhất.
Nguồn: [generator output targets](https://datamodel-code-generator.koxudaxi.dev/output-model-types/).
Nest/Fastify không tự đọc schema vì đặt trong contracts: vẫn phải nối pipe/validator/serializer và xử lý lỗi ở ranh giới HTTP/tools.
Fastify dùng Ajv v8 và fast-json-stringify, ví dụ chính thức dùng draft-07; phải xác minh profile/dialect đã chọn với tích hợp Nest.
[Fastify validation](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/), [Nest pipes](https://docs.nestjs.com/pipes).

Zod, TypeBox, ts-json-schema-generator, datamodel-code-generator và Pydantic đều công bố MIT; không có phí API theo request của các thư viện này.
Vẫn có công migration, CI/codegen, validation CPU và bảo trì phiên bản; codegen không tạo sẵn bằng chứng tương thích.
[Zod license](https://github.com/colinhacks/zod/blob/main/LICENSE), [TypeBox license](https://github.com/sinclairzx81/typebox#readme),
[TS generator license](https://github.com/vega/ts-json-schema-generator/blob/next/LICENSE), [Python generator license](https://github.com/datamodel-code-generator/datamodel-code-generator/blob/main/LICENSE), [Pydantic license](https://github.com/pydantic/pydantic/blob/main/LICENSE).

**Nghiêng A** vì giữ hướng Zod đã có thẩm quyền và cung cấp nguồn validation TS, không vì đã chứng minh hiệu năng tốt hơn C.
Nếu được chọn: schemas là nguồn sửa tay; TS types, JSON Schema và Pydantic là đầu ra dẫn xuất, CI kiểm sinh lại không lệch.
Trước triển khai phải hòa giải README hiện có, chọn JSON profile/version, và dùng cùng fixture TS/Python kiểm cả chấp nhận lẫn từ chối.
B/C vẫn là phương án đối chiếu; chưa sửa Constitution, contracts, dependency hoặc ADR và chưa chạy conformance/runtime.

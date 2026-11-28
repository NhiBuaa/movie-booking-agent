# Movie Booking Platform Data Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tạo bộ thiết kế dữ liệu bằng Markdown/Mermaid cho bảy database PostgreSQL theo service, các giao dịch trọng yếu và vòng đời các kho hỗ trợ đã chọn; không viết code hoặc migration.

**Architecture:** Giữ Cinema Core làm chủ giao dịch, mỗi service sở hữu một database PostgreSQL logic riêng. Tài liệu đi từ quyền sở hữu và mô hình logic tới bảng/cột/ràng buộc, rồi đối chiếu với trình tự giao dịch và phục hồi. Các bản sao, chỉ mục tìm kiếm, cache và checkpoint không thay dữ liệu có thẩm quyền.

**Tech Stack:** Markdown; Mermaid `flowchart`, `erDiagram`, `sequenceDiagram`; PostgreSQL; Redis/BullMQ; Outbox–Debezium/Kafka Connect–Kafka KRaft; Typesense; R2/Cloudflare Images; MMKV/SecureStore. Better Auth và LangGraph PostgreSQL checkpointer là đầu vào cần đối chiếu schema thư viện, không phải quyền khởi tạo chúng.

**Spec:** Yêu cầu của chủ sản phẩm trong hội thoại “Thiết kế tài liệu dữ liệu” ngày 2026-11-17; [mô hình sản phẩm](../../03-product/use-cases.md), [mô tả use case](../../03-product/use-case-descriptions.md), [kiến trúc bảy service](../004-service-decomposition/spec.md) và [quyết định đã duyệt](../004-service-decomposition/decisions.md). Người thực hiện phải đọc các nguồn này cùng kế hoạch.

## Global Constraints

Các trích dẫn dưới đây giữ nguyên từ nguồn hiện hành; phần diễn giải không mở rộng quyền thực hiện.

- “**Mỗi service một database PostgreSQL logic**, credential/quyền migration riêng. Không đọc/ghi, JOIN hoặc khóa ngoại xuyên service, kể cả qua FDW/dblink; dùng ID và hợp đồng. Reporting lưu bản sao.” — kiến trúc, mục 3.
- “Các module Core cùng dùng database Core và có thể tham gia transaction cục bộ qua interface.” — kiến trúc, mục 3. Không chia DB theo module.
- “Agent đề xuất; khách xác nhận, ứng dụng/BFF gửi lệnh dưới quyền khách. Chỉ Core có quyền quyết định kết quả giao dịch.” — kiến trúc, mục 3.
- “Xác nhận danh sách ghế mới bắt đầu giữ; nguyên tử cả danh sách, tối đa 6 ghế, Sweetbox cả cặp, một hold còn hiệu lực/tài khoản, TTL 300 giây.” — BR-04.
- “Không tự gia hạn TTL. Hết hạn không đồng nghĩa đã xác định thanh toán thất bại; tiếp tục đối soát khi kết quả chưa rõ.” — BR-05.
- “Một QR cho lượt đặt; quyền sử dụng và trạng thái soát được quản lý theo ghế.” — BR-07. Không đồng nhất đơn, vé theo ghế và QR.
- “Token/bí mật không vào prompt/checkpoint.” — mô tả use case, phần mở đầu.
- “Không lưu plaintext trong database, queue, log, trace hoặc DLQ.” — kiến trúc, mục Claim Check; áp dụng payload bảo mật do Notification xử lý, không cấm mọi dữ liệu văn bản của ứng dụng.
- “For documentation-only changes, validate the affected documents/diagrams; do not infer runtime behavior from them.” — [AGENTS](../../../AGENTS.md).
- Chỉ thiết kế tài liệu. Không thay source/contracts, schema thực thi, migration, seed, CI, dependency, cấu hình dịch vụ hoặc dữ liệu đang dùng; không chạy provider, DB, Docker, sandbox thanh toán hoặc diễn tập lỗi.
- Không thêm công nghệ, service thứ tám, JOIN/FK xuyên DB, credential dùng chung, distributed transaction hoặc bảo đảm tác dụng phụ bên ngoài “đúng một lần”. Hosting/provider/topology và mua tài nguyên vẫn ngoài phạm vi.
- Chỉ dùng Mermaid trong Markdown; không dùng `diagram-design`. Không tự cài trình render hoặc sửa cấu hình trình xem.
- Giữ đề xuất thiết kế ở trạng thái `draft` tới khi có phê duyệt tương ứng. Duyệt kế hoạch không đồng nghĩa duyệt mọi lựa chọn schema hoặc cho phép triển khai.

---

## 1. Trạng thái, quyền và nền đối chiếu

**Phiên bản kế hoạch:** v1, chờ chủ sản phẩm review. Yêu cầu mới nhất cho phép viết file kế hoạch; chưa phải phê duyệt thực hiện Task 1–13.

**Repository:** `C:/Developer/Projects/movie-booking-agent`.

**Nền main đã fetch khi viết kế hoạch:** `2a007797ac9ce542d9747aad0f44f3e430eec581` — merge CI nền, tiếp sau nền nghiệp vụ `ec5be2b8a72ad17b9e8223fd041d091ee6a311d8`. Không dùng bằng chứng CI của commit khác để kết luận bộ thiết kế đạt.

**Worktree của nhiệm vụ:** `C:/Users/NhiBuaa/.codex/worktrees/docs-data-design/movie-booking-agent`, do ứng dụng quản lý, detached HEAD tại nền trên khi tạo kế hoạch. Trước khi sửa tiếp phải xác minh lại đường dẫn/HEAD/trạng thái; không nhận worktree NFR hoặc CI làm nơi viết.

**Giới hạn xuất bản:** kế hoạch không cấp quyền commit/push, mở hoặc merge PR, triển khai hay sửa quyền. Chỉ chuẩn bị diff có thể review. Nếu sau này có quyền commit, kiểm chứng và đối chiếu đúng đích trước thao tác; tiến độ và kết quả review nằm ở Issue/PR hoặc bàn giao, không biến file này thành nhật ký.

Đây là kế hoạch thực hiện **tài liệu**, nên chu kỳ kiểm của từng task là soạn → đối chiếu quy tắc và tình huống → kiểm tài liệu/render → review. Không tạo test ứng dụng giả hoặc migration chỉ để áp mẫu TDD. Không chạy `npm install`/`npm ci` hoặc suite ứng dụng cho thay đổi thuần tài liệu này. Khi phạm vi chuyển sang code, phải lập và duyệt công việc riêng theo Spec Kit.

## 2. Đầu vào bắt buộc và cách xử lý thay đổi nguồn

| Nguồn | Vai trò và cách sử dụng |
|---|---|
| [PROJECT-OVERVIEW](../../../PROJECT-OVERVIEW.md), [CONTEXT](../../../CONTEXT.md), [hiến pháp](../../../.specify/memory/constitution.md) | Phạm vi đích, bất biến và giới hạn hiện trạng; không suy scaffold thành service đang chạy. |
| [Use cases](../../03-product/use-cases.md), [mô tả](../../03-product/use-case-descriptions.md), [GLOSSARY](../../../GLOSSARY.md) | Actor, BR-01–43, các quyết định Q đã xác nhận và nghĩa thuật ngữ. OPEN-01–10 giữ phụ thuộc đặc tả/kiểm chứng, không có nghĩa phải hỏi lại mọi chính sách. |
| [Domain context](../domain-context.md), [conversational booking](../conversational-booking.md) trên main | Quy tắc giao dịch và kênh chat; hòa giải với các nguồn sản phẩm mới hơn khi có mô tả cũ. |
| [Spec microservices](../004-service-decomposition/spec.md), [decisions](../004-service-decomposition/decisions.md) | Bảy owner, interface và phạm vi lỗi. Quyết định đã duyệt giữ hiệu lực; toàn bản tổng hợp vẫn `draft` chờ đọc lại. |
| [Danh mục ADR](../../06-decisions/README.md) | Công nghệ đã chọn và giới hạn quyết định. Ưu tiên ADR-0003–0008, 0010, 0013–0014, 0018–0020, 0023, 0027, 0029–0036 theo task. Không chọn ORM/framework cho năm service bổ trợ chỉ từ stack Core. |
| [Quy chuẩn mô hình](../../04-standards/use-case-modeling.md), [quy tắc vị trí feature](../README.md) | Cách phân biệt mục tiêu/hiện trạng/đề xuất, truy vết và một bản tài liệu chuẩn cho feature. |
| README trong `services/` và hợp đồng hiện hữu trong `packages/contracts/` | Đối chiếu có chọn lọc trách nhiệm và chênh lệch với mục tiêu; không sao chép enum/mô hình lưu trữ cũ thành thiết kế đã duyệt. Không sửa code. |

### NFR ngoài main

LEAD đã đối chiếu đầu vào trong hội thoại `01a1e8c6-81a2-72d1-b6b5-32eea921c16c`, lượt `01a1ea51-9459-7d51-8ebb-335dad87d8e0` ngày 2026-11-17. Đủ căn cứ lập kế hoạch, chưa đủ chốt toàn bộ schema vật lý; xác nhận dựa chủ yếu trên bản ghi tài liệu, không là tái xác minh toàn bộ lịch sử duyệt.

- Worktree nguồn: `C:/Users/NhiBuaa/.codex/worktrees/docs-nfr-requirements/movie-booking-agent`, base `2cd10657861db1b64e0b9f33e56769d59e9916f0`.
- File nguồn: `docs/05-specs/domain-context.md`; **chỉ phần 9** là NFR bổ sung. Phần 1–8 lấy theo main vì nguồn NFR ở nền cũ.
- Bản chụp LEAD đã đọc: `C:/Users/NhiBuaa/AppData/Local/Temp/movie-booking-nfr-input-review-20261117-6a19fcba.md`, SHA256 `532EE52807D0EBBF045F5A0F1F6B5FB8A46C9DF17BED807D3815A6822E358412`.
- File sống đã khác bản chụp khi viết kế hoạch: SHA256 `AD5C792F69E61EA19E5CAE941930CFF709866AC9012562822850BFE8403C4A5B`. Không coi bản mới nhất được duyệt toàn bộ. Task 1 phải đối chiếu delta/nguồn duyệt và hỏi LEAD nếu có thay đổi liên quan; không sao chép toàn file cũ vào worktree thiết kế.
- Các đường dẫn ngoài repository chỉ là lối truy xuất cục bộ. Nếu mất bản chụp hoặc đổi máy, lấy lại phiên bản qua LEAD/nguồn duyệt; không gán hash cũ cho nội dung mới. Không đưa bản sao NFR vào repo này như nguồn cạnh tranh.

| Nội dung NFR ảnh hưởng thiết kế | Phạm vi đã được tài liệu ghi nhận là duyệt | Không được suy thêm |
|---|---|---|
| NFR-COR-01, mục 9.15 | Bảo vệ tranh chấp ghế, thao tác/callback lặp; tải hỗn hợp 20 phiên, 16 duyệt/4 đặt, tăng 60 giây, ổn định 10 phút, nghỉ 2 giây; ba đợt độc lập. p95 đọc ≤ 1 giây, tạo hold/lập đơn ≤ 2 giây, lỗi hệ thống < 1%. | Không là dự báo khách thật, benchmark hiện tại hoặc quyền chạy tải. Quy mô dữ liệu chi tiết còn cần chốt. |
| NFR-DUR-01, mục 9.16 | Restart ứng dụng không mất trạng thái đã lưu, không reset TTL/tạo tác dụng phụ trùng; khôi phục hành trình kiểm chứng ≤ 5 phút khi DB/máy/phụ thuộc còn nguyên. | Không phải HA hoặc phục hồi mất DB. |
| NFR-DR-01, mục 9.7 | Mất DB nghiệp vụ, phục hồi backup sang DB sạch; RTO gồm validation ≤ 60 phút, RPO dữ liệu thử ≤ 24 giờ. | Không tự chọn lịch/retention backup, PITR, provider hoặc chấp nhận mất trạng thái khi chỉ restart. |
| NFR-PRIV-01, mục 9.6 | Chẩn đoán chỉ thông tin kỹ thuật; log/trace chi tiết tối đa 7 ngày; quyền xem/xuất chỉ chủ dự án ở mốc đầu. | Không áp 7 ngày cho nghiệp vụ, chat/checkpoint, audit, backup hoặc bằng chứng mẫu. |
| NFR-SEC-01, mục 9.14 | Đúng chủ dữ liệu/rạp/vai trò; MFA cho quản trị chuỗi và quản lý rạp. | Chưa chọn yếu tố/plugin MFA, token/session/thu hồi; không tự thêm quyền. |
| NFR-RES-01, mục 9.11–9.11.2 | Một lượt AI đang xử lý/tài khoản, không đặt trần đồng thời toàn hệ thống phía ứng dụng. Deadline 60 giây không reset qua reconnect/resume/replica/fallback; không retry cùng bước trên provider vừa lỗi, tối đa một lần chuyển Cloudflare → Groq/lượt. | Không chốt số vòng/calls hoặc bảo đảm provider từ xa đã dừng chỉ vì gửi tín hiệu hủy. Phải bảo vệ trước Agent cũ và kết quả muộn trước khi giải phóng quyền chạy; Task 1 kiểm lại các thay đổi NFR sau bản chụp. |

Main còn OPEN-12 về fallback AI, trong khi NFR ghi nhận hòa giải và chính sách chuyển nguồn mới. Giữ cả nguồn và quan hệ tiếp nối để LEAD/owner đồng bộ; không hỏi lại như chưa có quyết định, không tự sửa BR-34/OPEN-12 trong nhiệm vụ thiết kế DB. Nguyên tắc vòng lặp Agent đã có ghi nhận mới, nhưng số vòng/calls vẫn cần căn cứ/phê duyệt; không đưa 4 vòng/6 calls vào schema như quy tắc đã chọn.

## 3. File sẽ tạo/sửa và hợp đồng đầu ra

Chỉ `plan.md` và liên kết kế hoạch trong mục lục được tạo ở lượt lập kế hoạch. Các file còn lại là sản phẩm của bước thực hiện sau phê duyệt; các đường dẫn bên dưới không phải liên kết tới file đã tồn tại.

```text
docs/05-specs/005-data-design/
  plan.md                         Kế hoạch này; không giữ nhật ký tiến độ
  spec.md                         Tổng quan owner/luồng dữ liệu, quy ước, truy vết và phụ thuộc
  databases/
    cinema-core.md                ERD và từ điển DB Core, chia hình theo nhóm nghiệp vụ
    identity.md                   DB danh tính/quyền và phần schema do thư viện quản lý
    catalog.md                    DB nội dung phim/phiên bản/media metadata
    agent.md                      DB hội thoại/đề xuất và checkpoint thư viện
    community.md                  DB đánh giá/yêu thích và projection căn cứ
    notification.md               DB hộp thông báo/chuyển phát
    reporting.md                  DB mô hình đọc/tổng hợp và tiến độ tái dựng
  transactions.md                 Sequence và bảng transaction/phục hồi
  supporting-stores.md            Cấu trúc/vòng đời các kho hỗ trợ đã chọn
```

Chỉ sửa liên kết điều hướng ở `docs/05-specs/README.md` và, khi bộ thiết kế tồn tại, `docs/02-architecture/README.md`. Chỉ sửa `GLOSSARY.md` nếu có thuật ngữ thực sự được giải quyết và phạm vi cập nhật đã rõ; không nhét schema vào glossary. Quyết định nghiệp vụ/kiến trúc mới cần phê duyệt và cập nhật đúng nguồn sở hữu, không ghi thành quy tắc mới riêng trong bộ DB.

### Các phần có tên cố định

`spec.md` phải có: **Phạm vi và nguồn**; **Quyền sở hữu dữ liệu**; **Trao đổi dữ liệu**; **Quy ước thiết kế**; **Truy vết yêu cầu**; **Phụ thuộc cần quyết định**. Truy vết dùng cột `UC/BR/NFR`, `Owner`, `Khái niệm/bảng`, `Ràng buộc hoặc transaction`, `Tài liệu đích`, `Nguồn/trạng thái`.

Mỗi file DB phải có đủ tám phần sau; dùng chính tên này để reviewer đối chiếu:

1. **Trách nhiệm và nguồn** — owner, dữ liệu gốc/dẫn xuất, phiên bản nguồn, phạm vi được duyệt/đề xuất.
2. **ERD logic** — thực thể, ý nghĩa quan hệ, lực lượng và tùy chọn; chưa mặc định mỗi danh từ là một bảng.
3. **ERD chi tiết** — bảng và khóa tương ứng; chia hình khi hình toàn DB khó đọc.
4. **Từ điển dữ liệu** — mỗi cột có tên, kiểu, nullability, default hoặc lý do không default, ý nghĩa/đơn vị và nguồn quy tắc; phân biệt timestamp nghiệp vụ với thời điểm xử lý.
5. **Khóa, chỉ mục và ràng buộc** — PK, FK nội DB, UNIQUE, CHECK và hành vi xóa/cập nhật; mỗi index có truy vấn/tra cứu phục vụ và chi phí ghi. Quy tắc liên bảng không được gắn nhãn CHECK nếu cần transaction.
6. **Giao dịch và interface** — command/query/event liên quan, điều kiện trước, kết quả/lỗi, điểm commit, mã thao tác, ràng buộc cạnh tranh và owner ghi. Tên contract mới là đề xuất, không thay source trong `packages/contracts`.
7. **Vòng đời và bảo vệ dữ liệu** — dữ liệu nhạy cảm, quyền, xóa/ẩn danh, dấu chống lặp, backup/rebuild; thời hạn chưa có quyết định được chỉ rõ là phụ thuộc, không tự gán số.
8. **Kịch bản đối chiếu và phụ thuộc** — trường hợp thành công, cạnh tranh/lặp/lỗi, trạng thái mong đợi, nguồn và quyết định còn thiếu.

`transactions.md` dùng mã TX-01–TX-07 bên dưới. Mỗi luồng có: actor/module tham gia; điều kiện; Mermaid; bảng lần ghi/điểm commit; lỗi và hành động phục hồi; ID/phiên bản/thẩm quyền kết quả; nguồn và điều chưa chốt.

`supporting-stores.md` dùng mã STORE-01–STORE-06. Mỗi mục có: owner; nguồn có thẩm quyền; cấu trúc dữ liệu; ID/version; đọc/ghi; TTL/retention và nguồn quyết định; retry/dedupe; mất dữ liệu/rebuild; quyền/dữ liệu nhạy cảm/xóa; ảnh hưởng tới nghiệp vụ khi lỗi. Các bảng do thư viện quản lý phải dẫn đúng tài liệu phiên bản, không tự chốt nội bộ của thư viện.

### Phụ thuộc cần giải quyết, không phải chính sách mới

| Nhóm | Nguồn sở hữu và ảnh hưởng | Cách tiến hành |
|---|---|---|
| Lưu/xóa, căn cứ giữ, bản sao/provider | OPEN-10, Q170; ảnh hưởng FK, lịch sử, ẩn danh, checkpoint và backup. | Thiết kế phân loại/quan hệ không phụ thuộc thời hạn trước; hỏi chủ sản phẩm trước khi chốt thời hạn hoặc hành vi xóa còn thiếu. Không giữ toàn hồ sơ vì một khoản hoàn. |
| Cá nhân hóa | BR-40–43, OPEN-11, kiến trúc mục 2: owner profile/tín hiệu, phiên khách, reset/replay và retention. | Không tự gán cho Agent/Community/Core chỉ vì Search nằm Core. Phần phụ thuộc owner giữ đề xuất riêng và hỏi khi cần chốt; không tạo DB thứ tám hoặc tracking code. |
| Auth/MFA/bằng chứng quyền | ADR-0008, quyết định quyền 60/90/15 phút, NFR-SEC-01. | Tra phiên bản Better Auth; đề xuất schema phần mở rộng và quyền, nhưng hỏi loại yếu tố hoặc thay đổi trải nghiệm/chính sách. Không suy MFA từ xác minh email. |
| Căn cứ đánh giá và snapshot phim | Quyết định Catalog HTTP, Core→Community; version/coverage, cửa sổ độ mới, ngừng phiên bản. | Thiết kế trường thể hiện căn cứ/phiên bản/coverage; không đặt giá trị freshness hoặc cho dữ liệu cũ ghi đè mới. Hỏi trước thay đổi đánh đổi nhất quán đã duyệt. |
| Thanh toán/hoàn/thu thêm | OPEN-03, ADR-0027; khả năng merchant và bằng chứng provider. | Giữ nghĩa vụ hoàn, attempt và trạng thái chưa rõ; tra tài liệu kỹ thuật khi cần. Không tự chọn khả năng cổng, làm tròn số, đổi phương thức hoàn hoặc gọi sandbox. |
| Chi tiết kỹ thuật chưa chọn | ID/TTL mã thao tác, isolation/khóa, revision, topic/partition, retry/retention. | Được đề xuất có căn cứ trong tài liệu và so sánh đánh đổi; chưa coi là đã duyệt. Chỉ hỏi riêng khi tác động sản phẩm/kiến trúc/an toàn; lựa chọn kỹ thuật thông thường nằm trong review bộ thiết kế. |
| Phục hồi liên service | Outbox/inbox, checkpoint, dấu chống lặp, projection và NFR-DR/DUR. | Mô tả mốc dữ liệu/phạm vi phục hồi và hàng rào chống phát lại tác dụng phụ; không chọn topology hoặc chạy restore. |

## 4. Điều phối và cổng phụ thuộc

- Task 1–2 do người điều phối giữ để thống nhất từ vựng, owner và phần dữ liệu còn thiếu.
- Sau Task 2, Task 3 (Catalog), Task 4 (Identity) và phần độc lập của Task 5 (Core) có thể đọc/soạn song song theo số slot thực tế. Mỗi file đúng một người ghi.
- Task 5–6 cùng một người giữ `cinema-core.md` và thực hiện nối tiếp; không chia hai agent cùng sửa file Core. Các task downstream chỉ chốt phần tham chiếu sau khi interface/ID/phiên bản của Core liên quan được đối chiếu.
- Task 7–10 có thể chia theo file sau cổng đầu vào tương ứng. Không đoán contract thiếu để làm song song. Task 11–12 dùng đầu vào các DB; người điều phối tích hợp `spec.md` và mục lục.
- Subagent không sửa nguồn nghiệp vụ/NFR/ADR, worktree khác, `spec.md` chung hoặc file ngoài phạm vi được giao. Kết quả trả gồm file, nguồn, quyết định còn thiếu và bằng chứng kiểm; báo “xong” không thay kiểm diff.
- Người review độc lập ở Task 13 không là tác giả phần đang review. Review không cấp quyền merge hoặc duyệt sản phẩm.
- Chỉ dừng phần phụ thuộc quyết định thiếu; tiếp tục phần độc lập đã được duyệt. Scope, kiến trúc, tiêu chí hoàn thành hoặc chính sách thay đổi phải trình phần thay đổi; không nhân cổng duyệt cho sửa lỗi trình bày/liên kết trong phạm vi.

## 5. Các task thực hiện sau khi kế hoạch được duyệt

Các đường dẫn file trong task tính từ repository root. Mỗi checkbox là một hành động hoặc một lượt đối chiếu nhỏ; nếu một mục vượt một lượt làm việc ngắn, tách theo nhóm dữ liệu đã nêu, giữ cùng owner và tiêu chí.

### Task 1: Khóa đầu vào và kiểm kê yêu cầu

**Files:** Create `docs/05-specs/005-data-design/spec.md` với phần Phạm vi và nguồn, Truy vết yêu cầu, Phụ thuộc cần quyết định. Không sửa `plan.md` thành nhật ký.

**Interfaces:** Consumes các nguồn mục 2 và phê duyệt đúng phiên bản kế hoạch; produces danh mục UC/BR/NFR, trạng thái nguồn và các phụ thuộc được Task 2–13 sử dụng.

- [ ] Đọc phê duyệt kế hoạch; ghi version/hash kế hoạch và tham chiếu hội thoại phê duyệt trong bàn giao/Issue được phép. Nếu chưa duyệt, chỉ lập/sửa kế hoạch.
- [ ] Kiểm tra đúng worktree/HEAD/trạng thái; fetch và so sánh main mới với nền kế hoạch bằng lệnh ở mục 6. Giữ mọi thay đổi của phiên khác.
- [ ] Đối chiếu phần 9 NFR hiện tại với bản chụp LEAD; chỉ nhập các yêu cầu có nguồn/trạng thái rõ. Khi NFR drift ảnh hưởng DB, trao đổi LEAD trước phần phụ thuộc.
- [ ] Lập danh mục đầy đủ từ use cases/mô tả, BR-01–43 và NFR liên quan. Mỗi yêu cầu có ít nhất một owner/tài liệu đích hoặc lý do không làm phát sinh dữ liệu.
- [ ] Phân biệt yêu cầu đã chọn với phụ thuộc còn lại; chuyển câu hỏi có ảnh hưởng sản phẩm/kiến trúc tới chủ sản phẩm theo vòng ngắn, dùng `grill-with-docs` khi cần.
- [ ] Đối chiếu danh mục với nguồn một lần nữa; không thiếu nhóm đổi ghế, sự cố combo, sửa sai hội viên, kiểm duyệt/xét lại, xóa tài khoản/chat hoặc cá nhân hóa.

**Kiểm chứng/đạt:** mỗi UC/BR/NFR có dòng truy vết, không dùng OPEN như lý do xóa quy tắc đã chốt; source NFR có đường dẫn/hash/phạm vi; mọi thiếu quyết định có ảnh hưởng và phần bị chặn cụ thể.

### Task 2: Tổng quan owner và quy ước dữ liệu

**Files:** Modify `docs/05-specs/005-data-design/spec.md` — Quyền sở hữu dữ liệu, Trao đổi dữ liệu, Quy ước thiết kế.

**Interfaces:** Consumes danh mục Task 1; produces bản đồ bảy owner, danh mục tham chiếu xuyên service và quy ước chung cho các file DB, TX và STORE.

- [ ] Dùng `domain-modeling` phân biệt đơn, quyền vé theo ghế, QR, hold, quyết định hủy, nghĩa vụ hoàn và giao dịch hoàn theo glossary.
- [ ] Viết bảng bảy DB: Core, Identity, Catalog, Agent, Notification, Community, Reporting; chỉ rõ dữ liệu gốc, bản sao và interface trao đổi. Tách ownership profile/tín hiệu chưa chốt.
- [ ] Vẽ `flowchart` tổng quan bảy service/DB và đường HTTP, outbox/CDC/Kafka, chỉ mục/cache; mỗi mũi tên có ý nghĩa và owner phát/nhận. Không dùng ER relationship để mô tả FK xuyên DB.
- [ ] Định nghĩa quy ước ID tham chiếu ngoài DB, tiền VND chính xác và phân bổ lưu lúc mua, timestamp UTC/múi giờ ngày nghiệp vụ Việt Nam, phiên bản/snapshot, nullability và lịch sử. Kiểu kỹ thuật cụ thể vẫn là đề xuất có lý do.
- [ ] Dùng `codebase-design` rà module, interface và seam: bên gọi biết điều kiện/kết quả/lỗi nào, owner chịu trách nhiệm transaction nào; không thêm adapter/lớp dùng chung không có nhu cầu.
- [ ] Đối chiếu bản đồ với ADR-0003/0007/0014/0035 và decisions; render hình tổng quan theo mục 6.

**Kiểm chứng/đạt:** đúng bảy DB logic; không bảng nghiệp vụ có hai owner; không JOIN/FK xuyên DB; có phân biệt thư viện, hạ tầng và service nghiệp vụ; nguồn chưa chốt được gắn rõ.

### Task 3: DB Catalog

**Files:** Create `docs/05-specs/005-data-design/databases/catalog.md`.

**Interfaces:** Consumes Task 2, M-01, ADR-0019 và quyết định HTTP snapshot Catalog–Core; produces mô hình nội dung/phiên bản/media và nội dung snapshot/version được Core tham chiếu.

- [ ] Đọc M-01, mô tả D-01 và quyết định snapshot HTTP; liệt kê nội dung phim, alias, thể loại, thời lượng/phân loại, phiên bản công bố và tham chiếu media/trailer theo yêu cầu thực tế.
- [ ] Vẽ ERD logic; phân biệt nội dung biên tập, phiên bản bất biến và trạng thái được phép sử dụng. Không để cập nhật Catalog âm thầm sửa snapshot của suất Core.
- [ ] Viết ERD chi tiết và từ điển từng bảng/cột của các thực thể đã xác định; chọn khóa/chỉ mục theo đường lấy phim/phiên bản và biên tập, FK chỉ trong Catalog.
- [ ] Ghi metadata R2/Images, phiên bản/liên kết và xóa ảnh còn được tham chiếu; trailer là URL/embed, không thêm kho video. Ghi rõ giao thức ngừng/đính chính phiên bản còn cần quyết định.
- [ ] Kiểm ba tình huống: Catalog lỗi khi lập suất mới; nội dung thay đổi sau khi Core lưu snapshot; phiên bản bị ngừng giữa HTTP check và Core commit.
- [ ] Đối chiếu đủ tám phần DB; render các hình và chạy kiểm tài liệu theo mục 6.

**Kiểm chứng/đạt:** Core có thể hoạt động trên snapshot đã lưu, không đọc SQL Catalog; không hứa nguyên tử xuyên service; các trường snapshot có nguồn/phiên bản và không chứa trạng thái ghế/tiền.

### Task 4: DB Identity & Access

**Files:** Create `docs/05-specs/005-data-design/databases/identity.md`.

**Interfaces:** Consumes Task 2, A-01–A-05/A-07–A-08, M-05/M-06, ADR-0008, NFR-SEC-01 và quyết định quyền vận hành; produces mô hình tài khoản/quyền/phạm vi, bằng chứng phiên/quyền và tham chiếu email bảo mật cho Task 9/12.

- [ ] Đọc use cases tài khoản/cấp quyền/xóa và quyết định soát tiếp 60 phút, bằng chứng quyền 90 phút, làm mới chậm nhất 15 phút; phân biệt thu hồi đã nhận và cửa sổ cũ khi mất liên lạc.
- [ ] Tra Context7/tài liệu chính thức Better Auth cho schema gốc và extension đang cần; ghi phiên bản nguồn. Không thêm plugin OAuth/Organization/MFA như lựa chọn đã duyệt.
- [ ] Vẽ logic tài khoản, email/xác minh/đổi email/khôi phục, session, vai trò/phạm vi rạp, thu hồi và yêu cầu đóng/xóa. Phân biệt bảng thư viện với dữ liệu ứng dụng mở rộng.
- [ ] Viết ERD chi tiết/từ điển, uniqueness email và ràng buộc phân công đúng vai trò/rạp; mô tả chứng cứ MFA cần giữ mà chưa tự chọn yếu tố. Không ánh xạ quyền từ ba enum hiện có bằng suy đoán.
- [ ] Mô tả dữ liệu xác minh, payload email mã hóa và ý định gửi/outbox nguyên tử; token/khóa không được đưa vào broker thường hoặc Notification plaintext. Bảo toàn tài khoản cũ khi đổi email chưa hoàn tất.
- [ ] Kiểm kịch bản mất Identity khi phiên nhân viên sẵn sàng, thu hồi đã nhận, quyền sai rạp, MFA chưa xong và chờ đóng tài khoản còn đơn/hoàn. Render và kiểm đủ tám phần.

**Kiểm chứng/đạt:** không yêu cầu gọi Identity mỗi lượt soát/giao; không cascade xóa quyền giao dịch ở Core; có phân biệt schema Better Auth đã xác minh với đề xuất mở rộng và phần cần quyết định.

### Task 5: DB Core — lịch, ghế, hold, đơn và quyền vé

**Files:** Create `docs/05-specs/005-data-design/databases/cinema-core.md`; cùng owner tiếp tục Task 6.

**Interfaces:** Consumes Task 2, snapshot/version Task 3, tham chiếu danh tính Task 4, B-01/B-02/B-07–B-09, O-01–O-06, M-03/M-04 và ADR-0004; produces mô hình quyền ghế/hold/đơn/vé để Task 6–12 dùng.

- [ ] Phân nhóm ERD logic thành lịch/phòng/sơ đồ, quyền ghế/hold, đơn/quyền vé/soát và đổi ghế; ghi cardinality và ý nghĩa trước bảng chi tiết.
- [ ] Thiết kế snapshot sơ đồ/phim/giá theo suất và các mốc dừng bán, sẵn sàng, tạm dừng, kết thúc thực tế; phân biệt giờ niêm yết, giờ dự kiến và ghi nhận vận hành.
- [ ] Đề xuất cột/khóa/ràng buộc chống hai quyền giữ/bán xung đột cho một ghế/suất, một hold hiệu lực/tài khoản, hold cả danh sách và Sweetbox; mô tả hết hạn theo thời gian gốc khi worker chậm.
- [ ] Mô tả cách PostgreSQL bảo vệ đồng thời đường Redis và fallback PostgreSQL; không dùng TTL Redis làm bằng chứng hold, không giữ khóa qua thời gian khách thanh toán. So sánh khóa/isolation theo đúng bất biến, ghi là đề xuất.
- [ ] Thiết kế đơn, quyền vé từng ghế, QR chung, lịch sử soát và thay vé; giữ gốc đếm một lần đổi thành công xuyên vé thay. Đổi ghế lỗi giữ vé cũ và lượt đổi, không tự chọn TTL hold đích mới.
- [ ] Lập bảng invariant → bảng/cột → UNIQUE/FK/CHECK hoặc transaction; nêu rõ các kiểm liên bảng/cạnh tranh không thể được bảo vệ chỉ bằng mô tả cột.
- [ ] Kiểm hai khách tranh một ghế, hai danh sách giao nhau, Sweetbox một nửa, callback sát hết hạn, hai cửa cùng soát, đổi ghế mất phản hồi và soát cạnh tranh duyệt hủy. Render các ERD nhóm.

**Kiểm chứng/đạt:** không hold một phần; không reset TTL; không dùng QR như một trạng thái cả đơn; điều kiện sở hữu/quyền/rạp được kiểm ở owner; phần schema chưa chốt không được trình bày như đã triển khai.

### Task 6: DB Core — tiền, hủy/hoàn, combo, ưu đãi và hội viên

**Files:** Modify `docs/05-specs/005-data-design/databases/cinema-core.md`, cùng owner Task 5.

**Interfaces:** Consumes mô hình Task 5, B-03–B-06, R-01–R-08, O-04/O-07, L-01/L-02/L-09/L-10, M-02/M-08–M-10, BR-20–29/BR-35 và ADR-0027; produces phần tài chính/quyền lợi cùng kết quả thao tác/outbox của Core.

- [ ] Thiết kế snapshot dòng vé/combo, ưu đãi và phân bổ đến đồng; lưu giá thực trả để hủy một phần không tính lại phần còn lại. Đơn 0đ không tạo payment giả.
- [ ] Phân biệt ý định/attempt thu, bằng chứng thanh toán đã xác minh, thu thừa/thu muộn, đối soát và phát hành vé; định danh provider/operation phục vụ chống lặp, không giả định mọi callback thuộc attempt đang hoạt động.
- [ ] Phân biệt yêu cầu hủy, xét duyệt, vô hiệu quyền, nghĩa vụ hoàn và refund attempt/kết quả; chống hoàn vượt nghĩa vụ và bảo toàn khoản nhỏ chưa gửi được. Không biến timeout thành thất bại hoặc nhân bản refund bằng mã mới.
- [ ] Thiết kế hủy suất có hiệu lực cấp suất và tiến độ xử lý từng đơn bền vững; kiểm quyền bị chặn ngay cả khi từng đơn chưa cập nhật xong. Giữ lịch sử soát và đường thu muộn/hoàn.
- [ ] Thiết kế combo theo đơn/ca có thể qua 0 giờ, giao toàn bộ một lần; hồ sơ sửa sai/giao bù/thay thế có chấp thuận và lịch sử. Thu thêm phải xác minh trước giao; nghĩa vụ hoàn chênh không đồng nghĩa tiền đã về.
- [ ] Thiết kế voucher/lượt dùng/cấp bù và điều kiện snapshot; bảo vệ cấp/khôi phục đúng một lần, giữ loại/mức/trần/hạn đã chốt, không tự trả cả điểm và voucher.
- [ ] Thiết kế lô điểm/hạn, giao dịch dùng điểm, chi tiêu xét hạng/hạng và sửa sai; điểm có thể âm theo chính sách, không phải số tiền. Soát cộng quyền lợi đúng một lần, đổi điểm và cấp voucher cùng transaction.
- [ ] Bổ sung bản ghi thao tác, kết quả, outbox và căn cứ eligibility tài khoản–phim. Rà nhóm nguyên tử đã duyệt: soát + điểm/chi tiêu/hạng; đổi điểm + voucher; duyệt hủy + quyền/giải phóng/nghĩa vụ hoàn.
- [ ] Kiểm phân bổ tổng tiền, hủy một phần, đơn 0đ, thu/hoàn lặp/khác attempt/đến muộn, giao combo cạnh tranh, sửa điểm/voucher và restart trước/sau commit; kiểm từ điển/chỉ mục toàn file Core.

**Kiểm chứng/đạt:** phân biệt quyền và dòng tiền; thu/hoàn ngoài transaction DB; các nhóm nguyên tử không bị tách sang service khác; có thiết kế bền để phục hồi công việc thay vì chỉ queue; không tuyên bố cổng thực hỗ trợ khi chưa xác minh.

### Task 7: DB Agent

**Files:** Create `docs/05-specs/005-data-design/databases/agent.md`.

**Interfaces:** Consumes Task 2, định danh/kết quả Core Task 5–6, C-01/A-06, BR-17/BR-34/BR-37, ADR-0013 và NFR-RES-01 mục 9.11–9.11.2 đã đối chiếu ở Task 1; produces mô hình hội thoại/đề xuất/checkpoint, vòng đời lượt xử lý và cách phục hồi qua tra cứu Core.

- [ ] Tra Context7/tài liệu chính thức checkpointer PostgreSQL đã chọn; xác định bảng do thư viện quản lý, khóa thread/checkpoint/namespace và phiên bản nguồn. Không tự tạo schema thay saver.
- [ ] Vẽ logic cuộc chat/tin nhắn/quyền chủ sở hữu, run/lượt xử lý, đề xuất gắn nội dung/phiên bản và tham chiếu kết quả Core; phân biệt state ứng dụng với checkpoint thư viện.
- [ ] Viết chi tiết cột/khóa/index cho dữ liệu ứng dụng và phần tích hợp thư viện đã có căn cứ; mô tả thread/run owner khi đọc/resume và bảo vệ một lượt đang xử lý/tài khoản xuyên nhiều tab/cuộc chat/replica, không đặt trần đồng thời toàn hệ thống.
- [ ] Đề xuất dữ liệu bền và cơ chế kiểm phiên bản quyền xử lý của run: chủ sở hữu/tiến trình được phép tiếp tục, mốc bắt đầu/deadline gốc, trạng thái hoàn tất/hết hạn/hủy và bước/provider/lần chuyển nguồn đã dùng. Chọn biểu diễn thời gian không cấp lại 60 giây khi restart/resume, không giả định đồng hồ đơn điệu dùng chung giữa các replica. Tên/kiểu/cơ chế là đề xuất thiết kế, không là schema đã duyệt hoặc cách chốt số vòng/calls.
- [ ] Mô tả kết thúc lượt, tra cứu lại kết quả và giải phóng quyền chạy khi tiến trình cũ không còn được phép điều phối; kết quả muộn không khởi động tool hay ghi thành công. Giữ ngân sách fallback cũ qua resume: không retry cùng bước/provider, tối đa một chuyển Cloudflare → Groq; hết hạn AI không tự hủy/đổi trạng thái giao dịch Core.
- [ ] Mô tả dữ liệu tối thiểu, loại token/credential/QR khỏi prompt/checkpoint và chẩn đoán; xóa một/toàn bộ chat không xóa đơn/vé hoặc tự áp retention 7 ngày.
- [ ] Kiểm resume node sau Core commit mất phản hồi: tra operation cũ, không gửi lại ghi từ checkpoint; kiểm đề xuất đã đổi phiên bản và xóa chat còn bản sao/checkpoint. Kiểm thêm reconnect, restart/chuyển replica, tiến trình cũ sống lại, kết quả sát/sau deadline và fallback trước/sau gián đoạn: không tạo lượt song song, deadline mới hoặc lần chuyển nguồn mới.
- [ ] Render và kiểm tám phần, chỉ rõ ownership cá nhân hóa còn mở và số vòng/calls chưa chốt; không nhập toàn bộ chat thành hồ sơ sở thích.

**Kiểm chứng/đạt:** không transaction phân tán checkpoint–Core, không đặt credential giao dịch trong Agent, không tự thiết kế lại bảng thư viện hoặc coi replay graph là quyền replay giao dịch. Có mô hình trạng thái/quyền xử lý và căn cứ thời gian để giữ giới hạn tài khoản, deadline và fallback qua gián đoạn; số vòng/calls còn mở không bị biến thành mặc định.

### Task 8: DB Community

**Files:** Create `docs/05-specs/005-data-design/databases/community.md`.

**Interfaces:** Consumes Task 2, căn cứ eligibility Core Task 6, L-03–L-08, BR-16/BR-32 và quyết định projection/HTTP fallback; produces mô hình yêu thích/đánh giá/kiểm duyệt/xét lại và projection có phiên bản.

- [ ] Vẽ thực thể đánh giá, phiên bản nội dung, nhãn cốt truyện, ẩn/xóa, quyết định kiểm duyệt, yêu cầu xét lại và phim yêu thích. Không gộp che cốt truyện với ẩn vi phạm.
- [ ] Thiết kế uniqueness một bài/tài khoản/phim và ràng buộc hồ sơ xét lại theo bài/phiên bản/quyết định; người xét khác người ẩn, thêm chứng cứ không reset hạn.
- [ ] Thiết kế projection căn cứ với phiên bản, thời điểm nguồn/coverage và dấu nhận; phân biệt đủ điều kiện/không đủ điều kiện/chưa rõ. HTTP fallback cùng quy tắc phiên bản, không ghi đè mới bằng cũ.
- [ ] Mô tả inbox/update projection trong transaction Community, backfill/rebuild có mốc không hở; chưa chốt freshness thì không tự đặt số hoặc suy từ Kafka lag.
- [ ] Viết bảng/cột/khóa/chỉ mục theo đọc công khai, bài của mình và hàng chờ xét lại; tính điểm tổng hợp chỉ từ bài công khai/chưa xóa, không có bài thì chưa có dữ liệu.
- [ ] Kiểm Core lỗi với căn cứ dương tính còn hợp lệ, miss/quá cũ, thu hồi đã nhận, nhiều vé làm căn cứ và hai người xét cùng hồ sơ. Render và kiểm tám phần.

**Kiểm chứng/đạt:** Community không suy quyền đánh giá trực tiếp từ mọi event scan/refund; không tự xóa bài đã đăng khi eligibility thay đổi; owner nội dung không bị chuyển sang Search.

### Task 9: DB Notification

**Files:** Create `docs/05-specs/005-data-design/databases/notification.md`.

**Interfaces:** Consumes Task 2, Claim Check từ Identity/Core Task 4/6, L-06/N-01, BR-33, ADR-0018 và quyết định email bảo mật; produces mô hình hộp thông báo, ý định chuyển phát/attempt và tham chiếu payload.

- [ ] Phân biệt thông báo trong hộp thư, mẫu/phiên bản, ý định email, lần thử, kết quả provider và yêu cầu gửi lại; quyền theo người nhận/phạm vi, không tự thêm SMS/push.
- [ ] Viết ERD/từ điển/khóa/chỉ mục cho đọc hộp thông báo và lấy công việc đến hạn; mô tả inbox và cập nhật cùng transaction, ID sự kiện và mã gửi ổn định.
- [ ] Mô tả nhận Claim Check qua luồng riêng, gọi owner có xác thực để lấy payload còn hạn; tham chiếu không phải credential và Notification không phát hành/xác minh OTP.
- [ ] Ghi cách chuyển phát cần thấy plaintext tạm thời nhưng không lưu plaintext bí mật vào DB/queue/log/trace/DLQ; retry cùng mã/hạn, không lấy payload là tiêu thụ mã.
- [ ] Mô tả timeout sau provider nhận, có thể email trùng; retry giới hạn, gửi lại kiểm quyền/chống spam và trạng thái hiện hành; không hứa exactly-once hoặc gửi mã đã hết hạn.
- [ ] Kiểm owner lỗi, mã thay thế/thu hồi/hết hạn, callback gửi trùng và replay báo cáo không gửi lại email; render và kiểm tám phần.

**Kiểm chứng/đạt:** lỗi email không đảo giao dịch/phát vé mới; kết quả email không là bằng chứng xác minh tài khoản; payload bảo mật có owner/lifecycle rõ mà không tự chọn thời hạn thiếu nguồn.

### Task 10: DB Reporting

**Files:** Create `docs/05-specs/005-data-design/databases/reporting.md`.

**Interfaces:** Consumes Task 2, sự kiện/kết quả Core Task 6, M-07/BR-35 và quyết định consumer chống lặp; produces mô hình đọc, công thức tổng hợp, watermark/coverage và khả năng tái dựng.

- [ ] Xác định tập dữ liệu tối thiểu để tính thực thu, đã hoàn, còn phải hoàn, bán ròng, ghế bán/soát và suất hủy đúng glossary; không lưu danh sách đơn/PII ngoài nhu cầu đã duyệt.
- [ ] Viết ERD logic/chi tiết, grain của mỗi fact/tổng hợp, khóa chống đếm trùng, dimension ID/snapshot và chỉ mục theo rạp/kỳ. FK chỉ giữa dữ liệu Reporting sở hữu.
- [ ] Mô tả thời điểm xác nhận nghiệp vụ, kỳ ngày giờ Việt Nam và số dư cuối kỳ; không giảm bán ròng hai lần vì vừa duyệt hủy vừa hoàn thành hoàn.
- [ ] Tách event khoản cộng/trừ với snapshot trạng thái; event cũ không tự là khoản tiền bỏ qua. Inbox và cập nhật cùng transaction, thứ tự/phiên bản, tiến độ retry/cách ly/replay.
- [ ] Mô tả mốc mới dữ liệu/coverage, backfill và chuyển mô hình tái dựng; không xóa dấu dedupe chung để chạy lại tác dụng phụ. Không suy replay Reporting thành gửi email/hoàn tiền.
- [ ] Kiểm thu thừa, hoàn một phần, nghĩa vụ hoàn còn treo, ngày qua 0 giờ, suất hủy, mẫu số 0 và sự kiện đảo thứ tự/lặp. Render và kiểm tám phần.

**Kiểm chứng/đạt:** công thức khớp BR-35; dữ liệu có độ mới được công bố; không JOIN Core/Identity, không biến báo cáo thành thẩm quyền tiền hoặc lưu PII chỉ vì nhận event.

### Task 11: Cấu trúc và vòng đời kho hỗ trợ

**Files:** Create `docs/05-specs/005-data-design/supporting-stores.md`.

**Interfaces:** Consumes owner/ID/phiên bản Task 2–10 và ADR tương ứng; produces STORE-01–STORE-06 cho Task 12/13. Không tạo ERD quan hệ giả cho object/index/key-value.

- [ ] **STORE-01 Redis/BullMQ/PubSub:** mô tả namespace/key/value theo owner cho cache, rate limit, điều phối hold, queue và fanout; phân biệt TTL kỹ thuật với TTL hold. Có đường PostgreSQL dự phòng hold, cache tái tạo, PubSub không bền và phục hồi ý định job; không dùng prefix để hứa cách ly bộ nhớ/eviction. BullMQ là lựa chọn của Core, không mặc định chọn job framework cho các service bổ trợ. Nếu dùng Redis điều phối lượt AI, đối chiếu dữ liệu bền/quyền xử lý tại Task 7; mất key không tự giải phóng lượt khi Agent cũ còn có thể chạy.
- [ ] **STORE-02 Typesense:** mô tả collection/document ID, trường tìm/lọc/vector, phiên bản nguồn/model và generation index; external vectors, lexical fallback khi embedding lỗi/quota, rebuild/catch-up và xóa dữ liệu. Dimension chưa có căn cứ thì tra tài liệu đúng model, không tự mặc định hoặc thêm vector DB.
- [ ] **STORE-03 Kafka/CDC:** mô tả envelope/event ID/aggregate version, key/thứ tự cần thiết, source outbox, consumer inbox/offset/coverage và replay; retention/compaction/retry là đề xuất cần căn cứ. Giới hạn WAL/slot/backlog và cách ly event lỗi không đồng nghĩa cấp business service quyền SQL nguồn.
- [ ] **STORE-04 R2/Images:** mô tả object/media ID, biến thể/version, metadata thuộc Catalog, tham chiếu còn dùng và xóa/orphan/rebuild; không thêm kho trailer hoặc giả định ảnh đã upload.
- [ ] **STORE-05 MMKV/SecureStore:** mô tả snapshot vé/QR offline, schema version, cách ly tài khoản, khóa mã hóa, cập nhật/xóa/đăng xuất/khôi phục app; snapshot không cho nhân viên soát offline hoặc xác nhận vé mới. Thời hạn chưa chốt phải dẫn phụ thuộc.
- [ ] **STORE-06 Chẩn đoán và bản sao phục hồi:** mô tả phạm vi dữ liệu gửi LangSmith/Grafana theo lựa chọn hiện có, log kỹ thuật tối đa 7 ngày khác audit/chat; quyền và bản sao/provider. Với backup, mô tả nguồn cần giữ/rebuild và phạm vi nhất quán liên DB/outbox/inbox/secret tham chiếu; chưa chọn nơi lưu/lịch/topology.
- [ ] Đối chiếu mỗi STORE với đủ trường hợp đồng đầu ra; kiểm mất/rebuild/xóa có thể làm lặp thu/hoàn/email hay phục hồi quyền cũ không. Chỉ bổ sung sơ đồ khi cần giải thích, render mọi sơ đồ đã thêm.

**Kiểm chứng/đạt:** mỗi kho có owner/source/lifecycle/recovery; không nâng cache/index/queue thành nguồn thẩm quyền; phân biệt cần backup với tái dựng, và đề xuất thời hạn với quyết định đã có.

### Task 12: Sequence giao dịch và ma trận phục hồi

**Files:** Create `docs/05-specs/005-data-design/transactions.md`; chỉ người điều phối cập nhật liên kết truy vết trong `spec.md`.

**Interfaces:** Consumes bảng/ID/phiên bản/invariant Task 3–11; produces TX-01–TX-07 và ma trận failure point → trạng thái bền → đường phục hồi. Không đặt tên bảng khác với từ điển DB.

- [ ] **TX-01 Giữ ghế:** xác nhận → Redis điều phối → transaction Core all-or-nothing → kết quả; nhánh tranh chấp, Redis lỗi/timeout, PostgreSQL fallback chạy đồng thời, hết hạn và commit mất phản hồi. Chỉ báo thành công sau commit.
- [ ] **TX-02 Thanh toán/phát hành:** lưu ý định/attempt → gọi cổng ngoài transaction → xác minh callback/query → transaction quyền vé/kết quả/outbox; nhánh đơn 0đ, callback lặp/khác attempt/đến muộn, mất quyền ghế và đối soát/hoàn khoản thu.
- [ ] **TX-03 Hủy/hoàn:** tiếp nhận chưa vô hiệu vé → xét lại quyền chưa dùng → transaction quyết định/quyền/nghĩa vụ → gọi hoàn ngoài DB → xác minh kết quả; nhánh hủy một phần/Sweetbox, soát cạnh tranh, khoản nhỏ, timeout và gửi lại mã cũ.
- [ ] **TX-04 Hủy suất:** đề nghị làm dừng thao tác mới theo BR-12 → duyệt/vô hiệu cấp suất → xử lý từng đơn có tiến độ bền; nhánh worker dừng, thanh toán đang chạy, thu muộn và hệ quả Notification/Reporting không chặn Core.
- [ ] **TX-05 Đổi ghế:** gắn vé gốc và phiên bản xác nhận, bảo vệ ghế đích và chuyển quyền nguyên tử; nhánh lỗi giữ vé cũ/lượt đổi, mất phản hồi tra operation cũ, giữ giá/ưu đãi/điểm. Không chọn TTL mới như quyết định sản phẩm.
- [ ] **TX-06 Soát/quyền lợi và đổi điểm:** chia thành các sequence nhỏ cho soát + điểm/chi tiêu/hạng cùng transaction, và trừ điểm + cấp voucher cùng transaction; nhánh hai cửa/tranh chấp/dedupe và sửa sai theo thẩm quyền.
- [ ] **TX-07 Claim Check:** dữ liệu xác minh + payload mã hóa + outbox tham chiếu tại owner → luồng riêng → Notification HTTPS lấy → provider; nhánh payload hết hạn/thu hồi/owner lỗi/provider nhận mất phản hồi, retry không gia hạn mã.
- [ ] Mỗi TX ghi đúng module/interface, transaction bắt đầu/kết thúc, tên bảng liên quan, idempotency/phiên bản, điều kiện quyền và kết quả được xác nhận. Đặc tả tên command/query mới là đề xuất, không sửa DTO.
- [ ] Lập ma trận lỗi trước/sau commit, trước/sau provider nhận, trước/sau consumer commit, restart và restore mốc cũ. Nêu hàng rào không replay thu/hoàn/email và không khôi phục TTL/quyền cũ trái quy tắc; không giả định các DB có cùng mốc backup.
- [ ] Render tất cả sequence; đối chiếu từ điển DB và STORE, sửa lệch tên/cardinality/trạng thái/thẩm quyền trước review độc lập.

**Kiểm chứng/đạt:** không transaction giữ qua mạng/chờ khách; không gọi cổng ở nhánh đơn 0đ; không kết luận timeout là thất bại; bảo vệ cả idempotency và cạnh tranh giữa mã khác nhau; các luồng minh họa là thiết kế, không bằng chứng chạy thật.

### Task 13: Tích hợp, review độc lập và bàn giao

**Files:** Modify `docs/05-specs/005-data-design/spec.md`, các file trong cùng feature khi sửa finding; Modify `docs/05-specs/README.md`, `docs/02-architecture/README.md` để liên kết bộ thiết kế đã tồn tại. Không tạo file nhật ký review trong repository.

**Interfaces:** Consumes toàn bộ đầu ra Task 1–12 và nguồn sở hữu; produces bộ thiết kế nhất quán, diff thuần tài liệu, bằng chứng kiểm/render/review và danh sách quyết định cần chủ sản phẩm duyệt.

- [ ] Người điều phối tự review theo `writing-plans`: phủ yêu cầu, không chỉ dẫn mơ hồ, tên artifact/section/TX/STORE khớp; bảng truy vết không có yêu cầu bị bỏ quên.
- [ ] Đọc lại các nguồn đã duyệt và đối chiếu ERD–từ điển–index/constraint–sequence–STORE; các proposal mới không được tự gắn accepted. Kiểm nguồn NFR có thay đổi ảnh hưởng không.
- [ ] Giao reviewer độc lập chỉ đọc bộ thiết kế và nguồn; yêu cầu phát hiện thiếu UC/BR/NFR, sai owner, sai tiền/quyền, lỗ hổng cạnh tranh/phục hồi, dữ liệu nhạy cảm và sơ đồ khó đọc. Reviewer báo mức ảnh hưởng, file/section/nguồn và sửa cần thiết; không sửa trùng tác giả.
- [ ] Tác giả xử lý finding trong phạm vi; yêu cầu sản phẩm/kiến trúc mới hỏi chủ sản phẩm. Người điều phối kiểm diff và bằng chứng, reviewer đối chiếu lại finding quan trọng; không đóng chỉ từ lời tác giả.
- [ ] Chạy toàn bộ kiểm mục 6, xem từng hình thực tế và ghi kết quả/giới hạn theo đúng phiên bản tài liệu; cập nhật mục lục chỉ tới file đã có. Giữ bằng chứng ở bàn giao/Issue/PR được phép.
- [ ] Bàn giao tiếng Việt ngắn: bộ file, nguồn/hash, kiểm đã chạy, kết quả review, đề xuất schema và điểm cần duyệt; phân biệt hoàn tất soạn tài liệu, được chấp thuận và đã triển khai. Không tự commit/publish/merge.

**Kiểm chứng/đạt:** đủ bảy bộ ERD logic/chi tiết + từ điển; tổng quan owner; TX-01–07; STORE-01–06; ma trận truy vết và phục hồi; không finding nghiêm trọng chưa xử lý bị gọi là hoàn tất. Nếu còn chặn quyết định, bàn giao rõ phần draft/phụ thuộc, không tuyên bố sẵn sàng viết migration.

## 6. Kiểm chứng cụ thể

### 6.1. Xác minh nền và phạm vi trước mỗi lượt sửa

Chạy tại worktree được giao; nếu đường dẫn đã đổi do ứng dụng thì thay đúng giá trị được xác minh, không trỏ về main như đường dự phòng.

```powershell
$dataDesignRoot = 'C:/Users/NhiBuaa/.codex/worktrees/docs-data-design/movie-booking-agent'
git -C $dataDesignRoot rev-parse --show-toplevel
git -C $dataDesignRoot branch --show-current
git -C $dataDesignRoot rev-parse HEAD
git -C $dataDesignRoot status --short
git -C $dataDesignRoot worktree list --porcelain
git -C $dataDesignRoot fetch origin main
git -C $dataDesignRoot diff --name-only 2a007797ac9ce542d9747aad0f44f3e430eec581 origin/main
```

Kỳ vọng: đúng worktree nhiệm vụ; nhận diện detached HEAD là trạng thái quản lý hiện có, không tự chuyển nhánh checkout khác. Nếu main/NFR đổi nội dung liên quan, đọc delta trước khi dùng; không tự rebase, ghi đè hoặc nhận thay đổi ngoài phạm vi.

### 6.2. Kiểm tính toàn vẹn tài liệu

```powershell
$dataDesignRoot = 'C:/Users/NhiBuaa/.codex/worktrees/docs-data-design/movie-booking-agent'
git -C $dataDesignRoot diff --check
powershell -ExecutionPolicy Bypass -File 'C:/Developer/Projects/agentic-repo-kit-reference/scripts/check-kit.ps1' -TargetPath $dataDesignRoot -Json
git -C $dataDesignRoot status --short
git -C $dataDesignRoot diff --stat
```

Kỳ vọng: exit 0; không liên kết hỏng/lỗi mới; chỉ file tài liệu trong phạm vi. Kit ở nền đã có cảnh báo `.agents/skills` được repository giải thích là tích hợp Spec Kit; báo riêng cảnh báo cũ, không xóa hoặc sửa cấu hình để làm kết quả sạch giả. `git diff` không bao gồm file untracked: phải đọc toàn bộ file mới và kiểm tên/đường dẫn từ `git status`, không coi diff rỗng là không có thay đổi.

Ở máy khác, dùng checkout kit được dự án chỉ định; CI nền pin kit tại `0ac239c5719db315869e522d80d57b63212caf3e`. Không tự clone/cài hoặc sửa CI nếu môi trường chưa có công cụ; báo giới hạn chính xác. Không coi kiểm link của kit là kiểm cú pháp/render Mermaid.

### 6.3. Kiểm schema tài liệu và tính nhất quán

Trong worktree, liệt kê các phần và khối Mermaid để đối chiếu thủ công, không chạy chúng như migration:

```powershell
rg -n '^#{1,4} |^```mermaid|^erDiagram|^sequenceDiagram|^flowchart' docs/05-specs/005-data-design
rg -n 'TODO|TBD|FIXME|implement later|fill in details' docs/05-specs/005-data-design --glob '!plan.md'
```

Kỳ vọng lệnh thứ hai không có kết quả trong các file thiết kế (exit 1 do không khớp là đúng). Loại `plan.md` để câu lệnh minh họa không tự khớp chính nó; khi tự review kế hoạch, bỏ các khối code trước rồi quét phần văn bản cho những dấu chờ điền này. Các quyết định mở có mã nguồn, tác động và phần bị chặn rõ ràng; đó là thông tin thiết kế hợp lệ, không dùng chuỗi chờ điền thay mô tả task.

Reviewer phải đối chiếu thủ công:

| Phép kiểm | Điều kiện đạt |
|---|---|
| Đủ đầu ra | Bảy file DB đúng owner; mỗi file đủ tám phần; mọi bảng/cột trên ERD có mô tả tương ứng hoặc được phân loại là thư viện theo phiên bản. |
| Khóa/quan hệ | Mỗi FK trỏ trong cùng DB, đúng cột/kiểu/cardinality/nullability; ID ngoài DB ghi là tham chiếu hợp đồng; không gắn cascade xóa xuyên service. |
| Ràng buộc | Nêu cơ chế bảo vệ từng invariant, phân biệt constraint cục bộ với kiểm liên bảng/transaction; unique không dựa đồng hồ động thiếu cơ chế hết hạn. |
| Giao dịch | Tên bảng/trạng thái/ID trong TX trùng từ điển; mọi điểm báo thành công có commit/thẩm quyền tương ứng; side effect ngoài DB có đường chưa rõ/đối soát. |
| Tiền/quyền | Tổng phân bổ bằng tổng giảm/thực trả, hủy không tính lại phần còn lại, không hoàn vượt nghĩa vụ; ghế/vé/combo/điểm không bị xử lý lặp. Đây là kiểm lập luận tài liệu, chưa chứng minh thuật toán thực thi. |
| Vòng đời | NFR-PRIV-01 không bị áp nhầm cho chat/audit/backup; xóa/restore/replay không làm sống lại quyền hoặc nghĩa vụ đã xử lý; phần chưa quyết định có nguồn và tác động. |
| Phủ yêu cầu | Mỗi UC/BR/NFR liên quan dẫn đến mô hình/ràng buộc/TX/STORE hoặc lý do không tạo dữ liệu; không bỏ capability chỉ vì mock hiện tại thiếu. |

### 6.4. Kiểm render Mermaid và khả năng đọc

1. Kiểm kê từng khối Mermaid bằng đường dẫn, heading và loại hình; ghi phiên bản/trình xem trong bằng chứng bàn giao.
2. Mở file Markdown bằng trình xem có Mermaid đã có trong môi trường; kiểm **từng hình**, không lấy một hình đại diện. Khi phải dùng công cụ trình duyệt/ứng dụng, tuân thủ skill tương ứng.
3. Kiểm parser không báo lỗi; nhãn không bị cắt/chồng; hướng/mũi tên/cardinality đọc đúng; sequence phân biệt `alt`/`opt`/vòng lặp và transaction. Hình lớn chia theo nhóm, giữ liên kết tới hình tổng quan.
4. Xem ở kích thước đọc thông thường và khung hẹp; bảng mô tả phải cung cấp nghĩa tương đương khi cần mở rộng/zoom. Không sửa cấu hình máy/người xem để ép sơ đồ chạy.
5. Nếu trình xem hiện có không render được hoặc công cụ thiếu, báo “chưa kiểm chứng hiển thị” và đúng phần bị ảnh hưởng; không dùng link check hoặc mã Mermaid có vẻ đúng để kết luận đã xem. Việc cài thêm công cụ là hành động riêng cần quyền phù hợp.

Kế hoạch này không chứa sơ đồ thiết kế để render. Kiểm render là tiêu chí của bộ thiết kế sau phê duyệt, không được đánh dấu đạt từ việc soạn kế hoạch.

## 7. Checklist kết thúc và bàn giao thực hiện

- [ ] Chủ sản phẩm phê duyệt đúng phiên bản/hash kế hoạch; lưu tham chiếu xác định, không bịa URL/commit phê duyệt.
- [ ] Các yêu cầu và phụ thuộc có nguồn hiện hành; NFR ngoài main chỉ dùng phần có căn cứ.
- [ ] Bảy DB được thiết kế đủ chiều logic/chi tiết, tám phần/file; các bảng thư viện có nguồn phiên bản.
- [ ] Tổng quan owner, TX-01–07 và STORE-01–06 khớp nhau; không quyền sở hữu chồng hoặc FK/JOIN xuyên DB.
- [ ] Bất biến ghế/tiền/quyền được kiểm bằng tình huống cạnh tranh, xử lý lặp và phục hồi ở mức thiết kế.
- [ ] Kiểm tài liệu và render có bằng chứng; review độc lập và finding được đối chiếu lại.
- [ ] Phần phụ thuộc quyết định được báo riêng; không gắn nhãn toàn bộ thiết kế accepted hoặc sẵn sàng migration khi còn chặn.
- [ ] Chủ sản phẩm nhận bộ thiết kế để duyệt; code/migration/runtime và publication không phát sinh từ kế hoạch này.

Khi duyệt kế hoạch, có hai cách thực hiện: **subagent theo file với cổng phụ thuộc** (khuyến nghị, mỗi file một owner, review giữa các task) hoặc **thực hiện trực tiếp trong phiên** theo từng task. Cả hai đều giữ review độc lập cuối cùng và giới hạn tài liệu; không bắt đầu chỉ vì file kế hoạch đã tồn tại.

# Triển khai portfolio luôn chạy: Compose, PaaS và k3s

Tra cứu 2026-11-17 bằng nguồn chính thức và Context7 (`/websites/render`).
**Hoãn lựa chọn đến lúc chuẩn bị deploy**, theo yêu cầu chủ sản phẩm ngày 2026-11-17 trong hội thoại Tech Stack
(`01a1e2f4-4de8-75d2-a43e-efd7365dbd58`); nguồn mục tiêu là [Project Overview](../../PROJECT-OVERVIEW.md).
Chưa chốt hướng triển khai, nhà cung cấp, vùng, cấu hình máy hoặc yêu cầu HA; các đề xuất dưới đây là bối cảnh nghiên cứu, không phải quyết định đã chọn.
Người dùng đã chọn portfolio công khai luôn chạy; điều này chưa phải cam kết không gián đoạn.
Đây là nghiên cứu thiết kế; chưa cài đặt, tạo tài nguyên, chạy stack hoặc đo hiệu năng.

## Phạm vi so sánh

Giữ stack đã chọn: Core NestJS/Fastify, Agent FastAPI/LangGraph, Next.js Web, Organizer React/Vite,
PostgreSQL, Redis, BullMQ worker, Apache Kafka KRaft, Kafka Connect/Debezium và Grafana Alloy.
Sau so sánh ban đầu, [ADR-0030](../06-decisions/0030-typesense-for-movie-search-and-discovery.md) bổ sung Typesense;
[ADR-0034/0035](../06-decisions/0035-search-module-in-cinema-core.md) chọn external vectors và module Search/BullMQ indexing.
Các ước tính máy/giá bên dưới là nghiên cứu lịch sử trước phần bổ sung này, không chứng minh đủ tài nguyên
cho stack mới nhất. Khi chuẩn bị deploy phải tính lại footprint chỉ mục/vector, queue và tải truy vấn.
Mobile là bản phân phối client riêng; AI, email, media và telemetry Cloud vẫn có chi phí/quota bên ngoài.
Không thay Kafka bằng dịch vụ bus khác, hoặc tự coi Valkey là quyết định thay Redis đã được duyệt.

| Hướng | Bố trí | Phù hợp / đánh đổi |
|---|---|---|
| **A. Linux VPS + Docker Engine/Compose** | Một máy chạy các container, reverse proxy và volume bền vững; Organizer là tài sản tĩnh. | Kiểm soát đầy đủ PostgreSQL CDC, Kafka listeners và tài nguyên. Thể hiện kiến trúc nhiều dịch vụ nhưng một máy là điểm lỗi chung; tự quản lý máy, backup và phục hồi. |
| **B. Render trả phí** | Web/public API, private services, worker; managed PostgreSQL khi đủ quyền CDC; Kafka/Connect tự host trên private services. | Giảm phần quản lý host/TLS/deploy, nhưng CDC cần điều kiện riêng, giá cộng theo từng service và disk; stateful service vẫn có giới hạn vận hành. |
| **C. k3s trên cụm VPS** | Cùng các dịch vụ, triển khai qua Kubernetes; control plane, scheduling và storage phải thiết kế riêng. | Có giá trị học hệ phân tán/vận hành cụm; tăng số máy và trách nhiệm. Control plane HA không tự làm PostgreSQL, Redis hay Kafka HA. |

## A — Compose trên một VPS

Docker có hướng dẫn dùng Compose cho một server production; đây là phạm vi triển khai hợp lệ,
không phải bằng chứng đủ sức tải hoặc đảm bảo sẵn sàng. [Docker production](https://docs.docker.com/compose/how-tos/production/).
Dùng volume cho PostgreSQL/Redis/Kafka; Connect giữ cấu hình/offset theo cơ chế Kafka Connect đã cấu hình.
Phân tách port/mạng nội bộ; không đưa DB, Redis, broker/controller hoặc Connect REST ra Internet.
Giới hạn heap JVM, RAM/CPU từng container, log rotation, readiness và restart policy cần đo khi triển khai.
Mất máy/ổ đĩa có thể dừng toàn stack; backup ngoài máy và diễn tập restore quan trọng hơn tăng số app container.
Quy tắc repository chỉ cho hai nguồn Compose hiện có; nghiên cứu này không đề xuất thêm file vận hành thứ ba.

## B — Render: khả thi có điều kiện cho nguyên stack

Logical replication PostgreSQL **mặc định tắt**, cần workspace **Pro trở lên**, DB **ít nhất 10 GB storage**,
và **liên hệ support** với DB, role và schema. Publication `FOR ALL TABLES` cần support có superuser;
publication bảng cụ thể có thể tự tạo theo quyền. [Render logical replication](https://render.com/docs/postgresql-logical-replication).
Đó chưa phải chứng nhận Debezium: phải xác nhận `pgoutput`, quyền REPLICATION/LOGIN, tạo slot,
publication, WAL retention và vòng đời slot khi bảo trì/failover trước khi chọn managed DB này.

Kafka/Connect dùng **private services**, không dùng background worker cho endpoint cần nhận kết nối:
worker chỉ gửi, không nhận lưu lượng private; web/private services nhận giao thức tùy ý trên các port cho phép.
Đặt advertised listeners theo hostname nội bộ ổn định, đúng vùng/workspace; không dùng localhost giữa services.
Static site không tham gia private network: Organizer gọi API công khai đã xác thực hoặc proxy.
[Render private network](https://render.com/docs/private-network).

Paid private service có thể gắn persistent disk và tài liệu nêu Kafka là trường hợp sử dụng.
Disk chỉ gắn một instance, không chia sẻ; service có disk không horizontal scale và mất zero-downtime deploy.
Phải giữ broker/controller data; Connect distributed mode cần các internal topics bền vững.
Snapshot disk không thay backup hiểu trạng thái của cơ sở dữ liệu.
[Render disks](https://render.com/docs/disks).

Render Key Value mới dùng **Valkey 8**; instance cũ có thể dùng Redis 6.
Nếu muốn dùng, cần duyệt thay đổi và kiểm BullMQ/Lua/locks/TTL/`noeviction`/persistence;
hoặc tự host Redis trên private service có disk và tính thêm chi phí. [Render Key Value](https://render.com/docs/key-value).
Render có Singapore, nhưng chưa chọn vùng hay kiểm tra khả dụng tài nguyên tài khoản.
[Render regions](https://render.com/docs/regions).

## C — k3s: phân biệt cụm và HA dữ liệu

k3s server tối thiểu 2 CPU/2 GB RAM **chưa tính workload**; agent tối thiểu 1 CPU/512 MB.
[k3s requirements](https://docs.k3s.io/installation/requirements).
Embedded etcd HA cần ít nhất ba server với số lượng lẻ và endpoint đăng ký cố định.
Ba app pod không thay điều kiện quorum. [k3s embedded etcd HA](https://docs.k3s.io/datastore/ha-embedded).
Local-path volume nằm trên node; pod chuyển máy không đồng nghĩa dữ liệu được sao chép hoặc theo sang.
[k3s storage](https://docs.k3s.io/add-ons/storage).
Cần thiết kế riêng Kafka controller quorum/broker replication/min ISR, PostgreSQL replication/failover/slots,
Redis persistence/failover, anti-affinity, storage, ingress và backup; chưa chọn operator/CSI/load balancer nào.
Ba máy cùng datacenter cũng không loại bỏ lỗi cả datacenter; cần xác định miền lỗi thực sự muốn chịu được.

## Chi phí tham khảo, chưa phải dự toán đã duyệt

| Hướng | Mốc USD/tháng | Giới hạn ước lượng |
|---|---|---|
| A | DigitalOcean Basic Regular: 8 GiB/4 vCPU/160 GiB SSD **$48**; 16 GiB/8 vCPU/320 GiB SSD **$96**. | Hai cấu hình để lập ngân sách, chưa chứng minh đủ RAM/CPU/IO cho toàn stack. Shared CPU có biến động tài nguyên. |
| B | **Chưa xác minh tổng giá**; cần Pro workspace và toàn bộ compute, PostgreSQL, Redis/Key Value, persistent disks, lưu lượng. | Không dùng bảng giá legacy để suy tổng. Tách Kafka, Connect, Core, Agent, Web, worker, collector và các dịch vụ dữ liệu khi dự toán. |
| C | Cùng mốc VPS: **3 × $48 = $144** hoặc **3 × $96 = $288** cho máy. | Chưa gồm lưu trữ/backup/load balancer; không tương đương cấu hình A về dung lượng hữu dụng hoặc HA. Replication tiêu thụ thêm tài nguyên. |

Giá VPS từ [DigitalOcean Droplets](https://www.digitalocean.com/pricing/droplets); SGP1 là Singapore theo
[regional availability](https://docs.digitalocean.com/platform/regional-availability/), chưa kiểm khả dụng SKU/account.
Render tính riêng workspace và tài nguyên: [pricing](https://render.com/pricing), [compute plans](https://render.com/docs/compute-plans).
Chưa gồm thuế, domain, backup ngoài máy, CI/registry, vượt lưu lượng, Workers AI/R2/Images/Resend,
LangSmith/Grafana Cloud và phí build/phân phối Mobile; quota miễn phí không phải ngân sách bảo đảm.

## Đề xuất để người dùng chốt hướng

**Ưu tiên A** cho portfolio luôn chạy hiện tại: giữ toàn quyền CDC và nguyên stack Kafka đã chọn,
cho phép trình diễn luồng giao dịch/sự kiện/quan sát với phạm vi phục hồi một host được hiểu rõ.
Lý do không chỉ là giá: A tránh phụ thuộc quyền CDC của PaaS và chưa buộc nhận trách nhiệm HA chưa yêu cầu.
Chọn B nếu ưu tiên vận hành platform và chấp nhận support CDC/giới hạn disk; chọn C nếu vận hành cụm là mục tiêu chính.
Hiện không có bằng chứng hiệu năng để xếp hạng thông lượng hay hứa cấu hình đủ tải cho bất kỳ hướng nào.

Sau khi chốt hướng mới chọn provider/sizing và tiêu chí runtime: RAM/heap/IO, luồng outbox→CDC→Kafka,
worker retry/idempotency, reconnect SSE, restore và recovery sau restart/mất máy.
PostgreSQL cần `wal_level=logical`, đủ slots/senders, publication và quyền Debezium;
giám sát lag/WAL, cân nhắc `max_slot_wal_keep_size` cùng hậu quả slot mất hiệu lực khi vượt giới hạn.
[PostgreSQL replication settings](https://www.postgresql.org/docs/current/runtime-config-replication.html),
[Debezium PostgreSQL connector](https://debezium.io/documentation/reference/stable/connectors/postgresql.html).
Chốt hướng không tự cấp quyền tạo cloud resource, chạy runtime, cài dependency hoặc triển khai.

## Bổ sung ngân sách thấp — 2026-11-17

Người dùng xác nhận $96/tháng quá cao và yêu cầu nghiên cứu phương án tiết kiệm nhất cho portfolio. **Giá DigitalOcean bên trên không phải mức tối thiểu**; chưa có trần ngân sách số cụ thể, chưa chọn provider hoặc thay công nghệ. Người dùng nhớ rằng lần nghiên cứu Oracle trước có thể đã gặp hết capacity; đây là thông tin lịch sử do người dùng báo, chưa xác định vùng/thời điểm/tài khoản và không chứng minh capacity hiện tại. Phần này điều chỉnh đề xuất giá phía trên, giữ mục tiêu online liên tục.

| Lựa chọn | Giá và tài nguyên từ nguồn chính thức | Điều kiện cần giữ rõ |
|---|---|---|
| **Contabo Cloud VPS 4 / VPS 6** | VPS 4: 4 vCPU/8 GB/100 GB SSD; VPS 6: 6 vCPU/12 GB/200 GB SSD hoặc 100 GB NVMe. Giá hiển thị **€4,40 / €6,00 mỗi tháng hiệu dụng trong 24 tháng đầu**, gồm thuế áp dụng theo trang. Trang còn hiển thị giá nền **€5,50 / €7,50** cạnh ưu đãi. | Hợp đồng tối thiểu 1 tháng **không chứng minh các giá nền là báo giá checkout 1 tháng**. VPS 4 hợp đồng tháng có phí setup một lần, chưa rõ số tiền; VPS 6 được bảng giá ghi “No Setup Fee”, chưa kiểm điều kiện checkout cụ thể. Chưa xác minh lịch thu tiền, gia hạn, phụ phí vùng, thuế Việt Nam; không tự đổi USD. Traffic chịu fair-use/throttle. [Linux VPS và kỳ hạn](https://contabo.com/en-us/linux-vps/), [phí setup/traffic](https://contabo.com/en-us/vps/), [pricing](https://contabo.com/en-us/pricing/). |
| **Hetzner CX33 / CX43 EU** | Bảng điều chỉnh giá 15-06-2026 ghi CX33 **€8,49 hoặc $9,99/tháng**, CX43 **€15,99 hoặc $18,49/tháng**, **chưa VAT và IPv4**. | Giá thuộc Germany/Finland, không áp sang Singapore. Trang Cloud hiện ghi cost-optimized “Currently not available”; chưa bảo đảm đặt được, chưa xác minh tổng phụ phí/setup. Xác nhận cấu hình x86 4 vCPU/8 GB của CX33 và tồn kho khi lập dự toán mua. [Bảng giá chính thức được search index trả về; mở trực tiếp báo 404](https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/), [trạng thái sản phẩm](https://www.hetzner.com/cloud/). |
| **Oracle Always Free A1** | **$0** trong quota: **1.500 OCPU giờ + 9.000 GB giờ/tháng**, tương đương **2 OCPU/12 GB**, tổng boot/block storage 200 GB tại home region. | Không dùng con số cũ 4 OCPU/24 GB. Có thể hết capacity; máy bị xem là idle qua 7 ngày theo CPU/network/memory có thể bị thu hồi. Đăng ký cần thẻ hợp lệ, có authorization hold; không SLA cho Free Tier. [Quota/reclaim](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm), [thẻ và SLA](https://www.oracle.com/cloud/free/faq/). |

**Rút Oracle khỏi đề xuất chính**: trải nghiệm hết capacity được báo lại cùng rủi ro cấp máy/thu hồi không tạo cơ sở chắc chắn cho portfolio online liên tục. Chỉ giữ OCI là lựa chọn có điều kiện nếu sau này xác nhận capacity, quota và chấp nhận khả năng gián đoạn. A1 là ARM: Debezium công bố amd64/arm64, còn exact tag Kafka/Connect và mọi image/native dependency **chưa kiểm tương thích hoặc chạy thử**. [Debezium images](https://github.com/debezium/container-images/blob/main/README-build.md). Hướng nghiên cứu chính là **VPS x86 trả phí theo tháng, cấu hình ứng viên 8–12 GB**, cần xác minh tổng phí theo vùng/thuế/setup và trần ngân sách trước khi chọn. Contabo trực tiếp bị 403; dữ liệu từ index chính thức chưa thay báo giá checkout. Chưa chấp thuận provider hay cấu hình máy.
Trong phương án minh họa Compose một máy, PostgreSQL/Redis/Kafka/Debezium và các dịch vụ đã chọn vẫn cần đo;
đây không là lựa chọn topology đã duyệt, chưa kết luận 8 GB đủ tải hoặc chia máy móc mọi service xuống 512 MB.
Cần đo heap/RAM/IO và độ trễ với tải demo nhỏ, có quota/retention phù hợp; chưa chọn cấu hình HA.
Tổng phí còn gồm backup ngoài máy, domain, IP/thuế/vùng và dịch vụ bên ngoài; không đổi stack để đạt ngân sách chưa chốt.

# CI và artifact container độc lập với hosting

Tra cứu nguồn chính thức và Context7 (`/docker/docs`) ngày 2026-11-17. **Bundle A đã được chấp thuận tại
[ADR-0022](../06-decisions/0022-github-actions-buildx-and-ghcr-for-ci.md).**
Các so sánh/đề xuất dưới đây giữ bối cảnh trước khi chốt; chưa tạo workflow hoặc triển khai.
Hosting đã được để lại đến giai đoạn triển khai; nghiên cứu này không chọn provider, máy hoặc deployment.
Đích: worktree `docs-tech-stack-decisions/movie-booking-agent`, detached HEAD `8fbada70fbde3fb9d049babc716a1af4b2de1d2a`.
Chỉ ghi tài liệu; chưa tạo workflow/Dockerfile, cài đặt, build/test, push image hoặc đổi cài đặt GitHub.

## Hiện trạng và ranh giới

Git origin hiện là `https://github.com/NhiBuaa/movie-booking-agent.git`; chưa xác minh visibility, plan, quota hay remote CI.
Worktree này chưa có `.github/`; không suy các nhánh khác cũng chưa có CI. Root và Web có `package-lock.json`;
root scripts giữ `test`, `test:contracts`, `test:all`; Web yêu cầu Node `>=24.19.0 <25`, build Next và `node:test`.
Agent chưa có `pyproject.toml`/`uv.lock`; Python/uv là lựa chọn mục tiêu, chưa phải project đã khóa dependency.
[ADR-0021](../06-decisions/0021-layered-testing-stack-for-platform.md) tiếp tục giữ bộ kiểm thử theo lớp đã chọn;
quyết định CI không bỏ suite cũ, đổi runner test hoặc tự mở quyền gọi provider thật/chạy tải công khai.

## Hai hướng cùng dùng registry và builder

| Hướng | Bundle | Lý do / đánh đổi |
|---|---|---|
| **A. GitHub-hosted Linux** | GitHub Actions standard Ubuntu VM + Docker Buildx/BuildKit + GHCR. | Phù hợp repository GitHub, máy sạch theo job và không phải bảo trì runner. Có giới hạn RAM/disk/quota; image pulls, cache và CDC integration cần đo thực tế. |
| **B. Self-hosted Linux** | GitHub Actions runner Linux tự quản lý + cùng Buildx/BuildKit và GHCR. | Chủ động CPU/RAM/disk/cache/network; hữu ích nếu A có bottleneck đã đo. Tự trả máy/điện/lưu trữ, cập nhật Docker/runner, dọn và cách ly job; PR không tin cậy có thể chiếm máy hoặc truy cập mạng của runner. |

Container/service jobs yêu cầu Linux; GitHub-hosted dùng Ubuntu, self-hosted phải có Docker.
[GitHub service containers](https://docs.github.com/en/actions/tutorials/use-containerized-services/use-docker-service-containers).
Testcontainers Node hỗ trợ Docker; điều đó chưa chứng minh suite PostgreSQL→Debezium→Kafka của dự án đã chạy.
[Testcontainers runtime](https://node.testcontainers.org/supported-container-runtimes/).
Standard Linux x64 VM hiện **public 4 CPU/16 GB RAM/14 GB SSD**, **private 2 CPU/8 GB/14 GB SSD**;
không dùng `ubuntu-slim` cho bundle này: đó là container runner hạn chế, không phải VM Docker đầy đủ.
[Runner specifications](https://docs.github.com/en/actions/reference/runners/github-hosted-runners).
Kafka/Connect JVM, browser, image layers và WAL có thể cạnh tranh tài nguyên; tách job/giới hạn song song,
pin image, readiness/timeouts và owned volumes/networks cần thiết kế theo suite, không hứa toàn stack vừa runner.

## Luồng và artifact đề xuất

1. **PR:** cài từ lockfile, kiểm kiểu/build và bộ test phù hợp thay đổi; build image kiểm tra khi có Dockerfile.
   Không publish image, không cấp bí mật deploy/provider hoặc quyền registry write cho PR/fork.
2. **Nguồn phát hành tin cậy:** sau checks tại đúng commit, build/publish artifact theo trigger được duyệt sau;
   phạm vi branch/tag/release và approval còn cần chốt, không coi mọi push là quyền phát hành.
3. Gắn commit SHA, version nếu có và image **digest** vào kết quả để truy đúng bytes; tag có thể đổi.
   Digest kiểm nội dung, **không tự chứng minh danh tính người phát hành hoặc chữ ký image**.
   Chưa chọn công cụ signing, attestation hay cơ chế triển khai/rollback.

Node/npm pin theo engine/compatibility và dùng `npm ci` với lockfile phù hợp workspace; cache theo OS/toolchain/lock,
không lấy cache thay lockfile. Khi triển khai Python, tạo project/lock đúng scope rồi CI kiểm lock không tự cập nhật.
[npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/), [uv CI](https://docs.astral.sh/uv/guides/integration/github/).
Image ứng viên: **Web Next server, Cinema Core, Agent và worker**; worker có thể dùng chung image Core với entrypoint riêng.
Organizer Vite SPA là artifact tĩnh; chỉ bọc server container nếu deployment sau này cần. Mobile là native build riêng,
không phải OCI image. Chưa chọn native build service hoặc mua EAS/macOS/store account.
GHCR hỗ trợ Docker/OCI, package visibility/access riêng; không suy public repo làm mọi image tự public.
[GHCR](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry).
Buildx dùng BuildKit; Docker vẫn tài liệu hóa từng action setup/build-push bên cạnh reusable builder mới,
chưa chọn action version hoặc thêm dịch vụ build Cloud. [Docker Actions](https://docs.docker.com/build/ci/github-actions/push-multi-registries/).
Chưa cần mặc định build đa kiến trúc khi deploy architecture chưa chốt; pin một target rõ ràng cho CI khi thực hiện.
Nếu cần amd64/arm64, kiểm base images, Node native addons và Python wheels; QEMU có thể chậm hơn native nhiều.
[Docker multi-platform](https://docs.docker.com/build/building/multi-platform/).

## Quyền tối thiểu khi triển khai sau này

PR mặc định `contents: read`; chỉ trusted publish job cần `packages: write` qua `GITHUB_TOKEN` cho package liên kết repo,
không tự thêm PAT dài hạn hoặc `id-token: write` khi chưa cần ký/chứng thực. Không checkout PR không tin cậy
bằng privileged `pull_request_target`/`workflow_run`; không dùng máy daily chứa dữ liệu/bí mật làm runner PR.
Pin Actions vào full commit SHA đã kiểm nguồn; tài liệu mới còn có workflow dependency lockfile để khóa cả phụ thuộc gián tiếp,
nhưng nghiên cứu này chưa chọn hoặc tạo cơ chế đó. [GitHub secure use](https://docs.github.com/en/actions/reference/security/secure-use),
[GHCR authentication](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry).

## Chi phí hiện hành và giới hạn kết luận

| Khoản | Điều kiện ngày tra cứu |
|---|---|
| Standard GitHub-hosted public | Miễn phí compute; larger runners vẫn tính phí. Chưa xác nhận repo này public. |
| Private trên GitHub Free | **$12 compute/tháng** dùng chung với eligible cloud sandbox; Linux standard x64 **$0,006/phút**. Tương đương khoảng **2.000 phút chỉ nếu toàn allowance dành cho loại runner này**; job làm tròn phút. |
| Artifact/cache | GitHub Free **500 MB artifact**, cache **10 GB/repo**; artifact chia allowance với GitHub Packages, cache tách riêng. Retention và cache/image dung lượng cần giới hạn. |
| GHCR | Container image storage/bandwidth **hiện miễn phí**, GitHub nói sẽ báo ít nhất một tháng trước đổi chính sách; không phải cam kết vĩnh viễn. Không áp mức này sang mọi loại Packages/Actions artifact. |
| Self-hosted | GitHub hiện không thu usage runner; vẫn trả hạ tầng/bảo trì/cách ly và chi phí artifact/cache nếu có. Không tự rẻ hơn A. |
| Mobile/macOS | Native emulator/build/signing, macOS runner hoặc EAS có tài nguyên, quota và giá riêng; không nằm trong dự toán Linux image. |

[Actions billing/allowance/storage](https://docs.github.com/en/billing/concepts/product-billing/github-actions),
[runner rates](https://docs.github.com/en/billing/reference/actions-runner-pricing),
[GHCR billing](https://docs.github.com/en/billing/concepts/product-billing/github-packages).
Chưa có tần suất/thời lượng job, số image/architectures, retention hoặc account usage nên chưa có tổng chi phí đáng tin.

## Đề xuất để chốt

**Ưu tiên A + GHCR + Buildx/BuildKit**: bắt đầu CI trên GitHub sẵn có, tạo artifact truy được commit/digest,
giữ đường triển khai Linux container linh hoạt mà chưa cần chọn hosting hoặc vận hành runner.
Chỉ cân nhắc B khi đã đo thiếu tài nguyên/quota hoặc có nhu cầu network riêng và chấp nhận trách nhiệm bảo mật máy.
Không có benchmark tốc độ, throughput hoặc bằng chứng runtime; bundle được chọn cũng chưa đồng nghĩa workflow đã triển khai.

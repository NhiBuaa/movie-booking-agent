# ADR-0022 — GitHub Actions, Buildx và GHCR cho CI và bản build container

## Status

Accepted — ngày 2026-11-17, chủ sản phẩm xác nhận “tôi đồng ý với đề xuất A” sau so sánh
GitHub-hosted và self-hosted Linux runners trong hội thoại Tech Stack
(`01a1e2f4-4de8-75d2-a43e-efd7365dbd58`). Chỉ chọn công nghệ; chưa tạo workflow/Dockerfile,
cài dependency, chạy build/test, push image, đổi quyền GitHub hoặc kích hoạt chi tiêu.

## Context

Repository có origin GitHub. [ADR-0021](0021-layered-testing-stack-for-platform.md) đã chọn
bộ kiểm thử; cần nền thực thi CI và tạo bản build truy được về code đã kiểm tra. Worktree tại
thời điểm khảo sát chưa có `.github/`/Dockerfile hoặc Agent `pyproject.toml`/`uv.lock`;
không suy trạng thái này sang mọi nhánh hay remote CI. Hosting được chủ sản phẩm hoãn đến
lúc chuẩn bị deploy theo [Project Overview](../../PROJECT-OVERVIEW.md).

## Decision

- Chọn **GitHub Actions với standard GitHub-hosted Ubuntu Linux VM runners** cho CI mặc định.
  Không dùng `ubuntu-slim` như VM Docker đầy đủ hoặc chọn larger runner trả phí tại đây.
- Chọn **Docker Buildx/BuildKit** để build container image và **GitHub Container Registry (GHCR)**
  lưu Docker/OCI images. Không chọn dịch vụ Docker Build Cloud hoặc mặc định build đa kiến trúc.
- Luồng mục tiêu: PR kiểm kiểu/test/build và thử build image khi có Dockerfile; không publish từ PR.
  Publish từ nguồn phát hành tin cậy sau checks tại đúng commit. Branch/tag/release triggers và
  quyền phát hành cụ thể phải được đặc tả trước khi cấu hình; lựa chọn không tự cấp quyền push image.
- Gắn commit SHA, phiên bản nếu có và digest vào kết quả build để truy vết chính xác.
  Tag có thể thay đổi; digest xác định nội dung, không thay chữ ký/xác minh người phát hành.
- Image ứng viên là Web Next server, Core, Agent và worker; worker có thể dùng image Core với
  entrypoint riêng. Organizer Vite SPA xuất tài sản tĩnh; Mobile là native build riêng.
  Cách đóng gói cuối và kiến trúc CPU phải kiểm tương thích khi triển khai tính năng liên quan.
- Giữ scripts và suite hiện có theo ADR-0021. Dùng lockfile tương ứng môi trường npm/uv;
  không coi cache hoặc thành công build image là bằng chứng toàn bộ integration đã đạt.
- Chưa chọn hosting, deployment/CD, signing/attestation tool, native build service, môi trường
  runner chi tiết, action versions, trigger phát hành hoặc thay đổi quyền truy cập repository/package.

## Alternatives Considered

| Phương án | Lý do và đánh đổi |
|---|---|
| **GitHub-hosted Linux + Buildx/BuildKit + GHCR** | Được chọn: khớp repository GitHub, VM mới theo job, không cần vận hành máy CI và tạo artifact độc lập nơi hosting. Phải quản lý quota, thời gian chạy, RAM/disk và dữ liệu lưu. |
| Self-hosted Linux runner + cùng builder/registry | Hợp lệ khi cần tài nguyên/cache/network riêng đã xác định. Tự chịu máy, cập nhật, cleanup và cách ly code không tin cậy; không tự rẻ/nhanh hơn hosted runner. Chưa có nhu cầu đã đo để chọn hướng này. |

## Consequences

- Phân job theo môi trường và rủi ro: Node/TypeScript, Python, browser, native và tích hợp dịch vụ
  thật có tài nguyên/lifecycle khác nhau. Testcontainers/Kafka/Connect/CDC cần kiểm RAM/disk,
  image pulls, readiness, timeout, parallelism và cleanup tài nguyên test có ownership.
- Standard Linux x64 hiện có 4 CPU/16 GB RAM/14 GB SSD cho public repo và 2 CPU/8 GB/14 GB SSD
  cho private repo. Đây không phải bằng chứng đủ cho mọi suite của dự án; không chọn runner lớn
  hoặc tắt test chỉ vì suite chưa chạy được, cần đo và tách phạm vi phù hợp.
- PR dùng quyền đọc tối thiểu, không nhận credential deploy/provider hoặc registry write.
  Không chạy code PR không tin cậy trong ngữ cảnh có quyền cao. Trusted publish dùng
  `GITHUB_TOKEN` với quyền package cần thiết; không tự thêm PAT dài hạn hay quyền OIDC chưa cần.
- Pin third-party Actions theo full commit SHA đã kiểm nguồn khi triển khai; giữ secrets khỏi
  source, image layers/build args, artifact và log. Retention/cache cần giới hạn rõ ràng.
- GHCR package visibility/quyền riêng; public repo không tự làm image public. Chọn GHCR không
  cấp quyền công bố source/image hoặc thay visibility. Hosting và quy trình deploy/rollback vẫn hoãn.
- Chưa có workflow runtime, benchmark build hoặc kiểm chứng end-to-end; không coi ADR là CI đã chạy.

### Chi phí

Nguồn ngày 2026-11-17: standard GitHub-hosted runners cho public repo miễn phí compute;
larger runners vẫn tính phí. GitHub Free cho private repo có **12 USD compute/tháng**, dùng chung
với eligible cloud sandbox; standard Linux x64 **0,006 USD/phút**. Khoảng **2.000 phút** chỉ đúng
nếu toàn allowance dùng riêng cho loại runner đó. Chưa xác minh plan/visibility/usage tài khoản.

GitHub Free gồm **500 MB artifact storage**, cache **10 GB/repo**; artifact dùng chung allowance
với các GitHub Packages chịu meter, cache tách riêng. **GHCR container image storage/bandwidth
hiện miễn phí**; GitHub công bố sẽ báo ít nhất một tháng trước khi đổi chính sách. Không áp miễn phí
GHCR sang mọi artifact hoặc package khác, không hứa miễn phí vĩnh viễn.

Ví dụ private repo có 100 job Linux, mỗi job 10 phút: compute tính **6 USD**, có thể nằm trong
allowance 12 USD nếu không có usage khác. Đây không phải tổng hóa đơn; chưa gồm artifact vượt hạn mức,
macOS/native build, dịch vụ ngoài hoặc paid features. Self-hosted hiện không thu usage runner từ GitHub
nhưng vẫn có phí máy/bảo trì. Chưa chọn gói trả phí hay cho phép vượt ngân sách.

## References

- [Nghiên cứu CI, hiện trạng và giới hạn](../99-notes/ci-and-container-artifacts-research.md).
- [GitHub-hosted runners](https://docs.github.com/en/actions/reference/runners/github-hosted-runners).
- [Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions).
- [Runner rates](https://docs.github.com/en/billing/reference/actions-runner-pricing).
- [GHCR usage/authentication/digest](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry).
- [GHCR billing](https://docs.github.com/en/billing/concepts/product-billing/github-packages).
- [Docker GitHub Actions](https://docs.docker.com/build/ci/github-actions/).
- [GitHub secure use](https://docs.github.com/en/actions/reference/security/secure-use).

Nguồn/Context7 đối chiếu ngày 2026-11-17; chưa tạo hoặc chạy workflow, build/test hay publish image.

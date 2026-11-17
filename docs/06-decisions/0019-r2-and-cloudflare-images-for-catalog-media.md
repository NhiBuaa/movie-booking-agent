# ADR-0019 — R2 Standard và Cloudflare Images cho ảnh danh mục

## Status

Accepted — ngày 2026-11-17, chủ sản phẩm xác nhận “tôi đồng ý với đề xuất của bạn” sau so sánh
R2/Images, S3/CloudFront và Cloudinary trong hội thoại Tech Stack
(`01a1e2f4-4de8-75d2-a43e-efd7365dbd58`). Chọn bundle công nghệ; chưa chọn Images Free/Paid,
domain hoặc region, tạo tài khoản/bucket, cài SDK, upload hay kích hoạt chi tiêu.

## Context

[M-01 trong mô tả use case](../03-product/use-case-descriptions.md) đã chốt upload/lưu poster,
banner và ảnh; trailer dùng URL/video nhúng từ nguồn ngoài. Các client Web, Organizer và Mobile
cần ảnh phù hợp kích thước hiển thị. Chỉ chọn object storage/CDN chưa giải quyết resize, crop và
tối ưu định dạng. PostgreSQL/Core tiếp tục sở hữu metadata, liên kết danh mục và quyền xuất bản.

## Decision

- Chọn **Cloudflare R2 Standard** lưu ảnh gốc và **Cloudflare Images remote transformations**
  để resize/crop, tối ưu chất lượng/định dạng và phân phối các biến thể qua cache/CDN.
  Đây là hai dịch vụ riêng; không mặc định lưu bản gốc trong Images hosted storage.
- Core kiểm quyền upload và xuất bản; PostgreSQL giữ object key/version và metadata nghiệp vụ.
  R2 là object storage, không thay PostgreSQL hoặc bổ sung database giao dịch thứ ba.
- Upload trực tiếp dùng URL ký có phạm vi và thời hạn ngắn do server cấp sau xác thực/phân quyền.
  Với R2, presigned URL dùng S3 API endpoint, không dùng custom domain; client không nhận credentials dài hạn.
- Kiểm tra object thực tế trước khi xuất bản; giới hạn kích thước, loại ảnh và dimensions theo đặc tả.
  Content-Type/đuôi file và thông báo upload hoàn tất không đủ chứng minh object hợp lệ.
- Phân phối ảnh danh mục công khai qua custom domain/cache phù hợp; `r2.dev` chỉ phục vụ phát triển.
  Kiểm soát source origins và các biến thể được phép; không cung cấp proxy tải URL tùy ý.
- Giữ phạm vi trailer dùng nguồn ngoài; không chọn nền tảng video, lưu/transcode trailer, hoặc
  đưa vé/QR/tài liệu nhạy cảm vào public catalog bucket tại quyết định này.

## Alternatives Considered

| Phương án | Lý do và đánh đổi |
|---|---|
| **R2 Standard + Cloudflare Images remote transformations** | Được chọn: phân tách lưu bản gốc và xử lý ảnh, đáp ứng phân phối đa kích thước cho các client. API object theo hướng S3 giúp tách metadata khỏi provider; vẫn phải kiểm tra các API R2 hỗ trợ và quản lý billing/cache của hai sản phẩm. |
| S3 Standard + CloudFront + pipeline xử lý ảnh | Hợp lệ nếu ưu tiên hệ sinh thái AWS/IAM. Cần thêm pipeline xử lý tương đương; chỉ S3/CDN không tự cung cấp resize/crop/format. Không loại vì độ phức tạp hay chi phí; nhu cầu hiện tại chưa cần tự vận hành pipeline AWS đó. |
| Cloudinary managed images | Mạnh về tích hợp upload, xử lý, CDN và quản trị media. API/URL riêng và credits gộp nhiều chiều cần cân nhắc; chưa có yêu cầu biên tập/quản trị media chuyên sâu để ưu tiên hướng này. |

## Consequences

- Cần đặc tả upload staging/validation/publish, CORS, versioned keys, cleanup object mồ côi và
  chính sách cache/purge khi thay/xóa ảnh. Upload và cập nhật PostgreSQL không tự là một transaction.
- Chọn cách tích hợp ảnh với Next.js và React Native; tránh xử lý ảnh hai lần ngoài chủ đích.
  SDK, tham số/giới hạn biến thể, domain, cấu hình origin access và topology chưa được chọn.
- Dùng signed URL không tự bảo đảm single-use; CORS không thay xác thực/phân quyền.
  Không suy URL khó đoán thành quyền truy cập dữ liệu riêng tư.
- Cần kiểm chất lượng đầu ra, cache hit/miss, quota và độ trễ với ảnh/thiết bị thực.
  Chưa có bằng chứng A nhanh hơn hai phương án khác; không suy hiệu năng của dự án từ tài liệu provider.

### Chi phí

Theo nguồn ngày 2026-11-17, R2 Standard có allocation tháng **10 GB-month, 1 triệu Class A và
10 triệu Class B operations**. Ngoài allocation: **0,015 USD/GB-month**, **4,50 USD/triệu A**,
**0,36 USD/triệu B**; egress Internet miễn phí. Có quy tắc làm tròn đơn vị tính phí.
Allocation dùng chung tài khoản; bật R2 subscription có yêu cầu billing/payment method phù hợp.

Images Free có **5.000 unique transformations/tháng**; vượt thì biến thể mới lỗi `9422`,
biến thể đang cache tiếp tục phục vụ. Không tự chuyển trả phí. Images Paid gồm 5.000,
phần vượt **0,50 USD/1.000 unique/tháng**. Một source và bộ tham số tính một biến thể duy nhất;
request lặp trong tháng không nhân lại; `format`/`quality` không làm thêm unique theo quy tắc hiện hành.
Ảnh gốc ở R2 chỉ chịu meter Images Transformed, không cộng Images Stored/Delivered của hosted images.

Ví dụ **10 GB originals cả tháng, 10.000 PUT, 1 triệu origin GET, 100 GB delivery và
2.000 ảnh × 5 sizes được yêu cầu = 10.000 unique variants**: R2 trong allocation là **0 USD**;
Images **nếu bật Paid** khoảng **2,50 USD/tháng**. Đây là minh họa, không phải gói đã mua hoặc
quyền quota tài khoản đã xác nhận; chưa gồm domain, thuế, DB/worker và request phụ.
Lý do chọn là chức năng và phân tách trách nhiệm, không chỉ allocation miễn phí hoặc việc đã dùng Workers AI.

## References

- [Nghiên cứu media và chi phí các phương án](../99-notes/media-storage-research.md).
- [R2 pricing](https://developers.cloudflare.com/r2/pricing/).
- [R2 setup](https://developers.cloudflare.com/r2/get-started/).
- [Cloudflare billing policy](https://developers.cloudflare.com/billing/understand/billing-policy/).
- [R2 public delivery](https://developers.cloudflare.com/r2/buckets/public-buckets/).
- [R2 presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/).
- [Images remote transformations](https://developers.cloudflare.com/images/optimization/transformations/overview/).
- [Images pricing](https://developers.cloudflare.com/images/pricing/).
- [AWS image transformation solution](https://docs.aws.amazon.com/solutions/dynamic-image-transformation-for-amazon-cloudfront/).
- [Cloudinary pricing](https://cloudinary.com/pricing).

Nguồn/Context7 đối chiếu ngày 2026-11-17; chưa xác nhận account, upload, output ảnh hoặc runtime.

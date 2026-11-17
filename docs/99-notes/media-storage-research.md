# Catalog media: R2 + image transformations, S3 + CloudFront hay Cloudinary?

Tra cứu 2026-11-17. **Lựa chọn đã chấp thuận: R2 Standard + Cloudflare Images remote transformations,
theo [ADR-0019](../06-decisions/0019-r2-and-cloudflare-images-for-catalog-media.md).**
Các phần so sánh/đề xuất dưới đây giữ bối cảnh trước khi chốt; chưa chọn gói Images/domain/region hoặc triển khai.
Đích: worktree `docs-tech-stack-decisions`, detached HEAD `8fbada70fbde3fb9d049babc716a1af4b2de1d2a`.
Chỉ đọc nguồn chính thức/code; không tạo account, bucket/domain, upload, cài SDK hoặc thay source/ADR.

## Phạm vi và so sánh cùng chức năng

[M-01](../03-product/use-case-descriptions.md) đã chốt lưu poster/banner/ảnh;
trailer dùng URL/embed nguồn ngoài, không tự phục vụ/transcode video. Không tự đưa vé/QR hoặc tài liệu nhạy cảm vào public catalog bucket.
PostgreSQL giữ metadata/media key/version/liên kết domain; Core kiểm quyền và publish, storage không trở thành nguồn nghiệp vụ.

| Phương án | Đáp ứng và phần phải bổ sung | Đánh đổi — nhận định |
|---|---|---|
| **A. R2 Standard + Cloudflare Images remote transformations** | R2 giữ originals; custom-domain delivery/cache; Images là **dịch vụ bổ sung rõ ràng** để resize/crop/format/quality cho Web/Mobile. | Tách originals khỏi pipeline ảnh, dùng signed upload qua S3 API endpoint; phải quản lý nguồn/variants/cache và billing hai sản phẩm. |
| **B. S3 Standard + CloudFront** | S3 giữ originals, CloudFront phân phối/cache. Muốn tính năng tương đương A phải thêm image processing, ví dụ AWS Dynamic Image Transformation solution. | Hợp hướng vận hành AWS/IAM; origin access/CDN và pipeline có chủ sở hữu rõ. S3 + CDN riêng không tự có biến thể tối ưu. |
| **C. Cloudinary managed images** | Upload/storage, URL transformations, delivery CDN và công cụ quản lý media trong cùng nền tảng. | Hợp khi muốn thêm quản trị/tìm kiếm/editor media; meter credits gộp nhiều chiều và URL/API riêng, cần đánh giá di chuyển originals/metadata. |

Nguồn: [R2 public delivery](https://developers.cloudflare.com/r2/buckets/public-buckets/), [CF remote pipeline](https://developers.cloudflare.com/images/optimization/transformations/overview/),
[AWS image solution](https://docs.aws.amazon.com/solutions/dynamic-image-transformation-for-amazon-cloudfront/), [Cloudinary plans/features](https://cloudinary.com/pricing).
Không tuyên bố CDN nào nhanh nhất, S3 SDK tương thích mọi API R2, hoặc A/B/C có cùng functionality chỉ vì cùng giữ ảnh.
SDK/API/version cụ thể và cách tích hợp Next.js/React Native chưa chọn; cần kiểm API thực dùng và output ảnh thực tế.

## Giá và hạn mức hiện hành — USD, không phải dự báo hóa đơn

**R2 Standard:** 0.015/GB-month, Class A 4.50/triệu operations, Class B 0.36/triệu; egress Internet miễn phí.
Free tháng: **10 GB-month, 1 triệu A, 10 triệu B**; dùng chung allocation tài khoản, không áp cho Infrequent Access.
R2 có quy tắc làm tròn đơn vị tính phí; không nhân đơn giá nhỏ rồi hứa hóa đơn chính xác. [R2 pricing](https://developers.cloudflare.com/r2/pricing/).
Free quota vẫn cần kích hoạt R2 subscription; Cloudflare yêu cầu payment method hợp lệ khi bật subscriptions và có thể preauthorize.
Chưa xem account/billing; không hứa không cần thẻ hoặc tự bật trả phí. [R2 setup](https://developers.cloudflare.com/r2/get-started/), [billing policy](https://developers.cloudflare.com/billing/understand/billing-policy/).

**Cloudflare Images remote transformations:** Free **5.000 unique transformations/tháng**; vượt thì biến thể mới lỗi `9422`.
Images Paid vẫn gồm 5.000, vượt **0.50/1.000 unique/tháng**. Một source + bộ tham số tính một unique; lặp delivery không nhân lại,
`format`/`quality` không làm thêm unique theo quy tắc hiện tại. Đây không phải số lần GET hoặc số ảnh originals.
Remote originals ở R2 chỉ chịu Images Transformed; **không cộng** Images Stored 5/100.000 và Images Delivered 1/100.000,
vì hai meter đó dành cho ảnh lưu trong Images. [Images pricing](https://developers.cloudflare.com/images/pricing/).

**S3 Standard tham chiếu `us-east-1`, không chọn region triển khai:** 0.023/GB-month ở bậc đầu,
PUT/COPY/POST/LIST 0.005/1.000, GET 0.0004/1.000. Đã đối chiếu price map AWS; không dùng giá S3 Tables/Vectors.
[AWS S3 pricing](https://aws.amazon.com/s3/pricing/), [AWS price map USD](https://b0.p.awsstatic.com/pricing/2.0/meteredUnitMaps/s3/USD/current/s3.json).
CloudFront Pay-as-you-go có allocation tháng **1 TB Internet DTO + 10 triệu HTTP(S) requests**; vượt phụ thuộc viewer geography/tính năng.
CloudFront còn có flat-rate Free/Pro/Business…; không cộng lẫn allowance/credits giữa hai cách tính.
[CloudFront PAYG](https://aws.amazon.com/cloudfront/pricing/pay-as-you-go/), [flat-rate plans](https://aws.amazon.com/cloudfront/pricing/).
AWS credits/tài khoản mới không được giả định sẵn; image compute, logging, invalidation và request phụ vẫn cần tính riêng.

**Cloudinary:** Free **25 credits**, không cần thẻ; Plus **225 credits**, **99/tháng** nếu trả theo tháng,
hoặc **89/tháng quy đổi khi thanh toán năm**. Một credit tương ứng 1.000 image transformations, hoặc 1 GB storage, hoặc 1 GB image bandwidth;
usage **cộng chung**, không phải mỗi chiều được toàn bộ quota. Storage gồm originals/derived/backups áp dụng; Free/Plus dùng rolling 30 ngày cho transformations/bandwidth.
[Cloudinary pricing](https://cloudinary.com/pricing), [credit rules](https://cloudinary.com/documentation/billing_and_plans).

## Ví dụ nhỏ, có giả định công khai

Giả định **10 GB originals lưu cả tháng, 10.000 PUT, 1 triệu GET tại origin, 100 GB delivery và 1 triệu viewer requests**.
Origin GET là số thực sau cache; không mặc định một viewer request luôn thành một origin GET.
Thêm workload ảnh: **2.000 originals × 5 sizes được yêu cầu = 10.000 unique variants**, không có AI/add-ons đặc biệt.

| Hướng | Phép tính minh họa |
|---|---|
| A | R2 trong allocation: **0**; Images Paid `(10.000−5.000)/1.000×0.50` = **2.50/tháng**. R2-only 0 chưa bao gồm pipeline ảnh. |
| B | S3 `10×0.023 + 10.000/1.000×0.005 + 1M/1.000×0.0004` = **0.68/tháng**; CloudFront 0 nếu allowance PAYG còn đủ. **Chưa có phí image pipeline**, không phải tổng tương đương A. |
| C | Storage 10 + bandwidth 100 = **ít nhất 110 credits**; Free không đủ. Thêm 10.000 standard image derivatives: khoảng **120 credits + derived/backup storage phát sinh**; Plus225 **99/tháng** trả tháng nếu tổng usage vẫn trong 225. |

Cloudinary cần đo derived storage, loại transformation và rolling usage để tính thật; 10.000 uploads không tự đồng nghĩa 10.000 transformations.
Ví dụ chưa gồm thuế, mua domain/DNS, requests phụ, cache miss thay đổi, metadata DB/worker/tracing hoặc add-ons; chưa chọn paid tier.
Giá không dùng làm bộ lọc; phải so cùng yêu cầu chức năng. Không suy free quota thành quyền tài khoản đã được xác nhận.

## Upload, publish và cache cần thiết kế

Server xác thực người upload/quyền catalog, cấp URL/signature giới hạn object key, method và TTL ngắn; client không nhận credentials dài hạn.
Upload completion không tự publish: kiểm object thật, kích thước, MIME/content decode/dimensions theo policy; header Content-Type/extension không đủ chứng minh an toàn.
Không cho ghi đè key tùy ý; dùng versioned keys và cập nhật metadata atomically theo workflow, có cleanup orphan objects.
[S3 presigned upload](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html), [Cloudinary signed upload](https://cloudinary.com/documentation/upload_images).
Browser cần CORS allowlist origin/method/headers; CORS không thay authorization. [S3 CORS](https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html).
R2 `r2.dev` rate-limited, chỉ development; production public media cần custom domain/cache phù hợp. R2 presigned URLs chỉ dùng
S3 API domain `*.r2.cloudflarestorage.com`, **không dùng custom domain**; URL có thể được dùng lại trong hiệu lực, không tự single-use.
[R2 public buckets](https://developers.cloudflare.com/r2/buckets/public-buckets/), [R2 presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/).
Chốt allowlist source origins/variants và giới hạn kích thước để tránh tải nguồn tùy ý/bùng transformations; không biến endpoint thành proxy URL mở.
Khi thay/xóa ảnh, version URL và chính sách purge/cache invalidation phải nhất quán; ảnh đã cache có vòng đời riêng.
Không dùng URL công khai của catalog để suy chính sách private ticket/media khác.

**Nghiêng A như một bundle rõ ràng:** R2 Standard giữ originals + Cloudflare Images remote transformations phục vụ các client React,
với quyền publish/metadata ở Core và variants do dự án kiểm soát. Lý do là phân tách trách nhiệm/phù hợp chức năng, không chỉ vì giá thấp.
C mạnh nếu yêu cầu DAM/editor/quản trị media tăng; B hợp nếu chọn AWS operations và có pipeline ảnh riêng tương đương.
Chưa chọn provider, image SDK, gói trả phí, domain hoặc cấu hình; chưa kiểm upload, chất lượng output, cache, runtime hay latency.

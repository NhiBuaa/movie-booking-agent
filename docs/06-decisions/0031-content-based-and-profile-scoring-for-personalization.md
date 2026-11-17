# ADR-0031 — Cá nhân hóa theo nội dung phim và hồ sơ người dùng

## Status

Accepted — ngày 2026-11-17, chủ sản phẩm xác nhận “tôi đồng ý với đề xuất của bạn” sau đề xuất A:
theo nội dung phim + hồ sơ phiên/tài khoản làm phương pháp ban đầu; đánh giá thêm collaborative
filtering khi có dữ liệu thật, trong hội thoại Tech Stack (`01a1e2f4-4de8-75d2-a43e-efd7365dbd58`).
Chỉ chọn phương pháp và ranh giới mục tiêu; chưa triển khai tracking/profile/ranker, huấn luyện model,
cài dependency hoặc gọi inference. Phạm vi phê duyệt ban đầu không chọn model/provider embedding
hoặc cấp quyền xử lý mọi dữ liệu sẵn có; các lựa chọn tiếp nối được ghi dưới đây.

Provider embedding được chọn tiếp tại [ADR-0032](0032-cloudflare-workers-ai-for-managed-embeddings.md):
Cloudflare Workers AI API trong allocation miễn phí; model Qwen3 Embedding 0.6B được chọn tiếp tại
[ADR-0033](0033-qwen3-embedding-for-movie-retrieval.md).

## Context

[ADR-0030](0030-typesense-for-movie-search-and-discovery.md) chọn Typesense làm chỉ mục dẫn xuất,
PostgreSQL từng service giữ dữ liệu/thẩm quyền: Catalog sở hữu nội dung phim, Community đánh giá/yêu thích,
Identity tài khoản; Core giữ giao dịch. Search engine tìm ứng viên nhưng không tự sở hữu hồ sơ sở thích.
Module Search nhận nguồn qua hợp đồng/API/sự kiện, không SQL chéo service theo
[thiết kế bảy service](../05-specs/004-service-decomposition/spec.md); owner cụ thể của profile/tín hiệu vẫn cần đặc tả.
Portfolio chưa có bằng chứng dữ liệu tương tác người thật đủ độ phủ để học quan hệ cộng đồng.
Cần cá nhân hóa từng người và xử lý người/phim mới, không phụ thuộc số đông đã tương tác.

Các quyết định nguồn tín hiệu, nhận diện và người mới được sở hữu bởi BR-21 của
[mô hình sản phẩm](../03-product/use-cases.md#4-quy-tắc-đã-thống-nhất): chủ động khai báo/yêu thích/đánh giá/
mua đã xác nhận cộng detail views/click/search; guest theo phiên, account lâu dài đa thiết bị;
khám phá ngay, không hỏi sở thích ban đầu. Không tự nhập toàn bộ hội thoại Agent.

## Decision

- Chọn **content-based + session/account profile scoring**: dùng metadata/nội dung phim,
  nguồn ứng viên Typesense và tín hiệu sở thích/hành vi của chính phiên/tài khoản để xếp hạng.
  Kết hợp query/ngữ cảnh/profile có kiểm soát; không mặc định mọi người phải có danh sách khác nhau.
- Khi chưa có tín hiệu, phục vụ danh mục/ngữ cảnh thực, rồi dần điều chỉnh. Không thêm bước hỏi
  thể loại/phim lúc bắt đầu; không gọi danh sách biên tập là cá nhân hóa hoặc phổ biến nếu thiếu căn cứ.
- Tách session intent khỏi hồ sơ lâu dài; giữ đúng identity/scope ở server và cách ly cache.
  Xác nhận mua là bằng chứng giao dịch, không tự chứng minh thích phim khi mua cho nhóm.
  Click/search là tín hiệu yếu, không tương tác không tự là không thích; weights/dedup/decay cần đặc tả.
- **Chưa triển khai collaborative filtering ở bản đầu.** Chỉ đánh giá bổ sung khi có dữ liệu thật
  và bằng chứng cải thiện so với baseline; seed/synthetic accounts chỉ kiểm pipeline, không chứng minh
  học đúng gu hoặc tăng hiệu quả. Không đặt số người/tương tác tối thiểu khi chưa đánh giá coverage.
- **LLM không là đường bắt buộc của mọi lượt gợi ý.** Vai trò tùy chọn intent/rerank/explanation
  cần thiết kế và kiểm; lexical/filter/catalogue và xếp hạng từ dữ liệu có sẵn phải có đường phục vụ
  khi LLM/embedding không dùng được. Không tự thêm provider hoặc bật trả phí để giấu sự cố.
- Core vẫn kiểm visibility, lịch/giá/ghế và quyền. Cá nhân hóa không tự tạo suất/vé, bỏ điều kiện
  bắt buộc của truy vấn hoặc dùng chỉ mục làm xác nhận giao dịch.

## Alternatives Considered

| Phương án | Lý do và đánh đổi |
|---|---|
| **Theo nội dung + hồ sơ phiên/tài khoản** | Được chọn: phục vụ được khi ít người dùng, không cần học từ số đông; phù hợp tín hiệu được chọn. Cần chất lượng metadata/embedding, trọng số và kiểm độ đa dạng để tránh chỉ gợi ý nội dung quá giống nhau. |
| Kết hợp collaborative filtering ngay | Có thể khai thác quan hệ mà mô tả phim thiếu, nhưng cần dữ liệu thật, chống leakage/bias và lifecycle huấn luyện/đánh giá. Chưa có bằng chứng đủ dữ liệu để chọn; giữ là hướng xem xét sau. |
| LLM làm ranker chính cho mọi lượt | Có khả năng hiểu diễn đạt/phân tích ứng viên, nhưng thêm quota/độ trễ và rủi ro ID/giải thích sai. Không chọn làm phụ thuộc bắt buộc; optional bounded use chưa triển khai. |

## Consequences

- Đây là lựa chọn phương pháp cho hướng khám phá có cá nhân hóa, không quyết toàn bộ feature.
  Mô hình sản phẩm đã ghi các quyết định nguồn tín hiệu/nhận diện/kiểm soát/thứ hạng;
  luồng chi tiết/contracts cần đặc tả trước triển khai. Chưa chọn giao diện,
  profile centroid/công thức, weights/decay, dimensions thực tế hoặc thư viện ML.
  Mức can thiệp thứ hạng được chọn tiếp tại [BR-20](../03-product/use-cases.md#4-quy-tắc-đã-thống-nhất):
  ưu tiên truy vấn và tên/alias chính xác, cá nhân hóa giữa kết quả phù hợp tương đương;
  trang khám phá có thể cá nhân hóa mạnh hơn, vẫn giữ bộ lọc. Ngưỡng tương đương chưa được chốt.
- Quyền bật/tắt học và dùng hồ sơ, đặt lại dữ liệu đã học được chọn tiếp tại
  [BR-18 của mô hình sản phẩm](../03-product/use-cases.md#4-quy-tắc-đã-thống-nhất);
  chưa thêm xem/xóa từng tương tác ở bản đầu. Retention raw/derived, xử lý tín hiệu cũ khi đặt lại/bật lại,
  thời hạn phiên guest còn mở. Việc chuyển phiên đã chọn tại
  [BR-19](../03-product/use-cases.md#4-quy-tắc-đã-thống-nhất): không nhập hành vi guest khi login;
  giữ hồ sơ tài khoản và học tiếp sau đăng nhập khi cá nhân hóa được bật.
  Không dùng phương pháp này làm quyền tracking/mở rộng dữ liệu; xóa profile cần xét cache/
  vector/replay để không tái tạo dữ liệu đã xóa, không tự xóa chứng từ giao dịch.
- Đánh giá riêng search và khám phá: tên chính xác/alias/typo/no-accent/semantic, cold/warm users,
  relevance có nhãn, coverage/diversity, filter correctness, latency, chi phí/quota và fallback.
  So baseline không cá nhân hóa; khi đánh giá mô hình học cần tách thời gian/chống leakage.
- Chưa có dữ liệu, metric threshold, đo chất lượng Việt, privacy lifecycle hoặc runtime acceptance.
  Owner search được chọn tiếp tại [ADR-0035](0035-search-module-in-cinema-core.md): module Search trong Core,
  BullMQ indexing nền. Quyền sở hữu profile/tín hiệu, contracts/events và cách lấy tín hiệu mua từ Core
  vẫn cần thiết kế theo ranh giới đã chọn.

### Chi phí

Phương pháp không bắt mua dịch vụ recommendation riêng hoặc vận hành training cluster ở bản đầu.
Compute/profile storage/event processing, vector/index và embedding vẫn có chi phí/quota;
encoder/provider đã chọn tại ADR-0032/0033. Chưa có số đo/tải/topology để kết luận tổng phí;
không cài ML library chỉ từ quyết định này.

## References

- [Nghiên cứu phương pháp và embedding](../99-notes/movie-personalization-and-embedding-research.md).
- [Content-based recommendations](https://developers.google.com/machine-learning/recommendation/content-based/basics).
- [Collaborative filtering](https://developers.google.com/machine-learning/recommendation/collaborative/basics).
- [Candidate generation, scoring và reranking](https://developers.google.com/machine-learning/recommendation/overview/types).

Nguồn đối chiếu ngày 2026-11-17 trong nghiên cứu; lựa chọn không là bằng chứng cá nhân hóa đã hoạt động.

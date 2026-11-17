# Cá nhân hóa khám phá phim và lựa chọn embedding

Tra cứu nguồn chính thức/Context7 ngày 2026-11-17. **Phương pháp A — content-based + profile scoring đã được chọn tại
[ADR-0031](../06-decisions/0031-content-based-and-profile-scoring-for-personalization.md); model Qwen3 Embedding 0.6B tại
[ADR-0033](../06-decisions/0033-qwen3-embedding-for-movie-retrieval.md).
Trọng số và chính sách dữ liệu còn mở; chưa chọn thư viện huấn luyện.** So sánh giữ bối cảnh trước quyết định.
Không cài/download model, gọi API,
sửa code/config, chạy thử, tạo tài khoản, phát sinh phí hoặc commit.
Đích: worktree `docs-tech-stack-decisions/movie-booking-agent`, detached HEAD `8fbada70fbde3fb9d049babc716a1af4b2de1d2a`.

Nền retrieval được chọn tiếp là Typesense dẫn xuất + PostgreSQL/Core theo
[ADR-0030](../06-decisions/0030-typesense-for-movie-search-and-discovery.md); ADR-0031 sở hữu phương pháp cá nhân hóa,
nghiên cứu không tự chốt model hoặc công thức chi tiết.

Provider embedding sau đó đã chọn Cloudflare Workers AI managed API tại
[ADR-0032](../06-decisions/0032-cloudflare-workers-ai-for-managed-embeddings.md), trong quota miễn phí dùng chung;
shortlist model ở dưới vẫn là nghiên cứu, chưa chọn BGE-M3 hoặc encoder local.
So sánh model managed được đào sâu tiếp tại
[nghiên cứu Qwen3/BGE-M3](cloudflare-multilingual-embedding-models-research.md);
chủ sản phẩm sau đó chấp thuận Qwen3 tại ADR-0033, không chọn BGE-M3 làm fallback.

## Định hướng thảo luận và ranh giới

Chủ sản phẩm đang nghiêng về tìm kiếm ngữ nghĩa/khám phá nâng cao có cá nhân hóa. Tín hiệu xem xét:
sở thích chủ động khai báo, favorites, ratings, giao dịch mua đã xác nhận; thêm lượt xem chi tiết,
click và lịch sử tìm kiếm. Khách chưa đăng nhập chỉ dùng phiên; tài khoản có hồ sơ dài hạn đa thiết bị.
Cold start chọn hướng **không bắt onboarding sở thích**: catalog/ngữ cảnh trước, học dần khi có tín hiệu.
Đây là đầu vào nghiên cứu, chưa là quyền triển khai tracking/merge hoặc dùng mọi dữ liệu sẵn có.

[Mô hình hiện hành](../03-product/use-cases.md) và [PROJECT-OVERVIEW](../../PROJECT-OVERVIEW.md)
ở thời điểm nghiên cứu ban đầu loại thuật toán đề xuất phức tạp. Mô hình hiện hành đã chấp thuận
content/profile scoring và giữ collaborative training ngoài bản đầu; nghiên cứu không tự sửa sản phẩm.
Cinema Core tiếp tục quyết định lịch, giá, ghế/hold và quyền; ranker không xác nhận vé.
Quyền bật/tắt cá nhân hóa và đặt lại dữ liệu đã học được chọn tiếp tại BR-18; BR-19 chọn không nhập
hành vi phiên khách vào tài khoản khi đăng nhập; xem [mô hình sản phẩm](../03-product/use-cases.md#4-quy-tắc-đã-thống-nhất).
BR-20 chọn ưu tiên truy vấn/tên chính xác, cá nhân hóa giữa các kết quả phù hợp tương đương;
trang khám phá có thể cá nhân hóa mạnh hơn, vẫn giữ đúng bộ lọc.
Ngưỡng/công thức thứ hạng, retention, thời hạn phiên khách và xử lý tín hiệu cũ khi đặt lại/bật lại còn mở.
Các mục phân tích phía dưới giữ bối cảnh nghiên cứu trước những quyết định này.

## Ba hướng thuật toán

| Hướng | Phù hợp và giá trị | Đánh đổi |
|---|---|---|
| **A. Content-based + session/account profile scoring** | Metadata/embedding phim tạo ứng viên; sở thích và tương tác tạo profile; rank theo query, profile, ngữ cảnh và độ đa dạng. Có thể chạy từ catalog mới, chưa cần học từ đông người dùng. | Cần luật trọng số/decay/dedup và kiểm chất lượng; dễ bó hẹp vào nội dung tương tự. Embedding tổng quát không tự là model đã học gu xem phim của người dùng. |
| **B. Hybrid content + collaborative learning** | Bổ sung item-item/co-occurrence hoặc factorization khi đủ tương tác, khám phá quan hệ mà metadata thiếu; giữ A cho người/phim mới. | Cần dữ liệu thật có độ phủ, huấn luyện/version/rollback và đánh giá; sparsity, popularity/exposure bias và cold start. Không lấy seed demo làm bằng chứng học được hành vi thực. |
| **C. LLM làm ranker chính cho mỗi lượt** | Có thể hiểu yêu cầu diễn đạt dài và giải thích lựa chọn trong tập ứng viên. | Gửi catalog/profile vào prompt tăng dependency, quota và độ trễ; ID/giải thích có thể sai. LLM không sở hữu catalog/quyền và không thích hợp là đường bắt buộc của mọi lượt khám phá. |

Các nhãn A/B/C ở bảng này chỉ là phương pháp bên trong nghiên cứu, **không trùng nhãn C sản phẩm**
mà chủ dự án đang cân nhắc. [Content-based](https://developers.google.com/machine-learning/recommendation/content-based/basics),
[collaborative](https://developers.google.com/machine-learning/recommendation/collaborative/basics),
[candidate/scoring/reranking](https://developers.google.com/machine-learning/recommendation/overview/types).
[RankGPT](https://arxiv.org/abs/2304.09542) nghiên cứu LLM reranking retrieval, không chứng minh cá nhân hóa
phim tiếng Việt hoặc hiệu năng portfolio. Đánh đổi chi phí/khả dụng ở đây là suy luận thiết kế theo dependency.

**Đề xuất lộ trình cho hướng C sản phẩm:** bắt đầu A với nhiều nguồn ứng viên + scoring minh bạch,
đồng thời chuẩn bị pipeline đánh giá để bổ sung B khi có bằng chứng. LLM chỉ tùy chọn trích intent,
rerank top-K hữu hạn hoặc giải thích dựa metadata đã kiểm; khi LLM không dùng được, tìm/khám phá vẫn hoạt động.
Không bắt đầu bằng deep recommender/feature store/training cluster hoặc cài nhiều thư viện trước có dữ liệu.
Nếu sau này B có căn cứ, `implicit` là một ứng viên Python hỗ trợ ALS/BPR/item-item và CPU, MIT;
đó không phải quyết định chọn thư viện hoặc bảo đảm tương thích binary/NumPy/Python hiện tại.
[Nguồn implicit](https://github.com/benfred/implicit).

## Profile, tín hiệu và cold start đề xuất

- Nội dung phim có phiên bản: tên/tên khác, mô tả, thể loại, diễn viên/đạo diễn và metadata được phép dùng.
  Không nhúng giá/ghế đang thay đổi vào vector như nguồn có thẩm quyền hoặc đưa toàn lịch sử chat vào catalog.
- Có thể tạo profile vector bằng trung bình có trọng số của phim đã tương tác, cùng sở thích có cấu trúc.
  Đây là baseline kỹ thuật cần đo, không chốt weights/threshold/decay; giữ tách yếu tố ngắn hạn của phiên
  và gu dài hạn. Tránh profile zero/NaN khi chưa có dữ liệu hoặc khi xóa tín hiệu cuối cùng.
- Ratings/favorites/phản hồi chủ động khác với click. Lượt mua đã xác nhận là tín hiệu tin cậy về giao dịch,
  chưa chứng minh người mua thích phim, nhất là đặt cho nhóm. Đơn pending/hủy/hoàn phải diễn giải theo policy,
  không tự đổi hoàn tiền thành đánh giá tiêu cực. Không tăng điểm chỉ vì refresh/click/search lặp.
- Không tương tác không đồng nghĩa không thích; chưa có impression/exposure data thì không suy người dùng
  đã bỏ qua phim. Gợi ý cần độ đa dạng/exploration để tránh vòng lặp chỉ đề xuất cái đã phổ biến.
- Người mới: phim đã công bố/đang chiếu và ngữ cảnh rạp/ngày/bộ lọc người dùng cung cấp; chỉ gọi là phổ biến
  khi có số liệu phù hợp. Nếu dùng bộ phim biên tập, trình bày đúng là biên tập, không bịa kết quả cá nhân hóa.
- Hard filters (ví dụ rạp/ngày/ngôn ngữ/độ tuổi nếu feature áp dụng) phải được định nghĩa rõ; lọc trước
  hoặc sau retrieval phải kiểm đủ ứng viên, không để similarity/rerank bỏ điều kiện bắt buộc hoặc lộ phim ẩn.
  Hết ứng viên thì nói rõ và xin nới điều kiện, không tự đổi yêu cầu. Core kiểm hiện trạng trước booking.
- Khách chỉ có phiên: không tự fingerprint hoặc nối nhiều thiết bị. Đăng nhập/đổi tài khoản không tự merge
  guest history; account owner/session token và quyền gắn tương tác cần kiểm tại server, không tin userId từ client.

## Hai lựa chọn embedding khả thi

| Hướng | Khả năng / chi phí | Giới hạn cần kiểm |
|---|---|---|
| **Cloudflare Workers AI `@cf/baai/bge-m3`** | Managed API; upstream BGE-M3 multilingual, dense 1.024 chiều, MIT. Không cần chạy encoder trên host portfolio. | Dùng chung quota Workers AI với 120B; thêm provider dependency. Cloudflare catalog/schema hiện có điểm không khớp upstream, phải xác minh response dimension, input/max tokens và pooling/normalization trước pin. |
| **Local `intfloat/multilingual-e5-small` qua Sentence Transformers** | MIT, 384 chiều; model card mô tả max 512 tokens, prefix query/passage kể cả ngôn ngữ khác. Có đường inference CPU, không bắt GPU theo thiết kế thư viện. | Download/đóng gói weights, RAM/CPU/cold start/concurrency và vận hành; chưa đo cấu hình máy/latency. 512 tokens cần giới hạn/chunk metadata có chủ đích; không mặc định chất lượng Việt tương đương BGE-M3. |

[BGE-M3 model card](https://huggingface.co/BAAI/bge-m3) công bố hơn 100 ngôn ngữ, 8.192 tokens;
không lấy độ phủ multilingual làm bằng chứng chất lượng tìm phim tiếng Việt.
[Cloudflare model page](https://developers.cloudflare.com/workers-ai/models/bge-m3/) hiện ghi context 60.000,
ví dụ input `text`, nhưng [sync input schema](https://developers.cloudflare.com/workers-ai/models/bge-m3/sync-input.json)
lại yêu cầu `contexts`; [sync output](https://developers.cloudflare.com/workers-ai/models/bge-m3/sync-output.json)
lại chỉ có request_id. Nguồn chưa nhất quán; **không hứa 60k tokens hoặc coi 1.024 chiều là output Cloudflare đã đo**.
Đây là gate đối chiếu docs/endpoint trước triển khai, không phải bằng chứng API chắc chắn hỏng.
[E5 model card](https://huggingface.co/intfloat/multilingual-e5-small),
[Sentence Transformers inference](https://sbert.net/docs/sentence_transformer/usage/efficiency.html).

**Đề xuất ban đầu: ưu tiên đánh giá BGE-M3 managed trước**; sau đó Qwen3 được chọn tại ADR-0033,
BGE/local không là fallback đã duyệt. Lý do shortlist ban đầu là catalog/queries ngắn, tái dùng provider hiện có và chưa chọn
host để gánh local encoder; chỉ chốt sau làm rõ schema/capability và quality gate. E5-small local là phương án
đối chiếu khi cần độc lập quota/API và có số đo tài nguyên. Không chọn hai encoder làm failover tùy ý:
khác model/vector space/dimension thì query không tìm đúng index cũ dù resize cho cùng chiều.

## Quota, cập nhật catalog và chế độ suy giảm

- Bảng [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/) ghi BGE-M3
  1.075 neurons/M input tokens, giá làm tròn 0,012 USD/M; model page ghi 0,0118 USD/M.
  Một triệu input tokens tương đương 10,75% allocation 10.000 neurons/ngày nếu chưa có usage khác.
  Đây là quy đổi minh họa; free còn quota thì không là hóa đơn, vượt Free phải lỗi hoặc cần tier được duyệt.
- Embedding và GPT-OSS primary dùng chung allocation. [ADR-0028](../06-decisions/0028-groq-free-for-agent-provider-fallback.md)
  chọn Groq Free dự phòng chat, không cung cấp embedding cho index này và không tăng quota Cloudflare.
  Cần ngân sách/rate limit riêng cho catalog/query, ưu tiên interactive traffic, cache query không nhạy cảm
  có giới hạn, batch cập nhật và theo dõi neurons; không tự nâng gói hoặc gọi LLM mỗi impression.
- Catalog embedding là dữ liệu dẫn xuất: tạo/cập nhật bất đồng bộ từ thay đổi phim được commit qua
  outbox/CDC/Kafka đã chọn khi phù hợp; worker chống lặp theo movieId/contentVersion/modelVersion,
  giữ last-good index, xử lý tombstone/unpublish và chạy reindex có kiểm soát. Không buộc request sửa phim
  chờ model; công bố trạng thái index/lag thật, không tự mở một dịch vụ mới trong nghiên cứu này.
- Click/impression telemetry khác business-critical outbox. Có thể tái dùng eventing nhưng ingress,
  sampling/throttle/dedup/PII và cách gắn identity cần thiết kế; không mặc định ghi mọi click vào Core
  transaction/WAL. Purchase signal phải lấy từ trạng thái Core đã xác nhận, không tin event client báo mua.
- Query/doc cùng model revision, preprocessing, language/template, normalization và distance metric.
  Tách index namespace/version, re-embed rồi chuyển có kiểm tra; không trộn vector cũ/mới hoặc lấy text
  similarity làm điểm sở thích calibrated. Typesense đã chọn cho index lexical/vector tại ADR-0030;
  schema/dimension/model/version cụ thể vẫn cần đặc tả, không thêm kho giao dịch có thẩm quyền.
- Embedding/LLM/quota lỗi: lexical search, bộ lọc/catalog và scoring từ dữ liệu có sẵn vẫn phục vụ được;
  bỏ semantic branch có thông báo phù hợp, không gọi đó là semantic result mới hoặc tạo embedding giả.

## Dữ liệu cá nhân và bằng chứng cần có

BR-18/19 đã chốt bật/tắt/reset và không nhập hành vi guest khi login; chưa thêm xem/xóa từng tương tác ở bản đầu.
Retention raw/derived, guest expiry, xử lý dữ liệu cũ khi reset/bật lại, export/trace/log/cache và
chi tiết đổi tài khoản/đa thiết bị còn cần đặc tả theo OPEN-11.
Xóa signal phải xem xét rebuild/purge user vector/cache và chặn event/replay cũ tái tạo dữ liệu đã xóa;
không tự xóa chứng từ giao dịch hoặc đặt kỳ hạn pháp lý. Không auto-ingest chat hoặc gửi toàn profile/PII
đến model/provider; LangSmith cũng phải che dữ liệu theo policy riêng.

Đánh giá có baseline catalog/lexical, bộ query Việt có dấu/không dấu/tên phim/typo/intent mơ hồ,
và user/session cold/warm. Đo Recall/NDCG@K khi có nhãn phù hợp, coverage/diversity, latency p50/p95,
chi phí/neurons, lag/reindex, lỗi nguồn và tỷ lệ hard-filter violation (yêu cầu không vi phạm cần đặc tả).
Khi có interactions: tách train/test theo thời gian, chống leakage, so với popularity/content baseline;
synthetic accounts chỉ chứng minh đường pipeline, không chứng minh học đúng gu người thật hay uplift.
Chưa có số người/tương tác tối thiểu hoặc metric threshold được duyệt; chọn gate dựa coverage/độ tin cậy,
không bịa mốc người dùng rồi gọi là production-ready. Thử purge/replay, account switch, quota và stale index.

Context7: `/websites/developers_cloudflare_workers-ai`, `/huggingface/sentence-transformers`.
Chưa kiểm runtime, output Cloudflare, chất lượng Việt, model download hoặc tài nguyên local.

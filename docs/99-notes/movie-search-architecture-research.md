# Nền tảng tìm kiếm và khám phá phim có cá nhân hóa

Tra cứu nguồn chính thức và Context7 (`/websites/typesense`, `/websites/opensearch`) ngày **2026-11-17**.
**Phương án B — Typesense + PostgreSQL đã được chấp thuận tại [ADR-0030](../06-decisions/0030-typesense-for-movie-search-and-discovery.md).**
So sánh/đề xuất dưới đây giữ bối cảnh trước quyết định; ADR sở hữu lựa chọn hiện hành.
Phương pháp cá nhân hóa ban đầu được chọn tiếp tại
[ADR-0031](../06-decisions/0031-content-based-and-profile-scoring-for-personalization.md).
Provider/model embedding được chọn tiếp tại ADR-0032 và
[ADR-0033](../06-decisions/0033-qwen3-embedding-for-movie-retrieval.md): Cloudflare Qwen3 Embedding 0.6B.
Chưa chốt phạm vi nâng cấp đầy đủ hoặc công thức xếp hạng; chưa triển khai.
Đích: worktree `docs-tech-stack-decisions/movie-booking-agent`, detached HEAD `8fbada70fbde3fb9d049babc716a1af4b2de1d2a`.
Chỉ đọc/ghi ghi chú này; không cài, chạy benchmark/inference, tạo tài nguyên, sửa code/config/ADR hoặc commit.
## Nhu cầu hiện có và phần chưa được chọn

[PROJECT-OVERVIEW](../../PROJECT-OVERVIEW.md#open-questions) ghi chủ sản phẩm nghiêng về khám phá nâng cao/cá nhân hóa (C).
Đã xác nhận tín hiệu: sở thích khai báo, yêu thích, đánh giá, mua vé **đã xác nhận**, cùng detail views/click/search history;
không tự lấy toàn bộ hội thoại Agent. Guest chỉ theo phiên; tài khoản có hồ sơ lâu dài/xuyên thiết bị.
Người mới được khám phá ngay theo danh mục/ngữ cảnh rồi học dần, không bắt onboarding chọn sở thích.
Quyền bật/tắt và đặt lại dữ liệu đã học được chọn tiếp tại BR-40; BR-41 chọn không nhập hành vi guest
khi login, giữ hồ sơ tài khoản và học tiếp sau đăng nhập khi cá nhân hóa được bật; xem
[mô hình sản phẩm](../03-product/use-cases.md#4-quy-tắc-đã-thống-nhất).
BR-42 chọn tìm kiếm ưu tiên truy vấn/tên chính xác, cá nhân hóa giữa các kết quả phù hợp tương đương;
trang khám phá có thể cá nhân hóa mạnh hơn, vẫn giữ bộ lọc.
Retention, thời hạn phiên khách, xử lý tín hiệu cũ khi đặt lại/bật lại và công thức/ngưỡng thứ hạng còn mở.
Các mục phân tích phía dưới giữ bối cảnh nghiên cứu trước những quyết định này.
Mục Out of Scope ở thời điểm nghiên cứu ban đầu cần hòa giải; mô hình hiện hành đã phân biệt
content/profile scoring được chọn với collaborative training ngoài bản đầu. Note không tự thay phạm vi sản phẩm.
[D-01](../03-product/use-case-descriptions.md) vẫn là public discovery,
không bảo đảm ghế trống. Code BFF `catalog-adapter.ts` hiện lọc fixture bằng lowercase substring title/slug và các bộ lọc;
chưa có tiếng Việt nâng cao, semantic retrieval, user profile hoặc recommendation runtime được kiểm chứng.
[ADR-0003](../06-decisions/0003-postgresql-and-redis-for-platform-data.md) ban đầu **chưa thêm search store độc lập**;
ADR-0030 sau đó bổ sung Typesense. A cũng chưa được cấp quyền cài extension chỉ từ khả năng PostgreSQL.

## Ba kiến trúc đầy đủ, đều giữ PostgreSQL/Core làm thẩm quyền

| Hướng | Retrieval + cá nhân hóa | Điểm khớp / đánh đổi |
|---|---|---|
| **A. PostgreSQL FTS + pg_trgm + unaccent + pgvector** | Nhánh lexical và vector trong PostgreSQL; application hợp nhất/rerank theo profile; join/filter dữ liệu quan hệ. | Hoàn toàn khả thi/hiện đại, giữ filter lịch chiếu gần dữ liệu gốc. Phải tự tune typo/prefix/facets/fusion và cách ly tải search/ANN khỏi transaction. Không mặc định SQL yếu hoặc đủ mọi tải. |
| **B. Typesense OSS + PostgreSQL + app reranker** | Index lexical/vector dẫn xuất, typo/prefix/facets/hybrid có sẵn; app sở hữu profile/signals, generation và rerank. | Khớp search-as-you-type/danh mục phim, không phải tự ghép toàn bộ pipeline retrieval. Có thêm data projection, RAM index, lag/rebuild/delete và quyền riêng cần quản lý. Không tự là hệ gợi ý hoàn chỉnh. |
| **C. OpenSearch + PostgreSQL + app reranker** | BM25/analyzers + k-NN/hybrid search pipeline, app personalization và Core hydration/filter. | Nhiều khả năng kiểm soát analyzer/query/scoring/scale search độc lập. Cần quản JVM/Lucene/native vector memory, mappings/shards/segments/plugins và pipeline; giá trị đến từ nhu cầu kiểm soát, không từ số node. |

Không đánh đồng retrieval theo query, danh mục không query và gợi ý cá nhân: cùng kho phim có thể phục vụ ba luồng,
nhưng hàm mục tiêu/candidate set khác. Cả ba cần application layer; không mua search product rồi mặc định có recommender đúng nghiệp vụ.

## A — PostgreSQL là phương án đủ chức năng, không chỉ bước tạm

FTS có tsvector/tsquery, weighting và ranking; query prefix có cơ chế riêng, không phải mọi input chuỗi đều là tsquery hợp lệ.
[PostgreSQL text search](https://www.postgresql.org/docs/current/textsearch-controls.html).
`pg_trgm` cung cấp similarity/word similarity và index cho tìm gần đúng; `unaccent` dùng rules để bỏ dấu/thay chuỗi.
[pg_trgm](https://www.postgresql.org/docs/current/pgtrgm.html), [unaccent](https://www.postgresql.org/docs/current/unaccent.html).
Phải chọn text-search configuration/tokenization tiếng Việt qua đánh giá; không lấy cấu hình English làm bằng chứng chất lượng Việt.
FTS rank không tự là BM25; có thể fusion lexical/vector ở app/SQL, nhưng công thức/weights chưa chọn.
`pgvector` có exact nearest-neighbor và ANN HNSW/IVFFlat. Filter sau ANN có thể trả thiếu top-k;
iterative scans (từ 0.8.0) quét thêm nhưng vẫn có giới hạn scan/memory. Exact search trên tập lọc nhỏ là đối chứng hợp lệ.
[pgvector filtering/iterative scans](https://github.com/pgvector/pgvector#filtering).
Không gắn HNSW cho mọi corpus; cần plan/explain, recall so với exact, rebuild/vacuum và isolation ngân sách tài nguyên.
Lợi thế thực là join/transactional filtering; chi phí thực là thêm chỉ mục/compute trên hệ PG và tự sở hữu relevance code.

## B — Typesense khớp tìm danh mục tương tác

Typesense có typo tolerance, field ranking, prefix/facets; hybrid kết hợp nhánh keyword và vector bằng **Rank Fusion**,
có `alpha` điều chỉnh. Có thể đưa vectors tạo bên ngoài vào để không buộc dùng auto-embedding/model của Typesense.
[Typesense features](https://github.com/typesense/typesense#features), [Vector Search 30.2](https://typesense.org/docs/30.2/api/vector-search.html).
Không tự gọi công thức Typesense là RRF; RRF là lựa chọn khác có thể thử ở app/OpenSearch. Chưa chọn weight/cách fusion.
`rerank_hybrid_matches` tính thêm scores, không đồng nghĩa rerank theo sở thích. Personalization guide cho phép mang
embedding hành vi của user/model bên ngoài vào rerank; dự án vẫn phải xây profile và kiểm relevance.
[Typesense personalization](https://typesense.org/docs/guide/personalization.html).
Filter/vector có HNSW parameters, `k`, distance threshold và flat-search cutoff; candidate budget/filter placement
phải đo theo version và độ chọn lọc, không coi “có filter_by” là chứng minh ANN luôn đủ phim phù hợp.
[Vector parameters](https://typesense.org/docs/30.2/api/vector-search.html#vector-search-parameters).
Các phép tính join của engine nếu dùng vẫn không thay Core kiểm lịch/giá/ghế; không nhân từng user thành bản sao catalogue.

## C — OpenSearch khi cần kiểm soát phân tích/xếp hạng sâu

OpenSearch mặc định dùng BM25 cho keyword; hỗ trợ cấu hình analyzer và các query chuyên biệt.
[Keyword search](https://docs.opensearch.org/latest/search-plugins/keyword-search/).
Hybrid pipeline có score normalization/combination hoặc score-ranker RRF; phải đánh giá trên corpus/query judgments,
không suy hybrid mặc định luôn tốt hơn exact-title hoặc lexical. [Hybrid search](https://docs.opensearch.org/latest/vector-search/ai-search/hybrid-search/index/).
`analysis-icu` bổ sung Unicode normalization/tokenization/folding; khả năng này không chứng minh phân đoạn/ý nghĩa Việt đạt yêu cầu.
[ICU analyzer](https://docs.opensearch.org/latest/analyzers/language-analyzers/icu/).
Efficient vector filters nằm trong k-NN và phụ thuộc engine/version; post-filter có thể thiếu k, prefiltered exact có thể chậm.
[OpenSearch filtered k-NN](https://docs.opensearch.org/latest/vector-search/filter-search-knn/index/).
Chưa chọn Lucene/Faiss, plugin model, quantization, shards/replicas hoặc học-to-rank; không bắt đầu bằng toàn bộ hệ ML.
C đáng chọn nếu cần analyzer/scoring tùy biến mà A/B không đạt qua thử nghiệm, hoặc có workload nhiều chỉ mục/phân tán đã xác định.

## Tiếng Việt và relevance: cần dữ liệu chứng minh

Giữ bản gốc để hiển thị; khảo sát trường normalized/folded và alias (tên Việt, tên gốc, tên phát hành) riêng cho retrieval.
Phải thống nhất Unicode NFC/NFD và quy tắc `d/đ`, dấu thanh, hoa/thường; bỏ dấu không được làm mất tên gốc.
`unaccent` phụ thuộc rules; OpenSearch có folding/ICU; không giả định ba engine tạo cùng token hoặc relevance.
Typesense công bố `locale: vi` qua ICU; non-English locale giữ dấu, khác default English folding.
Do đó cần thử trường tiếng Việt có dấu và trường folded phù hợp, không hứa locale vi tự khớp mọi truy vấn không dấu.
[Typesense locale guide](https://typesense.org/docs/guide/locale.html).
Test tên chính xác/alias, prefix ngắn, lỗi gõ/đảo chữ, không dấu, `d/đ`, emoji/punctuation và tên nhiều ngôn ngữ.
Ví dụ đánh giá: “Đất rừng phương Nam”/“dat rung phuong nam”, “phim du hành thời gian nhẹ nhàng”, tên sequel số tương tự.
Đề xuất ưu tiên exact-title sau đó được chốt tại BR-42: truy vấn/tên/alias chính xác đứng trước,
cá nhân hóa giữa kết quả phù hợp tương đương; công thức/ngưỡng tương đương vẫn cần đặc tả.
Không dùng semantic similarity để bịa metadata/độ tuổi hoặc tự nới cinema/date/time mà khách đã chọn.

## Lịch chiếu, quyền và chỉ mục dẫn xuất

Cinema/date/time/format phải cùng khớp **một suất phù hợp**: mảng cinema và date độc lập trong movie document có thể tạo match giả.
A có thể join/EXISTS; B/C cần projection giữ quan hệ showtime hoặc lọc/hydrate từ Core trước trả kết quả cuối.
Lọc lại sau top-k có thể thiếu trang và làm facets/count sai: thiết kế candidate expansion/pagination và semantics của facets,
không chỉ bỏ vài item sai rồi tuyên bố kết quả đầy đủ. Tính fresh và ngưỡng lag chấp nhận cần được duyệt.
Giá/khả dụng ghế/hold TTL không được xác nhận chỉ từ index. Đọc showtime không đảm bảo giữ được ghế; Core quyết định lúc giao dịch.
B/C cập nhật projection từ [outbox → Debezium → Kafka](../06-decisions/0007-transactional-outbox-debezium-kafka.md) đã chọn,
consumer kiểm event ID/entity revision, chống lặp/đảo thứ tự và xử lý update/delete/unpublish/đổi scope rạp.
Snapshot backfill + replay watermark, rebuild sang index mới/swap alias, reconciliation và deletion phải có kế hoạch;
replay Kafka không tự là backup vĩnh viễn. A cũng cần version/lifecycle cho embeddings/derived search columns nếu tạo.
Không để index cũ lộ phim chưa công bố/nội dung ngoài quyền; Core/service sở hữu kiểm visibility trước output.
Admin/index keys không ra client; endpoint search không nhận account ID hoặc filter quyền do client tự khai là tin cậy.
Search outage/embedding lỗi phải có hành vi suy giảm rõ, không bịa catalogue hoặc replay lệnh giữ ghế/thanh toán.
Owner search được chọn tiếp tại [ADR-0035](../06-decisions/0035-search-module-in-cinema-core.md):
module Search trong Core, BullMQ indexing nền; Agent dùng API Core. Cấu trúc module/worker và
quyền đọc PG cụ thể vẫn cần đặc tả; không cho mọi service đọc/ghi bảng của nhau.

## Cá nhân hóa là lớp ứng dụng có vòng đời riêng

Tách profile/signal store khỏi public search document; xác thực user/session, dedup sự kiện và kiểm mua vé qua nguồn Core.
Click/detail/search là tín hiệu yếu có position bias/bot; rating có ý nghĩa khác favorite, không suy mọi tương tác là yêu thích.
Có thể bắt đầu content/feature-based reranking theo hồ sơ đã xác nhận và context rồi đánh giá embedding/model hành vi;
đó là shortlist thuật toán, chưa chọn trọng số, decay, negative signals, collaborative filtering hoặc deep learning.
Guest theo phiên; account lâu dài/xuyên thiết bị; cold start catalogue/context, không tự thêm onboarding sở thích.
Mỗi user có profile/context khác không bảo đảm mọi lần ra danh sách khác; cần tiêu chí chất lượng/diversity thay “có vector”.
Cache key phải bao gồm scope identity/context/filter phù hợp; không dùng cache cá nhân A trả cho B.
BR-40/19 đã chọn bật/tắt/reset và không nhập guest history khi login; không thêm xem/xóa từng tương tác ở bản đầu.
Retention, thời hạn phiên và xử lý dữ liệu cũ khi reset/bật lại giữ OPEN-11; note không tự đặt quyền mới.
Quy tắc xóa phải lan tới raw events/profile/vector/index/cache khi áp dụng; không tự nhập chat hoặc gửi lịch sử mua thô ra model ngoài.
Freetext search có thể chứa dữ liệu cá nhân: provider/data-sharing cho query embedding cần xem xét khi chọn model và chính sách.

## Model, tài nguyên, license và chi phí

Provider/model đã chọn Cloudflare/Qwen3 tại ADR-0032/0033, backend external vectors tại ADR-0034.
Dimensions, distance metric, preprocessing và công thức rerank cần đặc tả/kiểm chứng; model chat không thay encoder này.
Đánh giá multilingual/Vietnamese quality, license/data rights, batch/query latency, hạn mức và chi phí; không hứa miễn phí inference.
Ghi model/version/dimension/preprocess vào vector; đổi model có thể cần re-embed/reindex, không trộn vectors khác không gian.
Vector storage/index memory tăng theo số documents × dimensions, copies và cấu trúc ANN; indexing/rebuild cũng dùng CPU/IO.
Typesense giữ search index trong RAM và raw docs trên disk; built-in embedding tăng RAM/CPU, external embeddings chuyển chi phí
sang nơi tạo vector. [Typesense sizing concepts](https://typesense.org/docs/guide/system-requirements.html).
A tranh tài nguyên với PostgreSQL trừ khi thiết kế cách ly; C cần theo dõi JVM heap, native ANN/cache và segments/disk/network.
Không đưa RAM tối thiểu giả, giá máy hoặc QPS marketing vào cam kết dự án. Hosting/topology tiết kiệm đã hoãn tới deploy.
PostgreSQL và supplied extensions dùng [PostgreSQL License](https://www.postgresql.org/about/licence/);
pgvector cũng [PostgreSQL License](https://github.com/pgvector/pgvector/blob/master/LICENSE), **không gọi chung là MIT**.
Typesense server [GPL-3.0](https://github.com/typesense/typesense/blob/v31/LICENSE.txt); cần review nghĩa vụ khi phân phối/chỉnh sửa,
không suy mọi phần app tự đổi license từ việc gọi API. Cloud managed là dịch vụ riêng; chưa chọn Cloud hoặc điều khoản thương mại khác.
OpenSearch [Apache-2.0](https://github.com/opensearch-project/OpenSearch/blob/main/LICENSE.txt); managed offerings/plugins/models có điều khoản riêng.
OSS không buộc mua SaaS nhưng RAM/disk/backup/replicas, pipeline/embedding/rebuild và vận hành không bằng 0.

## Đề xuất để chủ sản phẩm quyết định

**Ưu tiên B — Typesense OSS làm index lexical/vector dẫn xuất, PostgreSQL/Core authoritative, personalization ở application.**
Căn cứ là workload catalogue tương tác: typo/prefix/facets/hybrid có sẵn, bớt tự viết retrieval plumbing,
vẫn có đường kiểm riêng profile/rerank. Không chọn B chỉ để có thêm DB hoặc khẳng định nhanh hơn A/C.
Đổi từ ADR-0003 cần duyệt rõ index mới; phạm vi embedding/rerank/privacy và resource sizing còn các vòng riêng.
A là lựa chọn hoàn chỉnh nếu corpus/filter joins hoặc yêu cầu nhất quán khiến PG đạt mục tiêu tốt hơn; không phải fallback kém hiện đại.
C đáng ưu tiên nếu cần analyzer/BM25/scoring chuyên sâu hoặc scaling profile đã đo mà B không đáp ứng.
Không cài cả ba; nếu thử so sánh sau này, giữ cùng corpus/query/model/filter/điều kiện máy và quyền dữ liệu.

## Bằng chứng cần có trước implementation acceptance

- Corpus thật được phép dùng: số phim/aliases/ngôn ngữ, mô tả, suất chiếu và tần suất sửa/xóa; không lấy fixture nhỏ làm tải thực.
- Query set có nhãn: exact/alias/typo/prefix/no-accent/semantic, không kết quả và filters hiếm; Recall@k/MRR/nDCG phù hợp từng luồng.
- So lexical-only/vector-only/hybrid và personalization với cold/warm users; exact-title regressions, diversity và tránh popularity bias.
- ANN recall so exact baseline, k/filter selectivity, facets/pagination đủ/ngữ nghĩa; p50/p95 gồm query embedding + Core hydration/rerank.
- CPU/RAM/disk/network, indexing/rebuild dưới tải, lag/delete/unpublish recovery và ảnh hưởng tới hold/payment Core.
- Quyền tài khoản/rạp/guest-session, cache isolation, deletion/retention theo chính sách được chốt; minh bạch dữ liệu gửi model.
Chưa chạy corpus, truy vấn engine, inference hoặc benchmark; chưa có kết luận chất lượng Việt, năng lực tải hay production readiness.

# SUNNY MOUSE – thông tin nguồn và bản web thử nghiệm

## Phạm vi hiện tại
- Thêm trò **Sunny Mouse** vào Sunny Game Hub, chạy bằng HTML/CSS/JavaScript trên máy tính và điện thoại.
- 5 hoạt động chơi được: (1) rê chuột theo ngôi sao, (2) nhấp bắt cá, (3) rê/vuốt mở tranh, (4) nối điểm, (5) khoanh tròn hình đúng theo giọng đọc.
- Mỗi hoạt động có 26 màn; tổng cộng 130 màn; hiển thị tiếng Việt, có âm thanh, lưu màn trên từng trình duyệt bằng `localStorage`.
- **Đây là mã chuyển thể web cho các hoạt động đã chọn, KHÔNG phải bản biên dịch đầy đủ GCompris Qt**. Hành vi có thể khác bản gốc.
- Phần mềm GCompris đầy đủ vẫn ở bộ mã nguồn gốc; không có tệp nào trong đó bị chỉnh sửa hoặc xoá.

## Tính toàn vẹn tài nguyên
Nguồn chính: https://github.com/gcompris/GCompris-qt

Snapshot nguồn cố định: `e261a949a9965f14d3c642b2698b43042f338357` (17/10/2026).

Tệp gốc được lưu theo đúng cây thư mục dưới `upstream/src/` và `upstream/LICENSES/`. Các file hình ảnh, âm thanh được sao chép thông qua Git blob ở dạng base64; quá trình chép có kiểm tra SHA Git của nguồn và đích **trùng nhau**. Không nén lại, không chuyển WebP/SVG/WAV, không vẽ thay ảnh. Các mã QML/JS gốc được để lại làm tư liệu, bản web có mã mới trong `index.html`.

Các game chưa được chuyển sang web và các hình ảnh/âm thanh chưa được dùng trong bản thử nghiệm này **chưa được nhập vào Sunny Hub**; vẫn có đầy đủ tại kho GCompris gốc và file ZIP do chủ dự án cung cấp.

## Giấy phép và ghi nhận tác giả
GCompris được phân phối theo **AGPL-3.0**, một số tệp thành phần và tư liệu có giấy phép riêng. Mã nguồn, chú thích bản quyền và nội dung tài nguyên gốc thuộc các tác giả/đơn vị GCompris và những người đóng góp.

- Xem giấy phép và thông tin bản quyền từng thành phần tại https://github.com/gcompris/GCompris-qt/tree/e261a949a9965f14d3c642b2698b43042f338357/LICENSES
- Xem cấu hình nhận diện giấy phép ở https://github.com/gcompris/GCompris-qt/blob/e261a949a9965f14d3c642b2698b43042f338357/REUSE.toml
- Một số nội dung giấy phép và mã nguồn hoạt động được bảo tồn nguyên văn trong thư mục `upstream/`.

Khi chia sẻ hoặc công bố bản web này, phải giữ ghi nhận và đáp ứng các nghĩa vụ giấy phép liên quan. Không được coi toàn bộ ảnh/âm thanh GCompris là tài nguyên không bản quyền.

## Sử dụng
Mở `games/sunny-mouse/index.html` từ Sunny Hub trên GitHub Pages. Các file ảnh/âm thanh được tải từ **repo Sunny Fruits** (không phải từ máy chủ GCompris lúc chơi).

**Lưu ý**: Web game không tự đồng bộ tiến độ từ máy tính sang điện thoại. Trò khoanh tròn đọc tiếng Anh bằng Web Speech API, nên chất lượng giọng phụ thuộc trình duyệt và bộ giọng trên thiết bị.

## Cập nhật 18/10/2026 — 26 màn cho mỗi hoạt động
- Tổng 130 màn (5 × 26), tăng nhẹ số mục tiêu/kích thước/tốc độ theo từng màn.
- **Nối điểm:** Dữ liệu gốc cố ý lặp tọa độ đầu ở cuối để khép nét. Lớp hiển thị web loại bản sao cuối **chỉ khi tạo nút đánh số**, nên không còn che số 1. Số kế tiếp tô vàng; nhấp toàn bộ SVG và chỉ xác nhận đúng tọa độ đang cần, giúp tránh chồng mục tiêu trên điện thoại.
- Khám phá ảnh: số ô che tăng theo bước nhỏ, không đổi ảnh/âm thanh gốc.
- Bắt cá: thêm cá từng hai cấp và tăng vận tốc nhẹ. Rê chuột: số sao tăng từng ba cấp.
- Khoanh tròn: bắt đầu hai hình lớn, lên ba hình và sau đó bốn hình, mức kiểm tra đường bao tăng dần.
- Trình tự kiểm thử có tại `tests.html` (chạy trên cùng domain GitHub Pages để truy cập iframe). Dữ liệu gốc trong thư mục `upstream/` không chỉnh sửa.

## Cập nhật 18/10/2026 – 26 ảnh nền mới và chế độ không âm thanh
- 26 ảnh tự tạo bổ sung riêng cho mục **Khám phá** ở `assets/animals/animal01.webp` đến `animal26.webp` (mỗi màn một con vật khác nhau).
- Ảnh tải trực tiếp từ repo Sunny Fruits ở dạng WebP 1152 × 768, tổng dung lượng khoảng 2,8 MB.
- Đã tắt **mọi âm thanh hiệu ứng và giọng đọc** trong Sunny Mouse; các nút âm thanh/nghe hướng dẫn được ẩn.
- Nguồn hình/âm thanh GCompris ở `upstream/` **giữ nguyên**; trò Khám phá vẫn có hình dự phòng cũ nếu tải ảnh mới bị lỗi.
- Theo thứ tự 26 màn: hươu cao cổ, ngựa, ong, mèo, chim cánh cụt, gấu trúc đỏ, cá heo, bướm, alpaca, bê, sư tử, thỏ, ngựa vằn, hổ, gấu trúc, koala, cú, voi, cáo, khỉ, hươu con, sóc, hải cẩu, gấu Bắc Cực, hồng hạc, hà mã.

## Bắt cá — thêm 24 màn từ 27 đến 50 (18/10/2026)
- **26 màn gốc** vẫn dùng hàm `startFish()` cũ và đầy đủ ảnh/âm thanh nguồn GCompris (âm thanh được vô hiệu theo yêu cầu trước).
- Tạo **24 màn nâng cao**, chạy bằng lớp JavaScript độc lập `fish-challenge.js`, giới hạn riêng 50 màn cho Bắt cá; bốn trò khác vẫn giới hạn 26 màn.
- Màn **27–40**: 18–27 con cá cần bắt; cá rộng khoảng 57–40 px, tốc độ cơ bản từ 130–247 px/giây, thời gian 130–87 giây; độ khó tăng qua tốc độ, kích thước, lượn sóng và một số màn né chuột.
- Màn **41–50**: thử thách người lớn, 28–46 con, kích thước 38–29 px, tốc độ 260–431 px/giây, giới hạn 80–51,2 giây. Cá lượn, né con trỏ và tăng tốc ngắn; nhấp hụt trừ thời gian. Không dùng tàng hình hoặc dịch chuyển tức thời. Chỉ có khoảng 7–11 con xuất hiện đồng thời; bắt được thì cá mới xuất hiện đến đủ tổng số.
- Ở thiết bị cảm ứng, mức cao có vùng chạm tối thiểu 33 px, tốc độ giảm khoảng 23% và thời gian dài hơn khoảng 24% để tránh vượt quá khả năng điều khiển của màn hình nhỏ. Nhóm cuối vẫn khó.
- Khi thắng, game mở nút sang màn kế; khi hết giờ, hiện thông báo và nút thử lại. Tiến độ được giữ ở khóa cũ `sunny_mouse_v1` trong `localStorage`.
- Tận dụng nguyên bản 15 tệp ảnh cá và 6 nền biển đã sao chép từ GCompris; không dùng hình, âm thanh mới, không gọi API.
- **Kiểm thử tự động:** 24 cấu hình khó dần; đủ 21/21 ảnh cục bộ; mô phỏng bắt hết cá ở màn 27/40/41/50; thử hết giờ ở màn 50; kiểm tra không còn vòng lặp khung hình hoặc sự kiện sau khi thoát màn; kiểm tra cú pháp JavaScript. Chưa kiểm thử tương tác thực tế bằng Chrome/Safari.

## Điều chỉnh thời gian Bắt cá — 18/10/2026
- Màn 1–26 không có đồng hồ đếm ngược, vẫn không giới hạn thời gian.
- Tất cả 24 màn có đếm ngược (27–50) **tăng thời gian lên 200% so với trước**, trên cả máy tính và điện thoại. Quy tắc thiết bị di động vẫn giữ nguyên rồi mới nhân đôi.
- Ví dụ trên máy tính: màn 27 từ 130 lên 260 giây; màn 50 từ 51,2 lên 102,4 giây. Trên điện thoại, màn 50 từ 63 lên 126 giây.
- Không điều chỉnh số cá, kích thước, vận tốc, cơ chế né chuột, phạt nhấp hụt hay dữ liệu tiến độ. Đã kiểm tra 48 cấu hình thời gian (24 màn × 2 loại thiết bị) và tất cả đạt.

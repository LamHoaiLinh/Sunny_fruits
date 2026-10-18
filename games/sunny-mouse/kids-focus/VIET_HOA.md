# Kids Focus Camp — phiên bản tích hợp Sunny Mouse

**Nguồn gốc:** [juntiy/kids-focus](https://github.com/juntiy/kids-focus)  
**Giấy phép:** [MIT](LICENSE), Copyright © 2026 juntiy.

## Phạm vi tích hợp
- Đầy đủ **6 mini game** gốc: tìm điểm khác nhau, phân biệt màu, mê cung, nhảy vật cản, đường đi an toàn, bảng số Schulte.
- Toàn bộ các tệp `js/games/*.js`, `css/style.css`, `js/main.js`, `js/ai.js`, `js/sound.js`, `js/storage.js`, `js/touch.js` và hình gốc được giữ nguyên.
- **Tệp được điều chỉnh:** `index.html` bổ sung đường về Sunny Mouse và kích hoạt lớp Việt hóa; **tệp thêm mới:** `js/vi.js` chỉ thay đổi văn bản hiển thị và chữ trên canvas.
- Không điều chỉnh thuật toán, mức độ khó, điểm thưởng, bộ hình hay điều khiển chuột/cảm ứng.
- Mã nguồn hoạt động hoàn toàn độc lập trong thư mục này; có thể bật qua mục số 6 trên trang Sunny Mouse.
- Tiến độ lưu trong trình duyệt. Chức năng tạo ảnh bằng AI từ Pollinations.ai có thể cần mạng và phụ thuộc dịch vụ của bên thứ ba.

## Chú ý
- Âm thanh của **bộ trò chơi Kids Focus** được giữ nguyên theo nguồn gốc; các game Sunny Mouse cũ vẫn tắt âm thanh như trước.
- Thông báo tiếng Việt hiển thị qua `MutationObserver`, không thay đổi luật chơi; nội dung hướng dẫn tạo ảnh ở nguồn gốc được giữ nguyên khi gửi dịch vụ AI.
- Các ảnh QR của tác giả giữ nguyên tệp như trong bản gốc nhưng không đưa thành quảng cáo trong giao diện Sunny Mouse.

## Mở rộng màn luyện chuột (18/10/2026)
- **Mê cung:** giữ nguyên 4 màn cũ, thêm 20 màn (tổng 24). Ma trận tăng dần đến 18×18; sinh mê cung ngẫu nhiên theo thuật toán gốc, không thay đổi vật lý bóng và cách kéo.
- **Đường đi an toàn:** giữ nguyên 6 màn cũ, thêm 20 màn (tổng 26) với các đường cong không tự cắt, tăng độ uốn từ từ. Độ rộng tối thiểu 50, số tia điện tối đa 5; cơ chế trạm an toàn, tính sao và chọn màn vẫn giữ nguyên.
- Đã sửa lỗi hiệu năng có sẵn ở Đường đi an toàn: mỗi lần chỉ có một chuỗi `requestAnimationFrame` để tránh giật hoặc tăng tải CPU.
- Kiểm tra bằng mã: 72 lần sinh mê cung thông suốt, toàn bộ 26 tuyến đường nằm trong khung chơi và dữ liệu JS hợp lệ. **Chưa kiểm thử thao tác thực tế trên các thiết bị.**

## Sửa lỗi tia điện chặn đường — 18/10/2026
- 22/26 màn có tia điện. Trước đây biên độ của tia chỉ bằng 26% độ rộng lối đi (khoảng 13–25 đơn vị), thấp hơn tổng bán kính va chạm 27 đơn vị nên tia điện có thể chặn hoàn toàn đường đi.
- Mỗi tia hiện di chuyển ngang tối thiểu **90 đơn vị**, tốc độ dao động **0,68–0,88 rad/giây**, bắt đầu ở vị trí ngoài lối đi. Ngay cả ở vận tốc cao nhất, khoảng thời gian tia điện rời trục đi (dư thêm 5 đơn vị) tối thiểu khoảng **2,74 giây**.
- Trạm an toàn bảo vệ khi nhân vật đứng sát tâm trạm; sau khi bị điện giật, nhân vật có **1,4 giây** miễn va chạm điện để rời trạm, không bị giật liên tiếp.
- Kiểm tra mã nguồn bằng **1.068 kịch bản** phát sinh vị trí, vận tốc và pha ngẫu nhiên của nhiều tia trên cả 26 tuyến. Khoảng trống an toàn ngắn nhất đo được **2,77 giây** trong các kịch bản thử; không có trường hợp nào dưới 2 giây.
- Không đổi ảnh, luật tính sao, số màn hoặc hình dáng tuyến đường. Chưa có kiểm thử tương tác trực tiếp trên thiết bị thực.

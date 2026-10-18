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

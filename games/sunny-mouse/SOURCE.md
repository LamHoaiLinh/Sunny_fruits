# SUNNY MOUSE – thông tin nguồn và bản web thử nghiệm

## Phạm vi hiện tại
- Thêm trò **Sunny Mouse** vào Sunny Game Hub, chạy bằng HTML/CSS/JavaScript trên máy tính và điện thoại.
- 5 hoạt động chơi được: (1) rê chuột theo ngôi sao, (2) nhấp bắt cá, (3) rê/vuốt mở tranh, (4) nối điểm, (5) khoanh tròn hình đúng theo giọng đọc.
- Mỗi hoạt động có 6 mức; hiển thị tiếng Việt, có âm thanh, lưu màn trên từng trình duyệt bằng `localStorage`.
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

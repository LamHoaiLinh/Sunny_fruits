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

## Lộ trình 46 màn Đường đi an toàn (18/10/2026)
- Từ 26 lên **46 màn**, thêm 20 đường mềm mới, giữ lại 26 đường gốc. Sắp xếp theo thứ tự tăng độ khó.
- Chia sáu nhóm: **8 màn không tia điện; 7 màn có 1 tia; 7 màn có 2 tia; 9 màn có 3 tia; 7 màn có 4 tia; 8 màn có 5 tia**. Đường và chiều rộng được điều chỉnh cho trẻ nhỏ.
- **Chỉ mở màn N+1 sau khi thắng màn N**. Nút màn khóa bị vô hiệu; khi thắng xuất hiện nút chuyển sang màn kế tiếp.
- Dữ liệu sao cũ (`kids-shock-levels`) được chuyển sang `kids-shock-levels-v2` theo mã gốc ổn định cho từng tuyến. Sao đã đạt vẫn thuộc đúng tuyến cũ sau khi sắp xếp; thứ tự mở khóa áp dụng theo lộ trình mới.
- Giữ cơ chế tia điện dao động rộng để tạo khoảng vượt, trạm an toàn, hồi phục 1,4 giây sau va chạm, tính sao và hình vẽ gốc.
- Kiểm tra tự động đã bao gồm cú pháp JavaScript, 46 cấp không trùng ID, 20 tuyến mới nằm trong khung vẽ, chuỗi 45 lần mở màn liên tiếp và chuyển thành tích cũ. Chưa xác minh trò chơi thực tế trên từng thiết bị.

## 5 màn Tìm điểm khác nhau có sẵn — 18/10/2026
- Trò **Tìm điểm khác nhau** có nút **“5 màn có sẵn · Chơi ngay”**. Không cần tạo AI, tải ảnh hay kết nối mạng bổ sung.
- 5 tranh SVG nguyên bản do Sunny Mouse tạo theo chủ đề: Vườn hoa của thỏ (2 khác biệt), Bãi biển vui vẻ (3), Nông trại đáng yêu (3), Rừng xanh kỳ diệu (4), Du hành vũ trụ (5).
- Mỗi tranh gồm **hai hình A/B khác nhau tại các đối tượng có tọa độ đáp án cố định**. Giữ nguyên cơ chế nhấp/khoanh, gợi ý và chấm kết quả của game Kids Focus; số đáp án thay đổi theo từng màn.
- Khóa màn tiếp theo cho tới khi hoàn thành màn trước; ghi nhớ thành tích cục bộ qua `localStorage` (`sunny_spot_presets_v1`). Có nút chơi lại, chọn màn hoặc sang màn tiếp theo.
- Tệp hình và đáp án: `js/games/spot-presets.js`; mục Tìm điểm khác nhau gốc (ảnh tải lên, bộ sưu tập và AI) vẫn hoạt động. Tất cả tranh SVG được đóng gói trực tiếp, không cần tải từ nguồn ngoài.
- Đã kiểm tra cú pháp JS, SVG A/B không trùng nhau, 5 danh sách đáp án, vị trí đáp án trong tranh không chồng lên nhau và tiến độ mở khóa đủ 5 màn. **Chưa kiểm thử trực tiếp trên trình duyệt Windows/iOS.**

## Mở rộng Tìm điểm khác nhau thành 55 màn (18/10/2026)
- Giữ nguyên **5 màn đầu tiên**, kể cả hình SVG, đáp án và ID dùng để lưu tiến độ.
- Bổ sung **50 màn** có **50 tên cảnh khác nhau**, chia theo 10 chủ đề luân phiên: vườn cổ tích, đại dương, thành phố, nông trại, không gian, tuyết, khu vui chơi, động vật, đảo nhiệt đới và khám phá kỳ diệu.
- Mỗi màn có **hai hình SVG riêng A/B** vẽ tại chỗ, các thay đổi nằm tại vị trí đồ vật xác định sẵn; không dùng AI hoặc ảnh từ máy chủ ngoài.
- Độ khó của 50 màn tăng theo **5 nhóm, mỗi nhóm 10 màn**: 5 → 6 → 7 → 8 → 9 điểm khác nhau, đồng thời vùng nhận biết giảm từ bán kính 35 xuống 29 đơn vị, số vật trang trí tăng nhẹ.
- Tổng có **55 màn** và 367 vị trí khác biệt (17 từ 5 màn ban đầu + 350 từ 50 màn mới).
- **Khóa tuần tự**: chỉ chơi được màn 1 và những màn đã thắng; thắng màn N sẽ mở N+1. Giữ nguyên khóa `sunny_spot_presets_v1` trong `localStorage`, không làm mất 5 màn đã hoàn thành.
- Màn chọn cấp chia **6 trang**, mỗi trang tối đa 10 màn; tự mở tại trang chứa màn cao nhất được mở khóa. Nút chuyển nhóm không làm mất tiến độ.
- Các chức năng cũ: khoanh hoặc nhấp, gợi ý, tải ảnh gia đình, bộ sưu tập và AI vẫn giữ nguyên.
- Nguồn: `js/games/spot-presets.js` (5 màn gốc + tổng hợp), `js/games/spot-presets-extra.js` (50 màn và bộ vẽ SVG), `js/games/spot-diff.js` (giao diện và khóa).
- Kiểm thử mã: 55/55 SVG A/B khác nhau và tạo lại ổn định; tọa độ đáp án không trùng, vượt khung hoặc nằm quá gần nhau; mở khóa tuần tự từ màn 1 đến 55; khôi phục tiến độ 5 màn cũ; cú pháp JavaScript đạt.
- **Chưa kiểm thử thao tác thực tế trên Chrome Windows/Safari iOS.**

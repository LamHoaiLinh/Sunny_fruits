# SUNNY FRUITS

Web game xếp trái cây dành cho trẻ nhỏ, mô phỏng bảng xếp hình vật lý: các thẻ tròn di chuyển qua một đường ray ngang, hai ô dự phòng ở hai bên và quy tắc **cột đủ 4 thẻ sẽ chặn đường**.

## Chạy game
- Mở `index.html` trực tiếp bằng trình duyệt; hoặc chạy static server với `python -m http.server 8000`.
- Không dùng CDN, không cần backend, không có build step.
- Có thể deploy trực tiếp bằng GitHub Pages.

## Luật chính
- Mỗi loại trái cây xuất hiện đúng 3 lần.
- Mục tiêu: mỗi cột có đúng 3 thẻ cùng loại.
- Cột chứa tối đa 4 thẻ.
- Khi một cột có 4 thẻ, cột đó chặn đường ray; thẻ ở hai phía không thể đi xuyên qua.
- Hai ô dự phòng trái/phải, mỗi ô giữ tối đa 1 thẻ.
- Chỉ thẻ trên cùng của cột được di chuyển.

## 10 cấp độ
Mỗi cấp cần thắng 3 màn để lên cấp tiếp theo. Số cột tăng dần từ 5 đến 10 và độ sâu xáo trộn cũng tăng. Màn được sinh bằng **reverse-play generation** từ trạng thái đã giải, dùng seed cố định cho từng màn. Nếu rơi vào deadlock thật sự và không còn nước đi hợp lệ, tiến trình thử thách quay lại Cấp 1. `Đi lại` và `Làm lại` không tính là thua.

## Mobile
Game dùng Pointer Events và pointer capture; khóa scroll ngang/dọc trong vùng chơi, khóa bôi đen chữ khi giữ lâu, native image drag, context menu và overscroll. Board tự scale theo viewport, không dùng horizontal scrolling. Cấp 8–10 sẽ gợi ý xoay ngang khi màn hình dọc quá hẹp.

## Trái cây
Game có 72 loại trái cây lấy từ hai sprite sheet 6×6. Hai sheet được nén thành WebP và nhúng local để game vẫn chạy offline:
- `js/fruits.js`: metadata 72 trái cây (`id`, `name`, `sheet`, `row`, `col`).
- `assets/fruits.json`: bản JSON dễ tra cứu/chỉnh sửa.
- `js/sheet_chunks/`: dữ liệu hai atlas được chia nhỏ thành các file JS.
- `js/sheets.js`: ghép các chunk thành hai data URL dùng trong game.

Muốn thay bộ hình, có thể tạo lại hai atlas 6×6, giữ thứ tự `row/col`, sau đó cập nhật dữ liệu atlas và `js/fruits.js`.

## Cấu trúc code
- `js/rules.js`: luật di chuyển, sức chứa, blocker, win/deadlock.
- `js/generator.js`: seeded RNG + reverse-play generator, cấu hình 10 cấp.
- `js/solver.js`: A* giới hạn node phục vụ gợi ý, kèm best-effort fallback.
- `js/renderer.js`: render board, sprite atlas và responsive scaling.
- `js/game.js`: gameplay, drag/drop, tiến trình, undo/restart/hint, khóa thao tác trình duyệt.
- `js/storage.js`: lưu tiến trình bằng localStorage.
- `js/audio.js`: hiệu ứng âm thanh WebAudio.
- `js/tutorial.js`: hướng dẫn lần đầu.
- `tests/tests.html`: test runner trình duyệt.

## Điều chỉnh độ khó
Sửa `LEVELS` trong `js/generator.js`, chủ yếu các giá trị `cols`, `steps`, `minMix`. Trên điện thoại không nên vượt quá 10 cột; nên tăng độ sâu shuffle và tần suất blocker thay vì tiếp tục tăng số cột.

## Kiểm thử
Mở `tests/tests.html`. Test runner kiểm tra các luật chính và sinh 100 map cho mỗi cấp, tổng cộng 1.000 map, sau đó replay chuỗi lời giải ngược để xác nhận map có đường trở lại trạng thái thắng.

## GitHub Pages
Vào **Settings → Pages → Deploy from a branch → `main` / `(root)`**. Sau khi GitHub deploy xong, game có thể mở trực tiếp trên điện thoại bằng URL Pages của repository.

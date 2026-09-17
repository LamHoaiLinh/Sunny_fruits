# SUNNY FRUITS

Web game xếp trái cây dành cho trẻ nhỏ, mô phỏng bảng xếp hình vật lý: các thẻ tròn di chuyển qua một đường ray ngang, hai ô dự phòng ở hai bên và quy tắc **cột đủ 4 thẻ sẽ chặn đường**.

## Chạy game
- Cách đơn giản: mở `index.html` trực tiếp bằng trình duyệt.
- Hoặc chạy static server: `python -m http.server 8000` rồi mở `http://localhost:8000`.
- Không dùng CDN, không cần backend, có thể chơi offline sau khi tải source.

## Luật chính
- Mỗi loại trái cây xuất hiện 3 lần.
- Mục tiêu: mỗi cột có đúng 3 thẻ cùng loại.
- Cột chứa tối đa 4 thẻ.
- Khi một cột có 4 thẻ, cột đó chặn đường ray: thẻ ở hai phía không thể đi xuyên qua.
- Có hai ô dự phòng trái/phải, mỗi ô giữ tối đa 1 thẻ.
- Chỉ thẻ trên cùng của cột được di chuyển.

## Tiến trình
Có 10 cấp. Mỗi cấp thắng 3 màn để lên cấp tiếp theo. Màn được sinh từ trạng thái hoàn thành rồi thực hiện chuỗi nước đi hợp lệ theo hướng ngược, vì vậy luôn tồn tại một đường giải. Nếu rơi vào deadlock thật sự (không còn nước đi hợp lệ), thử thách quay về Cấp 1. Nút **Làm lại** và **Đi lại** không bị tính là thua.

## Mobile
Game dùng Pointer Events, `touch-action:none`, pointer capture, chặn text selection, native image drag, context menu và overscroll trong vùng chơi. Board tự scale theo viewport, không dùng horizontal scrolling. Cấp 8–10 sẽ gợi ý xoay ngang nếu màn hình dọc quá hẹp.

## Cấu trúc
- `js/rules.js`: luật di chuyển, chặn đường, win/deadlock.
- `js/generator.js`: seeded RNG + reverse-play generator, cấu hình 10 cấp.
- `js/solver.js`: A* giới hạn node cho gợi ý; có best-effort fallback.
- `js/renderer.js`: render board và responsive scaling.
- `js/game.js`: gameplay, drag, progression, save/load.
- `js/storage.js`: localStorage.
- `js/audio.js`: hiệu ứng âm thanh WebAudio.
- `assets/fruits/`: 72 sprite PNG được tách từ 2 sprite sheet 6×6.
- `tests/tests.html`: test runner, gồm stress test 1.000 map.

## Thêm trái cây
1. Thêm PNG vào `assets/fruits/`.
2. Thêm object `{id, name, image}` vào `js/fruits.js`.
3. Generator sẽ tự chọn ngẫu nhiên từ thư viện.

## Điều chỉnh độ khó
Sửa `LEVELS` trong `js/generator.js` (`cols`, `steps`, `minMix`). Không nên tăng số cột quá 10 trên điện thoại; tăng độ sâu shuffle và tình huống blocker sẽ tốt hơn.

## GitHub Pages
Vào **Settings → Pages → Deploy from a branch → main / root**. Vì game dùng đường dẫn tương đối và không có build step nên có thể deploy trực tiếp.

## Kiểm thử
Mở `tests/tests.html`. Test runner kiểm tra luật blocker, sức chứa, reserve, win detection và tạo 100 map cho mỗi cấp (tổng 1.000 map), sau đó replay chuỗi lời giải ngược để xác nhận tất cả map đều giải được.

/* Vietnamese presentation layer for Kids Focus Camp (MIT, ©2026 juntiy).
   Original game modules, artwork, level rules, and interactions remain untouched.
   Only visible DOM text, accessible labels and canvas labels are translated.
*/
(() => {
  "use strict";
  const phrases = [
    ["选一张图片开始找不同：可以用自己的照片，也可以用免费 AI 生成专属图片。", "Chọn ảnh để tìm điểm khác nhau. Có thể dùng ảnh gia đình hoặc tạo ảnh bằng AI."],
    ["上传图片时选择类型：", "Khi tải ảnh lên, hãy chọn loại ảnh: "],
    ["（自动生成几处不同）或", " (tự tạo vài điểm khác nhau) hoặc "],
    ["（左右/上下并排，保持原样找）。直接", " (hai hình trái–phải hoặc trên–dưới, giữ nguyên ảnh). Hãy "],
    ["标记即可。", " để đánh dấu."],
    ["上传的图片只保存在", "Ảnh tải lên chỉ được lưu trong "],
    ["里（不上传服务器），随时可以拿来玩找不同。", " (không tải lên máy chủ), có thể dùng lại bất cứ lúc nào."],
    ["使用免费开源模型", "Sử dụng mô hình mở miễn phí"],
    ["无需登录或付费。生成需要联网，通常 10~60 秒。", "Không cần tài khoản hay trả phí. Cần mạng, thường mất 10–60 giây."],
    ["找到不同就用手画个圈标记，标错了按「撤销」。想不出来点「提示」，最后按「完成」看 AI 全部答案。", "Hãy khoanh tròn điểm khác nhau. Khoanh nhầm thì chọn Hoàn tác. Nếu bí, chọn Gợi ý. Sau đó nhấn Hoàn thành để xem đáp án."],
    ["找到不同就点一下做个手绘标记，标错了按「撤销」。（这张图 AI 没扫描出答案，就自由找吧）", "Nhấp hoặc khoanh để đánh dấu. Sai thì chọn Hoàn tác. Ảnh này chưa có đáp án tự động nên bé cứ tự tìm nhé."],
    ["游戏会在图上自动生成几处不同（适合普通照片 / 插画）", "Game tự tạo vài điểm khác nhau (dành cho ảnh chụp hoặc tranh vẽ)"],
    ["图里已有一对画面（左右或上下并排），保持原样来找不同", "Ảnh gồm hai hình cạnh nhau hoặc trên dưới; chơi với hình nguyên gốc"],
    ["告诉游戏怎么玩，找不同会更准：", "Hãy chọn loại ảnh để chơi đúng cách:"],
    ["其余图片已存入“我的图库”", "Các ảnh khác đã lưu vào Bộ sưu tập"],
    ["图库还是空的，先添加几张图片吧～", "Bộ sưu tập đang trống. Hãy thêm vài ảnh nhé!"],
    ["也可以自己输入画面描述，比如：一只戴帽子的小狗在海边…", "Nhập mô tả ảnh, ví dụ: chú chó đội mũ trên bãi biển…"],
    ["正在生成图片，请稍候…（免费模型生成较慢）", "Đang tạo ảnh, vui lòng chờ… (dịch vụ miễn phí có thể chậm)"],
    ["。请检查网络，或改用“上传图片”/“我的图库”。", ". Hãy kiểm tra mạng hoặc chọn Tải ảnh lên / Bộ sưu tập."],
    ["这张图无法读取像素，请直接自由标记", "Không đọc được điểm ảnh; hãy tự đánh dấu."],
    ["没有检测到左右/上下并排的两幅画面，直接自由标记", "Không tìm thấy hai hình cạnh nhau, hãy tự đánh dấu."],
    ["检测到的差异太少，直接自由标记", "Không đủ điểm khác nhau tự động, hãy tự tìm nhé."],
    ["绿色数字圈是 AI 标出的全部答案～", "Vòng xanh có số là những đáp án được tìm thấy."],
    ["标记错了可以点掉重标，多找几遍更专注～", "Đánh dấu sai có thể xóa rồi thử lại nhé."],
    ["🐝 小蜜蜂要把花蜜送回蜂窝，路上有", "🐝 Chú ong cần mang mật về tổ; trên đường có "],
    ["！按住小蜜蜂，沿着花路", "! Giữ chú ong và đi theo đường hoa "],
    ["，碰到紫色的边就会被电到哦～", ", chạm mép tím là bị điện giật nhé!"],
    ["按住小蜜蜂慢慢滑到 🍯，碰到紫色的边会被电到（有安全站，不怕重来）～", "Giữ ong và rê thật chậm tới 🍯, tránh mép màu tím. Có trạm an toàn để thử lại."],
    ["小蜜蜂送花蜜：按住慢慢滑，别碰带电的蜘蛛网", "Dẫn ong về tổ, rê chậm và tránh mạng nhện điện"],
    ["再收集", "Cần thêm "],
    ["颗星就能解锁啦", " sao nữa để mở khóa!"],
    ["嗡嗡嗡～ 被电到啦！回到安全站", "Chạm điện rồi! Về trạm an toàn."],
    ["按住屏幕拖动小球 🟠 到 ⭐ 终点，迷宫会一关比一关大！", "Giữ chuột kéo bóng 🟠 tới đích ⭐. Mê cung sẽ lớn dần!"],
    ["用手指拖动小球，穿过迷宫到达终点", "Kéo bóng qua mê cung đến đích"],
    ["点击屏幕让小青蛙跳跃，躲开障碍物，跳得越远越好！", "Nhấn để ếch nhảy qua chướng ngại vật. Cố đi thật xa nhé!"],
    ["点击屏幕让小青蛙跳过障碍物，越跳越远", "Nhấn để ếch nhảy qua vật cản, đi càng xa càng tốt"],
    ["按顺序从 1 点到最后，越快越好，训练注意力和反应力！", "Nhấp các số từ 1 đến số cuối theo thứ tự, càng nhanh càng tốt!"],
    ["按顺序从 1 点到最后，训练注意力和反应力", "Nhấp các số theo thứ tự để luyện tập trung"],
    ["点击或画圈找出两图不同，支持上传图片和免费 AI 生成", "Nhấp hoặc khoanh hình khác biệt; hỗ trợ tải ảnh và tạo ảnh AI"],
    ["点击或画圈，找出两张图片的不同之处", "Nhấp hoặc khoanh tròn điểm khác biệt giữa hai ảnh"],
    ["在一堆相近的颜色里，找到唯一", "Trong những ô gần giống màu, hãy tìm ô "],
    ["在一堆相近颜色里，找到唯一不一样的那一个", "Tìm ô có màu khác các ô còn lại"],
    ["在一堆相近的颜色里，找到唯一不一样的那一个！", "Hãy tìm ô khác màu trong số các ô còn lại!"],
    ["普通单张画面", "Một ảnh thông thường"],
    ["已经做好的找不同图", "Ảnh tìm khác biệt có sẵn"],
    ["浏览器不支持图库存储", "Trình duyệt không hỗ trợ bộ sưu tập"],
    ["打开图库失败", "Không mở được bộ sưu tập"],
    ["图片加载超时，请稍后重试", "Tải ảnh quá lâu, hãy thử lại"],
    ["图片加载失败（可能需要联网）", "Không tải được ảnh (có thể cần mạng)"],
    ["图片读取失败：", "Không đọc được ảnh: "],
    ["无法读取文件", "Không đọc được tệp"],
    ["图片加载失败", "Không tải được ảnh"],
    ["保存失败", "Không lưu được ảnh"],
    ["删除失败", "Không xóa được ảnh"],
    ["其余图片", "Những ảnh khác"],
    ["你找到了", "Bé tìm được"],
    ["AI 共发现", "AI tìm thấy"],
    ["找到了", "Đã tìm được"],
    ["还没有标记可以撤销", "Chưa có dấu nào để hoàn tác"],
    ["答案都提示过啦，加油自己找～", "Đã hiện hết gợi ý; con thử tìm tiếp nhé!"],
    ["零触电通关，太稳了！", "Hoàn thành mà không chạm điện, tuyệt vời!"],
    ["很棒，下次试试零触电！", "Giỏi lắm! Lần sau thử không chạm điện nhé!"],
    ["没关系，慢慢来就是赢～", "Không sao, hãy đi thật chậm nhé!"],
    ["先深呼吸一下", "Hãy hít thở thật sâu"],
    ["花田小路", "Lối nhỏ vườn hoa"],
    ["微风弯道", "Khúc cua gió nhẹ"],
    ["直角花园", "Khu vườn góc vuông"],
    ["S型花丛", "Đường hoa chữ S"],
    ["雷暴窄道", "Đường hẹp giông bão"],
    ["星光螺旋", "Xoắn ốc ánh sao"],
    ["儿童专注力训练营：找不同、找相近颜色、走迷宫、过障碍、防触电、舒尔特方格，免费触摸屏小游戏", "Trò chơi luyện tập trung cho bé trên máy tính và điện thoại"],
    ["全部游戏免费 · 支持触摸屏与鼠标 · AI 找不同使用免费开源模型 FLUX（Pollinations 提供）", "Các trò chơi miễn phí · Hỗ trợ chuột và cảm ứng · AI tạo ảnh từ Pollinations"],
    ["免费开源模型", "mô hình mở miễn phí"],
    ["AI 图片生成需要联网，通常 10~60 秒。", "Tạo ảnh AI cần có mạng, thường mất 10–60 giây."],
    ["儿童绘本插画风格，色彩鲜艳明亮，画面干净，没有文字", "Tranh thiếu nhi, màu sắc tươi sáng, không chữ"],
    ["🌳 森林小动物", "🌳 Thú rừng"],
    ["🌊 海底世界", "🌊 Đại dương"],
    ["🚀 太空冒险", "🚀 Không gian"],
    ["🎡 游乐场", "🎡 Công viên vui chơi"],
    ["🐱 猫咪乐园", "🐱 Thế giới mèo"],
    ["🏔️ 雪山滑雪", "🏔️ Trượt tuyết"],
    ["专注力训练营", "Bé luyện tập trung"],
    ["找相近颜色", "Phân biệt màu"],
    ["舒尔特方格", "Bảng số Schulte"],
    ["走迷宫", "Mê cung"],
    ["过障碍", "Vượt chướng ngại"],
    ["防触电", "Đường đi an toàn"],
    ["找不同", "Tìm điểm khác nhau"],
    ["原图找不同", "Tìm điểm khác nhau trên ảnh"],
    ["我的图库", "Bộ sưu tập"],
    ["普通单图", "Ảnh đơn"],
    ["现成的", "có sẵn"],
    ["AI 生成", "Tạo ảnh AI"],
    ["上传图片", "Tải ảnh lên"],
    ["随机画面", "Chọn hình ngẫu nhiên"],
    ["本机浏览器", "trình duyệt hiện tại"],
    ["加载中…", "Đang tải…"],
    ["关闭", "Đóng"],
    ["添加图片", "Thêm ảnh"],
    ["开始生成", "Bắt đầu tạo ảnh"],
    ["点击跳跃！", "Nhấp để nhảy!"],
    ["返回首页", "Về danh sách trò"],
    ["返回", "Quay lại"],
    ["首页", "Trang chủ"],
    ["取消", "Hủy"],
    ["直接开始", "Bắt đầu ngay"],
    ["重新挑战", "Thử lại từ đầu"],
    ["下一关", "Màn tiếp"],
    ["再来一局", "Chơi lại"],
    ["再来一次", "Chơi lại"],
    ["换一张", "Đổi ảnh"],
    ["全部完成！", "Hoàn thành tất cả!"],
    ["全部通关！", "Đã qua tất cả màn!"],
    ["过关啦！", "Qua màn rồi!"],
    ["心都凉了…", "Hết lượt rồi!"],
    ["撞到障碍啦", "Đã chạm vật cản!"],
    ["优秀！", "Xuất sắc!"],
    ["良好！", "Giỏi lắm!"],
    ["加油，再练一次！", "Cố lên, thử lại nhé!"],
    ["吸气…", "Hít vào…"],
    ["呼气…", "Thở ra…"],
    ["带电的蜘蛛网", "mạng nhện nhiễm điện"],
    ["慢慢滑", "rê thật chậm"],
    ["小蜜蜂", "Chú ong"],
    ["太空机器人", "Robot vũ trụ"],
    ["猫咪爪", "Chân mèo"],
    ["安全站", "Trạm an toàn"],
    ["慢一点～", "Chậm lại!"],
    ["超稳！", "Rất khéo!"],
    ["零触电", "Không chạm điện"],
    ["已解锁", "Đã mở khóa"],
    ["需要", "Cần"],
    ["被电", "Chạm điện"],
    ["过快", "Quá nhanh"],
    ["得分", "Điểm"],
    ["本次", "Lần này "],
    ["3×3 入门", "3×3 Dễ"],
    ["4×4 进阶", "4×4 Vừa"],
    ["5×5 标准", "5×5 Khó"],
    ["下一个：", "Tiếp theo: "],
    ["下一个", "Tiếp theo"],
    ["不一样", "khác màu"],
    ["秒", "giây"],
    ["米", "m"],
    ["处", "điểm"],
    ["关", "màn"],
    ["次", "lần"],
    ["第", "Màn "],
    ["选关", "Chọn màn"],
    ["已经", "Đã"],
    ["原图", "Ảnh gốc"],
    ["图 A", "Hình A"],
    ["图 B", "Hình B"],
    ["完成", "Hoàn thành"],
    ["撤销", "Hoàn tác"],
    ["提示", "Gợi ý"],
    ["共", "Tổng "],
    ["用时", "Thời gian"],
    ["已标记", "Đã đánh dấu"],
    ["标记", "Đánh dấu"],
    ["图", "hình"],
    ["开始", "Bắt đầu"],
    ["图片", "ảnh"],
    ["已删除", "Đã xóa"]
  ];
  // Extra Vietnamese labels and phrases used inside nested markup.
  phrases.push(...[["现成的找不同图","Ảnh tìm điểm khác nhau có sẵn"],["找出 <b id=\"sd-found\">","Tìm <b id=\"sd-found\">"],["这张图是哪种？","Đây là loại ảnh nào?"],["🏅 专注力小奖状","🏅 Bằng khen bé tập trung"],["再玩一次","Chơi lại"],["处不同","điểm khác nhau"],["太棒了！全部找到！","Tuyệt vời! Bé đã tìm đủ!"],["的那一个！"," nhé!"],["跳了","Đã đi"],["最佳","Kỷ lục"],[" 分"," điểm"],["点击","nhấp"],["画圈","khoanh tròn"],["或"," hoặc "],["标记即可。"," là xong."],["免费 · 无需 Key","Miễn phí · không cần API key"],["图片","ảnh"]]);
  phrases.sort((a,b) => b[0].length - a[0].length);
  const hasHan = /[\u3400-\u9fff]/;
  const translate = value => {
    if(typeof value !== "string" || !hasHan.test(value)) return value;
    let s=value;
    for(const [zh,vi] of phrases) if(s.includes(zh)) s=s.split(zh).join(vi);
    return s;
  };

  // Keep canvas artwork, paths, physics and drawing intact. Translate canvas captions only.
  for(const method of ["fillText","strokeText"]) {
    const proto=CanvasRenderingContext2D.prototype;
    const original=proto[method];
    proto[method]=function(text,...rest) { return original.call(this,translate(text),...rest); };
  }

  function translateTree(node) {
    if(node.nodeType===Node.TEXT_NODE){
      if(node.parentElement && /^(SCRIPT|STYLE)$/i.test(node.parentElement.tagName))return;
      const next=translate(node.nodeValue);
      if(next!==node.nodeValue)node.nodeValue=next;
      return;
    }
    if(node.nodeType!==Node.ELEMENT_NODE)return;
    if(node.matches("script, style"))return;
    for(const attr of ["alt","title","placeholder","aria-label"]) {
      if(node.hasAttribute(attr)) {
        const old=node.getAttribute(attr),next=translate(old);
        if(next!==old)node.setAttribute(attr,next);
      }
    }
    const walk=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);
    while(walk.nextNode()){
      const text=walk.currentNode;
      if(text.parentElement && /^(SCRIPT|STYLE)$/i.test(text.parentElement.tagName))continue;
      const next=translate(text.nodeValue);
      if(next!==text.nodeValue)text.nodeValue=next;
    }
    node.querySelectorAll("[alt],[title],[placeholder],[aria-label]").forEach(el=>{
      for(const attr of ["alt","title","placeholder","aria-label"]) if(el.hasAttribute(attr)){
        const old=el.getAttribute(attr),next=translate(old);
        if(next!==old)el.setAttribute(attr,next);
      }
    });
  }
  document.documentElement.lang="vi";
  document.title="Sunny Mouse – Bé luyện tập trung";
  translateTree(document.body);
  const observer=new MutationObserver(records=>{
    for(const record of records) {
      if(record.type==="characterData")translateTree(record.target);
      for(const node of record.addedNodes)translateTree(node);
    }
  });
  observer.observe(document.body,{childList:true,subtree:true,characterData:true});
})();

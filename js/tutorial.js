(function(){
'use strict';var steps=[
['🍓 ☝️','Chọn trái cây','Bạn chỉ lấy được trái cây ở trên cùng của mỗi cột.'],
['🍓 ➜ 🍓','Kéo trên đường ray','Bạn kéo trái cây lên đường ray rồi đưa sang cột bạn muốn.'],
['🍊 ⇆ ⭐','Hai chỗ để tạm','Bạn có thể để tạm 1 trái cây ở mỗi bên khi cần xoay xở.'],
['🍏🍏🍏🍓 ⛔','Cột có 4 thẻ sẽ chặn đường','Khi một cột có 4 trái cây, hai bên không thể đi xuyên qua cột đó.'],
['🍇🍇🍇 ✨','Xếp thành bộ 3','Mục tiêu là mỗi cột có đúng 3 trái cây giống nhau.'],
['🌈 🏆','Hoàn thành 3 màn để lên cấp','Có 10 cấp độ. Nếu thật sự bị kẹt và không còn nước đi, thử thách sẽ quay lại Cấp 1.']
];var idx=0,root=document.getElementById('tutorial'),visual=document.getElementById('tutorialVisual'),title=document.getElementById('tutorialTitle'),text=document.getElementById('tutorialText'),next=document.getElementById('tutorialNext'),skip=document.getElementById('tutorialSkip');
function draw(){visual.textContent=steps[idx][0];title.textContent=steps[idx][1];text.textContent=steps[idx][2];next.textContent=idx===steps.length-1?'Bắt đầu':'Tiếp theo';}
function open(done){idx=0;root.classList.remove('hidden');root._done=done;draw();}
function close(){root.classList.add('hidden');if(root._done)root._done();root._done=null;}
next.addEventListener('click',function(){if(idx<steps.length-1){idx++;draw();}else close();});skip.addEventListener('click',close);
window.SunnyTutorial={open:open};
})();

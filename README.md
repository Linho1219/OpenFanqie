# OpenFanqieCore
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FLinho1219%2FOpenFanqieCore.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2FLinho1219%2FOpenFanqieCore?ref=badge_shield)


[番茄简谱](http://jianpu99.net/)的第三方后端开源实现。使用 Node.js 编写。

由于作者弃坑许久，不少问题得不到修复。网站虽免费但不开源，而且曲谱渲染在后端完成，故建立此仓库，欲编写一个番茄简谱的开源后端实现，模拟原版后端的功能。

目前打算先尽力模拟原版后端的行为，待此项目成熟之后开新的项目写个新的基于番茄脚本的简谱编辑软件。

本项目的前端代码镜像自原网站，仅供测试使用，版权归原作者所有。

逆向不好做。能不能做出来、做出来之后跟原版的接近程度有多少，我自己心里也没底。但是开始了总比空想要好。

祝自己顺利。

## To Do
- [x] 将脚本解析为对象
	- [x] 单行音符、旋律、小节线解析
	- [x] `&` 开头的命令解析
	- [x] `()`，`(y)`，`[]` 等标记解析
	- [ ] 临时多声部与临时伴奏（没想好怎么设计数据结构）
	- [x] 歌词解析与合入
	- [x] 文档分块
	- [x] 形成完整包
- [ ] 将对象解析为 SVG
  - [ ] 整理原版 SVG 图形
	- [ ] 搞清楚定位


## License
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FLinho1219%2FOpenFanqieCore.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2FLinho1219%2FOpenFanqieCore?ref=badge_large)
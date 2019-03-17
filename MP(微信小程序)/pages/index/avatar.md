# 思路
- ### 实现图片的缩放
   - `wx.chooseImage` 上传图片
   - `wx.getImageInfo` 获取图片宽高等信息
   - `bindtouchstart` , `bindtouchmove` 记录双指事件
   - 通过双指移动的距离与初始距离的关系判断缩放
   - 规定阈值，最大与最小缩放
- ### 实现对图片的裁剪
   - `canvas.drawImage` 对图片进行绘制
   - `wx.canvasToTempFilePath` 实现对绘制图片的裁剪
   - 取消，清空参数
 ---
 # 开始操作
 - ### 上传图片
   在上传图片之前，我们需要获取设备的宽高，使图片可以自适应屏幕的大小。使用 `wx.gerSystemInfo` 获取，规定一个 `screenW = screenWidth` 用于后续参考。
   然后可以 `wx.chooseImage` 对图片进行上传。
   
 - ### 获取图片信息，实现自适应
   小程序无法操作 DOM ，但是我们可以通过操作 `data` 值的方法得到所需参数。
   首先使用 `wx.getImageInfo` 得到上传图片的宽高，其次计算宽高的比列 `scale`。
   1. 如果 `宽 / 高` 大于 1 ，则是一幅横向图 ，我们需要让短的一边 `高` 填满整个裁剪框 `screenW` ,宽度根据比例自适应。
   2. 相反，如果 `宽 / 高` 小于 1 ，则是一幅纵向图，让短边 `宽` 填满，高度自适应即可。
 
   ```javascript
    wx.getImageInfo({
                    src: tempFilePaths,  //图片地址
                    success: function(msg) {
                        let img_w = msg.width, 
                            img_h = msg.height,
                            scale = img_w / img_h    //宽高比scale
                        //横向图片,宽不变
                        //横向图片，高变成固定，宽度自适应
                        if (scale > 1) {
                            that.setData({
                                width: scale * width,
                                height: height,
                                old_width: scale * width,  //记录原始宽高，为缩放比列做限制
                                old_height: height,
                                img: tempFilePaths
                            })
                        } else { //纵向图片，短边是宽，宽变成系统固定，高自适应
                            that.setData({
                                width: width,
                                height: height / scale,
                                old_width: width,
                                old_height: height / scale,
                                img: tempFilePaths
                            })
                        }
                    }
                })
   ```
   这样我们就得到了一幅宽高自适应屏幕的图片。
   
 - ### 监听触控事件，实现缩放
    1. 在 view 视图绑定两个触控事件 `bindtouchstar` ` bindtouchmove` 
    2. 判断是否两指操作，单指滑动可以使用内部组件 `<scroll-view>` 实现
    3. 计算按下时两指的距离
    4. 计算移动时两指的距离
   ```javascript
   start: function(res) {   //bindtouchstar记录初始距离
        let that = this;
        if (res.touches.length == 2) {
            let _x = res.touches[1].pageX - res.touches[0].pageX,
                _y = res.touches[1].pageY - res.touches[0].pageY,
                distance = Math.sqrt(Math.pow(_x, 2) + Math.pow(_y, 2));
            that.setData({
                distance: distance
            })
        }
    },
   ```
   由于两指不可能处于同一水平线上，求距离 `distance` 需要用到初中数学学到的勾股定理。
   `distance = Math.sqrt(Math.pow(两指间x的距离，2)+Math.pow(两指间的y的距离，2))`
- ### 通过移动距离实现缩放
   监听两指间移动的距离，与初始距离 `distance` 相减得到 `end_distance` 。 原始宽高  *  `1 + end_distance * 控制常量 ` 即可得出缩放后的宽高。 
   设置一个缩放范围，超出的话则使用上文提到的 ` old_height,old_width` 规范宽高。
   ```javascript
    move: function(res) {
        let that = this;
        if (res.touches.length == 2) {
            let _x = res.touches[1].pageX - res.touches[0].pageX,
                _y = res.touches[1].pageY - res.touches[0].pageY,
                old_width = that.data.old_width,
                old_height = that.data.old_height,
                newdistance = Math.sqrt(Math.pow(_x, 2) + Math.pow(_y, 2)),
                width = that.data.width,
                height = that.data.height,
                distance = that.data.distance,
                end_distance = newdistance - distance,
                pic_scale = 1 + end_distance * 0.001;  //图片缩放比例，常数 0.001 是为了使图片缩放不显得突兀。
            that.setData({
                width: width * pic_scale,
                height: height * pic_scale
            })

            let max = width / old_width;
            if (max > 2) {
                that.setData({
                    width: old_width * 2,
                    height: old_height * 2
                })
            } else if (max < 1) {
                that.setData({
                    width: old_width,
                    height: old_height
                })
            }
        }
    },
   ```
   到这里，图片的上传与缩放完成了，下面结合canvas实现图片的裁剪

- ### canvas 绘制图片
  使用 canvas 的 `drawImage` 绘制出缩放后的图片，绘制时需要传入缩放后的宽度和高度。
  ```javascript
  crop: function() {
        let that = this,
            img = that.data.img,
            width = that.data.width,  //缩放后的宽
            height = that.data.height,
            crop = that.data.screenW; //裁剪框的边长
        wx.showToast({
            title: 'loading...',
            icon: 'loading',
            duration: 1000
        })
        const canvas = wx.createCanvasContext('canvas');
        canvas.drawImage(img, 0, 0, width, height)
  ```
  
 - ### 裁剪
     1.使用 `wx.canvasToTempFilePath`  对绘制的图片进行区域性的裁剪。需要传入 4 个参数 -- `x : 裁剪的初始横坐标` ，` y : 裁剪的初始纵坐标` ， `width : 裁剪区域的宽` , `height : 裁剪区域的高`。
     2. `x` , `y` 通过在上文中提到的 `<scroll-view>` 中绑定 `bindscroll` 获取。
     3. `width , height ` 为裁剪框 `crop` 的边长。
     
   ```javascript
   scroll: function(e) {
        console.log('TOP:' + e.detail.scrollTop + 'Left:' + e.detail.scrollLeft)
        let x = e.detail.scrollLeft,
            y = e.detail.scrollTop,
            that = this;
        that.setData({
            x: x,
            y: y
        })
    },
   let x = that.data.x,
   	y = that.data.y;
   canvas.draw(setTimeout(() => {
            wx.canvasToTempFilePath({
                x: x,
                y: y,
                width: crop,
                height: crop,
                canvasId: 'canvas',
                success: suc => {
                    console.log(suc.tempFilePath)
                    that.setData({
                        crop_pic: suc.tempFilePath,
                        disable: true         //裁剪按钮的禁用状态
                    })
                },
                fail: err => {
                    console.log('err:' + err)
                }
            }, this)
        }, 1000))
   ```
   如果裁剪出来是一张空白的图片，需要给裁剪过程添加一个上述代码中用到的定时器，以便 canvas 有缓冲时间准备裁剪。

- ### 设置取消
  在该方法中添加取消操作，还原重置。
  ```javascript
   clear: function(e) {
        let that = this;
        that.setData({
            img: '',
            old_width: '',
            old_height: '',
            width: '',
            height: '',
            crop_pic: '',
            disable: false
        })
    },
  ```
 好了，大功告成了。
 调试真的太麻烦了，得一次次扫码，更改，扫码，更改 ....
 年底就说要盘微信开发者工具，到现在也没有啥 '肉眼可见' 的便捷改变，要是不久能支持多点触控就好了。

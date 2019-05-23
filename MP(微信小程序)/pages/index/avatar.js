// pages/index/avatar.js
Page({
    data: {
        img: '',
        screenW: '',
        width: '',
        height: '',
        distance: '',
        old_width: '',
        old_height: '',
        cut_: '',
        x: 0,
        y: 0,
        crop_pic: '',
        disable: false
    },
    //判断图片的宽高，短的那边变成固定，长的自适应。
    onLoad: function(options) {
        wx.getSystemInfo({
            success: res => {
                const screenH = res.screenHeight,
                    screenW = res.screenWidth,
                    cut_ = screenW - 4;
                let that = this;
                that.setData({
                    screenW: screenW,
                    cut_: cut_
                })
            },
        })
    },
    choose: function() {
        let that = this,
            width = that.data.screenW,
            height = that.data.screenW;
        wx.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success(res) {
                const tempFilePaths = res.tempFilePaths[0];
                wx.getImageInfo({
                    src: tempFilePaths,
                    success: function(msg) {
                        let img_w = msg.width,
                            img_h = msg.height,
                            scale = img_w / img_h
                        //横向图片,宽不变
                        //横向图片，高变成固定，宽度自适应
                        if (scale > 1) {
                            that.setData({
                                width: scale * width,
                                height: height,
                                old_width: scale * width,
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
            }
        })
    },
    start: function(res) {
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
                pic_scale = 1 + end_distance * 0.001;
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
    crop: function() {
        let that = this,
            img = that.data.img,
            width = that.data.width,
            height = that.data.height,
            crop = that.data.screenW,
            x = that.data.x,
            y = that.data.y;
        wx.showToast({
            title: 'loading...',
            icon: 'loading',
            duration: 1000
        })
        const canvas = wx.createCanvasContext('canvas');
        canvas.drawImage(img, 0, 0, width, height)
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
                        disable: true
                    })
                },
                fail: err => {
                    console.log('err:' + err)
                }
            }, this)
        }, 1000))

    }
})
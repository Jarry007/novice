/**
 * 微信小程序中的无法获取canvas的宽高，需要我们手动去设置
 * 可以通过getSystemIfo获取，设备宽高，然后计算所需数值
 * 1.创建两个Canvas,一个用来当验证背景（底），一个用来当拼接块
 * 2.同坐标下一个
 */
Page({

  /**
   * 页面的初始数据
   */
  data: {
     img:'https://blogai.cn/static/uploads/82f6bfa51778a0c55d42a334321cabf1/20190613145020_78.png',
    width:'',
    height:'',
    pic:'',
    y:'',
    x:'',
    left:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let that = this;
    wx.getSystemInfo({
      success: function (res) {
        let width = res.windowWidth;
        let height = res.windowHeight;

        that.setData({
          width: width,
          height: height
        })
      },
    })
    const canvas = wx.createCanvasContext('canvas1');
    const block = wx.createCanvasContext('block'),
    three = wx.createCameraContext('three');
    const img = that.data.img,
      canvas_width = that.data.width ,
      canvas_height = that.data.height * 0.3;
    let l = 50, 
    x =150+Math.random()*(canvas_width-l-150), 
    y = 10+Math.random()*(canvas_height-l-10);
    that.setData({
      block_w:l,
      y :y,
      x:x
    })
  
    canvas.drawImage(img, 0, 0, canvas_width, canvas_height);
    canvas.draw(false, setTimeout(() => {
      wx.canvasToTempFilePath({
        x: x,
        y: y,
        width:l,
        height: l,
        canvasId: 'canvas1',
        fileType: 'png',
        success(res) {
          console.log(res.tempFilePath)
          that.setData({
            pic: res.tempFilePath
          })
        },
        fail: err => {
          console.log(err)
        }
      }, this)
    }, 500))
    block.beginPath()
    block.moveTo(x,y)
    block.lineTo(x,y+l)
    block.lineTo(x+l,y+l)
    block.lineTo(x+l,y)
    block.globalCompositeOperation = 'xor' 
    block.fill()
    block.drawImage(img, 0, 0, canvas_width, canvas_height);
    block.draw( ) 
  },

 
  onShow: function () {

  },


  onHide: function () {

  },


  onUnload: function () {
    

  },

move:function(res){
  let left = res.touches[0].pageX;
  if (left>0){
  this.setData({
    left: left
  })
  }
  else{
    this.setData({
      left:0
    })
  }
},
end:function(res){
  let end = this.data.left,
  moves = this.data.x;
console.log(end)
if (Math.abs(end-moves)<2){
  console.log('bingo')
  wx.showToast({
    title: '验证成功',
    icon:'success',
    duration:2000
  })
  setTimeout(function(){
    wx.redirectTo({
      url: 'verification',
    })
  },2000)
}
else{
  this.setData({
    left:0
  })
}
}

})
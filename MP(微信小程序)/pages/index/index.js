//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    src:'',
  },
  //事件处理函数

  onLoad: function () {
    if (app.globalData.userInfo) {
        console.log(app.globalData.openid)
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  choose:function(){
    let that = this;
    wx.chooseImage({
    count:1,
    sizeType: ['original', 'compressed'],  //原图或压缩后
    sourceType: ['album', 'camera'], //相册，相机
    success: res => {
      const img = res.tempFilePaths
      that.setData({
        src:img
      })
    },
  })
},
  upload:function(){
    const user = app.globalData.openid
    let that = this;
    let pic = that.data.src;
    console.log(pic)
    wx.uploadFile({
      url: 'https://zjrzjr.cn:5000/api/v/upload/' + user,
      filePath: String(pic),
      name: 'test',
      success: function (e) {
        console.log(e)
      }
    })
  }
})

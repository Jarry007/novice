//app.js
App({
  onLaunch: function() {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    let that = this
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code) {
          wx.getUserInfo({
            success: e => {
              let info = {
                encryptedData: e.encryptedData,
                iv: e.iv,
                code: res.code
              }
              wx.request({
                url: 'https://zjrzjr.cn:5000/api/v/userinfo',
                header: {
                  'content-type': 'application/x-www-form-urlencoded'
                },
                data: {
                  info: JSON.stringify(info) //把object转化为json数据
                },
                method: 'POST',
                success: function(u) {
                  const encryptedData = u.data
                 getApp().globalData.openid=encryptedData.openId
                },
                fail: function(f) {
                  console.log(f)
                },
              })
            },
            fail: function() {
              console.log('fail,login_fail')
            }
          })
        }
      }
    })
    wx.checkSession({
      success() {
        // session_key 未过期，并且在本生命周期一直有效
      },
      fail() {
        // session_key 已经失效，需要重新执行登录流程
        wx.login() // 重新登录
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    openid: ''
  }
})
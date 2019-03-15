// pages/index/avatar.js
Page({

  data: {
    img:'',
    width:'350',
    height:'350',
    distance:'',
    old_width:'',
    old_height:''
  },

  onLoad: function (options) {

  },

  onReady: function () {
  },
  choose:function(){
    let that = this,
    width = that.data.width,
    height = that.data.height;
    that.setData({
      old_width:width,
      old_height:height
    })
    
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths[0];
        wx.getImageInfo({
          src: tempFilePaths,
          success: function (msg) {
            console.log(msg.height + ':' + msg.width)
            let img_w = msg.width,
            img_h = msg.height,
            scale = img_w/img_h
            //横向图片,宽不变
            if (scale>1){
              that.setData({
                width:width,
                height:height/scale,
                img:tempFilePaths
              })
            }
            else{//纵向图片，保持高度不变
              that.setData({
                width:width*scale,
                height:height,
                img :tempFilePaths
              })
            }
          }
        })      
        
        
      }
    })
  },
  /**
   * 先得到两个按下的点，计算之间的距离
   * 其次根据结束的点判断是否大于距离（初始距离）
   * 如果大于，就 放大。小于就 缩小。
   * 
   */
  start:function(res){
    console.log(res)
      if (res.touches.length==2){
      let _x = res.touches[1].pageX-res.touches[0].pageX,
      _y = res.touches[1].pageY-res.touches[0].pageY,
      distance = Math.sqrt(Math.pow(_x,2)+Math.pow(_y,2));
      console.log('x:'+_x)
      console.log('y:'+_y)
      console.log('距离'+ distance)
      this.setData({
        distance:distance
      })
      }    
    
  },
  move:function(res){
    console.log(res)
    if (res.touches.length == 2) {
    let _x = res.touches[1].pageX - res.touches[0].pageX,
      _y = res.touches[1].pageY - res.touches[0].pageY,
      old_width = this.data.old_width,
      old_height = this.data.old_height,
      newdistance = Math.sqrt(_x * _x + _y * _y),
      width= this.data.width,
      height=this.data.height,
      distance = this.data.distance,
      end_distance = newdistance-distance,
      pic_scale = 1+end_distance*0.003;
      console.log('pic_scale:' + pic_scale)
      if (pic_scale<1.5&&pic_scale>0.5){
      //算出增加或者减少的距离，乘以一个数值，然后
      //如果大于0，则是放大
          this.setData({
            width:width*pic_scale,
            height: height * pic_scale
          })
      }
      let max = this.data.width/old_width;
      console.log('old_height'+old_height)
      console.log('max'+max)
      if (max>2){
        
        this.setData({
          width: old_width * 2,
          height: old_height * 2
        })

      } 
     
    
    console.log('width'+this.data.width)
    console.log('height'+this.data.height)
    console.log('distance'+newdistance)
      console.log('相减:'+end_distance)
   
    /**
     * 找出位移与比例的具体公式
     * 设置阈值，当小于指定边长时不可缩小，大于的阈值的话不可扩大
     *
     */
    
  }
  }

})
# 小程序实现上传图片到python服务器

## 小程序前端

- 获取用户信息，`unionId`，用作生成用户专属图片文件夹   
   - 要生成unionId,需要知道自己小程序appid，secert_key。可以登录微信开发平台进行查看。
   - wx.login 获取 code 从而得到用户信息：encryptedData，iv ,把这三个参数传给后台
   - code特别容易过期，所以需要使用`wx.checkSession`激活
   - python后台通过requests.get(https://api.weixin.qq.com/wxa/getpaidunionid?access_token=ACCESS_TOKEN&openid=OPENID
)返回两个参数 `session_key` 和 `openid`
   - 通过从文档中下载的python服务端文件中的
   `WXBizDataCrypt(appid, session_key)
		return pc.decrypt(encryptedData, iv)
	`
	获取到unionId
   - **windows 系统下载会很麻烦，相信我，就是因为没办法安装ASE，我才折腾到了现在**
	


- `wx.chooseImage` 选择图片
   - 官方文档中有使用方法，我们只需配置一下参数就好

- `wx.uploadFile` 上传图片
   - 验证是否有`unionId`，携带`unionId`以`wx.chooseImage`生成的图片路径传给服务器


## python 后台

- 配置路由

- 接受传过来的文件，及unionId,创建文件夹
   - 创建`create_folder`函数，用来判断是否需要生成新的文件夹
   ```def creat_folder(folder_path):
    if not os.path.exists(folder_path):
        os.mkdir(folder_path)
        os.chmod(folder_path,os.O_RDWR)
   ```
   - `folder_path`接受参数`os.path.join(app.config['UPLOADS_FOLDER'], unionId`,
   生成独一无二的用户专属文件夹，用于存储用户上传的文件。其实也可以吧`unionId`hash加密一下。
   -
   
		

- 使用pillow对图片进行存储
   - 重命名图片，可以使用日期时间+随机两位数进行命名
   - 进行操作，如（加滤镜，加水印，裁剪压缩等）
   - 储存
   

- 返回图片地址


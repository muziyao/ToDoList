//app.js
App({
  onSaveExitState: function () {
    console.info('无效');
    wx.clearStorageSync();
  },
  //最先加载
  onLaunch: function () {
    console.info("第一")
    var that = this;
    // 查看是否授权
    wx.getSetting({
      success: function (res) {
        console.info(res.authSetting['scope.userInfo']);
        if (res.authSetting['scope.userInfo']) {
          var _this = that;
          wx.getUserInfo({
            success: function (res) {
              _this.globalData.userInfo = res.userInfo;
              // //从数据库获取用户信息
              // _this.queryUsreInfo();
              // //用户已经授权过
              // wx.switchTab({
              //   url: '/pages/index/index'
              // })
            }
          });
        }else{
          console.info("未授权");
          wx.removeStorageSync('register_btn');
          wx.clearStorageSync();
          wx.setStorageSync('register_btn', true);
          console.info(wx.getStorageSync('register_btn'));
        }
      }
    })
  },
  onLoad: function(){
    console.info("第二")

  },
  //获取用户信息接口
  queryUsreInfo: function () {
    // 页面数据初始化请求
    wx.request({
      url: 'http://yao863607738.yicp.vip:80/court/user/getUser.action',
      method: 'GET',
      data: { openId: wx.getStorageSync("openId") },
      header: {
        'content-type': 'application/json',
        'uuid': wx.getStorageSync('session'),
        "cookie": wx.getStorageSync('sessionid')},
      success: function (res) {
        console.info(res);
        wx.setStorageSync("wxNickname", res.data.wxNickname);
        wx.setStorageSync("wxCover", res.data.wxCover);
      }
    }) 
  },





   //可以封装一个保存sessinid的方法，将sessionid存储在localstorage中，定为半小时之后清空此sessionid缓存。
    saveSession: function(sessionId) {
    console.log(" now save sessionid: " + sessionId);
    wx.setStorageSync('sessionkey', sessionId); //保存sessionid
      wx.setStorageSync('sessiondate', Date.parse(new Date()))//保存当前时间，
    },
  // 过期后清除session缓存
  removeLocalSession: function() {
    wx.removeStorageSync('sessionid的key')
    wx.removeStorageSync(sessiondate)
    console.log("remove session!")
  },

  //检查sessionid是否过期的方法
  checkSessionTimeout: function() {
    var sessionid = wx.getStorageSync(sessionkey)
    if(sessionid == null || sessionid == undefined || sessionid == "") {
    console.log("session is empty")
    return false
    }
    var sessionTime = wx.getStorageSync(sessiondate)
    var aftertimestamp = Date.parse(new Date())
    if (aftertimestamp - sessionTime >= SESSION_TIMEOUT) {
      removeLocalSession()
      return false
    }
    return true
    },

  //如果sessionid过期，重新获取sessionid
  checkSessionOk: function()  {
    console.log("check session ok?...")
    var sessionOk = checkSessionTimeout()
    if(!sessionOk) {
        requestsessionid(function () {
        })
      }
    },
  //定义一个方法每隔一段时间检查sessionid是否过期

  checkcrosstime: function() {
    setInterval(checkSessionTimeout, 10*60*1000)//这个时间可以自定义。比如25 * 60 * 1000（代表25分钟）
},

globalData: {
    userInfo: null,
    webUserInfo: null
  }
})

//使用代理模式封装wx.request
wx.$request = function (option) {
  //包装一下。
  let _op = {
    complete(res) {
      //1判断并解析JSESSIONID
      let jessionid = res.header["Set-Cookie"];
      if (jessionid) {
        let start = jessionid.indexOf("JSESSIONID");
        let end = jessionid.indexOf(";", start);
        jessionid = jessionid.substring(start, end);

        //2 保存JESSIONID
        wx.setStorageSync("JSESSIONID", jessionid);
      }
    }
  };
  //3 合并参数
  for (var k in option) {
    if (k != "complete") {
      _op[k] = option[k];
    }
  }
  //4取出Cookie加入。
  let jsid = wx.getStorageSync("JSESSIONID");
  if (jsid) {
    if (!_op.header) {
      //4.1 如果未设置任何请求头。
      _op.header = { "Cookie": jsid };
    } else if (!_op.header.Cookie) {
      //4.2 如果设置请求头，但没有Cookie头。
      _op.header.Cookie = jsid;
    } else {
      //4.3 如果有Cookie请求头。
      //判断是否携带了 JSESSIONID字段，有则修改。无则追加。
      let start = _op.header.Cookie.indexOf("JSESSIONID");
      if (start == -1) {
        _op.header.Cookie += (";" + jsid);
      } else {
        let end = _op.header.Cookie.indexOf(";", start);
        if (end == -1) {
          //start~ _op.header.Cookie.length 开始替换掉。
          end = _op.header.Cookie.length;
        } else {
          //start~ end 开始替换掉。
        }
        let old_jsid = _op.header.Cookie.substring(start, end);
        _op.header.Cookie = _op.header.Cookie.replace(old_jsid, jsid);
      }
    }
  }
  //5 发出实际请求。
  wx.request(_op);
}
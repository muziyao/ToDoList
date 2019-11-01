// pages/login/login.js
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    wxNickname: '未登录',
    wxImage: '../../images/my.png',
    register_btn: '',
    authorizeInfo: '',
  },
  addTask: function(){
    wx.navigateTo({
      url: '../addtask/addtask'
    })
  },
  historyBacklog: function(){
    wx.navigateTo({
      url: '../history/history'
    })
  },
  quitRegister: function(){
    wx.clearStorageSync();
    this.setData({
      wxNickname: '',
      wxImage: '',
      register_btn: true,
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   console.info(3)
   this.setData({
     register_btn: wx.getStorageSync('register_btn')
   })
  },
  bindGetUserInfo: function (e) {
    console.info(e);
    var that = this;
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      wx.setStorageSync('register_btn', false);
      that.setData({
        register_btn: wx.getStorageSync('register_btn'),
      });
      //将登陆信息存到数据库
      this.registerLogin(e);
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
        showCancel: false,
        confirmText: '返回授权',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击了“拒绝授权”')
          }
        }
      })
    }
  },
  registerLogin: function(e){
    //插入登录的用户的相关信息到数据库
    var that = this;
    wx.login({
      success: function (r) {
        var _this = that;
        //获取code
        var code = r.code;
        console.info(code);
        //debugger;
        var userInfo = e.detail.userInfo;
        app.globalData.userInfo = userInfo;
        //获取用户信息并缓存到本地存储
        wx.setStorageSync('wxNickname', userInfo.nickName);
        wx.setStorageSync('wxCover', userInfo.avatarUrl);
        if (code) {
          //发送code到后台，分析openid
          wx.request({
            url: 'http://yao863607738.yicp.vip:80/court/user/getOpenid?code=' + code,
            method: 'GET',
            data: { wxNickname: userInfo.nickName, wxCover: userInfo.avatarUrl },
            header: {
              'content-type': 'application/json',
            },
            success: function (res) {
              //从后台返回sessionId
              wx.setStorageSync('sessiondate', Date.parse(new Date()));
              console.info(res.header["Set-Cookie"]);
              wx.setStorageSync("sessionid", res.header["Set-Cookie"]);
              console.info(res.data.userInfo);
              //debugger;
              if (res.data.status == 0) {
                //status为空时登录凭证code为空
                wx.showToast({
                  title: '登录凭证code为空...',
                  icon: "none",
                  duration: 2500
                })
              } else if (res.data.status == 1) {
                //status为1时openid已存在
              } else if (res.data.status == 2) {
                //status为2时openid不存在
              }
              wx.setStorageSync("openId", res.data.userInfo.openId);
              console.info(res.data.userInfo.openId);
              wx.switchTab({
                url: '/pages/index/index'
              });
            }
          })
        }

      }

    })
  },


  //向后台请求今日所有待办事务
  queryToDayTask: function(){
    wx.request({
      url: 'http://yao863607738.yicp.vip:80/court/task/getAllToDay.action',
      method: 'GET',
      data: { openId: wx.getStorageSync("openId") },
      header: {
        'content-type': 'application/json',
        'uuid': wx.getStorageSync('session'),
        "cookie": wx.getStorageSync('sessionid')},
      success: function (res) {
        let affair = [];
        console.info(wx.getStorageSync("openId"));
        console.log(res.data);
        for (var i = 0; i < res.data.length; i++) {
          var data = res.data[i];
          if (data.state == 1) {
            affair.push({
              affair: data.affair, accomplish: true,
              unfinished: false
            });
          } else if (data.state == 2) {
            affair.push({
              affair: data.affair, accomplish: false,
              unfinished: true
            });
          }
        }
        console.log(affair);
        wx.setStorageSync('affair', affair);
        
      }

    })
  },

  /**
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.info(4)
    console.info(wx.getStorageSync('wxNickname'));
    if(wx.getStorageSync('wxNickname')&&wx.getStorageSync('wxCover')){
      this.setData({
        wxNickname: wx.getStorageSync('wxNickname'),
        wxImage: wx.getStorageSync('wxCover'),
      })
    }else{
      wx.setStorageSync('register_btn', true);
      this.setData({
        wxNickname: '未登录',
        wxImage: '../../images/my.png',
        register_btn: wx.getStorageSync('register_btn'), 
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    wx.showShareMenu({
      withShareTicket: true
    });
    return {
      title: 'ToDoList',
      path: '/pages/login/login',
      imageUrl: '/images/icon/wechat.png',
      success: function (res) {
        if (res.errMsg == 'shareAppMessage:ok') {//判断分享是否成功
          if (res.shareTickets == undefined) {//判断分享结果是否有群信息
            //分享到好友操作...
          } else {
            //分享到群操作...
            var shareTicket = res.shareTickets[0];
            wx.getShareInfo({
              shareTicket: shareTicket,
              success: function (e) {
                //当前群相关信息
                var encryptedData = e.encryptedData;
                var iv = e.iv;
              }
            });
          }
        }
      }
    }
    
  },
})
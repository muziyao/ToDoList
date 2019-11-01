//index.js
//获取应用实例
const app = getApp();
const request = require('../../utils/util.js');

Page({
  data: {
    affair : '',
    inputText: '',
  },
  inputData: function(e){
    this.setData({
      inputText: e.detail.value
    })
  },
  onLoad: function () {
    console.info(1);
    
  },
  onShow: function(){
    console.info(2);
    var affair = [];
    var _this = this;
    // 页面数据初始化请求  
    this.setData({
      affair: ''
    })
    if(wx.getStorageSync('openId')){
      wx.request({
        url: 'http://yao863607738.yicp.vip:80/court/task/getAllToDay.action',
        method: 'GET',
        data: { openId: wx.getStorageSync("openId") },
        header: {
          'content-type': 'application/json',
          'uuid': wx.getStorageSync('session'),
          "cookie": wx.getStorageSync('sessionid')
        },
        success: function (res) {
          
          console.info(res);
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
          _this.setData({
            affair: affair,
          })
        }

      })
    }
    console.info(affair.length);
  },
})

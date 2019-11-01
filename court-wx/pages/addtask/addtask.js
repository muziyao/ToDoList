// pages/addtask/addtask.js

Page({
  data: {
    dates: '2019-10-10',
    index: 0,
    inputText: '',
  },
  //  点击日期组件确定事件  
  bindDateChange: function (e) {
    this.setData({
      dates: e.detail.value
    })
  },
  //获取输入框的值
  voteTitle: function (e) {
    this.setData({
      inputText: e.detail.value
    })
  },
  //绑定按钮事件
  setAdd: function(){
    var times = this.data.dates;
    var affair = this.data.inputText;
    //将新添加的待办事务提交到后台
    console.info(wx.getStorageSync('openId'));
    if(wx.getStorageSync('openId')){
    wx.request({
      url: 'http://yao863607738.yicp.vip:80/court/task/insert.action',
      method: 'GET',
      data: { openId: wx.getStorageSync("openId"), times: times, affair: affair},
      header: {
        'content-type': 'application/json',
        'uuid': wx.getStorageSync('session'),
        "cookie": wx.getStorageSync('sessionid')},
      success: function (res) {
        wx.switchTab({
          url: '/pages/login/login'
        });
      }
    })
    }  
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
 
})

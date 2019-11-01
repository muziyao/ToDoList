// pages/history/history.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dates: '2019-10-10',
    historyTask: '',
    historyTaskData: '',
    images: '../../images/date.png',
    deleteIcon: '../../images/deleteIcon.png',
    index: 0,
  },
  //  点击日期组件确定事件  
  bindDateChange: function (e) {
    this.setData({
      dates: e.detail.value
    })
  },
  //绑定搜索按钮事件
  getSearch: function () {
    var times = this.data.dates;
    console.info(times);
    //从后台得到指定时间的所有待办事务
    var _this = this;
    console.info("openid==" + wx.getStorageSync('openId'));
    wx.setStorageSync("queryState", 1);
    wx.$request({
      url: 'http://yao863607738.yicp.vip:80/court/task/getAllHistory.action',
      method: 'GET',
      data: { openId: wx.getStorageSync("openId"), times: times },
      header: { 
      'content-type': 'application/json',
      "cookie": wx.getStorageSync('sessionid')
      },
      success: function (res) {
        console.info(res);
        if(res.data=="session已过期"){
          wx.clearStorageSync();
          wx.switchTab({
            url: '/pages/login/login',
          })
          return;
        }
        var affair = [];
        if(res.data.length!=0){
          wx.setStorageSync("deleteTimes", res.data[0].times);
        }
        for(var i = 0; i < res.data.length; i++){
          var data = res.data[i];
          if (data.state == 1) {
            affair.push({
              id: data.id,
              affair: data.affair, accomplish: true,
              unfinished: false
            });
          } else if (data.state == 2) {
            affair.push({
              id: data.id,
              affair: data.affair, accomplish: false,
              unfinished: true
            });
          }  
        }
        
        _this.setData({
          historyTask: affair,
          historyTaskData: times
        })
      }
    })
  },
  radioChange: function(e){
    console.info(e.detail.value);
    console.info(e.currentTarget.id);
    let state = e.detail.value;//点击的该标签的value值
    let id = Number(e.currentTarget.id);//绑定的该点击事件的标签的id值
    let task = this.data.historyTask;//某个日期的所有待办事务
    let affair = task[id];//某个日期的指定序号的待办事务
    if (state == "accomplish" ){//点击了完成状态这个标签
      if(!affair.accomplish){//该标签的当前是否勾选
        this.setNewHistoryTask(id, state);
      }
    } else if (state == "unfinished" ){//点击了未完成状态这个标签
      if(!affair.unfinished){//该标签的当前是否勾选
        this.setNewHistoryTask(id, state);
      }
    }
    console.info(this.data.historyTask);
  },
  //更新待办事务的状态
  //两个参数分别为需要更新的数组下标，和当前状态
  setNewHistoryTask: function(id, state){
    let historyTasks = this.data.historyTask;
    let newHistoryTask = [];
    console.info(historyTasks)
    for(var i = 0; i < historyTasks.length; i++){
      if( i == id ){
        if( state == "accomplish" ){
          newHistoryTask.push({ id: historyTasks[i].id, affair: historyTasks[i].affair, accomplish: true, unfinished: false })
        }else if( state == "unfinished" ){
          newHistoryTask.push({ id: historyTasks[i].id, affair: historyTasks[i].affair, accomplish: false, unfinished: true } )
        }
      }else{
        newHistoryTask.push({ id: historyTasks[i].id, affair: historyTasks[i].affair, accomplish: historyTasks[i].accomplish, unfinished: historyTask[i].unfinished } )
      }
    }
    this.setData({
      historyTask: newHistoryTask
    })
  },
  //绑定删除图标
  deleteTask: function(e){
    let index = Number(e.currentTarget.id);
    let task = this.data.historyTask;
    task.splice(index,1);//从index下标开始删除，删除一个数，并返回被删除的数
    this.setData({
      historyTask: task
    });
    console.info(task.length);
  },
  //绑定保存修改按钮
  saveModification: function(){
    var newTask = this.setNewTask();
    console.info(newTask);
    console.info(wx.getStorageSync('deleteTimes'))
    if(newTask.length==0){
      newTask.push( {id: -1, times: wx.getStorageSync('deleteTimes')} )
    }
    console.info(newTask);
    var json = JSON.stringify(newTask);
    if(wx.getStorageSync('queryState')){
      wx.removeStorageSync('queryState');
    wx.request({
      url: 'http://yao863607738.yicp.vip:80/court/task/deleteTask.action',
      method: 'GET',
      data: {task: json},
      header: {
        'content-type': 'application/json',
         'uuid': wx.getStorageSync('session'),
        "cookie": wx.getStorageSync('sessionid')},
      success: function (res) {
        wx.switchTab({
          url: '/pages/login/login',
        })
      }
    })
    }
  },
  setNewTask: function(){
    let newTask = [];
    let historyTask = this.data.historyTask;
    let historyTaskData = this.data.historyTaskData;
    for(var i = 0; i < historyTask.length; i++){
      let num = 1;
      if(!historyTask[i].accomplish){
        num = 2;
      }
      newTask.push({ id: historyTask[i].id, affair: historyTask[i].affair, times: historyTaskData, state: num })
    }
    return newTask;
  }
})
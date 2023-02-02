// components/video-item/video-item.js
Component({
//  组件的属性列表
  properties: {
    itemData:{
      type:Object,
      value:{}
    }
  },
   methods: {
    onItemTap() {
      const item = this.properties.itemData
      wx.navigateTo({
        url: `/pages/detail-video/detail-video?id=${item.id}`,
      })
    }
  }
})

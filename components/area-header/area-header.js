// components/area-header/area-header.js
Component({
  properties: {
    title: {
      type: String,
      value: "默认标题"
    },
    hasMore: {
      type: Boolean,
      value: true
    }
  },
  methods: {
    onMoreTap() {
      // 将更多的点击事件传递出去
      this.triggerEvent("moreclick")
    }
  }
})
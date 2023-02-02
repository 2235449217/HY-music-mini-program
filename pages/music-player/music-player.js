// pages/music-player/music-player.js
import playerStore, { audioContext } from "../../store/playerStore"
import { throttle } from 'underscore'

const app = getApp()
const modeNames = ["order", "repeat", "random"]

Page({
  data: {
    stateKeys: ["id", "currentSong", "durationTime", "currentTime", "lyricInfos", "currentLyricText", "currentLyricIndex", "isPlaying", "playModeIndex"],

    id: 0,
    currentSong: {},
    currentTime: 0,
    durationTime: 0,
    lyricInfos: [],
    currentLyricText: "",
    currentLyricIndex: -1,
    
    isPlaying: true,
    
    playSongIndex: 0,
    playSongList: [],
    isFirstPlay: true,
    
    playModeName: "order",

    pageTitles: ["歌曲", "歌词"],
    currentPage: 0,
    contentHeight: 0,
    sliderValue: 0,
    isSliderChanging: false,
    isWaiting: false,

    lyricScrollTop: 0
  },
  onLoad(options) {
    // 0.获取设备信息
    this.setData({ 
      statusHeight: app.globalData.statusHeight,
      contentHeight: app.globalData.contentHeight
    })

    // 1.获取传入的id
    const id = options.id

    // 2.根据id播放歌曲
    if (id) {
      // 调用播放歌曲方法
      playerStore.dispatch("playMusicWithSongIdAction", id)
    }

    // 3.获取store共享数据
    // 获取store中的歌曲列表playSongList，playSongIndex
    playerStore.onStates(["playSongList", "playSongIndex"], this.getPlaySongInfosHandler)
    // 播放页面逻辑data数据
    playerStore.onStates(this.data.stateKeys, this.getPlayerInfosHandler)
  },
  // 对currentTime进行节流
  updateProgress: throttle(function(currentTime) {
    if (this.data.isSliderChanging) return
    // 1.记录当前的时间 2.修改sliderValue
    const sliderValue = currentTime / this.data.durationTime * 100
    this.setData({ currentTime, sliderValue })
  }, 800, { leading: false, trailing: false }),

  // ==================== 事件监听 ==================== 
  // 页面跳转
  onNavBackTap() {
    wx.navigateBack()
  },
  // 轮播图页面跳转
  onSwiperChange(event) {
    this.setData({ currentPage: event.detail.current })
  },
  // 自定义导航栏
  onNavTabItemTap(event) {
    const index = event.currentTarget.dataset.index
    this.setData({ currentPage: index })
  },
  // 滑块改变调用
  onSliderChange(event) {
    this.data.isWaiting = true
    setTimeout(() => {
      this.data.isWaiting = false
    }, 1500)
    // 1.获取点击滑块位置对应的value
    const value = event.detail.value

    // 2.计算出要播放的位置时间
    const currentTime = value / 100 * this.data.durationTime

    // 3.设置播放器, 播放计算出的时间
    audioContext.seek(currentTime / 1000)
    this.setData({ currentTime, isSliderChanging: false, sliderValue: value })
  },
  // 滑块开始改变调用
  // 节流throttle
  onSliderChanging: throttle(function(event) {
    // 1.获取滑动到的位置的value
    const value = event.detail.value

    // 2.根据当前的值, 计算出对应的时间
    const currentTime = value / 100 * this.data.durationTime
    this.setData({ currentTime })

    // 3.当前正在滑动
    this.data.isSliderChanging = true
  }, 100),
  // 歌曲播放记录
  onPlayOrPauseTap() {
    playerStore.dispatch("changeMusicStatusAction")
  },
  onPrevBtnTap() {
    playerStore.dispatch("playNewMusicAction", false)
  },
  onNextBtnTap() {
    playerStore.dispatch("playNewMusicAction")
  },
  onModeBtnTap() {
    playerStore.dispatch("changePlayModeAction")
  },

  // ====================== store共享数据 ====================
  // 将歌曲列表的数据存到data中
  // 将store里面的数据设置到data里面
  getPlaySongInfosHandler({ playSongList, playSongIndex }) {
    if (playSongList) {
      this.setData({ playSongList })
    }
    if (playSongIndex !== undefined) {
      this.setData({ playSongIndex })
    }
  },
  // 将store的数据存到data中
  // 将store里面的数据设置到data里面
  getPlayerInfosHandler({ 
    id, currentSong, durationTime, currentTime,
    lyricInfos, currentLyricText, currentLyricIndex,
    isPlaying, playModeIndex
  }) {
    if (id !== undefined) {
      this.setData({ id })
    }
    if (currentSong) {
      this.setData({ currentSong })
    }
    if (durationTime !== undefined) {
      this.setData({ durationTime })
    }
    if (currentTime !== undefined) {
      // 根据当前时间改变进度
      this.updateProgress(currentTime)
    }
    if (lyricInfos) {
      this.setData({ lyricInfos })
    }
    if (currentLyricText) {
      this.setData({ currentLyricText })
    }
    if (currentLyricIndex !== undefined) { 
      // 修改lyricScrollTop
      this.setData({ currentLyricIndex, lyricScrollTop: currentLyricIndex * 35 })
    }
    if (isPlaying !== undefined) {
      this.setData({ isPlaying })
    }
    if (playModeIndex !== undefined) {
      this.setData({ playModeName: modeNames[playModeIndex] })
    }
  },
  // 卸载 销毁数据
  onUnload() {
    playerStore.offStates(["playSongList", "playSongIndex"], this.getPlaySongInfosHandler)
    playerStore.offStates(this.data.stateKeys, this.getPlayerInfosHandler)
  }
})
// pages/main-music/main-music.js
import {
  getMusicBanner,
  getSongMenuList
} from "../../services/music"
import querySelect from "../../utils/query-select"
// import throttle  from '../../utils/throttle'
import {
  throttle
} from 'underscore'
import playerStore from "../../store/playerStore"
import rankingStore from "../../store/rankingStore"
import recommendStore from "../../store/recommendStore"

const querySelectThrottle = throttle(querySelect, 100)
const app = getApp()
Page({
  data: {
    searchValue: "",
    banners: [],
    bannerHeight: 0,
    recommendSongs: [],
    // 歌单数据
    hotMenuList: [],
    recMenuList: [],
    // 屏幕宽度
    screenWidth: 375,
    // 巅峰榜数据
    isRankingData: false,
    rankingInfos: {},
    // 当前正在播放的歌曲信息
    currentSong: {},
    //是否正在播放   
    isPlaying: false
  },
  onLoad() {
    this.fetchMusicBanner()
    // this.fetchRecommendSongs()
    this.fetchSongMenuList()

    // 发起action
    recommendStore.dispatch("fetchRecommendSongsAction")

    rankingStore.dispatch("fetchRankingDataAction")

    // 监听数据发生改变
    recommendStore.onState("recommendSongInfo", this.handleRecommendSongs)
    // recommendStore.onState("recommendSongs", (value)=>{
    //    //只要前六条数据
    //   this.setData({ recommendSongs: value.slice(0,6)})
    // })
    rankingStore.onState("newRanking", this.handleNewRanking)
    rankingStore.onState("originRanking", this.handleOriginRanking)
    rankingStore.onState("upRanking", this.handleUpRanking)

    playerStore.onStates(["currentSong", "isPlaying"], this.handlePlayInfos)

    // 获取屏幕的尺寸
    this.setData({
      screenWidth: app.globalData.screenWidth
    })


  },
  // 界面的事件监听方法
  onSearchClick() {
    wx.navigateTo({
      url: '/pages/detail-search/detail-search'
    })
  },
  nSongItemTap() {
    //播放列表  this.data.recommendSongs
    playerStore.setState("playSongList", this.data.recommendSongs)
  },

  // 图片加载完毕调用函数，设置高度
  onBannerImageLoad(event) {
    querySelectThrottle(".banner-image").then(res => {
      this.setData({
        bannerHeight: res[0].height
      })
    })
  },
  //接收子组件传过来的点击事件进行处理 
  onRecommendMoreClick() {
    wx.navigateTo({
      url: '/pages/detail-song/detail-song?type=recommend',
    })
  },
  // 改变音乐状态   
  onPlayOrPauseBtnTap() {
    playerStore.dispatch("changeMusicStatusAction")
  },    
  
  onPlayBarAlbumTap() {
    wx.navigateTo({
      url: '/pages/music-player/music-player',
    })
  },

  // 网络请求的方法封装
  async fetchMusicBanner() {
    const res = await getMusicBanner()
    this.setData({
      banners: res.banners
    })
  },
  // async fetchRecommendSongs() {
  //   const res = await getPlaylistDetail(3778678)
  //   const playlist = res.playlist
  //   const recommendSongs = playlist.tracks.slice  (0, 6)
  //   this.setData({ recommendSongs })
  // },
  async fetchSongMenuList() {
    getSongMenuList().then(res => {
      this.setData({
        hotMenuList: res.playlists
      })
    })
    getSongMenuList("华语").then(res => {
      this.setData({
        recMenuList: res.playlists
      })
    })
  },
  onSongItemTap(event) {
    const index = event.currentTarget.dataset.index
    console.log(event);
    //播放列表  this.data.recommendSongs
    playerStore.setState("playSongList", this.data.recommendSongs)
    playerStore.setState("playSongIndex", index)
  },

  // ====================== 从Store中获取数据 ======================
  handleRecommendSongs(value) {
    if (!value.tracks) return
    this.setData({
      recommendSongs: value.tracks.slice(0, 6)
    })
  },
  handleNewRanking(value) {
    // console.log("新歌榜:", value);
    if (!value.name) return
    this.setData({
      isRankingData: true
    })
    const newRankingInfos = {
      ...this.data.rankingInfos,
      newRanking: value
    }
    this.setData({
      rankingInfos: newRankingInfos
    })
  },
  handleOriginRanking(value) {
    // console.log("原创榜:", value);
    if (!value.name) return
    this.setData({
      isRankingData: true
    })
    const newRankingInfos = {
      ...this.data.rankingInfos,
      originRanking: value
    }
    this.setData({
      rankingInfos: newRankingInfos
    })
  },
  handleUpRanking(value) {
    // console.log("飙升榜:", value);
    if (!value.name) return
    this.setData({
      isRankingData: true
    })
    const newRankingInfos = {
      ...this.data.rankingInfos,
      upRanking: value
    }
    this.setData({
      rankingInfos: newRankingInfos
    })
  },
  handlePlayInfos({ currentSong, isPlaying }) {
    if (currentSong) {
      this.setData({ currentSong })
    }
    if (isPlaying !== undefined) {
      this.setData({ isPlaying })
    }
  },

  onUnload() {
    recommendStore.offState("recommendSongs", this.handleRecommendSongs)
    rankingStore.offState("newRanking", this.handleNewRanking)
    rankingStore.offState("originRanking", this.handleOriginRanking)
    rankingStore.offState("upRanking", this.handleUpRanking)
    playerStore.offStates(["currentSong", "isPlaying"], this.handlePlayInfos)
  }
})
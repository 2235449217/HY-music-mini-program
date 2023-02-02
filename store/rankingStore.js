import { HYEventStore } from "hy-event-store"
import { getPlaylistDetail } from "../services/music"

export const rankingsMap = {
  newRanking: 3779629,
  originRanking: 2884035,
  upRanking: 19723756
}
const rankingStore = new HYEventStore({
  // 保存数据的位置
  state: {
    newRanking: {},
    originRanking: {},
    upRanking: {}
  },
  // 发起的网络请求的位置
  actions: {
    fetchRankingDataAction(ctx) {
      // 通过遍历对象的方式请求数据
      for (const key in rankingsMap) {
        const id = rankingsMap[key]
        getPlaylistDetail(id).then(res => {
          // console.log(res);
          ctx[key] = res.playlist
        })
      }
    }
  }
})

export default rankingStore

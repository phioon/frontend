import { getTechnicalContidion, getAssetRatingRaw } from "../apis/market";
import { getDatetime } from "../utils";

export let dScoreRaw = {}


export async function getScoreRaw(stockExchange, timeInterval) {
  if (timeInterval === 'd') {
    let assetRatingRaw = await getAssetRatingRaw(stockExchange, timeInterval)
    genScore_D(assetRatingRaw)
  }
  console.log(dScoreRaw)

  return dScoreRaw;
}

function genScore_D(ratingRaw) {
  dScoreRaw = {
    lastAccessTime: getDatetime(),
    data: {}
  }

  ratingRaw.forEach(obj => {
    let score = 0;
    let date = obj.d_datetime.substring(0, 10)

    switch (obj.d_tc_despvpc) {
      // UP
      case 'D_despv_11292':
        score += 7;
        break;
      case 'D_despv_10305':
        score += 6;
        break;
      // DOWN
      case 'D_despc_91292':
        score += -7;
        break;
      case 'D_despc_90305':
        score += -6;
        break;
    }
    switch (obj.d_tc_range) {
      //UP
      case 'D_range_12584':
        score += 1.5;
        break;
      case 'D_range_11292':
        score += 1.5;
        break;
      case 'D_range_10610':
        score += 1.25;
        break;
      case 'D_range_10305':
        score += 1;
        break;
      case 'D_range_10144':
        score += 0.75;
        break;
      case 'D_range_10072':
        score += 0.5;
        break;
      //DOWN
      case 'D_range_92584':
        score += -1.5;
        break;
      case 'D_range_91292':
        score += -1.5;
        break;
      case 'D_range_90610':
        score += -1.25;
        break;
      case 'D_range_90305':
        score += -1;
        break;
      case 'D_range_90144':
        score += -0.75;
        break;
      case 'D_range_90072':
        score += -0.5;
        break;
    }
    switch (obj.d_tc_trend) {
      // UP
      case 'D_trend_10610':
        score += 1.5;
        break;
      case 'D_trend_10305':
        score += 1.25;
        break;
      case 'D_trend_10144':
        score += 1;
        break;
      case 'D_trend_10072':
        score += 0.75;
        break;
      // DOWN
      case 'D_trend_90610':
        score += -1.5;
        break;
      case 'D_trend_90305':
        score += -1.25;
        break;
      case 'D_trend_90144':
        score += -1;
        break;
      case 'D_trend_90072':
        score += -0.75;
        break;
    }

    if (score > 7 || score < -7) {
      if (!(obj.stock_exchange in dScoreRaw.data))
        dScoreRaw.data[obj.stock_exchange] = []

      dScoreRaw.data[obj.stock_exchange].push({
        date: date,
        asset: obj.asset_symbol,
        score: score,
        tc_despvpc: obj.d_tc_despvpc,
        tc_range: obj.d_tc_range,
        tc_trend: obj.d_tc_trend
      })
    }
  })
}
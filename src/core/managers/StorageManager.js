import TimeManager from "./TimeManager";
import MarketManager from "./MarketManager";

const config = {
  // syncLimit: Max time (in minutes) allowed to use stored data
  // version: Every time data structure is updated in backend, version must be updated too.
  //          Any change on VERSION will let client know it's changed and needs to be rebuilt.
  app: {
    countries: {
      syncLimit: 43200,
      version: 0.02
    },
    currencies: {
      syncLimit: 43200,
      version: 0.01
    },
    myCollections: {
      syncLimit: 60,
      version: 0.01
    },
    collections: {
      syncLimit: 60,
      version: 0.01
    },
    myStrategies: {
      syncLimit: 15,
      version: 0.03
    },
    shortcuts: {
      // Used only locally. There is no sync with DB...
      syncLimit: 0,
      version: 0.01
    },
    savedStrategies: {
      syncLimit: 15,
      version: 0.03
    },
    strategies: {
      syncLimit: 15,
      version: 0.05
    },
    positionTypes: {
      syncLimit: 43200,
      version: 0.01
    },
    positions: {
      syncLimit: 15,
      version: 0.01
    },
    subscriptions: {
      syncLimit: 43200,
      version: 0.04
    },
    userProfiles: {
      syncLimit: 2,
      version: 0.03
    },
    wallets: {
      syncLimit: 8640,
      version: 0.01
    }
  },
  auth: {
    user: {
      // 'syncLimit' could be the difference between TOKEN_TTL and MIN_REFRESH_INTERVAL (Django rest_framework),
      // but user is able to logout all devices.
      syncLimit: 1,
      version: 0.01
    },
    user_prefs: {
      syncLimit: 43200,
      version: 0.01
    }
  },
  market: {
    assets: {
      syncLimit: 12,
      version: 0.06
    },
    stockExchanges: {
      syncLimit: 43200,
      version: 0.04
    },
    technicalConditions: {
      syncLimit: 43200,
      version: 0.02
    },
    indicators: {
      syncLimit: 43200,
      version: 0.26
    },
    dRaw: {
      syncLimit: 60,
      version: 0.06
    },
    dSma: {
      syncLimit: 60,
      version: 0.06
    },
    dEma: {
      syncLimit: 60,
      version: 0.07
    },
    dQuote: {
      syncLimit: 15,
      version: 0.07
    },
    dPhibo: {
      syncLimit: 60,
      version: 0.07
    },
    dRoc: {
      syncLimit: 60,
      version: 0.07
    },
    dSetups: {
      syncLimit: 60,
      version: 0.07
    },
    dSetupStats: {
      syncLimit: 60,
      version: 0.06
    },
    m60Sma: {
      syncLimit: 15,
      version: 0.01
    },
    m60Ema: {
      syncLimit: 15,
      version: 0.01
    },
    m60Quote: {
      syncLimit: 15,
      version: 0.01
    },
    m60Phibo: {
      syncLimit: 15,
      version: 0.01
    },
    m60Roc: {
      syncLimit: 15,
      version: 0.01
    },
  },
  search: {
    multiSearch: {
      syncLimit: 60,
      version: 0.01
    },
    recentSearches: {
      // Used only locally. There is no sync with DB...
      syncLimit: 0,
      version: 0.02
    }
  }
}
let memData = {}

var cache = undefined;    // To be defined by StorageManager.initiator()
const cacheId = "phioon-app";
const strVersion = "version";              // It goes into each sKey
const strData = "data";                    // It goes into each sKey OR subKey
const strModifiedTime = "modifiedTime";    // It goes into each sKey OR subKey

const err404 = { status: 404, message: "Storage is not managed: " }
var cacheStorageNotSupported = undefined

class StorageManager {
  // CRUD
  static getRequestId(key) {
    return `/cache/${key}.json`
  }
  static async setItem(sKey, value) {
    if (cacheStorageNotSupported) {
      // Cache Storage not supported! Using Local Storage...
      return localStorage.setItem(sKey, JSON.stringify(value))
    }
    else {
      // Cache Storage supported...
      return await cache.put(this.getRequestId(sKey), new Response(JSON.stringify(value)))
    }
  }
  static async getItem(sKey, subKey) {
    let result = undefined

    if (cacheStorageNotSupported) {
      // Cache Storage not supported! Using Local Storage...

      result = localStorage.getItem(sKey)
      if (result) {
        result = JSON.parse(result)
        if (subKey)
          result = result[subKey]
      }
    }
    else {
      // Cache Storage supported...

      result = await cache.match(this.getRequestId(sKey))
      if (result) {
        result = await result.json()
        if (subKey)
          result = result[subKey]
      }
    }

    return result
  }
  static async getData(sKey, subKey) {
    let result = await this.getItem(sKey)

    if (result) {
      if (subKey) {
        if (result[subKey])
          result = result[subKey][strData]
        else
          result = null
      }
      else
        result = result[strData]
    }

    return result
  }
  static async removeItem(sKey, subKey) {
    if (subKey) {
      let sItem = await this.getItem(sKey)
      delete sItem[subKey]
      await this.setItem(sKey, sItem)
    }
    else {
      if (cacheStorageNotSupported) {
        // Cache Storage not supported! Using Local Storage...
        localStorage.removeItem(sKey)
      }
      else {
        // Cache Storage supported...
        await cache.delete(this.getRequestId(sKey))
      }
    }
  }
  static async removeData(sKey, subKey) {
    let sItem = await this.getItem(sKey)

    if (subKey)
      sItem[subKey][strData] = null
    else if (!Object.keys(sItem).includes(strData)) {
      // sItem contains [subKey] structure and [subKey] was not given
      // Cleaning up all subKeys...
      for (var k of Object.keys(sItem))
        if (sItem[k][strData])
          delete sItem[k]
    }
    else
      sItem[strData] = null

    await this.setItem(sKey, sItem)
  }

  static async isUpToDate(sModule, sKey, subKey, props) {
    // props are only used by special modules: [dRaw, dEma]

    let mTime = null
    let result = null
    let isUpToDate = undefined

    let isMarketOpen = undefined
    let isDRawCached = undefined
    let isIndicatorCached = undefined

    let sItem = await this.getItem(sKey)

    if (!sItem)
      return false

    if (subKey && sItem[subKey]) {
      mTime = sItem[subKey][strModifiedTime]
      result = sItem[subKey]
    }
    else if (subKey && !sItem[subKey])
      return false
    else {
      mTime = sItem[strModifiedTime]
      result = sItem
    }

    switch (sKey) {
      case "assets":
        isMarketOpen = await MarketManager.isMarketOpen(result[strData].stock_exchange)

        if (isMarketOpen) {
          // Market is Open
          isUpToDate = result.data && mTime &&
            TimeManager.timestampDelta(mTime, TimeManager.getUTCDatetime()) < config[sModule][sKey].syncLimit
        }
        else {
          // Market is Closed
          let isAssetUpToDate = await MarketManager.isAssetUpToDate(result[strData].stock_exchange, mTime)

          isUpToDate = isAssetUpToDate || (result.data && mTime &&
            TimeManager.timestampDelta(mTime, TimeManager.getUTCDatetime()) < config[sModule][sKey].syncLimit)
        }
        break;
      case "dQuote":
        isMarketOpen = await MarketManager.isMarketOpen(result[strData].stock_exchange)

        if (isMarketOpen) {
          // Market is Open
          isUpToDate = result.data && mTime &&
            TimeManager.timestampDelta(mTime, TimeManager.getUTCDatetime()) < config[sModule][sKey].syncLimit
        }
        else {
          // Market is Closed
          isIndicatorCached = await MarketManager.isDIndicatorCached(result[strData], subKey)

          // console.log(`${sKey}: isIndicatorCached? ${isIndicatorCached}`)

          isUpToDate = isIndicatorCached || (result.data && mTime &&
            TimeManager.timestampDelta(mTime, TimeManager.getUTCDatetime()) < config[sModule][sKey].syncLimit)
        }
        break;
      case "dRaw":
        isDRawCached = await MarketManager.isDRawCached(result[strData], props.dateFrom, props.dateTo)

        isUpToDate = isDRawCached || (result.data && mTime &&
          TimeManager.timestampDelta(mTime, TimeManager.getUTCDatetime()) < config[sModule][sKey].syncLimit)
        break;
      default:
        let dIndicators = ["dEma", "dPhibo", "dRoc"]

        if (dIndicators.includes(sKey)) {
          // It's a indicator storage (used by Strategy module)
          isIndicatorCached = await MarketManager.isDIndicatorCached(result[strData], subKey)

          // console.log(`${sKey}: isIndicatorCached? ${isIndicatorCached}`)

          isUpToDate = isIndicatorCached || (result.data && mTime &&
            TimeManager.timestampDelta(mTime, TimeManager.getUTCDatetime()) < config[sModule][sKey].syncLimit)
        }
        else {
          // REMEMBER: ALWAYS RESPECT 'SYNCLIMIT' TIME !
          // Let's suppose Backend doesn't have the requested data up to date. The client shouldn't ask for it a couple times
          // whithin few seconds.

          isUpToDate = result.data && mTime &&
            TimeManager.timestampDelta(mTime, TimeManager.getUTCDatetime()) < config[sModule][sKey].syncLimit
        }
        break;
    }

    if (isUpToDate)
      return result

    return false
  }

  static async store(sKey, data, subKey) {
    let sItem = await this.getItem(sKey)
    let result = null

    for (let [k0, v0] of Object.entries(config)) {
      if (sItem && v0[sKey]) {
        if (subKey) {
          if (!sItem[subKey])                               // If subKey doesn't exist yet, create it
            sItem[subKey] = {}
          sItem[subKey][strData] = data
          sItem[subKey][strModifiedTime] = TimeManager.getUTCDatetime()
          result = sItem[subKey]
        }
        else {
          sItem[strData] = data
          sItem[strModifiedTime] = TimeManager.getUTCDatetime()
          result = sItem
        }
        await this.setItem(sKey, sItem)
        return result
      }
    }
    return err404.message += sKey
  }
  static async cleanUp(sModule) {
    for (let [k0, v0] of Object.entries(config)) {
      if (k0 == sModule || sModule == "all") {
        for (let [k1, v1] of Object.entries(v0))
          await this.removeItem(k1)
      }
    }
  }
  static sConfigModule(sModule) {
    if (config[sModule])
      return config[sModule]

    return err404.message += sKey
  }
  static loadIntoMemory(sKey) {
    // NEED TO TEST
    let sItem = null

    if (!sKey) {
      for (let [k0, v0] of Object.entries(config)) {
        for (let [k1, v1] of Object.entries(v0))
          memData[k1] = v1
      }
    }
    else {
      sItem = JSON.parse(localStorage.getItem(sKey))
      memData[sKey] = sItem
    }
    console.log("Using memory...")
  }
  async initiator() {
    if ('caches' in window)
      cache = await window.caches.open(cacheId)
    else if ('caches' in self)
      cache = await self.caches.open(cacheId)
    else {
      cacheStorageNotSupported = true
      console.log(`Cache Storage not supported. Using Local Storage...`)
    }

    for (let [k0, v0] of Object.entries(config)) {
      for (let [k1, v1] of Object.entries(v0)) {
        let storage = await this.constructor.getItem(k1)
        let rebuildIt = undefined

        if (storage && storage[strVersion] === v1[strVersion])
          rebuildIt = false
        else
          rebuildIt = true

        if (rebuildIt)
          await this.constructor.setItem(k1, { version: v1[strVersion] })
      }
    }
  }
}

export default StorageManager;
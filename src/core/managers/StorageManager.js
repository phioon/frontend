import TimeManager from "./TimeManager";
import MarketManager from "./MarketManager";

const config = {
  // syncLimit: Max time (in minutes) allowed to use stored data
  // version: Every time data structure is updated in backend, version must be updated too.
  //          Any change on VERSION will let client know it's changed and needs to be rebuilt.
  app: {
    countries: {
      syncLimit: 8640,
      version: 0.01
    },
    currencies: {
      syncLimit: 8640,
      version: 0.01
    },
    subscriptions: {
      syncLimit: 8640,
      version: 0.01
    },
    positionTypes: {
      syncLimit: 8640,
      version: 0.01
    },
    positions: {
      syncLimit: 10,
      version: 0.01
    },
    wallets: {
      syncLimit: 60,
      version: 0.01
    },
  },
  auth: {
    user: {
      // 'syncLimit' could be the difference between TOKEN_TTL and MIN_REFRESH_INTERVAL (Django rest_framework),
      // but user is able to logout all devices.
      syncLimit: 0,
      version: 0.01
    },
    user_prefs: {
      syncLimit: 8640,
      version: 0.01
    }
  },
  market: {
    assets: {
      syncLimit: 10,
      version: 0.03
    },
    dEma: {
      syncLimit: 60,
      version: 0.01
    },
    dPhibo: {
      syncLimit: 60,
      version: 0.01
    },
    dRaw: {
      syncLimit: 60,
      version: 0.02
    },
    dSetups: {
      syncLimit: 60,
      version: 0.06
    },
    dSetupSummary: {
      syncLimit: 60,
      version: 0.05
    },
    stockExchanges: {
      syncLimit: 8640,
      version: 0.01
    },
    technicalConditions: {
      syncLimit: 8640,
      version: 0.01
    },
  }
}
let memData = {}
const strVersion = "version";              // It goes into each sKey
const strData = "data";                    // It goes into each sKey OR subKey
const strModifiedTime = "modifiedTime";    // It goes into each sKey OR subKey

const err404 = { status: 404, message: "Storage is not managed: " }

let isStorageDisabled = false

class StorageManager {
  constructor() {
    this.initiator()
  }

  // CRUD
  static setItem(key, value) {
    if (isStorageDisabled)
      memData[key] = value
    else {
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch (e) {
        console.log("Failed to update storage " + k1 + ": " + e)
        if (e == "QUOTA_EXCEEDED_ERR") {
          isStorageDisabled = true
          this.constructor.loadIntoMemory()
        }
      }
    }

  }
  static getItem(sKey, subKey) {
    if (isStorageDisabled) {
      if (subKey)
        return memData[sKey][subKey];
      return memData[sKey]
    }
    else {
      if (subKey)
        return JSON.parse(localStorage.getItem(sKey))[subKey];
      return JSON.parse(localStorage.getItem(sKey));
    }
  }
  static getData(sKey, subKey) {
    if (isStorageDisabled) {
      if (subKey)
        return memData[sKey][subKey] ? memData[sKey][subKey][strData] : null
      return memData[sKey] ? memData[sKey][strData] : null
    }
    else {
      if (subKey)
        return JSON.parse(localStorage.getItem(sKey))[subKey] ? JSON.parse(localStorage.getItem(sKey))[subKey][strData] : null
      return JSON.parse(localStorage.getItem(sKey)) ? JSON.parse(localStorage.getItem(sKey))[strData] : null
    }
  }
  static removeItem(sKey, subKey) {
    if (subKey) {
      let sItem = this.getItem(sKey)
      delete sItem[subKey]
      this.setItem(sKey, sItem)
    }
    else {
      if (isStorageDisabled)
        delete memData[sKey]
      else
        localStorage.removeItem(sKey)
    }
  }
  static removeData(sKey, subKey) {
    if (subKey) {
      if (isStorageDisabled)
        memData[sKey][subKey][strData] = {}
      else {
        let sItem = this.getItem(sKey)
        sItem[subKey][strData] = null
        this.setItem(sKey, sItem)
      }
    }
    else {
      if (isStorageDisabled)
        memData[sKey][strData] = {}
      else {
        let sItem = this.getItem(sKey)
        sItem[strData] = null
        this.setItem(sKey, sItem)
      }
    }
  }

  static isUpToDate(sModule, sKey, subKey, dateFrom, dateTo) {
    // 'dateFrom' and 'dateTo' are used only by sKeys ['dRaw']
    let mTime = null
    let result = null
    let isUpToDate = false

    let sItem = this.getItem(sKey)

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
        let isMarketOpen = MarketManager.isMarketOpen(result[strData].stockExchange)

        if (isMarketOpen) {
          // Market is Open
          isUpToDate = result.data && mTime &&
            TimeManager.timestampDelta(mTime, TimeManager.getUTCDatetime()) < config[sModule][sKey].syncLimit
        }
        else {
          // Market is Closed
          let isAssetUpToDate = MarketManager.isAssetUpToDate(result[strData].stockExchange, mTime)
          isUpToDate = isAssetUpToDate || (result.data && mTime &&
            TimeManager.timestampDelta(mTime, TimeManager.getUTCDatetime()) < config[sModule][sKey].syncLimit)
        }
        break;
      case "dRaw":
        let isDRawCached = MarketManager.isDRawCached(result[strData], dateFrom, dateTo)
        isUpToDate = isDRawCached || (result.data && mTime &&
          TimeManager.timestampDelta(mTime, TimeManager.getUTCDatetime()) < config[sModule][sKey].syncLimit)
        break;
      default:
        // REMEMBER: ALWAYS RESPECT 'SYNCLIMIT' TIME !
        // Let's suppose the Backend doesn't have it up to date. So, the client won't ask for it a couple times
        // whithin few seconds.
        isUpToDate = result.data && mTime &&
          TimeManager.timestampDelta(mTime, TimeManager.getUTCDatetime()) < config[sModule][sKey].syncLimit
        break
    }

    if (isUpToDate)
      return result

    return false
  }

  static store(sKey, data, subKey) {
    let sItem = this.getItem(sKey)
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
        this.setItem(sKey, sItem)
        return result
      }
    }
    return err404.message += sKey
  }
  static cleanUp(sModule) {
    for (let [k0, v0] of Object.entries(config)) {
      if (k0 == sModule || sModule == "all") {
        for (let [k1, v1] of Object.entries(v0))
          this.removeItem(k1)
      }
    }
  }
  static isStorageDisabled() {
    return isStorageDisabled;
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
    console.log("It started using memory.")
  }
  initiator() {
    for (let [k0, v0] of Object.entries(config)) {
      for (let [k1, v1] of Object.entries(v0)) {
        let rebuildIt = null
        let storage = null
        let sVersion = 0.00

        try {
          storage = this.constructor.getItem(k1)
          sVersion = storage[strVersion]
          rebuildIt = sVersion === v1[strVersion] ? false : true
        } catch {
          rebuildIt = true
        }

        if (rebuildIt) {
          try {
            this.constructor.setItem(k1, { version: v1[strVersion] })
          } catch (e) {
            console.log("Failed to create storage " + k1 + ": " + e)
            if (e == "QUOTA_EXCEEDED_ERR") {
              isStorageDisabled = true
              this.constructor.loadIntoMemory()
              break;
            }
          }
        }
      }
    }
  }
}

export default StorageManager;
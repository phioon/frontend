import AuthManager from "./AuthManager";
import StorageManager from "./StorageManager";
import TimeManager from "./TimeManager";
import {
  deepCloneObj,
  httpRequest,
  joinObjLists,
  joinContentObjLists,
  orderBy,
  retrieveObjFromObjList,
  sleep
} from "../utils";

class MarketManager {
  constructor(getHttpTranslation) {
    this.getHttpTranslation = getHttpTranslation
    this.sModule = "market"
    this.apis = {
      wsAssets: {
        options: {
          headers: {
            "Content-Type": "application/json",
            "Authorization": ""
          },
          data: {
            detailed: undefined,
            stockExchange: undefined,
            assets: undefined
          },
        },
        method: "post",
        request: "/api/market/assets/"
      },
      wsIndicators: {
        options: {
          headers: {
            "Content-Type": "application/json",
            "Authorization": ""
          }
        },
        method: "get",
        request: "/api/market/indicators/"
      },
      wsQuote: {
        options: {
          headers: {
            "Content-Type": "application/json",
            "Authorization": ""
          },
          params: {
            stockExchange: undefined,
            interval: undefined,
            instances: undefined,
            lastPeriods: undefined
          }
        },
        method: "get",
        request: "/api/market/<timeInterval>/quote/"
      },
      wsSma: {
        options: {
          headers: {
            "Content-Type": "application/json",
            "Authorization": ""
          },
          params: {
            stockExchange: undefined,
            interval: undefined,
            instances: undefined,
            lastPeriods: undefined
          }
        },
        method: "get",
        request: "/api/market/<timeInterval>/sma/"
      },
      wsEma: {
        options: {
          headers: {
            "Content-Type": "application/json",
            "Authorization": ""
          },
          params: {
            stockExchange: undefined,
            interval: undefined,
            instances: undefined,
            lastPeriods: undefined
          }
        },
        method: "get",
        request: "/api/market/<timeInterval>/ema/"
      },
      wsPhibo: {
        options: {
          headers: {
            "Content-Type": "application/json",
            "Authorization": ""
          },
          params: {
            stockExchange: undefined,
            interval: undefined,
            instances: undefined,
            lastPeriods: undefined
          }
        },
        method: "get",
        request: "/api/market/<timeInterval>/phibo/"
      },
      wsRaw: {
        options: {
          headers: {
            "Content-Type": "application/json",
            "Authorization": ""
          },
          params: {
            detailed: undefined,
            asset: undefined,
            dateFrom: undefined,
            dateTo: undefined
          },
        },
        method: "get",
        request: "/api/market/<timeInterval>/raw/"
      },
      wsRoc: {
        options: {
          headers: {
            "Content-Type": "application/json",
            "Authorization": ""
          },
          params: {
            stockExchange: undefined,
            interval: undefined,
            instances: undefined,
            lastPeriods: undefined
          }
        },
        method: "get",
        request: "/api/market/<timeInterval>/roc/"
      },
      wsSetups: {
        options: {
          headers: {
            "Content-Type": "application/json",
            "Authorization": ""
          },
          params: {
            stockExchange: undefined,
            dateFrom: undefined
          },
        },
        method: "get",
        request: "/api/market/<timeInterval>/setups/"
      },
      wsSetupStats: {
        options: {
          headers: {
            "Content-Type": "application/json",
            "Authorization": ""
          },
          params: {
            stockExchange: undefined
          },
        },
        method: "get",
        request: "/api/market/<timeInterval>/setup_stats/"
      },
      wsStockExchanges: {
        options: {
          headers: {
            "Content-Type": "application/json",
            "Authorization": ""
          }
        },
        method: "get",
        request: "/api/market/stock_exchanges/"
      },
      wsTechnicalConditions: {
        options: {
          headers: {
            "Content-Type": "application/json",
            "Authorization": ""
          }
        },
        method: "get",
        request: "/api/market/technical_conditions/"
      },
    }
    this.workingOffline = false
    this.rQueue = []
  }
  async startRequest(sKey) {
    let waitTime = 200
    let waitTimeLimit = 3000
    let waitedTime = 0

    while (this.rQueue.includes(sKey) && waitedTime <= waitTimeLimit) {
      // console.log(sKey + " waiting... rQueue: [" + this.rQueue + "]")
      await sleep(waitTime)
      waitedTime += waitTime
    }
    this.rQueue.push(sKey)
  }
  finishRequest(sKey) {
    this.rQueue.splice(this.rQueue.indexOf(sKey), 1)
  }

  // Asset
  async assetList(detailed = false, assets = [], se_short) {
    // [detailed] is the flag used to identify whether it's been called for user's assets or for a general call.
    // Client must pass 'assets' or 'stockExchange'. One of these 2 parameters are required.
    if (assets.length == 0 && !se_short)
      return {}
    const sKey = "assets"
    await this.startRequest(sKey)

    let sData = {}
    let syncList = []
    let result = undefined

    // StockExchange: Prepare list of assets to be used forward.
    if (se_short) {
      assets = await StorageManager.getItem(sKey)
      delete assets.version                 // Removes first position (key 'version')

      for (var [k, v] of Object.entries(assets))
        if (v.data.stock_exchange != se_short)
          delete assets[k]

      assets = Object.keys(assets)
    }

    // Assets
    if (assets.length > 0)
      for (var a of assets) {
        result = await StorageManager.isUpToDate(this.sModule, sKey, a)

        if (result) {                       // We have it cached and up to date?
          if (detailed) {                   // Client is requesting detailed info?
            if (result.data.price && result.data.last_trade_time) {
              // We have detailed info? ('last_trade_time' is a detailed info)
              sData[a] = result             // Return it
            }
            else                            // We don't have it detailed
              syncList.push(a)              // Insert Asset into syncList
          }
          else {                            // Client needs basic info only
            if (result.data.price)
              sData[a] = result             // Return it
            else
              syncList.push(a)
          }
        }
        else
          syncList.push(a)                  // Insert Asset into syncList
      }

    if (syncList.length > 0) {
      let wsInfo = this.getApi("wsAssets")
      wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()
      wsInfo.options.data = {
        detailed: detailed,
        stockExchange: se_short,
        assets: syncList,
      }

      result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers, undefined, wsInfo.options.data)

      if (result.status == 200)
        for (let obj of result.data)
          sData[obj.asset_symbol] = await StorageManager.store(sKey, obj, obj.asset_symbol)
      else {
        this.getHttpTranslation(result, "assetList", "asset", true)
        sData = await this.offlineAssetList(assets)
      }
    }

    this.finishRequest(sKey)
    return sData
  }
  async assetData(assets = []) {
    let data = []
    let sItem = await this.assetList(false, assets)

    for (var obj of Object.values(sItem))
      data.push(obj.data)

    return data
  }
  async offlineAssetList(assets) {
    const sKey = "assets"
    let sData = {}

    for (var a of assets)
      sData[a] = await StorageManager.getItem(sKey, a)
    return sData
  }
  async assetRetrieve(pk, detailed = false) {
    let sItem = await this.assetList(detailed, [pk])
    return sItem[pk] ? sItem[pk].data : null
  }
  // .. Dimensions
  async assetAsSelectDimension(assets = []) {
    let sData = await this.assetData(assets)
    let dimension = { id: "mAssets", data: [], selected: [] }
    let data = []
    let assetAsKey = {}
    let dAssets = "pAssets"
    let dSectors = "sectors"

    if (sData) {
      for (var obj of Object.values(sData)) {
        if (!assetAsKey[obj.asset_label]) {
          assetAsKey[obj.asset_label] = {}

          assetAsKey[obj.asset_label].value = obj.asset_symbol
          assetAsKey[obj.asset_label].label = obj.asset_label

          assetAsKey[obj.asset_label].links = {}
          assetAsKey[obj.asset_label].links[dAssets] = []
          assetAsKey[obj.asset_label].links[dSectors] = []
        }

        assetAsKey[obj.asset_label].links[dAssets].push(obj.asset_symbol)
        assetAsKey[obj.asset_label].links[dSectors].push(obj.sector_id)
      }

      for (let [k, v] of Object.entries(assetAsKey))
        data.push(v)

      dimension.data = data
    }

    return dimension
  }
  async sectorAsSelectDimension(assets = []) {
    let sData = await this.assetData(assets)
    let dimension = { id: "sectors", data: [], selected: [] }
    let data = []
    let sectorAsKey = {}
    let dAssets = "mAssets"

    if (sData) {
      for (var obj of Object.values(sData)) {
        if (!sectorAsKey[obj.sector_id]) {
          sectorAsKey[obj.sector_id] = {}

          sectorAsKey[obj.sector_id].value = obj.sector_id
          sectorAsKey[obj.sector_id].label = obj.sector_id

          sectorAsKey[obj.sector_id].links = {}
          sectorAsKey[obj.sector_id].links[dAssets] = []
        }

        sectorAsKey[obj.sector_id].links[dAssets].push(obj.asset_symbol)
      }

      for (let [k, v] of Object.entries(sectorAsKey))
        data.push(v)

      data = orderBy(data, ["label"])
      dimension.data = data
    }

    return dimension
  }
  // .. Selects
  async assetsForSelect(se_short) {
    let options = []

    let stockExchange = await this.stockExchangeRetrieve(se_short)

    for (var asset_symbol of stockExchange.assets) {
      let option = {
        value: asset_symbol,
        label: asset_symbol.includes('.') ? asset_symbol.substring(0, asset_symbol.indexOf('.')) : asset_symbol
      }
      options.push(option)
    }

    options = orderBy(options, ["label"])
    return options
  }
  // .. Functions
  static async isAssetUpToDate(strStockExchange, mTime) {
    // Check if it's needed to update Asset ONLY when Market is closed.
    let stockExchanges = await StorageManager.getData("stockExchanges")
    let stockExchange = retrieveObjFromObjList(stockExchanges, "se_short", strStockExchange)

    if (stockExchange) {
      let tz = stockExchange.timezone
      let tz_now = TimeManager.tzConvert(tz, new Date())
      let tz_mTime = TimeManager.tzConvert(tz, TimeManager.getMoment(mTime))
      let now_weekDay = TimeManager.tzGetWeekday(tz, tz_now)

      if ([1, 2, 3, 4, 5].includes(now_weekDay)) {
        // Today is a weekday
        let now_mAfterMarketOpens = TimeManager.timeDiff(tz_now.format("HH:mm:ss"), stockExchange.start_time)
        let now_mAfterMarketCloses = TimeManager.timeDiff(tz_now.format("HH:mm:ss"), stockExchange.end_time)

        if (now_mAfterMarketOpens < 0) {
          // It's morning. Market didn't open yet.
          let now_date = TimeManager.getDateString(tz_now)
          let mTime_date = TimeManager.getDateString(tz_mTime)

          if (now_date == mTime_date) {
            // Asset has been updated today already.
            return true
          }
          else {
            // Asset has not been updated today yet.
            return this.isLastPriceStored(stockExchange, tz_mTime)
          }
        }
        else if (now_mAfterMarketCloses >= 60) {
          // It's evening. Market is closed.
          return this.isLastPriceStored(stockExchange, tz_mTime)
        }
      }
      else {
        // Today is weekend
        return this.isLastPriceStored(stockExchange, tz_mTime)
      }
    }

    return false
  }
  static isLastPriceStored(stockExchange, tz_mTime) {
    // Keep in mind that at this point, market is always closed...

    if (stockExchange) {
      let tz = stockExchange.timezone
      let endTime = TimeManager.getTzMoment(String(tz_mTime.format("YYYY-MM-DD") + "T" + stockExchange.end_time), tz)
      let mTime_weekDay = TimeManager.tzGetWeekday(tz, tz_mTime)

      let syncTolerance = 60 * 12
      switch (mTime_weekDay) {
        case 5:
          // Friday
          syncTolerance = (1440 * 2) + (60 * 12)
          break;
        case 6:
          // Saturday
          syncTolerance = (1440 * 1) + (60 * 12)
          break;
      }

      // console.log(`tz_mTime: ${tz_mTime}`)
      // console.log(`endTime: ${endTime}`)

      // console.log(`syncTolerance: ${syncTolerance}`)
      // console.log(`diff: ${TimeManager.timestampDiff(endTime)}`)

      if ([1, 2, 3, 4, 5].includes(mTime_weekDay)) {
        // Last time it was modified was a weekday
        let mAfterMarketCloses = TimeManager.timestampDiff(tz_mTime, endTime)

        if (mAfterMarketCloses >= 60 && TimeManager.timestampDiff(endTime) > -syncTolerance) {
          // Price has been updated after market was closed.
          // Time difference between endTime and now is under tolerance
          return true
        }
      }
      else {
        // Last time it was modified was on Weekend
        if (TimeManager.timestampDiff(endTime) > -syncTolerance)
          return true
      }
    }

    return false
  }

  // Strategies
  // .. Indicators
  async indicatorList() {
    const sKey = "indicators"
    await this.startRequest(sKey)

    let wsInfo = this.getApi("wsIndicators")
    let result = await StorageManager.isUpToDate(this.sModule, sKey)

    if (result) {
      this.finishRequest(sKey)
      return result
    }

    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()

    result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers, wsInfo.options.params)

    if (result.status == 200) {
      result = result.data
      result = await StorageManager.store(sKey, result)
    }
    else {
      this.getHttpTranslation(result, "indicatorList", undefined, true)
      result = await StorageManager.getItem(sKey)
    }

    this.finishRequest(sKey)
    return result
  }
  async indicatorData() {
    let sItem = await this.indicatorList()

    if (sItem && sItem.data)
      return sItem.data

    // Return it with http error details
    return sItem
  }
  async indicatorRetrieve(pk) {
    let sItem = await this.indicatorList()

    if (sItem.data)
      return retrieveObjFromObjList(sItem.data, "id", pk)

    // Return it with http error details
    return sItem
  }
  async offlineIndicatorRetrieve(pk) {
    let sKey = "indicators"
    let sData = await StorageManager.getData(sKey)

    return retrieveObjFromObjList(sData, "id", pk)
  }
  // .. Quote
  async quoteList(stockExchange, interval = "d", instances = [], lastPeriods = 1) {
    // Both 'stockExchange' and 'instances' are required.
    if (!stockExchange || instances.length == 0)
      return {}

    console.log(`stockExchange: ${stockExchange}`)

    interval = String(interval).toLowerCase()
    const sKey = `${interval}Quote`
    await this.startRequest(sKey)

    let sItem = await StorageManager.isUpToDate(this.sModule, sKey, stockExchange, { instances })
    let notCachedInstances = deepCloneObj(instances)

    if (sItem) {
      // sData is up to date
      notCachedInstances = this.getNotCachedInstances(sItem.data.iSummary, instances, lastPeriods)

      if (notCachedInstances.length == 0) {
        // Everything is ready
        this.finishRequest(sKey)
        return sItem
      }
    }

    let wsInfo = this.getApi("wsQuote")
    wsInfo.request = wsInfo.request.replace("<timeInterval>", interval)
    wsInfo.request += "latest/"
    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()
    wsInfo.options.params = {
      stockExchange: stockExchange,
      lastPeriods: lastPeriods,
      instances: notCachedInstances.join(",")
    }

    let result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers, wsInfo.options.params)

    if (result.status == 200) {
      result = result.data
      result.stock_exchange = stockExchange

      if (sItem) {
        // Stored data may be up to date, but stored instances are not enough. 
        // So, we must sync the missing instances and join the data with the stored instances.
        result.data = joinContentObjLists(result.data, sItem.data.data, "asset_symbol")
        result.iSummary = this.iSummaryGenerator(sItem.data.iSummary, instances, lastPeriods)
      }
      else
        result.iSummary = this.iSummaryGenerator({}, instances, lastPeriods)

      result = await StorageManager.store(sKey, result, stockExchange)
    }
    else {
      this.getHttpTranslation(result, "quoteList", sKey, true)
    }

    this.finishRequest(sKey)
    return result
  }
  async quoteData(stockExchange, interval, instances, lastPeriods) {
    let sItem = await this.quoteList(stockExchange, interval, instances, lastPeriods)

    if (sItem && sItem.data)
      return sItem.data

    // Return it with http error details
    return sItem
  }
  // .. SMA
  async smaList(stockExchange, interval = "d", instances = [], lastPeriods = 1) {
    // Both 'stockExchange' and 'instances' are required.
    if (!stockExchange || instances.length == 0)
      return {}

    const sKey = `${interval}Sma`
    await this.startRequest(sKey)

    let sItem = await StorageManager.isUpToDate(this.sModule, sKey, stockExchange, { instances })
    let notCachedInstances = deepCloneObj(instances)

    if (sItem) {
      // sData is up to date
      notCachedInstances = this.getNotCachedInstances(sItem.data.iSummary, instances, lastPeriods)

      if (notCachedInstances.length == 0) {
        // Everything is ready
        this.finishRequest(sKey)
        return sItem
      }
    }

    let wsInfo = this.getApi("wsSma")
    wsInfo.request = wsInfo.request.replace("<timeInterval>", interval)
    wsInfo.request += "latest/"
    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()
    wsInfo.options.params = {
      stockExchange: stockExchange,
      lastPeriods: lastPeriods,
      instances: notCachedInstances.join(",")
    }

    let result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers, wsInfo.options.params)

    if (result.status == 200) {
      result = result.data
      result.stock_exchange = stockExchange

      if (sItem) {
        // Stored data may be up to date, but stored instances are not enough. 
        // So, we must sync the missing instances and join the data with the stored instances.
        result.data = joinContentObjLists(result.data, sItem.data.data, "asset_symbol")
        result.iSummary = this.iSummaryGenerator(sItem.data.iSummary, instances, lastPeriods)
      }
      else
        result.iSummary = this.iSummaryGenerator({}, instances, lastPeriods)

      result = await StorageManager.store(sKey, result, stockExchange)
    }
    else {
      this.getHttpTranslation(result, "smaList", sKey, true)
    }

    this.finishRequest(sKey)
    return result
  }
  async smaData(stockExchange, interval, instances, lastPeriods) {
    let sItem = await this.smaList(stockExchange, interval, instances, lastPeriods)

    if (sItem && sItem.data)
      return sItem.data

    // Return it with http error details
    return sItem
  }
  // .. EMA
  async emaList(stockExchange, interval = "d", instances = [], lastPeriods = 1) {
    // Both 'stockExchange' and 'instances' are required.
    if (!stockExchange || instances.length == 0)
      return {}

    const sKey = `${interval}Ema`
    await this.startRequest(sKey)

    let sItem = await StorageManager.isUpToDate(this.sModule, sKey, stockExchange, { instances })
    let notCachedInstances = deepCloneObj(instances)

    if (sItem) {
      // sData is up to date
      notCachedInstances = this.getNotCachedInstances(sItem.data.iSummary, instances, lastPeriods)

      if (notCachedInstances.length == 0) {
        // Everything is ready
        this.finishRequest(sKey)
        return sItem
      }
    }

    let wsInfo = this.getApi("wsEma")
    wsInfo.request = wsInfo.request.replace("<timeInterval>", interval)
    wsInfo.request += "latest/"
    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()
    wsInfo.options.params = {
      stockExchange: stockExchange,
      lastPeriods: lastPeriods,
      instances: notCachedInstances.join(",")
    }

    let result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers, wsInfo.options.params)

    if (result.status == 200) {
      result = result.data
      result.stock_exchange = stockExchange

      if (sItem) {
        // Stored data may be up to date, but stored instances are not enough. 
        // So, we must sync the missing instances and join the data with the stored instances.
        result.data = joinContentObjLists(result.data, sItem.data.data, "asset_symbol")
        result.iSummary = this.iSummaryGenerator(sItem.data.iSummary, instances, lastPeriods)
      }
      else
        result.iSummary = this.iSummaryGenerator({}, instances, lastPeriods)

      result = await StorageManager.store(sKey, result, stockExchange)
    }
    else {
      this.getHttpTranslation(result, "emaList", sKey, true)
    }

    this.finishRequest(sKey)
    return result
  }
  async emaData(stockExchange, interval, instances, lastPeriods) {
    let sItem = await this.emaList(stockExchange, interval, instances, lastPeriods)

    if (sItem && sItem.data)
      return sItem.data

    // Return it with http error details
    return sItem
  }
  // .. Phibo
  async phiboList(stockExchange, interval = "d", instances = [], lastPeriods = 1) {
    // Both 'stockExchange' and 'instances' are required.
    if (!stockExchange || instances.length == 0)
      return {}

    const sKey = `${interval}Phibo`
    await this.startRequest(sKey)

    let sItem = await StorageManager.isUpToDate(this.sModule, sKey, stockExchange, { instances })
    let notCachedInstances = deepCloneObj(instances)

    if (sItem) {
      // sData is up to date
      notCachedInstances = this.getNotCachedInstances(sItem.data.iSummary, instances, lastPeriods)

      if (notCachedInstances.length == 0) {
        // Everything is ready
        this.finishRequest(sKey)
        return sItem
      }
    }

    let wsInfo = this.getApi("wsPhibo")
    wsInfo.request = wsInfo.request.replace("<timeInterval>", interval)
    wsInfo.request += "latest/"
    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()
    wsInfo.options.params = {
      stockExchange: stockExchange,
      lastPeriods: lastPeriods,
      instances: notCachedInstances.join(",")
    }

    let result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers, wsInfo.options.params)

    if (result.status == 200) {
      result = result.data
      result.stock_exchange = stockExchange

      if (sItem) {
        // Stored data may be up to date, but stored instances are not enough. 
        // So, we must sync the missing instances and join the data with the stored instances.
        result.data = joinContentObjLists(result.data, sItem.data.data, "asset_symbol")
        result.iSummary = this.iSummaryGenerator(sItem.data.iSummary, instances, lastPeriods)
      }
      else
        result.iSummary = this.iSummaryGenerator({}, instances, lastPeriods)

      result = await StorageManager.store(sKey, result, stockExchange)
    }
    else {
      this.getHttpTranslation(result, "phiboList", sKey, true)
    }

    this.finishRequest(sKey)
    return result
  }
  async phiboData(stockExchange, interval, instances, lastPeriods) {
    let sItem = await this.phiboList(stockExchange, interval, instances, lastPeriods)

    if (sItem && sItem.data)
      return sItem.data

    // Return it with http error details
    return sItem
  }
  // .. ROC
  async rocList(stockExchange, interval = "d", instances = [], lastPeriods = 1) {
    // Both 'stockExchange' and 'instances' are required.
    if (!stockExchange || instances.length == 0)
      return {}

    const sKey = `${interval}Roc`
    await this.startRequest(sKey)

    let sItem = await StorageManager.isUpToDate(this.sModule, sKey, stockExchange, { instances })
    let notCachedInstances = deepCloneObj(instances)

    if (sItem) {
      // sData is up to date
      notCachedInstances = this.getNotCachedInstances(sItem.data.iSummary, instances, lastPeriods)

      if (notCachedInstances.length == 0) {
        // Everything is ready
        this.finishRequest(sKey)
        return sItem
      }
    }

    let wsInfo = this.getApi("wsRoc")
    wsInfo.request = wsInfo.request.replace("<timeInterval>", interval)
    wsInfo.request += "latest/"
    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()
    wsInfo.options.params = {
      stockExchange: stockExchange,
      lastPeriods: lastPeriods,
      instances: notCachedInstances.join(",")
    }

    let result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers, wsInfo.options.params)

    if (result.status == 200) {
      result = result.data
      result.stock_exchange = stockExchange

      if (sItem) {
        // Stored data may be up to date, but stored instances are not enough. 
        // So, we must sync the missing instances and join the data with the stored instances.
        result.data = joinContentObjLists(result.data, sItem.data.data, "asset_symbol")
        result.iSummary = this.iSummaryGenerator(sItem.data.iSummary, instances, lastPeriods)
      }
      else
        result.iSummary = this.iSummaryGenerator({}, instances, lastPeriods)

      result = await StorageManager.store(sKey, result, stockExchange)
    }
    else {
      this.getHttpTranslation(result, "rocList", sKey, true)
    }

    this.finishRequest(sKey)
    return result
  }
  async rocData(stockExchange, interval, instances, lastPeriods) {
    let sItem = await this.rocList(stockExchange, interval, instances, lastPeriods)

    if (sItem && sItem.data)
      return sItem.data

    // Return it with http error details
    return sItem
  }
  // .. Functions
  static async isDIndicatorCached(sData) {
    let stockExchanges = await StorageManager.getData("stockExchanges")
    let stockExchange = retrieveObjFromObjList(stockExchanges, "se_short", sData.stock_exchange)

    let syncToleranceDaily = (1440 * 1) + (60 * 20)
    let syncToleranceWeekend = (1440 * 3) + (60 * 20)

    let tz = stockExchange.timezone
    let tz_sDate = TimeManager.tzConvert(tz, sData.latest_datetime, true, true)
    let sDateWeekday = new Date(tz_sDate).getDay()

    // console.log("syncToleranceDaily: " + syncToleranceDaily)
    // console.log("syncToleranceWeekend: " + syncToleranceWeekend)
    // console.log("timestampDiff(tz_sDate): " + TimeManager.timestampDiff(tz_sDate))

    if (TimeManager.timestampDiff(tz_sDate) > -syncToleranceDaily) {
      // User has yesterday's data already. And today's data is probably not ready on backend side.
      return true
    }
    else if (sDateWeekday === 5 && TimeManager.timestampDiff(tz_sDate) > -syncToleranceWeekend) {
      // User has Friday's data and today is still weekend.
      return true
    }

    return false
  }
  getNotCachedInstances(iSummary, instances, lastPeriods) {
    let notCached = []

    for (var iName of instances)
      if (iSummary[iName]) {
        // Instance is cached...
        if (iSummary[iName].lastPeriods < lastPeriods) {
          // But amount of periods is not enough
          notCached.push(iName)
        }
      }
      else {
        // Instance isn't cached...
        notCached.push(iName)
      }

    return notCached
  }
  iSummaryGenerator(iSummary, instances, lastPeriods) {
    for (var iName of instances) {
      if (iSummary[iName]) {
        // Instance is already stored...
        if (lastPeriods > iSummary[iName].lastPeriods) {
          // Amount of periods has changed
          iSummary[iName].lastPeriods = lastPeriods
        }
      }
      else {
        // Instance was not stored yet...
        iSummary[iName] = {
          id: iName,
          lastPeriods: lastPeriods
        }
      }
    }

    return iSummary
  }

  // Setups (Phi Trader)
  // .. [d] Data
  async dSetupList(stockExchange, dateFrom) {
    const sKey = "dSetups"
    await this.startRequest(sKey)

    let wsInfo = this.getApi("wsSetups")
    let result = await StorageManager.isUpToDate(this.sModule, sKey, stockExchange)

    if (result) {
      this.finishRequest(sKey)
      return result
    }

    wsInfo.request = wsInfo.request.replace("<timeInterval>", "d")
    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()
    wsInfo.options.params = {
      stockExchange: stockExchange
    }
    if (dateFrom)
      wsInfo.options.params.dateFrom = dateFrom

    result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers, wsInfo.options.params)

    if (result.status == 200) {
      result = result.data
      result = orderBy(result, ["-radar_on"])
      result = await StorageManager.store(sKey, result, stockExchange)
    }
    else {
      this.getHttpTranslation(result, "dSetupList", "dSetup", true)
      result = await StorageManager.getItem(sKey, stockExchange)
    }

    this.finishRequest(sKey)
    return result
  }
  async dSetupData(stockExchange, dateFrom) {
    let sItem = await this.dSetupList(stockExchange, dateFrom)

    if (sItem && sItem.data)
      return sItem.data

    // Return it with http error details
    return sItem
  }
  // .. [d] Dimensions
  async setupAssetAsSelectDimension(stockExchange) {
    let sItem = await this.dSetupList(stockExchange)
    let dimension = { id: "mAssets", data: [], selected: [] }
    let data = []
    let assetAsKey = {}
    let dSetups = "setups"

    if (sItem.data) {
      for (var obj of sItem.data) {
        if (!assetAsKey[obj.asset_label]) {
          assetAsKey[obj.asset_label] = {}

          assetAsKey[obj.asset_label].value = obj.asset_symbol
          assetAsKey[obj.asset_label].label = obj.asset_label

          assetAsKey[obj.asset_label].links = {}
          assetAsKey[obj.asset_label].links[dSetups] = []
        }

        assetAsKey[obj.asset_label].links[dSetups].push(obj.id)
      }

      for (let [k, v] of Object.entries(assetAsKey))
        data.push(v)

      data = orderBy(data, ["label"])
      dimension.data = data
    }

    return dimension
  }
  async setupAsSelectDimension(stockExchange) {
    let sItem = await this.dSetupList(stockExchange)
    let dimension = { id: "setups", data: [], selected: [] }
    let data = []
    let dAssets = "mAssets"
    let openDates = "openDates"
    let dStatuses = "statuses"
    let dStockExchanges = "stockExchanges"

    if (sItem.data) {
      for (var obj of sItem.data) {
        obj.value = obj.id
        // obj.status = obj.ended_on ? "closed" : "open"

        obj.links = {}
        obj.links[dAssets] = [obj.asset_symbol]
        obj.links[openDates] = [obj.started_on]
        obj.links[dStatuses] = [obj.status]
        obj.links[dStockExchanges] = [obj.se_short]

        data.push(obj)
      }

      data = orderBy(data, ["-radar_on"])
      dimension.data = data
    }

    return dimension
  }
  async setupOpenDateAsSelectDimension(stockExchange) {
    let sItem = await this.dSetupList(stockExchange)
    let dimension = { id: "openDates", data: [], selected: [] }
    let data = []
    let dateAsKey = {}
    let dSetups = "setups"

    if (sItem.data) {
      for (var obj of sItem.data) {
        let strDate = obj.radar_on
        if (!dateAsKey[strDate]) {
          dateAsKey[strDate] = {}

          dateAsKey[strDate].value = strDate
          dateAsKey[strDate].label = strDate

          dateAsKey[strDate].links = {}
          dateAsKey[strDate].links[dSetups] = []
        }

        dateAsKey[strDate].links[dSetups].push(obj.id)
      }

      for (let [k, v] of Object.entries(dateAsKey))
        data.push(v)

      dimension.data = data
    }

    return dimension
  }
  async setupStatusAsSelectDimension(stockExchange) {
    let sItem = await this.dSetupList(stockExchange)
    let dimension = { id: "statuses", data: [], selected: [] }
    let data = []
    let statusAsKey = {}
    let dSetups = "setups"

    if (sItem.data) {
      for (var obj of sItem.data) {
        let status = obj.status

        if (!statusAsKey[status]) {
          statusAsKey[status] = {}

          statusAsKey[status].value = status
          statusAsKey[status].label = status

          statusAsKey[status].links = {}
          statusAsKey[status].links[dSetups] = []
        }

        statusAsKey[status].links[dSetups].push(obj.id)
      }

      for (let [k, v] of Object.entries(statusAsKey))
        data.push(v)

      data = orderBy(data, ["label"])
      dimension.data = data
    }

    return dimension
  }
  async setupStockExchangeAsSelectDimension(stockExchange) {
    let sItem = await this.dSetupList(stockExchange)
    let stockExchanges = await this.stockExchangeList()
    let dimension = { id: "stockExchanges", data: [], selected: [] }
    let data = []
    let stockExchangeAsKey = {}
    let dSetups = "setups"

    if (sItem.data) {
      sItem.data = orderBy(sItem.data, ["asset_label"])

      for (var obj of sItem.data) {
        stockExchange = retrieveObjFromObjList(stockExchanges.data, "se_short", obj.se_short)

        if (!stockExchangeAsKey[obj.se_short]) {
          stockExchangeAsKey[obj.se_short] = {}

          stockExchangeAsKey[obj.se_short].value = obj.se_short
          stockExchangeAsKey[obj.se_short].label = stockExchange.name

          stockExchangeAsKey[obj.se_short].links = {}
          stockExchangeAsKey[obj.se_short].links[dSetups] = []
        }

        stockExchangeAsKey[obj.se_short].links[dSetups].push(obj.id)
      }

      for (let [k, v] of Object.entries(stockExchangeAsKey))
        data.push(v)

      data = orderBy(data, ["label"])
      dimension.data = data
    }

    return dimension
  }

  // Setup Stats (Phi Trader)
  // .. [d] Data
  async dSetupStatsList(stockExchange) {
    const sKey = "dSetupStats"
    await this.startRequest(sKey)

    let wsInfo = this.getApi("wsSetupStats")
    let result = await StorageManager.isUpToDate(this.sModule, sKey, stockExchange)

    if (result) {
      this.finishRequest(sKey)
      return result
    }

    wsInfo.request = wsInfo.request.replace("<timeInterval>", "d")
    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()
    wsInfo.options.params = {
      stockExchange: stockExchange
    }

    result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers, wsInfo.options.params)

    if (result.status == 200) {
      result = result.data
      result = await StorageManager.store(sKey, result, stockExchange)
    }
    else {
      this.getHttpTranslation(result, "dSetupStatsList", "dSetupStats", true)
      result = await StorageManager.getItem(sKey, stockExchange)
    }

    this.finishRequest(sKey)
    return result
  }
  async dSetupStatsData(stockExchange) {
    let sItem = await this.dSetupStatsList(stockExchange)

    if (sItem && sItem.data)
      return sItem.data

    // Return it with http error details
    return sItem
  }

  // Raw
  // .. [d] Data
  async dRawList(detailed = false, asset, dateFrom, dateTo) {
    const sKey = "dRaw"
    await this.startRequest(sKey)

    let sData = await StorageManager.getData(sKey, asset)

    let props = {
      dateFrom: dateFrom,
      dateTo: dateTo
    }
    let result = await StorageManager.isUpToDate(this.sModule, sKey, asset, props)

    if (result) {                     // Do we have it cached?
      if (detailed) {                 // Client is requesting detailed info?
        if (result.data.d_open) {     // We have detailed info?
          this.finishRequest(sKey)
          return result               // Return it
        }
      }
      else {                          // Client needs basic info only.
        this.finishRequest(sKey)
        return result
      }
    }

    let wsInfo = this.getApi("wsRaw")
    wsInfo.request = wsInfo.request.replace("<timeInterval>", "d")
    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()
    wsInfo.options.params = {
      detailed: detailed,
      asset: asset
    }
    if (dateFrom)
      wsInfo.options.params.dateFrom = TimeManager.getDateString(dateFrom)
    if (dateTo)
      wsInfo.options.params.dateTo = dateTo

    result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers, wsInfo.options.params)

    if (result.status == 200) {
      result = result.data

      if (sData)
        result = joinObjLists(result, sData, "datetime")
      result = orderBy(result, ["-datetime"])              // DESC order is used in MeasureManager

      result = await StorageManager.store(sKey, result, asset)
    }
    else {
      this.getHttpTranslation(result, "dRawList", "dRaw", true)
      result = await StorageManager.getItem(sKey, asset)
    }

    this.finishRequest(sKey)
    return result
  }
  // .. [d] Functions
  static async isDRawCached(sData, dateFrom, dateTo) {
    sData = orderBy(sData, ["-datetime"])

    if (sData.length > 0 && dateFrom) {
      let asset = await StorageManager.getData("assets", sData[0].asset_symbol)
      let stockExchanges = await StorageManager.getData("stockExchanges")
      let stockExchange = retrieveObjFromObjList(stockExchanges, "se_short", asset.stock_exchange)

      let syncToleranceDaily = (1440 * 2) + (60 * 8)
      let syncToleranceWeekend = (1440 * 4) + (60 * 8)

      let tz = stockExchange.timezone
      let sFirstDate = sData[sData.length - 1].datetime
      let sLastDate = sData[0].datetime
      let tz_sLastDate = TimeManager.tzConvert(tz, sData[0].datetime, true, true)
      let sLastDateWeekday = new Date(tz_sLastDate).getDay()
      let pDateFrom = TimeManager.getUTCDatetime(dateFrom)
      let pDateTo = TimeManager.getUTCDatetime(dateTo)

      // console.log("sFirstDate: " + sFirstDate)
      // console.log("sLastDate: " + sLastDate)
      // console.log("timestampDiff(tDateFrom, sFirstDate): " + TimeManager.timestampDiff(pDateFrom, sFirstDate))
      // console.log("timestampDiff(sLastDate, pDateTo): " + TimeManager.timestampDiff(sLastDate, pDateTo))
      // console.log("syncToleranceDaily: " + syncToleranceDaily)
      // console.log("syncToleranceWeekend: " + syncToleranceWeekend)
      // console.log("timestampDiff(tz_sLastDate): " + TimeManager.timestampDiff(tz_sLastDate))

      if (TimeManager.timestampDiff(pDateFrom, sFirstDate) >= 0) {
        // 'dateFrom' is greater than 'sFirstDate'. That means there's a possibility we have it cached
        if (TimeManager.timestampDiff(sLastDate, pDateTo) >= 0) {
          // 'dateTo' is greater than 'sLastDate. So, we have it cached.
          return true
        }
        else if (TimeManager.timestampDiff(tz_sLastDate) > -syncToleranceDaily) {
          // User has yesterday's data already. And today's data is probably not ready on backend side.
          return true
        }
        else if (sLastDateWeekday === 5 && TimeManager.timestampDiff(tz_sLastDate) > -syncToleranceWeekend) {
          // User has Friday's data and today is still weekend.
          return true
        }
      }
    }
    return false
  }

  // Stock Exchange
  // .. Data
  async stockExchangeList() {
    const sKey = "stockExchanges"
    await this.startRequest(sKey)

    let wsInfo = this.getApi("wsStockExchanges")
    let result = await StorageManager.isUpToDate(this.sModule, sKey)

    if (result) {
      this.finishRequest(sKey)
      return result
    }

    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()
    result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers)

    if (result.status == 200) {
      result = result.data
      result = await StorageManager.store(sKey, result)
    }
    else {
      this.getHttpTranslation(result, "stockExchangeList", "stockExchange", true)
      result = await StorageManager.getItem(sKey)
    }

    this.finishRequest(sKey)
    return result
  }
  async stockExchangeRetrieve(pk) {
    let sItem = await this.stockExchangeList()

    if (sItem.data)
      return retrieveObjFromObjList(sItem.data, "se_short", pk)

    // Return it with http error details
    return sItem
  }
  async stockExchangesForSelect() {
    let sItem = await this.stockExchangeList()
    let options = []

    if (sItem.data) {
      sItem.data = orderBy(sItem.data, ["name"])

      for (var obj of sItem.data) {
        let option = {
          value: obj.se_short,
          label: obj.name,

          se_short: obj.se_short,
          name: obj.name,
          timezone: obj.timezone,
          currency_code: obj.currency_code
        }

        options.push(option)
      }
    }

    return options
  }
  // .. Functions
  static async isMarketOpen(strStockExchange) {
    let stockExchanges = await StorageManager.getData("stockExchanges")
    let stockExchange = retrieveObjFromObjList(stockExchanges, "se_short", strStockExchange)

    if (stockExchange) {
      let tz = stockExchange.timezone
      let now_tz = TimeManager.tzConvert(tz, new Date())
      let weekDay = TimeManager.tzGetWeekday(tz, now_tz)

      if (weekDay >= 1 && weekDay <= 5) {
        let mAfterMarketOpens = TimeManager.timeDiff(now_tz.format("HH:mm:ss"), stockExchange.start_time)
        let mAfterMarketCloses = TimeManager.timeDiff(now_tz.format("HH:mm:ss"), stockExchange.end_time)

        // Considers that prices can be updated up to 60 minutes after market is closed.
        if (mAfterMarketOpens >= 0 && mAfterMarketCloses <= 60)
          return true
      }
    }

    return false
  }

  // Technical Condition
  async technicalConditionList() {
    const sKey = "technicalConditions"
    await this.startRequest(sKey)

    let wsInfo = this.getApi("wsTechnicalConditions")
    let result = await StorageManager.isUpToDate(this.sModule, sKey)

    if (result) {
      this.finishRequest(sKey)
      return result
    }

    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()
    result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers)

    if (result.status == 200) {
      result = result.data
      result = await StorageManager.store(sKey, result)
    }
    else {
      this.getHttpTranslation(result, "technicalConditionList", "technicalCondition", true)
      result = await StorageManager.getItem(sKey)
    }

    this.finishRequest(sKey)
    return result
  }
  async technicalConditionData() {
    let sItem = await this.technicalConditionList()

    if (sItem && sItem.data)
      return sItem.data

    // Return it with http error details
    return sItem
  }
  async technicalConditionRetrieve(pk) {
    let sItem = await this.technicalConditionList()

    if (sItem.data)
      return retrieveObjFromObjList(sItem.data, "id", pk)

    // Return it with http error details
    return sItem
  }

  getApi(apiId) {
    if (apiId in this.apis)
      return deepCloneObj(this.apis[apiId]);
    return null
  }
}

export default MarketManager;
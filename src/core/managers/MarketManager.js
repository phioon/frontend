import AuthManager from "./AuthManager";
import StorageManager from "./StorageManager";
import TimeManager from "./TimeManager";
import {
  deepCloneObj,
  httpRequest,
  joinObjLists,
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
            "Authorization": "token "
          },
          params: {
            detailed: undefined,
            stockExchange: undefined,
            assets: undefined
          },
        },
        method: "get",
        request: "/api/market/assets/"
      },
      wsEma: {
        options: {
          headers: {
            "Content-Type": "application/json",
            "Authorization": "token "
          },
          params: {
            stockExchange: undefined,
            dateFrom: undefined
          },
        },
        method: "get",
        request: "/api/market/<timeInterval>/ema/latest"
      },
      wsPhibo: {
        options: {
          headers: {
            "Content-Type": "application/json",
            "Authorization": "token "
          },
          params: {
            stockExchange: undefined,
            dateFrom: undefined
          },
        },
        method: "get",
        request: "/api/market/<timeInterval>/phibo/latest"
      },
      wsSetups: {
        options: {
          headers: {
            "Content-Type": "application/json",
            "Authorization": "token "
          },
          params: {
            stockExchange: undefined,
            dateFrom: undefined
          },
        },
        method: "get",
        request: "/api/market/<timeInterval>/setups/"
      },
      wsSetupSummary: {
        options: {
          headers: {
            "Content-Type": "application/json",
            "Authorization": "token "
          },
          params: {
            stockExchange: undefined
          },
        },
        method: "get",
        request: "/api/market/<timeInterval>/setupSummary/"
      },
      wsRaw: {
        options: {
          headers: {
            "Content-Type": "application/json",
            "Authorization": "token "
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
      wsStockExchanges: {
        options: {
          headers: {
            "Content-Type": "application/json",
            "Authorization": "token "
          }
        },
        method: "get",
        request: "/api/market/stockExchanges/"
      },
      wsTechnicalConditions: {
        options: {
          headers: {
            "Content-Type": "application/json",
            "Authorization": "token "
          }
        },
        method: "get",
        request: "/api/market/technicalConditions/"
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

  async assetList(detailed = false, assets = [], stockExchange) {
    // syncFull is only triggered from WalletList
    // Client must pass 'assets' or 'stockExchange'. One of these 2 parameters are required.
    if (assets.length == 0 && !stockExchange)
      return {}
    // --------------------
    const sKey = "assets"
    await this.startRequest(sKey)

    let wsInfo = this.getApi("wsAssets")
    let sData = {}
    let syncList = []
    let result = null

    // StockExchange: Prepare list of assets to be used forward.
    if (stockExchange) {
      assets = StorageManager.getItem(sKey)
      delete assets.version                 // Removes first position (key 'version')

      for (var [k, v] of Object.entries(assets))
        if (v.data.stockExchange != stockExchange)
          delete assets[k]

      assets = Object.keys(assets)
    }

    // Assets
    if (assets.length > 0)
      for (var a of assets) {
        result = StorageManager.isUpToDate(this.sModule, sKey, a)

        if (result) {                       // We have it cached and up to date?
          if (detailed) {                   // Client is requesting detailed info?
            if (result.data.asset_price && result.data.sector_id) {
              // We have detailed info? ('asset_lastTradeTime' is a detailed info)
              sData[a] = result             // Return it
            }
            else                            // We don't have it detailed
              syncList.push(a)              // Insert Asset into syncList
          }
          else {                            // Client needs basic info only
            if (result.data.asset_price)
              sData[a] = result             // Return it
            else
              syncList.push(a)
          }
        }
        else
          syncList.push(a)                  // Insert Asset into syncList
      }

    // console.log(`syncList: ${syncList}`)

    if (syncList.length > 0) {
      wsInfo.options.headers.Authorization = "token " + AuthManager.storedToken()
      wsInfo.options.params = {
        detailed: detailed,
        stockExchange: stockExchange,
        assets: syncList.join(','),
      }
      result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers, wsInfo.options.params)

      if (result.status == 200)
        for (let obj of result.data)
          sData[obj.asset_symbol] = StorageManager.store(sKey, obj, obj.asset_symbol)
      else {
        this.getHttpTranslation(result, "assetList", "asset", true)
        sData = this.offlineAssetList(assets)
      }
    }

    this.finishRequest(sKey)
    return sData
  }
  offlineAssetList(assets) {
    const sKey = "assets"
    let sData = {}

    for (var a of assets)
      sData[a] = StorageManager.getItem(sKey, a)
    return sData
  }
  async assetRetrieve(pk, detailed = false) {
    let sItem = await this.assetList(detailed, [pk])
    return sItem[pk] ? sItem[pk].data : null
  }
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

  async dEmaList(stockExchange) {
    const sKey = "dEma"
    await this.startRequest(sKey)

    let wsInfo = this.getApi("wsEma")
    let result = StorageManager.isUpToDate(this.sModule, sKey, stockExchange)

    if (result) {
      this.finishRequest(sKey)
      return result
    }

    wsInfo.request = wsInfo.request.replace("<timeInterval>", "d")
    wsInfo.options.headers.Authorization = "token " + AuthManager.storedToken()
    wsInfo.options.params = {
      stockExchange: stockExchange
    }

    result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers, wsInfo.options.params)

    if (result.status == 200) {
      result = result.data
      result = orderBy(result, ["-started_on"])
      result = StorageManager.store(sKey, result, stockExchange)
    }
    else {
      this.getHttpTranslation(result, "dEmaList", "dEma", true)
      result = StorageManager.getItem(sKey, stockExchange)
    }

    this.finishRequest(sKey)
    return result
  }

  async dPhiboList(stockExchange) {
    const sKey = "dPhibo"
    await this.startRequest(sKey)

    let wsInfo = this.getApi("wsPhibo")
    let result = StorageManager.isUpToDate(this.sModule, sKey, stockExchange)

    if (result) {
      this.finishRequest(sKey)
      return result
    }

    wsInfo.request = wsInfo.request.replace("<timeInterval>", "d")
    wsInfo.options.headers.Authorization = "token " + AuthManager.storedToken()
    wsInfo.options.params = {
      stockExchange: stockExchange
    }

    result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers, wsInfo.options.params)

    if (result.status == 200) {
      result = result.data
      result = orderBy(result, ["-started_on"])
      result = StorageManager.store(sKey, result, stockExchange)
    }
    else {
      this.getHttpTranslation(result, "dPhiboList", "dPhibo", true)
      result = StorageManager.getItem(sKey, stockExchange)
    }

    this.finishRequest(sKey)
    return result
  }

  async dSetupList(stockExchange, dateFrom) {
    const sKey = "dSetups"
    await this.startRequest(sKey)

    let wsInfo = this.getApi("wsSetups")
    let result = StorageManager.isUpToDate(this.sModule, sKey, stockExchange)

    if (result) {
      this.finishRequest(sKey)
      return result
    }

    wsInfo.request = wsInfo.request.replace("<timeInterval>", "d")
    wsInfo.options.headers.Authorization = "token " + AuthManager.storedToken()
    wsInfo.options.params = {
      stockExchange: stockExchange
    }
    if (dateFrom)
      wsInfo.options.params.dateFrom = dateFrom

    result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers, wsInfo.options.params)

    if (result.status == 200) {
      result = result.data
      result = orderBy(result, ["-started_on"])
      result = StorageManager.store(sKey, result, stockExchange)
    }
    else {
      this.getHttpTranslation(result, "dSetupList", "dSetup", true)
      result = StorageManager.getItem(sKey, stockExchange)
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
  async dSetupAsDimension(stockExchange) {
    let sItem = await this.dSetupList(stockExchange)
    let dimension = { id: "setups", data: [], items: [], selected: [], disabled: {} }
    let data = []
    let dAssets = "assets"
    let dDates = "dates"
    let dStatuses = "statuses"
    let dStockExchanges = "stockExchanges"

    if (sItem.data) {
      sItem.data = orderBy(sItem.data, ["-started_on"])

      for (var obj of sItem.data) {
        dimension.items.push(obj.id)
        obj.links = {}
        obj.links[dAssets] = [obj.asset_symbol]
        obj.links[dDates] = [obj.started_on]
        obj.links[dStatuses] = [obj.ended_on ? 'closed' : 'open']
        obj.links[dStockExchanges] = [obj.se_short]

        data.push(obj)
      }

      dimension.data = data
    }

    return dimension
  }
  // Generated from dSetups
  async assetAsDimension(stockExchange) {
    let sItem = await this.dSetupList(stockExchange)
    let dimension = { id: "assets", data: [], items: [], selected: [], disabled: {} }
    let data = []
    let assetAsKey = {}
    let dSetups = "setups"

    if (sItem.data) {
      sItem.data = orderBy(sItem.data, ["asset_label"])

      for (var obj of sItem.data) {
        if (!assetAsKey[obj.asset_label]) {
          assetAsKey[obj.asset_label] = {}

          dimension.items.push(obj.asset_label)

          assetAsKey[obj.asset_label].id = obj.asset_symbol
          assetAsKey[obj.asset_label].name = obj.asset_label

          assetAsKey[obj.asset_label].links = {}
          assetAsKey[obj.asset_label].links[dSetups] = []
        }

        assetAsKey[obj.asset_label].links[dSetups].push(obj.id)
      }

      for (let [k, v] of Object.entries(assetAsKey))
        data.push(v)

      dimension.data = data
    }

    return dimension
  }
  async dateAsDimension(stockExchange) {
    let sItem = await this.dSetupList(stockExchange)
    let dimension = { id: "dates", data: [], items: [], selected: [], disabled: {} }
    let data = []
    let dateAsKey = {}
    let dSetups = "setups"

    if (sItem.data) {
      sItem.data = orderBy(sItem.data, ["asset_label"])

      for (var obj of sItem.data) {
        if (!dateAsKey[obj.started_on]) {
          dateAsKey[obj.started_on] = {}

          dimension.items.push(obj.started_on)

          dateAsKey[obj.started_on].id = obj.started_on
          dateAsKey[obj.started_on].name = obj.started_on

          dateAsKey[obj.started_on].links = {}
          dateAsKey[obj.started_on].links[dSetups] = []
        }

        dateAsKey[obj.started_on].links[dSetups].push(obj.id)
      }

      for (let [k, v] of Object.entries(dateAsKey))
        data.push(v)

      dimension.data = data
    }

    return dimension
  }
  async statusAsDimension(stockExchange) {
    let sItem = await this.dSetupList(stockExchange)
    let dimension = { id: "statuses", data: [], items: [], selected: [], disabled: {} }
    let data = []
    let statusAsKey = {}
    let dSetups = "setups"

    if (sItem.data) {
      sItem.data = orderBy(sItem.data, ["asset_label"])

      for (var obj of sItem.data) {
        obj.status = obj.ended_on ? 'closed' : 'open'
        if (!statusAsKey[obj.status]) {
          statusAsKey[obj.status] = {}

          dimension.items.push(obj.status)

          statusAsKey[obj.status].id = obj.status
          statusAsKey[obj.status].name = obj.status

          statusAsKey[obj.status].links = {}
          statusAsKey[obj.status].links[dSetups] = []
        }

        statusAsKey[obj.status].links[dSetups].push(obj.id)
      }

      for (let [k, v] of Object.entries(statusAsKey))
        data.push(v)

      dimension.data = data
    }

    return dimension
  }
  async stockExchangeAsDimension(stockExchange) {
    let sItem = await this.dSetupList(stockExchange)
    let stockExchanges = await this.stockExchangeList()
    let dimension = { id: "stockExchanges", data: [], items: [], selected: [], disabled: {} }
    let data = []
    let stockExchangeAsKey = {}
    let dSetups = "setups"

    if (sItem.data) {
      sItem.data = orderBy(sItem.data, ["asset_label"])

      for (var obj of sItem.data) {
        stockExchange = retrieveObjFromObjList(stockExchanges.data, "se_short", obj.se_short)
        if (!stockExchangeAsKey[obj.se_short]) {
          stockExchangeAsKey[obj.se_short] = {}

          dimension.items.push(stockExchange.se_name)

          stockExchangeAsKey[obj.se_short].id = obj.se_short
          stockExchangeAsKey[obj.se_short].name = stockExchange.se_name

          stockExchangeAsKey[obj.se_short].links = {}
          stockExchangeAsKey[obj.se_short].links[dSetups] = []
        }

        stockExchangeAsKey[obj.se_short].links[dSetups].push(obj.id)
      }

      for (let [k, v] of Object.entries(stockExchangeAsKey))
        data.push(v)

      dimension.data = data
    }

    return dimension
  }
  // --------------------

  async dSetupSummaryList(stockExchange) {
    const sKey = "dSetupSummary"
    await this.startRequest(sKey)

    let wsInfo = this.getApi("wsSetupSummary")
    let result = StorageManager.isUpToDate(this.sModule, sKey, stockExchange)

    if (result) {
      this.finishRequest(sKey)
      return result
    }

    wsInfo.request = wsInfo.request.replace("<timeInterval>", "d")
    wsInfo.options.headers.Authorization = "token " + AuthManager.storedToken()
    wsInfo.options.params = {
      stockExchange: stockExchange
    }

    result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers, wsInfo.options.params)

    if (result.status == 200) {
      result = result.data
      result = StorageManager.store(sKey, result, stockExchange)
    }
    else {
      this.getHttpTranslation(result, "dSetupSummaryList", "dSetupSummary", true)
      result = StorageManager.getItem(sKey, stockExchange)
    }

    this.finishRequest(sKey)
    return result
  }
  async dSetupSummaryData(stockExchange) {
    let sItem = await this.dSetupSummaryList(stockExchange)

    if (sItem && sItem.data)
      return sItem.data

    // Return it with http error details
    return sItem
  }

  async dRawList(detailed = false, asset, dateFrom, dateTo) {
    const sKey = "dRaw"
    await this.startRequest(sKey)

    let sData = StorageManager.getData(sKey, asset)
    let result = StorageManager.isUpToDate(this.sModule, sKey, asset, dateFrom, dateTo)

    if (result) {                     // We have it cached?
      if (detailed) {                 // Client is requesting detailed info?
        if (result.data.d_volume) {   // We have detailed info?
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
    wsInfo.options.headers.Authorization = "token " + AuthManager.storedToken()
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
        result = joinObjLists(result, sData, "d_datetime")
      result = orderBy(result, ["-d_datetime"])              // DESC order is used in MeasureManager

      result = StorageManager.store(sKey, result, asset)
    }
    else {
      this.getHttpTranslation(result, "dRawList", "dRaw", true)
      result = StorageManager.getItem(sKey, asset)
    }

    this.finishRequest(sKey)
    return result
  }

  async stockExchangeList() {
    const sKey = "stockExchanges"
    await this.startRequest(sKey)

    let wsInfo = this.getApi("wsStockExchanges")
    let result = StorageManager.isUpToDate(this.sModule, sKey)

    if (result) {
      this.finishRequest(sKey)
      return result
    }

    wsInfo.options.headers.Authorization = "token " + AuthManager.storedToken()
    result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers)

    if (result.status == 200) {
      result = result.data
      result = StorageManager.store(sKey, result)
    }
    else {
      this.getHttpTranslation(result, "stockExchangeList", "stockExchange", true)
      result = StorageManager.getItem(sKey)
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
      sItem.data = orderBy(sItem.data, ["se_name"])

      for (var obj of sItem.data) {
        let option = {
          value: obj.se_short,
          label: obj.se_name,

          se_short: obj.se_short,
          se_name: obj.se_name,
          se_timezone: obj.se_timezone,
          currency_code: obj.currency_code
        }

        options.push(option)
      }
    }

    return options
  }

  async technicalConditionList() {
    const sKey = "technicalConditions"
    await this.startRequest(sKey)

    let wsInfo = this.getApi("wsTechnicalConditions")
    let result = StorageManager.isUpToDate(this.sModule, sKey)

    if (result) {
      this.finishRequest(sKey)
      return result
    }

    wsInfo.options.headers.Authorization = "token " + AuthManager.storedToken()
    result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers)

    if (result.status == 200) {
      result = result.data
      result = StorageManager.store(sKey, result)
    }
    else {
      this.getHttpTranslation(result, "technicalConditionList", "technicalCondition", true)
      result = StorageManager.getItem(sKey)
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

  static isDRawCached(sData, dateFrom, dateTo) {
    sData = orderBy(sData, ["-d_datetime"])

    if (sData.length > 0 && dateFrom) {
      let asset = StorageManager.getData("assets", sData[0].asset_symbol)
      let stockExchanges = StorageManager.getData("stockExchanges")
      let stockExchange = retrieveObjFromObjList(stockExchanges, "se_short", asset.stockExchange)

      let syncToleranceDaily = (1440 * 2) + (60 * 8)
      let syncToleranceWeekend = (1440 * 4) + (60 * 8)

      let tz = stockExchange.se_timezone
      let sFirstDate = sData[sData.length - 1].d_datetime
      let sLastDate = sData[0].d_datetime
      let tz_sLastDate = TimeManager.tzConvert(tz, sData[0].d_datetime, true, true)
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

      // If 'dateFrom' is greater than 'sFirstDate', that means there's a possibility we have it cached
      if (TimeManager.timestampDiff(pDateFrom, sFirstDate) >= 0) {
        // If 'dateTo' is greater than 'sLastDate, we have it cached.
        if (TimeManager.timestampDiff(sLastDate, pDateTo) >= 0)
          return true
        // If user has yesterday's data already, return it.
        else if (TimeManager.timestampDiff(tz_sLastDate) > -syncToleranceDaily)
          return true
        // If user has Friday's data and it's still weekend, return it.
        else if (sLastDateWeekday === 5 && TimeManager.timestampDiff(tz_sLastDate) > -syncToleranceWeekend)
          return true
      }
    }
    return false
  }

  static isAssetUpToDate(strStockExchange, mTime) {
    // Check if it's needed to update Asset ONLY when Market is closed.
    let stockExchanges = StorageManager.getData("stockExchanges")
    let stockExchange = retrieveObjFromObjList(stockExchanges, "se_short", strStockExchange)

    if (stockExchange) {
      let tz = stockExchange.se_timezone
      let tz_now = TimeManager.tzConvert(tz, new Date())
      let tz_mTime = TimeManager.tzConvert(tz, TimeManager.getMoment(mTime))
      let now_weekDay = TimeManager.tzGetWeekday(tz, tz_now)

      if ([1, 2, 3, 4, 5].includes(now_weekDay)) {
        // Today is a weekday
        let now_mAfterMarketOpens = TimeManager.timeDiff(tz_now.format("HH:mm:ss"), stockExchange.se_startTime)
        let now_mAfterMarketCloses = TimeManager.timeDiff(tz_now.format("HH:mm:ss"), stockExchange.se_endTime)

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

  static isMarketOpen(strStockExchange) {
    let stockExchanges = StorageManager.getData("stockExchanges")
    let stockExchange = retrieveObjFromObjList(stockExchanges, "se_short", strStockExchange)

    if (stockExchange) {
      let tz = stockExchange.se_timezone
      let now_tz = TimeManager.tzConvert(tz, new Date())
      let weekDay = TimeManager.tzGetWeekday(tz, now_tz)

      if (weekDay >= 1 && weekDay <= 5) {
        let mAfterMarketOpens = TimeManager.timeDiff(now_tz.format("HH:mm:ss"), stockExchange.se_startTime)
        let mAfterMarketCloses = TimeManager.timeDiff(now_tz.format("HH:mm:ss"), stockExchange.se_endTime)

        // Considers that prices can be updated up to 60 minutes after market is closed.
        if (mAfterMarketOpens >= 0 && mAfterMarketCloses <= 60)
          return true
      }
    }

    return false
  }
  static isLastPriceStored(stockExchange, tz_mTime) {
    // console.log('tz_mTime: ' + tz_mTime.format())

    if (stockExchange) {
      let tz = stockExchange.se_timezone
      let se_endTime = TimeManager.getTzMoment(String(tz_mTime.format("YYYY-MM-DD") + "T" + stockExchange.se_endTime), tz)
      let mTime_weekDay = TimeManager.tzGetWeekday(tz, tz_mTime)

      // console.log('se_endTime: ' + se_endTime.format())
      // console.log('mTime_weekDay: ' + mTime_weekDay)

      if ([1, 2, 3, 4, 5].includes(mTime_weekDay)) {
        // Last time it was modified was weekday
        let mAfterMarketCloses = TimeManager.timestampDiff(tz_mTime, se_endTime)

        // Considers that prices can be updated up to 60 minutes after market is closed.
        if (mAfterMarketCloses >= 60)
          return true
      }
      else {
        // Last time it was modified was weekend
        let syncToleranceWeekend = (1440 * 2) + (60 * 8)

        // console.log("syncToleranceWeekend: " + syncToleranceWeekend)
        // console.log("TimeManager.timestampDiff(tz_mTime): " + TimeManager.timestampDiff(tz_mTime))

        if (TimeManager.timestampDiff(tz_mTime) > -syncToleranceWeekend)
          return true
      }
    }

    return false
  }
  static tzStockExchange(strStockExchange) {
    let stockExchange = StorageManager.getData("stockExchanges", strStockExchange)
    return stockExchange.se_timezone
  }
  getApi(apiId) {
    if (apiId in this.apis)
      return deepCloneObj(this.apis[apiId]);
    return null
  }
}

export default MarketManager;
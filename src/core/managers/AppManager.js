import AuthManager from "./AuthManager";
import StorageManager from "./StorageManager";
import TimeManager from "./TimeManager";
import {
  deepCloneObj,
  getObjsFieldNotNull,
  getObjsFieldNull,
  httpRequest,
  joinObjLists,
  orderBy,
  retrieveObjFromObjList,
  sleep
} from "../utils";

class AppManager {
  constructor(getHttpTranslation) {
    this.getHttpTranslation = getHttpTranslation
    this.sModule = "app"
    this.apis = {
      wsCountries: {
        options: {
          headers: {
            "Content-Type": "application/json"
          }
        },
        request: "/api/app/countries/"
      },
      wsCurrencies: {
        options: {
          headers: {
            "Content-Type": "application/json"
          }
        },
        request: "/api/app/currencies/"
      },
      wsSubscriptions: {
        options: {
          headers: {
            "Content-Type": "application/json"
          }
        },
        request: "/api/app/subscriptions/"
      },
      wsPositionTypes: {
        options: {
          headers: {
            "Content-Type": "application/json"
          }
        },
        request: "/api/app/positionTypes/"
      },
      wsPositions: {
        options: {
          headers: {
            "Content-Type": "application/json",
            "Authorization": ""
          }
        },
        request: "/api/app/positions/"
      },
      wsMyStrategies: {
        options: {
          headers: {
            "Content-Type": "application/json",
            "Authorization": ""
          }
        },
        request: "/api/app/mystrategies/"
      },
      wsStrategies: {
        options: {
          headers: {
            "Content-Type": "application/json",
            "Authorization": ""
          }
        },
        request: "/api/app/strategies/"
      },
      wsUser: {
        options: {
          headers: {
            "Content-Type": "application/json",
            "Authorization": ""
          }
        },
        request: "/api/app/user/"
      },
      wsWallets: {
        options: {
          headers: {
            "Content-Type": "application/json",
            "Authorization": ""
          }
        },
        request: "/api/app/wallets/"
      }
    }
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

  // Country
  async countryList() {
    const sKey = "countries"
    let result = await StorageManager.isUpToDate(this.sModule, sKey)

    if (result)
      return result

    let wsInfo = this.getApi("wsCountries")
    wsInfo.method = "get"
    result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers)

    if (result.status == 200) {
      result = result.data
      result = await StorageManager.store(sKey, result)
    }
    else {
      this.getHttpTranslation(result, "countrylist", "country", true)
      result = await StorageManager.getItem(sKey)
    }

    return result
  }
  async countryRetrieve(pk) {
    let sItem = await this.countryList()

    let country = retrieveObjFromObjList(sItem.data, "code", pk)
    return country
  }

  // Currency
  async currencyList() {
    const sKey = "currencies"
    await this.startRequest(sKey)
    let result = await StorageManager.isUpToDate(this.sModule, sKey)

    if (result) {
      this.finishRequest(sKey)
      return result
    }

    let wsInfo = this.getApi("wsCurrencies")
    wsInfo.method = "get"
    result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers)

    if (result.status == 200) {
      result = result.data
      result = await StorageManager.store(sKey, result)
    }
    else {
      this.getHttpTranslation(result, "currencylist", "currency", true)
      result = await StorageManager.getItem(sKey)
    }

    this.finishRequest(sKey)
    return result
  }
  async currencyRetrieve(pk) {
    let sItem = await this.currencyList()

    let currency = retrieveObjFromObjList(sItem.data, "code", pk)
    return currency
  }
  async currenciesForSelect() {
    let sItem = await this.currencyList()
    let options = []

    if (sItem.data) {
      sItem.data = orderBy(sItem.data, ["code"])

      for (var obj of sItem.data) {
        let option = {
          value: obj.code,
          label: obj.code + " (" + obj.symbol + ")",
        }
        options.push(option)
      }
    }

    return options
  }

  // Subscription
  async subscriptionList() {
    const sKey = "subscriptions"
    let result = await StorageManager.isUpToDate(this.sModule, sKey)

    if (result)
      return result

    let wsInfo = this.getApi("wsSubscriptions")
    wsInfo.method = "get"
    result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers)

    if (result.status == 200) {
      result = result.data
      result = await StorageManager.store(sKey, result)
    }
    else {
      this.getHttpTranslation(result, "subscriptionlist", "subscription", true)
      result = await StorageManager.getItem(sKey)
    }

    return result
  }
  async subscriptionRetrieve(pk) {
    let sItem = await this.subscriptionList()

    if (sItem.data)
      return retrieveObjFromObjList(sItem.data, "name", pk)

    // Return it with http error details
    return sItem
  }

  // Position
  // .. Data
  async positionList(syncFull = false) {
    const sKey = "positions"
    await this.startRequest(sKey)

    let lastModifiedTime = "2001-01-01T00:00:00Z"
    let sData = await StorageManager.getData(sKey)
    let result = await StorageManager.isUpToDate(this.sModule, sKey)

    if (!syncFull) {
      if (result) {
        this.finishRequest(sKey)
        return result
      }
      else if (sData && sData.length > 0)
        lastModifiedTime = sData[0].last_modified    // Define 'lastModifiedTime'.
    }

    let wsInfo = this.getApi("wsPositions")
    wsInfo.method = "get"
    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()
    wsInfo.options.params = {
      dateFrom: lastModifiedTime
    }

    result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers, wsInfo.options.params)

    if (result.status == 200) {
      result = result.data

      if (!syncFull && sData)
        result = joinObjLists(sData, result)
      result = orderBy(result, ["-last_modified"])   // Don't change the order. It's used to define 'lastModifiedTime'.

      result = await StorageManager.store(sKey, result)
    }
    else {
      this.getHttpTranslation(result, "positionlist", "position", true)
      result = await StorageManager.getItem(sKey)
    }

    this.finishRequest(sKey)
    return result
  }
  async positionListOnlyOpen() {
    let sItem = await this.positionList()

    if (sItem.data)
      sItem.data = getObjsFieldNull(sItem.data, "ended_on")

    return sItem
  }
  async positionData(syncFull = false) {
    let sItem = await this.positionList(syncFull)

    if (sItem && sItem.data)
      return sItem.data

    // Return it with http error details
    return sItem
  }
  async positionCreate(position) {
    let wsInfo = this.getApi("wsPositions")
    wsInfo.method = "post"
    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()

    let result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers, null, position)

    if (result.status == 201) {
      let syncFull = true
      this.walletList(syncFull)           // async call
      await this.positionList(syncFull)
    }

    return result
  }
  async positionUpdate(position) {
    let wsInfo = this.getApi("wsPositions")
    wsInfo.request += position.id + "/"
    wsInfo.method = "patch"
    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()
    let result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers, null, position)

    if (result.status == 200) {
      let syncFull = true
      this.walletList(syncFull)               // async call
      await this.positionList(syncFull)
    }

    return result
  }
  async positionDelete(pk) {
    var wsInfo = this.getApi("wsPositions")
    wsInfo.request += pk + "/"
    wsInfo.method = "delete"
    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()

    let result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers)

    if (result.status == 204) {
      let syncFull = true
      this.walletList(syncFull)     // async call
      await this.positionList(syncFull)
    }
    else
      this.getHttpTranslation(result, "positiondelete", "position", true)

    return result
  }
  async positionRetrieve(pk) {
    let sItem = await this.positionList()

    if (sItem.data)
      return retrieveObjFromObjList(sItem.data, "id", pk)

    // Return it with http error details
    return sItem
  }
  // .. Dimensions
  async positionAsSelectDimension(onlyOpen = false) {
    let sItem = onlyOpen ? await this.positionListOnlyOpen() : await this.positionList()
    let dimension = { id: "positions", data: [], selected: [] }
    let data = []
    let pAssets = "pAssets"
    let mAssets = "mAssets"
    let openDates = "openDates"
    let closeDates = "closeDates"
    let dStatuses = "statuses"
    let dTypes = "types"
    let dWallets = "wallets"

    if (sItem.data) {
      for (var obj of sItem.data) {
        obj.value = obj.id

        obj.links = {}
        obj.links[pAssets] = [obj.asset_symbol]
        obj.links[mAssets] = [obj.asset_symbol]
        obj.links[openDates] = [obj.started_on]
        obj.links[closeDates] = [obj.ended_on]
        obj.links[dStatuses] = [obj.ended_on ? "closed" : "open"]
        obj.links[dTypes] = [obj.type]
        obj.links[dWallets] = [obj.wallet]

        data.push(obj)
      }

      dimension.data = data
    }

    return dimension
  }
  async assetAsSelectDimension(onlyOpen = false) {
    let sItem = onlyOpen ? await this.positionListOnlyOpen() : await this.positionList()
    let dimension = { id: "pAssets", data: [], selected: [] }
    let data = []
    let assetAsKey = {}
    let dPositions = "positions"
    let dAssets = "mAssets"

    if (sItem.data) {
      for (var obj of sItem.data) {
        if (!assetAsKey[obj.asset_label]) {
          assetAsKey[obj.asset_label] = {}

          assetAsKey[obj.asset_label].value = obj.asset_symbol
          assetAsKey[obj.asset_label].label = obj.asset_label

          assetAsKey[obj.asset_label].links = {}
          assetAsKey[obj.asset_label].links[dPositions] = []
          assetAsKey[obj.asset_label].links[dAssets] = []
        }

        assetAsKey[obj.asset_label].links[dPositions].push(obj.id)
        assetAsKey[obj.asset_label].links[dAssets].push(obj.asset_symbol)
      }

      for (let [k, v] of Object.entries(assetAsKey))
        data.push(v)

      data = orderBy(data, ["label"])
      dimension.data = data
    }

    return dimension
  }
  async openDateAsSelectDimension(onlyOpen = false) {
    let sItem = onlyOpen ? await this.positionListOnlyOpen() : await this.positionList()
    let dimension = { id: "openDates", data: [], selected: [] }
    let data = []
    let dateAsKey = {}
    let dPositions = "positions"

    if (sItem.data) {
      for (var obj of sItem.data) {
        let strDate = obj.started_on
        if (!dateAsKey[strDate]) {
          dateAsKey[strDate] = {}

          dateAsKey[strDate].value = strDate
          dateAsKey[strDate].label = strDate

          dateAsKey[strDate].links = {}
          dateAsKey[strDate].links[dPositions] = []
        }

        dateAsKey[strDate].links[dPositions].push(obj.id)
      }

      for (let [k, v] of Object.entries(dateAsKey))
        data.push(v)

      dimension.data = data
    }

    return dimension
  }
  async closeDateAsSelectDimension() {
    let sItem = await this.positionList()
    let dimension = { id: "closeDates", data: [], selected: [] }
    let data = []
    let dateAsKey = {}
    let dPositions = "positions"

    if (sItem.data) {
      sItem.data = getObjsFieldNotNull(sItem.data, "ended_on")

      for (var obj of sItem.data) {
        let strDate = obj.ended_on

        if (!dateAsKey[strDate]) {
          dateAsKey[strDate] = {}

          dateAsKey[strDate].value = strDate
          dateAsKey[strDate].label = strDate

          dateAsKey[strDate].links = {}
          dateAsKey[strDate].links[dPositions] = []
        }

        dateAsKey[strDate].links[dPositions].push(obj.id)
      }

      for (let [k, v] of Object.entries(dateAsKey))
        data.push(v)

      dimension.data = data
    }

    return dimension
  }
  async monthAsSelectDimension(onlyOpen = false) {
    let sItem = onlyOpen ? await this.positionListOnlyOpen() : await this.positionList()
    let dimension = { id: "months", data: [], selected: [] }
    let data = []
    let dateAsKey = {}
    let dPositions = "positions"

    if (sItem.data) {
      for (var obj of sItem.data) {
        let strDate = TimeManager.getYearMonthString(obj.started_on)
        if (!dateAsKey[strDate]) {
          dateAsKey[strDate] = {}

          dateAsKey[strDate].value = strDate
          dateAsKey[strDate].label = strDate

          dateAsKey[strDate].links = {}
          dateAsKey[strDate].links[dPositions] = []
        }

        dateAsKey[strDate].links[dPositions].push(obj.id)
      }

      for (let [k, v] of Object.entries(dateAsKey))
        data.push(v)

      dimension.data = data
    }

    return dimension
  }
  async statusAsSelectDimension() {
    let sItem = await this.positionList()
    let dimension = { id: "statuses", data: [], items: [], selected: [] }
    let data = []
    let statusAsKey = {}
    let dPositions = "positions"

    if (sItem.data) {
      for (var obj of sItem.data) {
        obj.status = obj.ended_on ? 'closed' : 'open'
        if (!statusAsKey[obj.status]) {
          statusAsKey[obj.status] = {}

          dimension.items.push(obj.status)

          statusAsKey[obj.status].value = obj.status
          statusAsKey[obj.status].label = obj.status

          statusAsKey[obj.status].links = {}
          statusAsKey[obj.status].links[dPositions] = []
        }

        statusAsKey[obj.status].links[dPositions].push(obj.id)
      }

      for (let [k, v] of Object.entries(statusAsKey))
        data.push(v)

      data = orderBy(data, ["label"])
      dimension.data = data
    }

    return dimension
  }

  // My Strategies
  async myStrategyList(syncFull = false) {
    const sKey = "myStrategies"
    await this.startRequest(sKey)
    let result = undefined

    if (!syncFull) {
      result = await StorageManager.isUpToDate(this.sModule, sKey)
      if (result) {
        this.finishRequest(sKey)
        return result
      }
    }

    let wsInfo = this.getApi("wsMyStrategies")
    wsInfo.method = "get"
    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()
    result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers)

    if (result.status == 200)
      result = await StorageManager.store(sKey, result.data)
    else {
      this.getHttpTranslation(result, "mystrategylist", "strategy", true)
      result = await StorageManager.getItem(sKey)
    }

    this.finishRequest(sKey)
    return result
  }
  async myStrategyData(syncFull = false) {
    let sItem = await this.myStrategyList(syncFull)

    if (sItem && sItem.data)
      return sItem.data

    // Return it with http error details
    return sItem
  }
  async myStrategyCreate(strategy) {
    let wsInfo = this.getApi("wsMyStrategies")
    wsInfo.method = "post"
    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()

    let result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers, null, strategy)

    console.log(strategy)
    console.log({ result })

    if (result.status == 201) {
      strategy = result.data
      let syncFull = true

      await this.myStrategyList(syncFull)
      this.userProfileRetrieve(syncFull, strategy.owner_username)     // async call
    }

    // Return it with http error details
    return result
  }
  async myStrategyUpdate(strategy) {
    const sKey_strategies = "strategies"

    let wsInfo = this.getApi("wsMyStrategies")
    wsInfo.request += strategy.id + "/"
    wsInfo.method = "patch"
    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()
    let result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers, null, strategy)

    if (result.status == 200) {
      let syncFull = true
      await this.myStrategyList(syncFull)

      // Checks if the updated strategy has been retrieved before...
      let sStrategy = await StorageManager.getData(sKey_strategies, strategy.id)
      if (sStrategy)
        this.strategyRetrieve(syncFull, strategy.id)      // async call
    }

    // Return it with http error details
    return result
  }
  async myStrategyDelete(strategy) {
    const sKey_strategies = "strategies"
    const sKey_savedStrategies = "savedStrategies"

    var wsInfo = this.getApi("wsMyStrategies")
    wsInfo.request += strategy.id + "/"
    wsInfo.method = "delete"
    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()

    let result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers)

    if (result.status == 204) {
      let syncFull = true
      await this.myStrategyList(syncFull)
      this.userProfileRetrieve(syncFull, strategy.owner_username)
      StorageManager.removeItem(sKey_strategies, strategy.id)        // async call
      StorageManager.removeItem(sKey_savedStrategies, strategy.id)   // async call
    }
    else
      this.getHttpTranslation(result, "mystrategydelete", "strategy", true)

    return result
  }

  // Saved Strategies
  async savedStrategyList(syncFull = false) {
    const sKey = "savedStrategies"
    await this.startRequest(sKey)
    let result = undefined

    if (!syncFull) {
      result = await StorageManager.isUpToDate(this.sModule, sKey)
      if (result) {
        this.finishRequest(sKey)
        return result
      }
    }

    let wsInfo = this.getApi("wsStrategies")
    wsInfo.request += "saved/"
    wsInfo.method = "get"
    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()
    result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers)

    if (result.status == 200)
      result = await StorageManager.store(sKey, result.data)
    else {
      this.getHttpTranslation(result, "savedstrategylist", "strategy", true)
      result = await StorageManager.getItem(sKey)
    }

    this.finishRequest(sKey)
    return result
  }
  async savedStrategyData(syncFull = false) {
    let sItem = await this.savedStrategyList(syncFull)

    if (sItem && sItem.data)
      return sItem.data

    // Return it with http error details
    return sItem
  }

  // Strategies  
  // .. Data
  async strategyList(syncFull = false, query) {
    // [!] Do not implement this.startRequest(). It was made to process concurrent calls...
    const sKey = "strategies"
    let result = undefined

    // Defaults...
    if (!query.order_by)
      query.order_by = "-usage"
    if (!query.page)
      query.page = 1

    query = this.formatedQuery(query)

    let strQueryParams = this.queryParamsAsString(query)

    if (!syncFull) {
      result = await StorageManager.isUpToDate(this.sModule, sKey, strQueryParams)
      if (result) {
        return result
      }
    }

    let wsInfo = this.getApi("wsStrategies")
    wsInfo.method = "get"
    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()
    wsInfo.params = query
    result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers, wsInfo.params)

    if (result.status == 200)
      result = await StorageManager.store(sKey, result.data, strQueryParams)
    else {
      this.getHttpTranslation(result, "strategylist", "strategy", true)
      result = await StorageManager.getItem(sKey, strQueryParams)
    }

    return result
  }
  async strategyData(syncFull = false, query) {
    let sItem = await this.strategyList(syncFull, query)

    if (sItem && sItem.data)
      return sItem.data

    // Return it with http error details
    return sItem
  }
  async strategyRetrieve(syncFull = false, pk) {
    const sKey = "strategies"
    await this.startRequest(sKey)
    let result = undefined

    if (!syncFull) {
      result = await StorageManager.isUpToDate(this.sModule, sKey, pk)
      if (result) {
        this.finishRequest(sKey)
        return result
      }
    }

    let wsInfo = this.getApi("wsStrategies")
    wsInfo.request += `${pk}/`
    wsInfo.method = "get"
    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()
    result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers)

    if (result.status == 200)
      result = await StorageManager.store(sKey, result.data, pk)
    else if (result.response.status == 404) {
      // Clean cache...
      StorageManager.removeItem(sKey, pk)
    }
    else {
      // Other error codes...
      this.getHttpTranslation(result, "strategyretrieve", "strategy", true)
    }

    this.finishRequest(sKey)
    return result
  }
  async strategyRate(payload) {
    // payload.rating needed...
    let wsInfo = this.getApi("wsStrategies")
    wsInfo.request += payload.id + "/rate/"
    wsInfo.method = "post"
    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()

    let result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers, null, payload)

    this.getHttpTranslation(result, "strategyrate", "strategy", true)

    return result
  }
  async strategyRun(pk) {
    let wsInfo = this.getApi("wsStrategies")
    wsInfo.request += pk + "/run/"
    wsInfo.method = "post"
    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()

    let result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers)

    if (result.status !== 200)
      this.getHttpTranslation(result, "strategyrun", "strategy")

    return result
  }
  async strategySave(pk) {
    let wsInfo = this.getApi("wsStrategies")
    wsInfo.request += pk + "/save/"
    wsInfo.method = "post"
    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()

    let result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers)

    if (result.status == 200) {
      this.getHttpTranslation(result, "strategysave", "strategy", true)
      let syncFull = true
      await this.savedStrategyList(syncFull)
    }
    else
      this.getHttpTranslation(result, "strategysave", "strategy")

    return result
  }
  async strategyUnsave(pk) {
    let wsInfo = this.getApi("wsStrategies")
    wsInfo.request += pk + "/unsave/"
    wsInfo.method = "post"
    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()

    let result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers)

    if (result.status == 200) {
      this.getHttpTranslation(result, "strategyunsave", "strategy", true)
      let syncFull = true
      await this.savedStrategyList(syncFull)
    }
    else
      this.getHttpTranslation(result, "strategyunsave", "strategy")

    return result
  }
  // .. Functions
  formatedQuery(query) {
    let formatedQuery = {}

    for (var [k0, v0] of Object.entries(query))
      switch (k0) {
        case "filters":
          if (Object.keys(v0).length > 0) {
            // Object has data...
            formatedQuery["f_keys"] = ""
            formatedQuery["f_values"] = ""

            for (var [k0, v0] of Object.entries(v0)) {
              // For each filter...
              formatedQuery["f_keys"] += `${String(k0)},`
              formatedQuery["f_values"] += `${String(v0)},`
            }

            // Remove last comma...
            formatedQuery["f_keys"] = formatedQuery["f_keys"].slice(0, -1)
            formatedQuery["f_values"] = formatedQuery["f_values"].slice(0, -1)
          }
          break;
        default:
          formatedQuery[k0] = v0
          break;
      }

    return formatedQuery
  }
  queryParamsAsString(query) {
    let orderedQuery = {}
    let queryParams = ""

    let orderedKeys = Object.keys(query).sort()

    for (var k of orderedKeys)
      orderedQuery[k] = query[k]

    for (var [k, v] of Object.entries(orderedQuery)) {
      queryParams += `${k}=${v}&`
    }
    // Remove last '&'...
    queryParams = queryParams.slice(0, -1)

    return queryParams
  }
  strategyPageLink(pk) {
    return `${window.location.protocol}//${window.location.host}${this.strategyPagePath(pk)}`
  }
  strategyPagePath(pk) {
    return `/app/strategies/${pk}/`
  }

  // Position Type
  async positionTypeList() {
    const sKey = "positionTypes"
    let result = await StorageManager.isUpToDate(this.sModule, sKey)

    if (result)
      return result

    let wsInfo = this.getApi("wsPositionTypes")
    wsInfo.method = "get"
    result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers)

    if (result.status == 200)
      result = await StorageManager.store(sKey, result.data)
    else {
      this.getHttpTranslation(result, "positiontypelist", "positionType", true)
      result = await StorageManager.getItem(sKey)
    }

    return result
  }
  async positionTypeData() {
    let sItem = await this.positionTypeList()

    if (sItem && sItem.data)
      return sItem.data

    // Return it with http error details
    return sItem
  }
  async positionTypeRetrieve(pk) {
    let sItem = await this.positionTypeList()

    let positionType = retrieveObjFromObjList(sItem.data, "id", pk)
    return positionType
  }
  async positionTypeAsSelectDimension(onlyOpen = false) {
    let sItem = await this.positionTypeList()
    let sPositions = onlyOpen ? await this.positionListOnlyOpen() : await this.positionList()
    let dimension = { id: "types", data: [], items: [], selected: [] }
    let data = []
    let positionTypeAsKey = {}
    let dPositions = "positions"

    if (sItem.data && sPositions.data) {
      for (var obj of sPositions.data) {
        if (!positionTypeAsKey[obj.type]) {
          positionTypeAsKey[obj.type] = {}

          positionTypeAsKey[obj.type].id = obj.type

          positionTypeAsKey[obj.type].links = {}
          positionTypeAsKey[obj.type].links[dPositions] = []
        }
        positionTypeAsKey[obj.type].links[dPositions].push(obj.id)
      }

      for (let [k, v] of Object.entries(positionTypeAsKey)) {
        for (var obj of sItem.data)
          if (v.id === obj.id) {
            v.label = obj.name
            v.value = obj.id
          }

        data.push(v)
      }

      for (var obj of data)
        dimension.items.push(obj.name)

      data = orderBy(data, ["label"])
      dimension.data = data
    }

    return dimension
  }
  async positionTypesForSelect() {
    let sItem = await this.positionTypeList()
    let options = []

    if (sItem.data) {
      sItem.data = orderBy(sItem.data, ["name"])

      for (var obj of sItem.data) {
        let option = {
          value: obj.id,
          label: obj.name,
        }

        options.push(option)
      }
    }

    return options
  }

  // User
  // .. Data
  async userProfileRetrieve(syncFull = false, username) {
    const sKey = "userProfiles"
    await this.startRequest(sKey)
    let result = undefined

    if (!syncFull) {
      result = await StorageManager.isUpToDate(this.sModule, sKey, username)

      if (result) {
        this.finishRequest(sKey)
        return result
      }
    }

    let wsInfo = this.getApi("wsUser")
    wsInfo.request += `${username}/profile/`
    wsInfo.method = "get"
    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()
    result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers)

    if (result.status == 200) {
      result = result.data
      result = await StorageManager.store(sKey, result, result.username)
    }

    this.finishRequest(sKey)
    return result
  }
  // .. Functions
  async userFollow(username) {
    const sKey = "user"
    await this.startRequest(sKey)

    let wsInfo = this.getApi("wsUser")
    wsInfo.request += `${username}/follow/`
    wsInfo.method = "post"
    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()
    let result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers)

    if (result.status != 200)
      this.getHttpTranslation(result, "userfollow", "user", true)

    this.finishRequest(sKey)
    return result
  }
  async userUnfollow(username) {
    const sKey = "user"
    await this.startRequest(sKey)

    let wsInfo = this.getApi("wsUser")
    wsInfo.request += `${username}/unfollow/`
    wsInfo.method = "post"
    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()
    let result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers)

    if (result.status != 200)
      this.getHttpTranslation(result, "userunfollow", "user", true)

    this.finishRequest(sKey)
    return result
  }
  userProfileLink(username) {
    return `${window.location.protocol}//${window.location.host}${this.userProfilePath(username)}`
  }
  userProfilePath(username) {
    return `/app/u/${username}/`
  }

  // Wallet
  // .. Data
  async walletList(syncFull = false) {
    const sKey = "wallets"
    await this.startRequest(sKey)
    let result = undefined

    if (!syncFull) {
      result = await StorageManager.isUpToDate(this.sModule, sKey)
      if (result) {
        this.finishRequest(sKey)
        return result
      }
    }

    let wsInfo = this.getApi("wsWallets")
    wsInfo.method = "get"
    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()
    result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers)

    if (result.status == 200) {
      result = result.data
      result = await StorageManager.store(sKey, result)
    }
    else {
      this.getHttpTranslation(result, "walletlist", "wallet", true)
      result = await StorageManager.getItem(sKey)
    }

    this.finishRequest(sKey)
    return result
  }
  async offlineWalletList() {
    const sKey = "wallets"
    let result = await StorageManager.getItem(sKey)
    return result
  }
  async walletData(syncFull = false) {
    let sItem = await this.walletList(syncFull)

    if (sItem && sItem.data)
      return sItem.data

    // Return it with http error details
    return sItem
  }
  async walletCreate(wallet) {
    let wsInfo = this.getApi("wsWallets")
    wsInfo.method = "post"
    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()
    let result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers, null, wallet)

    if (result.status == 201) {
      let syncFull = true
      await this.walletList(syncFull)
    }

    return result
  }
  async walletRetrieve(pk) {
    let sItem = await this.walletList()

    let wallet = retrieveObjFromObjList(sItem.data, "id", pk)
    return wallet
  }
  async walletUpdate(wallet) {
    let wsInfo = this.getApi("wsWallets")
    wsInfo.request += wallet.id + "/"
    wsInfo.method = "patch"
    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()
    let result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers, null, wallet)

    if (result.status == 200) {
      let syncFull = true
      await this.walletList(syncFull)
    }

    return result
  }
  async walletDelete(pk) {
    var wsInfo = this.getApi("wsWallets")
    wsInfo.request += pk + "/"
    wsInfo.method = "delete"
    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()

    let result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers)

    if (result.status == 204) {
      let syncFull = true
      this.positionList(syncFull)         // async call
      await this.walletList(syncFull)
    }
    else
      this.getHttpTranslation(result, "walletdelete", "wallet", true)

    return result
  }
  // .. Dimensions
  async walletAsSelectDimension() {
    let sItem = await this.walletList()
    let dimension = { id: "wallets", data: [], selected: [], disabled: {} }
    let data = []
    let dPositions = "positions"

    if (sItem.data) {

      for (var obj of sItem.data) {
        obj.value = obj.id
        obj.label = obj.name

        obj.links = {}
        obj.links[dPositions] = obj.positions
        delete obj.positions

        data.push(obj)
      }

      data = orderBy(data, ["label"])
      dimension.data = data
    }

    return dimension
  }
  async walletsForSelect() {
    let sItem = await this.walletList()
    let options = []

    if (sItem.data) {
      sItem.data = orderBy(sItem.data, ["name"])

      for (var obj of sItem.data) {
        let option = {
          value: obj.id,
          label: obj.name,

          id: obj.id,
          name: obj.name,
          desc: obj.desc,
          balance: obj.balance,
          currency: obj.currency,
          se_short: obj.se_short,
          is_default: obj.is_default
        }

        options.push(option)
      }
    }

    return options
  }
  // --------------------

  getApi(apiId) {
    if (apiId in this.apis)
      return deepCloneObj(this.apis[apiId]);
    return null
  }
}

export default AppManager;
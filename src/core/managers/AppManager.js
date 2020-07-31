import AuthManager from "./AuthManager";
import StorageManager from "./StorageManager";
import TimeManager from "./TimeManager";
import {
  customAxios,
  deepCloneObj,
  getObjsFieldNull,
  joinObjLists,
  orderBy,
  regularAxios,
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

  async countryList() {
    const sKey = "countries"
    let result = StorageManager.isUpToDate(this.sModule, sKey)

    if (result)
      return result

    let wsInfo = this.getApi("wsCountries")
    wsInfo.method = "get"
    result = await customAxios(wsInfo.method, wsInfo.request, wsInfo.options.headers)

    if (!result.error) {
      result = result.data
      return StorageManager.store(sKey, result)
    }

    this.getHttpTranslation(result.error, "countrylist", "country", true)
    return StorageManager.getItem(sKey)
  }
  async countryRetrieve(pk) {
    let sItem = await this.countryList()

    let country = retrieveObjFromObjList(sItem.data, "code", pk)
    return country
  }

  async currencyList() {
    const sKey = "currencies"
    await this.startRequest(sKey)
    let result = StorageManager.isUpToDate(this.sModule, sKey)

    if (result) {
      this.finishRequest(sKey)
      return result
    }

    let wsInfo = this.getApi("wsCurrencies")
    wsInfo.method = "get"
    result = await customAxios(wsInfo.method, wsInfo.request, wsInfo.options.headers)

    if (!result.error) {
      result = result.data
      this.finishRequest(sKey)
      return StorageManager.store(sKey, result)
    }

    this.finishRequest(sKey)
    this.getHttpTranslation(result.error, "currencylist", "currency", true)
    return StorageManager.getItem(sKey)
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

  async subscriptionList() {
    const sKey = "subscriptions"
    let result = StorageManager.isUpToDate(this.sModule, sKey)

    if (result)
      return result

    let wsInfo = this.getApi("wsSubscriptions")
    wsInfo.method = "get"
    result = await customAxios(wsInfo.method, wsInfo.request, wsInfo.options.headers)

    if (!result.error) {
      result = result.data
      return StorageManager.store(sKey, result)
    }

    this.getHttpTranslation(result.error, "subscriptionlist", "subscription", true)
    return StorageManager.getItem(sKey)
  }
  async subscriptionRetrieve(pk) {
    let sItem = await this.subscriptionList()

    if (sItem.data)
      return retrieveObjFromObjList(sItem.data, "name", pk)

    // Return it with http error details <result.error>
    return sItem
  }

  async positionList(syncFull = false) {
    const sKey = "positions"
    await this.startRequest(sKey)

    let lastModifiedTime = "2001-01-01T00:00:00Z"
    let sData = StorageManager.getData(sKey)
    let result = StorageManager.isUpToDate(this.sModule, sKey)

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
    wsInfo.options.headers.Authorization = "token " + AuthManager.storedToken()
    wsInfo.options.params = {
      dateFrom: lastModifiedTime
    }

    result = await customAxios(wsInfo.method, wsInfo.request, wsInfo.options.headers, wsInfo.options.params)

    if (!result.error) {
      result = result.data

      if (!syncFull && sData)
        result = joinObjLists(sData, result)

      result = orderBy(result, ["-last_modified"])   // Don't change the order. It's used to define 'lastModifiedTime'.

      this.finishRequest(sKey)
      return StorageManager.store(sKey, result)
    }

    this.finishRequest(sKey)
    this.getHttpTranslation(result.error, "positionlist", "position", true)
    return StorageManager.getItem(sKey)
  }
  async positionData(syncFull = false) {
    let sItem = await this.positionList(syncFull)

    if (sItem && sItem.data)
      return sItem.data

    // Return it with http error details <result.error>
    return sItem
  }
  async positionCreate(position) {
    let wsInfo = this.getApi("wsPositions")
    wsInfo.method = "post"
    wsInfo.options.headers.Authorization = "token " + AuthManager.storedToken()

    let result = await regularAxios(wsInfo.method, wsInfo.request, wsInfo.options.headers, null, position)

    if (result.status == 201) {
      let syncFull = true
      await this.positionList(syncFull)
      await this.walletList(syncFull)
    }

    return result
  }
  async positionUpdate(position) {
    let wsInfo = this.getApi("wsPositions")
    wsInfo.request += position.id + "/"
    wsInfo.method = "patch"
    wsInfo.options.headers.Authorization = "token " + AuthManager.storedToken()
    let result = await regularAxios(wsInfo.method, wsInfo.request, wsInfo.options.headers, null, position)

    if (result.status == 200) {
      let syncFull = true
      await this.positionList(syncFull)
      this.walletList(syncFull)       //Backend operation (no await)
    }

    return result
  }
  async positionDelete(pk) {
    var wsInfo = this.getApi("wsPositions")
    wsInfo.request += pk + "/"
    wsInfo.method = "delete"
    wsInfo.options.headers.Authorization = "token " + AuthManager.storedToken()

    let result = await regularAxios(wsInfo.method, wsInfo.request, wsInfo.options.headers)

    if (result.status == 204) {
      let syncFull = true
      await this.positionList(syncFull)
      this.walletList(syncFull)     //Backend operation (no await)
      return result
    }

    this.getHttpTranslation(result, "positiondelete", "position", true)
    return result
  }

  async positionListOnlyOpen() {
    let sItem = await this.positionList()

    if (sItem.data)
      sItem.data = getObjsFieldNull(sItem.data, "ended_on")

    return sItem
  }
  async positionRetrieve(pk) {
    let sItem = await this.positionList()

    if (sItem.data)
      return retrieveObjFromObjList(sItem.data, "id", pk)

    // Return it with http error details <result.error>
    return sItem
  }
  async positionAsDimension(onlyOpen = false) {
    let sItem = onlyOpen ? await this.positionListOnlyOpen() : await this.positionList()
    let dimension = { id: "positions", data: [], items: [], selected: [], disabled: {} }
    let data = []
    let dAssets = "assets"
    let dDates = "dates"
    let dTypes = "types"
    let dStatuses = "statuses"
    let dWallets = "wallets"

    if (sItem.data) {
      sItem.data = orderBy(sItem.data)

      for (var obj of sItem.data) {
        dimension.items.push(obj.id)
        obj.links = {}
        obj.links[dAssets] = [obj.asset_symbol]
        obj.links[dDates] = [obj.started_on]
        obj.links[dStatuses] = [obj.ended_on ? 'closed' : 'open']
        obj.links[dTypes] = [obj.type]
        obj.links[dWallets] = [obj.wallet]

        data.push(obj)
      }

      dimension.data = data
    }
    else if (sItem.error)
      dimension.error = sItem.error

    return dimension
  }
  async positionAsSelectDimension(onlyOpen = false) {
    let sItem = onlyOpen ? await this.positionListOnlyOpen() : await this.positionList()
    let dimension = { id: "positions", data: [], selected: [], disabled: {} }
    let data = []
    let dAssets = "assets"
    let dDates = "dates"
    let dMonths = "months"
    let dTypes = "types"
    let dWallets = "wallets"

    if (sItem.data) {
      sItem.data = orderBy(sItem.data)

      for (var obj of sItem.data) {
        obj.links = {}
        obj.links[dAssets] = [obj.asset_symbol]
        obj.links[dDates] = [obj.started_on]
        obj.links[dMonths] = [TimeManager.getYearMonthString(obj.started_on)]
        obj.links[dTypes] = [obj.type]
        obj.links[dWallets] = [obj.wallet]

        data.push(obj)
      }

      dimension.data = data
    }
    else if (sItem.error)
      dimension.error = sItem.error

    return dimension
  }
  // Generated from Positions
  async assetAsDimension(onlyOpen = false) {
    let sItem = onlyOpen ? await this.positionListOnlyOpen() : await this.positionList()
    let dimension = { id: "assets", data: [], items: [], selected: [], disabled: {} }
    let data = []
    let assetAsKey = {}
    let dPositions = "positions"

    if (sItem.data) {
      sItem.data = orderBy(sItem.data, ["asset_label"])

      for (var obj of sItem.data) {
        if (!assetAsKey[obj.asset_label]) {
          assetAsKey[obj.asset_label] = {}

          dimension.items.push(obj.asset_label)

          assetAsKey[obj.asset_label].id = obj.asset_symbol
          assetAsKey[obj.asset_label].name = obj.asset_label

          assetAsKey[obj.asset_label].links = {}
          assetAsKey[obj.asset_label].links[dPositions] = []
        }

        assetAsKey[obj.asset_label].links[dPositions].push(obj.id)
      }

      for (let [k, v] of Object.entries(assetAsKey))
        data.push(v)

      dimension.data = data
    }
    else if (sItem.error)
      dimension.error = sItem.error

    return dimension
  }
  async assetAsSelectDimension(onlyOpen = false) {
    let sItem = onlyOpen ? await this.positionListOnlyOpen() : await this.positionList()
    let dimension = { id: "assets", data: [], selected: [], disabled: {} }
    let data = []
    let assetAsKey = {}
    let dPositions = "positions"

    if (sItem.data) {
      sItem.data = orderBy(sItem.data, ["asset_label"])

      for (var obj of sItem.data) {
        if (!assetAsKey[obj.asset_label]) {
          assetAsKey[obj.asset_label] = {}

          assetAsKey[obj.asset_label].value = obj.asset_symbol
          assetAsKey[obj.asset_label].label = obj.asset_label

          assetAsKey[obj.asset_label].id = obj.asset_symbol
          assetAsKey[obj.asset_label].name = obj.asset_label

          assetAsKey[obj.asset_label].links = {}
          assetAsKey[obj.asset_label].links[dPositions] = []
        }

        assetAsKey[obj.asset_label].links[dPositions].push(obj.id)
      }

      for (let [k, v] of Object.entries(assetAsKey))
        data.push(v)

      dimension.data = data
    }
    else if (sItem.error)
      dimension.error = sItem.error

    return dimension
  }
  async dateAsDimension(onlyOpen = false) {
    let sItem = onlyOpen ? await this.positionListOnlyOpen() : await this.positionList()
    let dimension = { id: "dates", data: [], items: [], selected: [], disabled: {} }
    let data = []
    let dateAsKey = {}
    let dPositions = "positions"

    if (sItem.data) {
      sItem.data = orderBy(sItem.data, ["-started_on"])

      for (var obj of sItem.data) {
        let strDate = obj.started_on
        if (!dateAsKey[strDate]) {
          dateAsKey[strDate] = {}

          dimension.items.push(strDate)

          dateAsKey[strDate].id = strDate
          dateAsKey[strDate].name = strDate

          dateAsKey[strDate].links = {}
          dateAsKey[strDate].links[dPositions] = []
        }

        dateAsKey[strDate].links[dPositions].push(obj.id)
      }

      for (let [k, v] of Object.entries(dateAsKey))
        data.push(v)

      dimension.data = data
    }
    else if (sItem.error)
      dimension.error = sItem.error

    return dimension
  }
  async dateAsSelectDimension(onlyOpen = false) {
    let sItem = onlyOpen ? await this.positionListOnlyOpen() : await this.positionList()
    let dimension = { id: "dates", data: [], selected: [], disabled: {} }
    let data = []
    let dateAsKey = {}
    let dPositions = "positions"

    if (sItem.data) {
      sItem.data = orderBy(sItem.data, ["-started_on"])

      for (var obj of sItem.data) {
        let strDate = obj.started_on
        if (!dateAsKey[strDate]) {
          dateAsKey[strDate] = {}

          dateAsKey[strDate].id = strDate
          dateAsKey[strDate].name = strDate

          dateAsKey[strDate].links = {}
          dateAsKey[strDate].links[dPositions] = []
        }

        dateAsKey[strDate].links[dPositions].push(obj.id)
      }

      for (let [k, v] of Object.entries(dateAsKey))
        data.push(v)

      dimension.data = data
    }
    else if (sItem.error)
      dimension.error = sItem.error

    return dimension
  }
  async monthAsDimension(onlyOpen = false) {
    let sItem = onlyOpen ? await this.positionListOnlyOpen() : await this.positionList()
    let dimension = { id: "months", data: [], items: [], selected: [], disabled: {} }
    let data = []
    let dateAsKey = {}
    let dPositions = "positions"

    if (sItem.data) {
      sItem.data = orderBy(sItem.data, ["-started_on"])

      for (var obj of sItem.data) {
        let strDate = TimeManager.getYearMonthString(obj.started_on)
        if (!dateAsKey[strDate]) {
          dateAsKey[strDate] = {}

          dimension.items.push(strDate)

          dateAsKey[strDate].id = strDate
          dateAsKey[strDate].name = strDate

          dateAsKey[strDate].links = {}
          dateAsKey[strDate].links[dPositions] = []
        }

        dateAsKey[strDate].links[dPositions].push(obj.id)
      }

      for (let [k, v] of Object.entries(dateAsKey))
        data.push(v)

      dimension.data = data
    }
    else if (sItem.error)
      dimension.error = sItem.error

    return dimension
  }
  async monthAsSelectDimension(onlyOpen = false) {
    let sItem = onlyOpen ? await this.positionListOnlyOpen() : await this.positionList()
    let dimension = { id: "months", data: [], selected: [], disabled: {} }
    let data = []
    let dateAsKey = {}
    let dPositions = "positions"

    if (sItem.data) {
      sItem.data = orderBy(sItem.data, ["-started_on"])

      for (var obj of sItem.data) {
        let strDate = TimeManager.getYearMonthString(obj.started_on)
        if (!dateAsKey[strDate]) {
          dateAsKey[strDate] = {}

          dateAsKey[strDate].value = strDate
          dateAsKey[strDate].label = strDate

          dateAsKey[strDate].id = strDate
          dateAsKey[strDate].name = strDate

          dateAsKey[strDate].links = {}
          dateAsKey[strDate].links[dPositions] = []
        }

        dateAsKey[strDate].links[dPositions].push(obj.id)
      }

      for (let [k, v] of Object.entries(dateAsKey))
        data.push(v)

      dimension.data = data
    }
    else if (sItem.error)
      dimension.error = sItem.error

    return dimension
  }
  async statusAsDimension() {
    let sItem = await this.positionList()
    let dimension = { id: "statuses", data: [], items: [], selected: [], disabled: {} }
    let data = []
    let statusAsKey = {}
    let dPositions = "positions"

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
          statusAsKey[obj.status].links[dPositions] = []
        }

        statusAsKey[obj.status].links[dPositions].push(obj.id)
      }

      for (let [k, v] of Object.entries(statusAsKey))
        data.push(v)

      dimension.data = data
    }
    else if (sItem.error)
      dimension.error = sItem.error

    return dimension
  }
  // --------------------

  async positionTypeList() {
    const sKey = "positionTypes"
    let result = StorageManager.isUpToDate(this.sModule, sKey)

    if (result)
      return result

    let wsInfo = this.getApi("wsPositionTypes")
    wsInfo.method = "get"
    result = await customAxios(wsInfo.method, wsInfo.request, wsInfo.options.headers)

    if (!result.error) {
      result = result.data
      return StorageManager.store(sKey, result)
    }

    this.getHttpTranslation(result.error, "positiontypelist", "positionType", true)
    return StorageManager.getItem(sKey)
  }
  async positionTypeData() {
    let sItem = await this.positionTypeList()

    if (sItem && sItem.data)
      return sItem.data

    // Return it with http error details <result.error>
    return sItem
  }
  async positionTypeRetrieve(pk) {
    let sItem = await this.positionTypeList()

    let positionType = retrieveObjFromObjList(sItem.data, "id", pk)
    return positionType
  }
  async positionTypeAsDimension(onlyOpen = false) {
    let sItem = await this.positionTypeList()
    let sPositions = onlyOpen ? await this.positionListOnlyOpen() : await this.positionList()
    let dimension = { id: "types", data: [], items: [], selected: [], disabled: {} }
    let data = []
    let positionTypeAsKey = {}
    let dPositions = "positions"

    if (sItem.data && sPositions.data) {
      sItem.data = orderBy(sItem.data, ["name"])

      for (var obj of sPositions.data) {
        if (!positionTypeAsKey[obj.type]) {
          positionTypeAsKey[obj.type] = {}

          positionTypeAsKey[obj.type].id = obj.type
          positionTypeAsKey[obj.type].desc = null

          positionTypeAsKey[obj.type].links = {}
          positionTypeAsKey[obj.type].links[dPositions] = []
        }
        positionTypeAsKey[obj.type].links[dPositions].push(obj.id)
      }

      for (let [k, v] of Object.entries(positionTypeAsKey)) {
        for (var obj of sItem.data)
          if (v.id === obj.id) {
            v.name = obj.name
            v.desc = obj.desc
          }

        data.push(v)
      }

      for (var obj of data)
        dimension.items.push(obj.name)

      dimension.data = data
    }
    else if (sItem.error)
      dimension.error = sItem.error

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

          id: obj.id,
          name: obj.name,
          desc: obj.desc
        }

        options.push(option)
      }
    }

    return options
  }

  async walletList(syncFull = false) {
    const sKey = "wallets"
    await this.startRequest(sKey)
    let result = null

    if (!syncFull) {
      result = StorageManager.isUpToDate(this.sModule, sKey)
      if (result) {
        this.finishRequest(sKey)
        return result
      }
    }

    let wsInfo = this.getApi("wsWallets")
    wsInfo.method = "get"
    wsInfo.options.headers.Authorization = "token " + AuthManager.storedToken()
    result = await customAxios(wsInfo.method, wsInfo.request, wsInfo.options.headers)

    if (!result.error) {
      result = result.data
      this.finishRequest(sKey)
      return StorageManager.store(sKey, result)
    }

    this.finishRequest(sKey)
    this.getHttpTranslation(result.error, "walletlist", "wallet", true)
    return StorageManager.getItem(sKey)
  }
  async walletData(syncFull = false) {
    let sItem = await this.walletList(syncFull)

    if (sItem && sItem.data)
      return sItem.data

    // Return it with http error details <result.error>
    return sItem
  }
  async walletCreate(wallet) {
    let wsInfo = this.getApi("wsWallets")
    wsInfo.method = "post"
    wsInfo.options.headers.Authorization = "token " + AuthManager.storedToken()
    let result = await regularAxios(wsInfo.method, wsInfo.request, wsInfo.options.headers, null, wallet)

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
    wsInfo.options.headers.Authorization = "token " + AuthManager.storedToken()
    let result = await regularAxios(wsInfo.method, wsInfo.request, wsInfo.options.headers, null, wallet)

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
    wsInfo.options.headers.Authorization = "token " + AuthManager.storedToken()

    let result = await regularAxios(wsInfo.method, wsInfo.request, wsInfo.options.headers)

    if (result.status == 204) {
      let syncFull = true
      await this.walletList(syncFull)
      this.positionList(syncFull)    //Backend operation (no await)
      return result
    }

    this.getHttpTranslation(result, "walletdelete", "wallet", true)
    return result
  }
  async walletAsDimension() {
    let sItem = await this.walletList()
    let dimension = { id: "wallets", data: [], items: [], selected: [], disabled: {} }
    let data = []
    let dPositions = "positions"

    if (sItem.data) {
      sItem.data = orderBy(sItem.data, ["name"])

      for (var obj of sItem.data) {
        dimension.items.push(obj.name)
        obj.links = {}
        obj.links[dPositions] = obj.positions
        delete obj.positions
        data.push(obj)
      }

      dimension.data = data
    }
    else if (sItem.error)
      dimension.error = sItem.error

    return dimension
  }
  async walletAsSelectDimension() {
    let sItem = await this.walletList()
    let dimension = { id: "wallets", data: [], selected: [], disabled: {} }
    let data = []
    let dPositions = "positions"

    if (sItem.data) {
      sItem.data = orderBy(sItem.data, ["name"])

      for (var obj of sItem.data) {
        obj.value = obj.id
        obj.label = obj.name

        obj.links = {}
        obj.links[dPositions] = obj.positions
        delete obj.positions

        data.push(obj)
      }
      dimension.data = data
    }
    else if (sItem.error)
      dimension.error = sItem.error

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

  getApi(apiId) {
    if (apiId in this.apis)
      return deepCloneObj(this.apis[apiId]);
    return null
  }
}

export default AppManager;
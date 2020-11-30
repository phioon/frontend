import StorageManager from "./StorageManager";
import { deepCloneObj, httpRequest, sleep } from "../utils";

var __user = undefined;
var __token = undefined;

class AuthManager {
  constructor(gtagManager, getHttpTranslation, setAuthStatus, setPrefs, setUser) {
    this.managers = {
      gtag: gtagManager
    }
    this.getHttpTranslation = getHttpTranslation
    this.setAuthStatus = setAuthStatus
    this.setPrefs = setPrefs
    this.setUser = setUser

    this.sModule = "auth"
    this.apis = {
      wsUser: {
        options: { headers: { "Content-Type": "application/json" } },
        request: "/api/auth/user/"
      },
      wsLogoutAll: {
        options: { headers: { "Content-Type": "application/json" } },
        method: "post",
        request: "/api/auth/logoutAll/"
      },
    }
    this.username_lastCheck = ""
    this.username_next = ""
    this.username_lastResult = undefined
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

  async isUsernameAvailable(username) {
    // This function is triggered after an onChange() function. That means, every change on the field will trigger it.
    // To avoid stressing our backend, we'll try to reduce the amount of requests.
    const sKey = "checkUsername"

    this.username_next = username                   // Sets the latest username to be tested
    await this.startRequest(sKey)

    if (this.username_lastCheck === this.username_next) {
      // If last checking process checked for the same username as now, return the last result.
      this.finishRequest(sKey)
      return this.username_lastResult
    }

    this.username_lastCheck = this.username_next    // Gets what's going to be the next username to be tested
    username = this.username_lastCheck

    let data = { username: username }
    let isAvailable = false
    let wsInfo = this.getApi("wsUser")
    wsInfo.request += "checkAvailability/"
    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()
    wsInfo.method = "post"

    let result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers, null, data)

    if (result.status == 200)
      isAvailable = result.data.is_available
    else
      isAvailable = undefined

    this.username_lastResult = isAvailable
    this.finishRequest(sKey)
    return isAvailable
  }
  async userRegister(user) {
    let wsInfo = this.getApi("wsUser")
    wsInfo.request += "register/"
    wsInfo.method = "post"
    return await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers, null, user)
  }
  async userLogin(user) {
    const sKey = "user"

    let wsInfo = this.getApi("wsUser")
    wsInfo.request += "login/"
    wsInfo.method = "post"
    let result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers, null, user)

    if (result.status == 200) {
      result = result.data

      this.instantUser(result.user)
      AuthManager.instantToken(result.token)

      await this.storePrefs(result.user.prefs)
      this.setPrefs(result.user.prefs)
      await StorageManager.store(sKey, result)

      this.setAuthStatus(true)

      this.managers.gtag.userInitialize(result.user, true)
      return result
    }

    return result
  }
  async userLogout() {
    let wsInfo = this.getApi("wsUser")
    wsInfo.request += "logout/"
    wsInfo.method = "post"
    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()

    this.clearUserLocalData()
    this.managers.gtag.userLogout()
    return await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers)
  }
  async userChangePassword(object) {
    let wsInfo = this.getApi("wsUser")
    wsInfo.request += "changepassword/"
    wsInfo.method = "post"
    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()

    return await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers, undefined, object)
  }
  async userRequestPasswordReset(user) {
    let wsInfo = this.getApi("wsUser")
    wsInfo.request += "request/passwordreset/"
    wsInfo.method = "post"

    return await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers, undefined, user)
  }
  async userRequestConfirmEmail(user) {
    let wsInfo = this.getApi("wsUser")
    wsInfo.request += "request/emailconfirmation/"
    wsInfo.method = "post"

    return await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers, undefined, user)
  }
  async checkToken(uidb64, token) {
    let wsInfo = this.getApi("wsUser")
    wsInfo.request += "checkToken/" + uidb64 + "/" + token + "/"
    wsInfo.method = "get"

    return await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers)
  }
  async userSetPasswordWithToken(object) {
    let wsInfo = this.getApi("wsUser")
    wsInfo.request += "confirm/passwordreset/"
    wsInfo.method = "post"

    return await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers, undefined, object)
  }
  async userConfirmEmailWithToken(object) {
    let wsInfo = this.getApi("wsUser")
    wsInfo.request += "confirm/email/"
    wsInfo.method = "post"

    return await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers, undefined, object)
  }

  async userUpdate(data) {
    const sKey = "user"
    let result = {}

    // Data for UserSerializer
    let wsInfo = this.getApi("wsUser")
    wsInfo.request += "update/"
    wsInfo.method = "patch"
    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()

    result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers, null, data)

    if (result.status == 200) {
      this.getHttpTranslation(result, "profileupdate", "user", true)
      result = result.data
      this.instantUser(result)
      let sUser = await StorageManager.getData(sKey)
      sUser.user = result
      await this.storePrefs(sUser.user.prefs)
      this.setPrefs(sUser.user.prefs)
      return await StorageManager.store(sKey, sUser)
    }
    else
      return result

  }
  async userRetrieve() {
    const sKey = "user"
    let sToken = await AuthManager.storedToken()

    if (sToken) {
      let wsInfo = this.getApi("wsUser")
      wsInfo.request += "retrieve/"
      wsInfo.method = "get"
      wsInfo.options.headers.Authorization = "token " + sToken
      let result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers)

      if (result.status == 200) {
        result = result.data

        let sData = await StorageManager.getData(sKey)
        sData.user = result

        this.instantUser(sData.user)
        AuthManager.instantToken(sData.token)

        await this.storePrefs(sData.user.prefs)
        this.setPrefs(sData.user.prefs)

        this.managers.gtag.userInitialize(sData.user, false)
        return await StorageManager.store(sKey, sData)
      }
    }
    return null
  }

  async isUserAuthenticated() {
    const sKey = "user"
    let sUser = await this.userRetrieve()

    if (sUser)
      return true

    StorageManager.removeData(sKey)
    return false
  }
  async clearUserLocalData() {
    const sKey_user = "user"
    const sKey_wallets = "wallets"
    const sKey_positions = "positions"
    const sKey_strategies = "strategies"

    this.instantUser({})
    AuthManager.instantToken({})

    StorageManager.removeData(sKey_user)
    StorageManager.removeData(sKey_wallets)
    StorageManager.removeData(sKey_positions)
    StorageManager.removeData(sKey_strategies)
  }

  // Prefs
  async storePrefs(prefs) {
    const sKey = "user_prefs"

    let sData = await this.storedPrefs()
    sData = { ...sData, ...prefs }

    await StorageManager.store(sKey, sData)
  }
  async storedPrefs() {
    const sKey = "user_prefs"
    return await StorageManager.getData(sKey)
  }

  static async storedToken() {
    const sKey = "user"
    let sUser = await StorageManager.getData(sKey)

    if (sUser)
      return sUser.token
    return null
  }

  // Instant Data
  instantUser(data) {
    if (data) {
      __user = data
      this.setUser(data)
    }
    else
      data = __user

    return data
  }
  static instantToken(data) {
    if (data)
      __token = data
    else
      data = __token

    return data
  }

  getApi(apiId) {
    if (apiId in this.apis)
      return deepCloneObj(this.apis[apiId]);
    return null
  }
}

export default AuthManager;
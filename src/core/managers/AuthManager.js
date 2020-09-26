import StorageManager from "./StorageManager";
import TimeManager from "./TimeManager";
import { deepCloneObj, httpRequest, sleep } from "../utils";

class AuthManager {
  constructor(getHttpTranslation, setAuthStatus, setPrefs) {
    this.getHttpTranslation = getHttpTranslation
    this.setAuthStatus = setAuthStatus
    this.setPrefs = setPrefs

    this.sModule = "auth"
    this.apis = {
      wsUserCustom: {
        options: { headers: { "Content-Type": "application/json" } },
        request: "/api/auth/usercustom/"
      },
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
    wsInfo.options.headers.Authorization = "token " + AuthManager.storedToken()
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
      this.storePrefs(result.user)
      StorageManager.store(sKey, result)
      this.setAuthStatus(true)
      return result
    }

    return result
  }
  async userLogout() {
    const sKey = "user"
    const sKey_wallets = "wallets"
    const sKey_positions = "positions"

    let wsInfo = this.getApi("wsUser")
    wsInfo.request += "logout/"
    wsInfo.method = "post"
    wsInfo.options.headers.Authorization = "token " + AuthManager.storedToken()

    StorageManager.removeData(sKey)
    StorageManager.removeData(sKey_wallets)
    StorageManager.removeData(sKey_positions)

    return await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers)
  }
  async userChangePassword(object) {
    let wsInfo = this.getApi("wsUser")
    wsInfo.request += "changepassword/"
    wsInfo.method = "post"
    wsInfo.options.headers.Authorization = "token " + AuthManager.storedToken()

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

  async userUpdate(user) {
    const sKey = "user"
    let userFields = ["email", "username", "first_name", "last_name"]
    let obj_user = {}
    let obj_userCustom = {}

    let wsInfo = null
    let result = {}

    // Determines which fields are for User model and UserCustom model (Django)
    for (let [k, v] of Object.entries(user))
      if (userFields.includes(k))
        obj_user[k] = v
      else {
        if (k == "birthday")
          obj_userCustom[k] = v ? TimeManager.getDateString(v) : null
        else
          obj_userCustom[k] = v
      }

    if (Object.keys(obj_userCustom).length > 0) {
      // Data for UserCustomSerializer
      wsInfo = this.getApi("wsUserCustom")
      wsInfo.request += "update/"
      wsInfo.method = "patch"
      wsInfo.options.headers.Authorization = "token " + AuthManager.storedToken()

      result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers, null, obj_userCustom)

      this.getHttpTranslation(result, "profileupdate", "user", true)
    }

    if (Object.keys(obj_user).length > 0) {
      // Data for UserSerializer
      wsInfo = this.getApi("wsUser")
      wsInfo.request += "update/"
      wsInfo.method = "patch"
      wsInfo.options.headers.Authorization = "token " + AuthManager.storedToken()

      result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers, null, obj_user)

      if (result.status == 200) {
        this.getHttpTranslation(result, "profileupdate", "user", true)
        result = result.data

        let sUser = this.storedUser()
        sUser.user = result
        this.storePrefs(sUser.user)
        return StorageManager.store(sKey, sUser)
      }
      else
        return result
    }
    else
      return await this.userRetrieve()
  }
  async userRetrieve() {
    const sKey = "user"
    let result = StorageManager.isUpToDate(this.sModule, sKey)
    let sToken = AuthManager.storedToken()

    if (result.data)
      return result.data

    if (sToken) {
      let wsInfo = this.getApi("wsUser")
      wsInfo.request += "retrieve/"
      wsInfo.method = "get"
      wsInfo.options.headers.Authorization = "token " + sToken
      result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers)

      if (result.status == 200) {
        result = result.data

        let sData = StorageManager.getData(sKey)
        sData.user = result
        this.storePrefs(sData.user)

        return StorageManager.store(sKey, sData)
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

  // Prefs
  storePrefs(user) {
    const sKey = "user_prefs"
    let prefs = {
      langId: user.pref_langId,
      currency: user.pref_currency
    }

    this.setPrefs(prefs)
    StorageManager.store(sKey, prefs)
  }
  storedPrefs() {
    const sKey = "user_prefs"
    return StorageManager.getData(sKey)
  }

  static storedToken() {
    const sKey = "user"
    let sUser = StorageManager.getData(sKey)

    if (sUser)
      return sUser.token
    return null
  }
  storedUser() {
    const sKey = "user"
    return StorageManager.getData(sKey)
  }
  getApi(apiId) {
    if (apiId in this.apis)
      return deepCloneObj(this.apis[apiId]);
    return null
  }
}

export default AuthManager;
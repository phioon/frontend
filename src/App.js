import React from "react";
import { Router, Route, Switch, Redirect } from "react-router-dom";
import { LoopCircleLoading } from 'react-loadingg';

import { createBrowserHistory } from "history";

import AuthLayout from "layouts/Auth.jsx";
import AppLayout from "layouts/App.jsx";

import "perfect-scrollbar/css/perfect-scrollbar.css";
import "bootstrap/dist/css/bootstrap.css";
import "assets/scss/paper-dashboard.scss?v=1.1.0";
import "assets/demo/demo.css";

// react plugin for creating notifications over the dashboard
import NotificationAlert from "react-notification-alert";

// CORE
import { localeList, getTranslation } from "./core/locales";
import { sleep } from "./core/utils";

import StorageManager from "./core/managers/StorageManager";
import AuthManager from "./core/managers/AuthManager";
import AppManager from "./core/managers/AppManager";
import MarketManager from "./core/managers/MarketManager";
import MeasureManager from "./core/managers/MeasureManager";
import StrategyManager from "./core/managers/StrategyManager";
import StripeManager from "./core/managers/StripeManager";
import GtagManager from "./core/managers/GtagManager";

export var isAuthenticated = undefined
const hist = createBrowserHistory();
var browserLanguage = window.navigator.userLanguage || window.navigator.language || window.navigator.languages[0];
browserLanguage = String(browserLanguage).replace(/[^a-zA-Z0-9]+/g, "")
browserLanguage = browserLanguage && browserLanguage.startsWith("pt") ? "ptBR" : "enUS"

class App extends React.Component {
  constructor() {
    super()

    this.state = {
      prefs: {
        locale: browserLanguage,
        currency: "BRL"
      },

      user: undefined
    }

    this.setPrefs = this.setPrefs.bind(this)
    this.setUser = this.setUser.bind(this)
    this.setAuthStatus = this.setAuthStatus.bind(this)
    this.setLocale = this.setLocale.bind(this)
    this.getHttpTranslation = this.getHttpTranslation.bind(this)
    this.managers = {
      gtag: new GtagManager(),
      app: new AppManager(this.getHttpTranslation),
      market: new MarketManager(this.getHttpTranslation),
      stripe: new StripeManager(this.getHttpTranslation)
    }
    this.managers.auth = new AuthManager(
      this.managers.gtag,
      this.getHttpTranslation,
      this.setAuthStatus,
      this.setPrefs,
      this.setUser
    )
    this.managers.strategy = new StrategyManager(this.managers.market)
    this.managers.measure = new MeasureManager(this.managers.app, this.managers.market)

    this.msgQueue = []
  }
  componentDidMount() {
    this.prepareRequirements()
  }
  async prepareRequirements() {
    let storage = new StorageManager()
    await storage.initiator()

    this.setAuthStatus(await this.managers.auth.isUserAuthenticated())

  }

  async notify(place, color, icon = "nc-icon nc-bell-55", msgId, msgText, autoDismiss = 7) {
    var color = color
    var options = {};

    options = {
      place: place,
      message: (
        <div>
          <span data-notify="icon" className={icon} />
          <span>
            {msgText}
          </span>
        </div>
      ),
      type: color,
      autoDismiss: autoDismiss
    };

    if (this.msgQueue.includes("general_unauthorizedCodes")) {
      // User is being notified of unauthorized access... Probably, their token is expired.
      return
    }
    if (this.msgQueue.includes(msgId)) {
      // Message is being showed... No need to show it again.
      return
    }

    this.refs.notificationAlert.notificationAlert(options);

    this.msgQueue.push(msgId)
    await sleep(autoDismiss * 1000)
    this.msgQueue.splice(this.msgQueue.indexOf(msgId), 1)
  }

  // Set user authentication status and Prefs
  async setAuthStatus(value) {
    let newState = {}

    if (this.state.isAuthenticated !== value) {
      let prefs = await this.managers.auth.storedPrefs()

      if (prefs)
        newState.prefs = prefs

      newState.isAuthenticated = value
      isAuthenticated = value                // Global variable that makes utils.httpRequest aware of user authentication status
    }

    this.setState(newState)
  }
  // Set Prefs
  setPrefs(obj_prefs) {
    // prefs must be an object with at least one key of user's preferences. {locale: <value>}
    let { prefs } = this.state

    if (obj_prefs) {
      for (var [k, v] of Object.entries(obj_prefs))
        if (prefs[k])
          prefs[k] = v

      this.setState({ prefs })
    }
  }
  // Set User
  setUser(user) {
    this.setState({ user })
  }

  setLocale(newLocale) {
    // Set new language. Only used by AuthNavBar (AppNavBar uses this.setPrefs())
    let prefs = this.state.prefs
    let locales = localeList()

    if (prefs.locale !== newLocale && locales.includes(newLocale)) {
      prefs.locale = newLocale

      this.managers.auth.storePrefs(prefs)
    }

    this.setState({ prefs })
  }

  async reloadApp(delay = 1) {
    await sleep(delay * 1000)
    window.location.reload()
  }
  async getHttpTranslation(rResult, context, model, notify = false) {
    let { prefs } = this.state;
    let successCodes = [200, 201, 202, 203, 204]
    let badRequestCodes = [400]
    let unauthorizedCodes = [401]
    let goneCodes = [410]
    let internalErrorCodes = [403, 404, 500, 503]
    let rData = null
    let msg = {
      id: undefined,
      icon: "nc-icon nc-bell-55",
      text: undefined,
      color: "danger",
      autoDismiss: 7
    }

    if (successCodes.includes(rResult.status)) {
      msg.color = "success"
      msg.icon = "nc-icon nc-check-2"
      msg.autoDismiss = 3

      if (model == "user") {
        if (context == "profileupdate")
          msg.id = model + "_profileUpdated"
      }
    }
    else if (rResult.response) {
      rData = JSON.stringify(rResult.response.data)
      // Bad Requests
      if (badRequestCodes.includes(rResult.response.status)) {
        switch (model) {
          case "user":
            switch (context) {
              case "register":
                if (rData.includes("email already exists"))
                  msg.id = model + "_emailAlreadyExists"
                else if (rData.includes("username already exists"))
                  msg.id = model + "_usernameAlreadyExists"
                break;
              case "login":
                if (rData.includes("Unable to log in with provided credentials"))
                  msg.id = model + "_invalidCredentials"
                else if (rData.includes("email not confirmed"))
                  msg.id = model + "_emailNotConfirmed"
                else if (rData.includes("Maximum amount of tokens"))
                  msg.id = model + "_amountOfSessions"
                else if (rData.includes("entirely numeric"))
                  msg.id = model + "_password_entirelyNumeric"
                else if (rData.includes("password is too similar"))
                  msg.id = model + "_password_tooSimilar"
                break;
              case "setpassword":
                if (rData.includes("password is entirely numeric"))
                  msg.id = model + "_password_entirelyNumeric"
                else if (rData.includes("password is too similar"))
                  msg.id = model + "_password_tooSimilar"
                break;
              case "modalchangepassword":
                if (rData.includes("Invalid password"))
                  msg.id = model + "_password_invalid"
                else if (rData.includes("password is entirely numeric"))
                  msg.id = model + "_password_entirelyNumeric"
                else if (rData.includes("password is too similar"))
                  msg.id = model + "_password_tooSimilar"
                break;
              default:
                break;
            }
            break;
          case "wallet":
            if (rData.includes("limit reached"))
              msg.id = model + "_limitReached"
            break
          default:
            break;
        }
      }

      // Unauthorized
      else if (unauthorizedCodes.includes(rResult.response.status)) {
        msg.color = "success"
        msg.id = "general_unauthorizedCodes"

        let isUserAuthenticated = await this.managers.auth.isUserAuthenticated()

        if (!isUserAuthenticated) {
          // Just to make sure user is using the latest version available...
          this.reloadApp()
        }

        this.setAuthStatus(isUserAuthenticated)
      }

      // Gone
      else if (goneCodes.includes(rResult.response.status)) {
        switch (model) {
          case "user":
            if (rData.includes("Token is expired")) {
              if (context == "confirmemail")
                msg.id = model + "_tokenExpired_confirmEmail"
              else
                msg.id = model + "_tokenExpired"
            }
            break;
          default:
            break;
        }
      }

      // Internal Errors
      else if (internalErrorCodes.includes(rResult.response.status)) {
        switch (context) {
          case "register":
            if (rData.includes("email could not be sent"))
              msg.id = model + "_emailCouldNotBeSent"
            break;
          default:
            if (rData.includes("Max retries exceeded"))
              msg.id = "backend_serviceUnavailable"
            else
              msg.id = "general_internalErrorCodes"
            break;
        }
      }
    }
    else if (rResult.request) {
      // The request was made but no response was received
      msg.id = "general_couldNotSendRequest"
    }
    else {
      // Something happened in setting up the request that triggered an Error
      msg.id = "general_couldNotSendRequest"
    }

    if (msg.id)
      msg.text = getTranslation(prefs.locale, "httptranslation", msg.id)
    else
      msg.text = rData


    if (notify && msg.id)
      this.notify("br", msg.color, msg.icon, msg.id, msg.text, msg.autoDismiss)

    return msg
  }

  render() {
    let { prefs, user, isAuthenticated } = this.state

    return (
      <>
        <NotificationAlert ref="notificationAlert" />
        <Router history={hist}>
          <Switch>
            <Route
              path="/auth"
              render={props =>
                typeof isAuthenticated === 'undefined' ?
                  <LoopCircleLoading color='#07242b' /> :
                  isAuthenticated ?
                    <Redirect to="/app/wallet/openpositions" /> :
                    <AuthLayout {...props}
                      managers={this.managers}
                      prefs={prefs}
                      getString={getTranslation}
                      getHttpTranslation={this.getHttpTranslation}
                      setLocale={this.setLocale}
                      setAuthStatus={this.setAuthStatus}
                    />
              }
            />
            <Route
              path="/app"
              render={props =>
                typeof isAuthenticated === 'undefined' ?
                  <LoopCircleLoading color='#07242b' /> :
                  !isAuthenticated ?
                    <Redirect to="/auth/login" /> :
                    <AppLayout {...props}
                      managers={this.managers}
                      prefs={prefs}
                      user={user}
                      getString={getTranslation}
                      getHttpTranslation={this.getHttpTranslation}
                      isAuthenticated={isAuthenticated}
                      setPrefs={this.setPrefs}
                      setLocale={this.setLocale}
                      setAuthStatus={this.setAuthStatus}
                    />
              }
            />
            <Redirect to="/auth/login" />
          </Switch>
        </Router>
      </>
    )
  }
}

export default App;
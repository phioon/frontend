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
import { getLangList, getString } from "./core/lang";
import { sleep } from "./core/utils";

import StorageManager from "./core/managers/StorageManager";
import AuthManager from "./core/managers/AuthManager";
import AppManager from "./core/managers/AppManager";
import MarketManager from "./core/managers/MarketManager";
import MeasureManager from "./core/managers/MeasureManager";

const hist = createBrowserHistory();


class App extends React.Component {
  constructor() {
    super()

    this.state = {
      prefs: {
        langId: "ptBR",
        currency: "BRL"
      },

      isAuthenticated: undefined
    }

    this.setPrefs = this.setPrefs.bind(this)
    this.setAuthStatus = this.setAuthStatus.bind(this)
    this.setLangId = this.setLangId.bind(this)
    this.getHttpTranslation = this.getHttpTranslation.bind(this)
    this.managers = {
      auth: new AuthManager(this.getHttpTranslation, this.setAuthStatus, this.setPrefs),
      app: new AppManager(this.getHttpTranslation),
      market: new MarketManager(this.getHttpTranslation)
    }
    this.managers.measure = new MeasureManager(
      this.managers.app,
      this.managers.market,
    )
    this.msgQueue = []
  }
  componentDidMount() {
    new StorageManager()
    this.prepareRequirements()
  }

  async notify(place, color, icon = "nc-icon nc-bell-55", msg, autoDismiss = 7) {
    var color = color
    var options = {};

    options = {
      place: place,
      message: (
        <div>
          <span data-notify="icon" className={icon} />
          <span>
            {msg}
          </span>
        </div>
      ),
      type: color,
      autoDismiss: autoDismiss
    };

    if (this.msgQueue.includes(msg)) {
      return    // Message is being showed... No need to show again.
    }

    this.refs.notificationAlert.notificationAlert(options);

    this.msgQueue.push(msg)
    await sleep(autoDismiss * 1000)
    this.msgQueue.splice(this.msgQueue.indexOf(msg), 1)
  }

  async prepareRequirements() {
    this.setAuthStatus(await this.managers.auth.isUserAuthenticated())
  }

  // Set user authentication status and Prefs
  setAuthStatus(value) {
    if (this.state.isAuthenticated !== value) {
      let prefs = this.managers.auth.storedPrefs()

      if (prefs)
        this.setState({ prefs, isAuthenticated: value })
      else
        this.setState({ isAuthenticated: value })
    }
  }
  // Set Prefs
  setPrefs(obj_prefs) {
    // prefs must be an object with at least one key of user's preferences. {langId: <value>}
    let { prefs } = this.state

    if (obj_prefs) {
      for (var [k, v] of Object.entries(obj_prefs))
        if (prefs[k])
          prefs[k] = v

      this.setState({ prefs })
    }
  }

  // Set new language. Only used by AuthNavBar (AppNavBar uses this.setPrefs())
  setLangId(newLangId) {
    let prefs = this.state.prefs
    let langList = getLangList()

    if (prefs.langId !== newLangId && langList.includes(newLangId))
      prefs.langId = newLangId

    this.setState({ prefs })
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
      // Bad Request
      if (badRequestCodes.includes(rResult.response.status)) {
        switch (model) {
          case "user":
            switch (context) {
              case "register":
                if (rData.includes("username already exists"))
                  msg.id = model + "_alreadyExists"
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

      // Unauthorized
      else if (unauthorizedCodes.includes(rResult.response.status)) {
        msg.color = "success"
        msg.id = "general_unauthorizedCodes"
        this.setAuthStatus(await this.managers.auth.isUserAuthenticated())
      }

      // Internal errors
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
      // Send user to error page 5XX
      msg.id = "general_noResponseReceived"
    }
    else {
      // Something happened in setting up the request that triggered an Error
      // Send user a notification/modal and ask to check their internet connection
      msg.id = "general_couldNotSendRequest"
    }

    if (msg.id)
      msg.text = getString(prefs.langId, "httptranslation", msg.id)
    else
      msg.text = rData


    if (notify && msg.id)
      this.notify("br", msg.color, msg.icon, msg.text, msg.autoDismiss)

    return msg
  }

  render() {
    let { prefs, isAuthenticated } = this.state
    return (
      <>
        <NotificationAlert ref="notificationAlert" />
        <Router history={hist}>
          <Switch>
            <Route
              path="/auth"
              render={props =>
                typeof isAuthenticated === 'undefined' ?
                  <LoopCircleLoading color='#4f4f4f' /> :
                  isAuthenticated ?
                    <Redirect to="/app/wallet/overview" /> :
                    <AuthLayout {...props}
                      managers={this.managers}
                      getString={getString}
                      prefs={prefs}
                      getHttpTranslation={this.getHttpTranslation}
                      setLangId={this.setLangId}
                      setAuthStatus={this.setAuthStatus}
                    />
              }
            />
            <Route
              path="/app"
              render={props =>
                typeof isAuthenticated === 'undefined' ?
                  <LoopCircleLoading color='#4f4f4f' /> :
                  !isAuthenticated ?
                    <Redirect to="/auth/login" /> :
                    <AppLayout {...props}
                      managers={this.managers}
                      getString={getString}
                      prefs={prefs}
                      getHttpTranslation={this.getHttpTranslation}
                      isAuthenticated={isAuthenticated}
                      setPrefs={this.setPrefs}
                      setLangId={this.setLangId}
                      setCurrencyCode={this.setCurrencyCode}
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
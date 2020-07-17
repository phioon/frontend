/*!

=========================================================
* Paper Dashboard PRO React - v1.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/paper-dashboard-pro-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)

* Coded by Creative Tim

=========================================================
*/
// Auth
import ConfirmEmail from "views/auth/ConfirmEmail.jsx";
import ForgotPassword from "views/auth/ForgotPassword.jsx";
import LockScreen from "views/auth/LockScreen.jsx";
import Login from "views/auth/Login.jsx";
import SetPassword from "views/auth/SetPassword.jsx";
import Register from "views/auth/Register.jsx";
import UserProfile from "views/auth/UserProfile.jsx";

// App
import OpenPositions from "views/wallet/OpenPositions";
import Positions from "views/myassets/Positions";
import Suggestions from "views/technicalanalysis/Suggestions";
import WalletOverview from "views/wallet/WalletOverview";
import Wallets from "views/myassets/Wallets";

const routes = [
  {
    collapse: true,
    name: "auth",
    icon: "nc-icon nc-badge",
    state: "authCollapse",
    views: [
      // ConfirmEmail and SetPassword: there are 2 entries in order to match all the possibilities
      // If user tries to access /auth/setpassword without a tuple (uidb64, token), they're gonna be redirected to Login page 
      {
        path: "/confirmemail/:uidb64/:token/",
        name: "confirmemail",
        mini: "CE",
        component: ConfirmEmail,
        layout: "/auth"
      },
      {
        path: "/confirmemail",
        name: "confirmemail",
        mini: "CE",
        component: ConfirmEmail,
        layout: "/auth"
      },
      {
        path: "/setpassword/:uidb64/:token/",
        name: "setpassword",
        mini: "SP",
        component: SetPassword,
        layout: "/auth"
      },
      {
        path: "/setpassword",
        name: "setpassword",
        mini: "SP",
        component: SetPassword,
        layout: "/auth"
      },
      // --------------------
      {
        path: "/forgotpassword",
        name: "forgotpassword",
        mini: "FP",
        component: ForgotPassword,
        layout: "/auth"
      },
      {
        path: "/login",
        name: "login",
        mini: "L",
        component: Login,
        layout: "/auth"
      },
      {
        path: "/register",
        name: "register",
        mini: "R",
        component: Register,
        layout: "/auth"
      }
    ]
  },
  {
    collapse: true,
    name: "auth",
    icon: "nc-icon nc-badge",
    state: "authCollapse",
    views: [
      {
        path: "/lockscreen",
        name: "lockscreen",
        mini: "LS",
        component: LockScreen,
        layout: "/app"
      },
      {
        path: "/userprofile",
        name: "userprofile",
        mini: "UP",
        component: UserProfile,
        layout: "/app"
      }
    ]
  },
  {
    sidebar: true,
    collapse: true,
    name: "myassets",
    icon: "nc-icon nc-money-coins",
    state: "myassetsCollapse",
    views: [
      {
        sidebar: true,
        path: "/myassets/wallets",
        name: "wallets",
        component: Wallets,
        layout: "/app"
      },
      {
        sidebar: true,
        path: "/myassets/positions",
        name: "positions",
        component: Positions,
        layout: "/app"
      },
    ]
  },
  {
    sidebar: true,
    collapse: true,
    name: "wallet",
    icon: "nc-icon nc-bank",
    state: "walletCollapse",
    views: [
      {
        sidebar: true,
        path: "/wallet/overview",
        name: "walletoverview",
        component: WalletOverview,
        layout: "/app"
      },
      {
        sidebar: true,
        path: "/wallet/openpositions",
        name: "openpositions",
        component: OpenPositions,
        layout: "/app"
      },
    ]
  },
  {
    sidebar: true,
    collapse: true,
    name: "technicalAnalysis",
    icon: "nc-icon nc-bulb-63",
    state: "tcCollapse",
    views: [
      {
        sidebar: true,
        path: "/analysis/suggestions",
        name: "suggestions",
        component: Suggestions,
        layout: "/app"
      },
    ]
  },
]

export default routes;
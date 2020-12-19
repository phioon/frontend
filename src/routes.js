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
import MyAccount from "views/auth/MyAccount.jsx";
import UserSubscription from "views/subscriptions/UserSubscription.jsx";

// App
import OpenPositions from "views/wallet/OpenPositions";
import Positions from "views/myassets/Positions";
import PhiTrader from "views/technicalanalysis/PhiTrader";
import WalletOverview from "views/wallet/WalletOverview";
import Wallets from "views/myassets/Wallets";
import StrategyPanel from "views/technicalanalysis/strategy/StrategyPanel";
import StrategyGallery from "views/technicalanalysis/strategy/StrategyGallery";

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
        path: "/user/myaccount",
        name: "myaccount",
        mini: "MA",
        component: MyAccount,
        layout: "/app"
      },
      {
        path: "/user/subscription",
        name: "usersubscription",
        mini: "UP",
        component: UserSubscription,
        layout: "/app"
      },
      {
        path: "/order/success",
        name: "ordersuccess",
        mini: "OS",
        component: UserSubscription,
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
    name: "strategies",
    icon: "nc-icon nc-bulb-63",
    state: "tcCollapse",
    views: [
      {
        sidebar: true,
        path: "/strategies/panel",
        name: "strategypanel",
        component: StrategyPanel,
        layout: "/app"
      },
      {
        sidebar: true,
        path: "/strategies/gallery",
        name: "strategygallery",
        component: StrategyGallery,
        layout: "/app"
      }
    ]
  },
  {
    sidebar: true,
    path: "/phitrader",
    name: "phitrader",
    icon: "nc-icon nc-atom",
    component: PhiTrader,
    layout: "/app"
  },
]

export default routes;
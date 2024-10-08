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
import MyAccount from "views/auth/MyAccount.jsx";
import UserSubscription from "views/subscriptions/UserSubscription.jsx";

// App
import Home from "views/Home/Home";
import OpenPositions from "views/wallet/OpenPositions";
import Positions from "views/myassets/Positions";
import PhiTrader from "views/phitrader/PhiTrader";
import StrategyPage from "./views/strategies/StrategyPage";
import Strategies from "views/myassets/Strategies";
import WalletOverview from "views/wallet/WalletOverview";
import Wallets from "views/myassets/Wallets";

// Search
import Search from "views/search/Search";
import SearchStrategyResults from "views/search/SearchStrategyResults";
import SearchUserResults from "views/search/SearchUserResults";

// Generics
import PageNotFound from "views/generics/PageNotFound";

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
        path: "/confirmemail/",
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
        path: "/setpassword/",
        name: "setpassword",
        mini: "SP",
        component: SetPassword,
        layout: "/auth"
      },
      // --------------------
      {
        path: "/forgotpassword/",
        name: "forgotpassword",
        mini: "FP",
        component: ForgotPassword,
        layout: "/auth"
      },
      {
        path: "/login/",
        name: "login",
        mini: "L",
        component: Login,
        layout: "/auth"
      },
      {
        path: "/register/",
        name: "register",
        mini: "R",
        component: Register,
        layout: "/auth"
      }
    ]
  },
  {
    collapse: true,
    name: "user",
    icon: "nc-icon nc-badge",
    state: "authCollapse",
    views: [
      {
        path: "/lockscreen/",
        name: "lockscreen",
        mini: "LS",
        component: LockScreen,
        layout: "/app"
      },
      {
        path: "/u/myaccount/",
        name: "myaccount",
        mini: "MA",
        component: MyAccount,
        layout: "/app"
      },
      {
        path: "/myplan/",
        name: "usersubscription",
        mini: "US",
        component: UserSubscription,
        layout: "/app"
      },
      {
        path: "/order/success/",
        name: "ordersuccess",
        mini: "OS",
        component: UserSubscription,
        layout: "/app"
      },
      {
        path: "/u/:username/",
        name: "profile",
        mini: "P",
        component: UserProfile,
        layout: "/app"
      },
      {
        path: "/u/",
        name: "profile",
        mini: "P",
        component: UserProfile,
        layout: "/app"
      },
    ]
  },
  {
    collapse: true,
    name: "search",
    icon: "nc-icon nc-zoom-split",
    state: "searchCollapse",
    views: [
      {
        path: "/search/strategies/",
        name: "searchstrategy",
        mini: "SS",
        component: SearchStrategyResults,
        layout: "/app"
      },
      {
        path: "/search/users/",
        name: "searchuser",
        mini: "SU",
        component: SearchUserResults,
        layout: "/app"
      },
      {
        path: "/search/",
        name: "search",
        mini: "S",
        component: Search,
        layout: "/app"
      }
    ]
  },
  {
    sidebar: true,
    path: "/home/",
    name: "home",
    icon: "nc-icon nc-compass-05",
    component: Home,
    layout: "/app"
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
        path: "/myassets/wallets/",
        name: "wallets",
        component: Wallets,
        layout: "/app"
      },
      {
        sidebar: true,
        path: "/myassets/positions/",
        name: "positions",
        component: Positions,
        layout: "/app"
      },
      {
        sidebar: true,
        path: "/myassets/strategies/",
        name: "strategies",
        component: Strategies,
        layout: "/app"
      },
      {
        path: "/myassets/",
        name: "wallets",
        component: Wallets,
        layout: "/app"
      },
    ]
  },
  {
    sidebar: true,
    collapse: true,
    name: "dashboards",
    icon: "nc-icon nc-layout-11",
    state: "dashboardsCollapse",
    views: [
      {
        sidebar: true,
        path: "/dashboard/overview/",
        name: "walletoverview",
        component: WalletOverview,
        layout: "/app"
      },
      {
        sidebar: true,
        path: "/dashboard/openpositions/",
        name: "openpositions",
        component: OpenPositions,
        layout: "/app"
      },
    ]
  },
  {
    collapse: true,
    name: "strategies",
    icon: "nc-icon nc-bulb-63",
    state: "tcCollapse",
    views: [
      {
        path: "/strategies/:uuid/",
        name: "strategypage",
        component: StrategyPage,
        layout: "/app"
      },
      {
        path: "/strategies/",
        name: "home",
        component: StrategyPage,
        layout: "/app"
      },
    ]
  },
  {
    sidebar: true,
    path: "/phitrader/",
    name: "phitrader",
    icon: "nc-icon nc-atom",
    component: PhiTrader,
    layout: "/app"
  },
  {
    path: "/",
    name: "home",
    component: Home,
    layout: "/app"
  },
  {
    collapse: true,
    name: "generics",
    icon: "nc-icon nc-badge",
    state: "genericCollapse",
    views: [
      {
        path: "/notfound/",
        name: "pagenotfound",
        icon: "nc-icon nc-atom",
        component: PageNotFound,
        layout: "/app"
      },
    ]
  }
]

export default routes;
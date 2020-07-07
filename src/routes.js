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
import Buttons from "views/components/Buttons.jsx";
import Calendar from "views/Calendar.jsx";
import Charts from "views/Charts.jsx";
import Dashboard from "views/Dashboard.jsx";
import ExtendedForms from "views/forms/ExtendedForms.jsx";
import ExtendedTables from "views/tables/ExtendedTables.jsx";
import FullScreenMap from "views/maps/FullScreenMap.jsx";
import GoogleMaps from "views/maps/GoogleMaps.jsx";
import GridSystem from "views/components/GridSystem.jsx";
import Icons from "views/components/Icons.jsx";
import Notifications from "views/components/Notifications.jsx";
import Panels from "views/components/Panels.jsx";
import ReactTables from "views/tables/ReactTables.jsx";
import RegularForms from "views/forms/RegularForms.jsx";
import RegularTables from "views/tables/RegularTables.jsx";
import SweetAlert from "views/components/SweetAlert.jsx";
import Timeline from "views/technicalanalysis/Timeline.jsx";
import Typography from "views/components/Typography.jsx";
import ValidationForms from "views/forms/ValidationForms.jsx";
import VectorMap from "views/maps/VectorMap.jsx";
import Widgets from "views/Widgets.jsx";
import Wizard from "views/forms/Wizard.jsx";
import SwingTrade from "views/technicalanalysis/SwingTrade";
import OpenPositions from "views/wallet/OpenPositions";
import Positions from "views/myassets/Positions";
import WalletOverview from "views/wallet/WalletOverview";
import Wallets from "views/myassets/Wallets";

const routes = [
  {
    collapse: true,
    name: "auth",
    icon: "nc-icon nc-badge",
    state: "authCollapse",
    views: [
      // Set ConfirmEmail and SetPassword
      // We have 2 entries in order to match all the possibilities
      // If user tries to access /auth/setpassword without a tuple (uidb64, token), he's gonna be redirected to Login page 
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
    path: "/dashboard",
    name: "dashboard",
    icon: "nc-icon nc-layout-11",
    component: Dashboard,
    layout: "/app"
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
        path: "/analysis/swingtrade",
        name: "swingtrade",
        component: SwingTrade,
        layout: "/app"
      },
    ]
  },
]


const routesOri = [
  {
    path: "/default",
    name: "Dashboard",
    icon: "nc-icon nc-bank",
    component: Dashboard,
    layout: "/dashboard"
  },
  {
    collapse: true,
    name: "Pages",
    icon: "nc-icon nc-book-bookmark",
    state: "pagesCollapse",
    views: [
      {
        path: "/timeline",
        name: "Timeline",
        mini: "T",
        component: Timeline,
        layout: "/admin"
      },
      {
        path: "/login",
        name: "Login",
        mini: "L",
        component: Login,
        layout: "/auth"
      },
      {
        path: "/register",
        name: "Register",
        mini: "R",
        component: Register,
        layout: "/auth"
      },
      {
        path: "/lock-screen",
        name: "LockScreen",
        mini: "LS",
        component: LockScreen,
        layout: "/auth"
      },
      {
        path: "/user-profile",
        name: "UserProfile",
        mini: "UP",
        component: UserProfile,
        layout: "/admin"
      }
    ]
  },
  {
    collapse: true,
    name: "Components",
    icon: "nc-icon nc-layout-11",
    state: "componentsCollapse",
    views: [
      {
        path: "/buttons",
        name: "Buttons",
        mini: "B",
        component: Buttons,
        layout: "/admin"
      },
      {
        path: "/grid-system",
        name: "Grid System",
        mini: "GS",
        component: GridSystem,
        layout: "/admin"
      },
      {
        path: "/panels",
        name: "Panels",
        mini: "P",
        component: Panels,
        layout: "/admin"
      },
      {
        path: "/sweet-alert",
        name: "Sweet Alert",
        mini: "SA",
        component: SweetAlert,
        layout: "/admin"
      },
      {
        path: "/notifications",
        name: "Notifications",
        mini: "N",
        component: Notifications,
        layout: "/admin"
      },
      {
        path: "/icons",
        name: "Icons",
        mini: "I",
        component: Icons,
        layout: "/admin"
      },
      {
        path: "/typography",
        name: "Typography",
        mini: "T",
        component: Typography,
        layout: "/admin"
      }
    ]
  },
  {
    collapse: true,
    name: "Forms",
    icon: "nc-icon nc-ruler-pencil",
    state: "formsCollapse",
    views: [
      {
        path: "/regular-forms",
        name: "Regular Forms",
        mini: "RF",
        component: RegularForms,
        layout: "/admin"
      },
      {
        path: "/extended-forms",
        name: "Extended Forms",
        mini: "EF",
        component: ExtendedForms,
        layout: "/admin"
      },
      {
        path: "/validation-forms",
        name: "Validation Forms",
        mini: "VF",
        component: ValidationForms,
        layout: "/admin"
      },
      {
        path: "/wizard",
        name: "Wizard",
        mini: "W",
        component: Wizard,
        layout: "/admin"
      }
    ]
  },
  {
    collapse: true,
    name: "Tables",
    icon: "nc-icon nc-single-copy-04",
    state: "tablesCollapse",
    views: [
      {
        path: "/regular-tables",
        name: "Regular Tables",
        mini: "RT",
        component: RegularTables,
        layout: "/admin"
      },
      {
        path: "/extended-tables",
        name: "Extended Tables",
        mini: "ET",
        component: ExtendedTables,
        layout: "/admin"
      },
      {
        path: "/react-tables",
        name: "React Tables",
        mini: "RT",
        component: ReactTables,
        layout: "/admin"
      }
    ]
  },
  {
    collapse: true,
    name: "Maps",
    icon: "nc-icon nc-pin-3",
    state: "mapsCollapse",
    views: [
      {
        path: "/google-maps",
        name: "Google Maps",
        mini: "GM",
        component: GoogleMaps,
        layout: "/admin"
      },
      {
        path: "/full-screen-map",
        name: "Full Screen Map",
        mini: "FSM",
        component: FullScreenMap,
        layout: "/admin"
      },
      {
        path: "/vector-map",
        name: "Vector Map",
        mini: "VM",
        component: VectorMap,
        layout: "/admin"
      }
    ]
  },
  {
    path: "/widgets",
    name: "Widgets",
    icon: "nc-icon nc-box",
    component: Widgets,
    layout: "/admin"
  },
  {
    path: "/charts",
    name: "Charts",
    icon: "nc-icon nc-chart-bar-32",
    component: Charts,
    layout: "/admin"
  },
  {
    path: "/calendar",
    name: "Calendar",
    icon: "nc-icon nc-calendar-60",
    component: Calendar,
    layout: "/admin"
  }
];

export default routes;
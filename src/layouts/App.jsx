import React from "react";
// javascript plugin used to create scrollbars on windows
import PerfectScrollbar from "perfect-scrollbar";
import { Route, Switch } from "react-router-dom";
import PropTypes from "prop-types";

import AppNavBar from "components/Navbars/AppNavbar.jsx";
import Footer from "components/Footer/Footer.jsx";
import Sidebar from "components/Sidebar/Sidebar.jsx";
import { getDistinctValuesFromList, getObjsFieldNull } from "../core/utils";

import routes from "routes.js";

export var ps;

class AppLayout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      langId: props.langId,
      navbarTitleId: "title_default",

      backgroundColor: "primary-dark",
      activeColor: "success",
      sidebarMini: false,
    };

    this.mainPanelRef = React.createRef()
    this.setNavbarTitleId = this.setNavbarTitleId.bind(this)
  }
  static getDerivedStateFromProps(props, state) {
    if (props.prefs.langId !== state.langId)
      return { langId: props.prefs.langId }
    return null
  }
  componentDidMount() {
    this.mountPerfectScrollbar()

    this.storageManagerInitiator()
  }
  componentWillUnmount() {
    this.destroyPerfectScrollbar()
  }
  componentDidUpdate(e) {
    if (e.history.action === "PUSH") {
      document.documentElement.scrollTop = 0;
      document.scrollingElement.scrollTop = 0;
      this.mainPanelRef.current.scrollTop = 0;

      let isStrategies = this.props.location.pathname.indexOf("/strategies") > -1

      if (isStrategies)
        this.destroyPerfectScrollbar()
      else
        this.mountPerfectScrollbar()
    }
  }

  // Perfect Scrollbar
  mountPerfectScrollbar() {
    let isWindows = navigator.platform.indexOf("Win") > -1
    let isMounted = document.documentElement.classList.contains("perfect-scrollbar-on")
    let isStrategies = this.props.location.pathname.indexOf("/strategies") > -1

    if (isStrategies)
      return
    else if (isWindows && !isMounted) {
      document.documentElement.className += " perfect-scrollbar-on";
      document.documentElement.classList.remove("perfect-scrollbar-off");
      ps = new PerfectScrollbar(this.mainPanelRef.current);
    }
  }
  destroyPerfectScrollbar() {
    let isWindows = navigator.platform.indexOf("Win") > -1
    let isMounted = document.documentElement.classList.contains("perfect-scrollbar-on")

    if (isWindows && isMounted) {
      ps.destroy();
      document.documentElement.className += " perfect-scrollbar-off";
      document.documentElement.classList.remove("perfect-scrollbar-on");
    }
  }

  async storageManagerInitiator() {
    let syncFull = true
    let detailed = true
    // App
    this.props.managers.app.countryList()                                 // async call
    this.props.managers.app.currencyList()                                // async call
    this.props.managers.app.subscriptionList()                            // async call
    this.props.managers.app.positionTypeList()                            // async call
    this.props.managers.app.strategyList()

    let wallets = await this.props.managers.app.walletList()
    let positions = await this.props.managers.app.positionList()

    // Market
    let stockExchanges = getDistinctValuesFromList(wallets.data, "se_short")
    let assetsOpenPositions = getObjsFieldNull(positions.data, "ended_on")
    assetsOpenPositions = getDistinctValuesFromList(assetsOpenPositions, "asset_symbol")

    this.props.managers.market.indicatorList()                            // async call
    this.props.managers.market.stockExchangeList()                        // async call
    this.props.managers.market.assetList(detailed, assetsOpenPositions)   // async call

    // Premium
    let sUser = await this.props.managers.auth.storedUser()
    if (sUser.user.subscription != "basic") {
      this.props.managers.market.technicalConditionList()                 // async call

      for (var se_short of stockExchanges) {
        this.props.managers.market.dSetupSummaryList(se_short)            // async call
        this.props.managers.market.dSetupList(se_short)                   // async call
      }
    }
  }

  setNavbarTitleId(titleId) {
    this.setState({ navbarTitleId: titleId })
  }

  getRoutes = routes => {
    return routes.map((prop, key) => {
      if (prop.collapse) {
        return this.getRoutes(prop.views);
      }
      if (prop.layout === "/app") {
        return (
          <Route
            path={prop.layout + prop.path}
            render={(props) => <prop.component
              {...props}
              {...this.props}
              setNavbarTitleId={this.setNavbarTitleId} />}
            key={key}
          />
        );
      } else {
        return null;
      }
    });
  };
  handleActiveClick = color => {
    this.setState({ activeColor: color });
  };
  handleBgClick = color => {
    this.setState({ backgroundColor: color });
  };
  handleMiniClick = () => {
    if (document.body.classList.contains("sidebar-mini")) {
      this.setState({ sidebarMini: false });
    } else {
      this.setState({ sidebarMini: true });
    }
    document.body.classList.toggle("sidebar-mini");
  };
  render() {
    let { managers } = this.props;
    let { navbarTitleId } = this.state

    return (
      <div className="wrapper">
        <Sidebar
          {...this.props}
          routes={routes}
          bgColor={this.state.backgroundColor}
          activeColor={this.state.activeColor}
          managers={managers}
        />
        <div className="main-panel" ref={this.mainPanelRef}>
          <AppNavBar
            {...this.props}
            handleMiniClick={this.handleMiniClick}
            navbarTitleId={navbarTitleId}
          />
          <Switch>{this.getRoutes(routes)}</Switch>
          {// we don't want the Footer to be rendered on full screen maps page
            this.props.location.pathname.indexOf("full-screen-map") !== -1 ?
              null :
              <Footer fluid {...this.props} />
          }
        </div>
      </div>
    );
  }
}

export default AppLayout;

AppLayout.propTypes = {
  managers: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  setAuthStatus: PropTypes.func.isRequired,
}
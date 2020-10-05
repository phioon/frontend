import React from "react";
// javascript plugin used to create scrollbars on windows
import PerfectScrollbar from "perfect-scrollbar";
import { Route, Switch } from "react-router-dom";
import PropTypes from "prop-types";

import AuthNavbar from "components/Navbars/AuthNavbar.jsx";
import Footer from "components/Footer/Footer.jsx";

import routes from "routes.js";

var ps;

class AuthLayout extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      langId: props.prefs.langId
    }

    this.authPagesRef = React.createRef();
  }
  static getDerivedStateFromProps(props, state) {
    if (props.prefs.langId !== state.langId)
      return { langId: props.prefs.langId }
    return null
  }
  componentDidMount() {
    this.setPerfectScrollbar()
  }
  componentWillUnmount() {
    this.destroyPerfectScrollbar()
  }
  // Perfect Scrollbar
  setPerfectScrollbar() {
    if (navigator.platform.indexOf("Win") > -1) {
      document.documentElement.className += " perfect-scrollbar-on";
      document.documentElement.classList.remove("perfect-scrollbar-off");
      ps = new PerfectScrollbar(this.authPagesRef.current);
    }
  }
  destroyPerfectScrollbar() {
    if (navigator.platform.indexOf("Win") > -1) {
      ps.destroy();
      document.documentElement.className += " perfect-scrollbar-off";
      document.documentElement.classList.remove("perfect-scrollbar-on");
    }
  }

  getRoutes = routes => {
    return routes.map((prop, key) => {
      if (prop.collapse) {
        return this.getRoutes(prop.views);
      }
      if (prop.layout === "/auth") {
        return (
          <Route
            path={prop.layout + prop.path}
            render={(props) => <prop.component {...props}
              managers={this.props.managers}
              prefs={this.props.prefs}
              getHttpTranslation={this.props.getHttpTranslation}
              setLangId={this.props.setLangId}
              getString={this.props.getString}
              setAuthStatus={this.props.setAuthStatus} />}
            key={key}
          />
        );
      } else {
        return null;
      }
    });
  };
  render() {
    return (
      <>
        <AuthNavbar {...this.props} />
        <div className="wrapper wrapper-full-page" ref={this.authPagesRef}>
          <div className="full-page section-image">
            <Switch>
              {this.getRoutes(routes)}
            </Switch>
            <Footer fluid {...this.props} />
          </div>
        </div>
      </>
    );
  }
}

export default AuthLayout;

AuthLayout.propTypes = {
  managers: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  setAuthStatus: PropTypes.func.isRequired,
}
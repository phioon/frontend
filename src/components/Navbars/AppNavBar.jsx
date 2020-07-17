import React from "react";
import classnames from "classnames";
import {
  Button,
  Collapse,
  Container,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  NavbarBrand,
  Navbar,
  Nav,
  UncontrolledDropdown,
} from "reactstrap";

import PropTypes from "prop-types";
import { getLangList } from "../../core/lang";

class AppNavBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      langId: this.props.langId,
      compId: this.constructor.name.toLowerCase(),
      navbarTitleId: this.props.navbarTitleId,
      collapseOpen: false,
      color: "navbar-transparent",

      langList: [],
    };
  }
  static getDerivedStateFromProps(props, state) {
    if (props.prefs.langId !== state.langId)
      return { langId: props.prefs.langId }

    if (props.navbarTitleId !== state.navbarTitleId)
      return { navbarTitleId: props.navbarTitleId }

    return null
  }
  componentDidMount() {
    window.addEventListener("resize", this.updateColor);

    let langList = getLangList()
    this.setState({ langList })
  }
  componentDidUpdate(e) {
    if (
      window.outerWidth < 993 &&
      e.history.location.pathname !== e.location.pathname &&
      document.documentElement.className.indexOf("nav-open") !== -1
    ) {
      document.documentElement.classList.toggle("nav-open");
    }
  }
  // function that adds color white/transparent to the navbar on resize (this is for the collapse)
  updateColor() {
    if (window.innerWidth < 993 && this.state.collapseOpen) {
      this.setState({
        color: "bg-white"
      });
    } else {
      this.setState({
        color: "navbar-transparent"
      });
    }
  };
  // this function opens and closes the sidebar on small devices
  toggleSidebar() {
    document.documentElement.classList.toggle("nav-open");
  };
  // this function opens and closes the collapse on small devices
  // it also adds navbar-transparent class to the navbar when closed
  // and bg-white when opened
  toggleCollapse() {
    let newState = {
      collapseOpen: !this.state.collapseOpen
    };
    if (!this.state.collapseOpen) {
      newState["color"] = "bg-white";
    } else {
      newState["color"] = "navbar-transparent";
    }
    this.setState(newState);
  };

  logoutClick() {
    this.props.managers.auth.userLogout()
    this.props.setAuthStatus(false)
  }

  languageItems(langList) {
    let { getString } = this.props

    return langList.map((langId, key) => {
      return (
        <DropdownItem key={key} onClick={() => this.props.managers.auth.userUpdate({ pref_langId: langId })}>
          {getString(langId, "languages", langId)}
        </DropdownItem>
      )
    });
  }

  render() {
    let { getString } = this.props;
    let { langId, compId, navbarTitleId, langList } = this.state;

    return (
      <>
        <Navbar
          className={classnames("navbar-absolute fixed-top", this.state.color)}
          expand="lg"
        >
          <Container fluid>
            <div className="navbar-wrapper">
              <div className="navbar-minimize">
                <Button
                  className="btn-icon btn-round"
                  color="default"
                  id="minimizeSidebar"
                  onClick={this.props.handleMiniClick}
                >
                  <i className="nc-icon nc-minimal-right text-center visible-on-sidebar-mini" />
                  <i className="nc-icon nc-minimal-left text-center visible-on-sidebar-regular" />
                </Button>
              </div>
              <div
                className={classnames("navbar-toggle", { toggled: this.state.sidebarOpen })}>
                <button
                  className="navbar-toggler"
                  type="button"
                  onClick={this.toggleSidebar}
                >
                  <span className="navbar-toggler-bar bar1" />
                  <span className="navbar-toggler-bar bar2" />
                  <span className="navbar-toggler-bar bar3" />
                </button>
              </div>
              <NavbarBrand onClick={e => e.preventDefault()}>
                <span className="d-none d-md-block">
                  {getString(langId, compId, navbarTitleId)}
                </span>
                <span className="d-block d-md-none">
                  {getString(langId, compId, navbarTitleId)}
                </span>
              </NavbarBrand>
            </div>
            <button
              aria-controls="navigation-index"
              aria-expanded={this.state.collapseOpen}
              aria-label="Toggle navigation"
              className="navbar-toggler"
              // data-target="#navigation"
              data-toggle="collapse"
              type="button"
              onClick={this.toggleCollapse}
            >
              <span className="navbar-toggler-bar navbar-kebab" />
              <span className="navbar-toggler-bar navbar-kebab" />
              <span className="navbar-toggler-bar navbar-kebab" />
            </button>
            <Collapse className="justify-content-end" navbar isOpen={this.state.collapseOpen}>
              <Nav navbar>
                <UncontrolledDropdown className="btn-rotate" nav>
                  <DropdownToggle
                    aria-haspopup={true}
                    caret
                    color="default"
                    data-toggle="dropdown"
                    id="dropdown_notifications"
                    nav
                  >
                    <i className="nc-icon nc-bell-55" />
                  </DropdownToggle>
                  <DropdownMenu aria-labelledby="dropdown_notifications" right>
                    <DropdownItem onClick={e => e.preventDefault()}>
                      {getString(langId, "generic", "label_comingSoon")}
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
                <UncontrolledDropdown className="btn-rotate" nav>
                  <DropdownToggle
                    aria-haspopup={true}
                    caret
                    color="default"
                    data-toggle="dropdown"
                    id="dropdown_languages"
                    nav
                  >
                    <i className="nc-icon nc-world-2" />
                  </DropdownToggle>
                  <DropdownMenu aria-labelledby="dropdown_languages" right>
                    {this.languageItems(langList)}
                  </DropdownMenu>
                </UncontrolledDropdown>
                <UncontrolledDropdown className="btn-rotate" nav>
                  <DropdownToggle
                    caret
                    color="default"
                    data-toggle="dropdown"
                    nav
                    onClick={e => e.preventDefault()}
                  >
                    <i className="nc-icon nc-settings-gear-65" />
                  </DropdownToggle>
                  <DropdownMenu className="dropdown-navbar" right tag="ul">
                    <DropdownItem onClick={() => this.props.history.push('/app/userprofile')}>
                      {getString(langId, compId, "profile")}
                    </DropdownItem>
                    <DropdownItem divider tag="li" />
                    <DropdownItem onClick={() => this.logoutClick()}>
                      {getString(langId, compId, "logout")}
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </Nav>
            </Collapse>
          </Container>
        </Navbar>
      </>
    );
  }
}

export default AppNavBar;

AppNavBar.propTypes = {
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  setAuthStatus: PropTypes.func.isRequired,
  navbarTitleId: PropTypes.string.isRequired
}
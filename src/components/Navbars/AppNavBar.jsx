import React from "react";
import classnames from "classnames";
import {
  Button,
  Collapse,
  Container,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Form,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  NavbarBrand,
  Navbar,
  Nav,
  UncontrolledDropdown,
} from "reactstrap";

import PropTypes from "prop-types";
import { localeList } from "../../core/locales";

class AppNavBar extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase()

    this.state = {
      collapseOpen: false,
      color: "navbar-transparent",

      langList: [],
    };
  }
  componentDidMount() {
    window.addEventListener("resize", this.updateColor());

    let langList = localeList()
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
    let { collapseOpen } = this.state;

    let newState = { collapseOpen: !collapseOpen };

    if (collapseOpen)
      newState["color"] = "navbar-transparent";
    else
      newState["color"] = "bg-white";

    this.setState(newState);
  };
  setCollapse(value = false) {
    let newState = { collapseOpen: value };

    if (value)
      newState["color"] = "bg-white";
    else
      newState["color"] = "navbar-transparent";


    this.setState(newState);
  };

  logoutClick() {
    this.props.managers.auth.userLogout()
    this.props.setAuthStatus(false)
  }

  languageItems(langList) {
    let { getString } = this.props

    return langList.map((locale, key) => {
      return (
        <DropdownItem key={key} onClick={() => this.setLocale(locale)}>
          {getString(locale, "languages", locale)}
        </DropdownItem>
      )
    });
  }
  setLocale(locale) {
    this.props.managers.auth.userUpdate({ locale })
    this.setCollapse(false)
  }

  pushRouterHistory(path) {
    this.props.history.push(path)
    this.setCollapse(false)
  }

  render() {
    let { getString, prefs, navbarTitleId } = this.props;
    let { langList } = this.state;

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
                  color="primary-dark"
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
                  {getString(prefs.locale, this.compId, navbarTitleId)}
                </span>
                <span className="d-block d-md-none">
                  {getString(prefs.locale, this.compId, navbarTitleId)}
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
              onClick={() => this.toggleCollapse()}
            >
              <span className="navbar-toggler-bar navbar-kebab" />
              <span className="navbar-toggler-bar navbar-kebab" />
              <span className="navbar-toggler-bar navbar-kebab" />
            </button>
            <Collapse className="justify-content-end" navbar isOpen={this.state.collapseOpen}>
              {/* <Form>
                <InputGroup className="no-border">
                  <Input
                    defaultValue=""
                    placeholder={getString(prefs.locale, "generic", "input_search")}
                    type="text" />
                  <InputGroupAddon addonType="append">
                    <InputGroupText>
                      <i className="nc-icon nc-zoom-split" />
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
              </Form> */}
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
                      {getString(prefs.locale, "generic", "label_comingSoon")}
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
                    <DropdownItem onClick={() => this.pushRouterHistory('/app/user/myaccount')}>
                      {getString(prefs.locale, this.compId, "label_myaccount")}
                    </DropdownItem>
                    <DropdownItem onClick={() => this.pushRouterHistory('/app/user/subscription')}>
                      {getString(prefs.locale, this.compId, "label_subscription")}
                    </DropdownItem>
                    <DropdownItem divider tag="li" />
                    <DropdownItem onClick={() => this.logoutClick()}>
                      {getString(prefs.locale, this.compId, "label_logout")}
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
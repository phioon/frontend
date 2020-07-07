import React from "react";
import classnames from "classnames";
import { NavLink } from "react-router-dom";

import PropTypes from "prop-types";

// reactstrap components
import {
  Collapse,
  Container,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Nav,
  NavbarBrand,
  Navbar,
  NavItem,
  UncontrolledDropdown
} from "reactstrap";

import { getLangList } from "../../core/lang";
import { projName, logo } from "../../core/projectInfo";

class AuthNavbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,
      collapseOpen: false,
      color: "navbar-transparent",

      langList: [],
    };
  }
  static getDerivedStateFromProps(props, state) {
    if (props.prefs.langId !== state.langId)
      return { langId: props.prefs.langId }
    return null
  }
  componentDidMount() {
    window.addEventListener("resize", this.updateColor);

    let langList = getLangList()
    this.setState({ langList })
  }
  // this function opens and closes the collapse on small devices
  // it also adds navbar-transparent class to the navbar when closed
  // ad bg-white when opened
  toggleCollapse = () => {
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

  languageItems(langList) {
    let { getString } = this.props

    return langList.map((langId, key) => {
      return (
        <DropdownItem key={key} onClick={() => this.props.setLangId(langId)}>
          {getString(langId, "languages", langId)}
        </DropdownItem>
      )
    });
  }

  render() {
    let { getString } = this.props;
    let { langId, compId, langList } = this.state;

    return (
      <Navbar
        className={classnames("navbar-absolute fixed-top", this.state.color)}
        expand="lg"
      >
        <Container>
          <div className="navbar-wrapper">
            <NavbarBrand onClick={e => e.preventDefault()}>
              {projName}
            </NavbarBrand>
          </div>
          <button
            aria-controls="navigation-index"
            aria-expanded={false}
            aria-label="Toggle navigation"
            className="navbar-toggler"
            data-toggle="collapse"
            type="button"
            onClick={this.toggleCollapse}
          >
            <span className="navbar-toggler-bar navbar-kebab" />
            <span className="navbar-toggler-bar navbar-kebab" />
            <span className="navbar-toggler-bar navbar-kebab" />
          </button>
          <Collapse
            isOpen={this.state.collapseOpen}
            className="justify-content-end"
            navbar
          >
            <Nav navbar>
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
              <NavItem>
                <NavLink to="/auth/register" className="nav-link" replace>
                  <i className="nc-icon nc-book-bookmark" />
                  {getString(langId, compId, "signUp")}
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink to="/auth/login" className="nav-link" replace>
                  <i className="nc-icon nc-tap-01" />
                  {getString(langId, compId, "login")}
                </NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </Container>
      </Navbar>
    );
  }
}

export default AuthNavbar;

AuthNavbar.propTypes = {
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
}
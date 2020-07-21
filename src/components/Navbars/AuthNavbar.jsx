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
import { project } from "../../core/projectData";

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
    window.addEventListener("resize", this.updateColor());

    let langList = getLangList()
    this.setState({ langList })
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
  // this function opens and closes the collapse on small devices
  // it also adds navbar-transparent class to the navbar when closed
  // ad bg-white when opened
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


  languageItems(langList) {
    let { getString } = this.props

    return langList.map((langId, key) => {
      return (
        <DropdownItem key={key} onClick={() => this.setLangId(langId)}>
          {getString(langId, "languages", langId)}
        </DropdownItem>
      )
    });
  }
  setLangId(langId) {
    this.props.setLangId(langId)
    this.setCollapse(false)
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
              <img
                alt={project.img.branding.logo.white.alt}
                width={project.img.branding.logo.white.width * 0.09}
                height={project.img.branding.logo.white.heigth * 0.09}
                src={project.img.branding.logo.white.src}
              />
            </NavbarBrand>
          </div>
          <button
            aria-controls="navigation-index"
            aria-expanded={false}
            aria-label="Toggle navigation"
            className="navbar-toggler"
            data-toggle="collapse"
            type="button"
            onClick={() => this.toggleCollapse()}
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
                <NavLink to="/auth/register" className="nav-link" onClick={() => this.setCollapse(false)} replace>
                  <i className="nc-icon nc-book-bookmark" />
                  {getString(langId, compId, "signUp")}
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink to="/auth/login" className="nav-link" onClick={() => this.setCollapse(false)} replace>
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
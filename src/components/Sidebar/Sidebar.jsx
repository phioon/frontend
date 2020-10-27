/*!

=========================================================
* Paper Dashboard PRO React - v1.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/paper-dashboard-pro-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React from "react";
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import { Nav, Collapse } from "reactstrap";
// javascript plugin used to create scrollbars on windows
import PerfectScrollbar from "perfect-scrollbar";

// CORE
import { project } from "../../core/projectData";

import {
  returnInitials
} from "../../core/utils";


var ps;

class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      langId: props.prefs.langId,
      compId: this.constructor.name.toLowerCase(),
      user: undefined,
      userName: null,
      fullName: undefined,

      ...this.getCollapseStates(props.routes)
    }
  }
  static getDerivedStateFromProps(props, state) {
    if (props.prefs.langId !== state.langId)
      return { langId: props.prefs.langId }
    return null
  }
  componentDidMount() {
    // if you are using a Windows Machine, the scrollbars will have a Mac look
    if (navigator.platform.indexOf("Win") > -1) {
      ps = new PerfectScrollbar(this.refs.sidebar, {
        suppressScrollX: true,
        suppressScrollY: false
      });
    }
    this.prepareRequirements()
  }

  async prepareRequirements() {
    let sUser = await this.props.managers.auth.storedUser()
    let user = sUser.user
    let fullName = this.getFullName(`${user.first_name} ${user.last_name}`)

    user.initials = returnInitials(fullName)

    this.setState({ user, fullName })
  }

  getFullName(fullName) {
    let maxLength = 18

    let names = String(fullName).split(" ")
    let firstName = names.shift()
    let lastName = names.pop()

    let shortName = `${firstName} ${lastName}`

    if (fullName.length > maxLength)
      if (shortName.length > maxLength)
        fullName = `${firstName} ${lastName[0]}.`
      else
        fullName = shortName

    return fullName
  }

  componentWillUnmount() {
    // we need to destroy the false scrollbar when we navigate
    // to a page that doesn't have this component rendered
    if (navigator.platform.indexOf("Win") > -1) {
      ps.destroy();
    }
  }

  // this creates the intial state of this component based on the collapse routes
  // that it gets through this.props.routes
  getCollapseStates = routes => {
    let initialState = {};
    routes.map((prop, key) => {
      if (prop.collapse) {
        initialState = {
          [prop.state]: this.getCollapseInitialState(prop.views),
          ...this.getCollapseStates(prop.views),
          ...initialState
        };
      }
      return null;
    });
    return initialState;
  };
  // this verifies if any of the collapses should be default opened on a rerender of this component
  // for example, on the refresh of the page,
  // while on the src/views/forms/RegularForms.jsx - route /admin/regular-forms
  getCollapseInitialState(routes) {
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].collapse && this.getCollapseInitialState(routes[i].views)) {
        return true;
      } else if (window.location.pathname.indexOf(routes[i].path) !== -1) {
        return true;
      }
    }
    return false;
  }
  // this function creates the links and collapses that appear in the sidebar (left menu)
  createLinks = routes => {
    return routes.map((prop, key) => {
      if (!prop.sidebar) {
        return null;
      }
      if (prop.collapse) {
        var st = {};
        st[prop["state"]] = !this.state[prop.state];
        return (
          <li
            className={this.getCollapseInitialState(prop.views) ? "active" : ""}
            key={key}
          >
            <a
              data-toggle="collapse"
              aria-expanded={this.state[prop.state]}
              onClick={e => {
                e.preventDefault();
                this.setState(st);
              }}
            >
              {prop.icon !== undefined ? (
                <>
                  <i className={prop.icon} />
                  <p>
                    {this.props.getString(this.state.langId, this.state.compId, prop.name)}
                    <b className="caret" />
                  </p>
                </>
              ) : (
                  <>
                    <span className="sidebar-mini-icon">{this.props.getString(this.state.langId, this.state.compId, [prop.name + "Mini"])}</span>
                    <span className="sidebar-normal">
                      {this.props.getString(this.state.langId, this.state.compId, prop.name)}
                      <b className="caret" />
                    </span>
                  </>
                )}
            </a>
            <Collapse isOpen={this.state[prop.state]}>
              <ul className="nav">{this.createLinks(prop.views)}</ul>
            </Collapse>
          </li>
        );
      }
      return (
        <li className={this.activeRoute(prop.layout + prop.path)} key={key}>
          <NavLink to={prop.layout + prop.path} activeClassName="">
            {prop.icon !== undefined ? (
              <>
                <i className={prop.icon} />
                <p>{this.props.getString(this.state.langId, this.state.compId, prop.name)} </p>
              </>
            ) : (
                <>
                  <span className="sidebar-mini-icon">{this.props.getString(this.state.langId, this.state.compId, [prop.name + "Mini"])}</span>
                  <span className="sidebar-normal">{this.props.getString(this.state.langId, this.state.compId, prop.name)}</span>
                </>
              )}
          </NavLink>
        </li>
      );
    });
  };
  // verifies if routeName is the one active (in browser input)
  activeRoute = routeName => {
    return this.props.location.pathname.indexOf(routeName) > -1 ? "active" : "";
  };
  render() {
    let { getString } = this.props;
    let { langId, compId, user, fullName } = this.state;

    return (
      <div
        className="sidebar"
        data-color={this.props.bgColor}
        data-active-color={this.props.activeColor}
      >
        <div className="logo">
          <a href={project.info.website} target="_blank" className="simple-text logo-mini">
            <div className="logo-img">
              <img
                alt={project.img.branding.avatar.original.alt}
                width={project.img.branding.avatar.original.width}
                height={project.img.branding.avatar.original.height}
                src={project.img.branding.avatar.original.src}
              />
            </div>
          </a>
          <a href={project.info.website} target="_blank" className="simple-text logo-normal">
            <img
              alt={project.img.branding.logo.white.alt}
              width={project.img.branding.logo.white.width * 0.06}
              height={project.img.branding.logo.white.height * 0.06}
              src={project.img.branding.logo.white.src}
            />
          </a>
        </div>
        <div className="sidebar-wrapper" ref="sidebar">
          <div className="user">
            <div className="photo text-center centered">
              <span>{user && user.initials}</span>
            </div>
            <div className="info">
              <a
                data-toggle="collapse"
                aria-expanded={this.state.openAvatar}
                onClick={() => this.setState({ openAvatar: !this.state.openAvatar })}
              >
                <span>
                  {fullName}
                  <b className="caret" />
                </span>
              </a>
              <Collapse isOpen={this.state.openAvatar}>
                <ul className="nav">
                  <li>
                    <NavLink to="/app/userprofile" activeClassName="">
                      <span className="sidebar-mini-icon">{getString(langId, compId, 'profileMini')}</span>
                      <span className="sidebar-normal">{getString(langId, compId, 'profile')}</span>
                    </NavLink>
                  </li>
                </ul>
              </Collapse>
            </div>
          </div>
          <Nav>{this.createLinks(this.props.routes)}</Nav>
        </div>
      </div>
    );
  }
}

export default Sidebar;

Sidebar.propTypes = {
  managers: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired
}
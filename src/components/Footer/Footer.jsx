/*!

=========================================================
* Paper Dashboard PRO React - v1.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/paper-dashboard-pro-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)

* Coded by Creative Tim

=========================================================
*/

import React from "react";
import { Container, Row } from "reactstrap";
// used for making the prop types of this component
import PropTypes from "prop-types";

import { UncontrolledTooltip } from "reactstrap";

// Core
import { project } from "../../core/projectData";
import { lang } from "moment";
// --------------------

class Footer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      langId: props.prefslangId,
      compId: this.constructor.name.toLowerCase()
    }
  }
  static getDerivedStateFromProps(props, state) {
    if (props.prefs.langId !== state.langId)
      return { langId: props.prefs.langId }
    return null
  }

  render() {
    // Function to get proper translation
    let { getString } = this.props;
    let { langId, compId } = this.state;

    return (
      <footer
        className={"footer" + (this.props.default ? " footer-default" : "")}
      >
        <Container fluid={this.props.fluid ? true : false}>
          <Row>
            <nav className="footer-nav">
              <ul>
                <li>
                  <a href={project.info.website} target="_blank">
                    {getString(langId, compId, "webSite")}
                  </a>
                </li>
                <li>
                  <a id="appStore" href="#comingsoon">
                    {getString(langId, compId, "appStore")}
                  </a>
                  <UncontrolledTooltip target="appStore">
                    {getString(langId, "generic", "label_comingSoon")}
                  </UncontrolledTooltip>
                </li>
                <li>
                  <a id="googlePlay" href="#comingsoon">
                    {getString(langId, compId, "googlePlay")}
                  </a>
                  <UncontrolledTooltip target="googlePlay">
                    {getString(langId, "generic", "label_comingSoon")}
                  </UncontrolledTooltip>
                </li>
              </ul>
            </nav>
            <div className="credits ml-auto">
              <span className="copyright">
                &copy; {1900 + new Date().getYear()} • {getString(langId, compId, "allRightsReserved")}
              </span>
            </div>
          </Row>
        </Container>
      </footer>
    );
  }
}

Footer.propTypes = {
  prefs: PropTypes.object.isRequired,
  default: PropTypes.bool,
  fluid: PropTypes.bool
};

export default Footer;

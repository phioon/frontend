import React from "react";
import PropTypes from "prop-types";
// reactstrap components
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  NavItem,
  NavLink,
  Nav,
  Row,
  TabContent,
  TabPane,
  UncontrolledTooltip
} from "reactstrap";

import TimeManager from "../../core/managers/TimeManager";
import { convertFloatToCurrency, convertFloatToPercentage } from "../../core/utils"

class StrategyCard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,

      activeNavId: "summary",
    }
  }
  static getDerivedStateFromProps(props, state) {
    if (props.prefs.langId !== state.langId)
      return { langId: props.prefs.langId }
    return null
  }

  handleKpiPresentation(format, kpiValue, includePlusMinus = false) {
    let strKpi = ""
    let currency = this.state.setup.currency

    if (includePlusMinus && kpiValue > 0)
      strKpi += "+"

    switch (format) {
      case "currency":
        strKpi += convertFloatToCurrency(kpiValue, currency)
        break;
      case "percentage":
        strKpi += convertFloatToPercentage(kpiValue, currency.decimal_symbol)
        break;
      default:
        strKpi += kpiValue
        break;
    }

    return strKpi
  }

  makeDescriptionPretty(setup) {
    // It accepts only 1 variable per paragragh

    let { getString } = this.props
    let { langId } = this.state
    let p = 1
    let paragraphs = []
    let paragraph = getString(langId, "technicalconditions", String(setup.tc_id + "_p" + p))

    while (paragraph) {
      let variable = paragraph.match(/<(.*)>/)

      if (variable)
        paragraph = paragraph.replace(variable[0], setup[variable[1]])
      paragraphs.push(paragraph)

      p += 1
      paragraph = getString(langId, "technicalconditions", [setup.tc_id + "_p" + p])
    }

    return paragraphs.map((paragragh, key) => {
      return (
        <p key={key}>
          {paragragh}
        </p>
      )
    });
  }

  toggleNavLink(navId, value) {
    this.setState({ [navId]: value })
  }

  render() {
    let { getString, strategy } = this.props;
    let {
      langId,
      compId,

      activeNavId
    } = this.state;

    return (
      <Card className="card-stats">
        <CardHeader>
          <Row>
            {/* Name */}
            <Col md="10" xs="9">
              <CardTitle>{strategy.name}</CardTitle>
            </Col>
            {/* Visibility*/}
            <Col md="2" xs="3">
              <div id={"visibility_hint_" + strategy.id} className="pull-right">
                <Badge color="neutral">
                  {strategy.is_public ?
                    getString(langId, compId, "label_public") :
                    getString(langId, compId, "label_private")
                  }
                </Badge>
              </div>
              <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"visibility_hint_" + strategy.id}>
                {strategy.is_public ?
                  getString(langId, compId, "label_public_hint") :
                  getString(langId, compId, "label_private_hint")
                }
              </UncontrolledTooltip>
            </Col>
          </Row>
        </CardHeader>
        <CardBody>
          <div className="nav-tabs-navigation">
            <div className="nav-tabs-wrapper">
              <Nav id="tabs" role="tablist" tabs>
                {/* Summary */}
                <NavItem>
                  <NavLink
                    aria-expanded={activeNavId === "summary"}
                    data-toggle="tab"
                    role="tab"
                    href="#"
                    className={activeNavId === "summary" ? "active" : ""
                    }
                    onClick={() => this.toggleNavLink("activeNavId", "summary")}
                  >
                    {getString(langId, compId, "nav_summary")}
                  </NavLink>
                </NavItem>
                {/* Rules */}
                <NavItem>
                  <NavLink
                    aria-expanded={activeNavId === "rules"}
                    data-toggle="tab"
                    role="tab"
                    href="#"
                    className={activeNavId === "rules" ? "active" : ""
                    }
                    onClick={() => this.toggleNavLink("activeNavId", "rules")}
                  >
                    {getString(langId, compId, "nav_rules")}
                  </NavLink>
                </NavItem>
              </Nav>
            </div>
          </div>
          <TabContent id={"tab-content_" + strategy.id} activeTab={activeNavId}>
            <TabPane tabId="summary" role="tabpanel">
              {/* Description */}
              {strategy.desc &&
                <>
                  <div className="icon icon-primary big-title">
                    <i className="fas fa-quote-right" />
                  </div>
                  <i className="card-description">{strategy.desc}</i>
                  {" "}
                  <p className="card-description text-right">
                    {strategy.owner_first_name}
                    {" "}
                    {strategy.owner_last_name}
                  </p>
                </>
              }
              {/* Author */}
              <Row>
                <Col xl="7" lg="6" md="6" sm="6" className="ml-auto mr-auto">
                  <label>{getString(langId, compId, "label_author")}</label>
                </Col>
                <Col xl="5" lg="6" md="5" sm="6" className="ml-auto mr-auto text-right">
                  <label>
                    {strategy.owner_first_name}
                    {" "}
                    {strategy.owner_last_name}
                  </label>
                </Col>
              </Row>
              {/* Created On */}
              <Row>
                <Col xl="7" lg="6" md="6" sm="6" className="ml-auto mr-auto">
                  <label>{getString(langId, compId, "label_createdOn")}</label>
                </Col>
                <Col xl="5" lg="6" md="5" sm="6" className="ml-auto mr-auto text-right">
                  <label>{TimeManager.getLocaleDateString(strategy.created_on, false)}</label>
                </Col>
              </Row>
              {/* Type */}
              <Row>
                <Col xl="7" lg="6" md="6" sm="6" className="ml-auto mr-auto">
                  <label>
                    {getString(langId, compId, "label_type")}
                    {" "}
                    <i id={"type_hint_" + strategy.id} className="nc-icon nc-alert-circle-i" />
                  </label>
                  <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"type_hint_" + strategy.id}>
                    {getString(langId, compId, "label_type_hint")}
                  </UncontrolledTooltip>
                </Col>
                <Col xl="5" lg="6" md="5" sm="6" className="ml-auto mr-auto text-right">
                  <label id={"type_hint_value_" + strategy.id}>
                    {strategy.is_dynamic ?
                      getString(langId, compId, "label_dynamic") :
                      getString(langId, compId, "label_static")
                    }
                  </label>
                  <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"type_hint_value_" + strategy.id}>
                    {strategy.is_dynamic ?
                      getString(langId, compId, "label_dynamic_hint") :
                      getString(langId, compId, "label_static_hint")
                    }
                  </UncontrolledTooltip>
                </Col>
              </Row>
            </TabPane>
            <TabPane tabId="rules" role="tabpanel">

            </TabPane>
          </TabContent>
        </CardBody>
        <CardFooter>
          <hr />
          <Row>
            <Col>
              <div className="stats">
                <i className="fa fa-wrench" />
                {/* <i className="nc-icon nc-settings" /> */}
                {getString(langId, compId, "label_actions")}:
              </div>
            </Col>
            <Col className="text-right">
              <Button
                className="btn-icon btn-link"
                color="warning"
                id={"update__" + strategy.id}
                size="sm"
                type="button"
                onClick={() => this.props.onClick("update", strategy)}
              >
                <i className="fa fa-edit" />
              </Button>
              <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"update__" + strategy.id}>
                {getString(langId, compId, "btn_update_hint")}
              </UncontrolledTooltip>
              <Button
                className="btn-icon btn-link remove"
                color="danger"
                id={"delete__" + strategy.id}
                size="sm"
                type="button"
                onClick={() => this.props.onClick("delete", strategy)}
              >
                <i className="fa fa-times" />
              </Button>
              <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"delete__" + strategy.id}>
                {getString(langId, compId, "btn_delete_hint")}
              </UncontrolledTooltip>
            </Col>
          </Row>
        </CardFooter>
      </Card >
    )
  }
}

export default StrategyCard;

StrategyCard.propTypes = {
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,

  strategy: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
}
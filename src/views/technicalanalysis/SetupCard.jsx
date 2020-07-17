import React from "react";
import PropTypes from "prop-types";
// reactstrap components
import {
  Col,
  NavItem,
  NavLink,
  Nav,
  Progress,
  Row,
  TabContent,
  TabPane,
  UncontrolledTooltip
} from "reactstrap";

import TimeManager from "../../core/managers/TimeManager"
import { convertFloatToCurrency, convertFloatToPercentage } from "../../core/utils"

class SetupCard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,

      activeNavId: "summary",

      setup: props.setup,
      isPurchase: props.setup.type == "purchase" ? true : false,
    }
  }
  static getDerivedStateFromProps(props, state) {
    if (props.prefs.langId !== state.langId)
      return {
        langId: props.prefs.langId,
        setup: props.setup
      }
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

  progressColor(setup) {
    if (setup.ended_on) {
      // Closed Position
      if (setup.is_success)
        return "success"
      return "danger"
    }
    else {
      // Open Position
      if (setup.asset_price >= setup.target)
        return "success"
      else if (setup.asset_price > setup.max_price)
        return "success"
      else if (setup.asset_price > setup.stop_loss)
        return "warning"
      else if (setup.asset_price <= setup.stop_loss)
        return "danger"
    }
  }
  progressText(setup) {
    let { getString } = this.props
    let { langId, compId } = this.state

    if (setup.ended_on) {
      // Closed Position
      if (setup.is_success)
        return getString(langId, compId, "label_gain")
      return getString(langId, compId, "label_loss")
    }
    else {
      // Open Position
      if (setup.asset_price >= setup.target)
        return getString(langId, compId, "label_gain")
      else if (setup.asset_price > setup.max_price)
        return this.handleKpiPresentation("currency", setup.asset_price)
      else if (setup.asset_price > setup.stop_loss)
        return getString(langId, compId, "label_buyingArea")
      else if (setup.asset_price <= setup.stop_loss)
        return getString(langId, compId, "label_loss")
    }
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
    let { getString } = this.props;
    let {
      langId,
      compId,

      activeNavId,

      setup,
      isPurchase,

    } = this.state;

    return (
      <li className={isPurchase ? "" : "timeline-inverted"}>
        <div className={isPurchase ? "timeline-badge success" : "timeline-badge danger"}>
          <i className={isPurchase ? "nc-icon nc-spaceship" : "nc-icon nc-spaceship fa-rotate-90"} />
        </div>
        <div className="timeline-panel">
          <div className="timeline-heading">
            <Row>
              <Col lg="6" md="6" sm="6" xs="6">
                <h5 id={"asset_name_" + setup.id}>{setup.asset_label}</h5>
                <UncontrolledTooltip delay={{ show: 200 }} placement="top-start" target={"asset_name_" + setup.id}>
                  {setup.asset_name}
                </UncontrolledTooltip>
              </Col>
              <Col lg="6" md="6" sm="6" xs="6" className="text-right">
                <label className={isPurchase ? "text-success" : "text-danger"}>
                  {isPurchase ? getString(langId, compId, "label_buy") : getString(langId, compId, "label_sell")}
                </label>
              </Col>
            </Row>
          </div>
          <div className="timeline-body">
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
                  {/* Technical Condition */}
                  <NavItem>
                    <NavLink
                      aria-expanded={activeNavId === "technicalCondition"}
                      data-toggle="tab"
                      role="tab"
                      href="#"
                      className={activeNavId === "technicalCondition" ? "active" : ""}
                      onClick={() => this.toggleNavLink("activeNavId", "technicalCondition")}
                    >
                      {getString(langId, compId, "nav_technicalCondition")}
                    </NavLink>
                  </NavItem>
                  {/* Chart */}
                  <NavItem>
                    <NavLink
                      aria-expanded={activeNavId === "chart"}
                      data-toggle="tab"
                      role="tab"
                      href="#"
                      className={activeNavId === "chart" ? "active" : ""
                      }
                      onClick={() => this.toggleNavLink("activeNavId", "chart")}
                    >
                      {getString(langId, compId, "nav_chart")}
                    </NavLink>
                  </NavItem>
                </Nav>
              </div>
            </div>
            <TabContent
              id="my-tab-content"
              activeTab={activeNavId}
            >
              {/* Summary */}
              <TabPane tabId="summary" role="tabpanel">
                {/* Max/Min Price */}
                <Row>
                  <Col md="5" sm="6" className="ml-auto mr-auto">
                    <label>
                      {isPurchase ? getString(langId, compId, "label_maxPrice") : getString(langId, compId, "label_minPrice")}
                      {" "}
                      <i id={"priceLimit_hint_" + setup.id} className="nc-icon nc-alert-circle-i" />
                    </label>
                    <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"priceLimit_hint_" + setup.id}>
                      {getString(langId, compId, "priceLimit_hint")}
                    </UncontrolledTooltip>
                  </Col>
                  <Col md="4" sm="6" className="ml-auto mr-auto text-right">
                    <label className="numbers">{this.handleKpiPresentation("currency", setup.max_price)}</label>
                  </Col>
                </Row>
                {/* Stop Loss */}
                <Row>
                  <Col md="5" sm="6" className="ml-auto mr-auto">
                    <label>
                      {getString(langId, compId, "label_stopLoss")}
                      {" "}
                      <i id={"stopLoss_hint_" + setup.id} className="nc-icon nc-alert-circle-i" />
                    </label>
                    <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"stopLoss_hint_" + setup.id}>
                      {getString(langId, compId, "stopLoss_hint")}
                    </UncontrolledTooltip>
                  </Col>
                  <Col md="4" sm="6" className="ml-auto mr-auto text-right">
                    <label className="numbers">{this.handleKpiPresentation("currency", setup.stop_loss)}</label>
                  </Col>
                </Row>
                {/* Target */}
                <Row>
                  <Col md="5" sm="6" className="ml-auto mr-auto" >
                    <label>
                      {getString(langId, compId, "label_target")}
                      {" "}
                      <i id={"target_hint" + setup.id} className="nc-icon nc-alert-circle-i" />
                    </label>
                    <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"target_hint" + setup.id}>
                      {getString(langId, compId, "target_hint")}
                    </UncontrolledTooltip>
                  </Col>
                  <Col md="4" sm="6" className="ml-auto mr-auto text-right">
                    <label className="numbers">{this.handleKpiPresentation("currency", setup.target)}</label>
                  </Col>
                </Row>
                {/* Gain Percent / Loss Percent*/}
                <Row>
                  <Col md="5" sm="6" className="ml-auto mr-auto">
                    <label className={setup.ended_on ? setup.is_success === false ? "text-danger" : "text-success" : null}>
                      {setup.is_success === false ?
                        getString(langId, compId, "label_lossPercent") :
                        getString(langId, compId, "label_gainPercent")
                      }
                      {" "}
                      <i id={"gainlossPercent_hint" + setup.id} className="nc-icon nc-alert-circle-i" />
                    </label>
                    <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"gainlossPercent_hint" + setup.id}>
                      {setup.is_success === false ?
                        getString(langId, compId, "lossPercent_hint") :
                        getString(langId, compId, "gainPercent_hint")
                      }
                    </UncontrolledTooltip>
                  </Col>
                  <Col md="4" sm="6" className="ml-auto mr-auto text-right">
                    <label className={"numbers " + (setup.ended_on ? setup.is_success === false ? "text-danger" : "text-success" : null)}>
                      {setup.is_success === false ?
                        this.handleKpiPresentation("percentage", setup.loss_percent) :
                        this.handleKpiPresentation("percentage", setup.gain_percent)
                      }
                    </label>
                  </Col>
                </Row>
                {/* Risk / Reward */}
                <Row>
                  <Col md="5" sm="6" className="ml-auto mr-auto">
                    <label>
                      {getString(langId, compId, "label_riskReward")}{" "}
                      <i id={"riskReward_hint" + setup.id} className="nc-icon nc-alert-circle-i" />
                    </label>
                    <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"riskReward_hint" + setup.id}>
                      {getString(langId, compId, "riskReward_hint")}
                    </UncontrolledTooltip>
                  </Col>
                  <Col md="4" sm="6" className="ml-auto mr-auto text-right">
                    <label className="numbers">{setup.risk_reward}</label>
                  </Col>
                </Row>
              </TabPane>
              {/* Technical Condition */}
              <TabPane tabId="technicalCondition" role="tabpanel">
                <label>
                  {this.makeDescriptionPretty(setup)}
                </label>
                <br />
                <br />
                {/* Success Rate */}
                <Row>
                  <Col md="5" sm="6" className="ml-auto mr-auto">
                    <label>
                      {getString(langId, compId, "label_successRate")}{" "}
                      <i id={"successRate_hint" + setup.id} className="nc-icon nc-alert-circle-i" />
                    </label>
                    <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"successRate_hint" + setup.id}>
                      {getString(langId, compId, "successRate_hint")}
                    </UncontrolledTooltip>
                  </Col>
                  <Col md="4" sm="6" className="ml-auto mr-auto text-right">
                    <label className="numbers">
                      {this.handleKpiPresentation("percentage", setup.success_rate)}
                    </label>
                  </Col>
                </Row>
                {/* Occurrencies */}
                <Row>
                  <Col md="5" sm="6" className="ml-auto mr-auto">
                    <label>
                      {getString(langId, compId, "label_occurrencies")}{" "}
                      <i id={"occurrencies_hint" + setup.id} className="nc-icon nc-alert-circle-i" />
                    </label>
                    <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"occurrencies_hint" + setup.id}>
                      {getString(langId, compId, "occurrencies_hint")}
                    </UncontrolledTooltip>
                  </Col>
                  <Col md="4" sm="6" className="ml-auto mr-auto text-right">
                    <label className="numbers">
                      {setup.occurrencies}
                    </label>
                  </Col>
                </Row>
                {/* Last Occurrence */}
                <Row>
                  <Col md="5" sm="6" className="ml-auto mr-auto">
                    <label>
                      {getString(langId, compId, "label_lastOccurrence")}{" "}
                      <i id={"lastOccurrence_hint" + setup.id} className="nc-icon nc-alert-circle-i" />
                    </label>
                    <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"lastOccurrence_hint" + setup.id}>
                      {getString(langId, compId, "lastOccurrence_hint")}
                    </UncontrolledTooltip>
                  </Col>
                  <Col md="4" sm="6" className="ml-auto mr-auto text-right">
                    <label className="numbers">
                      {TimeManager.getDateString(setup.last_ended_occurrence)}
                    </label>
                  </Col>
                </Row>
              </TabPane>
              {/* Chart */}
              <TabPane className="text-center" tabId="chart" role="tabpanel">
                <label>{getString(langId, "generic", "label_commingSoon")}</label>
              </TabPane>
            </TabContent>
          </div>
          <hr />
          {/* Started On */}
          <h6 id={"startedOn_hint_" + setup.id} className="text-center">
            <i className="far fa-clock" />
            {" "}
            {setup.started_on}
          </h6>
          <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"startedOn_hint_" + setup.id}>
            {getString(langId, compId, "startedOn_hint")}
          </UncontrolledTooltip>
          <br />
          {/* Data above Progress Bar */}
          <Row>
            <Col lg="6" md="6" sm="6" xs="6">
              <label id={"progressBar_start_" + setup.id}>
                {this.handleKpiPresentation("currency", setup.stop_loss)}
              </label>
              <UncontrolledTooltip delay={{ show: 200 }} placement="top-start" target={"progressBar_start_" + setup.id}>
                {getString(langId, compId, "progressBar_stopLoss_hint")}
              </UncontrolledTooltip>
            </Col>
            <Col lg="6" md="6" sm="6" xs="6" className="text-right">
              <label id={"progressBar_end_" + setup.id}>
                {setup.ended_on ? setup.ended_on : this.handleKpiPresentation("currency", setup.target)}
              </label>
              <UncontrolledTooltip delay={{ show: 200 }} placement="top-end" target={"progressBar_end_" + setup.id}>
                {setup.ended_on ?
                  getString(langId, compId, "progressBar_endedOn_hint") :
                  getString(langId, compId, "progressBar_target_hint")
                }
              </UncontrolledTooltip>
            </Col>
          </Row>
          {/* Progress Bar */}
          <Row>
            <Col>
              <Progress
                className={setup.ended_on ? "" : "text-right"}
                animated={setup.ended_on ? false : true}
                color={this.progressColor(setup)}
                value={
                  setup.ended_on ?
                    setup.delta.stopLoss_target :
                    setup.delta.stopLoss_assetPrice
                }
                max={setup.delta.stopLoss_target}>
                {this.progressText(setup)}
              </Progress>
            </Col>
          </Row>
        </div>
      </li>
    )
  }
}

export default SetupCard;

SetupCard.propTypes = {
}
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
    this.compId = this.constructor.name.toLowerCase();

    this.state = {

      activeNavId: "summary",

      setup: props.setup,
      isPurchase: props.setup.type == "purchase" ? true : false,
    }
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
      if (setup.type == "purchase") {
        if (setup.price >= setup.target)
          return "success"
        else if (setup.price > setup.max_price)
          return "success"
        else if (setup.price > setup.stop_loss)
          return "warning"
        else if (setup.price <= setup.stop_loss)
          return "danger"
      }
      else {
        if (setup.price <= setup.target)
          return "success"
        else if (setup.price < setup.max_price)
          return "success"
        else if (setup.price < setup.stop_loss)
          return "warning"
        else if (setup.price >= setup.stop_loss)
          return "danger"
      }
    }
  }
  progressText(setup) {
    let { prefs, getString } = this.props

    if (setup.ended_on) {
      // Closed Position
      if (setup.is_success)
        return getString(prefs.locale, this.compId, "label_gain")
      return getString(prefs.locale, this.compId, "label_loss")
    }
    else {
      // Open Position
      if (setup.type == "purchase") {
        if (setup.price >= setup.target)
          return getString(prefs.locale, this.compId, "label_gain")
        else if (setup.price > setup.max_price)
          return this.handleKpiPresentation("currency", setup.price)
        else if (setup.price > setup.stop_loss)
          return getString(prefs.locale, this.compId, "label_buyingArea")
        else if (setup.price <= setup.stop_loss)
          return getString(prefs.locale, this.compId, "label_loss")
      }
      else {
        if (setup.price <= setup.target)
          return getString(prefs.locale, this.compId, "label_gain")
        else if (setup.price < setup.max_price)
          return this.handleKpiPresentation("currency", setup.price)
        else if (setup.price < setup.stop_loss)
          return getString(prefs.locale, this.compId, "label_sellingArea")
        else if (setup.price >= setup.stop_loss)
          return getString(prefs.locale, this.compId, "label_loss")
      }
    }
  }

  makeDescriptionPretty(setup) {
    // It accepts only 1 variable per paragragh

    let { prefs, getString } = this.props
    let p = 1
    let paragraphs = []
    let paragraph = getString(prefs.locale, "technicalconditions", String(setup.tc_id + "_p" + p))

    while (paragraph) {
      let variable = paragraph.match(/<(.*)>/)

      if (variable)
        paragraph = paragraph.replace(variable[0], setup[variable[1]])
      paragraphs.push(paragraph)

      p += 1
      paragraph = getString(prefs.locale, "technicalconditions", [setup.tc_id + "_p" + p])
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
    let { prefs, getString } = this.props;
    let {
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
              <Col>
                <h5 id={"asset_name_" + setup.id}>{setup.asset_label}</h5>
                <UncontrolledTooltip delay={{ show: 200 }} placement="top-start" target={"asset_name_" + setup.id}>
                  {setup.asset_name}
                </UncontrolledTooltip>
              </Col>
              <Col className="text-right">
                <label className={isPurchase ? "text-success" : "text-danger"}>
                  {isPurchase ? getString(prefs.locale, this.compId, "label_buy") : getString(prefs.locale, this.compId, "label_sell")}
                </label>
              </Col>
            </Row>
          </div>
          <div className="timeline-body">
            <div className="nav-tabs-navigation">
              <div className="nav-tabs-wrapper">
                <Nav id="tabs" role="tablist" tabs className="justify-content-center">
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
                      {getString(prefs.locale, this.compId, "nav_summary")}
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
                      {getString(prefs.locale, this.compId, "nav_technicalCondition")}
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
                      {getString(prefs.locale, this.compId, "nav_chart")}
                    </NavLink>
                  </NavItem>
                </Nav>
              </div>
            </div>
            <TabContent id={"tab-content_" + setup.id} activeTab={activeNavId}>
              {/* Summary */}
              <TabPane tabId="summary" role="tabpanel">
                {/* Max/Min Price */}
                <Row className="justify-content-center">
                  <Col xl="7" lg="6" md="6" sm="6" className="ml-auto mr-auto">
                    <label>
                      {isPurchase ? getString(prefs.locale, this.compId, "label_maxPrice") : getString(prefs.locale, this.compId, "label_minPrice")}
                      {" "}
                      <i id={"priceLimit_hint_" + setup.id} className="nc-icon nc-alert-circle-i" />
                    </label>
                    <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"priceLimit_hint_" + setup.id}>
                      {getString(prefs.locale, this.compId, "priceLimit_hint")}
                    </UncontrolledTooltip>
                  </Col>
                  <Col xl="5" lg="6" md="5" sm="6" className="ml-auto mr-auto text-right">
                    <label className="numbers">{this.handleKpiPresentation("currency", setup.max_price)}</label>
                  </Col>
                </Row>
                {/* Stop Loss */}
                <Row>
                  <Col xl="7" lg="6" md="6" sm="6" className="ml-auto mr-auto">
                    <label>
                      {getString(prefs.locale, this.compId, "label_stopLoss")}
                      {" "}
                      <i id={"stopLoss_hint_" + setup.id} className="nc-icon nc-alert-circle-i" />
                    </label>
                    <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"stopLoss_hint_" + setup.id}>
                      {getString(prefs.locale, this.compId, "stopLoss_hint")}
                    </UncontrolledTooltip>
                  </Col>
                  <Col xl="5" lg="6" md="5" sm="6" className="ml-auto mr-auto text-right">
                    <label className="numbers">{this.handleKpiPresentation("currency", setup.stop_loss)}</label>
                  </Col>
                </Row>
                {/* Target */}
                <Row>
                  <Col xl="7" lg="6" md="6" sm="6" className="ml-auto mr-auto" >
                    <label>
                      {getString(prefs.locale, this.compId, "label_target")}
                      {" "}
                      <i id={"target_hint" + setup.id} className="nc-icon nc-alert-circle-i" />
                    </label>
                    <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"target_hint" + setup.id}>
                      {getString(prefs.locale, this.compId, "target_hint")}
                    </UncontrolledTooltip>
                  </Col>
                  <Col xl="5" lg="6" md="5" sm="6" className="ml-auto mr-auto text-right">
                    <label className="numbers">{this.handleKpiPresentation("currency", setup.target)}</label>
                  </Col>
                </Row>
                {/* Gain Percent / Loss Percent*/}
                <Row>
                  <Col xl="7" lg="6" md="6" sm="6" className="ml-auto mr-auto">
                    <label className={setup.ended_on ? setup.is_success === false ? "text-danger" : "text-success" : null}>
                      {setup.is_success === false ?
                        getString(prefs.locale, this.compId, "label_lossPercent") :
                        getString(prefs.locale, this.compId, "label_gainPercent")
                      }
                      {" "}
                      <i id={"gainlossPercent_hint" + setup.id} className="nc-icon nc-alert-circle-i" />
                    </label>
                    <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"gainlossPercent_hint" + setup.id}>
                      {setup.is_success === false ?
                        getString(prefs.locale, this.compId, "lossPercent_hint") :
                        getString(prefs.locale, this.compId, "gainPercent_hint")
                      }
                    </UncontrolledTooltip>
                  </Col>
                  <Col xl="5" lg="6" md="5" sm="6" className="ml-auto mr-auto text-right">
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
                  <Col xl="7" lg="6" md="6" sm="6" className="ml-auto mr-auto">
                    <label>
                      {getString(prefs.locale, this.compId, "label_riskReward")}{" "}
                      <i id={"riskReward_hint" + setup.id} className="nc-icon nc-alert-circle-i" />
                    </label>
                    <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"riskReward_hint" + setup.id}>
                      {getString(prefs.locale, this.compId, "riskReward_hint")}
                    </UncontrolledTooltip>
                  </Col>
                  <Col xl="5" lg="6" md="5" sm="6" className="ml-auto mr-auto text-right">
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
                  <Col xl="7" lg="6" md="6" sm="6" className="ml-auto mr-auto">
                    <label>
                      {getString(prefs.locale, this.compId, "label_successRate")}{" "}
                      <i id={"successRate_hint" + setup.id} className="nc-icon nc-alert-circle-i" />
                    </label>
                    <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"successRate_hint" + setup.id}>
                      {getString(prefs.locale, this.compId, "successRate_hint")}
                    </UncontrolledTooltip>
                  </Col>
                  <Col xl="5" lg="6" md="5" sm="6" className="ml-auto mr-auto text-right">
                    <label id={"successRate_value_hint" + setup.id} className="numbers">
                      {setup.success_rate ?
                        this.handleKpiPresentation("percentage", setup.success_rate) :
                        getString(prefs.locale, this.compId, "label_notAvailableData")
                      }
                    </label>
                    {!setup.success_rate &&
                      <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"successRate_value_hint" + setup.id}>
                        {getString(prefs.locale, this.compId, "notAvailableData_hint")}
                      </UncontrolledTooltip>
                    }
                  </Col>
                </Row>
                {/* Estimated Time */}
                <Row>
                  <Col xl="7" lg="6" md="6" sm="6" className="ml-auto mr-auto">
                    <label>
                      {getString(prefs.locale, this.compId, "label_estimatedTime")}{" "}
                      <i id={"estimatedTime_hint" + setup.id} className="nc-icon nc-alert-circle-i" />
                    </label>
                    <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"estimatedTime_hint" + setup.id}>
                      {getString(prefs.locale, this.compId, "estimatedTime_hint")}
                    </UncontrolledTooltip>
                  </Col>
                  <Col xl="5" lg="6" md="5" sm="6" className="ml-auto mr-auto text-right">
                    <label id={"estimatedTime_value_hint" + setup.id} className="numbers">
                      {setup.avg_duration_gain ?
                        setup.avg_duration_gain + " " + getString(prefs.locale, "generic", "label_days") :
                        getString(prefs.locale, this.compId, "label_notAvailableData")
                      }
                    </label>
                    {!setup.avg_duration_gain &&
                      <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"estimatedTime_value_hint" + setup.id}>
                        {getString(prefs.locale, this.compId, "notAvailableData_hint")}
                      </UncontrolledTooltip>
                    }
                  </Col>
                </Row>
                {/* Occurrencies */}
                <Row>
                  <Col xl="7" lg="6" md="6" sm="6" className="ml-auto mr-auto">
                    <label>
                      {getString(prefs.locale, this.compId, "label_occurrencies")}{" "}
                      <i id={"occurrencies_hint" + setup.id} className="nc-icon nc-alert-circle-i" />
                    </label>
                    <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"occurrencies_hint" + setup.id}>
                      {getString(prefs.locale, this.compId, "occurrencies_hint")}
                    </UncontrolledTooltip>
                  </Col>
                  <Col xl="5" lg="6" md="5" sm="6" className="ml-auto mr-auto text-right">
                    <label className="numbers">
                      {setup.occurrencies}
                    </label>
                  </Col>
                </Row>
                {/* Last Occurrence */}
                <Row>
                  <Col xl="7" lg="6" md="6" sm="6" className="ml-auto mr-auto">
                    <label>
                      {getString(prefs.locale, this.compId, "label_lastOccurrence")}{" "}
                      <i id={"lastOccurrence_hint" + setup.id} className="nc-icon nc-alert-circle-i" />
                    </label>
                    <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"lastOccurrence_hint" + setup.id}>
                      {getString(prefs.locale, this.compId, "lastOccurrence_hint")}
                    </UncontrolledTooltip>
                  </Col>
                  <Col xl="5" lg="6" md="5" sm="6" className="ml-auto mr-auto text-right">
                    <label id={"lastOccurrence_value_hint" + setup.id} className="numbers">
                      {setup.last_ended_occurrence ?
                        TimeManager.getLocaleDateString(setup.last_ended_occurrence, false) :
                        getString(prefs.locale, this.compId, "label_notAvailableData")
                      }
                    </label>
                    {!setup.last_ended_occurrence &&
                      <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"lastOccurrence_value_hint" + setup.id}>
                        {getString(prefs.locale, this.compId, "notAvailableData_hint")}
                      </UncontrolledTooltip>
                    }
                  </Col>
                </Row>
              </TabPane>
              {/* Chart */}
              <TabPane className="text-center" tabId="chart" role="tabpanel">
                <label>{getString(prefs.locale, "generic", "label_comingSoon")}</label>
              </TabPane>
            </TabContent>
          </div>
          <hr />
          {/* Started On */}
          <h6 id={"startedOn_hint_" + setup.id} className="text-center">
            <i className="far fa-clock" />
            {" "}
            {TimeManager.getLocaleDateString(setup.started_on, false)}
          </h6>
          <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"startedOn_hint_" + setup.id}>
            {getString(prefs.locale, this.compId, "startedOn_hint")}
          </UncontrolledTooltip>
          <br />
          {/* Data above Progress Bar */}
          <Row>
            <Col>
              <label id={"progressBar_start_" + setup.id}>
                {this.handleKpiPresentation("currency", setup.stop_loss)}
              </label>
              <UncontrolledTooltip delay={{ show: 200 }} placement="top-start" target={"progressBar_start_" + setup.id}>
                {getString(prefs.locale, this.compId, "progressBar_stopLoss_hint")}
              </UncontrolledTooltip>
            </Col>
            <Col className="text-right">
              <label id={"progressBar_end_" + setup.id}>
                {setup.ended_on ? setup.ended_on : this.handleKpiPresentation("currency", setup.target)}
              </label>
              <UncontrolledTooltip delay={{ show: 200 }} placement="top-end" target={"progressBar_end_" + setup.id}>
                {setup.ended_on ?
                  getString(prefs.locale, this.compId, "progressBar_endedOn_hint") :
                  getString(prefs.locale, this.compId, "progressBar_target_hint")
                }
              </UncontrolledTooltip>
            </Col>
          </Row>
          {/* Progress Bar */}
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
        </div>
      </li >
    )
  }
}

export default SetupCard;

SetupCard.propTypes = {
  managers: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  setup: PropTypes.object.isRequired,
  isPurchase: PropTypes.bool.isRequired
}
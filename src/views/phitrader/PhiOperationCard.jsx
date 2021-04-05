import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
// reactstrap components
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Col,
  Collapse,
  NavItem,
  NavLink,
  Nav,
  Progress,
  Row,
  TabContent,
  TabPane,
  UncontrolledTooltip
} from "reactstrap";

import TimeManager from "../../core/managers/TimeManager";
import { convertFloatToCurrency, convertFloatToPercentage, getObjPropByStringPath } from "../../core/utils"

class PhiOperationCard extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase();

    this.state = {
      isOpen: undefined,

      activeNavId: "summary",
    }
  }

  handleKpiPresentation(format, kpiValue, includePlusMinus = false) {
    let strKpi = ""
    let currency = this.props.operation.currency

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

  badgeStatusColor(operation) {
    let color = "default"

    switch (operation.status) {
      case "gain":
        color = "success"
        break;
      case "loss":
        color = "danger"
        break;
    }

    return color
  }
  progressColor(operation) {
    let color = undefined

    switch (operation.status) {
      case "waiting":
        color = "warning"
        break;
      case "canceled":
        color = undefined
        break;
      case "in_progress":
        color = "success"

        if (operation.type == "purchase") {
          if (operation.asset_price > operation.last_entry_price)
            color = "success"
          else if (operation.asset_price > operation.last_stop_loss)
            color = "warning"
        }
        else {
          if (operation.asset_price < operation.last_entry_price)
            color = "success"
          else if (operation.asset_price < operation.last_stop_loss)
            color = "warning"
        }
        break;
      case "gain":
        color = "success"
        break;
      case "loss":
        color = "danger"
        break;
    }

    return color;
  }
  progressText(operation) {
    let { prefs, getString } = this.props;
    let text = undefined

    switch (operation.status) {
      case "gain":
        text = getString(prefs.locale, this.compId, "label_gain")
        break;
      case "loss":
        text = getString(prefs.locale, this.compId, "label_loss")
        break;
      default:
        text = this.handleKpiPresentation("currency", operation.asset_price)
        break;
    }

    return text;
  }
  progressFootnote(operation) {
    let { prefs, getString } = this.props;
    let text = undefined

    switch (operation.status) {
      case "waiting":
        text = getString(prefs.locale, this.compId, "label_waiting")
        break;
      case "canceled":
        text = getString(prefs.locale, this.compId, "label_canceled")
        break;
      case "in_progress":
        if (operation.type == "long") {
          if (operation.asset_price < operation.last_entry_price)
            text = getString(prefs.locale, this.compId, "label_buyingArea")
        }
        else {
          if (operation.asset_price > operation.last_entry_price)
            text = getString(prefs.locale, this.compId, "label_sellingArea")
        }
        break;
    }

    return text;
  }
  progressBarValue(operation) {
    let barValue = undefined

    switch (operation.status) {
      case "waiting":
        barValue = operation.delta.stopLoss_assetPrice
        break;

      case "in_progress":
        barValue = operation.delta.stopLoss_assetPrice
        break;

      case "gain":
        barValue = operation.delta.stopLoss_target
        break;

      case "loss":
        barValue = operation.delta.stopLoss_target
        break;
    }

    return barValue;
  }
  makeDescriptionPretty(operation) {
    // It accepts only 1 variable per paragragh

    let { prefs, getString } = this.props
    let p = 1
    let paragraphs = []
    let paragraph = getString(prefs.locale, "technicalconditions", String(operation.tc_id + "_p" + p))

    while (paragraph) {
      let variable = paragraph.match(/<(.*)>/)

      if (variable) {
        let value = getObjPropByStringPath(operation, variable[1])
        paragraph = paragraph.replace(variable[0], value)
      }
      paragraphs.push(paragraph)

      p += 1
      paragraph = getString(prefs.locale, "technicalconditions", [operation.tc_id + "_p" + p])
    }

    return paragraphs.map((paragragh, key) => {
      return (
        <label key={key}>
          {paragragh}
        </label>
      )
    });
  }

  miniBadges(operation) {
    let { prefs, getString } = this.props;
    let elements = []

    // Success Rate
    elements.push(
      <>
        <Badge
          id={"badge__successRate__hint" + operation.id}
          pill
          color="default"
        >
          {this.handleKpiPresentation("percentage", operation.success_rate)}
        </Badge>
        <UncontrolledTooltip placement="right-end" target={"badge__successRate__hint" + operation.id}>
          {getString(prefs.locale, this.compId, "successRate_hint")}
        </UncontrolledTooltip>
      </>
    )

    // Gain/Loss Percentage
    elements.push(
      <>
        <Badge
          id={"badge__gainPercent__hint" + operation.id}
          pill
          color={operation.status === "loss" ? "danger" : "success"}
        >
          {operation.status === "loss" ?
            this.handleKpiPresentation("percentage", operation.last_loss_percent * -1, true) :
            this.handleKpiPresentation("percentage", operation.last_gain_percent, true)}
        </Badge>
        <UncontrolledTooltip placement="right-end" target={"badge__gainPercent__hint" + operation.id}>
          {operation.status === "loss" ?
            getString(prefs.locale, this.compId, "lossPercent_hint") :
            getString(prefs.locale, this.compId, "gainPercent_hint")
          }
        </UncontrolledTooltip>
      </>
    )

    return elements.reverse().map((badge, i) => {
      return (
        <span key={i}>
          {badge}
          {" "}
        </span>
      )
    })
  }

  navItems() {
    let { prefs, getString } = this.props;
    let { activeNavId } = this.state;

    return (
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
      </Nav>
    )
  }
  navContents(operation) {
    let { prefs, getString } = this.props;
    let { activeNavId } = this.state;

    return (
      <TabContent id={"tab-content_" + operation.id} activeTab={activeNavId}>
        {/* Summary */}
        <TabPane tabId="summary" role="tabpanel">
          {/* Entry Price */}
          <Row className="justify-content-center">
            <Col lg="4" md="6" className="ml-auto mr-auto">
              <label>
                {getString(prefs.locale, this.compId, "label_entryPrice")}
                {" "}
                <i id={"entryPrice_hint_" + operation.id} className="nc-icon nc-alert-circle-i" />
              </label>
              <UncontrolledTooltip placement="right-end" target={"entryPrice_hint_" + operation.id}>
                {getString(prefs.locale, this.compId, "entryPrice_hint")}
              </UncontrolledTooltip>
            </Col>
            <Col lg="3" md="5" className="ml-auto mr-auto text-right">
              <label className="numbers">
                {this.handleKpiPresentation("currency", operation.last_entry_price)}
              </label>
            </Col>
          </Row>
          {/* Stop Loss */}
          <Row>
            <Col lg="4" md="6" className="ml-auto mr-auto">
              <label>
                {getString(prefs.locale, this.compId, "label_stopLoss")}
                {" "}
                <i id={"stopLoss_hint_" + operation.id} className="nc-icon nc-alert-circle-i" />
              </label>
              <UncontrolledTooltip placement="right-end" target={"stopLoss_hint_" + operation.id}>
                {getString(prefs.locale, this.compId, "stopLoss_hint")}
              </UncontrolledTooltip>
            </Col>
            <Col lg="3" md="5" className="ml-auto mr-auto text-right">
              <label className="numbers">
                {this.handleKpiPresentation("currency", operation.last_stop_loss)}
              </label>
            </Col>
          </Row>
          {/* Target */}
          <Row>
            <Col lg="4" md="6" className="ml-auto mr-auto" >
              <label>
                {getString(prefs.locale, this.compId, "label_target")}
                {" "}
                <i id={"target_hint" + operation.id} className="nc-icon nc-alert-circle-i" />
              </label>
              <UncontrolledTooltip placement="right-end" target={"target_hint" + operation.id}>
                {getString(prefs.locale, this.compId, "target_hint")}
              </UncontrolledTooltip>
            </Col>
            <Col lg="3" md="5" className="ml-auto mr-auto text-right">
              <label className="numbers">
                {this.handleKpiPresentation("currency", operation.last_target)}
              </label>
            </Col>
          </Row>
          {/* Gain Percent / Loss Percent*/}
          <Row>
            <Col lg="4" md="6" className="ml-auto mr-auto">
              <label className={operation.status === "loss" ? "text-danger" : "text-success"}>
                {operation.status === "loss" ?
                  getString(prefs.locale, this.compId, "label_lossPercent") :
                  getString(prefs.locale, this.compId, "label_gainPercent")
                }
                {" "}
                <i id={"gainlossPercent_hint" + operation.id} className="nc-icon nc-alert-circle-i" />
              </label>
              <UncontrolledTooltip placement="right-end" target={"gainlossPercent_hint" + operation.id}>
                {operation.status === "loss" ?
                  getString(prefs.locale, this.compId, "lossPercent_hint") :
                  getString(prefs.locale, this.compId, "gainPercent_hint")
                }
              </UncontrolledTooltip>
            </Col>
            <Col lg="3" md="5" className="ml-auto mr-auto text-right">
              <label className={"numbers " + (operation.status === "loss" ? "text-danger" : "text-success")}>
                {operation.status === "loss" ?
                  this.handleKpiPresentation("percentage", operation.last_loss_percent) :
                  this.handleKpiPresentation("percentage", operation.last_gain_percent)
                }
              </label>
            </Col>
          </Row>
          {/* Risk / Reward */}
          <Row>
            <Col lg="4" md="6" className="ml-auto mr-auto">
              <label>
                {getString(prefs.locale, this.compId, "label_riskReward")}{" "}
                <i id={"riskReward_hint" + operation.id} className="nc-icon nc-alert-circle-i" />
              </label>
              <UncontrolledTooltip placement="right-end" target={"riskReward_hint" + operation.id}>
                {getString(prefs.locale, this.compId, "riskReward_hint")}
              </UncontrolledTooltip>
            </Col>
            <Col lg="3" md="5" className="ml-auto mr-auto text-right">
              <label className="numbers">
                {this.handleKpiPresentation("number", operation.last_risk_reward)}
              </label>
            </Col>
          </Row>
        </TabPane>
        {/* Technical Condition */}
        <TabPane tabId="technicalCondition" role="tabpanel">
          <Row className="justify-content-center">
            <Col className="text-center">
              {this.makeDescriptionPretty(operation)}
            </Col>
          </Row>
          <Row className="mt-4" />
          {/* Success Rate */}
          <Row>
            <Col lg="4" md="6" className="ml-auto mr-auto">
              <label>
                {getString(prefs.locale, this.compId, "label_successRate")}{" "}
                <i id={"successRate_hint" + operation.id} className="nc-icon nc-alert-circle-i" />
              </label>
              <UncontrolledTooltip placement="right-end" target={"successRate_hint" + operation.id}>
                {getString(prefs.locale, this.compId, "successRate_hint")}
              </UncontrolledTooltip>
            </Col>
            <Col lg="3" md="5" className="ml-auto mr-auto text-right">
              <label id={"successRate_value_hint" + operation.id} className="numbers">
                {operation.success_rate ?
                  this.handleKpiPresentation("percentage", operation.success_rate) :
                  getString(prefs.locale, this.compId, "label_notAvailableData")
                }
              </label>
              {!operation.success_rate &&
                <UncontrolledTooltip placement="left-end" target={"successRate_value_hint" + operation.id}>
                  {getString(prefs.locale, this.compId, "notAvailableData_hint")}
                </UncontrolledTooltip>
              }
            </Col>
          </Row>
          {/* Estimated Time */}
          <Row>
            <Col lg="4" md="6" className="ml-auto mr-auto">
              <label>
                {getString(prefs.locale, this.compId, "label_estimatedTime")}{" "}
                <i id={"estimatedTime_hint" + operation.id} className="nc-icon nc-alert-circle-i" />
              </label>
              <UncontrolledTooltip placement="right-end" target={"estimatedTime_hint" + operation.id}>
                {getString(prefs.locale, this.compId, "estimatedTime_hint")}
              </UncontrolledTooltip>
            </Col>
            <Col lg="3" md="5" className="ml-auto mr-auto text-right">
              <label id={"estimatedTime_value_hint" + operation.id} className="numbers">
                {operation.avg_duration_gain ?
                  operation.avg_duration_gain + " " + getString(prefs.locale, "generic", "label_days") :
                  getString(prefs.locale, this.compId, "label_notAvailableData")
                }
              </label>
              {!operation.avg_duration_gain &&
                <UncontrolledTooltip placement="left-end" target={"estimatedTime_value_hint" + operation.id}>
                  {getString(prefs.locale, this.compId, "notAvailableData_hint")}
                </UncontrolledTooltip>
              }
            </Col>
          </Row>
          {/* Occurrencies */}
          <Row>
            <Col lg="4" md="6" className="ml-auto mr-auto">
              <label>
                {getString(prefs.locale, this.compId, "label_occurrencies")}{" "}
                <i id={"occurrencies_hint" + operation.id} className="nc-icon nc-alert-circle-i" />
              </label>
              <UncontrolledTooltip placement="right-end" target={"occurrencies_hint" + operation.id}>
                {getString(prefs.locale, this.compId, "occurrencies_hint")}
              </UncontrolledTooltip>
            </Col>
            <Col lg="3" md="5" className="ml-auto mr-auto text-right">
              <label className="numbers">
                {operation.occurrencies}
              </label>
            </Col>
          </Row>
          {/* Last Occurrence */}
          <Row>
            <Col lg="4" md="6" className="ml-auto mr-auto">
              <label>
                {getString(prefs.locale, this.compId, "label_lastOccurrence")}{" "}
                <i id={"lastOccurrence_hint" + operation.id} className="nc-icon nc-alert-circle-i" />
              </label>
              <UncontrolledTooltip placement="right-end" target={"lastOccurrence_hint" + operation.id}>
                {getString(prefs.locale, this.compId, "lastOccurrence_hint")}
              </UncontrolledTooltip>
            </Col>
            <Col lg="3" md="5" className="ml-auto mr-auto text-right">
              <label id={"lastOccurrence_value_hint" + operation.id} className="numbers">
                {operation.last_ended_occurrence ?
                  TimeManager.getLocaleDateString(operation.last_ended_occurrence, false) :
                  getString(prefs.locale, this.compId, "label_notAvailableData")
                }
              </label>
              {!operation.last_ended_occurrence &&
                <UncontrolledTooltip placement="left-end" target={"lastOccurrence_value_hint" + operation.id}>
                  {getString(prefs.locale, this.compId, "notAvailableData_hint")}
                </UncontrolledTooltip>
              }
            </Col>
          </Row>
        </TabPane>
        <Row className="mt-3" />
      </TabContent>
    )
  }
  progressBar(operation) {
    let { prefs, getString } = this.props;

    return (
      <>
        <Row>
          {/* Stop Loss */}
          <Col>
            <label id={"progressBar__stop_loss__" + operation.id}>
              {this.handleKpiPresentation("currency", operation.last_stop_loss)}
            </label>
            <UncontrolledTooltip placement="right-end" target={"progressBar__stop_loss__" + operation.id}>
              {getString(prefs.locale, this.compId, "progressBar_stopLoss_hint")}
            </UncontrolledTooltip>
          </Col>
          {/* Target or Ended On */}
          <Col className="text-right">
            <label id={"progressBar__target__" + operation.id}>
              {this.handleKpiPresentation("currency", operation.last_target)}
            </label>
            <UncontrolledTooltip placement="left-end" target={"progressBar__target__" + operation.id}>
              {getString(prefs.locale, this.compId, "progressBar_target_hint")}
            </UncontrolledTooltip>
          </Col>
        </Row>
        <Progress
          className={operation.ended_on ? "" : "text-right"}
          animated={operation.ended_on ? false : true}
          color={this.progressColor(operation)}
          value={this.progressBarValue(operation)}
          max={operation.delta.stopLoss_target}>
          {this.progressText(operation)}
        </Progress>

        {/* Data bellow Progress Bar */}
        <Row>
          {/* Radar On / Started On */}
          <Col>
            <label id={"progressBar__radarOn__" + operation.id}>
              <i className="far fa-clock" />
              {" "}
              {operation.radar_on}
            </label>
            <UncontrolledTooltip placement="right-start" target={"progressBar__radarOn__" + operation.id}>
              {getString(prefs.locale, this.compId, "radarOn_hint")}
            </UncontrolledTooltip>
          </Col>
          {/* Target or Ended On */}
          <Col className="text-right">
            {operation.ended_on &&
              <>
                <label id={"progressBar__ended_on__" + operation.id}>
                  {operation.ended_on}
                  {" "}
                  <i className="far fa-clock" />
                </label>
                <UncontrolledTooltip placement="left-start" target={"progressBar__ended_on__" + operation.id}>
                  {getString(prefs.locale, this.compId, "progressBar_endedOn_hint")}
                </UncontrolledTooltip>
              </>
            }
          </Col>
        </Row>
      </>
    )
  }

  open() {
    this.setState({ isOpen: true })
  }
  toggleCollapse() {
    this.setState({ isOpen: !this.state.isOpen })
  }
  toggleNavLink(navId, value) {
    this.setState({ [navId]: value })
  }

  render() {
    let { prefs, getString, operation } = this.props;
    let { isOpen } = this.state;

    return (
      <Card className={classnames("card-stats-mini", !isOpen && "cursor-pointer")}>
        <CardHeader className={isOpen ? "cursor-pointer" : ""} onClick={() => this.toggleCollapse()}>
          <Row>
            <Col>
              <Button
                className="btn-round"
                size="sm"
                color={this.badgeStatusColor(operation)}
                outline={!operation.ended_on}
                id={`status__${operation.id}`}
              >
                <small>{getString(prefs.locale, "phitrader", [`item_${operation.status}`])}</small>
              </Button>
              {["canceled"].includes(operation.status) &&
                <UncontrolledTooltip placement="right-start" target={`status__${operation.id}`}>
                  {getString(prefs.locale, this.compId, `status_${operation.status}_hint`)}
                </UncontrolledTooltip>
              }
            </Col>
            <Col className="text-right">
              <Collapse isOpen={!isOpen}>
                {this.miniBadges(operation)}
              </Collapse>
              <Collapse isOpen={isOpen}>
                <Button
                  className="btn-icon btn-round"
                  size="sm"
                  color="default"
                  outline
                >
                  <i className="nc-icon nc-simple-delete" />
                </Button>
              </Collapse>
            </Col>
          </Row>
        </CardHeader>
        <CardBody onClick={() => this.open()}>

          {/* Asset Name */}
          <Collapse isOpen={isOpen}>
            <label className="description">
              {operation.asset_name}
            </label>
          </Collapse>

          <Row>
            {/* Asset Label */}
            <Col md="3" xs="6">
              <CardTitle tag="h3" className="description title">
                {operation.asset_label}
              </CardTitle>
            </Col>
            {/* Detailed Operation Data */}
            <Col md="9" className="justify-content-end">
              <Collapse isOpen={isOpen}>
                {this.navItems()}
                <Row className="mt-3" />
                {this.navContents(operation)}
              </Collapse>
            </Col>
          </Row>

          {/* Progress Bar */}
          <Row className="justify-content-end">
            <Col md="9" xs="10">
              {this.progressBar(operation)}
            </Col>
          </Row>
        </CardBody>

        {/* Background Icon */}
        <div id={`type__${operation.id}`}
          className={classnames("icon-bg", operation.type == "long" ? "icon-success" : "icon-danger")}
        >
          {operation.type == "long" ?
            <i className="nc-icon nc-spaceship" /> :
            <i className="nc-icon nc-spaceship fa-rotate-90" />
          }
        </div>
        <UncontrolledTooltip placement="right" target={`type__${operation.id}`}>
          {operation.type == "long" ?
            getString(prefs.locale, this.compId, "icon_type_long_hint") :
            getString(prefs.locale, this.compId, "icon_type_short_hint")
          }
        </UncontrolledTooltip>
      </Card>
    )
  }
}

export default PhiOperationCard;

PhiOperationCard.propTypes = {
  managers: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  operation: PropTypes.object.isRequired
}
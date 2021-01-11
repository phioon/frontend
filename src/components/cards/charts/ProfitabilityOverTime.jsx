import React, { Component } from "react";
import PropTypes from "prop-types";

import { Line } from "react-chartjs-2";

import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Col,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  Row,
  UncontrolledTooltip,
  UncontrolledDropdown
} from "reactstrap";
import Skeleton from "react-loading-skeleton";

import ChartManager from "../../../core/managers/ChartManager";
import { convertFloatToCurrency, convertFloatToPercentage, deepCloneObj } from "../../../core/utils";

class ProfitabilityOverTime extends Component {
  constructor(props) {
    super(props);

    this.state = {
      interval: "monthly",
      selected: "overall",

      measures: props.measures,

      dimensionsLimit: ChartManager.amountOfAvailableColors(),

      currency: props.currency,
    };
  }
  componentDidUpdate(prevProps) {
    if (prevProps.pageFirstLoading !== this.props.pageFirstLoading)
      if (this.props.chart.daily.overall.data.labels.length <= 50) {
        // User has less than 50 days of data, so show daily interval
        this.changeChart("daily", undefined)
      }
  }

  changeChart(interval, selected) {
    if (interval)
      this.setState({ interval })
    if (selected)
      this.setState({ selected })
  }

  handleKpiPresentation(format, kpiValue, includePlusMinus = false) {
    let strKpi = ""
    let currency = this.state.currency

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

  render() {
    let {
      prefs,
      getString,
      pageFirstLoading,
      chart,
      measures
    } = this.props;

    let { interval, selected, dimensionsLimit } = this.state;

    return (
      <Card className="card-stats">
        <CardHeader>
          <Row>
            <Col>
              <UncontrolledDropdown>
                <DropdownToggle
                  caret
                  className="btn-round btn-sm"
                  color="default"
                  data-toggle="dropdown"
                  type="button"
                  outline
                >
                  <i className="far fa-clock" />
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem
                    onClick={() => this.changeChart("daily", undefined)}
                  >
                    {getString(prefs.locale, "charts", "dropdown_timeInterval_daily")}
                  </DropdownItem>
                  <DropdownItem
                    onClick={() => this.changeChart("monthly", undefined)}
                  >
                    {getString(prefs.locale, "charts", "dropdown_timeInterval_monthly")}
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </Col>
            <Col>
              <div className="pull-right">
                <Badge color={(measures.positions.result.percentage &&
                  measures.positions.result.percentage.data < 0 ?
                  "danger" : "success")} pill>
                  {this.handleKpiPresentation("percentage",
                    measures.positions.result.percentage && measures.positions.result.percentage.data,
                    true)
                  }
                </Badge>
              </div>
            </Col>
          </Row>
        </CardHeader>
        <CardBody>
          <h6 className="big-title">
            {getString(prefs.locale, "charts", "chart_profitability_title")}
          </h6>
          {
            pageFirstLoading ?
              <Skeleton height={277} />
              :
              <Line
                data={deepCloneObj(chart[interval][selected].data)}
                options={chart[interval][selected].options}
              />
          }
        </CardBody>
        <CardFooter>
          <hr />
          <Row>
            <Col className="text-right">
              <Button
                className={`btn-neutral btn-info ${selected === "groupByAsset" && "btn-round"}`}
                id="result_groupByAsset"
                color="info"
                size="sm"
                outline={selected === "groupByAsset"}
                onClick={() => this.changeChart(undefined, "groupByAsset")}
                disabled={
                  chart.monthly.groupByAsset.data.datasets &&
                    chart.monthly.groupByAsset.data.datasets.length < dimensionsLimit ?
                    false :
                    true
                }
              >
                {getString(prefs.locale, "charts", "label_assets")}
              </Button>
              <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target="result_groupByAsset">
                {chart.monthly.groupByAsset.data.datasets &&
                  chart.monthly.groupByAsset.data.datasets.length < dimensionsLimit ?
                  getString(prefs.locale, "charts", chart.daily.groupByAsset.hintId) :
                  getString(prefs.locale, "charts", "limitReached_asset_hint")
                }
              </UncontrolledTooltip>
              {" "}
              <Button
                className={`btn-neutral btn-info ${selected === "groupByWallet" && "btn-round"}`}
                id="result_groupByWallet"
                color="info"
                size="sm"
                outline={selected === "groupByWallet"}
                onClick={() => this.changeChart(undefined, "groupByWallet")}
                disabled={
                  chart.monthly.groupByWallet.data.datasets &&
                    chart.monthly.groupByWallet.data.datasets.length < dimensionsLimit ?
                    false :
                    true
                }
              >
                {getString(prefs.locale, "charts", "label_wallets")}
              </Button>
              <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target="result_groupByWallet">
                {
                  chart.monthly.groupByWallet.data.datasets &&
                    chart.monthly.groupByWallet.data.datasets.length < dimensionsLimit ?
                    getString(prefs.locale, "charts", chart.daily.groupByWallet.hintId) :
                    getString(prefs.locale, "charts", "limitReached_wallet_hint")
                }
              </UncontrolledTooltip>
              {" "}
              <Button
                className={`btn-neutral btn-info ${selected === "overall" && "btn-round"}`}
                color="info"
                id="result_overall"
                size="sm"
                outline={selected === "overall"}
                onClick={() => this.changeChart(undefined, "overall")}
              >
                {getString(prefs.locale, "charts", "label_overall")}
              </Button>
              <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target="result_overall">
                {getString(prefs.locale, "charts", chart.daily.overall.hintId)}
              </UncontrolledTooltip>
            </Col>
          </Row>
        </CardFooter>
      </Card>
    )
  }
}

export default ProfitabilityOverTime;

ProfitabilityOverTime.propTypes = {
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  pageFirstLoading: PropTypes.bool.isRequired,
  chart: PropTypes.object.isRequired,
  measures: PropTypes.object.isRequired,
  currency: PropTypes.object.isRequired
}
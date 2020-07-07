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

import { convertFloatToCurrency, convertFloatToPercentage, deepCloneObj } from "../../../core/utils";

class ProfitabilityOverTime extends Component {
  constructor(props) {
    super(props);
    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,
      pageFirstLoading: props.pageFirstLoading,

      chart: props.chart,
      interval: "monthly",
      selected: "overall",

      measures: props.measures,

      currency: props.currency,
    };
  }
  static getDerivedStateFromProps(props, state) {
    if (props.prefs.langId !== state.langId)
      return { langId: props.prefs.langId }
    if (props.pageFirstLoading !== state.pageFirstLoading)
      return {
        pageFirstLoading: props.pageFirstLoading,
        chart: props.chart,
        measures: props.measures,
        currency: props.currency
      }
    if (props.chart !== state.chart)
      return {
        pageFirstLoading: props.pageFirstLoading,
        chart: props.chart,
        measures: props.measures,
        currency: props.currency
      }

    return null
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
    let { getString } = this.props;
    let { langId, chart, interval, selected, measures, pageFirstLoading } = this.state;

    return (
      <Card className="card-stats">
        <CardHeader>
          <Row>
            <Col lg="6" md="6" sm="6" xs="6">
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
                    {getString(langId, "charts", "dropdown_timeInterval_daily")}
                  </DropdownItem>
                  <DropdownItem
                    onClick={() => this.changeChart("monthly", undefined)}
                  >
                    {getString(langId, "charts", "dropdown_timeInterval_monthly")}
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </Col>
            <Col lg="6" md="6" sm="6" xs="6">
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
            {getString(langId, "charts", "chart_title_profitability")}
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
            <Col md="3">
              <div className="stats">
                <i className="fa fa-cube" />
                {getString(langId, "charts", "label_groupBy")}:
                    </div>
            </Col>
            <Col md="9" className="text-right">
              <Button
                className="btn-link"
                color="primary"
                id="result_groupByAsset"
                size="sm"
                type="button"
                onClick={() => this.changeChart(undefined, "groupByAsset")}
              >
                {getString(langId, "charts", "label_assets")}
              </Button>
              <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target="result_groupByAsset">
                {getString(langId, "charts", chart.daily.groupByAsset.hintId)}
              </UncontrolledTooltip>
              <Button
                className="btn-link"
                color="primary"
                id="result_groupByWallet"
                size="sm"
                type="button"
                onClick={() => this.changeChart(undefined, "groupByWallet")}
              >
                {getString(langId, "charts", "label_wallets")}
              </Button>
              <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target="result_groupByWallet">
                {getString(langId, "charts", chart.daily.groupByWallet.hintId)}
              </UncontrolledTooltip>
              <Button
                className="btn-link"
                color="primary"
                id="result_overall"
                size="sm"
                type="button"
                onClick={() => this.changeChart(undefined, "overall")}
              >
                {getString(langId, "charts", "label_overall")}
              </Button>
              <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target="result_overall">
                {getString(langId, "charts", chart.daily.overall.hintId)}
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
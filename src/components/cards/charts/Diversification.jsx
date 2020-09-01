import React, { Component } from "react";
import PropTypes from "prop-types";

import { Polar } from "react-chartjs-2";
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

class Diversification extends Component {
  constructor(props) {
    super(props);
    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,
      pageFirstLoading: props.pageFirstLoading,

      chart: props.chart,
      interval: "generic",
      selected: "groupBySector",

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
    let { langId, pageFirstLoading, chart, measures, interval, selected, } = this.state;

    return (
      <Card className="card-stats">
        <CardHeader>
          <Row>
            <Col>
              <div className="pull-right">
                <Badge color="primary" pill>
                  {this.handleKpiPresentation("percentage",
                    measures.positions.result.percentage && measures.positions.result.percentage.data,
                    true
                  )}
                </Badge>
              </div>
            </Col>
          </Row>
        </CardHeader>
        <CardBody>
          <h6 className="big-title">
            {getString(langId, "charts", "chart_title_diversification")}
          </h6>
          {
            pageFirstLoading ?
              <div className="centered">
                <Skeleton circle={true} height={277} width={277} />
              </div>
              :
              <Polar
                data={deepCloneObj(chart[interval][selected].data)}
                options={chart[interval][selected].options}
              />
          }
        </CardBody>
        <CardFooter>
          <hr />
          <Row>
            <Col xl="4" md="4">
              <label className="stats">
                <i className="fa fa-cube" />
                {getString(langId, "charts", "label_groupBy")}:
              </label>
            </Col>
            <Col className="text-right">
              <Button
                className="btn-link"
                color="primary"
                id="amountInvested_groupByAsset"
                size="sm"
                type="button"
                onClick={() => this.changeChart(undefined, "groupByAsset")}
              >
                {getString(langId, "charts", "label_assets")}
              </Button>
              <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target="amountInvested_groupByAsset">
                {getString(langId, "charts", chart.generic.groupByAsset.hintId)}
              </UncontrolledTooltip>
              <Button
                className="btn-link"
                id="amountInvested_groupBySector"
                color="primary"
                size="sm"
                type="button"
                onClick={() => this.changeChart(undefined, "groupBySector")}
              >
                {getString(langId, "charts", "label_sectors")}
              </Button>
              <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target="amountInvested_groupBySector">
                {getString(langId, "charts", chart.generic.groupBySector.hintId)}
              </UncontrolledTooltip>
              <Button
                className="btn-link"
                color="primary"
                id="amountInvested_groupByCountry"
                size="sm"
                type="button"
                onClick={() => this.changeChart(undefined, "groupByCountry")}
              >
                {getString(langId, "charts", "label_countries")}
              </Button>
              <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target="amountInvested_groupByCountry">
                {getString(langId, "charts", chart.generic.groupByCountry.hintId)}
              </UncontrolledTooltip>
            </Col>
          </Row>
        </CardFooter>
      </Card>
    )
  }
}

export default Diversification;

Diversification.propTypes = {
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  pageFirstLoading: PropTypes.bool.isRequired,
  chart: PropTypes.object.isRequired,
  measures: PropTypes.object.isRequired,
  currency: PropTypes.object.isRequired
}
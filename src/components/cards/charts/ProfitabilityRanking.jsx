import React, { Component } from "react";
import PropTypes from "prop-types";

import { HorizontalBar } from "react-chartjs-2";
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

class ProfitabilityRanking extends Component {
  constructor(props) {
    super(props);
    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,
      pageFirstLoading: props.pageFirstLoading,

      chart: props.chart,
      interval: "generic",
      selected: "groupByAsset",
      rankingType: "top",         // TOP or BOTTOM
      rankingSize: "5",

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

  changeChart(interval, selected, rankingType, rankingSize) {
    if (interval)
      this.setState({ interval })
    if (selected)
      this.setState({ selected })
    if (rankingType)
      this.setState({ rankingType })
    if (rankingSize)
      this.setState({ rankingSize })
  }

  reverseRanking(rankingType) {
    if (rankingType == "top")
      rankingType = "bottom"
    else
      rankingType = "top"

    this.setState({ rankingType })
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
    let { langId, pageFirstLoading, chart, interval, selected, rankingType, rankingSize } = this.state;

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
                  <i className="fas fa-trophy" />
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem
                    onClick={() => this.changeChart(undefined, undefined, undefined, "5")}
                  >
                    {getString(langId, "charts", "dropdown_timeInterval_top5")}
                  </DropdownItem>
                  <DropdownItem
                    onClick={() => this.changeChart(undefined, undefined, undefined, "10")}
                  >
                    {getString(langId, "charts", "dropdown_timeInterval_top10")}
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </Col>
            <Col lg="6" md="6" sm="6" xs="6" className="text-right">
              <label className="stats">
                {getString(langId, "charts", "label_order")}:
              </label>
              {" "}
              <Button
                className="btn-link"
                color=""
                id="profitabilityRanking_orderBy_hint"
                size="mm"
                type="button"
                onClick={() => this.reverseRanking(rankingType)}
              >
                {rankingType == "top" ?
                  <i className="fas fa-sort-amount-up-alt" /> :
                  <i className="fas fa-sort-amount-up" />
                }
              </Button>
              <UncontrolledTooltip delay={{ show: 200 }} placement="top" target="profitabilityRanking_orderBy_hint">
                {rankingType == "top" ?
                  getString(langId, "charts", "profitabilityRanking_lesser_hint") :
                  getString(langId, "charts", "profitabilityRanking_greater_hint")
                }
              </UncontrolledTooltip>
            </Col>
          </Row>
        </CardHeader>
        <CardBody>
          <h6 className="big-title">
            {getString(langId, "charts", "chart_title_profitabilityRanking")}
          </h6>
          {
            pageFirstLoading ?
              <Skeleton height={277} />
              :
              <HorizontalBar
                data={deepCloneObj(chart[interval][selected][rankingType + rankingSize].data)}
                options={chart[interval][selected][rankingType + rankingSize].options}
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
                id="profitabilityRanking_groupByAsset"
                size="sm"
                type="button"
                onClick={() => this.changeChart(undefined, "groupByAsset")}
              >
                {getString(langId, "charts", "label_assets")}
              </Button>
              <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target="profitabilityRanking_groupByAsset">
                {getString(langId, "charts", chart.generic.groupByAsset.hintId)}
              </UncontrolledTooltip>
              <Button
                className="btn-link"
                color="primary"
                id="profitabilityRanking_groupByWallet"
                size="sm"
                type="button"
                onClick={() => this.changeChart(undefined, "groupByWallet")}
              >
                {getString(langId, "charts", "label_wallets")}
              </Button>
              <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target="profitabilityRanking_groupByWallet">
                {getString(langId, "charts", chart.generic.groupByAsset.hintId)}
              </UncontrolledTooltip>
            </Col>
          </Row>
        </CardFooter>
      </Card>
    )
  }
}

export default ProfitabilityRanking;

ProfitabilityRanking.propTypes = {
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  pageFirstLoading: PropTypes.bool.isRequired,
  chart: PropTypes.object.isRequired,
  currency: PropTypes.object.isRequired
}
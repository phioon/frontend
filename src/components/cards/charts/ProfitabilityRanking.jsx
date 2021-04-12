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
      interval: "generic",
      selected: "groupByAsset",
      rankingType: "top",         // 'top' or 'bottom'
      rankingSize: "5",
    };
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
    let {
      prefs,
      getString,
      pageFirstLoading,
      chart,
    } = this.props;

    let { interval, selected, rankingType, rankingSize } = this.state;

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
                  <i className="fas fa-trophy" />
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem
                    onClick={() => this.changeChart(undefined, undefined, undefined, "5")}
                  >
                    {getString(prefs.locale, "charts", "dropdown_timeInterval_top5")}
                  </DropdownItem>
                  <DropdownItem
                    onClick={() => this.changeChart(undefined, undefined, undefined, "10")}
                  >
                    {getString(prefs.locale, "charts", "dropdown_timeInterval_top10")}
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </Col>
            <Col className="text-right">
              <label className="stats">
                {getString(prefs.locale, "charts", "label_order")}:
              </label>
              {" "}
              <Button
                className="btn-icon btn-round"
                color="default"
                id="profitabilityRanking_orderBy_hint"
                size="sm"
                outline
                onClick={() => this.reverseRanking(rankingType)}
              >
                {rankingType == "top" ?
                  <i className="fas fa-sort-amount-up-alt" /> :
                  <i className="fas fa-sort-amount-up" />
                }
              </Button>
              <UncontrolledTooltip placement="top" target="profitabilityRanking_orderBy_hint">
                {rankingType == "top" ?
                  getString(prefs.locale, "charts", "profitabilityRanking_lesser_hint") :
                  getString(prefs.locale, "charts", "profitabilityRanking_greater_hint")
                }
              </UncontrolledTooltip>
            </Col>
          </Row>
        </CardHeader>
        <CardBody>
          <h6 className="big-title">
            {getString(prefs.locale, "charts", "chart_profitabilityRanking_title")}
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
            <Col className="text-right">
              <Button
                className={`btn-neutral btn-info ${selected === "groupByAsset" && "btn-round"}`}
                color="primary"
                id="profitabilityRanking_groupByAsset"
                size="sm"
                outline={selected === "groupByAsset"}
                onClick={() => this.changeChart(undefined, "groupByAsset")}
              >
                {getString(prefs.locale, "charts", "label_assets")}
              </Button>
              {" "}
              <UncontrolledTooltip placement="bottom-end" target="profitabilityRanking_groupByAsset">
                {getString(prefs.locale, "charts", chart.generic.groupByAsset.hintId)}
              </UncontrolledTooltip>
              <Button
                className={`btn-neutral btn-info ${selected === "groupByWallet" && "btn-round"}`}
                color="primary"
                id="profitabilityRanking_groupByWallet"
                size="sm"
                outline={selected === "groupByWallet"}
                onClick={() => this.changeChart(undefined, "groupByWallet")}
              >
                {getString(prefs.locale, "charts", "label_wallets")}
              </Button>
              <UncontrolledTooltip placement="bottom-end" target="profitabilityRanking_groupByWallet">
                {getString(prefs.locale, "charts", chart.generic.groupByAsset.hintId)}
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
  prefs: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  pageFirstLoading: PropTypes.bool.isRequired,
  chart: PropTypes.object.isRequired,
  currency: PropTypes.object.isRequired
}
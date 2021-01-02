import React, { Component } from "react";
import PropTypes from "prop-types";

import { Line } from "react-chartjs-2";

import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  CardFooter,
  Col,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  Row,
  UncontrolledDropdown
} from "reactstrap";
import Skeleton from "react-loading-skeleton";

import { convertFloatToCurrency, convertFloatToPercentage, deepCloneObj } from "../../../core/utils";

class UsageOverTime extends Component {
  constructor(props) {
    super(props);

    this.state = {
      interval: "generic",
      selected: "overall",
    };
  }

  changeChart(interval, selected) {
    if (interval)
      this.setState({ interval })
    if (selected)
      this.setState({ selected })
  }

  handleKpiPresentation(format, kpiValue, includePlusMinus = false) {
    let strKpi = ""
    let currency = this.props.currency

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

    let { interval, selected } = this.state;

    return (
      <Card className="card-chart">
        <CardHeader>
          <h6 className="big-title">
            {getString(prefs.locale, "charts", "chart_usage_title")}
          </h6>
          <p className="card-description">
            {getString(prefs.locale, "charts", "chart_usage_desc")}
          </p>
        </CardHeader>
        <CardBody>
          {
            pageFirstLoading ?
              <Skeleton height={187} /> :
              <Line
                data={deepCloneObj(chart[interval][selected].data)}
                options={chart[interval][selected].options}
              />
          }
        </CardBody>
      </Card>
    )
  }
}

export default UsageOverTime;

UsageOverTime.propTypes = {
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  pageFirstLoading: PropTypes.bool.isRequired,
  chart: PropTypes.object.isRequired,
}
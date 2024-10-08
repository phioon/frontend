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
  Row,
  UncontrolledTooltip,
} from "reactstrap";
import Skeleton from "react-loading-skeleton";

import { convertFloatToCurrency, convertFloatToPercentage, deepCloneObj } from "../../../core/utils";

class Diversification extends Component {
  constructor(props) {
    super(props);
    this.state = {
      interval: "generic",
      selected: "groupBySector",
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
    let { currency } = this.props;

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
    let { getString, prefs, pageFirstLoading, chart, measures } = this.props;
    let { interval, selected } = this.state;

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
            {getString(prefs.locale, "charts", "chart_diversification_title")}
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
            <Col className="text-right">
              <Button
                className={`btn-neutral btn-info ${selected === "groupByAsset" && "btn-round"}`}
                color="info"
                id="amountInvested_groupByAsset"
                size="sm"
                outline={selected === "groupByAsset"}
                onClick={() => this.changeChart(undefined, "groupByAsset")}
              >
                {getString(prefs.locale, "charts", "label_assets")}
              </Button>
              <UncontrolledTooltip placement="bottom-end" target="amountInvested_groupByAsset">
                {getString(prefs.locale, "charts", chart.generic.groupByAsset.hintId)}
              </UncontrolledTooltip>
              {" "}
              <Button
                className={`btn-neutral btn-info ${selected === "groupBySector" && "btn-round"}`}
                id="amountInvested_groupBySector"
                color="info"
                size="sm"
                outline={selected === "groupBySector"}
                onClick={() => this.changeChart(undefined, "groupBySector")}
              >
                {getString(prefs.locale, "charts", "label_sectors")}
              </Button>
              <UncontrolledTooltip placement="bottom-end" target="amountInvested_groupBySector">
                {getString(prefs.locale, "charts", chart.generic.groupBySector.hintId)}
              </UncontrolledTooltip>
              {" "}
              <Button
                className={`btn-neutral btn-info ${selected === "groupByCountry" && "btn-round"}`}
                color="info"
                id="amountInvested_groupByCountry"
                size="sm"
                outline={selected === "groupByCountry"}
                onClick={() => this.changeChart(undefined, "groupByCountry")}
              >
                {getString(prefs.locale, "charts", "label_countries")}
              </Button>
              <UncontrolledTooltip placement="bottom-end" target="amountInvested_groupByCountry">
                {getString(prefs.locale, "charts", chart.generic.groupByCountry.hintId)}
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
  prefs: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  pageFirstLoading: PropTypes.bool.isRequired,
  chart: PropTypes.object.isRequired,
  measures: PropTypes.object.isRequired,
  currency: PropTypes.object.isRequired
}
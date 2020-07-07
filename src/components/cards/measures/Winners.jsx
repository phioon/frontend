import React, { Component } from "react";
import PropTypes from "prop-types";

import { Button, Card, CardBody, CardTitle, CardFooter, Col, Row, UncontrolledTooltip } from "reactstrap";
import Skeleton from "react-loading-skeleton";

import { convertFloatToCurrency, convertFloatToPercentage } from "../../../core/utils";

class Winners extends Component {
  constructor(props) {
    super(props);
    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,

      pageFirstLoading: props.pageFirstLoading,

      measure: props.measure,
      format: "percentage",

      currency: props.currency,
    };
  }
  static getDerivedStateFromProps(props, state) {
    if (props.prefs.langId !== state.langId)
      return { langId: props.prefs.langId }
    if (props.pageFirstLoading !== state.pageFirstLoading)
      return {
        pageFirstLoading: props.pageFirstLoading,
        measure: props.measure,
        currency: props.currency
      }
    if (props.measure !== state.measure)
      return {
        pageFirstLoading: props.pageFirstLoading,
        measure: props.measure,
        currency: props.currency
      }

    return null
  }

  changeKpiFormat(newFormat) {
    this.setState({ format: newFormat })
  }

  handleMeasurePresentation(measure, format) {
    let kpiValue = measure[format] && measure[format].data
    let strKpi = this.handleKpiPresentation(format, kpiValue)

    return strKpi
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
    let { langId, measure, format, pageFirstLoading } = this.state;

    return (
      <Card className="card-stats">
        <CardBody>
          <Row>
            <Col md="3" xs="4">
              <div className="icon-big text-center">
                <i className="nc-icon nc-trophy text-warning" />
              </div>
            </Col>
            <Col md="9" xs="8">
              <div className="numbers">
                <p className="card-category">
                  {pageFirstLoading ?
                    <Skeleton /> :
                    getString(langId, "measures", measure.id + "_kpi_label")
                  }
                </p>
                <CardTitle tag="p" className={
                  !pageFirstLoading && measure.percentage.data < 20 ?
                    "text-danger" : "text-success"}>
                  {pageFirstLoading ?
                    <Skeleton /> :
                    this.handleMeasurePresentation(measure, format)
                  }
                </CardTitle>
              </div>
            </Col>
          </Row>
        </CardBody>
        <br />
        <CardFooter>
          <hr />
          <Row>
            <Col>
              <div className="stats">
                <i className="fa fa-wrench" />
                {getString(langId, "measures", "label_format")}:
                    </div>
            </Col>
            <Col className="text-right">
              <Button
                className="btn-icon btn-link"
                color="primary"
                id={measure.id + "__percentage"}
                value="%"
                size="sm"
                type="button"
                onClick={() => this.changeKpiFormat("percentage")}
              >
                %
              </Button>
              <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={measure.id + "__percentage"}>
                {measure.percentage &&
                  getString(langId, "measures", measure.percentage.hintId)
                }
              </UncontrolledTooltip>
              <Button
                className="btn-icon btn-link"
                color="warning"
                id={measure.id + "__number"}
                size="sm"
                type="button"
                onClick={() => this.changeKpiFormat("number")}
              >
                #
              </Button>
              <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={measure.id + "__number"}>
                {measure.number &&
                  getString(langId, "measures", measure.number.hintId)
                }
              </UncontrolledTooltip>
            </Col>
          </Row>
        </CardFooter>
      </Card>
    )
  }
}

export default Winners;

Winners.propTypes = {
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  pageFirstLoading: PropTypes.bool.isRequired,
  measure: PropTypes.object.isRequired,
  currency: PropTypes.object.isRequired
}
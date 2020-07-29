import React, { Component } from "react";
import PropTypes from "prop-types";

import { Button, Card, CardBody, CardTitle, CardFooter, Col, Row, UncontrolledTooltip } from "reactstrap";
import Skeleton from "react-loading-skeleton";

class AmountInvested extends Component {
  constructor(props) {
    super(props);
    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,

      pageFirstLoading: props.pageFirstLoading,

      measure: props.measure,
      format: "currency",

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

  render() {
    let { getString, managers } = this.props;
    let { langId, pageFirstLoading, measure, format, currency } = this.state;

    return (
      <Card className="card-stats">
        <CardBody>
          <Row>
            <Col md="3" xs="4">
              <div className="icon-big text-center">
                <i className="nc-icon nc-globe text-warning" />
              </div>
            </Col>
            <Col md="9" xs="8">
              <div className="numbers">
                <p className="card-category">
                  {pageFirstLoading ?
                    <Skeleton /> :
                    <>
                      {getString(langId, "measures", measure.id + "_kpi_label") + " "}
                      <i id={measure.id + "_title_hint"} className="nc-icon nc-alert-circle-i" />
                      <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={measure.id + "_title_hint"}>
                        {getString(langId, "measures", measure.id + "_title_hint")}
                      </UncontrolledTooltip>
                    </>
                  }
                </p>
                <CardTitle tag="p">
                  {pageFirstLoading ?
                    <Skeleton /> :
                    managers.measure.handleMeasurePresentation(measure, format, currency)
                  }
                </CardTitle>
              </div>
            </Col>
          </Row>
          <Row>
            <Col className="text-right">
              {format == "percentage" &&
                measure.percentage.data > 100 ? (
                  <>
                    <i id={measure.id + "_alert"} className="nc-icon nc-alert-circle-i text-warning" />
                    <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={measure.id + "_alert"}>
                      {getString(langId, "measures", measure.id + "_alert_walletBallance")}
                    </UncontrolledTooltip>
                  </>
                ) : <br />}
            </Col>
          </Row>
        </CardBody>
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
                color="success"
                id={measure.id + "__currency"}
                size="sm"
                type="button"
                onClick={() => this.changeKpiFormat("currency")}
              >
                $
              </Button>
              <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={measure.id + "__currency"}>
                {measure.currency &&
                  getString(langId, "measures", measure.currency.hintId)
                }
              </UncontrolledTooltip>
            </Col>
          </Row>
        </CardFooter>
      </Card>
    )
  }
}

export default AmountInvested;

AmountInvested.propTypes = {
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  managers: PropTypes.object.isRequired,
  pageFirstLoading: PropTypes.bool.isRequired,
  measure: PropTypes.object.isRequired,
  currency: PropTypes.object.isRequired
}
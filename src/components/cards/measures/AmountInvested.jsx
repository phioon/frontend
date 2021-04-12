import React, { Component } from "react";
import PropTypes from "prop-types";

import { Button, Card, CardBody, CardTitle, CardFooter, Col, Row, UncontrolledTooltip } from "reactstrap";
import Skeleton from "react-loading-skeleton";

class AmountInvested extends Component {
  constructor(props) {
    super(props);

    this.state = {
      format: "currency",
    };
  }

  changeKpiFormat(newFormat) {
    this.setState({ format: newFormat })
  }

  render() {
    let { prefs, getString, managers, pageFirstLoading, measure, currency } = this.props;
    let { format } = this.state;

    return (
      <Card className="card-stats">
        <CardBody>
          <Row>
            <Col xl="2" lg="2" md="3" xs="4">
              <div className="icon-big text-center align-content-center">
                <i className="nc-icon nc-globe text-warning" />
              </div>
            </Col>
            <Col xl="10" lg="10" md="9" xs="8">
              <div className="numbers">
                <p className="card-category">
                  {pageFirstLoading ?
                    <span style={{ paddingLeft: "7%" }}><Skeleton /></span> :
                    <>
                      {getString(prefs.locale, "measures", measure.id + "_kpi_label") + " "}
                      <i id={measure.id + "_title_hint"} className="nc-icon nc-alert-circle-i" />
                      <UncontrolledTooltip placement="top-end" target={measure.id + "_title_hint"}>
                        {getString(prefs.locale, "measures", measure.id + "_title_hint")}
                      </UncontrolledTooltip>
                    </>
                  }
                </p>
                <CardTitle tag="p">
                  {pageFirstLoading ?
                    <span style={{ paddingLeft: "7%" }}><Skeleton /></span> :
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
                    <UncontrolledTooltip placement="bottom-end" target={measure.id + "_alert"}>
                      {getString(prefs.locale, "measures", measure.id + "_alert_walletBallance")}
                    </UncontrolledTooltip>
                  </>
                ) : <br />}
            </Col>
          </Row>
        </CardBody>
        <CardFooter>
          <hr />
          <Row >
            <Col className="text-right">
              <Button
                className={`btn-icon btn-neutral btn-info ${format === "percentage" && "btn-round"}`}
                color="info"
                id={measure.id + "__percentage"}
                size="sm"
                outline={format === "percentage"}
                onClick={() => this.changeKpiFormat("percentage")}
              >
                %
              </Button>
              <UncontrolledTooltip placement="bottom-end" target={measure.id + "__percentage"}>
                {measure.percentage &&
                  getString(prefs.locale, "measures", measure.percentage.hintId)
                }
              </UncontrolledTooltip>
              {" "}
              <Button
                className={`btn-icon btn-neutral btn-success ${format === "currency" && "btn-round"}`}
                color="success"
                id={measure.id + "__currency"}
                size="sm"
                outline={format === "currency"}
                onClick={() => this.changeKpiFormat("currency")}
              >
                $
              </Button>
              <UncontrolledTooltip placement="bottom-end" target={measure.id + "__currency"}>
                {measure.currency &&
                  getString(prefs.locale, "measures", measure.currency.hintId)
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
  prefs: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  managers: PropTypes.object.isRequired,
  pageFirstLoading: PropTypes.bool.isRequired,
  measure: PropTypes.object.isRequired,
  currency: PropTypes.object.isRequired
}
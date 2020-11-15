import React, { Component } from "react";
import PropTypes from "prop-types";

import { Button, Card, CardBody, CardTitle, CardFooter, Col, Row, UncontrolledTooltip } from "reactstrap";
import Skeleton from "react-loading-skeleton";

class OpCost extends Component {
  constructor(props) {
    super(props);

    this.state = {
      format: "percentage",
    };
  }

  changeKpiFormat(newFormat) {
    this.setState({ format: newFormat })
  }

  render() {
    let { prefs, getString, managers, pageFirstLoading, measure, currency } = this.props;
    let { format, } = this.state;

    return (
      <Card className="card-stats">
        <CardBody>
          <Row>
            <Col xl="2" lg="2" md="3" xs="4">
              <div className="icon-big text-center">
                <i className="nc-icon nc-settings text-danger" />
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
                      <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={measure.id + "_title_hint"}>
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
        </CardBody>
        <br />
        <CardFooter>
          <hr />
          <Row>
            <Col>
              <label className="stats">
                <i className="fa fa-wrench" />
                {getString(prefs.locale, "measures", "label_format")}:
              </label>
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
                  getString(prefs.locale, "measures", measure.percentage.hintId)
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

export default OpCost;

OpCost.propTypes = {
  prefs: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  managers: PropTypes.object.isRequired,
  pageFirstLoading: PropTypes.bool.isRequired,
  measure: PropTypes.object.isRequired,
  currency: PropTypes.object.isRequired
}
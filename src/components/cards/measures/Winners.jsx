import React, { Component } from "react";
import PropTypes from "prop-types";

import { Button, Card, CardBody, CardTitle, CardFooter, Col, Row, UncontrolledTooltip } from "reactstrap";
import Skeleton from "react-loading-skeleton";

class Winners extends Component {
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
    let { format } = this.state;

    return (
      <Card className="card-stats">
        <CardBody>
          <Row>
            <Col xl="2" lg="2" md="3" xs="4">
              <div className="icon-big text-center">
                <i className="nc-icon nc-trophy text-warning" />
              </div>
            </Col>
            <Col xl="10" lg="10" md="9" xs="8">
              <div className="numbers">
                <p className="card-category">
                  {pageFirstLoading ?
                    <span style={{ paddingLeft: "7%" }}><Skeleton /></span> :
                    getString(prefs.locale, "measures", measure.id + "_kpi_label")
                  }
                </p>
                <CardTitle tag="p" className={
                  !pageFirstLoading && measure.percentage.data < 20 ?
                    "text-danger" : "text-success"}>
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
            <Col className="text-right">
              <Button
                className={`btn-icon btn-neutral btn-info ${format === "percentage" && "btn-round"}`}
                color="info"
                id={measure.id + "__percentage"}
                value="%"
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
                className={`btn-icon btn-neutral btn-warning ${format === "number" && "btn-round"}`}
                color="warning"
                id={measure.id + "__number"}
                size="sm"
                outline={format === "number"}
                onClick={() => this.changeKpiFormat("number")}
              >
                #
              </Button>
              <UncontrolledTooltip placement="bottom-end" target={measure.id + "__number"}>
                {measure.number &&
                  getString(prefs.locale, "measures", measure.number.hintId)
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
  prefs: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  managers: PropTypes.object.isRequired,
  pageFirstLoading: PropTypes.bool.isRequired,
  measure: PropTypes.object.isRequired,
  currency: PropTypes.object.isRequired
}
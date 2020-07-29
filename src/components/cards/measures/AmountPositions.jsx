import React, { Component } from "react";
import PropTypes from "prop-types";

import { Button, Card, CardBody, CardTitle, CardFooter, Col, Row, UncontrolledTooltip } from "reactstrap";
import Skeleton from "react-loading-skeleton";

class AmountPositions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,

      pageFirstLoading: props.pageFirstLoading,

      measure: props.measure,
      format: "number",

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
                <i className="nc-icon nc-tile-56 text-primary" />
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
                <CardTitle tag="p">
                  {pageFirstLoading ?
                    <Skeleton /> :
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
              <div className="stats">
                <i className="fa fa-wrench" />
                {getString(langId, "measures", "label_format")}:
              </div>
            </Col>
            <Col className="text-right">
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

export default AmountPositions;

AmountPositions.propTypes = {
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  managers: PropTypes.object.isRequired,
  pageFirstLoading: PropTypes.bool.isRequired,
  measure: PropTypes.object.isRequired,
  currency: PropTypes.object.isRequired
}
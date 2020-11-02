import React, { Component } from "react";
import PropTypes from "prop-types";
import Moment from "moment";

import { CardBody, Col, FormGroup, Row } from "reactstrap";
// react plugin used to create datetimepicker
import ReactDatetime from "react-datetime";
import LabelAlert from "../../../LabelAlert";

class PositionCloseInterval extends Component {
  constructor(props) {
    super(props);
    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,

      dimension: props.dimension,
    };
  }
  static getDerivedStateFromProps(props, state) {
    if (props.prefs.langId !== state.langId)
      return { langId: props.prefs.langId }
    if (props.dimension !== state.dimension)
      return { dimension: props.dimension }

    return null
  }

  getSelectedPositions(dateFrom, dateTo) {
    let { dimension } = this.state;
    let selection = []

    for (var obj of dimension.data) {
      let date = new Date(obj.value)
      if (dateFrom.isSameOrBefore(date) && dateTo.isSameOrAfter(date))
        selection.push(obj)
    }

    return selection
  }

  onSelectChange(fieldName, value) {
    let { langId, compId, dimension, dateFrom, dateTo } = this.state;
    let newState = {}
    let selection = []

    newState[fieldName] = value

    switch (fieldName) {
      case "dateFrom":
        newState[fieldName + "State"] = ""
        newState.alertState = ""
        newState.alertMsg = ""

        if (value) {
          if (value._isAMomentObject) {
            newState[fieldName + "State"] = "has-success"

            dateFrom = value.utc(true)
            dateTo = dateTo ? dateTo : Moment()

            selection = this.getSelectedPositions(dateFrom, dateTo)

            if (selection.length == 0) {
              newState.alertState = "has-danger"
              newState.alertMsg = this.props.getString(langId, compId, "alert_timeInterval_noPositions")
            }
          }
          else {
            newState[fieldName + "State"] = "has-danger"
            newState.alertState = "has-danger"
            newState.alertMsg = this.props.getString(langId, compId, "alert_timeInterval_invalidFormat")
          }
        }

        this.props.onSelectionChange(dimension.id, selection)
        break;

      case "dateTo":
        newState[fieldName + "State"] = ""
        newState.alertState = ""
        newState.alertMsg = ""

        if (value) {
          if (value._isAMomentObject) {
            newState[fieldName + "State"] = "has-success"

            dateFrom = dateFrom ? dateFrom : Moment("2001-01-01T00:00:00Z")
            dateTo = value.utc(true)

            selection = this.getSelectedPositions(dateFrom, dateTo)

            if (selection.length == 0) {
              newState.alertState = "has-danger"
              newState.alertMsg = this.props.getString(langId, compId, "alert_timeInterval_noPositions")
            }
          }
          else {
            newState[fieldName + "State"] = "has-danger"
            newState.alertState = "has-danger"
            newState.alertMsg = this.props.getString(langId, compId, "alert_timeInterval_invalidFormat")
          }
        }

        this.props.onSelectionChange(dimension.id, selection)
        break;
      default:
        break;
    }

    this.setState(newState)
  }
  isDateValid(fieldName, date) {
    let isValid = false
    var today = new Date()

    switch (fieldName) {
      case "dateFrom":
        let { dateTo: dateTo } = this.state

        if (dateTo)
          isValid = date.isBefore(today) && date.isBefore(dateTo) ? true : false
        else
          isValid = date.isBefore(today) ? true : false
        break
      case "dateTo":
        let { dateFrom: dateFrom } = this.state

        if (dateFrom)
          isValid = date.isAfter(dateFrom) ? true : false
        else
          isValid = true
        break;
      default:
        break;
    }
    return isValid
  }

  render() {
    let { getString } = this.props;
    let {
      langId,
      compId,

      dateFrom,
      dateFromState,
      dateTo,
      dateToState,

      alertMsg,
      alertState,
    } = this.state;

    return (
      <CardBody>
        <Row>
          <Col>
            <FormGroup className={`has-label ${dateFromState}`}>
              <label>{this.props.getString(langId, compId, "input_dateFrom")}</label>
              <ReactDatetime
                inputProps={{
                  className: "form-control form-text",
                  placeholder: this.props.getString(langId, "generic", "input_select")
                }}
                locale={getString(langId, "locales", langId)}
                value={dateFrom}
                onChange={value => this.onSelectChange("dateFrom", value)}
                isValidDate={value => this.isDateValid("dateFrom", value)}
                closeOnSelect
              />
            </FormGroup>
          </Col>
          <label className="centered">_</label>
          <Col>
            <FormGroup className={`has-label ${dateToState}`}>
              <label>{this.props.getString(langId, compId, "input_dateTo")}</label>
              <ReactDatetime
                inputProps={{
                  className: "form-control form-text",
                  placeholder: this.props.getString(langId, "generic", "input_select")
                }}
                locale={getString(langId, "locales", langId)}
                value={dateTo}
                onChange={value => this.onSelectChange("dateTo", value)}
                isValidDate={value => this.isDateValid("dateTo", value)}
                closeOnSelect
              />
            </FormGroup>
          </Col>
        </Row>
        <LabelAlert alertState={alertState} alertMsg={alertMsg} />
      </CardBody>
    )
  }
}

export default PositionCloseInterval;

PositionCloseInterval.propTypes = {
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  onSelectionChange: PropTypes.func.isRequired,
  dimension: PropTypes.object.isRequired
}
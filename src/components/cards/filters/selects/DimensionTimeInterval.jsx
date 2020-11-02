import React, { Component } from "react";
import PropTypes from "prop-types";
import Moment from "moment";

import { CardBody, Col, FormGroup, Row } from "reactstrap";
// react plugin used to create datetimepicker
import ReactDatetime from "react-datetime";
import LabelAlert from "../../../LabelAlert";

class DimentionTimeInterval extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  getSelectedPositions(dateFrom, dateTo) {
    let selection = []

    for (var obj of this.props.dimension.data) {
      let date = new Date(obj.value)
      if (dateFrom.isSameOrBefore(date) && dateTo.isSameOrAfter(date))
        selection.push(obj)
    }

    return selection
  }

  onSelectChange(fieldName, value) {
    let { getString, prefs, dimension, alertNoEntriesTxtId, alertInvalidFormatTxtId } = this.props;
    let { dateFrom, dateTo } = this.state;
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
              newState.alertMsg = getString(prefs.langId, "filtercard", alertNoEntriesTxtId)
            }
          }
          else {
            newState[fieldName + "State"] = "has-danger"
            newState.alertState = "has-danger"
            newState.alertMsg = getString(prefs.langId, "filtercard", alertInvalidFormatTxtId)
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
              newState.alertMsg = getString(prefs.langId, "filtercard", alertNoEntriesTxtId)
            }
          }
          else {
            newState[fieldName + "State"] = "has-danger"
            newState.alertState = "has-danger"
            newState.alertMsg = getString(prefs.langId, "filtercard", alertInvalidFormatTxtId)
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
        let { dateTo } = this.state

        if (dateTo)
          isValid = date.isBefore(today) && date.isBefore(dateTo) ? true : false
        else
          isValid = date.isBefore(today) ? true : false
        break
      case "dateTo":
        let { dateFrom } = this.state

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
    let { getString, prefs, dateFromTxtId, dateToTxtId } = this.props;
    let {
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
              <label>{getString(prefs.langId, "filtercard", dateFromTxtId)}</label>
              <ReactDatetime
                inputProps={{
                  className: "form-control form-text",
                  placeholder: getString(prefs.langId, "generic", "input_select")
                }}
                locale={getString(prefs.langId, "locales", prefs.langId)}
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
              <label>{getString(prefs.langId, "filtercard", dateToTxtId)}</label>
              <ReactDatetime
                inputProps={{
                  className: "form-control form-text",
                  placeholder: getString(prefs.langId, "generic", "input_select")
                }}
                locale={getString(prefs.langId, "locales", prefs.langId)}
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

export default DimentionTimeInterval;

DimentionTimeInterval.propTypes = {
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  dimension: PropTypes.object.isRequired,
  onSelectionChange: PropTypes.func.isRequired,

  dateFromTxtId: PropTypes.string.isRequired,
  dateToTxtId: PropTypes.string.isRequired,
}
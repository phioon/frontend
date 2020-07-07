import React, { Component } from "react";
import PropTypes from "prop-types";
import Moment from "moment";

import { Card, CardBody, CardHeader, CardTitle, Col, FormGroup, Row, UncontrolledTooltip } from "reactstrap";
import TagsInput from "react-tagsinput";
// react plugin used to create datetimepicker
import ReactDatetime from "react-datetime";
import LabelAlert from "../../LabelAlert";

class OpeningIntervalFilter extends Component {
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
    let iSelected = []

    for (var x = 0; x < dimension.data.length; x++) {
      let startedOn = new Date(dimension.data[x].name)
      if (dateFrom.isSameOrBefore(startedOn) && dateTo.isSameOrAfter(startedOn))
        iSelected.push(x)
    }
    return iSelected
  }

  onSelectChange(fieldName, value) {
    let { langId, compId, dimension, dateFrom, dateTo } = this.state;
    let newState = {}
    let iSelected = []

    newState[fieldName] = value

    if (value._isAMomentObject)
      newState[fieldName + "State"] = "has-success"
    else
      newState[fieldName + "State"] = "has-danger"

    switch (fieldName) {
      case "dateFrom":
        dateFrom = value
        dateTo = dateTo ? dateTo : Moment()

        if (value._isAMomentObject)
          iSelected = this.getSelectedPositions(dateFrom, dateTo)

        if (iSelected.length > 0) {
          newState.openingInterval_alertState = ""
          newState.openingInterval_alertMsg = ""
        }
        else {
          newState.openingInterval_alertState = "has-danger"
          newState.openingInterval_alertMsg = this.props.getString(langId, compId, "alert_timeInterval_noPositions")
        }

        this.props.onSelectionChange(dimension.id, iSelected)
        break;

      case "dateTo":
        dateFrom = dateFrom ? dateFrom : Moment("2001-01-01T00:00:00")
        dateTo = value

        if (value._isAMomentObject)
          iSelected = this.getSelectedPositions(dateFrom, dateTo)

        if (iSelected.length > 0) {
          newState.openingInterval_alertState = ""
          newState.openingInterval_alertMsg = ""
        }
        else {
          newState.openingInterval_alertState = "has-danger"
          newState.openingInterval_alertMsg = this.props.getString(langId, compId, "alert_timeInterval_noPositions")
        }

        this.props.onSelectionChange(dimension.id, iSelected)
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

  handleTagFilters(dimension) {
    this.setState({ dateFrom: null, dateTo: null })
    this.props.onSelectionChange(dimension.id, [])
  }

  render() {
    let { getString } = this.props;
    let {
      langId,
      compId,

      dimension,

      dateFrom,
      dateFromState,
      dateTo,
      dateToState,
      openingInterval_alertMsg,
      openingInterval_alertState,
    } = this.state;

    return (
      <Card>
        <CardHeader>
          <Row>
            <Col lg="9" md="9" sm="9" xs="9">
              <CardTitle className="card-category">
                {getString(langId, compId, "label_title")}
                {" "}
                <i id={"title_hint_" + dimension.id} className="nc-icon nc-alert-circle-i" />
                <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"title_hint_" + dimension.id}>
                  {getString(langId, compId, "title_hint")}
                </UncontrolledTooltip>
              </CardTitle>
            </Col>
            <Col lg="3" md="3" sm="3" xs="3" >
              <div>
                {dimension.selected.length > 0 ?
                  <TagsInput
                    renderTag={this.props.renderTagFilters}
                    disabled
                    value={[dimension.selected.length]}
                    onChange={() => this.handleTagFilters(dimension)}
                    tagProps={{ className: "react-tagsinput-tag" }}
                    inputProps={{ className: "react-tagsinput-input filter", placeholder: '' }}
                  /> :
                  null
                }
              </div>
            </Col>
          </Row>
        </CardHeader>
        <CardBody>
          <FormGroup className={`has-label ${dateFromState}`}>
            <ReactDatetime
              inputProps={{
                className: "form-control",
                placeholder: this.props.getString(langId, compId, "input_dateFrom")
              }}
              value={dateFrom}
              onChange={value => this.onSelectChange("dateFrom", value)}
              isValidDate={value => this.isDateValid("dateFrom", value)}
              closeOnSelect
            />
          </FormGroup>
          <FormGroup className={`has-label ${dateToState}`}>
            <ReactDatetime
              inputProps={{
                className: "form-control",
                placeholder: this.props.getString(langId, compId, "input_dateTo")
              }}
              value={dateTo}
              onChange={value => this.onSelectChange("dateTo", value)}
              isValidDate={value => this.isDateValid("dateTo", value)}
              closeOnSelect
            />
          </FormGroup>
          <LabelAlert alertState={openingInterval_alertState} alertMsg={openingInterval_alertMsg} />
        </CardBody>
      </Card>
    )
  }
}

export default OpeningIntervalFilter;

OpeningIntervalFilter.propTypes = {
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  onSelectionChange: PropTypes.func.isRequired,
  renderTagFilters: PropTypes.func.isRequired,
  dimension: PropTypes.object.isRequired
}
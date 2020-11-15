import React, { Component } from "react";
import PropTypes from "prop-types";

import { CardBody, FormGroup } from "reactstrap";
import Select from "react-select";
import LabelAlert from "../../../LabelAlert";

class DimensionSelect extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    let { getString, prefs, dimension, titleTxtId } = this.props;

    return (
      <CardBody>
        <FormGroup>
          <label>{getString(prefs.locale, "filtercard", titleTxtId)}</label>
          <Select
            key={`${dimension.id}_${new Date().getTime()}`}
            isMulti
            className="react-select"
            classNamePrefix="react-select"
            placeholder={getString(prefs.locale, "generic", "input_select")}
            closeMenuOnSelect={false}
            value={dimension.selected}
            options={dimension.data}
            noOptionsMessage={() => getString(prefs.locale, "filtercard", "input_periods_noOptions")}
            onChange={value => this.props.onSelectionChange(dimension.id, value)}
          />
        </FormGroup>
        <LabelAlert alertState={undefined} alertMsg={undefined} />
      </CardBody>
    )
  }
}

export default DimensionSelect;

DimensionSelect.propTypes = {
  prefs: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  dimension: PropTypes.object.isRequired,
  onSelectionChange: PropTypes.func.isRequired,
  titleTxtId: PropTypes.string.isRequired,
}
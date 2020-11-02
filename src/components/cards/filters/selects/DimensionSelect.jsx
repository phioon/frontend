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
          <label>{getString(prefs.langId, "filtercard", titleTxtId)}</label>
          <Select
            key={`${dimension.id}_${new Date().getTime()}`}
            isMulti
            className="react-select"
            classNamePrefix="react-select"
            placeholder={getString(prefs.langId, "generic", "input_select")}
            closeMenuOnSelect={false}
            value={dimension.selected}
            options={dimension.data}
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
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  dimension: PropTypes.object.isRequired,
  onSelectionChange: PropTypes.func.isRequired,
  titleTxtId: PropTypes.string.isRequired,
}
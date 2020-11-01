import React, { Component } from "react";
import PropTypes from "prop-types";

import { CardBody, FormGroup } from "reactstrap";
import Select from "react-select";
import LabelAlert from "../../../LabelAlert";

class DimensionSelect extends Component {
  render() {
    let { dimension } = this.props;

    return (
      <CardBody>
        <FormGroup>
          <label>{this.props.titleTxt}</label>
          <Select
            key={`${dimension.id}_${new Date().getTime()}`}
            isMulti
            className="react-select"
            classNamePrefix="react-select"
            placeholder={this.props.placeholderTxt}
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
  dimension: PropTypes.object.isRequired,
  onSelectionChange: PropTypes.func.isRequired,
}
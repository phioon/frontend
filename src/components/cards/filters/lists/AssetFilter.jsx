import React, { Component } from "react";
import PropTypes from "prop-types";

import { Card, CardBody, CardHeader, CardTitle, Col, Row, } from "reactstrap";
import TagsInput from "react-tagsinput";
import List from "react-list-select";

class AssetFilter extends Component {
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

  handleTagFilters(dimension) {
    this.props.onSelectionChange(dimension.id, [])
  }

  render() {
    let { getString } = this.props;
    let { langId, compId, dimension } = this.state;

    return (
      <Card>
        <CardHeader>
          <Row>
            <Col lg="9" md="9" sm="9" xs="9">
              <CardTitle className="card-category">{getString(langId, compId, "label_title")}</CardTitle>
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
          <List
            className="form-control react-select-list primary"
            items={dimension.items}
            selected={dimension.selected}
            disabled={[].concat.apply([], Object.values(dimension.disabled))}
            multiple={true}
            onChange={iSelected => this.props.onSelectionChange(dimension.id, iSelected)}
          />
        </CardBody>
      </Card>
    )
  }
}

export default AssetFilter;

AssetFilter.propTypes = {
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  dimension: PropTypes.object.isRequired,
  onSelectionChange: PropTypes.func.isRequired,
  renderTagFilters: PropTypes.func.isRequired,
}
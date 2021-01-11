import React from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardBody,
  Col,
  Row,
} from "reactstrap";

class RecentSearchItem extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase();

    this.state = {
      query: "",
    }
  }
  componentDidMount() {
    this.props.setNavbarTitleId(`title_${this.compId}`)
  }

  render() {
    let { prefs, getString } = this.props;

    return (
      <Card className="card-plain list-item">
        <CardBody>
          <a>
            Test
          </a>
        </CardBody>
      </Card>
    )
  }
}

export default RecentSearchItem;

RecentSearchItem.propTypes = {
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
}

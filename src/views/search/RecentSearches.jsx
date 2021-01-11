import React from "react";
import PropTypes from "prop-types";
import {
  Button,
  Col,
  Row,
} from "reactstrap";

import UserItem from "../../components/listItems/search/UserItem";
import StrategyItem from "../../components/listItems/search/StrategyItem";

class RecentSearches extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase();

    this.state = {
    }
  }
  componentDidMount() {
    this.props.setNavbarTitleId(`title_${this.compId}`)
  }

  onClick(action) {
    this.props.onClick(action);
  }

  renderItems(items) {
    return items.map((item, i) => {
      let element = null

      switch (item.context) {
        case "user":
          element = this.renderUser(item, i)
          break;
        case "strategy":
          element = this.renderStrategy(item, i)
          break;
      }

      return element
    })
  }
  renderStrategy(strategy, i) {
    return (
      <StrategyItem
        key={`strategy_${i}`}
        managers={this.props.managers}
        onClick={this.props.onClick}
        strategy={strategy}
        size="md"
        removableIndex={i}
      />
    )
  }
  renderUser(user, i) {
    return (
      <UserItem
        key={`user_${i}`}
        managers={this.props.managers}
        onClick={this.props.onClick}
        user={user}
        size="md"
        removableIndex={i}
      />
    )
  }

  render() {
    let { prefs, getString, items } = this.props;

    return (
      <div className="content">
        <Row className="justify-content-center">
          <Col lg="8">
            {this.renderItems(items)}
          </Col>
        </Row>
        <Row className="mt-5" />
        <Row className="justify-content-center">
          <Button className="btn-round"
            color="default"
            size="sm"
            outline
            onClick={() => this.onClick("clear")}
          >
            {getString(prefs.locale, this.compId, "btn_clear")}
          </Button>
        </Row>
      </div>
    )
  }
}

export default RecentSearches;

RecentSearches.propTypes = {
  managers: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  setNavbarTitleId: PropTypes.func.isRequired
}

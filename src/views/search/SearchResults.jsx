import React from "react";
import PropTypes from "prop-types";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Col,
  Row,
} from "reactstrap";
import { HorizontalLoader } from "../../components/Loaders";

import UserItem from "../../components/listItems/search/UserItem";
import StrategyItem from "../../components/listItems/search/StrategyItem";
import { getFirstAndLastName, getInitials } from "../../core/utils";

class SearchResults extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase();

    this.state = {
      isLoading: undefined,

      top: 5,
      results: this.defaultObject()
    }
  }
  componentDidMount() {
    // Because [this] only renders if sQuery's length > 0, this.componentDidUpdate() doesn't notice the first sQuery value
    // For this reason, we execute this.prepareRequirements() on both situations: componentDidMount() and componentDidUpdate()
    this.props.setNavbarTitleId(`title_${this.compId}`)
    this.prepareRequirements()
  }
  componentDidUpdate(prevProps) {
    if (prevProps.sQuery !== this.props.sQuery) {
      this.prepareRequirements()
    }
  }

  defaultObject() {
    return {
      users: [],
      strategies: []
    }
  }

  async prepareRequirements() {
    let { sQuery } = this.props;
    let { top, results } = this.state;
    this.setState({ isLoading: true })
    results = this.defaultObject()

    let result = await this.props.managers.search.multiSearch(sQuery, top)

    if (result.data) {
      // Request succeded...
      for (var k of Object.keys(results))
        if (result.data[k])
          results[k] = result.data[k]

      results.users = this.prepareUsers(results.users)
    }

    this.setState({ isLoading: false, results })
  }
  prepareUsers(users) {
    for (var user of users)
      user = this.getUserAdditionalInfo(user)

    return users
  }
  getUserAdditionalInfo(user) {
    user.full_name = getFirstAndLastName(`${user.first_name} ${user.last_name}`)
    user.initials = getInitials(user.full_name)

    return user
  }

  onClick(action) {
    this.props.onClick(action);
  }

  // Components
  renderUsersCard(prefs, getString, users, top) {
    return (
      <Card className="card-plain">
        <CardHeader>
          <Row>
            <Col>
              <h5><small><b>{getString(prefs.locale, this.compId, "card_users_title")}</b></small></h5>
            </Col>
            {users.length === top &&
              <Col className="text-right">
                <Button
                  className="btn-neutral description"
                  size="sm"
                  onClick={() => this.onClick("goToUserSeach")}
                >
                  {getString(prefs.locale, this.compId, "btn_seeMore")}
                </Button>
              </Col>
            }
          </Row>
        </CardHeader>
        <CardBody>
          {this.renderUsers(prefs, getString, users)}
        </CardBody>
      </Card>
    )
  }
  renderStrategiesCard(prefs, getString, strategies, top) {

    return (
      <Card className="card-plain">
        <CardHeader>
          <Row>
            <Col>
              <h5><small><b>{getString(prefs.locale, this.compId, "card_strategies_title")}</b></small></h5>
            </Col>
            {strategies.length === top &&
              <Col className="text-right">
                <Button
                  className="btn-neutral description"
                  size="sm"
                  onClick={() => this.onClick("goToStrategySearch")}
                >
                  {getString(prefs.locale, this.compId, "btn_seeMore")}
                </Button>
              </Col>
            }
          </Row>
        </CardHeader>
        <CardBody>
          {this.renderStrategies(prefs, getString, strategies)}
        </CardBody>
      </Card>
    )
  }

  renderUsers(prefs, getString, users) {
    return users.map((user, i) => (
      <UserItem
        key={`user_${i}`}
        size="sm"
        prefs={prefs}
        getString={getString}
        managers={this.props.managers}
        onClick={this.props.onClick}
        user={user}
      />
    ))
  }
  renderStrategies(prefs, getString, strategies) {
    return strategies.map((strategy, i) => (
      <StrategyItem
        key={`strategy_${i}`}
        size="sm"
        prefs={prefs}
        getString={getString}
        managers={this.props.managers}
        onClick={this.props.onClick}
        strategy={strategy}
      />
    ))
  }

  render() {
    let { prefs, getString } = this.props;
    let { isLoading, top, results } = this.state;

    return (
      <div className="content">
        <div className="centered">
          {isLoading && <HorizontalLoader size="sm" />}
        </div>
        <Row className="justify-content-center">
          <Col lg="5">
            {this.renderUsersCard(prefs, getString, results.users, top)}
          </Col>
          <Col lg="5">
            {this.renderStrategiesCard(prefs, getString, results.strategies, top)}
          </Col>
        </Row>
      </div>
    )
  }
}

export default SearchResults;

SearchResults.propTypes = {
  managers: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  setNavbarTitleId: PropTypes.func.isRequired
}

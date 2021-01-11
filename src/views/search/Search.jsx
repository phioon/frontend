import React from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardHeader,
  CardBody,
  Row,
} from "reactstrap";

import SearchResults from "./SearchResults";
import RecentSearches from "./RecentSearches";

class Search extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase();

    this.state = {
      recentSearches: []
    }

    this.onClick = this.onClick.bind(this);
  }
  componentDidMount() {
    this.props.setNavbarTitleId(`title_empty`)

    this.prepareRequirements()
  }

  prepareRequirements() {
    this.prepareRecentSearches()
  }
  async prepareRecentSearches() {
    let recentSearches = await this.props.managers.search.recentSearchList()

    this.setState({ recentSearches })
  }

  onClick(action, obj) {
    switch (action) {
      case "goToProfile":
        this.props.managers.search.recentSearchAdd(obj, "user")
        this.goToProfile(obj.username)
        break;
      case "goToStrategyPage":
        this.props.managers.search.recentSearchAdd(obj, "strategy")
        this.goToStrategyPage(obj.uuid)
        break;
      case "goToUserSeach":
        this.goToUserSeach()
        break;
      case "goToStrategySearch":
        this.goToStrategySearch()
        break;
      case "remove":
        // Here, [obj] means "index"...
        this.removeClick(obj)
        break;
      case "clear":
        this.clearClick()
        break;
    }
  }
  goToProfile(username) {
    let path = this.props.managers.app.userProfilePath(username)
    this.props.history.push(path)
  }
  goToStrategyPage(uuid) {
    let path = this.props.managers.app.strategyPagePath(uuid)
    this.props.history.push(path)
  }
  goToUserSeach() {
    let path = "/app/search/users/"
    this.props.history.push(path)
  }
  goToStrategySearch() {
    let path = "/app/search/strategies/"
    this.props.history.push(path)
  }
  async removeClick(index) {
    await this.props.managers.search.recentSearchRemove(index)
    this.prepareRecentSearches()
  }
  async clearClick() {
    await this.props.managers.search.recentSearchClear()
    this.prepareRecentSearches()
  }

  render() {
    let { prefs, getString, sQuery } = this.props;
    let { recentSearches } = this.state;

    return (
      <div className="content">
        {sQuery.length > 0 ?
          <SearchResults {...this.props} onClick={this.onClick} /> :

          recentSearches.length > 0 ?
            <RecentSearches {...this.props} items={recentSearches} onClick={this.onClick} /> :

            <Card className="card-plain">
              <Row className="mt-5" />
              <CardHeader>
                <h1 className="text-center">
                  <i className="nc-icon nc-zoom-split text-info" />
                </h1>
              </CardHeader>
              <CardBody className="text-center">
                <h3>{getString(prefs.locale, this.compId, "label_noRecentSearch_title")}</h3>
                <Row className="mt-4" />
                <p className="description">
                  {getString(prefs.locale, this.compId, "label_noRecentSearch_desc")}
                </p>
              </CardBody>
            </Card>
        }
      </div>
    )
  }
}

export default Search;

Search.propTypes = {
  managers: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  setNavbarTitleId: PropTypes.func.isRequired
}

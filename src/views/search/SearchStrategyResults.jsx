import React from "react";
import { Redirect } from "react-router-dom";
import PropTypes from "prop-types";

import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Col,
  Row,
} from "reactstrap";
import { HorizontalLoader } from "../../components/Loaders";
import Skeleton from "react-loading-skeleton";

import StrategyItem from "../../components/listItems/search/StrategyItem";
import { getPaginationCursor } from "../../core/utils";

class SearchStrategyResults extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase();

    this.state = {
      firstLoading: true,
      isLoading: undefined,
      redirectTo: undefined,

      results: [],
      nextCursor: undefined,
    }

    this.handleScroll = this.handleScroll.bind(this);
    this.onClick = this.onClick.bind(this);
  }
  componentDidMount() {
    document.getElementById("main-panel").addEventListener("scroll", this.handleScroll);

    this.props.setNavbarTitleId(`title_${this.compId}`);
    this.fetchNext()
  }
  componentDidUpdate(prevProps) {
    if (prevProps.sQuery !== this.props.sQuery) {
      this.goToSearch()
    }
  }
  componentWillUnmount() {
    document.getElementById("main-panel").removeEventListener("scroll", this.handleScroll);
  }

  handleScroll(e) {
    var node = e.target;
    let scrolled = (node.scrollHeight - node.scrollTop)
    let bottom = (scrolled - node.clientHeight) < 5;

    if (bottom) {
      this.fetchNext()
    }
  }
  goToSearch() {
    this.setState({ redirectTo: "/app/search/" })
  }

  async fetchNext() {
    let { sQuery } = this.props;
    let { firstLoading, results, nextCursor } = this.state;
    this.setState({ isLoading: true })

    if (!sQuery)
      this.goToSearch()
    else if (firstLoading || nextCursor) {
      let result = await this.props.managers.search.strategySearch(sQuery, nextCursor)

      if (result.status == 200) {
        let data = result.data
        results = results.concat(data.results)

        nextCursor = getPaginationCursor(data.next)
      }
    }

    this.setState({ firstLoading: false, isLoading: false, results, nextCursor })
  }

  onClick(action, obj) {
    switch (action) {
      case "goToStrategyPage":
        this.props.managers.search.recentSearchAdd(obj, "strategy")
        this.goToStrategyPage(obj.uuid)
        break;
    }
  }
  goToStrategyPage(uuid) {
    let path = this.props.managers.app.strategyPagePath(uuid)
    this.props.history.push(path)
  }

  // Components
  renderStrategies(strategies) {
    return strategies.map((strategy, i) => (
      <StrategyItem
        key={`strategy_${i}`}
        managers={this.props.managers}
        onClick={this.onClick}
        strategy={strategy}
        size="md"
      />
    ))
  }
  renderSkeletons(amount = 5) {
    let rows = [...new Array(amount)]

    return rows.map((prop, i) => {
      return (
        <Card key={`user_${i}`} className={`card-user-mini card-plain`}>
          <CardBody>
            <Row>
              <div className={`avatar-icon`}>
                <i />
              </div>
              <Col>
                <h5><Skeleton /></h5>
                <p><Skeleton /></p>
              </Col>
            </Row>
          </CardBody>
        </Card>
      )
    })
  }

  render() {
    let { prefs, getString, sQuery } = this.props;
    let { firstLoading, isLoading, redirectTo, results } = this.state;

    return (
      <div className="content">
        {redirectTo && <Redirect to={redirectTo} />}

        <Row className="justify-content-center">
          <Col lg="8">
            <Card className="card-plain">
              <CardHeader className="text-center">
                <h5><small>
                  <b>{getString(prefs.locale, this.compId, "title")}</b>
                  {" "}
                  {`"${sQuery}"`}
                </small></h5>
              </CardHeader>
              <CardBody>
                {firstLoading ?
                  this.renderSkeletons() :
                  this.renderStrategies(results)
                }
              </CardBody>
              <CardFooter>
                <div className="centered">
                  {!firstLoading && isLoading && <HorizontalLoader size="sm" />}
                </div>
              </CardFooter>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

export default SearchStrategyResults;

SearchStrategyResults.propTypes = {
  managers: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  setNavbarTitleId: PropTypes.func.isRequired
}

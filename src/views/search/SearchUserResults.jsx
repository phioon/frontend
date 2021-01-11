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

import UserItem from "../../components/listItems/search/UserItem";
import { getPaginationCursor, getFirstAndLastName, getInitials } from "../../core/utils";

class SearchUserResults extends React.Component {
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
      let result = await this.props.managers.search.userSearch(sQuery, nextCursor)

      if (result.status == 200) {
        let data = result.data
        data.results = this.prepareUsers(data.results)
        results = results.concat(data.results)

        nextCursor = getPaginationCursor(data.next)
      }
    }

    this.setState({ firstLoading: false, isLoading: false, results, nextCursor })
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

  onClick(action, obj) {
    switch (action) {
      case "goToProfile":
        this.props.managers.search.recentSearchAdd(obj, "user")
        this.goToProfile(obj.username)
        break;
    }
  }
  goToProfile(username) {
    let path = this.props.managers.app.userProfilePath(username)
    this.props.history.push(path)
  }

  // Components
  renderUsers(users) {
    return users.map((user, i) => (
      <UserItem
        key={`user_${i}`}
        managers={this.props.managers}
        onClick={this.onClick}
        user={user}
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
              <div className={`avatar-picture text-center centered`}>
                <span>...</span>
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
                  this.renderUsers(results)
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

export default SearchUserResults;

SearchUserResults.propTypes = {
  managers: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  setNavbarTitleId: PropTypes.func.isRequired
}

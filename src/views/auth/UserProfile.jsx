import React from "react";
import { Redirect } from "react-router-dom";
import PropTypes from "prop-types";
// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardFooter,
  Col,
  Row,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  UncontrolledDropdown,
  Spinner,
} from "reactstrap";
import Skeleton from "react-loading-skeleton";

import { getFirstAndLastName, getInitials, getValueListFromObjList, orderBy } from "../../core/utils";
import StrategyPopularItem from "../../components/listItems/StrategyPopularItem";

class UserProfile extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase()

    this.state = {
      pageFirstLoading: true,
      redirectTo: undefined,

      btnFollow_onHover: undefined,

      user: {
        initials: "",
        strategies: []
      },
      savedStrategyIds: [],

      popularShowMore: undefined,
    }

    this.onClick = this.onClick.bind(this)
  }
  componentDidMount() {
    this.props.setNavbarTitleId(`title_empty`)
    this.prepareRequirements()
  }
  componentDidUpdate(prevProps) {
    if (prevProps.match.params.username !== this.props.match.params.username)
      this.prepareRequirements()
  }

  async prepareRequirements() {
    let tasks = [
      this.prepareUser(),
      this.prepareSavedStrategies()
    ]
    await Promise.all(tasks)

    this.setState({ pageFirstLoading: false })
  }
  async prepareUser(syncFull = false) {
    let { user } = this.state;

    if (this.props.match.params.username) {
      // Set [username] value...
      user.username = this.props.match.params.username
    }
    else {
      // If [username] param was not given, set current user's...
      this.setState({ redirectTo: `/app/u/${this.props.user.username}/` })
    }

    let result = await this.props.managers.app.userProfileRetrieve(syncFull, user.username)

    if (result.data) {
      // Username found...
      user = result.data
      user = this.getUserAdditionalInfo(user)
      user.strategies = this.prepareStrategies(user.strategies)
    }
    else if (result.response.status == 404) {
      // Username doesn't exist...
      this.setState({ redirectTo: `/app/notfound/` })
    }

    console.log(user)

    this.setState({ user })
  }
  async prepareSavedStrategies() {
    let savedStrategies = await this.props.managers.app.savedStrategyData()
    let savedStrategyIds = getValueListFromObjList(savedStrategies, "id")

    this.setState({ savedStrategyIds })
  }
  prepareStrategies(strategies) {
    for (var strategy of strategies) {
      strategy.runs_last_30_days = strategy.stats.runs_last_30_days
      strategy.total_runs = strategy.stats.total_runs
    }

    strategies = orderBy(strategies, ["-runs_last_30_days", "name"])

    return strategies
  }
  getUserAdditionalInfo(user) {
    user.full_name = getFirstAndLastName(`${user.first_name} ${user.last_name}`)
    user.initials = this.returnUserInitals(user)

    return user
  }

  returnUserInitals(user) {
    let name = getFirstAndLastName(`${user.first_name} ${user.last_name}`)

    let userInitials = getInitials(name)

    return userInitials
  }

  onClick(action, obj) {
    switch (action) {
      case "run":
        this.runClick(obj)
        break;
      case "save":
        this.saveClick(obj)
        break;
      case "follow":
        this.followClick(obj)
        break;
      case "share":
        this.shareClick(obj.username)
        break;
    }
  }
  async saveClick(obj) {
    if (obj.isSaved)
      await this.props.managers.app.strategyUnsave(obj.id)
    else
      await this.props.managers.app.strategySave(obj.id)

    this.prepareSavedStrategies()
  }
  async followClick(user) {
    this.setState({ follow_isLoading: true })
    let result = undefined

    if (user.is_followed_by_me)
      result = await this.props.managers.app.userUnfollow(user.username)
    else
      result = await this.props.managers.app.userFollow(user.username)

    if (result.status == 200) {
      user = result.data
      let syncFull = true
      await this.prepareUser(syncFull)
    }

    this.setState({ follow_isLoading: false })
  }
  shareClick(username) {
    let { getString, prefs } = this.props;

    let profileLink = this.props.managers.app.userProfileLink(username)
    navigator.clipboard.writeText(profileLink)

    let message = getString(prefs.locale, this.compId, "label_shareLinkCopied")
    this.props.notify("br", "success", "nc-icon nc-send", "shareProfile", message)
  }

  renderMyActions(user) {
    let { getString, prefs } = this.props;

    return (
      <UncontrolledDropdown>
        {/* Edit Profile */}
        <Button
          className="btn-round"
          size="sm"
          color="default"
          outline
          onClick={() => this.props.history.push("/app/u/myaccount/")}
        >
          {getString(prefs.locale, this.compId, "label_editProfile")}
        </Button>
        {/* ... */}
        <DropdownToggle
          className="btn-sm btn-icon btn-round btn-simple"
          data-toggle="dropdown"
          type="button"
        >
          <i className="fas fa-ellipsis-h" />
        </DropdownToggle>
        <DropdownMenu right>
          <DropdownItem onClick={() => this.onClick("share", user)}>
            {getString(prefs.locale, this.compId, "label_share")}
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    )
  }
  renderTheirActions(user) {
    let { getString, prefs } = this.props;
    let { btnFollow_onHover, follow_isLoading } = this.state;

    return (
      <UncontrolledDropdown>
        {/* Follow */}
        <Button className="btn-round"
          size="sm"
          outline
          color={follow_isLoading ?
            "default" :
            user.is_followed_by_me ?
              btnFollow_onHover ?
                "danger" :
                "default" :
              "default"
          }
          onMouseOver={() => this.setState({ btnFollow_onHover: true })}
          onMouseOut={() => this.setState({ btnFollow_onHover: false })}
          onClick={() => this.onClick("follow", user)}
          disabled={follow_isLoading ? true : false}
        >
          {follow_isLoading ?
            <Spinner size="sm" /> :
            user.is_followed_by_me ?
              btnFollow_onHover ?
                getString(prefs.locale, this.compId, "label_unfollow") :
                getString(prefs.locale, this.compId, "label_following") :
              getString(prefs.locale, this.compId, "label_follow")
          }
        </Button>
        {/* ... */}
        <DropdownToggle
          className="btn-sm btn-icon btn-round btn-simple"
          data-toggle="dropdown"
          type="button"
        >
          <i className="fas fa-ellipsis-h" />
        </DropdownToggle>
        <DropdownMenu right>
          <DropdownItem onClick={() => this.onClick("share", user)}>
            {getString(prefs.locale, this.compId, "label_share")}
          </DropdownItem>
          <DropdownItem onClick={(e) => e.preventDefault()}>
            {getString(prefs.locale, this.compId, "label_report")}
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    )
  }
  renderPopularStrategies(strategies) {
    let { savedStrategyIds, popularShowMore } = this.state;
    let popularSize = popularShowMore ? 5 : 3

    return strategies.map((strategy, i) => {
      strategy.index = i + 1
      strategy.isSaved = savedStrategyIds.includes(strategy.id)

      if (i < popularSize)
        return (
          <StrategyPopularItem
            key={i}
            getString={this.props.getString}
            prefs={this.props.prefs}
            strategy={strategy}
            onClick={this.onClick}
          />
        )
    })
  }

  render() {
    let { getString, prefs, user: currentUser } = this.props;
    let {
      pageFirstLoading,
      redirectTo,

      user,

      popularShowMore,
    } = this.state;

    return (
      <div className="content">
        <Card className="card-plain card-user">
          <CardBody>
            <Row className="justify-content-center">
              {/* Avatar */}
              <Col xl="2" md="3" xs="4">
                <div className="author">
                  <a className="centered">
                    <span className="centered avatar">
                      <span>{user.initials}</span>
                    </span>
                  </a>
                </div>
              </Col>
              {/* Username and Name */}
              <Col xl="6" md="7" xs="8">
                <Row>
                  {/* Username */}
                  <Col xs="12">
                    <p className="description align-center">
                      {pageFirstLoading ?
                        <Skeleton /> :
                        `@${user.username}`
                      }
                    </p>
                  </Col>
                  {/* Full Name */}
                  <Col xs="12">
                    <a href="" onClick={e => e.preventDefault()}>
                      <h5 className="title">
                        {pageFirstLoading ?
                          <Skeleton /> :
                          user.full_name
                        }
                      </h5>
                    </a>
                  </Col>
                </Row>
                <Row>
                  {/* Button Actions */}
                  <Col className="text-right">
                    {currentUser.username === user.username ?
                      this.renderMyActions(user) :
                      this.renderTheirActions(user)
                    }
                  </Col>
                </Row>
              </Col>
            </Row>
            {/* Stats */}
            <hr />
            <div className="button-container">
              <Row>
                <Col className="ml-auto" lg="2" md="4" xs="5">
                  <h6>
                    {user.strategies.length} <br />
                    <small>{getString(prefs.locale, this.compId, "label_strategies")}</small>
                  </h6>
                </Col>
                <Col className="ml-auto mr-auto" lg="2" md="4" xs="5">
                  <h6>
                    {user.amount_following} <br />
                    <small>{getString(prefs.locale, this.compId, "label_following")}</small>
                  </h6>
                </Col>
                <Col className="mr-auto" lg="2" md="4">
                  <h6>
                    {user.amount_followers} <br />
                    <small>{getString(prefs.locale, this.compId, "label_followers")}</small>
                  </h6>
                </Col>
              </Row>
            </div>
            <hr />
          </CardBody>
        </Card>
        {/* Popular Strategies */}
        <Row>
          <Col md="8">
            <Card>
              <CardHeader>
                <CardTitle tag="h5">
                  {getString(prefs.locale, this.compId, "title_popularStrategies")}
                </CardTitle>
              </CardHeader>
              <CardBody>
                {this.renderPopularStrategies(user.strategies)}
              </CardBody>
              <CardFooter className="text-center">
                {user.strategies.length > 3 &&
                  <Button
                    className="btn-round"
                    color="info"
                    size="sm"
                    outline
                    onClick={() => this.setState({ popularShowMore: !popularShowMore })}
                  >
                    {popularShowMore ?
                      getString(prefs.locale, this.compId, "label_showLess") :
                      getString(prefs.locale, this.compId, "label_showMore")
                    }
                  </Button>
                }
              </CardFooter>
            </Card>
          </Col>
        </Row>
        {redirectTo && <Redirect to={redirectTo} />}
      </div>
    )
  }
}

export default UserProfile;

UserProfile.propTypes = {
  prefs: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  managers: PropTypes.object.isRequired,
  setNavbarTitleId: PropTypes.func.isRequired
}
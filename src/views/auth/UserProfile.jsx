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
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Row,
  UncontrolledDropdown,
  Spinner,
} from "reactstrap";
import Skeleton from "react-loading-skeleton";

import ModalFollowers from "../modals/auth/ModalFollowers";
import ModalStrategy from "../modals/strategy/ModalStrategy";
import ModalStrategyResults from "../modals/strategy/ModalStrategyResults";
import StrategyPopularItem from "../../components/listItems/StrategyPopularItem";
import {
  deepCloneObj,
  getFirstAndLastName,
  getInitials,
  getValueListFromObjList,
  getIconFromURL,
  orderBy
} from "../../core/utils";
import ModalFollowing from "../modals/auth/ModalFollowing";

class UserProfile extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase()

    this.state = {
      isPageLoading: true,
      isRunning: false,

      modal_followers_isOpen: false,
      modal_following_isOpen: false,
      modal_strategyDetail_isOpen: false,
      modal_strategyResults_isOpen: false,

      activeNavId: "overview",

      action: "view",
      objData: {},

      redirectTo: undefined,
      btnFollow_onHover: undefined,

      user: {
        initials: "",
        strategies: []
      },
      savedStrategyIds: [],

      selected: {
        strategy: { rules: "{}" },
      },

      popularShowMore: undefined,
    }

    this.setFlag = this.setFlag.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.onClick = this.onClick.bind(this)
  }
  componentDidMount() {
    this.props.setNavbarTitleId(`title_${this.compId}`)
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

    this.setState({ isPageLoading: false })
  }
  async prepareUser() {
    let { user } = this.state;

    if (this.props.match.params.username) {
      // Set [username] value...
      user.username = this.props.match.params.username
    }
    else {
      // [username] param was not given. Setting current user's...
      this.setState({ redirectTo: `/app/u/${this.props.user.username}/` })
    }

    let result = await this.props.managers.app.userProfileRetrieve(false, user.username)

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

    this.setState({ user })
  }
  async prepareSavedStrategies() {
    let savedStrategies = await this.props.managers.app.savedStrategyData()
    let savedStrategyIds = getValueListFromObjList(savedStrategies, "uuid")

    this.setState({ savedStrategyIds })
  }
  prepareStrategies(strategies) {
    for (var strategy of strategies) {
      strategy.runs_last_30_days = strategy.stats.usage.runs_last_30_days
      strategy.total_runs = strategy.stats.usage.total_runs
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
      case "view":
        this.viewClick(obj)
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
      case "goToProfile":
        this.goToProfile(obj.username)
        break;
      case "goToStrategyPage":
        this.goToStrategyPage(obj.uuid)
        break;
      case "showFollowers":
        this.toggleModal("followers")
        break;
      case "showFollowing":
        this.toggleModal("following")
        break;
      case "refreshProfile":
        this.prepareUser()
        break;
    }
  }
  runClick(obj) {
    let { selected } = this.state;

    selected.strategy = obj

    this.setState({ selected })
    this.toggleModal("strategyResults")
  }
  viewClick(obj) {
    let objData = {
      id: obj.id,
      name: obj.name,
      desc: obj.desc,
      type: obj.type,
      isDynamic: obj.is_dynamic,
      isPublic: obj.is_public,
      rules: obj.rules
    }

    this.setState({ action: "view", objData })
    this.toggleModal("strategyDetail")
  }
  async saveClick(obj) {
    if (obj.isSaved)
      await this.props.managers.app.strategyUnsave(obj.uuid)
    else
      await this.props.managers.app.strategySave(obj.uuid)

    this.prepareSavedStrategies()
  }
  async followClick(user) {
    this.setState({ isLoading_follow: true });
    let result = undefined

    if (user.is_followed_by_me)
      result = await this.props.managers.app.userUnfollow(user.username)
    else
      result = await this.props.managers.app.userFollow(user.username)

    if (result.status == 200) {
      this.prepareUser()
    }

    this.setState({ isLoading_follow: false })
  }
  shareClick(username) {
    let { getString, prefs } = this.props;

    let profileLink = this.props.managers.app.userProfileLink(username)
    navigator.clipboard.writeText(profileLink)

    let message = getString(prefs.locale, "generic", "label_sharedLinkCopied")
    this.props.notify("br", "success", "nc-icon nc-send", "shareProfile", message)
  }
  goToProfile(username) {
    let path = this.props.managers.app.userProfilePath(username)
    this.props.history.push(path)
  }
  goToStrategyPage(uuid) {
    let path = this.props.managers.app.strategyPagePath(uuid)
    this.props.history.push(path)
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
          className="btn-icon btn-round btn-simple btn-sm"
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
    let { btnFollow_onHover, isLoading_follow } = this.state;

    return (
      <UncontrolledDropdown>
        {/* Follow */}
        <Button className="btn-round"
          size="sm"
          outline
          color={isLoading_follow ?
            "default" :
            user.is_followed_by_me && btnFollow_onHover ?
              "danger" :
              user.is_a_follower && btnFollow_onHover ?
                "success" :
                "default"
          }
          onMouseOver={() => this.setState({ btnFollow_onHover: true })}
          onMouseOut={() => this.setState({ btnFollow_onHover: false })}
          onClick={() => this.onClick("follow", user)}
          disabled={isLoading_follow ? true : false}
        >
          {isLoading_follow ?
            <Spinner size="sm" /> :
            user.is_followed_by_me ?
              btnFollow_onHover ?
                getString(prefs.locale, this.compId, "label_unfollow") :
                getString(prefs.locale, this.compId, "label_following") :

              user.is_a_follower ?
                getString(prefs.locale, this.compId, "label_followBack") :
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
      </UncontrolledDropdown >
    )
  }

  overviewPane(isPageLoading, user, popularShowMore) {
    let { prefs, getString } = this.props;

    return (
      <TabPane tabId="overview">
        <Row>
          {/* Popular Strategies */}
          <Col md="8">
            <Card>
              <CardHeader>
                <CardTitle tag="h5">
                  {getString(prefs.locale, this.compId, "card_popularStrategies_title")}
                </CardTitle>
              </CardHeader>
              {isPageLoading ?
                <CardBody>
                  {this.descriptionSkeleton()}
                </CardBody> : <CardBody>
                  {this.popularStrategies(user.strategies)}
                </CardBody>
              }
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
      </TabPane>
    )
  }
  popularStrategies(strategies) {
    let { savedStrategyIds, popularShowMore, isRunning } = this.state;
    let popularSize = popularShowMore ? 5 : 3

    return strategies.map((strategy, i) => {
      strategy.index = i + 1
      strategy.isSaved = savedStrategyIds.includes(strategy.uuid)

      if (i < popularSize)
        return (
          <StrategyPopularItem
            key={i}
            managers={this.props.managers}
            getString={this.props.getString}
            prefs={this.props.prefs}
            notify={this.props.notify}
            strategy={deepCloneObj(strategy)}
            onClick={this.onClick}
            isRunning={isRunning}
          />
        )
    })
  }

  aboutPane(isLoading, user) {
    return (
      <TabPane tabId="about">
        <Row>
          {/* About */}
          <Col md="8">
            {this.bioCard(isLoading, user)}
          </Col>
          <Col md="4">
            {user.links && this.linksCard(user)}
          </Col>
        </Row>
      </TabPane>
    )
  }
  bioCard(isLoading, user) {
    let { getString, prefs } = this.props;

    return (
      <Card>
        <CardHeader>
          <CardTitle tag="h5">
            {getString(prefs.locale, this.compId, "card_bio_title")}
          </CardTitle>
        </CardHeader>
        {isLoading ?
          <CardBody>
            {this.descriptionSkeleton()}
          </CardBody> :
          <CardBody>
            <div className="typography-line">
              <pre className="description">
                {user.about_me}
              </pre>
            </div>
            {user.about_me.length > 0 ?
              <div className="description text-right">
                {`- `}
                <a
                  className="description"
                  href={this.props.managers.app.userProfilePath(user.username)}
                  onClick={e => {
                    e.preventDefault()
                    this.onClick("goToProfile", user)
                  }}
                >
                  @{user.username}
                </a>
              </div> :
              <div className="description text-center">
                {getString(prefs.locale, this.compId, "card_bio_noBio")}
              </div>
            }
          </CardBody>
        }
        <CardFooter />
      </Card>
    )
  }
  linksCard(user) {
    let { getString, prefs } = this.props;

    return (
      <Card>
        <CardHeader>
          <CardTitle tag="h5">
            {getString(prefs.locale, this.compId, "card_links_title")}
          </CardTitle>
        </CardHeader>
        <CardBody>
          {this.links(user.links)}
        </CardBody>
        <CardFooter />
      </Card>
    )
  }
  links(links) {
    return links.map((link, i) => {
      return (
        <a href={link.url} className="description" target="_blank">
          <Row key={i}>
            <Col xs="2">
              <Button className="btn-icon btn-neutral">
                <i className={getIconFromURL(link.url)} />
              </Button>
            </Col>
            <Col className="align-center">

              {link.name}

            </Col>
          </Row>
        </a>
      )
    })
  }
  descriptionSkeleton() {
    return (
      <div>
        <Skeleton />
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
    )
  }

  setFlag(context, value) {
    this.setState({ [`is${context}`]: value })
  }
  toggleModal(modalId) {
    this.setState({ [`modal_${modalId}_isOpen`]: !this.state[`modal_${modalId}_isOpen`] });
  };
  toggleNavLink(navId, value) {
    this.setState({ [navId]: value })
  }

  render() {
    let { getString, prefs } = this.props;
    let {
      redirectTo,
      isPageLoading,
      isRunning,

      modal_followers_isOpen,
      modal_following_isOpen,
      modal_strategyDetail_isOpen,
      modal_strategyResults_isOpen,

      activeNavId,

      action,
      objData,

      user,

      selected,

      popularShowMore,
    } = this.state;

    return (
      <div className="content">
        <ModalFollowing
          prefs={prefs}
          getString={getString}
          managers={this.props.managers}
          user={this.props.user}
          modalId="following"
          isOpen={modal_following_isOpen}
          toggleModal={this.toggleModal}
          onClick={this.onClick}
          username={user.username}
        />
        <ModalFollowers
          prefs={prefs}
          getString={getString}
          managers={this.props.managers}
          user={this.props.user}
          modalId="followers"
          isOpen={modal_followers_isOpen}
          toggleModal={this.toggleModal}
          onClick={this.onClick}
          username={user.username}
        />
        <ModalStrategy
          {...this.props}
          modalId="strategyDetail"
          isOpen={modal_strategyDetail_isOpen}
          toggleModal={this.toggleModal}
          action={action}
          objData={objData}
        />
        <ModalStrategyResults
          {...this.props}
          modalId="strategyResults"
          isOpen={modal_strategyResults_isOpen}
          setFlag={this.setFlag}
          toggleModal={this.toggleModal}
          isRunning={isRunning}
          onClick={this.onClick}
          strategy={selected.strategy}
        />

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
              {/* Header */}
              <Col xl="6" md="7" xs="8">
                {/* Username and Full Name */}
                <a className="muted" href="" onClick={e => e.preventDefault()}>
                  <small className="description">
                    @{user.username}
                  </small>
                  <h5 className="title">
                    {isPageLoading ?
                      <Skeleton /> :
                      user.full_name
                    }
                  </h5>
                </a>
                {/* Button Actions */}
                <Row>
                  <Col className="text-right">
                    {this.props.user.username === user.username ?
                      this.renderMyActions(user) :
                      this.renderTheirActions(user)
                    }
                  </Col>
                </Row>
              </Col>
            </Row>
            <hr />
            {/* Stats */}
            <Row className="button-container">
              {/* Strategies */}
              <Col className="ml-auto" lg="2" md="4" xs="5">
                <h6>
                  {!isPageLoading && user.strategies.length}
                  <br />
                  <small>{getString(prefs.locale, this.compId, "label_strategies")}</small>
                </h6>
              </Col>
              {/* Following */}
              <Col className="ml-auto mr-auto" lg="2" md="4" xs="5">
                <a className="muted text-default" href="following/" onClick={e => {
                  e.preventDefault()
                  this.onClick("showFollowing")
                }}>
                  <h6>
                    {!isPageLoading && user.amount_following} <br />
                    <small>
                      {getString(prefs.locale, this.compId, "label_following")}
                    </small>
                  </h6>
                </a>
              </Col>
              {/* Followers */}
              <Col className="mr-auto" lg="2" md="4">
                <a className="muted text-default" href="followers/" onClick={e => {
                  e.preventDefault()
                  this.onClick("showFollowers")
                }}>
                  <h6>
                    {!isPageLoading && user.amount_followers} <br />
                    <small>
                      {getString(prefs.locale, this.compId, "label_followers")}
                    </small>
                  </h6>
                </a>
              </Col>
            </Row>
            <hr />
          </CardBody>
        </Card>
        <div className="nav-tabs-navigation">
          <div className="nav-tabs-wrapper">
            <Nav tabs>
              {/* Overview */}
              <NavItem>
                <NavLink
                  href="#"
                  className={activeNavId == "overview" ? "active" : ""}
                  onClick={() => this.toggleNavLink("activeNavId", "overview")}
                >
                  {getString(prefs.locale, this.compId, "tab_overview")}
                </NavLink>
              </NavItem>
              {/* About */}
              <NavItem>
                <NavLink
                  href="#"
                  className={activeNavId == "about" ? "active" : ""}
                  onClick={() => this.toggleNavLink("activeNavId", "about")}
                >
                  {getString(prefs.locale, this.compId, "tab_about")}
                </NavLink>
              </NavItem>
            </Nav>
          </div>
        </div>
        <TabContent activeTab={activeNavId}>
          {this.overviewPane(isPageLoading, user, popularShowMore)}
          {this.aboutPane(isPageLoading, user)}
        </TabContent>
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
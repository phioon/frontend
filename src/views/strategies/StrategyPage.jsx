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
  Collapse,
  Row,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  Input,
  UncontrolledDropdown,
  UncontrolledTooltip,
  Spinner,
} from "reactstrap";
// react component used to create sweet alerts
import ReactBSAlert from "react-bootstrap-sweetalert";
// react plugin that creates an input with badges
import TagsInput from "react-tagsinput";
import Skeleton from "react-loading-skeleton";
import Moment from "moment";

import ModalStrategy from "../modals/strategy/ModalStrategy";
import ModalNewReview from "../modals/strategy/ModalNewReview";
import ModalStrategyResults from "../modals/strategy/ModalStrategyResults";
import ChartManager from "../../core/managers/ChartManager";
import UsageOverTime from "../../components/cards/charts/UsageOverTime";
import PageNotFound from "../generics/PageNotFound";
import {
  getDistinctValuesFromList,
  getValueListFromObjList,
  getPaginationCursor,
  orderBy,
  retrieveObjFromObjList,
  verifyLength
} from "../../core/utils";
import StrategyRating from "./components/StrategyRating";

class StrategyPage extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase();

    this.state = {
      isPageLoading: true,
      isRunning: undefined,
      notFound: undefined,

      modal_strategyDetail_isOpen: false,
      modal_strategyReview_isOpen: false,
      modal_strategyResults_isOpen: false,
      descShowMore: false,

      action: "view",
      objData: {},

      rating: {
        data: { rating: 0, review: "", onHover: 0 },
        states: { review: "" }
      },
      reviews: {
        data: { reviews: [], nextCursor: null }
      },
      strategy: {},

      charts: {
        strategies: {
          usage: {
            generic: {
              overall: { data: {}, options: {}, hintId: "" }
            }
          }
        }
      },

      myStrategyNames: [],
      savedStrategyIds: [],

      alert: null
    };

    this.prepareRequirements = this.prepareRequirements.bind(this);
    this.setFlag = this.setFlag.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.onClick = this.onClick.bind(this);
  }
  componentDidMount() {
    this.props.setNavbarTitleId(`title_${this.compId}`)
    this.prepareRequirements()
  }
  componentDidUpdate(prevProps) {
    if (prevProps.match.params.pk !== this.props.match.params.pk)
      this.prepareRequirements()
  }

  async prepareRequirements() {
    let tasks = [
      this.prepareStrategy(),
      this.prepareSavedStrategies(),
    ]
    tasks = await Promise.all(tasks)

    let strategy = tasks[0]
    let savedStrategyIds = tasks[1]

    // Saved
    strategy.isSaved = savedStrategyIds.includes(strategy.uuid)
    this.setState({ strategy, savedStrategyIds })

    // Reviews
    await this.reviewsNextPage(strategy.uuid)

    this.setState({ isPageLoading: false })
  }
  async prepareStrategy() {
    let { strategy } = this.state;

    if (this.props.match.params.uuid) {
      // Set [strategy.uuid] value...
      strategy.uuid = this.props.match.params.uuid
    }
    else {
      // [strategy] param was not given...
      window.location.pathname = `/app/home/`
    }

    let result = await this.props.managers.app.strategyRetrieve(false, strategy.uuid)

    if (result.data) {
      // Strategy found...
      strategy = result.data

      // Charts... 
      strategy.stats.usage.history = orderBy(strategy.stats.usage.history, ["date"])
      this.prepareCharts(strategy)

      if (this.props.user.username === strategy.owner_username) {
        strategy.isOwner = true

        await this.prepareMyStrategyNames()
      }
    }
    else if (result.response.status == 404) {
      // Strategy doesn't exist...
      this.setState({ notFound: true })
    }

    return strategy
  }
  async prepareSavedStrategies() {
    let savedStrategies = await this.props.managers.app.savedStrategyData()
    let savedStrategyIds = getValueListFromObjList(savedStrategies, "uuid")

    return savedStrategyIds
  }
  async prepareMyStrategyNames() {
    let myStrategies = await this.props.managers.app.myStrategyData()
    let myStrategyNames = getDistinctValuesFromList(myStrategies, "name")

    this.setState({ myStrategyNames })
  }
  prepareCharts(strategy) {
    let { charts } = this.state;
    let aggrProps, chartProps = {}

    // 1. Usage
    // 1.1 Generic
    // 1.1.1 Overall
    let rawData = []
    let last29Days = [...new Array(30)].map((i, index) => Moment().startOf("day").subtract(index, "days").format("YYYY-MM-DD"));
    last29Days.reverse()
    last29Days.splice(29, 1)      // Removes today's date

    for (var date of last29Days) {
      let usage = retrieveObjFromObjList(strategy.stats.usage.history, "date", date)
      if (usage)
        rawData.push(usage)
      else
        rawData.push({ date: "date", runs: 0 })
    }

    chartProps = {
      xDimension: "date",
      colors: "default"
    }
    charts.strategies.usage.generic.overall = ChartManager.line_usage(rawData, chartProps)

    this.setState({ charts })
  }
  async reviewsNextPage(uuid) {
    let { reviews } = this.state;

    let result = await this.props.managers.app.strategyReviews(uuid, reviews.data.nextCursor)

    if (result.status == 200) {
      let data = result.data
      reviews.data.reviews = reviews.data.reviews.concat(data.results)

      reviews.data.nextCursor = getPaginationCursor(data.next)
    }

    this.setState({ reviews })
  }

  onChange(stateName, value) {
    let newState = { rating: this.state.rating }

    switch (stateName) {
      case "rating":
        if (newState.rating.data[stateName] !== value)
          this.onClick("rate", value)
        break;
      case "review":
        if (verifyLength(value, 1, 1000))
          newState.rating.states[stateName] = "has-success"
        else
          newState.rating.states[stateName] = "has-danger"
        break;
    }

    newState.rating.data[stateName] = value

    this.setState(newState)
  }

  async onClick(action, obj) {
    switch (action) {
      case "delete":
        this.deleteClick(obj)
        break;
      case "goToProfile":
        this.goToProfile(obj.owner_username)
        break;
      case "openReview":
        this.toggleModal("strategyReview")
        break;
      case "rate":
        this.rateClick(obj)
        break;
      case "run":
        this.runClick()
        break;
      case "save":
        await this.saveClick(obj)
        break;
      case "share":
        this.shareClick(obj.uuid)
        break;
      case "tag":
        this.tagClick(obj)
        break;
      case "update":
        this.updateClick(obj)
        break;
      case "view":
        this.viewClick(obj)
        break;
    }
  }
  deleteClick(obj) {
    let { prefs, getString } = this.props;

    this.setState({
      alert: (
        <ReactBSAlert
          warning
          style={{ display: "block", marginTop: "-100px" }}
          title={getString(prefs.locale, "strategies", "alert_confirming_title")}
          onConfirm={() => this.deleteObject(obj)}
          onCancel={() => this.hideAlert()}
          confirmBtnBsStyle="primary"
          cancelBtnBsStyle="danger"
          confirmBtnText={getString(prefs.locale, "strategies", "btn_alert_confirm")}
          cancelBtnText={getString(prefs.locale, "strategies", "btn_alert_cancel")}
          showCancel
        >
          {getString(prefs.locale, "strategies", "alert_confirming_text")}
        </ReactBSAlert>
      )
    });
  }
  goToProfile(username) {
    let path = this.props.managers.app.userProfilePath(username)
    this.props.history.push(path)
  }
  async rateClick(obj) {
    let result = await this.props.managers.app.strategyRate(obj)

    if (result.status == 200) {
      // Update [my_rating]
      let { strategy } = this.state;
      strategy.my_rating = obj.rating
      this.setState({ strategy })
    }
  }
  runClick() {
    this.toggleModal("strategyResults")
  }
  async saveClick(obj) {
    if (obj.isSaved)
      await this.props.managers.app.strategyUnsave(obj.uuid)
    else
      await this.props.managers.app.strategySave(obj.uuid)

    this.prepareRequirements()
  }
  shareClick(uuid) {
    let { getString, prefs } = this.props;

    let pageLink = this.props.managers.app.strategyPageLink(uuid)
    navigator.clipboard.writeText(pageLink)

    let message = getString(prefs.locale, "generic", "label_sharedLinkCopied")
    this.props.notify("br", "success", "nc-icon nc-send", "shareStrategy", message)
  }
  tagClick(iTag) {
    let { strategy } = this.state;

    let tag = strategy.tags[iTag]
    // Send User to Gallery, filtering [tag]
  }
  async updateClick(obj) {
    obj = await this.props.managers.app.strategyRetrieve(false, obj.uuid)
    obj = obj.data

    let objData = {
      uuid: obj.uuid,
      name: obj.name,
      desc: obj.desc,
      type: obj.type,
      isDynamic: obj.is_dynamic,
      isPublic: obj.is_public,
      rules: obj.rules
    }

    this.setState({ action: "update", objData })
    this.toggleModal("strategyDetail")
  }
  async viewClick(obj) {
    obj = await this.props.managers.app.strategyRetrieve(false, obj.uuid)
    obj = obj.data

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

  async deleteObject(obj) {
    let result = await this.props.managers.app.myStrategyDelete(obj)

    if (result.status == 204)
      this.objectDeleted(obj.owner_username)
    else
      this.hideAlert()
  }
  objectDeleted(username) {
    let { prefs, getString } = this.props;

    this.setState({
      alert: (
        <ReactBSAlert
          success
          style={{ display: "block", marginTop: "-100px" }}
          title={getString(prefs.locale, "strategies", "alert_deleted_title")}
          onConfirm={() => this.hideAlert()}
          confirmBtnBsStyle="primary"
        >
          {getString(prefs.locale, "strategies", "alert_deleted_text")}
        </ReactBSAlert>
      )
    });

    this.goToProfile(username)
  }

  // Components
  renderActions(isPageLoading, strategy, isRunning) {
    let { getString, prefs } = this.props;

    return (
      <UncontrolledDropdown>
        {/* Run */}
        {this.props.managers.strategy.runBtn(prefs, getString, this.onClick, strategy, isRunning, "any", "md")}
        {/* Save */}
        {!isPageLoading && !strategy.isOwner &&
          this.props.managers.strategy.saveBtn(prefs, getString, this.onClick, strategy, "any", "btn", "md")
        }
        {/* ... */}
        <DropdownToggle
          className="btn-md btn-icon btn-round btn-simple"
          data-toggle="dropdown"
          type="button"
        >
          <i className="fas fa-ellipsis-h" />
        </DropdownToggle>
        <DropdownMenu right>
          {/* View/Edit */}
          {strategy.isOwner ?
            this.props.managers.strategy.editBtn(prefs, getString, this.onClick, strategy) :
            this.props.managers.strategy.viewBtn(prefs, getString, this.onClick, strategy)
          }
          {/* Delete */}
          {strategy.isOwner && this.props.managers.strategy.deleteBtn(prefs, getString, this.onClick, strategy)}
          <DropdownItem divider />
          {/* Save */}
          {this.props.managers.strategy.saveBtn(prefs, getString, this.onClick, strategy)}
          {/* Rate */}
          {this.props.managers.strategy.rateBtn(prefs, getString, this.onClick, strategy)}
          {/* Share */}
          {this.props.managers.strategy.shareBtn(prefs, getString, this.onClick, strategy)}
          <DropdownItem divider />
          {/* User Profile */}
          {this.props.managers.strategy.goToProfileBtn(prefs, getString, this.onClick, strategy)}
        </DropdownMenu>
      </UncontrolledDropdown>
    )
  }

  descriptionCard(isPageLoading, strategy, descShowMore) {
    let { getString, prefs } = this.props;

    let lines = []
    let show = descShowMore ? 0 : 5
    if (strategy.desc)
      lines = strategy.desc.split("\n")

    return (
      <Card>
        <CardHeader>
          <CardTitle tag="h5">
            <small>
              {getString(prefs.locale, this.compId, "card_description_title")}
            </small>
          </CardTitle>
        </CardHeader>
        {isPageLoading ?
          <CardBody>
            {this.descriptionSkeleton()}
          </CardBody> :
          <CardBody>
            {this.descriptionByLine(lines, show)}
            {lines.length > 0 ?
              <div className="description text-right">
                {`- `}
                <a
                  className="description"
                  href={this.props.managers.app.userProfilePath(strategy.owner_username)}
                  onClick={e => {
                    e.preventDefault()
                    this.onClick("goToProfile", strategy)
                  }}
                >
                  @{strategy.owner_username}
                </a>
              </div> :
              <div className="description text-center">
                {getString(prefs.locale, this.compId, "card_description_empty")}
              </div>
            }
          </CardBody>
        }
        <CardFooter className="text-center">
          {lines.length > 0 && lines.length > show &&
            <Button
              className="btn-round"
              color="default"
              size="sm"
              outline
              onClick={() => this.setState({ descShowMore: !descShowMore })}
            >
              {descShowMore ?
                getString(prefs.locale, this.compId, "btn_showLess") :
                getString(prefs.locale, this.compId, "btn_showMore")
              }
            </Button>
          }
        </CardFooter>
      </Card>
    )
  }
  descriptionByLine(lines, show = 5) {
    if (lines.length > 0) {
      return (
        <div className="typography-line">
          {lines.map((line, i) => {
            if (i < show || show === 0)
              return (
                <pre key={i} className="description">
                  {line.length > 0 ?
                    line :
                    " "
                  }
                </pre>
              )
          })
          }
        </div>
      )
    }
  }
  descriptionSkeleton() {
    return (
      <div>
        <Skeleton />
        <Skeleton />
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
    )
  }

  reviewsCard(isPageLoading, strategy, reviews) {
    let { prefs, getString } = this.props;

    return (
      <Card>
        <CardHeader>
          <CardTitle tag="h5">
            <small>
              {getString(prefs.locale, this.compId, "card_reviews_title")}
            </small>
          </CardTitle>
        </CardHeader>
        <CardBody>
          {/* Click to Rate */}
          {window.innerWidth < 768 ?
            this.starsForDeviceSm(prefs, getString, strategy) :
            this.starsForDeviceMd(prefs, getString, strategy)
          }
          {/* Reviews */}
          {isPageLoading ?
            "is Loading..." :

            reviews.data.reviews.length === 0 ?
              <Card className="card-plain">
                <CardBody className="description text-center">
                  <Row className="mt-4" />
                  {getString(prefs.locale, this.compId, "card_reviews_empty")}
                  <Row className="mt-4" />
                </CardBody>
              </Card> :
              this.reviews(reviews)
          }
          {reviews.data.nextCursor &&
            <Row className="justify-content-end">
              <Button
                className="btn-neutral description"
                size="sm"
                color="default"
                onClick={() => this.reviewsNextPage(strategy.uuid)}
              >
                {getString(prefs.locale, this.compId, "btn_showMore")}...
              </Button>
            </Row>
          }
        </CardBody>
        <CardFooter>
          <Button
            className="btn-round"
            size="sm"
            color="default"
            onClick={() => this.onClick("openReview")}
            outline
          >
            {getString(prefs.locale, this.compId, "btn_review")}
          </Button>
        </CardFooter>
      </Card>
    )
  }
  reviews(reviews) {
    return reviews.data.reviews.map((obj, i) => {
      return (
        <Card key={`review_${i}`} className="card-review">
          <CardHeader>
            <small><b>{obj.full_name}</b></small>
            <Row>
              <Col>
                {this.renderStars(obj)}
              </Col>
              <Col className="text-right">
                <a>
                  <label className="description">
                    @{obj.username}
                  </label>
                </a>
              </Col>
            </Row>
          </CardHeader>
          <CardBody>
            <p>
              {obj.review}
            </p>
          </CardBody>
        </Card>
      )
    })
  }
  starsForDeviceSm(prefs, getString, strategy) {
    return (
      <Row className="justify-content-center">
        <Col md="6" className="description centered">
          {window.innerWidth < 768 ?
            getString(prefs.locale, this.compId, "label_tapToRate") :
            getString(prefs.locale, this.compId, "label_clickToRate")
          }
        </Col>
        {/* Starts */}
        <Col md="6" className="centered">
          <StrategyRating onClick={this.onClick} strategy={strategy} />
        </Col>
      </Row>
    )
  }
  starsForDeviceMd(prefs, getString, strategy) {
    return (
      <Row className="justify-content-center">
        <div md="6" className="description centered">
          {getString(prefs.locale, this.compId, "label_clickToRate")}:
        </div>
        {" "}
        {/* Starts */}
        <StrategyRating onClick={this.onClick} strategy={strategy} />
      </Row>
    )
  }
  renderStars(obj) {
    let value = obj.rating

    let states = [
      value > 0.75 ? "full" : value > 0.25 ? "half" : "empty",
      value > 1.75 ? "full" : value > 1.25 ? "half" : "empty",
      value > 2.75 ? "full" : value > 2.25 ? "half" : "empty",
      value > 3.75 ? "full" : value > 3.25 ? "half" : "empty",
      value > 4.75 ? "full" : value > 4.25 ? "half" : "empty",
    ]

    return states.map((state, i) => {
      return (
        <span key={i}>
          {this.renderStar(state)}
          {" "}
        </span>
      )
    })
  }
  renderStar = (state) => {
    let iClass = undefined
    switch (state) {
      case "empty":
        iClass = "far fa-star"
        break;
      case "half":
        iClass = "fas fa-star-half-alt"
        break;
      case "full":
        iClass = "fas fa-star"
        break;
    }

    return (
      <small>
        <i className={iClass} />
      </small>
    )
  }
  renderTags(strategy) {
    if (strategy.tags)
      return (
        <TagsInput
          value={strategy.tags}
          disabled
          renderTag={this.renderTag}
          tagProps={{ className: "react-tagsinput-tag info" }}
          inputProps={{ placeholder: "" }}
        />
      )
  }
  renderTag = (props) => {
    let { prefs, getString } = this.props;
    let { tag, key, disabled, onRemove, classNameRemove, getTagDisplayValue, ...other } = props;

    return (
      <span key={key} {...other}>
        {getString(prefs.locale, "indicators", getTagDisplayValue(tag))}
        <a className={classNameRemove} onClick={() => this.onClick("tag", key)} />
      </span>
    )
  }

  setFlag(context, value) {
    this.setState({ [`is${context}`]: value })
  };
  toggleModal(modalId) {
    this.setState({ [`modal_${modalId}_isOpen`]: !this.state[`modal_${modalId}_isOpen`] });
  };
  toggleCollapse(context) {
    this.setState({ [`${context}_isOpen`]: !this.state[`${context}_isOpen`] })
  };
  hideAlert() {
    this.setState({ alert: null });
  };

  render() {
    let { getString, prefs } = this.props;
    let {
      isPageLoading,
      isRunning,
      notFound,

      modal_strategyDetail_isOpen,
      modal_strategyReview_isOpen,
      modal_strategyResults_isOpen,
      descShowMore,

      action,
      objData,

      reviews,
      strategy,
      myStrategyNames,

      charts,

      alert
    } = this.state;

    if (notFound)
      return <PageNotFound {...this.props} />

    return (
      <div className="content">
        {alert}
        <ModalStrategy
          {...this.props}
          modalId="strategyDetail"
          isOpen={modal_strategyDetail_isOpen}
          toggleModal={this.toggleModal}
          action={action}
          objData={objData}
          myStrategyNames={myStrategyNames}
          runItIfSuccess={this.prepareRequirements}
        />
        <ModalNewReview
          prefs={prefs}
          getString={getString}
          managers={this.props.managers}
          modalId="strategyReview"
          isOpen={modal_strategyReview_isOpen}
          toggleModal={this.toggleModal}
          onClick={this.onClick}
          strategy={strategy}
        />
        <ModalStrategyResults
          {...this.props}
          modalId="strategyResults"
          isOpen={modal_strategyResults_isOpen}
          setFlag={this.setFlag}
          toggleModal={this.toggleModal}
          isRunning={isRunning}
          onClick={this.onClick}
          strategy={strategy}
        />

        {/* Header */}
        <Card className="card-plain card-user">
          <CardBody>
            <Row className="justify-content-center">
              {/* Type */}
              <Col xl="2" md="3" xs="4" className="card-pricing">
                <div className={`card-icon ${strategy.type === "buy" ? "icon-success" : "icon-danger"}`}>
                  {isPageLoading ? null :
                    strategy.type === "buy" ?
                      <i className="nc-icon nc-spaceship" /> :
                      <i className="nc-icon nc-spaceship fa-rotate-90" />
                  }
                </div>
              </Col>
              {/* Header */}
              <Col xs="6" md="7" xs="8">
                {/* Name */}
                <a className="muted" href="" onClick={e => e.preventDefault()}>
                  <small className="description">
                    #{strategy.uuid}
                  </small>
                  <h5 className="title">
                    {isPageLoading ?
                      <Skeleton /> :
                      strategy.name
                    }
                  </h5>
                </a>
                {/* Username */}
                {isPageLoading ?
                  <Skeleton /> :
                  <div className="description">
                    {getString(prefs.locale, this.compId, "label_createdBy")}:
                    {" "}
                    <a
                      className="description"
                      href={this.props.managers.app.userProfilePath(strategy.owner_username)}
                      onClick={e => {
                        e.preventDefault()
                        this.onClick("goToProfile", strategy)
                      }}
                    >
                      @{strategy.owner_username}
                    </a>
                  </div>
                }
                {/* Button Actions */}
                <Row>
                  <Col className="text-right">
                    {this.renderActions(isPageLoading, strategy, isRunning)}
                  </Col>
                </Row>
              </Col>
            </Row>
            <hr />
            {/* Stats */}
            <Row className="button-container">
              <Col className="ml-auto" lg="2" md="4" xs="5">
                <h6>
                  {strategy.stats && strategy.stats.usage.total_runs} <br />
                  <small>{getString(prefs.locale, this.compId, "label_totalRuns")}</small>
                </h6>
              </Col>
              <Col className="ml-auto mr-auto" lg="2" md="4" xs="5">
                <h6>
                  {strategy.stats && strategy.stats.saved.count} <br />
                  <small>{getString(prefs.locale, this.compId, "label_saved")}</small>
                </h6>
              </Col>
              <Col className="mr-auto" lg="2" md="4">
                <h6 id="stats_rating">
                  {
                    strategy.stats ?
                      strategy.stats.ratings.avg :
                      null
                  }
                  <br />
                  <small>
                    {getString(prefs.locale, this.compId, "label_rating")}
                  </small>
                </h6>
              </Col>
            </Row>
            <hr />
          </CardBody>
        </Card>
        {/* Description and Chart */}
        <Row>
          <Col md="7">
            {/* Description */}
            {this.descriptionCard(isPageLoading, strategy, descShowMore)}
            {/* Reviews */}
            {this.reviewsCard(isPageLoading, strategy, reviews)}
          </Col>
          <Col md="5">
            {/* Usage Chart */}
            <UsageOverTime
              getString={getString}
              prefs={prefs}
              pageFirstLoading={isPageLoading}
              chart={charts.strategies.usage}
            />
            {/* Indicator Tags */}
            <Card>
              <CardBody>
                <CardTitle tag="h5">
                  <small>
                    {getString(prefs.locale, this.compId, "card_indicators_title")}
                  </small>
                </CardTitle>
                {this.renderTags(strategy)}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

export default StrategyPage;

StrategyPage.propTypes = {
  prefs: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  managers: PropTypes.object.isRequired,
  setNavbarTitleId: PropTypes.func.isRequired
}
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
import ModalStrategyRating from "../modals/strategy/ModalStrategyRating";
import ModalStrategyResults from "../modals/strategy/ModalStrategyResults";
import ChartManager from "../../core/managers/ChartManager";
import UsageOverTime from "../../components/cards/charts/UsageOverTime";

import {
  getDistinctValuesFromList,
  getValueListFromObjList,
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

      modal_strategyDetail_isOpen: false,
      modal_strategyRating_isOpen: false,
      modal_strategyResults_isOpen: false,
      descShowMore: false,

      action: "view",
      objData: {},

      rating: {
        data: { rating: 0, review: "", onHover: 0 },
        states: { review: "" }
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

    strategy.isSaved = savedStrategyIds.includes(strategy.id)

    this.setState({ strategy, savedStrategyIds, isPageLoading: false })
  }
  async prepareStrategy() {
    let { strategy } = this.state;

    if (this.props.match.params.pk) {
      // Set [strategy.id] value...
      strategy.id = this.props.match.params.pk
    }
    else {
      // [strategy] param was not given...
      this.setState({ redirectTo: `/app/strategies/panel/` })
    }

    let result = await this.props.managers.app.strategyRetrieve(false, strategy.id)

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
      this.setState({ redirectTo: `/app/notfound/` })
    }

    return strategy
  }
  async prepareSavedStrategies() {
    let savedStrategies = await this.props.managers.app.savedStrategyData()
    let savedStrategyIds = getValueListFromObjList(savedStrategies, "id")

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
      case "run":
        this.runClick()
        break;
      case "goToProfile":
        this.goToProfile(obj.owner_username)
        break;
      case "update":
        this.updateClick(obj)
        break;
      case "delete":
        this.deleteClick(obj)
        break;
      case "save":
        await this.saveClick(obj)
        break;
      case "rate":
        this.rateClick(obj)
        break;
      case "share":
        this.shareClick(obj.id)
        break;
      case "tag":
        this.tagClick(obj)
        break;
    }
  }
  runClick() {
    this.toggleModal("strategyResults")
  }
  goToProfile(username) {
    let path = this.props.managers.app.userProfilePath(username)
    this.props.history.push(path)
  }
  updateClick(obj) {
    let objData = {
      id: obj.id,
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
  deleteClick(obj) {
    let { prefs, getString } = this.props;

    this.setState({
      alert: (
        <ReactBSAlert
          warning
          style={{ display: "block", marginTop: "-100px" }}
          title={getString(prefs.locale, "strategypanel", "alert_confirming_title")}
          onConfirm={() => this.deleteObject(obj)}
          onCancel={() => this.hideAlert()}
          confirmBtnBsStyle="primary"
          cancelBtnBsStyle="danger"
          confirmBtnText={getString(prefs.locale, "strategypanel", "btn_alert_confirm")}
          cancelBtnText={getString(prefs.locale, "strategypanel", "btn_alert_cancel")}
          showCancel
        >
          {getString(prefs.locale, "strategypanel", "alert_confirming_text")}
        </ReactBSAlert>
      )
    });
  }
  async saveClick(obj) {
    if (obj.isSaved)
      await this.props.managers.app.strategyUnsave(obj.id)
    else
      await this.props.managers.app.strategySave(obj.id)

    this.prepareRequirements()
  }
  rateClick(value) {
    let payload = {
      id: this.state.strategy.id,
      rating: value
    }
    this.props.managers.app.strategyRate(payload)
  }
  shareClick(pk) {
    let { getString, prefs } = this.props;

    let pageLink = this.props.managers.app.strategyPageLink(pk)
    navigator.clipboard.writeText(pageLink)

    let message = getString(prefs.locale, "generic", "label_sharedLinkCopied")
    this.props.notify("br", "success", "nc-icon nc-send", "shareStrategy", message)
  }
  tagClick(tag) {
    let { strategy } = this.state;

    tag = strategy.tags[tag]
    // Send User to Gallery, filtering [tag]
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
          title={getString(prefs.locale, "strategypanel", "alert_deleted_title")}
          onConfirm={() => this.hideAlert()}
          confirmBtnBsStyle="primary"
        >
          {getString(prefs.locale, "strategypanel", "alert_deleted_text")}
        </ReactBSAlert>
      )
    });

    this.goToProfile(username)
  }

  // Components
  renderActions(strategy, isRunning) {
    let { getString, prefs } = this.props;

    return (
      <UncontrolledDropdown>
        {/* Run */}
        {this.props.managers.strategy.runBtn(prefs, getString, this.onClick, strategy, isRunning, "md")}
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
                {getString(prefs.locale, this.compId, "card_description_noDesc")}
              </div>
            }
          </CardBody>
        }
        <CardFooter className="text-center">
          {lines.length > 0 && lines.length > show &&
            <Button
              className="btn-round"
              color="info"
              size="sm"
              outline
              onClick={() => this.setState({ descShowMore: !descShowMore })}
            >
              {descShowMore ?
                getString(prefs.locale, this.compId, "label_showLess") :
                getString(prefs.locale, this.compId, "label_showMore")
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
          {
            lines.map((line, i) => {
              if (i < show || show === 0)
                return (
                  <pre key={i} className="description">
                    {line}
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
      </div>
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
      redirectTo,
      isPageLoading,
      isRunning,

      modal_strategyDetail_isOpen,
      modal_strategyRating_isOpen,
      modal_strategyResults_isOpen,
      descShowMore,

      action,
      objData,

      strategy,
      myStrategyNames,

      charts,

      alert
    } = this.state;

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
        <ModalStrategyRating
          {...this.props}
          modalId="strategyRating"
          isOpen={modal_strategyRating_isOpen}
          toggleModal={this.toggleModal}
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
                <Row>
                  {/* Name */}
                  <Col className="align-center">
                    <a href="" onClick={e => e.preventDefault()}>
                      <h5 className="title">
                        {isPageLoading ?
                          <Skeleton /> :
                          strategy.name
                        }
                      </h5>
                    </a>
                  </Col>
                  {/* Save */}
                  {!isPageLoading && !strategy.isOwner &&
                    <Col md="2" xs="3" className="text-right">
                      {this.props.managers.strategy.saveBtn(prefs, getString, this.onClick, strategy, "any", "btn", "lg")}
                    </Col>
                  }
                </Row>
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
                    {this.renderActions(strategy, isRunning)}
                  </Col>
                </Row>
              </Col>
            </Row>
            <hr />
            {/* Stats */}
            <div className="button-container">
              <Row>
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
                  <h6>
                    {strategy.stats && strategy.stats.ratings.count > 0 && strategy.stats.ratings.avg} <br />
                    <small>
                      {getString(prefs.locale, this.compId, "label_rating")}
                    </small>
                  </h6>
                </Col>
              </Row>
            </div>
            <hr />
          </CardBody>
        </Card>
        {/* Description and Chart */}
        <Row>
          {/* Description */}
          <Col md="7">
            {this.descriptionCard(isPageLoading, strategy, descShowMore)}
          </Col>
          {/* Usage Chart */}
          <Col md="5">
            <UsageOverTime
              getString={getString}
              prefs={prefs}
              pageFirstLoading={isPageLoading}
              chart={charts.strategies.usage}
            />
          </Col>
        </Row>
        <Row>
          {/* Reviews */}
          <Col md="7">
            <Card>
              <CardHeader>
                <CardTitle tag="h5">
                  <small>
                    {getString(prefs.locale, this.compId, "card_reviews_title")}
                  </small>
                </CardTitle>
              </CardHeader>
              <CardBody>
                <Row className="justify-content-center">
                  {/* Stars */}
                  <Col className="description centered">
                    {window.innerWidth < 768 ?
                      getString(prefs.locale, this.compId, "label_tapToRate") :
                      getString(prefs.locale, this.compId, "label_clickToRate")
                    }:
                    <StrategyRating onClick={this.onClick} strategy={strategy} />
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
          {/* Indicator Tags */}
          <Col md="5">
            <Card className="card-plain">
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
        {redirectTo && <Redirect to={redirectTo} />}
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
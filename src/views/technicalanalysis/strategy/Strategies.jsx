import React from "react";
import { Redirect } from "react-router-dom";
import PropTypes from "prop-types";
// react plugin for creating notifications over the dashboard
import NotificationAlert from "react-notification-alert";
// reactstrap components
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardFooter,
  Carousel,
  CarouselItem,
  CarouselControl,
  CarouselIndicators,
  Col,
  FormGroup,
  Row,
  UncontrolledTooltip,
} from "reactstrap";
// react plugin used to create DropdownMenu for selecting items
import Select from "react-select";
// react component for creating dynamic tables
import FixedButton from "../../../components/FixedPlugin/FixedButton";
// react component used to create sweet alerts
import ReactBSAlert from "react-bootstrap-sweetalert";

import StrategyCardMini from "./StrategyCardMini";
import StrategyResults from "./StrategyResults";
import ModalStrategy from "../../modals/strategy/ModalStrategy";
import CarouselSkeleton from "./CarouselSkeleton";
import CarouselEmpty from "./CarouselEmpty";
import { orderBy, getDistinctValuesFromList, deepCloneObj, retrieveObjFromObjList } from "../../../core/utils";

class Strategies extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,

      pageFirstLoading: true,
      isLoading: false,
      modal_strategyDetail_isOpen: false,

      action: "create",
      objData: {},

      carousel: {
        slides: [],
        activeIndex: 0,
      },
      selected: {
        filters: {
          variables: {
            interval: { value: "d", label: "Test" }
          },
          general: {
            stockExchange: { value: "BVMF", label: "" }
          },
        },
        strategy: { rules: "{}" },
      },

      cWallets: 0,
      stockExchangeOptions: [],
      timeIntervalOptions: [],

      strategies: [],
      sStrategyNames: [],
      alert: null,
    }

    this.resultRef = React.createRef()

    this.prepareCarousel = this.prepareCarousel.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.toggleLoading = this.toggleLoading.bind(this);
    this.onClick = this.onClick.bind(this);
  }
  static getDerivedStateFromProps(props, state) {
    if (props.prefs.langId !== state.langId)
      return { langId: props.prefs.langId }
    return null
  }
  componentDidMount() {
    window.addEventListener("resize", () => {
      this.resize()
    });

    this.props.setNavbarTitleId("title_" + this.state.compId)
    this.prepareRequirements()
  }
  componentWillUnmount() {
    window.removeEventListener("resize", () => {
      this.resize()
    });
  }

  resize() {
    let maxItemsPerSlide = this.getMaxItemsPerSlide()

    if (this.state.carousel.maxItemsPerSlide != maxItemsPerSlide)
      this.prepareCarousel()          // async call
  }
  getMaxItemsPerSlide() {
    if (window.innerWidth < 576)
      return 2
    else if (window.innerWidth < 768)
      return 4
    else if (window.innerWidth < 990)
      return 6
    else if (window.innerWidth < 1200)
      return 6
    else if (window.innerWidth < 1600)
      return 8
    else
      return 12
  }
  scrollPage(elementId) {
    document.getElementById(elementId).scrollIntoView();
  }

  async prepareRequirements() {
    // Check User's subscription

    let tasks = [
      this.prepareContext(),
      this.prepareCarousel()
    ]
    await Promise.all(tasks)

    this.setState({ pageFirstLoading: false })
  }
  async prepareContext() {
    let { getString } = this.props;
    let { langId } = this.state;

    let iItems = await this.props.managers.market.indicatorData()

    let wallets = await this.props.managers.app.walletList()
    let stockExchanges = getDistinctValuesFromList(wallets.data, "se_short")
    let stockExchangeOptions = []
    let timeIntervalOptions = []

    for (var se_short of stockExchanges) {
      let stockExchange = await this.props.managers.market.stockExchangeRetrieve(se_short)
      let option = {
        value: stockExchange.se_short,
        label: stockExchange.se_name
      }

      stockExchangeOptions.push(option)
    }

    // Default option
    if (stockExchangeOptions.length > 0)
      this.onSelectChange("stockExchange", stockExchangeOptions[0])

    for (var indicator of iItems)
      for (var instance of indicator.instances)
        if (!retrieveObjFromObjList(timeIntervalOptions, "value", instance.interval)) {
          let option = {
            value: instance.interval,
            label: getString(langId, "indicators", instance.interval)
          }
          timeIntervalOptions.push(option)

          // Default option
          if (option.value == "d")
            this.onSelectChange("timeInterval", option)
        }


    this.setState({ cWallets: wallets.data.length, stockExchangeOptions, timeIntervalOptions })
  }
  async prepareCarousel() {
    // 1. Strategies
    let strategies = await this.props.managers.app.strategyData()
    strategies = orderBy(strategies, ['-create_time'])
    let sStrategyNames = getDistinctValuesFromList(strategies, "name")

    console.log(strategies)

    // 2. Carousel
    let carousel = this.prepareSlides(this.state.carousel, strategies)

    this.setState({ strategies, sStrategyNames, carousel })
  }
  prepareSlides(carousel, strategies) {
    let slides = []
    let items = []
    let maxItemsPerSlide = this.getMaxItemsPerSlide()

    for (var x = 0; x < strategies.length; x++) {
      items.push(strategies[x])

      if (x == maxItemsPerSlide - 1) {
        slides.push(items)
        items = []
        maxItemsPerSlide += maxItemsPerSlide
      }
    }

    if (items.length > 0)
      slides.push(items)

    carousel.slides = slides
    this.moveSlide("goto", 0)

    return carousel
  }

  renderStrategyItem(slide) {
    return slide.map((strategy) => {
      let isOwner = this.props.managers.auth.storedUser().user.username === strategy.owner_username
      return (
        <Col key={"strategy__" + strategy.id} xl={window.innerWidth > 1600 ? "2" : "3"} lg="4" md="4" sm="6" >
          <StrategyCardMini
            {...this.props}
            strategy={deepCloneObj(strategy)}
            isOwner={isOwner}
            onClick={this.onClick}
            isLoading={this.state.isLoading}
          />
        </Col>
      )
    })
  }
  renderStrategySlides(slides) {
    return slides.map((slide, key) => {
      return (
        <CarouselItem key={"item__" + key}>
          <Row>
            {this.renderStrategyItem(slide)}
          </Row>
          <br />
          <br />
        </CarouselItem>
      )
    })
  }
  moveSlide(action, index = 0) {
    let { carousel } = this.state;
    let newSlide = undefined

    switch (action) {
      case "next":
        index = carousel.activeIndex

        if (index == carousel.slides.length - 1)
          newSlide = 0
        else
          newSlide = index + 1
        break;
      case "previous":
        index = carousel.activeIndex

        if (index == 0)
          newSlide = carousel.slides.length - 1
        else
          newSlide = index - 1
        break;
      case "goto":
        newSlide = index
        break;
      default:
        break;
    }

    carousel.activeIndex = newSlide

    this.setState({ carousel })
  }

  onSelectChange(fieldName, value) {
    let newState = { selected: this.state.selected }

    let runStrategy = false

    switch (fieldName) {
      case "stockExchange":
        if (newState.selected.filters.general.stockExchange !== value)
          runStrategy = true

        newState.selected.filters.general.stockExchange = value
        break;
      case "timeInterval":
        if (newState.selected.filters.variables.interval !== value)
          runStrategy = true

        newState.selected.filters.variables.interval = value
        break;
      default:
        break;
    }

    this.setState(newState)

    if (runStrategy && this.state.selected.strategy.id) {
      // If a Strategy is selected, for each select change, run it again.
      this.runClick(this.state.selected.strategy)
    }
  }

  onClick(action, obj) {
    switch (action) {
      case "run":
        this.runClick(obj)
        break;
      case "create":
        this.createClick()
        break;
      case "update":
        this.updateClick(obj)
        break;
      case "delete":
        this.deleteClick(obj)
        break;
      default:
        break;
    }
  }
  runClick(obj) {
    let { selected } = this.state;

    selected.strategy = obj

    this.scrollPage("strategyresults")
    this.setState({ selected, isLoading: true })
  }
  createClick() {
    this.setState({ action: "create" })
    this.toggleModal("strategyDetail")
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
    this.setState({
      alert: (
        <ReactBSAlert
          warning
          style={{ display: "block", marginTop: "-100px" }}
          title={this.props.getString(this.state.langId, this.state.compId, "alert_confirming_title")}
          onConfirm={() => this.deleteObject(obj)}
          onCancel={() => this.hideAlert()}
          confirmBtnBsStyle="primary"
          cancelBtnBsStyle="danger"
          confirmBtnText={this.props.getString(this.state.langId, this.state.compId, "btn_alert_confirm")}
          cancelBtnText={this.props.getString(this.state.langId, this.state.compId, "btn_alert_cancel")}
          showCancel
        >
          {this.props.getString(this.state.langId, this.state.compId, "alert_confirming_text")}
        </ReactBSAlert>
      )
    });
  }
  async deleteObject(obj) {
    let result = await this.props.managers.app.strategyDelete(obj.id)

    if (result.status == 204)
      this.objectDeleted()
    else
      this.hideAlert()
  }
  objectDeleted() {
    this.setState({
      alert: (
        <ReactBSAlert
          success
          style={{ display: "block", marginTop: "-100px" }}
          title={this.props.getString(this.state.langId, this.state.compId, "alert_deleted_title")}
          onConfirm={() => this.hideAlert()}
          confirmBtnBsStyle="primary"
        >
          {this.props.getString(this.state.langId, this.state.compId, "alert_deleted_text")}
        </ReactBSAlert>
      )
    });

    this.prepareCarousel()
  }

  toggleLoading(value) {
    this.setState({ isLoading: value })
  }
  toggleModal(modalId) {
    this.setState({ ["modal_" + modalId + "_isOpen"]: !this.state["modal_" + modalId + "_isOpen"] });
  };
  hideAlert() {
    this.setState({
      alert: null
    });
  };

  render() {
    let { getString } = this.props;
    let {
      langId,
      compId,

      pageFirstLoading,
      isLoading,
      modal_strategyDetail_isOpen,

      action,
      objData,

      carousel,
      selected,

      cWallets,
      stockExchangeOptions,
      timeIntervalOptions,

      sStrategyNames,
      alert,
    } = this.state;

    return (
      <div className="content">
        <NotificationAlert ref="notificationAlert" />
        {alert}
        <ModalStrategy
          {...this.props}
          modalId="strategyDetail"
          isOpen={modal_strategyDetail_isOpen}
          toggleModal={this.toggleModal}
          action={action}
          objData={action == "update" ? objData : {}}
          sStrategyNames={sStrategyNames}
          runItIfSuccess={this.prepareCarousel}
        />
        <div className="header text-center">
          <h3 className="title">{getString(langId, compId, "title")}</h3>
        </div>

        {pageFirstLoading ?
          // Carousel Skeleton
          <Card className="card-plain">
            <CardHeader>
              <Row>
                <Col>
                  <CardTitle tag="h4">{getString(langId, compId, "card_title")}</CardTitle>
                </Col>
                <Col className="text-right">
                  <Button
                    type="submit"
                    className="btn-round"
                    outline
                    color="success"
                    onClick={() => this.onClick("create")}
                  >
                    {getString(langId, compId, "btn_newStrategy")}
                  </Button>
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              <CarouselSkeleton />
            </CardBody>
          </Card>
          :
          cWallets == 0 ?
            // No wallets
            <Card className="card-stats">
              <Row>
                <Col xl="2" lg="2" md="3" xs="3" className="centered">
                  <div className="icon-big text-center">
                    <i className="nc-icon nc-alert-circle-i text-warning" />
                  </div>
                </Col>
                <Col xl="10" lg="10" md="9" xs="9">
                  <br />
                  <p className="card-description">{getString(langId, compId, "label_noWallets_p1")}</p>
                  <p className="card-description">{getString(langId, compId, "label_noWallets_p2")}</p>
                </Col>
              </Row>
              <CardFooter className="centered">
                <Button
                  className="btn-round"
                  color="success"
                  data-dismiss="modal"
                  type="submit"
                  onClick={() => this.setState({ goToWallets: true })}
                >
                  {getString(langId, compId, "btn_goToWallets")}
                </Button>
                {this.state.goToWallets && <Redirect to="/app/myassets/wallets" />}
              </CardFooter>
            </Card>
            :
            <>
              {/* Strategies */}
              <Card className="card-plain">
                <CardHeader>
                  <Row>
                    <Col>
                      <CardTitle tag="h4">{getString(langId, compId, "card_title")}</CardTitle>
                    </Col>
                    <Col className="text-right">
                      <Button
                        type="submit"
                        className="btn-round"
                        outline
                        color="success"
                        onClick={() => this.onClick("create")}
                      >
                        {getString(langId, compId, "btn_newStrategy")}
                      </Button>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  {carousel.slides.length == 0 ?
                    <CarouselEmpty
                      getString={getString}
                      langId={langId}
                      compId={compId} /> :
                    <Carousel
                      activeIndex={carousel.activeIndex}
                      next={() => this.moveSlide("next")}
                      previous={() => this.moveSlide("previous")}
                      interval={false}>
                      <CarouselIndicators
                        items={Object.keys(carousel.slides)}
                        activeIndex={carousel.activeIndex}
                        onClickHandler={index => this.moveSlide("goto", index)} />
                      {this.renderStrategySlides(carousel.slides)}
                      <CarouselControl direction="prev" directionText="Previous" onClickHandler={() => this.moveSlide("previous")} />
                      <CarouselControl direction="next" directionText="Next" onClickHandler={() => this.moveSlide("next")} />
                    </Carousel>
                  }
                </CardBody>
              </Card>
              {/* Results */}
              <Card id="strategyresults">
                <CardHeader>
                  <Row>
                    <Col>
                      <CardTitle tag="h5">{getString(langId, compId, "card_results_title")}</CardTitle>
                    </Col>
                    <Col>
                      <div className="pull-right">
                        <Badge color="default" pill>
                          {selected.strategy.name && selected.strategy.name}
                        </Badge>
                      </div>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <Row className="justify-content-center">
                    {/* Stock Exchange */}
                    <Col xl="3" lg="3" md="4" xs="6">
                      <FormGroup>
                        <label>{getString(langId, compId, "input_stockExchange")}
                          {" "}
                          <i id={"input_stockExchange_hint"} className="nc-icon nc-alert-circle-i" />
                        </label>
                        <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"input_stockExchange_hint"}>
                          {getString(langId, compId, "input_stockExchange_hint")}
                        </UncontrolledTooltip>
                        <Select
                          className="react-select"
                          classNamePrefix="react-select"
                          name="stockExchange"
                          placeholder={getString(langId, "generic", "input_select")}
                          value={selected.filters.general.stockExchange}
                          options={stockExchangeOptions}
                          onChange={value => this.onSelectChange("stockExchange", value)}
                        />
                      </FormGroup>
                    </Col>
                    {/* Time Interval */}
                    <Col xl="2" lg="3" md="3" xs="6">
                      <FormGroup>
                        <label>{getString(langId, compId, "input_timeInterval")}
                          {" "}
                          <i id={"input_timeInterval_hint"} className="nc-icon nc-alert-circle-i" />
                        </label>
                        <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"input_timeInterval_hint"}>
                          {getString(langId, compId, "input_timeInterval_hint")}
                        </UncontrolledTooltip>
                        <Select
                          className="react-select"
                          classNamePrefix="react-select"
                          name="timeInterval"
                          placeholder={getString(langId, "generic", "input_select")}
                          value={selected.filters.variables.interval}
                          options={timeIntervalOptions}
                          onChange={value => this.onSelectChange("timeInterval", value)}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row className="mt-4" />
                  <StrategyResults
                    {...this.props}
                    toggleLoading={this.toggleLoading}
                    isLoading={isLoading}
                    strategy={selected.strategy}
                    filters={selected.filters}
                  />
                </CardBody>
              </Card>
            </>
        }
      </div>
    )
  }
}

export default Strategies;

Strategies.propTypes = {
  managers: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  setNavbarTitleId: PropTypes.func.isRequired
}
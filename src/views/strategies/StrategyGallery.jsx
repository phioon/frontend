import React from "react";
import PropTypes from "prop-types";
// reactstrap components
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Carousel,
  CarouselItem,
  CarouselControl,
  CarouselIndicators,
  Col,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Row,
} from "reactstrap";

import ModalStrategy from "../modals/strategy/ModalStrategy";
import ModalStrategyResults from "../modals/strategy/ModalStrategyResults";

import StrategyCardMini from "./components/StrategyCardMini";
import CarouselEmpty from "./components/CarouselEmpty";
import CarouselSkeleton from "./components/CarouselSkeleton";

import { getValueListFromObjList, deepCloneObj } from "../../core/utils";

class StrategyGallery extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase();

    this.state = {
      pageFirstLoading: true,
      isRunning: false,
      modal_strategyDetail_isOpen: false,
      modal_strategyResults_isOpen: false,

      action: "view",
      objData: {},

      mostRuns: {
        id: "mostRuns",
        slides: [],
        activeIndex: 0,
      },
      mostSaved: {
        id: "mostSaved",
        slides: [],
        activeIndex: 0,
      },

      selected: {
        strategy: { rules: "{}" },
      },

      savedStrategyIds: []
    };

    this.setFlag = this.setFlag.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.onClick = this.onClick.bind(this);
  }
  componentDidMount() {
    this.props.setNavbarTitleId("title_" + this.compId)
    window.addEventListener("resize", this.resize);

    this.prepareRequirements()
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.resize)
  }

  resize() {
    let maxItemsPerSlide = this.getMaxItemsPerSlide()

    if (this.state.myStrategies.maxItemsPerSlide != maxItemsPerSlide)
      this.prepareMyStrategies()          // async call
  }
  getMaxItemsPerSlide() {
    if (window.innerWidth < 576)
      return 2
    else if (window.innerWidth < 768)
      return 2
    else if (window.innerWidth < 990)
      return 3
    else if (window.innerWidth < 1200)
      return 3
    else if (window.innerWidth < 1600)
      return 4
    else
      return 8
  }

  async prepareRequirements() {
    let tasks = [
      this.prepareSavedStrategies(),
      this.prepareMostRuns(),
      this.prepareMostSaved()
    ]
    await Promise.all(tasks)

    this.setState({ pageFirstLoading: false })
  }
  async prepareSavedStrategies() {
    let savedStrategies = await this.props.managers.app.savedStrategyData()
    let savedStrategyIds = getValueListFromObjList(savedStrategies, "id")

    this.setState({ savedStrategyIds })
  }
  async prepareMostRuns() {
    // 1. Query
    let query = {
      filters: {},
      order_by: "-usage",
      page_size: 20
    }
    // 2. Strategies
    let strategies = await this.props.managers.app.strategyData(false, query)

    // 3. Carousel
    let carousel = this.prepareSlides(this.state.mostRuns, strategies.results)

    this.setState({ mostRuns: carousel })
  }
  async prepareMostSaved() {
    // 1. Query
    let query = {
      filters: {},
      order_by: "-saved",
      page_size: 20
    }
    // 2. Strategies
    let strategies = await this.props.managers.app.strategyData(false, query)

    // 3. Carousel
    let carousel = this.prepareSlides(this.state.mostSaved, strategies.results)

    this.setState({ mostSaved: carousel })
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
    this.moveSlide(carousel, "goto", 0)

    return carousel
  }

  renderStrategyItem(context, slide) {
    let { isRunning } = this.state;

    return slide.map((strategy) => {
      strategy.isOwner = this.props.user.username === strategy.owner_username
      strategy.isSaved = this.state.savedStrategyIds.includes(strategy.id)

      return (
        <Col key={"strategy__" + strategy.id} xl={window.innerWidth > 1600 ? "2" : "3"} lg="4" md="4" sm="6" >
          <StrategyCardMini
            managers={this.props.managers}
            getString={this.props.getString}
            prefs={this.props.prefs}
            context={context}
            strategy={deepCloneObj(strategy)}
            onClick={this.onClick}
            isRunning={isRunning}
          />
        </Col>
      )
    })
  }
  renderStrategySlides(context, slides) {
    return slides.map((slide, key) => {
      return (
        <CarouselItem key={"item__" + key}>
          <Row>
            {this.renderStrategyItem(context, slide)}
          </Row>
          <br />
          <br />
        </CarouselItem>
      )
    })
  }
  moveSlide(carousel, action, index = 0) {
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
    }

    carousel.activeIndex = newSlide

    this.setState({ [carousel.id]: carousel })
  }

  async onClick(action, obj) {
    switch (action) {
      case "run":
        this.runClick(obj)
        break;
      case "view":
        this.viewClick(obj)
        break;
      case "save":
        await this.saveClick(obj)
        break;
      case "share":
        this.shareClick(obj.id)
        break;
      case "goToStrategyPage":
        this.goToStrategyPage(obj.id)
        break;
      case "goToProfile":
        this.goToProfile(obj.owner_username)
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
      await this.props.managers.app.strategyUnsave(obj.id)
    else
      await this.props.managers.app.strategySave(obj.id)

    this.prepareSavedStrategies()
  }
  shareClick(pk) {
    let { getString, prefs } = this.props;

    let pageLink = this.props.managers.app.strategyPageLink(pk)
    navigator.clipboard.writeText(pageLink)

    let message = getString(prefs.locale, "generic", "label_sharedLinkCopied")
    this.props.notify("br", "success", "nc-icon nc-send", "shareStrategy", message)
  }
  goToStrategyPage(pk) {
    let path = this.props.managers.app.strategyPagePath(pk)
    this.props.history.push(path)
  }
  goToProfile(username) {
    let path = this.props.managers.app.userProfilePath(username)
    this.props.history.push(path)
  }

  setFlag(context, value) {
    this.setState({ [`is${context}`]: value })
  }
  toggleModal(modalId) {
    this.setState({ [`modal_${modalId}_isOpen`]: !this.state[`modal_${modalId}_isOpen`] });
  };

  render() {
    let { getString, prefs } = this.props;
    let {
      pageFirstLoading,
      isRunning,
      modal_strategyDetail_isOpen,
      modal_strategyResults_isOpen,

      action,
      objData,

      mostRuns,
      mostSaved,

      selected,

    } = this.state;

    return (
      <div className="content">
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
        <div className="header text-center">
          <h3 className="title">{getString(prefs.locale, this.compId, "title")}</h3>
        </div>
        <Row className="mt-4" />
        <Row className="justify-content-center">
          <Col md="6">
            <InputGroup className="no-border">
              <Input
                defaultValue=""
                placeholder={getString(prefs.locale, "generic", "input_search")}
                type="text" />
              <InputGroupAddon addonType="append">
                <InputGroupText>
                  <i className="nc-icon nc-zoom-split" />
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </Col>
        </Row>

        {pageFirstLoading ?
          // Carousel Skeleton
          <>
            <Card className="card-plain">
              <CardHeader>
                <CardTitle tag="h4">{getString(prefs.locale, this.compId, "card_mostRuns_title")}</CardTitle>
              </CardHeader>
              <CardBody>
                <CarouselSkeleton />
              </CardBody>
            </Card>
            <Card className="card-plain">
              <CardHeader>
                <CardTitle tag="h4">{getString(prefs.locale, this.compId, "card_mostSaved_title")}</CardTitle>
              </CardHeader>
              <CardBody>
                <CarouselSkeleton />
              </CardBody>
            </Card>
          </> :

          <>
            {/* Most Runs */}
            <Card className="card-plain">
              <CardHeader>
                <CardTitle tag="h4">{getString(prefs.locale, this.compId, "card_mostRuns_title")}</CardTitle>
              </CardHeader>
              <CardBody>
                {mostRuns.slides.length == 0 ?
                  <CarouselEmpty
                    prefs={prefs}
                    getString={getString}
                    compId={this.compId} /> :
                  <Carousel
                    activeIndex={mostRuns.activeIndex}
                    next={() => this.moveSlide(mostRuns, "next")}
                    previous={() => this.moveSlide(mostRuns, "previous")}
                    interval={false}>
                    <CarouselIndicators
                      items={Object.keys(mostRuns.slides)}
                      activeIndex={mostRuns.activeIndex}
                      onClickHandler={index => this.moveSlide(mostRuns, "goto", index)}
                    />
                    {this.renderStrategySlides(mostRuns.id, mostRuns.slides)}
                    <CarouselControl direction="prev" directionText="Previous" onClickHandler={() => this.moveSlide(mostRuns, "previous")} />
                    <CarouselControl direction="next" directionText="Next" onClickHandler={() => this.moveSlide(mostRuns, "next")} />
                  </Carousel>
                }
              </CardBody>
            </Card>
            {/* Most Saved */}
            <Card className="card-plain">
              <CardHeader>
                <CardTitle tag="h4">{getString(prefs.locale, this.compId, "card_mostSaved_title")}</CardTitle>
              </CardHeader>
              <CardBody>
                {mostSaved.slides.length == 0 ?
                  <CarouselEmpty
                    prefs={prefs}
                    getString={getString}
                    compId={this.compId} /> :
                  <Carousel
                    activeIndex={mostSaved.activeIndex}
                    next={() => this.moveSlide(mostSaved, "next")}
                    previous={() => this.moveSlide(mostSaved, "previous")}
                    interval={false}>
                    <CarouselIndicators
                      items={Object.keys(mostSaved.slides)}
                      activeIndex={mostSaved.activeIndex}
                      onClickHandler={index => this.moveSlide(mostSaved, "goto", index)}
                    />
                    {this.renderStrategySlides(mostSaved.id, mostSaved.slides)}
                    <CarouselControl direction="prev" directionText="Previous" onClickHandler={() => this.moveSlide(mostSaved, "previous")} />
                    <CarouselControl direction="next" directionText="Next" onClickHandler={() => this.moveSlide(mostSaved, "next")} />
                  </Carousel>
                }
              </CardBody>
            </Card>
          </>
        }
      </div>
    )
  }
}

export default StrategyGallery;

StrategyGallery.propTypes = {
  prefs: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  managers: PropTypes.object.isRequired,
  setNavbarTitleId: PropTypes.func.isRequired
}
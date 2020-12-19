import React from "react";
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
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Row,
  UncontrolledTooltip
} from "reactstrap";

import { orderBy, getDistinctValuesFromList, deepCloneObj, retrieveObjFromObjList, sleep } from "../../../core/utils";

import ModalStrategy from "../../modals/strategy/ModalStrategy";
import ModalStrategyView from "../../modals/strategy/ModalStrategyView";

import StrategyCardMini from "./StrategyCardMini";
import CarouselEmpty from "./CarouselEmpty";
import CarouselSkeleton from "./CarouselSkeleton";

class StrategyGallery extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase();

    this.state = {
      pageFirstLoading: true,
      modal_strategyDetail_isOpen: false,

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

      mySavedStrategies: []
    };

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
      this.prepareMySavedStrategies(),
      this.prepareMostRuns(),
      this.prepareMostSaved()
    ]
    await Promise.all(tasks)

    this.setState({ pageFirstLoading: false })
  }
  async prepareMySavedStrategies() {
    // 1. Query
    let query = {
      filters: {},
      order_by: "-usage",
      only_saved: true,
      page_size: 50
    }
    // 2. Strategies
    let strategies = await this.props.managers.app.strategyData(false, query)

    // 3. Saved IDs
    let mySavedStrategies = []
    for (var strategy of strategies.results) {
      mySavedStrategies.push(strategy.id)
    }
    this.setState({ mySavedStrategies })
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

  renderStrategyItem(slide) {
    return slide.map((strategy) => {
      strategy.isOwner = this.props.user.username === strategy.owner_username
      strategy.isSaved = this.state.mySavedStrategies.includes(strategy.id)

      return (
        <Col key={"strategy__" + strategy.id} xl={window.innerWidth > 1600 ? "2" : "3"} lg="4" md="4" sm="6" >
          <StrategyCardMini
            {...this.props}
            context="gallery"
            strategy={deepCloneObj(strategy)}
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
      case "view":
        this.viewClick(obj)
        break;
      case "save":
        await this.saveClick(obj)
        this.prepareRequirements()
        break;
    }
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
    let payload = {
      id: obj.id,
      is_saved: !obj.isSaved
    }
    await this.props.managers.app.strategySetSave(payload)
  }

  toggleModal(modalId) {
    this.setState({ ["modal_" + modalId + "_isOpen"]: !this.state["modal_" + modalId + "_isOpen"] });
  };

  render() {
    let { getString, prefs } = this.props;
    let {
      pageFirstLoading,
      modal_strategyDetail_isOpen,

      action,
      objData,

      mostRuns,
      mostSaved,

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
                    {this.renderStrategySlides(mostRuns.slides)}
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
                    {this.renderStrategySlides(mostSaved.slides)}
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
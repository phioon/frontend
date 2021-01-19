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
  Carousel,
  CarouselItem,
  CarouselControl,
  CarouselIndicators,
  Col,
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

      cWallets: 0,
      savedStrategyIds: [],

      redirectTo: undefined,
    };

    this.resize = this.resize.bind(this);
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

    if (this.state.mostRuns.maxItemsPerSlide != maxItemsPerSlide) {
      this.prepareMostRuns()          // async call
      this.prepareMostSaved()         // async call
    }
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
    let wallets = await this.props.managers.app.walletData()
    if (wallets.length > 0) {
      let tasks = [
        this.prepareSavedStrategies(),
        this.prepareMostRuns(),
        this.prepareMostSaved()
      ]
      await Promise.all(tasks)
    }

    this.setState({ pageFirstLoading: false, cWallets: wallets.length })
  }
  async prepareSavedStrategies() {
    let savedStrategies = await this.props.managers.app.savedStrategyData()
    let savedStrategyIds = getValueListFromObjList(savedStrategies, "uuid")

    this.setState({ savedStrategyIds })
  }
  async prepareMostRuns() {
    // 1. Query
    let query = {
      filters: {},
      order_by: "-usage"
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
      order_by: "-saved"
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
        maxItemsPerSlide += this.getMaxItemsPerSlide()
      }
    }

    if (items.length > 0)
      slides.push(items)

    carousel.slides = slides
    this.moveSlide(carousel, "goto", 0)

    return carousel
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
        this.shareClick(obj.uuid)
        break;
      case "goToStrategyPage":
        this.goToStrategyPage(obj.uuid)
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
      await this.props.managers.app.strategyUnsave(obj.uuid)
    else
      await this.props.managers.app.strategySave(obj.uuid)

    this.prepareSavedStrategies()
  }
  shareClick(uuid) {
    let { getString, prefs } = this.props;

    let pageLink = this.props.managers.app.strategyPageLink(uuid)
    navigator.clipboard.writeText(pageLink)

    let message = getString(prefs.locale, "generic", "label_sharedLinkCopied")
    this.props.notify("br", "success", "nc-icon nc-send", "shareStrategy", message)
  }
  goToStrategyPage(uuid) {
    let path = this.props.managers.app.strategyPagePath(uuid)
    this.props.history.push(path)
  }
  goToProfile(username) {
    let path = this.props.managers.app.userProfilePath(username)
    this.props.history.push(path)
  }

  renderNoWalletsCard(prefs, getString) {
    return (
      <Card className="card-stats">
        <Row>
          <Col xl="2" lg="2" md="3" xs="3" className="centered">
            <div className="icon-big text-center">
              <i className="nc-icon nc-alert-circle-i text-warning" />
            </div>
          </Col>
          <Col xl="10" lg="10" md="9" xs="9">
            <br />
            <p className="card-description">{getString(prefs.locale, this.compId, "label_noWallets_p1")}</p>
            <p className="card-description">{getString(prefs.locale, this.compId, "label_noWallets_p2")}</p>
          </Col>
        </Row>
        <CardFooter className="centered">
          <Button
            className="btn-simple btn-round"
            color="success"
            data-dismiss="modal"
            type="submit"
            onClick={() => this.setState({ redirectTo: "/app/myassets/wallets/" })}
          >
            {getString(prefs.locale, this.compId, "btn_goToWallets")}
          </Button>
        </CardFooter>
      </Card>
    )
  }
  renderStrategyItem(context, slide) {
    let { isRunning } = this.state;

    return slide.map((strategy) => {
      strategy.isOwner = this.props.user.username === strategy.owner_username
      strategy.isSaved = this.state.savedStrategyIds.includes(strategy.uuid)

      return (
        <Col key={"strategy__" + strategy.uuid} xl={window.innerWidth > 1600 ? "2" : "3"} lg="4" md="4" sm="6" >
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
      cWallets,

      redirectTo,
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

          cWallets == 0 ?
            // No Wallets
            this.renderNoWalletsCard(prefs, getString) :
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
        {redirectTo && <Redirect to={redirectTo} />}
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
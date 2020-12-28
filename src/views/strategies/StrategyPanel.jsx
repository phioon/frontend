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
  Form,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Row,
} from "reactstrap";
// react component used to create sweet alerts
import ReactBSAlert from "react-bootstrap-sweetalert";

import ModalStrategy from "../modals/strategy/ModalStrategy";

import StrategyCardMini from "./StrategyCardMini";
import ModalStrategyResults from "../modals/strategy/ModalStrategyResults";
import CarouselSkeleton from "./CarouselSkeleton";
import CarouselEmpty from "./CarouselEmpty";
import {
  deepCloneObj,
  getDistinctValuesFromList,
  getValueListFromObjList,
  orderBy,
} from "../../core/utils";

class StrategyPanel extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase();

    this.state = {
      pageFirstLoading: true,
      run_isLoading: false,
      modal_strategyDetail_isOpen: false,
      modal_strategyResults_isOpen: false,

      action: "create",
      objData: {},

      myStrategies: {
        id: "myStrategies",
        slides: [],
        activeIndex: 0,
      },
      savedStrategies: {
        id: "savedStrategies",
        slides: [],
        activeIndex: 0,
      },

      selected: {
        strategy: { rules: "{}" },
      },

      cWallets: 0,

      savedStrategyIds: [],
      strategies: [],
      sStrategyNames: [],
      redirectTo: undefined,
      alert: null,
    };

    this.resize = this.resize.bind(this);
    this.prepareMyStrategies = this.prepareMyStrategies.bind(this);
    this.setLoading = this.setLoading.bind(this);
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
    // Check User's subscription

    let wallets = await this.props.managers.app.walletData()

    let tasks = [
      this.prepareMyStrategies(),
      this.prepareSavedStrategies()
    ]
    await Promise.all(tasks)

    this.setState({ pageFirstLoading: false, cWallets: wallets.length })
  }
  async prepareMyStrategies() {
    // 1. Strategies
    let strategies = await this.props.managers.app.myStrategyData()
    strategies = orderBy(strategies, ['-create_time'])
    let sStrategyNames = getDistinctValuesFromList(strategies, "name")

    // 2. Carousel
    let carousel = this.prepareSlides(this.state.myStrategies, strategies)

    this.setState({ strategies, sStrategyNames, myStrategies: carousel })
  }
  async prepareSavedStrategies() {
    // 1. Strategies
    let strategies = await this.props.managers.app.savedStrategyData()
    let savedStrategyIds = getValueListFromObjList(strategies, "id")

    // 2. Carousel
    let carousel = this.prepareSlides(this.state.savedStrategies, strategies)

    this.setState({ savedStrategyIds, savedStrategies: carousel })
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
    return slide.map((strategy) => {
      strategy.isOwner = this.props.user.username === strategy.owner_username
      strategy.isSaved = this.state.savedStrategyIds.includes(strategy.id)

      return (
        <Col key={"strategy__" + strategy.id} xl={window.innerWidth > 1600 ? "2" : "3"} lg="4" md="4" sm="6" >
          <StrategyCardMini
            {...this.props}
            context={context}
            strategy={deepCloneObj(strategy)}
            onClick={this.onClick}
            isLoading={this.state.run_isLoading}
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
      case "goToProfile":
        this.goToProfile(obj.owner_username)
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
  goToProfile(username) {
    let path = this.props.managers.app.userProfilePath(username)
    this.props.history.push(path)
  }
  createClick() {
    let objData = {}
    this.setState({ action: "create", objData })
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
    let { prefs, getString } = this.props;

    this.setState({
      alert: (
        <ReactBSAlert
          warning
          style={{ display: "block", marginTop: "-100px" }}
          title={getString(prefs.locale, this.compId, "alert_confirming_title")}
          onConfirm={() => this.deleteObject(obj)}
          onCancel={() => this.hideAlert()}
          confirmBtnBsStyle="primary"
          cancelBtnBsStyle="danger"
          confirmBtnText={getString(prefs.locale, this.compId, "btn_alert_confirm")}
          cancelBtnText={getString(prefs.locale, this.compId, "btn_alert_cancel")}
          showCancel
        >
          {getString(prefs.locale, this.compId, "alert_confirming_text")}
        </ReactBSAlert>
      )
    });
  }
  async deleteObject(obj) {
    let result = await this.props.managers.app.myStrategyDelete(obj.id)

    if (result.status == 204)
      this.objectDeleted()
    else
      this.hideAlert()
  }
  objectDeleted() {
    let { prefs, getString } = this.props;

    this.setState({
      alert: (
        <ReactBSAlert
          success
          style={{ display: "block", marginTop: "-100px" }}
          title={getString(prefs.locale, this.compId, "alert_deleted_title")}
          onConfirm={() => this.hideAlert()}
          confirmBtnBsStyle="primary"
        >
          {getString(prefs.locale, this.compId, "alert_deleted_text")}
        </ReactBSAlert>
      )
    });

    this.prepareMyStrategies()
  }

  setLoading(context, value) {
    this.setState({ [`${context}_isLoading`]: value })
  }
  toggleModal(modalId) {
    this.setState({ [`modal_${modalId}_isOpen`]: !this.state[`modal_${modalId}_isOpen`] });
  };
  hideAlert() {
    this.setState({
      alert: null
    });
  };

  render() {
    let { prefs, getString } = this.props;
    let {
      pageFirstLoading,
      run_isLoading,
      modal_strategyDetail_isOpen,
      modal_strategyResults_isOpen,

      action,
      objData,

      myStrategies,
      savedStrategies,
      selected,

      cWallets,

      sStrategyNames,
      redirectTo,
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
          objData={objData}
          sStrategyNames={sStrategyNames}
          runItIfSuccess={this.prepareMyStrategies}
        />
        <ModalStrategyResults
          {...this.props}
          modalId="strategyResults"
          isOpen={modal_strategyResults_isOpen}
          toggleModal={this.toggleModal}
          setLoading={this.setLoading}
          isLoading={run_isLoading}
          onClick={this.onClick}
          strategy={selected.strategy}
        />
        <div className="header text-center">
          <h3 className="title">{getString(prefs.locale, this.compId, "title")}</h3>
        </div>
        <Row className="mt-4" />

        {pageFirstLoading ?
          // Carousel Skeleton
          <>
            <Card className="card-plain">
              <CardHeader>
                <CardTitle tag="h4">{getString(prefs.locale, this.compId, "card_myStrategies_title")}</CardTitle>
              </CardHeader>
              <CardBody>
                <CarouselSkeleton />
              </CardBody>
            </Card>
            <Card className="card-plain">
              <CardHeader>
                <CardTitle tag="h4">{getString(prefs.locale, this.compId, "card_savedStrategies_title")}</CardTitle>
              </CardHeader>
              <CardBody>
                <CarouselSkeleton />
              </CardBody>
            </Card>
          </>
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
                  onClick={() => this.setState({ goToWallets: true })}
                >
                  {getString(prefs.locale, this.compId, "btn_goToWallets")}
                </Button>
                {this.state.goToWallets && <Redirect to="/app/myassets/wallets/" />}
              </CardFooter>
            </Card>
            :
            <>
              {/* My Strategies */}
              <Card className="card-plain">
                <CardHeader>
                  {/* Title and Button*/}
                  <Row>
                    <Col xs="8">
                      <CardTitle tag="h4">{getString(prefs.locale, this.compId, "card_myStrategies_title")}</CardTitle>
                    </Col>
                    <Col xs="4" className="text-right">
                      <Button
                        id="strategy_new"
                        type="submit"
                        className="btn-round"
                        outline
                        color="success"
                        onClick={() => this.onClick("create")}
                      >
                        {getString(prefs.locale, this.compId, "btn_newStrategy")}
                      </Button>
                    </Col>
                  </Row>
                  {/* Search... */}
                  {myStrategies.slides.length > 0 &&
                    <Row>
                      <Col xl={window.innerWidth > 1600 ? "2" : "3"} lg="4" md="4" sm="6">
                        <Form>
                          <InputGroup className="no-border">
                            <Input
                              defaultValue=""
                              placeholder={getString(prefs.locale, "generic", "input_search")}
                              type="text"
                              onChange={e => this.search(myStrategies.id, e.target.value)}
                            />
                            <InputGroupAddon addonType="append">
                              <InputGroupText>
                                <i className="nc-icon nc-zoom-split" />
                              </InputGroupText>
                            </InputGroupAddon>
                          </InputGroup>
                        </Form>
                      </Col>
                    </Row>
                  }
                </CardHeader>
                <CardBody>
                  {myStrategies.slides.length == 0 ?
                    <CarouselEmpty
                      prefs={prefs}
                      getString={getString}
                      compId={this.compId}
                      context={myStrategies.id} /> :
                    <Carousel
                      activeIndex={myStrategies.activeIndex}
                      next={() => this.moveSlide(myStrategies, "next")}
                      previous={() => this.moveSlide(myStrategies, "previous")}
                      interval={false}>
                      <CarouselIndicators
                        items={Object.keys(myStrategies.slides)}
                        activeIndex={myStrategies.activeIndex}
                        onClickHandler={index => this.moveSlide(myStrategies, "goto", index)}
                      />
                      {this.renderStrategySlides(myStrategies.id, myStrategies.slides)}
                      <CarouselControl direction="prev" directionText="Previous" onClickHandler={() => this.moveSlide(myStrategies, "previous")} />
                      <CarouselControl direction="next" directionText="Next" onClickHandler={() => this.moveSlide(myStrategies, "next")} />
                    </Carousel>
                  }
                </CardBody>
              </Card>
              {/* Saved Strategies */}
              <Card className="card-plain">
                <CardHeader>
                  {/* Title and Button*/}
                  <Row>
                    <Col>
                      <CardTitle tag="h4">{getString(prefs.locale, this.compId, "card_savedStrategies_title")}</CardTitle>
                    </Col>
                    <Col className="text-right">
                      <Button
                        type="submit"
                        className="btn-round"
                        outline
                        color="success"
                        onClick={() => this.setState({ redirectTo: "/app/strategies/gallery/" })}
                      >
                        {getString(prefs.locale, this.compId, "btn_goToGallery")}
                      </Button>
                    </Col>
                  </Row>
                  {/* Search... */}
                  {savedStrategies.slides.length > 0 &&
                    <Row>
                      <Col xl={window.innerWidth > 1600 ? "2" : "3"} lg="4" md="4" sm="6">
                        <Form>
                          <InputGroup className="no-border">
                            <Input
                              defaultValue=""
                              placeholder={getString(prefs.locale, "generic", "input_search")}
                              type="text"
                            />
                            <InputGroupAddon addonType="append">
                              <InputGroupText>
                                <i className="nc-icon nc-zoom-split" />
                              </InputGroupText>
                            </InputGroupAddon>
                          </InputGroup>
                        </Form>
                      </Col>
                    </Row>
                  }
                </CardHeader>
                <CardBody>
                  {savedStrategies.slides.length == 0 ?
                    <CarouselEmpty
                      prefs={prefs}
                      getString={getString}
                      compId={this.compId}
                      context={savedStrategies.id} /> :
                    <Carousel
                      activeIndex={savedStrategies.activeIndex}
                      next={() => this.moveSlide(savedStrategies, "next")}
                      previous={() => this.moveSlide(savedStrategies, "previous")}
                      interval={false}>
                      <CarouselIndicators
                        items={Object.keys(savedStrategies.slides)}
                        activeIndex={savedStrategies.activeIndex}
                        onClickHandler={index => this.moveSlide(savedStrategies, "goto", index)}
                      />
                      {this.renderStrategySlides(savedStrategies.id, savedStrategies.slides)}
                      <CarouselControl direction="prev" directionText="Previous" onClickHandler={() => this.moveSlide(savedStrategies, "previous")} />
                      <CarouselControl direction="next" directionText="Next" onClickHandler={() => this.moveSlide(savedStrategies, "next")} />
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

export default StrategyPanel;

StrategyPanel.propTypes = {
  prefs: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  managers: PropTypes.object.isRequired,
  setNavbarTitleId: PropTypes.func.isRequired
}
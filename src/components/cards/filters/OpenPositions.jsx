import React, { Component } from "react";
import PropTypes from "prop-types";

import {
  Card,
  CardBody,
  Carousel,
  CarouselItem,
  CarouselControl,
  CarouselIndicators,
  Col,
  Row
} from "reactstrap";

// Filters
import PositionIntervalFilter from "./selects/PositionIntervalFilter";
import DimensionSelect from "./selects/DimensionSelect";

class FilterCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,
      isOpen: props.isOpen,

      carousel: { slides: [], activeIndex: 0 },
    };

    this.resize = this.resize.bind(this);
  }
  static getDerivedStateFromProps(props, state) {
    if (props.prefs.langId !== state.langId)
      return { langId: props.prefs.langId }
    if (props.isOpen !== state.isOpen)
      return {
        isOpen: props.isOpen,
        dimensions: props.dimensions,
      }
    if (props.dimensions !== state.dimensions)
      return { dimensions: props.dimensions }

    return null
  }
  componentDidMount() {
    window.addEventListener("resize", this.resize);

    this.prepareCarousel()
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.resize)
  }
  componentDidUpdate(prevProps) {
    if (this.props.dimensions !== prevProps.dimensions)
      this.prepareCarousel()
  }

  resize() {
    let maxItemsPerSlide = this.getMaxItemsPerSlide()

    if (this.state.carousel.maxItemsPerSlide != maxItemsPerSlide)
      this.prepareCarousel()          // async call
  }
  getMaxItemsPerSlide() {
    if (window.innerWidth < 576)
      return 3
    else if (window.innerWidth < 768)
      return 3
    else if (window.innerWidth < 990)
      return 3
    else if (window.innerWidth < 1200)
      return 3
    else if (window.innerWidth < 1600)
      return 3
    else
      return 5
  }

  getFilterElements() {
    let { langId, compId } = this.state;

    return [
      <Col key={`filter__positionInterval`} xs="12" md="6">
        <PositionIntervalFilter
          getString={this.props.getString}
          prefs={this.props.prefs}
          onSelectionChange={this.props.onSelectionChange}
          dimension={this.props.dimensions.dates}
          allowIntervalExchange
        />
      </Col>,
      <Col key={`filter__wallets`} xs="6" md="3">
        <DimensionSelect
          titleTxt={this.props.getString(langId, compId, "label_wallet")}
          placeholderTxt={this.props.getString(langId, "generic", "input_select")}
          onSelectionChange={this.props.onSelectionChange}
          dimension={this.props.dimensions.wallets}
        />
      </Col>,
      <Col key={`filter__assets`} xs="6" md="3">
        <DimensionSelect
          titleTxt={this.props.getString(langId, compId, "label_asset")}
          placeholderTxt={this.props.getString(langId, "generic", "input_select")}
          onSelectionChange={this.props.onSelectionChange}
          dimension={this.props.dimensions.pAssets}
        />
      </Col>,
      <Col key={`filter__types`} xs="6" md="3">
        <DimensionSelect
          titleTxt={this.props.getString(langId, compId, "label_type")}
          placeholderTxt={this.props.getString(langId, "generic", "input_select")}
          onSelectionChange={this.props.onSelectionChange}
          dimension={this.props.dimensions.types}
        />
      </Col>,
      <Col key={`filter__sectors`} xs="6" md="3">
        <DimensionSelect
          titleTxt={this.props.getString(langId, compId, "label_sector")}
          placeholderTxt={this.props.getString(langId, "generic", "input_select")}
          onSelectionChange={this.props.onSelectionChange}
          dimension={this.props.dimensions.sectors}
        />
      </Col>,
    ]
  }

  prepareCarousel() {
    // 1. Filters
    let filters = this.getFilterElements()

    // 2. Carousel
    let carousel = this.prepareSlides(this.state.carousel, filters)

    this.setState({ filters, carousel })
  }
  prepareSlides(carousel, filters) {
    let slides = []
    let items = []
    let maxItemsPerSlide = this.getMaxItemsPerSlide()

    for (var x = 0; x < filters.length; x++) {
      items.push(filters[x])

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

  renderItems(slide) {
    return slide.map((filterElement) => {
      return (filterElement)
    })
  }
  renderSlides(slides) {
    return slides.map((slide, key) => {
      return (
        <CarouselItem key={"item__" + key}>
          <Row>
            {this.renderItems(slide)}
          </Row>
          <br />
        </CarouselItem>
      )
    })
  }

  render() {
    let { carousel } = this.state;

    return (
      <Card className="card-plain">
        <CardBody>
          <Card>
            <Carousel
              activeIndex={carousel.activeIndex}
              next={() => this.moveSlide("next")}
              previous={() => this.moveSlide("previous")}
              interval={false}>
              <CarouselIndicators
                items={Object.keys(carousel.slides)}
                activeIndex={carousel.activeIndex}
                onClickHandler={index => this.moveSlide("goto", index)}
              />
              {this.renderSlides(carousel.slides)}
              <CarouselControl direction="prev" directionText="Previous" onClickHandler={() => this.moveSlide("previous")} />
              <CarouselControl direction="next" directionText="Next" onClickHandler={() => this.moveSlide("next")} />
            </Carousel>
          </Card>
        </CardBody>
      </Card>
    );
  }
}

export default FilterCard;

FilterCard.propTypes = {
  managers: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  dimensions: PropTypes.object.isRequired,
  onSelectionChange: PropTypes.func.isRequired,
}
import React, { Component } from "react";
import PropTypes from "prop-types";

import { sleep } from "../../../core/utils";

import {
  Button,
  Card,
  CardTitle,
  CardBody,
  Carousel,
  CarouselItem,
  CarouselControl,
  CarouselIndicators,
  Collapse,
  Row
} from "reactstrap";

class FilterCard extends Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase()
    this.state = {
      isOpen: false,

      carousel: { slides: [], activeIndex: 0 },
    };

    this.resize = this.resize.bind(this);
  }
  componentDidMount() {
    window.addEventListener("resize", this.resize);

    this.prepareCarousel()
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.resize);
  }
  componentDidUpdate(prevProps) {
    if (this.props.dimensions !== prevProps.dimensions)
      this.prepareCarousel()
    if (this.props.pageFirstLoading !== prevProps.pageFirstLoading)
      this.openDelay(this.props.delayTriggerDimension)
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
      return 2
    else if (window.innerWidth < 990)
      return 4
    else if (window.innerWidth < 1200)
      return 4
    else if (window.innerWidth < 1600)
      return 4
    else
      return 6
  }

  async openDelay(dimension) {
    if (dimension in this.props.dimensions && this.props.dimensions[dimension].data.length > 0) {
      this.moveSlide("next")
      await sleep(1000)
      this.setState({ isOpen: true })
      await sleep(300)
      this.moveSlide("previous")
    }
  }

  prepareCarousel() {
    // 1. Filter Elements
    let elements = this.props.children;

    // 2. Carousel
    let carousel = this.prepareSlides(this.state.carousel, elements)

    this.setState({ carousel })
  }
  prepareSlides(carousel, elements) {
    let slides = []
    let items = []
    let maxItemsPerSlide = this.getMaxItemsPerSlide()
    let doubleElements = ["filter__openDates", "filter__closeDates"]

    for (var x = 0; x < elements.length; x++) {
      items.push(elements[x])

      // There are some elements that use more than 1 slot...
      let extraSpace = doubleElements.includes(elements[x].key) ? 1 : 0
      if (extraSpace > 0)
        maxItemsPerSlide -= 1

      if (x == maxItemsPerSlide - 1) {
        slides.push(items)
        items = []
        maxItemsPerSlide += this.getMaxItemsPerSlide()
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
    let { getString, prefs } = this.props;
    let { carousel, isOpen } = this.state;

    return (
      <Card className="card-plain">
        <CardBody>
          <CardTitle className="justify-content-end text-right">
            <Button
              className="btn-round"
              size="sm"
              color="default"
              outline
              onClick={() => this.props.clearSelection()}
            >
              <small>{getString(prefs.locale, this.compId, "label_clear")}</small>
            </Button>
            <Button
              className="btn-icon btn-round"
              size="sm"
              color="default"
              outline
              onClick={() => this.setState({ isOpen: !this.state.isOpen })}
            >
              <i id={isOpen ? "filter_close" : "filter_open"} className="fa fa-filter" />
            </Button>
          </CardTitle>
          <Collapse isOpen={isOpen}>
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
          </Collapse>
        </CardBody>
      </Card>
    );
  }
}

export default FilterCard;

FilterCard.propTypes = {
  prefs: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  dimensions: PropTypes.object.isRequired,
  clearSelection: PropTypes.func
}
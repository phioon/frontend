import React, { Component } from "react";
import PropTypes from "prop-types";

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
    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,
      collapseIsOpen: true,

      carousel: { slides: [], activeIndex: 0 },
    };

    this.resize = this.resize.bind(this);
  }
  static getDerivedStateFromProps(props, state) {
    if (props.prefs.langId !== state.langId)
      return { langId: props.prefs.langId }

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
    let { getString } = this.props;
    let { langId, compId, carousel, collapseIsOpen } = this.state;

    return (
      <Card className="card-plain">
        <CardBody>
          <CardTitle className="justify-content-end text-right">
            <Button className="btn-simple" size="sm" outline onClick={() => this.props.clearSelection()}>
              <small>{getString(langId, compId, "label_clear")}</small>
            </Button>
            <Button className="btn-icon btn-simple" size="sm" onClick={() => this.setState({ collapseIsOpen: !this.state.collapseIsOpen })}>
              <i className="fa fa-filter" />
            </Button>
          </CardTitle>
          <Collapse isOpen={collapseIsOpen}>
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
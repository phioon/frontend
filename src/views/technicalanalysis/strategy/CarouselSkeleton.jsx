import React from "react";
// reactstrap components
import {
  Carousel,
  CarouselItem,
  CarouselControl,
  Col,
  Row,
} from "reactstrap";
import Skeleton from "react-loading-skeleton";

function CarouselSkeleton() {
  return (
    <Carousel
      activeIndex={0}
      next={() => { return null }}
      previous={() => { return null }}
      interval={false}>
      <CarouselItem key={"skeleton__0"}>
        <Row>
          <Col xl={window.innerWidth > 1600 ? "2" : "3"} lg="4" md="4" sm="6" >
            <Skeleton height={115} />
          </Col>
          <Col xl={window.innerWidth > 1600 ? "2" : "3"} lg="4" md="4" sm="6" >
            <Skeleton height={115} />
          </Col>
          <Col xl={window.innerWidth > 1600 ? "2" : "3"} lg="4" md="4" sm="6" >
            <Skeleton height={115} />
          </Col>
        </Row>
      </CarouselItem>
      <CarouselItem key={"skeleton__1"} />
    </Carousel>
  )
}

export default CarouselSkeleton;
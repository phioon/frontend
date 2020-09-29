import React from "react";
// reactstrap components
import {
  Card,
  Carousel,
  CarouselItem,
  Col,
  Row,
} from "reactstrap";
import Skeleton from "react-loading-skeleton";

function SkeletonCol() {
  return (
    <Col xl={window.innerWidth > 1600 ? "2" : "3"} lg="4" md="4" sm="6" >
      <Card className="card-plain">
        <Skeleton height={115} />
      </Card>
    </Col>
  )
}

function CarouselSkeleton() {
  return (
    <Carousel
      activeIndex={0}
      next={() => { return null }}
      previous={() => { return null }}
      interval={false}>
      <CarouselItem key={"skeleton__0"}>
        <Row>
          <SkeletonCol />
          <SkeletonCol />
          {window.innerWidth > 576 && <SkeletonCol />}
          {window.innerWidth > 576 && <SkeletonCol />}

          {window.innerWidth > 768 && <SkeletonCol />}
          {window.innerWidth > 768 && <SkeletonCol />}

          {window.innerWidth > 1200 && <SkeletonCol />}
          {window.innerWidth > 1200 && <SkeletonCol />}

          {window.innerWidth > 1600 && <SkeletonCol />}
          {window.innerWidth > 1600 && <SkeletonCol />}
          {window.innerWidth > 1600 && <SkeletonCol />}
          {window.innerWidth > 1600 && <SkeletonCol />}
        </Row>
      </CarouselItem>
      <CarouselItem key={"skeleton__1"} />
    </Carousel>
  )
}

export default CarouselSkeleton;
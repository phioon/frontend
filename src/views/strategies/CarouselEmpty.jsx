import React from "react";
// reactstrap components
import {
  Card,
  CardBody,
  CardFooter,
  Carousel,
  CarouselItem,
  Col,
  Row,
} from "reactstrap";

function CarouselEmpty(props) {
  return (
    <Carousel
      activeIndex={0}
      next={() => { return null }}
      previous={() => { return null }}
      interval={false}>
      <CarouselItem key={"skeleton__0"} >
        <Row className="centered">
          <Col lg="8" md="10" sm="12" >
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <Col xl="2" lg="2" md="3" xs="3" className="centered">
                    <div className="icon-big text-center">
                      <i className="nc-icon nc-alert-circle-i text-warning" />
                    </div>
                  </Col>
                  <Col xl="10" lg="10" md="9" xs="9">
                    <br />
                    <p className="card-description">
                      {props.getString(props.prefs.locale, props.compId, `label_${props.context}_noStrategies_p1`)}
                    </p>
                    <p className="card-description">
                      {props.getString(props.prefs.locale, props.compId, `label_${props.context}_noStrategies_p2`)}
                    </p>
                  </Col>
                </Row>
              </CardBody>
              <CardFooter />
            </Card>
          </Col>
        </Row>
      </CarouselItem>
      <CarouselItem key={"skeleton__1"} />
    </Carousel>
  )
}

export default CarouselEmpty;
import React from "react";
import PropTypes from "prop-types";
// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Col,
  FormGroup,
  Input,
  Modal,
  Row,
} from "reactstrap";

import StrategyRating from "../../strategies/components/StrategyRating";
import { verifyLength } from "../../../core/utils";

class ModalNewReview extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase();

    this.state = {
      review: this.defaultObject()
    };

    this.onChange = this.onChange.bind(this);
  }
  componentDidUpdate(prevProps) {
    if (prevProps.isOpen !== this.props.isOpen)
      if (this.props.isOpen)
        this.prepareRequirements()
    if (prevProps.strategy !== this.props.strategy)
      this.fakeUnmount()
  }

  prepareRequirements() {
    let { strategy } = this.props;

    let review = this.defaultObject();

    if (strategy.my_rating)
      review = this.onChange("rating", strategy.my_rating)

    this.setState({ review })
  }

  defaultObject() {
    return {
      data: {
        rating: 0,
        review: "",
      },
      states: {
        rating: "",
        review: "has-success",
      },
      isValidated: undefined
    }
  }
  fakeUnmount() {
    let review = this.defaultObject()
    this.setState({ review })
  }

  onChange(stateName, value) {
    let newState = { review: this.state.review }

    if (stateName === "rate") {
      // Adapting for this Modal...
      stateName = "rating"
      value = value.rating
    }

    newState.review.data[stateName] = value

    switch (stateName) {
      case "rating":
        newState.review.states[stateName] = "has-success"
        break;
      case "review":
        if (verifyLength(value, 0, 1000))
          newState.review.states[stateName] = "has-success"
        else
          newState.review.states[stateName] = "has-danger"
        break;
    }

    newState.review.isValidated = this.isValidated(newState.review)

    this.setState(newState)
    return newState.review
  }
  isValidated(obj) {
    for (var state of Object.values(obj.states))
      if (state !== "has-success")
        return false

    return true
  }

  onClick(action, obj) {
    switch (action) {
      case "rate":
        this.rateClick(obj)
        break;
    }
  }
  rateClick(obj) {
    let payload = {
      uuid: this.props.strategy.uuid,
      rating: obj.data.rating
    }
    if (obj.data.review.length > 0)
      payload.review = obj.data.review

    this.props.onClick("rate", payload)
    this.props.toggleModal(this.props.modalId)
  }

  // Components
  starsForDeviceSm(prefs, getString, strategy) {
    return (
      <Row className="justify-content-center">
        <Col md="6" className="description centered">
          {window.innerWidth < 768 ?
            getString(prefs.locale, this.compId, "label_tapToRate") :
            getString(prefs.locale, this.compId, "label_clickToRate")
          }
        </Col>
        {/* Starts */}
        <Col md="6" className="centered">
          <StrategyRating onClick={this.onChange} strategy={strategy} rating={strategy.my_rating} />
        </Col>
      </Row>
    )
  }
  starsForDeviceMd(prefs, getString, strategy) {
    return (
      <Row className="justify-content-center">
        <div md="6" className="description centered">
          {getString(prefs.locale, this.compId, "label_clickToRate")}:
        </div>
        {" "}
        {/* Starts */}
        <StrategyRating onClick={this.onChange} strategy={strategy} rating={strategy.my_rating} />
      </Row>
    )
  }

  render() {
    let { prefs, getString, modalId, isOpen, strategy } = this.props;

    let { review } = this.state;

    return (
      <Modal isOpen={isOpen} size="md" toggle={() => this.props.toggleModal(modalId)}>
        <Card className="card-plain">
          <CardHeader className="modal-header">
            <button
              aria-hidden={true}
              className="close"
              data-dismiss="modal"
              type="button"
              onClick={() => this.props.toggleModal(modalId)}
            >
              <i className="nc-icon nc-simple-remove" />
            </button>
            <h5 className="modal-title" id={modalId}>
              {getString(prefs.locale, this.compId, "title")}
            </h5>
            <br />
            <label className="description">
              <b>{strategy.name}</b>
              {` ${getString(prefs.locale, this.compId, "label_createdBy")} `}
              <a
                href={this.props.managers.app.userProfilePath(strategy.owner_username)}
                onClick={e => {
                  e.preventDefault();
                  this.props.onClick("goToProfile", strategy)
                }}
              >
                @{strategy.owner_username}
              </a>
            </label>
            <hr />
          </CardHeader>
          <CardBody>
            {/* Rating */}
            {window.innerWidth < 768 ?
              this.starsForDeviceSm(prefs, getString, strategy) :
              this.starsForDeviceMd(prefs, getString, strategy)
            }
            <Row className="mt-3" />
            {/* Review */}
            <FormGroup className={`has-label ${review.states.review}`}>
              <label>{getString(prefs.locale, this.compId, "input_review")}:</label>
              <Input
                type="textarea"
                name="review"
                value={review.data.desc}
                onChange={e => this.onChange(e.target.name, e.target.value)}
              />
              {review.states.review == "has-danger" &&
                <label className="error">
                  {getString(prefs.locale, this.compId, "error_review")}
                </label>
              }
            </FormGroup>
          </CardBody>
          <CardFooter className="text-center">
            <Button
              className="btn-simple btn-round"
              color="success"
              data-dismiss="modal"
              type="submit"
              disabled={!review.isValidated}
              onClick={() => this.onClick("rate", review)}
            >
              {getString(prefs.locale, this.compId, "btn_footer")}
            </Button>
          </CardFooter>
        </Card>
      </Modal>
    )
  }
}

export default ModalNewReview;

ModalNewReview.propTypes = {
  prefs: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  managers: PropTypes.object.isRequired,

  strategy: PropTypes.object.isRequired,
}
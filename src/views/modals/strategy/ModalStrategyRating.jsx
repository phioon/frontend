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
  UncontrolledTooltip,
} from "reactstrap";

class ModalStrategyRating extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase();

    this.state = {
      rating: {
        data: {
          rating: 0,
          review: ""
        },
        states: {
          rating: "",
          review: ""
        }
      }
    };
  }
  componentDidUpdate(prevProps) {
    if (prevProps.isOpen !== this.props.isOpen)
      this.setState({ firstLoading: true })
  }

  prepareRequirements() {

  }

  onChange(stateName, value) {
    let newState = { rating: this.state.rating }

    newState.rating.data[stateName] = value

    switch (stateName) {
      case "review":
        if (verifyLength(value, 0, 1000))
          newState.rating.states[stateName] = "has-success"
        else
          newState.rating.states[stateName] = "has-danger"
        break;
    }
    newState.rating.isValidated = this.isValidated(newState.rating)

    this.setState(newState)
  }
  isValidated(obj) {
    for (var state of Object.values(obj.states))
      if (state !== "has-success")
        return false

    return true
  }

  onClick(action, obj) {
    switch (action) {
      case "":
        break;
    }
  }
  onRateClick(strategy, rateValue) {

  }

  render() {
    let { prefs, getString, modalId, isOpen, strategy } = this.props;

    let { rating } = this.state;

    return (
      <Modal isOpen={isOpen} size="sm" toggle={() => this.props.toggleModal(modalId)}>
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
              {strategy.name}
            </h5>
            <hr />
          </CardHeader>
          <CardBody>
            {/* Review */}
            <FormGroup className={`has-label ${rating.states.review}`}>
              <label>{getString(prefs.locale, this.compId, "input_review")}</label>
              <Input
                type="textarea"
                name="review"
                value={rating.data.desc}
                onChange={e => this.onChange(e.target.name, e.target.value)}
              />
              {rating.states.review == "has-danger" &&
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
              onClick={() => this.props.toggleModal(modalId)}
            >
              {getString(prefs.locale, this.compId, "btn_footer")}
            </Button>
          </CardFooter>
        </Card>
      </Modal>
    )
  }
}

export default ModalStrategyRating;

ModalStrategyRating.propTypes = {
  prefs: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  managers: PropTypes.object.isRequired,

  strategy: PropTypes.object.isRequired,
}
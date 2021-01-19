import React from "react";
import PropTypes from "prop-types";
import { Button } from "reactstrap";

class StrategyRating extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      rating: 0,
      onHover: 0,
    }
  }
  componentDidMount() {
    this.prepareRequirements()
  }
  componentDidUpdate(prevProps) {
    if (prevProps.rating !== this.props.rating) {
      this.prepareRequirements()
    }
  }

  prepareRequirements() {
    if (this.props.rating) {
      let autoSubmit = false
      this.onChange("rating", this.props.rating, autoSubmit)
    }
  }

  onChange(stateName, value, autoSubmit = true) {
    let newState = {}

    switch (stateName) {
      case "rating":
        if (autoSubmit && this.state[stateName] !== value) {
          let payload = { rating: value }
          this.props.onClick("rate", payload)
        }
        break;
    }

    newState[stateName] = value

    this.setState(newState)
  }

  renderStars(rating, onHover) {
    let value = 0

    if (onHover > rating)
      value = onHover
    else if (rating > 0)
      value = rating
    else
      value = onHover

    let states = [
      value > 0.75 ? "full" : value > 0.25 ? "half" : "empty",
      value > 1.75 ? "full" : value > 1.25 ? "half" : "empty",
      value > 2.75 ? "full" : value > 2.25 ? "half" : "empty",
      value > 3.75 ? "full" : value > 3.25 ? "half" : "empty",
      value > 4.75 ? "full" : value > 4.25 ? "half" : "empty",
    ]

    return states.map((state, i) => {
      let rValue = i + 1
      return (
        <span key={i}>
          {this.renderStar(state, rValue)}
        </span>
      )
    })
  }
  renderStar = (state, rValue) => {
    let iClass = undefined
    switch (state) {
      case "empty":
        iClass = "far fa-star"
        break;
      case "half":
        iClass = "fas fa-star-half-alt"
        break;
      case "full":
        iClass = "fas fa-star"
        break;
    }

    return (
      <Button
        className="btn-icon btn-neutral"
        color="info"
        onMouseOver={() => this.onChange("onHover", rValue)}
        onMouseOut={() => this.onChange("onHover", 0)}
        onClick={() => this.onChange("rating", rValue)}
      >
        <i className={iClass} />
      </Button>
    )
  }

  render() {
    let { rating, onHover } = this.state;

    return (
      <div>
        {this.renderStars(rating, onHover)}
      </div>
    )
  }
}

export default StrategyRating;

StrategyRating.propTypes = {
  onClick: PropTypes.func.isRequired,
};
import React from "react";
import PropTypes from "prop-types";
import { Button } from "reactstrap";

class StrategyRating extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			rating: { rating: 0, review: "", onHover: 0 },
		}
	}

	onChange(stateName, value) {
		let newState = { rating: this.state.rating }

		switch (stateName) {
			case "rating":
				if (newState.rating[stateName] !== value)
					this.props.onClick("rate", value)
				break;
		}

		newState.rating[stateName] = value

		this.setState(newState)
	}

	renderStars(rating) {
		let value = rating.rating > 0 ? rating.rating : rating.onHover

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
		let { rating } = this.state;

		return (
			<div>
				{this.renderStars(rating)}
			</div>
		)
	}
}

export default StrategyRating;

StrategyRating.propTypes = {
	onClick: PropTypes.func.isRequired,
	strategy: PropTypes.object.isRequired
};
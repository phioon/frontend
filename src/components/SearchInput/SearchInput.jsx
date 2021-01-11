import React from "react";
import PropTypes from "prop-types";
import {
	Form,
	Input,
	InputGroup,
	InputGroupAddon,
	InputGroupText,
} from "reactstrap";

class SearchEngine extends React.Component {
	constructor(props) {
		super(props);
		this.compId = this.constructor.name.toLowerCase();

		this.state = {}
	}

	onChange(value) {
		this.props.onQueryChange(value)
	}
	onClick() {
		this.props.history.push("/app/search/")
	}
	onSubmit(e) {
		e.preventDefault()
		this.props.setCollapse(false)
	}

	render() {
		let { prefs, getString, sQuery } = this.props;

		return (
			<Form onSubmit={e => this.onSubmit(e)}>
				<InputGroup className="no-border">
					<Input
						value={sQuery}
						placeholder={getString(prefs.locale, "generic", "input_search")}
						onChange={e => this.onChange(e.target.value)}
						onClick={() => this.onClick()}
						type="text" />
					<InputGroupAddon addonType="append">
						<InputGroupText>
							<i className="nc-icon nc-zoom-split" />
						</InputGroupText>
					</InputGroupAddon>
				</InputGroup>
			</Form>
		)
	}
}

export default SearchEngine;

SearchEngine.propTypes = {
	managers: PropTypes.object.isRequired,
	getString: PropTypes.func.isRequired,
	prefs: PropTypes.object.isRequired,
	sQuery: PropTypes.string
}

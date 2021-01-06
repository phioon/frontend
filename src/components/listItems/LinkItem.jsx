import React from "react";
import PropTypes from "prop-types";
// reactstrap components
import {
	Button,
	Col,
	Row,
	FormGroup,
	Input,
} from "reactstrap";

class LinkItem extends React.Component {
	constructor(props) {
		super(props);
		this.compId = this.constructor.name.toLowerCase();

		this.state = {

		};
	}

	render() {
		let { getString, prefs, item } = this.props;
		let { onHover } = this.state;

		return (
			<Row
				className="align-center"
				onMouseOver={() => this.setState({ onHover: true })}
				onMouseLeave={() => this.setState({ onHover: false })}
			>
				{/* Name */}
				<Col xl="3" xs="4">
					<FormGroup className={`has-label ${item.states.name}`}>
						<label>{getString(prefs.locale, this.compId, "input_name")}</label>
						<Input
							type="text"
							name="link_name"
							value={item.data.name}
							onChange={e => this.props.onChangeItem(this.props.i, "name", e.target.value)}
						/>
					</FormGroup>
				</Col>
				{/* URL */}
				<Col xl="7" xs="6">
					<FormGroup className={`has-label ${item.states.url}`}>
						<label>{getString(prefs.locale, this.compId, "input_url")}</label>
						<Input
							type="text"
							name="link_url"
							value={item.data.url}
							onChange={e => this.props.onChangeItem(this.props.i, "url", e.target.value)}
						/>
					</FormGroup>
				</Col>
				{/* Actions */}
				<Col xs="2" className="text-right">
					<Button
						className={`btn-icon ${onHover ? "btn-round" : "btn-neutral"}`}
						size="sm"
						color="danger"
						outline={onHover ? true : false}
						onClick={() => this.props.onLinkCommit("delete", this.props.i)}
					>
						{onHover && <i className="nc-icon nc-simple-remove" />}
					</Button>
				</Col>
			</Row>
		)
	}
}

export default LinkItem;

LinkItem.propTypes = {
	getString: PropTypes.func.isRequired,
	prefs: PropTypes.object.isRequired,
	item: PropTypes.object.isRequired,
}
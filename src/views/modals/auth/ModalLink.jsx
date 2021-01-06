import React from "react";
import PropTypes from "prop-types";
// reactstrap components
import {
	Button,
	Card,
	CardHeader,
	CardBody,
	CardFooter,
	FormGroup,
	Modal,
	Input
} from "reactstrap";

import LabelAlert from "../../../components/LabelAlert";
import { verifyLength, verifyURL } from "../../../core/utils";

class ModalLink extends React.Component {
	constructor(props) {
		super(props);
		this.compId = this.constructor.name.toLowerCase()

		this.state = {
			object: this.defaultLinkObj(),

			alertState: null,
			alertMsg: null,
		};
	}
	componentDidUpdate(prevProps) {
		if (prevProps.isOpen !== this.props.isOpen)
			if (this.props.isOpen)
				this.prepareRequirements()
			else
				this.fakeUnmount()
	}

	defaultLinkObj() {
		return {
			data: {
				name: "",
				url: "https://",
			},
			initial: {},
			states: {
				name: "",
				url: "",
			},
			isValidated: undefined
		}
	}
	fakeUnmount() {
		let newState = { object: this.state.object }

		newState.object = this.defaultLinkObj()

		this.setState(newState)
	}

	prepareRequirements() {
		let { action, objData } = this.props;
		let { object } = this.state;

		switch (action) {
			case "add":
				this.prepareToAdd()
				break;
			case "update":
				object = this.prepareToUpdate(object, objData)
				break;
		}

		this.setState({ link: object })
	}
	prepareToAdd() {
		// Nothing to do...
	}
	prepareToUpdate(object, objData) {

		// Data
		object.data.name = objData.name
		object.data.url = objData.url
		// Initial
		object.initial = deepCloneObj(object.data)
		// States
		object.states.name = "has-success"
		object.states.desc = "has-success"

		return object
	}

	onChange(fieldName, value) {
		let newState = { object: this.state.object };

		if (this.state.labelAlertState !== null) {
			newState.alertState = null
			newState.alertMsg = ""
		}

		newState.object.data[fieldName] = value

		switch (fieldName) {
			case "name":
				if (verifyLength(value, 1))
					newState.object.states[fieldName] = "has-success"
				else
					newState.object.states[fieldName] = "has-danger"
				break;
			case "url":
				if (verifyURL(value))
					newState.object.states[fieldName] = "has-success"
				else
					newState.object.states[fieldName] = "has-danger"
				break;
		}

		newState.object.isValidated = this.isValidated(newState.object)
		this.setState(newState)
	}

	isValidated(obj) {
		for (var state of Object.values(obj.states))
			if (state != "has-success")
				return false
		return true
	}

	confirmClick(action, object, index) {
		this.props.onCommit(action, object.data, index)

		this.props.toggleModal(this.props.modalId)
	}

	render() {
		let { prefs, getString, isOpen, modalId, action } = this.props;

		let {
			object,
			alertState,
			alertMsg
		} = this.state;

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
							{getString(prefs.locale, this.compId, `title_${action}`)}
						</h5>
						<hr />
						<label>
							<p>{getString(prefs.locale, this.compId, "label_intro_p1")}</p>
						</label>
					</CardHeader>
					<CardBody>
						{/* Name */}
						<FormGroup className={`has-label ${object.states.name}`}>
							<label>{getString(prefs.locale, this.compId, "input_name")}</label>
							<Input
								type="text"
								name="link_name"
								value={object.data.name}
								onChange={e => this.onChange("name", e.target.value)}
							/>
						</FormGroup>
						{/* URL */}
						<FormGroup className={`has-label ${object.states.url}`}>
							<label>{getString(prefs.locale, this.compId, "input_url")}</label>
							<Input
								type="text"
								name="link_url"
								value={object.data.url}
								onChange={e => this.onChange("url", e.target.value)}
							/>
						</FormGroup>
					</CardBody>
					<CardFooter className="text-center">
						<LabelAlert alertState={alertState} alertMsg={alertMsg} />
						<Button
							className="btn-simple btn-round"
							color="success"
							data-dismiss="modal"
							type="submit"
							disabled={object.isValidated ? false : true}
							onClick={() => this.confirmClick(action, object, this.props.index)}
						>
							{getString(prefs.locale, this.compId, ["btn_" + action])}
						</Button>
					</CardFooter>
				</Card>
			</Modal>
		)
	}
}

export default ModalLink;

ModalLink.propTypes = {
	prefs: PropTypes.object.isRequired,
	getString: PropTypes.func.isRequired,
	modalId: PropTypes.string.isRequired,
	isOpen: PropTypes.bool.isRequired,
	toggleModal: PropTypes.func.isRequired
}
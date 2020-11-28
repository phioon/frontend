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
  UncontrolledTooltip
} from "reactstrap";
// react plugin used to create DropdownMenu for selecting items
import Select from "react-select";

import { applyFilterToObjList, retrieveObjFromObjList, getDistinctValuesFromList } from "../../../../core/utils";

class ModalQuoteDetail extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase()

    this.state = {
      typeOptions: [],

      indicator: {
        item: undefined,
        data: {
          type: "",
        },
        states: {
          type: "",
        },

        isValidated: undefined
      },
    }
  }
  componentDidUpdate(prevProps) {
    if (prevProps.isOpen !== this.props.isOpen && this.props.isOpen)
      this.prepareRequirements()
  }

  fakeUnmount() {
    let newState = { indicator: this.state.indicator }

    newState.typeOptions = []

    newState.indicator = {
      item: undefined,
      data: {
        type: "",
      },
      states: {
        type: "",
      },

      isValidated: undefined
    }

    this.setState(newState)
  }

  prepareRequirements() {
    // Prepares the Component
    let { prefs, getString, items, action, workspace, selectedItem } = this.props;
    let { indicator } = this.state;

    let distinctValues = []
    let typeOptions = []

    // Type
    distinctValues = getDistinctValuesFromList(items, "id")
    for (var value of distinctValues)
      if (selectedItem && selectedItem.value == value || !retrieveObjFromObjList(workspace, "value", value)) {
        // If it's a selected item (being updated) or it isn't within origin WS yet...
        typeOptions.push({
          value: value,
          label: getString(prefs.locale, "indicators", value)
        })
      }
      else
        typeOptions.push({
          value: value,
          label: getString(prefs.locale, "indicators", value),
          isDisabled: true
        })

    switch (action) {
      case "add":
        indicator = this.prepareToAdd(typeOptions, indicator)
        break;
      case "update":
        indicator = this.prepareToUpdate(typeOptions, indicator, selectedItem)
        break;
      default:
        break;
    }

    this.setState({ typeOptions, indicator })
  }

  prepareToAdd(typeOptions, indicator) {
    for (var obj of typeOptions)
      if (obj.value == "close" && !obj.isDisabled)
        this.onSelectChange("type", obj)

    return indicator
  }
  prepareToUpdate(typeOptions, indicator, selectedItem) {
    // Item
    indicator.item = selectedItem
    indicator.isValidated = true

    // Type
    let selectedType = retrieveObjFromObjList(typeOptions, "value", selectedItem.id)
    this.onSelectChange("type", selectedType)

    return indicator
  }

  onSelectChange(fieldName, value) {
    let newState = { indicator: this.state.indicator }

    newState.indicator.data[fieldName] = value

    switch (fieldName) {
      case "type":
        newState.indicator.states[fieldName] = "has-success"
        break;
      default:
        break;
    }

    newState.indicator.item = this.getSelectedItem(newState.indicator)
    newState.indicator.isValidated = this.isValidated(newState.indicator)
    this.setState(newState)
  }

  getSelectedItem(indicator) {
    // Based on selections made, tries to retrieve one object
    let { items } = this.props;

    let filters = { id: [indicator.data.type.value] }
    let filteredItems = applyFilterToObjList(items, filters)

    // The filtering above MUST return only 1 item
    if (filteredItems.length == 1)
      return filteredItems[0]
  }

  addClick(item) {
    this.props.onCommit(this.props.action, this.props.wsId, item)
    this.props.toggleModal(this.props.modalId)

    this.fakeUnmount()
  }
  saveClick(item) {
    this.props.onCommit(this.props.action, this.props.wsId, item, this.props.selectedItem.id)
    this.props.toggleModal(this.props.modalId)

    this.fakeUnmount()
  }

  isValidated(obj) {
    for (var state of Object.values(obj.states))
      if (state != "has-success")
        return false
    return true
  }

  unmountAndToggle(modalId) {
    this.fakeUnmount()
    this.props.toggleModal(modalId)
  }

  render() {
    let { prefs, getString, modalId, isOpen, action } = this.props;
    let { typeOptions, indicator } = this.state;

    return (
      <Modal isOpen={isOpen} size="xs" toggle={() => this.unmountAndToggle(modalId)}>
        <Card className="card-plain">
          <CardHeader className="modal-header">
            <button
              aria-hidden={true}
              className="close"
              data-dismiss="modal"
              type="button"
              onClick={() => this.unmountAndToggle(modalId)}
            >
              <i className="nc-icon nc-simple-remove" />
            </button>
            <h5 className="modal-title" id={modalId}>
              {getString(prefs.locale, this.compId, "title")}
            </h5>
            <hr />
          </CardHeader>
          <CardBody>
            {/* Type */}
            <FormGroup className={`has-label ${indicator.states.type}`}>
              <label>{getString(prefs.locale, this.compId, "input_type")}
                {" "}
                <i id={"input_type_hint"} className="nc-icon nc-alert-circle-i" />
              </label>
              <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"input_type_hint"}>
                {getString(prefs.locale, this.compId, "input_type_hint")}
              </UncontrolledTooltip>
              <Select
                className="react-select"
                classNamePrefix="react-select"
                name="type"
                placeholder={getString(prefs.locale, "generic", "input_select")}
                value={indicator.data.type}
                options={typeOptions}
                onChange={value => this.onSelectChange("type", value)}
                noOptionsMessage={() => getString(prefs.locale, "generic", "input_noOptions")}
              />
            </FormGroup>
          </CardBody>
          <CardFooter className="text-center">
            <Button
              className="btn-simple btn-round"
              color="success"
              data-dismiss="modal"
              type="submit"
              disabled={
                indicator.item && indicator.isValidated ?
                  false : true
              }
              onClick={() =>
                action == "add" ?
                  this.addClick(indicator.item) :
                  this.saveClick(indicator.item)
              }
            >
              {action == "add" ?
                getString(prefs.locale, this.compId, "btn_add") :
                getString(prefs.locale, this.compId, "btn_save")
              }
            </Button>
          </CardFooter>
        </Card>
      </Modal >
    )
  }
}

ModalQuoteDetail.propTypes = {
  prefs: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  managers: PropTypes.object.isRequired,

  modalId: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  toggleModal: PropTypes.func.isRequired,

  onCommit: PropTypes.func.isRequired,

  items: PropTypes.array.isRequired,
  action: PropTypes.string.isRequired,
  workspace: PropTypes.array.isRequired,
  wsId: PropTypes.string.isRequired,
  selectedItem: PropTypes.object
}

export default ModalQuoteDetail;
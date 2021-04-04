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
  Collapse,
  FormGroup,
  Modal,
  Row,
  UncontrolledTooltip
} from "reactstrap";
// react plugin used to create DropdownMenu for selecting items
import Select from "react-select";

import LabelAlert from "../../../../components/LabelAlert";
import { queryObjList, deepCloneObj, getDistinctValuesFromList, retrieveObjFromObjList } from "../../../../core/utils";

class ModalSlopeDetail extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase()

    this.state = {
      intervalOptions: [{ value: "any", label: props.getString(props.prefs.locale, "indicators", "any") }],
      offsetOptions: [{ label: "0", value: 0 }],

      slopeOptions: [],

      indicator_options: [],
      indicator_options_isOpen: undefined,

      periods_options: [],
      periods_options_isOpen: undefined,

      tool: {
        items: [undefined, undefined],
        data: {
          operator: "",
          interval: "",
          indicator: "",
          periods: "",
          offset: "",
        },
        states: {
          operator: "has-success",
          interval: "has-success",
          indicator: "",
          periods: "",
          offset: "",
        },
        isValidated: undefined
      },

      alert: { state: "", msg: "" },
    }
  }
  componentDidUpdate(prevProps) {
    if (prevProps.isOpen !== this.props.isOpen && this.props.isOpen)
      this.prepareRequirements()
  }

  fakeUnmount() {
    let newState = { tool: this.state.tool }

    newState.periods_options = []
    newState.periods_options_isOpen = undefined

    newState.tool = {
      items: [undefined, undefined],
      data: {
        operator: "",
        interval: "",
        indicator: "",
        periods: "",
        offset: "",
      },
      states: {
        operator: "has-success",
        interval: "has-success",
        indicator: "",
        periods: "",
        offset: "",
      },

      isValidated: undefined
    }

    this.setState(newState)
  }

  prepareRequirements() {
    // Prepares the Component
    let { items, action, selectedItem } = this.props;
    let { tool } = this.state;

    let intervalOptions = this.prepareIntervalOptions(items)
    let offsetOptions = this.prepareOffsetOptions()
    let slopeOptions = this.prepareSlopeOptions()

    this.setState({ intervalOptions, slopeOptions, offsetOptions })

    switch (action) {
      case "add":
        tool = this.prepareToAdd(tool, slopeOptions, intervalOptions, offsetOptions)
        break;
      case "update":
        tool = this.prepareToUpdate(tool, selectedItem, slopeOptions, intervalOptions, offsetOptions)
        break;
    }

    this.setState({ tool })
  }
  prepareToAdd(tool, slopeOptions, intervalOptions, offsetOptions) {
    for (var obj of slopeOptions)
      if (obj.value === ">") {
        this.onSelectChange("operator", obj)
        break;
      }

    for (var obj of intervalOptions)
      if (obj.value === "any") {
        this.onSelectChange("interval", obj)
        break;
      }

    for (var obj of offsetOptions)
      if (obj.value == 0) {
        this.onSelectChange("offset", obj)
        break;
      }

    return tool
  }
  prepareToUpdate(tool, selectedItem, slopeOptions, intervalOptions, offsetOptions) {
    let filters = {}

    // Tool
    tool.isValidated = true

    // 1. First Item...
    let item = selectedItem.items[0]

    // 1.1 Offset
    let sOffset = retrieveObjFromObjList(offsetOptions, "value", item.offset)
    this.onSelectChange(`offset`, sOffset)

    // 1.2 Interval
    let sInterval = retrieveObjFromObjList(intervalOptions, "value", item.interval)
    this.onSelectChange(`interval`, sInterval)

    // 1.3 Indicator
    filters = { interval: [sInterval.value] }
    let indicatorOptions = this.handleSelect("indicator", filters)
    let sIndicator = retrieveObjFromObjList(indicatorOptions, "value", item.indicator)
    this.onSelectChange(`indicator`, sIndicator)

    // 1.4 Periods
    filters = { indicator: [sIndicator.value] }
    let periodOptions = this.handleSelect(`periods`, filters)
    let sPeriods = retrieveObjFromObjList(periodOptions, "value", item.periods)
    this.onSelectChange("periods", sPeriods)

    // 2. Second Item... (operator)
    let sOperator = retrieveObjFromObjList(slopeOptions, "value", selectedItem.operator)
    this.onSelectChange("operator", sOperator)

    return tool
  }

  prepareOffsetOptions() {
    return [
      { label: "0", value: 0 },
      { label: "1", value: 1 },
      { label: "2", value: 2 },
      { label: "3", value: 3 },
    ]
  }
  prepareSlopeOptions() {
    let { getString, prefs } = this.props;
    return [
      { value: ">", label: getString(prefs.locale, this.compId, "label_upward") },
      { value: "<", label: getString(prefs.locale, this.compId, "label_downward") }
    ]
  }
  prepareIntervalOptions(items) {
    let { getString, prefs } = this.props;
    let options = this.state.intervalOptions;
    let distinctValues = []

    for (var item of items)
      for (var instance of item.instances)
        if (!distinctValues.includes(instance.interval)) {
          distinctValues.push(instance.interval)
          options.push({
            value: instance.interval,
            label: getString(prefs.locale, "indicators", instance.interval)
          })
        }
    return options
  }
  prepareIndicator_options(items) {
    let { getString, prefs } = this.props;
    let options = []
    let distinctValues = getDistinctValuesFromList(items, "indicator")

    for (var indicator of distinctValues)
      options.push({
        value: indicator,
        label: getString(prefs.locale, "indicators", indicator)
      })

    return options;
  }
  preparePeriods_options(items) {
    let options = []

    for (var item of items)
      options.push({ label: item.periods, value: item.periods })

    return options;
  }

  onSelectChange(fieldName, value) {
    let newState = { tool: this.state.tool }
    let filters = {}

    switch (fieldName) {
      case "interval":
        if (newState.tool.data[fieldName] !== value || !value)
          this.onSelectChange("indicator", "")        // Selection changed. Dependent fields must be emptied...

        filters = { interval: [value.value] }
        this.handleSelect("indicator", filters)
        break;

      case "indicator":
        if (newState.tool.data[fieldName] !== value || !value)
          this.onSelectChange("periods", "")       // Selection changed. Dependent fields must be emptied...

        filters = { indicator: [value.value] }
        this.handleSelect("periods", filters)
        break;
    }

    newState.tool.data[fieldName] = value
    newState.tool.states[fieldName] = value ? "has-success" : ""

    newState.tool.items = this.getSelectedItems(newState.tool)
    newState.tool.isValidated = this.isValidated(newState.tool)

    newState.alert = this.getAlert(newState.tool)

    this.setState(newState)
    return newState.tool.data[fieldName]    // Used by this.prepateToUpdate()
  }
  handleSelect(fieldName, filters) {
    let { items } = this.props;
    let newState = {}
    let selection = []

    switch (fieldName) {
      case "indicator":
        for (var value of items) {
          // Handling [interval] filter...
          if (filters.interval[0] === "any")
            selection.push(value)
          else
            for (var instance of value.instances)
              if (filters.interval[0] === instance.interval)
                selection.push(value)
        }

        newState[`${fieldName}_options`] = this.prepareIndicator_options(selection)
        newState[`${fieldName}_options_isOpen`] = newState[`${fieldName}_options`].length > 0

        if (!newState[`${fieldName}_options_isOpen`]) {
          // [indicator] options is empty. It probably means that [subcategory] and [indicator] have the same values.
          // Go on and handle [instance]...
          this.handleSelect("periods", filters)
        }
        break;

      case "periods":
        selection = queryObjList(items, filters)
        newState[`${fieldName}_options`] = this.preparePeriods_options(selection)
        newState[`${fieldName}_options_isOpen`] = newState[`${fieldName}_options`].length > 0
        break;
    }

    this.setState(newState)
    return newState[`${fieldName}_options`]    // Used by this.prepareToUpdate()
  }

  getSelectedItems(tool) {
    let { items } = this.props;
    let selectedItems = []

    // First and Second Items: They are always the same instance.
    let filters = {
      indicator: [tool.data.indicator.value],
      periods: [tool.data.periods.value],
    }
    let filteredItems = queryObjList(items, filters)
    // The filtering above MUST return only 1 item
    if (filteredItems.length == 1) {
      selectedItems.push(deepCloneObj(filteredItems[0]))
      selectedItems.push(deepCloneObj(filteredItems[0]))
    }
    else {
      selectedItems.push(undefined)
      selectedItems.push(undefined)
    }

    return selectedItems;
  }
  getAdvancedItem(items) {
    let { getString, prefs } = this.props;
    let { tool } = this.state;
    let item = { toolId: this.props.toolId }

    items[0].interval = tool.data.interval.value
    items[0].offset = tool.data.offset.value

    items[1].interval = tool.data.interval.value
    items[1].offset = tool.data.offset.value + 1

    item.items = items
    item.operator = tool.data.operator.value
    item.element = this.props.managers.strategy.buildSlopeElement(getString, prefs, item)

    return item
  }

  addClick(items) {
    let item = this.getAdvancedItem(items)

    this.props.onCommit(this.props.action, this.props.wsId, item)
    this.props.toggleModal(this.props.modalId)

    this.fakeUnmount()
  }
  saveClick(items) {
    let item = this.getAdvancedItem(items)

    this.props.onCommit(this.props.action, this.props.wsId, item, this.props.toolIndex)
    this.props.toggleModal(this.props.modalId)

    this.fakeUnmount()
  }

  isValidated(obj) {
    // This function works together with [this.getAlertMessage]...
    for (var item of obj.items)
      if (!item)
        return false

    return true
  }
  getAlert(obj) {
    // This function works together with [this.isValidated].
    let alert = { state: "", msg: "" }

    for (var item of obj.items)
      if (!item)
        return alert

    return alert
  }

  indicator() {
    let { getString, prefs } = this.props;
    let {
      tool,
      intervalOptions,
      offsetOptions,

      indicator_options,
      indicator_options_isOpen,

      periods_options,
      periods_options_isOpen,
    } = this.state;

    return (
      <>
        {/* Time Interval */}
        <FormGroup className={`has-label ${tool.states.interval}`}>
          <label>{getString(prefs.locale, this.compId, "input_interval")}
            {" "}
            <i id={"input_interval_hint"} className="nc-icon nc-alert-circle-i" />
          </label>
          <UncontrolledTooltip placement="top" target={"input_interval_hint"}>
            {getString(prefs.locale, this.compId, "input_interval_hint")}
          </UncontrolledTooltip>
          <Select
            className="react-select"
            classNamePrefix="react-select"
            name="interval"
            placeholder={getString(prefs.locale, "generic", "input_select")}
            value={tool.data.interval}
            options={intervalOptions}
            onChange={value => this.onSelectChange("interval", value)}
            noOptionsMessage={() => getString(prefs.locale, "generic", "input_noOptions")}
          />
        </FormGroup>
        {/* Indicator */}
        <Collapse isOpen={indicator_options_isOpen}>
          <FormGroup className={`has-label ${tool.states.indicator}`}>
            <label>{getString(prefs.locale, this.compId, "input_indicator")}
              {" "}
              <i id={"input_indicator_hint"} className="nc-icon nc-alert-circle-i" />
            </label>
            <UncontrolledTooltip placement="top" target={"input_indicator_hint"}>
              {getString(prefs.locale, this.compId, "input_indicator_hint")}
            </UncontrolledTooltip>
            <Select
              className="react-select"
              classNamePrefix="react-select"
              name="indicator"
              placeholder={getString(prefs.locale, "generic", "input_select")}
              value={tool.data.indicator}
              options={indicator_options}
              onChange={value => this.onSelectChange("indicator", value)}
            />
          </FormGroup>
        </Collapse>

        <Collapse isOpen={periods_options_isOpen}>
          {/* Periods */}
          <FormGroup className={`has-label ${tool.states.periods}`}>
            <label>{getString(prefs.locale, this.compId, "input_periods")}
              {" "}
              <i id={"input_periods_hint"} className="nc-icon nc-alert-circle-i" />
            </label>
            <UncontrolledTooltip placement="top" target={"input_periods_hint"}>
              {getString(prefs.locale, this.compId, "input_periods_hint")}
            </UncontrolledTooltip>
            <Select
              className="react-select"
              classNamePrefix="react-select"
              name="periods"
              placeholder={getString(prefs.locale, "generic", "input_select")}
              value={tool.data.periods}
              options={periods_options}
              onChange={value => this.onSelectChange("periods", value)}
            />
          </FormGroup>
          {/* Offset 0*/}
          <FormGroup className={`has-label ${tool.states.offset}`}>
            <label>{getString(prefs.locale, this.compId, "input_offset")}
              {" "}
              <i id={"input_offset_hint"} className="nc-icon nc-alert-circle-i" />
            </label>
            <UncontrolledTooltip placement="top" target={"input_offset_hint"}>
              {getString(prefs.locale, this.compId, "input_offset_hint")}
            </UncontrolledTooltip>
            <Select
              className="react-select"
              classNamePrefix="react-select"
              name="offset"
              placeholder={getString(prefs.locale, "generic", "input_select")}
              value={tool.data.offset}
              options={offsetOptions}
              onChange={value => this.onSelectChange("offset", value)}
            />
          </FormGroup>
        </Collapse>
      </>
    )
  }

  unmountAndToggle(modalId) {
    this.fakeUnmount()
    this.props.toggleModal(modalId)
  }

  render() {
    let { prefs, getString, modalId, isOpen, action } = this.props;
    let {
      slopeOptions,

      tool,

      alert
    } = this.state;

    return (
      <Modal isOpen={isOpen} size="lg" toggle={() => this.unmountAndToggle(modalId)}>
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
            <label>
              <p>{getString(prefs.locale, this.compId, "label_intro_p1")}</p>
              <p>{getString(prefs.locale, this.compId, "label_intro_p2")}</p>
            </label>
          </CardHeader>
          <CardBody>
            <Row className="justify-content-center">
              {/* Indicator */}
              <Col xs="5">
                {this.indicator()}
              </Col>
            </Row>
            <Collapse isOpen={tool.isValidated}>
              <hr />
            </Collapse>
            {/* Slope */}
            <Row className="justify-content-center">
              <Col xs="5">
                <Collapse isOpen={tool.isValidated}>
                  <FormGroup className={`has-label ${tool.states.operator}`}>
                    <label>
                      {getString(prefs.locale, this.compId, "input_slope")}
                      {" "}
                      <i id={"input_slope_hint"} className="nc-icon nc-alert-circle-i" />
                    </label>
                    <UncontrolledTooltip placement="top" target={"input_slope_hint"}>
                      {getString(prefs.locale, this.compId, "input_slope_hint")}
                    </UncontrolledTooltip>
                    <Select
                      className="react-select"
                      classNamePrefix="react-select"
                      name="operator"
                      placeholder={getString(prefs.locale, "generic", "input_select")}
                      value={tool.data.operator}
                      options={slopeOptions}
                      onChange={value => this.onSelectChange("operator", value)}
                    />
                  </FormGroup>
                </Collapse>
              </Col>
            </Row>
          </CardBody>
          <Row className="mt-3" />
          <CardFooter className="text-center">
            <LabelAlert alertState={alert.state} alertMsg={alert.msg} />
            <Button
              className="btn-simple btn-round"
              color="success"
              data-dismiss="modal"
              type="submit"
              disabled={tool.isValidated ? false : true}
              onClick={() =>
                action == "add" ?
                  this.addClick(tool.items) :
                  this.saveClick(tool.items)
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

ModalSlopeDetail.propTypes = {
  prefs: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  managers: PropTypes.object.isRequired,

  modalId: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  toggleModal: PropTypes.func.isRequired,

  onCommit: PropTypes.func.isRequired,

  action: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired,
  wsId: PropTypes.string.isRequired,
  selectedItem: PropTypes.object
}

export default ModalSlopeDetail;
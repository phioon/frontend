import React from "react";
import PropTypes from "prop-types";

// reactstrap components
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Col,
  Collapse,
  FormGroup,
  Input,
  Modal,
  Row,
  UncontrolledTooltip
} from "reactstrap";
// react plugin used to create DropdownMenu for selecting items
import Select from "react-select";

import CurrencyInput from "../../../../components/CurrencyInput";
import LabelAlert from "../../../../components/LabelAlert";
import {
  queryObjList,
  convertMaskedStringToFloat,
  convertFloatToCurrency,
  convertFloatToPercentage,
  deepCloneObj,
  retrieveObjFromObjList,
  getDistinctValuesFromList,
  orderBy
} from "../../../../core/utils";

class ModalDistanceDetail extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase()

    this.state = {
      intervalOptions: [{ value: "any", label: props.getString(props.prefs.locale, "indicators", "any") }],
      offsetOptions: [{ label: "0", value: 0 }],

      subcategory_0_options: [],
      subcategory_0_options_isOpen: undefined,
      subcategory_1_options: [],
      subcategory_1_options_isOpen: undefined,

      indicator_0_options: [],
      indicator_0_options_isOpen: undefined,
      indicator_1_options: [],
      indicator_1_options_isOpen: undefined,

      instance_0_options: [],
      instance_0_options_isOpen: undefined,
      instance_1_options: [],
      instance_1_options_isOpen: undefined,

      tool: {
        items: [undefined, undefined],
        data: {
          threshold_currency: "",
          threshold_percentage: "",
          interval_0: "",
          interval_1: "",
          subcategory_0: "",
          subcategory_1: "",
          indicator_0: "",
          indicator_1: "",
          instance_0: "",
          instance_1: "",
          offset_0: "",
          offset_1: "",
        },
        states: {
          threshold_currency: "",
          threshold_percentage: "",
          interval_0: "has-success",
          interval_1: "has-success",
          subcategory_0: "",
          subcategory_1: "",
          indicator_0: "",
          indicator_1: "",
          instance_0: "",
          instance_1: "",
          offset_0: "",
          offset_1: "",
        },
        isThresholdPercentage: true,
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

    newState.instance_0_options = []
    newState.instance_0_options_isOpen = undefined
    newState.instance_1_options = []
    newState.instance_1_options_isOpen = undefined

    newState.tool = {
      items: [undefined, undefined],
      data: {
        threshold_currency: "",
        threshold_percentage: "",
        interval_0: "",
        interval_1: "",
        subcategory_0: "",
        subcategory_1: "",
        indicator_0: "",
        indicator_1: "",
        instance_0: "",
        instance_1: "",
        offset_0: "",
        offset_1: "",
      },
      states: {
        threshold_currency: "",
        threshold_percentage: "",
        interval_0: "has-success",
        interval_1: "has-success",
        subcategory_0: "",
        subcategory_1: "",
        indicator_0: "",
        indicator_1: "",
        instance_0: "",
        instance_1: "",
        offset_0: "",
        offset_1: "",
      },

      isValidated: undefined
    }

    this.setState(newState)
  }

  prepareRequirements() {
    // Prepares the Component
    let { currency, items, action, selectedItem } = this.props;
    let { tool } = this.state;

    let intervalOptions = this.prepareIntervalOptions(items)
    let offsetOptions = this.prepareOffsetOptions()

    this.setState({ intervalOptions, offsetOptions })

    switch (action) {
      case "add":
        tool = this.prepareToAdd(tool, currency, intervalOptions, offsetOptions)
        break;
      case "update":
        tool = this.prepareToUpdate(tool, selectedItem, currency, intervalOptions, offsetOptions)
        break;
    }

    this.setState({ tool })
  }
  prepareToAdd(tool, currency, intervalOptions, offsetOptions) {
    this.onChange("threshold_percentage", convertFloatToPercentage(1, currency.decimal_symbol))
    this.onChange("threshold_currency", convertFloatToCurrency(0.5, currency))
    this.onChangeInputFormat("threshold", "percentage")

    for (var obj of intervalOptions)
      if (obj.value === "any") {
        this.onSelectChange("interval_0", obj)
        this.onSelectChange("interval_1", obj)
        break;
      }

    for (var obj of offsetOptions)
      if (obj.value == 0) {
        this.onSelectChange("offset_0", obj)
        this.onSelectChange("offset_1", obj)
        break;
      }

    return tool
  }
  prepareToUpdate(tool, selectedItem, currency, intervalOptions, offsetOptions) {
    let filters = {}

    // Tool
    tool.isValidated = true
    // Threshold
    if (selectedItem.threshold)
      if (selectedItem.threshold.perc) {
        this.onChangeInputFormat("threshold", "percentage")
        this.onChange("threshold_percentage", convertFloatToPercentage(selectedItem.threshold.perc, currency.decimal_symbol))

        this.onChange("threshold_currency", convertFloatToCurrency(0.5, currency))     // Default
      }
      else if (selectedItem.threshold.const) {
        this.onChangeInputFormat("threshold", "currency")
        this.onChange("threshold_currency", convertFloatToCurrency(selectedItem.threshold.const, currency))

        this.onChange("threshold_percentage", convertFloatToPercentage(1, currency.decimal_symbol))     // Default
      }

    // For each Indicator...
    for (var x = 0; x < selectedItem.items.length; x++) {
      let item = selectedItem.items[x]

      // Offset
      let sOffset = retrieveObjFromObjList(offsetOptions, "value", item.offset)
      this.onSelectChange(`offset_${x}`, sOffset)

      // Interval
      let sInterval = retrieveObjFromObjList(intervalOptions, "value", item.interval)
      this.onSelectChange(`interval_${x}`, sInterval)

      // Subcategory
      filters = { interval: [sInterval.value] }
      let subcategoryOptions = this.handleSelect(`subcategory_${x}`, filters)
      let sSubcategory = retrieveObjFromObjList(subcategoryOptions, "value", item.subcategory)
      this.onSelectChange(`subcategory_${x}`, sSubcategory)

      // Indicator
      filters = { subcategory: [sSubcategory.value] }
      let IndicatorOptions = this.handleSelect(`indicator_${x}`, filters)
      let sIndicator = undefined

      if (IndicatorOptions.length > 0) {
        sIndicator = retrieveObjFromObjList(IndicatorOptions, "value", item.indicator)
        this.onSelectChange(`indicator_${x}`, sIndicator)
      }

      // Instance
      let sInstance = item
      this.onSelectChange(`instance_${x}`, sInstance)
    }

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
  prepareOperatorOptions() {
    return [
      { label: ">", value: ">" },
      { label: ">=", value: ">=" },
      { label: "=", value: "==" },
      { label: "<", value: "<" },
      { label: "<=", value: "<=" },
    ]
  }
  prepareIntervalOptions(items) {
    let { getString, prefs } = this.props;
    let options = [{ value: "any", label: getString(prefs.locale, "indicators", "any") }]
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
  prepareSubcategoryOptions(items) {
    // [filters] are built from Time Interval perspective (item.intances.interval)
    let { getString, prefs } = this.props;
    let options = []
    let distinctValues = getDistinctValuesFromList(items, "subcategory")

    for (var value of distinctValues)
      if (!retrieveObjFromObjList(options, "value", value.subcategory))
        options.push({
          value: value,
          label: getString(prefs.locale, "indicators", value)
        })

    options = orderBy(options, ["label"])
    return options;
  }
  prepareIndicatorOptions(items) {
    // Indicator options when fields [subcategory] and [indicator] have diferent values
    // If [subcategory] and [indicator] are equals, it will return an empty array.
    // Which means the input field should not be shown
    let { getString, prefs } = this.props;
    let options = []
    let distinctValues = []

    for (var item of items)
      if (!distinctValues.includes(item.indicator) && item.subcategory !== item.indicator) {
        distinctValues.push(item.indicator)

        options.push({
          value: item.indicator,
          label: getString(prefs.locale, "indicators", item.indicator)
        })
      }

    return options;
  }
  prepareInstanceOptions(items) {
    let options = []

    for (var item of items)
      if (item.id !== "constant")
        options.push(item)

    return options;
  }

  onChange(fieldName, value) {
    let { currency } = this.props;
    let newState = { tool: this.state.tool }

    let floatValue = undefined

    newState.tool.data[fieldName] = value

    switch (fieldName) {
      case "threshold_percentage":
        floatValue = convertMaskedStringToFloat(value, currency)

        if (floatValue > 0)
          newState.tool.states[fieldName] = "has-success"
        else
          newState.tool.states[fieldName] = "has-danger"
        break;

      case "threshold_currency":
        floatValue = convertMaskedStringToFloat(value, currency)

        if (floatValue > 0)
          newState.tool.states[fieldName] = "has-success"
        else
          newState.tool.states[fieldName] = "has-danger"
        break;
    }

    newState.tool.isValidated = this.isValidated(newState.tool)

    this.setState(newState)
  }
  onChangeInputFormat(fieldName, newFormat) {
    let newState = { tool: this.state.tool };

    switch (fieldName) {
      case "threshold":
        if (newFormat === "percentage") {
          newState.tool.isThresholdPercentage = true
        }
        else
          newState.tool.isThresholdPercentage = false
        break;
    }

    newState.tool.isValidated = this.isValidated(newState.tool)
    newState.alert = this.getAlert(newState.tool)

    this.setState(newState)
  }
  onSelectChange(fieldName, value) {
    let newState = { tool: this.state.tool }
    let filters = {}

    let ignoreInterval = ["constant"]
    let ignoreOffset = ["constant"]

    switch (fieldName) {
      case "interval_0":
        if (newState.tool.data[fieldName] !== value || !value)
          this.onSelectChange("subcategory_0", "")        // Selection changed. Dependent fields must be emptied...

        filters = { interval: [value.value] }
        this.handleSelect("subcategory_0", filters)
        break;
      case "interval_1":
        if (newState.tool.data[fieldName] !== value || !value)
          this.onSelectChange("subcategory_1", "")        // Selection changed. Dependent fields must be emptied...

        filters = { interval: [value.value] }
        this.handleSelect("subcategory_1", filters)
        break;

      case "subcategory_0":
        if (newState.tool.data[fieldName] !== value || !value) {
          // Selection changed or Interval sent a signal to empty dependent fields...
          this.onSelectChange("indicator_0", "")
        }

        // Handling dependent fields...
        filters = { subcategory: [value.value] }
        this.handleSelect("indicator_0", filters)

        // If [interval] must be ignored, set it to the default value (first option)
        if (ignoreInterval.includes(value.value))
          newState.tool.data.interval_0 = this.state.intervalOptions[0]
        // If [offset] must be ignored, set it to the default value (first option)
        if (ignoreOffset.includes(value.value))
          newState.tool.data.offset_0 = this.state.offsetOptions[0]

        // Handling Exclusive Fields...
        filters.interval = [newState.tool.data.interval_1.value]
        this.handleSelect("subcategory_1", filters)
        break;
      case "subcategory_1":
        if (newState.tool.data[fieldName] !== value || !value) {
          // Selection changed or Interval sent a signal to empty dependent fields...
          this.onSelectChange("indicator_1", "")
        }

        // Handling dependent fields...
        filters = { subcategory: [value.value] }
        this.handleSelect("indicator_1", filters)

        // If [interval] must be ignored, set it to the default value (first option)
        if (ignoreInterval.includes(value.value))
          newState.tool.data.interval_1 = this.state.intervalOptions[0]
        // If [offset] must be ignored, set it to the default value (first option)
        if (ignoreOffset.includes(value.value))
          newState.tool.data.offset_1 = this.state.offsetOptions[0]

        // Handling Exclusive Fields...
        filters.interval = [newState.tool.data.interval_0.value]
        this.handleSelect("subcategory_0", filters)
        break;

      case "indicator_0":
        if (newState.tool.data[fieldName] !== value || !value)
          this.onSelectChange("instance_0", "")       // Selection changed. Dependent fields must be emptied...

        filters = { subcategory: [newState.tool.data.subcategory_0.value], indicator: [value.value] }
        this.handleSelect("instance_0", filters)
        break;
      case "indicator_1":
        if (newState.tool.data[fieldName] !== value || !value)
          this.onSelectChange("instance_1", "")       // Selection changed. Dependent fields must be emptied...

        filters = { subcategory: [newState.tool.data.subcategory_1.value], indicator: [value.value] }
        this.handleSelect("instance_1", filters)
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
      case "subcategory_0":
        // Possible callers: [interval_0] and [subcategory_1]
        //   . [interval_0] is the parent input.
        //   . [subcategory_1] calls [subcategory_0] to handle Exclusive Fields

        for (var value of items) {
          // Handling [interval] filter...
          if (filters.interval[0] === "any")
            selection.push(value)
          else
            for (var instance of value.instances)
              if (filters.interval[0] === instance.interval)
                selection.push(value)
        }

        newState[`${fieldName}_options`] = this.prepareSubcategoryOptions(selection)
        newState[`${fieldName}_options_isOpen`] = newState[`${fieldName}_options`].length > 0

        if (filters.subcategory) {
          let exclusiveFields = ["constant"]

          // Handling [subcategory] filter... Here, filter works as an exception rule to make sure above fields are exclusive.
          for (var value of newState[`${fieldName}_options`])
            if (exclusiveFields.includes(value.value) && value.value === filters.subcategory)
              value.isDisabled = true
            else
              value.isDisabled = false
        }

        break;
      case "subcategory_1":
        // Possible callers: [interval_1] and [subcategory_0]
        //   . [interval_1] is the parent input.
        //   . [subcategory_0] calls [subcategory_1] to handle Exclusive Fields

        for (var value of items) {
          // Handling [interval] filter...
          if (filters.interval[0] === "any")
            selection.push(value)
          else
            for (var instance of value.instances)
              if (filters.interval[0] === instance.interval)
                selection.push(value)
        }

        newState[`${fieldName}_options`] = this.prepareSubcategoryOptions(selection)
        newState[`${fieldName}_options_isOpen`] = newState[`${fieldName}_options`].length > 0

        if (filters.subcategory) {
          let exclusiveFields = ["constant"]

          // Handling [subcategory] filter... Here, filter works as an exception rule to make sure above fields are exclusive.
          for (var value of newState[`${fieldName}_options`])
            if (exclusiveFields.includes(value.value) && value.value === filters.subcategory)
              value.isDisabled = true
            else
              value.isDisabled = false
        }
        break;

      case "indicator_0":
        selection = queryObjList(items, filters)
        newState[`${fieldName}_options`] = this.prepareIndicatorOptions(selection)
        newState[`${fieldName}_options_isOpen`] = newState[`${fieldName}_options`].length > 0

        if (!newState[`${fieldName}_options_isOpen`]) {
          // [indicator] options is empty. It probably means that [subcategory] and [indicator] have the same values.
          // Go on and handle [instance]...
          this.handleSelect("instance_0", filters)
        }
        break;
      case "indicator_1":
        selection = queryObjList(items, filters)
        newState[`${fieldName}_options`] = this.prepareIndicatorOptions(selection)
        newState[`${fieldName}_options_isOpen`] = newState[`${fieldName}_options`].length > 0

        if (!newState[`${fieldName}_options_isOpen`]) {
          // [indicator] options is empty. It probably means that [subcategory] and [indicator] have the same values.
          // Go on and handle [instance]...
          this.handleSelect("instance_1", filters)
        }
        break;

      case "instance_0":
        selection = queryObjList(items, filters)
        newState[`${fieldName}_options`] = this.prepareInstanceOptions(selection)
        newState[`${fieldName}_options_isOpen`] = newState[`${fieldName}_options`].length > 0
        break;
      case "instance_1":
        selection = queryObjList(items, filters)
        newState[`${fieldName}_options`] = this.prepareInstanceOptions(selection)
        newState[`${fieldName}_options_isOpen`] = newState[`${fieldName}_options`].length > 0
        break;
    }

    this.setState(newState)
    return newState[`${fieldName}_options`]    // Used by this.prepateToUpdate()
  }

  getSelectedItems(tool) {
    let selectedItems = []
    tool = deepCloneObj(tool)

    // First Item
    if (tool.data.instance_0)
      selectedItems.push(tool.data.instance_0)
    else
      selectedItems.push(undefined)

    // Second Item
    if (tool.data.instance_1)
      selectedItems.push(tool.data.instance_1)
    else
      selectedItems.push(undefined)

    return selectedItems;
  }
  getAdvancedItem(tool) {
    let { getString, prefs, currency } = this.props;
    let item = { toolId: this.props.toolId }
    let threshold = {}

    tool.items[0].interval = tool.data.interval_0.value
    tool.items[0].offset = tool.data.offset_0.value

    tool.items[1].interval = tool.data.interval_1.value
    tool.items[1].offset = tool.data.offset_1.value

    item.items = tool.items

    if (tool.isThresholdPercentage)
      threshold = { perc: convertMaskedStringToFloat(tool.data.threshold_percentage, currency) }
    else
      threshold = { const: convertMaskedStringToFloat(tool.data.threshold_currency, currency) }

    item.threshold = threshold
    item.element = this.props.managers.strategy.buildDistanceElement(getString, prefs, currency, item)

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

    if (obj.isThresholdPercentage) {
      if (obj.states.threshold_percentage === "has-danger")
        return false
    }
    else
      if (obj.states.threshold_currency === "has-danger")
        return false

    if (obj.items[0].id === obj.items[1].id)
      if (obj.data.interval_0.value === obj.data.interval_1.value)
        if (obj.data.offset_0.value === obj.data.offset_1.value)
          return false

    return true
  }
  getAlert(obj) {
    // This function works together with [this.isValidated].
    let { getString, prefs } = this.props;
    let alert = { state: "", msg: "" }

    for (var item of obj.items)
      if (!item)
        return alert

    if (obj.items[0].id === obj.items[1].id) {
      if (obj.data.interval_0.value === obj.data.interval_1.value)
        if (obj.data.offset_0.value === obj.data.offset_1.value)
          alert = {
            state: "has-danger",
            msg: getString(prefs.locale, this.compId, "error_instancesAreEqual")
          }
    }
    else if (!obj.isThresholdPercentage)
      alert = {
        state: "",
        msg: getString(prefs.locale, this.compId, "warning_usingCurrency")
      }

    return alert
  }

  firstItem() {
    let { getString, prefs } = this.props;
    let {
      tool,
      intervalOptions,

      subcategory_0_options,
      subcategory_0_options_isOpen,

      indicator_0_options,
      indicator_0_options_isOpen,
    } = this.state;

    return (
      <>
        <h6 className="text-center">
          <Badge color="default">
            {getString(prefs.locale, this.compId, "label_item1")}
          </Badge>
        </h6>
        {/* Time Interval */}
        <FormGroup className={`has-label ${tool.states.interval_0}`}>
          <label>{getString(prefs.locale, this.compId, "input_interval")}
            {" "}
            <i id={"input_interval_0_hint"} className="nc-icon nc-alert-circle-i" />
          </label>
          <UncontrolledTooltip placement="top" target={"input_interval_0_hint"}>
            {getString(prefs.locale, this.compId, "input_interval_hint")}
          </UncontrolledTooltip>
          <Select
            className="react-select"
            classNamePrefix="react-select"
            name="interval"
            placeholder={getString(prefs.locale, "generic", "input_select")}
            value={tool.data.interval_0}
            options={intervalOptions}
            onChange={value => this.onSelectChange("interval_0", value)}
            noOptionsMessage={() => getString(prefs.locale, "generic", "input_noOptions")}
          />
        </FormGroup>
        {/* Subcategory*/}
        <Collapse isOpen={subcategory_0_options_isOpen}>
          <FormGroup className={`has-label ${tool.states.subcategory_0}`}>
            <label>{getString(prefs.locale, this.compId, "input_subcategory")}
              {" "}
              <i id={"input_subcategory_0_hint"} className="nc-icon nc-alert-circle-i" />
            </label>
            <UncontrolledTooltip placement="top" target={"input_subcategory_0_hint"}>
              {getString(prefs.locale, this.compId, "input_subcategory_hint")}
            </UncontrolledTooltip>
            <Select
              className="react-select"
              classNamePrefix="react-select"
              name="subcategory_0"
              placeholder={getString(prefs.locale, "generic", "input_select")}
              value={tool.data.subcategory_0}
              options={subcategory_0_options}
              onChange={value => this.onSelectChange("subcategory_0", value)}
            />
          </FormGroup>
        </Collapse>
        {/* Indicator */}
        <Collapse isOpen={indicator_0_options_isOpen}>
          <FormGroup className={`has-label ${tool.states.indicator_0}`}>
            <label>{getString(prefs.locale, this.compId, "input_indicator")}
              {" "}
              <i id={"input_indicator_0_hint"} className="nc-icon nc-alert-circle-i" />
            </label>
            <UncontrolledTooltip placement="top" target={"input_indicator_0_hint"}>
              {getString(prefs.locale, this.compId, "input_indicator_hint")}
            </UncontrolledTooltip>
            <Select
              className="react-select"
              classNamePrefix="react-select"
              name="indicator_0"
              placeholder={getString(prefs.locale, "generic", "input_select")}
              value={tool.data.indicator_0}
              options={indicator_0_options}
              onChange={value => this.onSelectChange("indicator_0", value)}
            />
          </FormGroup>
        </Collapse>
      </>
    )
  }
  secondItem() {
    let { getString, prefs } = this.props;
    let {
      tool,
      intervalOptions,

      subcategory_1_options,
      subcategory_1_options_isOpen,

      indicator_1_options,
      indicator_1_options_isOpen,
    } = this.state;

    return (
      <>
        <h6 className="text-center">
          <Badge color="default">
            {getString(prefs.locale, this.compId, "label_item2")}
          </Badge>
        </h6>
        {/* Time Interval */}
        <FormGroup className={`has-label ${tool.states.interval_1}`}>
          <label>{getString(prefs.locale, this.compId, "input_interval")}
            {" "}
            <i id={"input_interval_1_hint"} className="nc-icon nc-alert-circle-i" />
          </label>
          <UncontrolledTooltip placement="top" target={"input_interval_1_hint"}>
            {getString(prefs.locale, this.compId, "input_interval_hint")}
          </UncontrolledTooltip>
          <Select
            className="react-select"
            classNamePrefix="react-select"
            name="interval"
            placeholder={getString(prefs.locale, "generic", "input_select")}
            value={tool.data.interval_1}
            options={intervalOptions}
            onChange={value => this.onSelectChange("interval_1", value)}
            noOptionsMessage={() => getString(prefs.locale, "generic", "input_noOptions")}
          />
        </FormGroup>
        {/* Subcategory*/}
        <Collapse isOpen={subcategory_1_options_isOpen}>
          <FormGroup className={`has-label ${tool.states.subcategory_1}`}>
            <label>{getString(prefs.locale, this.compId, "input_subcategory")}
              {" "}
              <i id={"input_subcategory_1_hint"} className="nc-icon nc-alert-circle-i" />
            </label>
            <UncontrolledTooltip placement="top" target={"input_subcategory_1_hint"}>
              {getString(prefs.locale, this.compId, "input_subcategory_hint")}
            </UncontrolledTooltip>
            <Select
              className="react-select"
              classNamePrefix="react-select"
              name="subcategory_1"
              placeholder={getString(prefs.locale, "generic", "input_select")}
              value={tool.data.subcategory_1}
              options={subcategory_1_options}
              onChange={value => this.onSelectChange("subcategory_1", value)}
            />
          </FormGroup>
        </Collapse>
        {/* Indicator */}
        <Collapse isOpen={indicator_1_options_isOpen}>
          <FormGroup className={`has-label ${tool.states.indicator_1}`}>
            <label>{getString(prefs.locale, this.compId, "input_indicator")}
              {" "}
              <i id={"input_indicator_1_hint"} className="nc-icon nc-alert-circle-i" />
            </label>
            <UncontrolledTooltip placement="top" target={"input_indicator_1_hint"}>
              {getString(prefs.locale, this.compId, "input_indicator_hint")}
            </UncontrolledTooltip>
            <Select
              className="react-select"
              classNamePrefix="react-select"
              name="indicator_1"
              placeholder={getString(prefs.locale, "generic", "input_select")}
              value={tool.data.indicator_1}
              options={indicator_1_options}
              onChange={value => this.onSelectChange("indicator_1", value)}
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
    let { prefs, getString, modalId, isOpen, action, currency } = this.props;
    let {
      offsetOptions,
      instance_0_options,
      instance_0_options_isOpen,
      instance_1_options,
      instance_1_options_isOpen,

      tool,

      alert
    } = this.state;

    let threshold_isOpen =
      instance_0_options_isOpen || instance_1_options_isOpen ||
      tool.data.subcategory_0.value === "constant" || tool.data.subcategory_1.value === "constant"

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
              {/* First Item */}
              <Col xs="5">
                {this.firstItem()}
              </Col>
              <Col xs="2" />
              <Col xs="5">
                {this.secondItem()}
              </Col>
            </Row>
            <Collapse isOpen={threshold_isOpen}>
              <hr />
            </Collapse>
            {/* Instances */}
            <Row>
              <Col xs="5">
                <Collapse isOpen={instance_0_options_isOpen}>
                  {/* Instance 0*/}
                  <FormGroup className={`has-label ${tool.states.instance_0}`}>
                    <label>{getString(prefs.locale, this.compId, "input_instance")}
                      {" "}
                      <i id={"input_instance_0_hint"} className="nc-icon nc-alert-circle-i" />
                    </label>
                    <UncontrolledTooltip placement="top" target={"input_instance_0_hint"}>
                      {getString(prefs.locale, this.compId, "input_instance_hint")}
                    </UncontrolledTooltip>
                    <Select
                      className="react-select"
                      classNamePrefix="react-select"
                      name="instance_0"
                      placeholder={getString(prefs.locale, "generic", "input_select")}
                      value={tool.data.instance_0}
                      options={instance_0_options}
                      onChange={value => this.onSelectChange("instance_0", value)}
                    />
                  </FormGroup>
                  {/* Offset 0*/}
                  <FormGroup className={`has-label ${tool.states.offset_0}`}>
                    <label>{getString(prefs.locale, this.compId, "input_offset")}
                      {" "}
                      <i id={"input_offset_0_hint"} className="nc-icon nc-alert-circle-i" />
                    </label>
                    <UncontrolledTooltip placement="top" target={"input_offset_0_hint"}>
                      {getString(prefs.locale, this.compId, "input_offset_hint")}
                    </UncontrolledTooltip>
                    <Select
                      className="react-select"
                      classNamePrefix="react-select"
                      name="offset_0"
                      placeholder={getString(prefs.locale, "generic", "input_select")}
                      value={tool.data.offset_0}
                      options={offsetOptions}
                      onChange={value => this.onSelectChange("offset_0", value)}
                    />
                  </FormGroup>
                </Collapse>

                {/* Constant 0 */}
                <Collapse isOpen={tool.data.subcategory_0.value === "constant"}>
                  <FormGroup className={`has-label ${tool.states.instance_0}`}>
                    <label>{getString(prefs.locale, this.compId, "input_constant")}
                      {" "}
                      <i id={"input_constant_0_hint"} className="nc-icon nc-alert-circle-i" />
                    </label>
                    <UncontrolledTooltip placement="top" target={"input_constant_0_hint"}>
                      {getString(prefs.locale, this.compId, "input_constant_hint")}
                    </UncontrolledTooltip>
                    <Input
                      type="number"
                      name="constant"
                      autoComplete="off"
                      value={tool.data.instance_0.value || ""}
                      onChange={e => this.onSelectChange(
                        "instance_0",
                        {
                          id: e.target.name,
                          label: e.target.name,
                          subcategory: e.target.name,
                          indicator: e.target.name,
                          value: e.target.value
                        })
                      }
                    />
                  </FormGroup>
                </Collapse>
              </Col>
              {/* Threshold */}
              <Col xs="2">
                <Collapse isOpen={threshold_isOpen}>
                  <FormGroup>
                    <label>{this.props.getString(prefs.locale, this.compId, "input_threshold")}
                      {" "}
                      <i id={"input_threshold_hint"} className="nc-icon nc-alert-circle-i" />
                    </label>
                    <UncontrolledTooltip placement="top" target={"input_threshold_hint"}>
                      {getString(prefs.locale, this.compId, "input_threshold_hint")}
                    </UncontrolledTooltip>
                    <CurrencyInput
                      className="form-control text-right"
                      placeholder={tool.isThresholdPercentage ? "%" : currency.symbol}
                      type="text"
                      name={tool.isThresholdPercentage ? "threshold_percentage" : "threshold_currency"}
                      value={tool.isThresholdPercentage ? tool.data.threshold_percentage : tool.data.threshold_currency}
                      onChange={(e => this.onChange(e.target.name, e.target.value))}
                      maskOptions={{
                        prefix: tool.isThresholdPercentage ? "" : `${currency.symbol} `,
                        suffix: tool.isThresholdPercentage ? ` %` : "",
                        thousandsSeparatorSymbol: currency.thousands_separator_symbol,
                        decimalSymbol: currency.decimal_symbol,
                        integerLimit: tool.isThresholdPercentage ? 2 : 11,
                        decimalLimit: tool.isThresholdPercentage ? 5 : 2
                      }}
                    />
                  </FormGroup>
                  <div className="text-center">
                    {/* isThresholdPercentage */}
                    <Button
                      className={`btn-icon btn-neutral btn-info ${tool.isThresholdPercentage && "btn-round"}`}
                      id="threshold_percentage"
                      color="info"
                      size="sm"
                      outline={tool.isThresholdPercentage}
                      onClick={() => this.onChangeInputFormat("threshold", "percentage")}
                    >
                      %
                    </Button>
                    <UncontrolledTooltip placement="bottom" target="threshold_percentage">
                      {this.props.getString(prefs.locale, this.compId, "threshold_percentage_hint")}
                    </UncontrolledTooltip>
                    <Button
                      className={`btn-icon btn-neutral btn-success ${!tool.isThresholdPercentage && "btn-round"}`}
                      color="success"
                      id="threshold_currency"
                      size="sm"
                      outline={!tool.isThresholdPercentage}
                      onClick={() => this.onChangeInputFormat("threshold", "currency")}
                    >
                      $
                    </Button>
                    <UncontrolledTooltip placement="bottom" target="threshold_currency">
                      {this.props.getString(prefs.locale, this.compId, "threshold_currency_hint")}
                    </UncontrolledTooltip>
                  </div>
                </Collapse>
              </Col>
              <Col xs="5">
                <Collapse isOpen={instance_1_options_isOpen}>
                  {/* Instance 1*/}
                  <FormGroup className={`has-label ${tool.states.instance_1}`}>
                    <label>{getString(prefs.locale, this.compId, "input_instance")}
                      {" "}
                      <i id={"input_instance_1_hint"} className="nc-icon nc-alert-circle-i" />
                    </label>
                    <UncontrolledTooltip placement="top" target={"input_instance_1_hint"}>
                      {getString(prefs.locale, this.compId, "input_instance_hint")}
                    </UncontrolledTooltip>
                    <Select
                      className="react-select"
                      classNamePrefix="react-select"
                      name="instance_1"
                      placeholder={getString(prefs.locale, "generic", "input_select")}
                      value={tool.data.instance_1}
                      options={instance_1_options}
                      onChange={value => this.onSelectChange("instance_1", value)}
                    />
                  </FormGroup>
                  {/* Offset 1*/}
                  <FormGroup className={`has-label ${tool.states.offset_1}`}>
                    <label>{getString(prefs.locale, this.compId, "input_offset")}
                      {" "}
                      <i id={"input_offset_1_hint"} className="nc-icon nc-alert-circle-i" />
                    </label>
                    <UncontrolledTooltip placement="top" target={"input_offset_1_hint"}>
                      {getString(prefs.locale, this.compId, "input_offset_hint")}
                    </UncontrolledTooltip>
                    <Select
                      className="react-select"
                      classNamePrefix="react-select"
                      name="offset_1"
                      placeholder={getString(prefs.locale, "generic", "input_select")}
                      value={tool.data.offset_1}
                      options={offsetOptions}
                      onChange={value => this.onSelectChange("offset_1", value)}
                    />
                  </FormGroup>
                </Collapse>
                <Collapse isOpen={tool.data.subcategory_1.value === "constant"}>
                  {/* Constant 1 */}
                  <FormGroup className={`has-label ${tool.states.instance_0}`}>
                    <label>{getString(prefs.locale, this.compId, "input_constant")}
                      {" "}
                      <i id={"input_constant_1_hint"} className="nc-icon nc-alert-circle-i" />
                    </label>
                    <UncontrolledTooltip placement="top" target={"input_constant_1_hint"}>
                      {getString(prefs.locale, this.compId, "input_constant_hint")}
                    </UncontrolledTooltip>
                    <Input
                      type="number"
                      name="constant"
                      autoComplete="off"
                      value={tool.data.instance_1.value || ""}
                      onChange={e => this.onSelectChange(
                        "instance_1",
                        {
                          id: e.target.name,
                          label: e.target.name,
                          subcategory: e.target.name,
                          indicator: e.target.name,
                          value: e.target.value
                        })
                      }
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
                  this.addClick(tool) :
                  this.saveClick(tool)
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

ModalDistanceDetail.propTypes = {
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

export default ModalDistanceDetail;
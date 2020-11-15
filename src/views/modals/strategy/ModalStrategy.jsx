import React from "react";
import classnames from "classnames";
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
  Modal,
  Nav,
  NavItem,
  NavLink,
  Input,
  Row,
  Spinner,
  TabContent,
  TabPane,
  UncontrolledTooltip
} from "reactstrap";
// react component used to flip cards
import ReactCardFlip from 'react-card-flip';
// react component used to create sweet alerts
import ReactBSAlert from "react-bootstrap-sweetalert";
// Used to create a Sortable container
import SortableRulesBasic from "../../../components/sortables/SortableRulesBasic";
// react plugin used to create DropdownMenu for selecting items
import Select from "react-select";

import ModalQuoteDetail from "./indicators/ModalQuoteDetail";
import ModalMovingAvgDetail from "./indicators/ModalMovingAvgDetail";
import RulesExplainer from "./RulesExplainer";

import LabelAlert from "../../../components/LabelAlert";
import {
  areObjsEqual,
  applyFilterToObjList,
  getDistinctValuesFromList,
  retrieveObjFromObjList,
  verifyLength,
  deepCloneObj,
} from "../../../core/utils";
import ModalPhiboDetail from "./indicators/ModalPhiboDetail";


class ModalStrategy extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase()

    this.state = {
      isOpen: props.isOpen,
      isLoading: false,

      action: props.action,

      modal_chooseWS_isOpen: false,
      modal_quoteDetail_isOpen: false,
      modal_movingAverageDetail_isOpen: false,
      modal_phiboDetail_isOpen: false,

      activeWsMode: "basic",

      iItems: [],

      strategy: {
        initial: {},
        patch: {},
        data: {
          name: "",
          desc: "",
          type: "buy",
          isPublic: true,
          isDynamic: undefined,
          rules: "",
        },
        states: {
          name: "",
          desc: "has-success",
        },
        workspaces: [
          {
            items: [],
            rules: {},
            type: "basic",
            id: "basic_0",
            showExplainer: false,
          },
          {
            items: [],
            rules: {},
            type: "basic",
            id: "basic_1",
            showExplainer: false,
          },
          {
            items: [],
            rules: {},
            type: "advanced",
            id: "advanced",
            showExplainer: false,
            isDisabled: true,
          }
        ],
        isValidated: undefined
      },

      selected: {
        action: undefined,
        subcatId: undefined,
        workspace: undefined,
        indicator: undefined
      },

      alertState: null,
      alertMsg: "",
    }

    this.onWSCommit = this.onWSCommit.bind(this)
    this.updateIndicatorClick = this.updateIndicatorClick.bind(this)
    this.onSortableChange = this.onSortableChange.bind(this)
    this.toggleModal = this.toggleModal.bind(this)
  }
  componentDidUpdate(prevProps) {
    if (prevProps.isOpen !== this.props.isOpen)
      if (this.props.isOpen)
        this.prepareRequirements()
      else
        this.fakeUnmount()
  }

  fakeUnmount() {
    let newState = { strategy: this.state.strategy }

    newState.activeWsMode = "basic"

    newState.strategy = {
      initial: {},
      patch: {},
      data: {
        name: "",
        desc: "",
        type: "buy",
        isPublic: true,
        isDynamic: undefined,
        rules: "",
      },
      states: {
        name: "",
        desc: "has-success",
      },
      workspaces: [
        {
          items: [],
          rules: {},
          type: "basic",
          id: "basic_0",
          showExplainer: false,
        },
        {
          items: [],
          rules: {},
          type: "basic",
          id: "basic_1",
          showExplainer: false,
        },
        {
          items: [],
          rules: {},
          type: "advanced",
          id: "advanced",
          showExplainer: false,
          isDisabled: true,
        }
      ],
      isValidated: undefined
    }

    this.setState(newState)
  }
  resetSelection() {
    let { selected } = this.state;

    selected.action = undefined
    selected.subcatId = undefined
    selected.indicator = undefined

    this.setState({ selected })
  }

  async prepareRequirements() {
    let { prefs, getString, action, objData } = this.props;
    let { iItems, strategy, selected } = this.state;

    iItems = await this.props.managers.market.indicatorData()

    // iItems: Preparing to be read by Sortable
    for (var obj of iItems) {
      obj.value = obj.id
      obj.label = getString(prefs.locale, "indicators", obj.id)
    }

    // Workspaces: Preparing to be read by List
    for (var obj of strategy.workspaces) {
      obj.value = obj.id
      obj.label = getString(prefs.locale, this.compId, ["label_" + obj.id])

      // Default WS
      if (obj.id == "basic_0")
        selected.workspace = obj
    }

    switch (action) {
      case "create":
        this.prepareToCreate(iItems)
        break;
      case "update":
        strategy = this.prepareToUpdate(iItems, strategy, objData)
        break;
      default:
        break;
    }

    this.setState({ iItems, strategy, selected })
  }
  prepareToCreate(iItems) {
    for (var obj of iItems) {
      // Move Price into WS
      if (obj.id == "close")
        this.onWSCommit("add", "basic_0", obj)
    }
  }
  prepareToUpdate(iItems, strategy, objData) {
    let wsRules = JSON.parse(objData.rules)

    for (var [wsId, rules] of Object.entries(wsRules)) {
      let ws = this.props.managers.strategy.convertJSONRulesIntoWS(iItems, wsId, rules)

      for (var item of ws.items) {
        strategy = this.onWSCommit("add", ws.id, item)
      }
      // console.log(rules)
    }

    // Data
    strategy.data.id = objData.id
    strategy.data.name = objData.name
    strategy.data.desc = objData.desc
    strategy.data.type = objData.type
    strategy.data.isDynamic = objData.isDynamic
    strategy.data.isPublic = objData.isPublic
    // Initial
    strategy.initial = deepCloneObj(strategy.data)
    // States
    strategy.states.name = "has-success"
    strategy.states.desc = "has-success"

    return strategy
  }

  verifyStrategyName(name) {
    let isValidated = false

    if (verifyLength(name, 1, 24)) {
      isValidated = true
      if (name == this.state.strategy.initial.name)
        isValidated = true
      else if (this.props.sStrategyNames.includes(name))
        isValidated = false
    }

    return isValidated
  }

  onChange(value, stateName) {
    let newState = { strategy: this.state.strategy }

    if (this.state.alertState !== null) {
      newState.alertState = null
      newState.alertMsg = ""
    }

    newState.strategy.data[stateName] = value

    if (this.props.action == "update")
      newState.strategy.patch[stateName] = value

    switch (stateName) {
      case "name":
        if (this.verifyStrategyName(value))
          newState.strategy.states[stateName] = "has-success"
        else
          newState.strategy.states[stateName] = "has-danger"
        break;
      case "desc":
        if (verifyLength(value, 0, 1000))
          newState.strategy.states[stateName] = "has-success"
        else
          newState.strategy.states[stateName] = "has-danger"
        break;
      default:
        break;
    }

    newState.strategy.isValidated = this.isValidated(newState.strategy)

    this.setState(newState)
  }
  onChoiceChange(choiceName, value) {
    let newState = { strategy: this.state.strategy }

    if (newState.strategy.data[choiceName] != value) {
      newState.strategy.data[choiceName] = value

      if (this.props.action == "update")
        newState.strategy.patch[choiceName] = value
    }

    newState.strategy.isValidated = this.isValidated(newState.strategy)

    this.setState(newState)
  }
  onSelectChange(fieldName, value) {
    let newState = { selected: this.state.selected }

    switch (fieldName) {
      case "wsDestination":
        newState.selected.workspace = value
        break;
      default:
        break;
    }

    this.setState(newState)
  }


  onDragStart(e, subcatId) {
    let { selected } = this.state;

    e.dataTransfer.setData("id", subcatId)

    selected.action = "add"
    selected.subcatId = subcatId
    selected.indicator = undefined

    this.setState({ selected, isDragging: true })
  }
  onDrop(e, ws) {
    this.setState({ isDragging: false })
    let subcatId = e.dataTransfer.getData("id");

    this.openSubcategoryDetail("add", ws, subcatId)
  }

  renderSubcategoryAsCard(iItems, subcatId) {
    let filters = { subcategory: subcatId }
    iItems = applyFilterToObjList(iItems, filters)
    let subcategories = getDistinctValuesFromList(iItems, "subcategory")

    return subcategories.map((subcatId) => {
      return (
        <Col xl="3" lg="4" md="6" sm="6" key={"card_" + subcatId}>
          <Card
            draggable
            onClick={() => this.addSubcategoryClick(subcatId)}
            onDragStart={(e) => this.onDragStart(e, subcatId)}
            onDragEnd={() => this.setState({ isDragging: false })}
          >
            <CardBody className="centered">
              <i className="sortable-item-handle" />
              <Button size="sm" className="btn-neutral">
                {this.props.getString(this.props.prefs.locale, "indicators", subcatId)}
              </Button>
            </CardBody>
          </Card>
        </Col>
      )
    });
  }
  renderBasicWS(workspaces) {
    let { prefs, getString } = this.props;
    let { isDragging } = this.state;

    let filters = { id: "basic_0" }
    let reversedWS = applyFilterToObjList(workspaces.slice(), filters)
    reversedWS.reverse()

    return reversedWS.map((ws) => {
      return (
        <Col key={ws.id} lg="6">
          <Card
            className={classnames("drop-area", isDragging && "dash-zone")}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => this.onDrop(e, ws)}>
            <CardHeader>
              <p className="card-category">{getString(prefs.locale, this.compId, ["label_" + ws.id])}</p>
              <div className="text-center">
                <label>
                  {getString(prefs.locale, this.compId, ["label_" + ws.id + "_intro"])}
                </label>
              </div>
              <hr />
            </CardHeader>
            <CardBody>
              <ReactCardFlip isFlipped={ws.showExplainer} flipDirection="vertical">
                <SortableRulesBasic
                  context={ws.id}
                  items={ws.items}
                  onUpdateItem={this.updateIndicatorClick}
                  onRemoveItem={this.onWSCommit}
                  onSortableChange={this.onWSCommit} />
                <RulesExplainer
                  managers={this.props.managers}
                  prefs={this.props.prefs}
                  getString={this.props.getString}
                  workspace={ws} />
              </ReactCardFlip>
            </CardBody>
            <CardFooter>
              <Row>
                <Col className="text-right">
                  <Button
                    className="btn-neutral"
                    color="primary"
                    id={ws.id + "__explainer_hint"}
                    size="sm"
                    type="button"
                    onClick={() => ws.showExplainer ?
                      this.onWSChange(ws.id, "showExplainer", false) :
                      this.onWSChange(ws.id, "showExplainer", true)
                    }
                  >
                    {ws.showExplainer ?
                      getString(prefs.locale, this.compId, "btn_goToRules") :
                      getString(prefs.locale, this.compId, "btn_goToExplainer")
                    }
                  </Button>
                </Col>
              </Row>
            </CardFooter>
          </Card>
        </Col>
      )
    })
  }
  renderTransitionWS(workspaces) {
    let { prefs, getString } = this.props;
    let { isDragging } = this.state;

    let filters = { type: "basic" }
    let reversedWS = applyFilterToObjList(workspaces.slice(), filters)
    reversedWS.reverse()

    return reversedWS.map((ws) => {
      return (
        <Col key={ws.id} lg="6">
          <Card
            className={classnames("drop-area", isDragging && "dash-zone")}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => this.onDrop(e, ws)}>
            <CardHeader>
              <p className="card-category">{getString(prefs.locale, this.compId, ["label_" + ws.id])}</p>
              <div className="text-center">
                <label>
                  {getString(prefs.locale, this.compId, ["label_" + ws.id + "_intro"])}
                </label>
              </div>
              <hr />
            </CardHeader>
            <CardBody>
              <ReactCardFlip isFlipped={ws.showExplainer} flipDirection="vertical">
                <SortableRulesBasic
                  context={ws.id}
                  items={ws.items}
                  onUpdateItem={this.updateIndicatorClick}
                  onRemoveItem={this.onWSCommit}
                  onSortableChange={this.onWSCommit} />
                <RulesExplainer
                  managers={this.props.managers}
                  prefs={this.props.prefs}
                  getString={this.props.getString}
                  workspace={ws} />
              </ReactCardFlip>
            </CardBody>
            <CardFooter>
              <Row>
                <Col className="text-right">
                  <Button
                    className="btn-neutral"
                    color="primary"
                    id={ws.id + "__explainer_hint"}
                    size="sm"
                    type="button"
                    onClick={() => ws.showExplainer ?
                      this.onWSChange(ws.id, "showExplainer", false) :
                      this.onWSChange(ws.id, "showExplainer", true)
                    }
                  >
                    {ws.showExplainer ?
                      getString(prefs.locale, this.compId, "btn_goToRules") :
                      getString(prefs.locale, this.compId, "btn_goToExplainer")
                    }
                  </Button>
                </Col>
              </Row>
            </CardFooter>
          </Card>
        </Col>
      )
    })
  }

  addSubcategoryClick(subcatId) {
    let { selected } = this.state;

    selected.action = "add"
    selected.subcatId = subcatId
    selected.indicator = undefined

    this.setState({ selected })
    this.toggleModal("chooseWS")
  }
  updateIndicatorClick(wsId, itemId) {
    let { strategy } = this.state;

    for (var ws of strategy.workspaces)
      if (ws.id == wsId) {
        let indicator = retrieveObjFromObjList(ws.items, "id", itemId)
        if (indicator)
          this.openSubcategoryDetail("update", ws, indicator.subcategory, indicator)
      }
  }

  openSubcategoryDetail(action, ws, subcatId, indicator) {
    // [action, ws] are required for both operations: 'add' and 'update'
    // [subcatId] is required only to 'add' an indicator into a WS.
    // [indicator] is required only to 'update' an indicator from a WS.

    let { selected } = this.state;
    let modalId = undefined

    selected.action = action
    selected.subcatId = subcatId
    selected.workspace = ws
    selected.indicator = indicator

    this.setState({ selected })

    switch (subcatId) {
      case "quote":
        modalId = "quoteDetail"
        break;
      case "moving_average":
        modalId = "movingAverageDetail"
        break;
      case "phibo":
        modalId = "phiboDetail"
        break;
      default:
        break;
    }

    if (this.state.modal_chooseWS_isOpen)
      this.toggleModal("chooseWS")
    if (modalId)
      this.toggleModal(modalId)
  }

  onWSChange(wsId, fieldName, value) {
    let { strategy } = this.state;

    for (var ws of strategy.workspaces)
      if (ws.id == wsId)
        ws[fieldName] = value

    this.setState({ strategy })
  }
  onWSCommit(action, wsId, item, prevItemId) {
    let { strategy } = this.state;

    strategy.data.rules = []

    for (var ws of strategy.workspaces)
      if (ws.id == wsId) {
        // WS Data
        switch (action) {
          case "add":
            ws = this.addIndicatorIntoWS(ws, item)

            if (ws.id == "basic_1")
              this.toggleNavLink("activeWsMode", "transition")
            else if (ws.id == "advanced")
              this.toggleNavLink("activeWsMode", "advanced")

            break;
          case "update":
            ws = this.saveIndicatorOnWS(ws, prevItemId, item)
            break;
          case "delete":
            ws = this.deleteIndicatorFromWS(ws, item.id)
            break;
          case "sort":
            // item here means 'items' (plural). It's triggered every time the items order is changed.
            ws = this.onSortableChange(ws, item)
            break;
          default:
            break;
        }
        // WS JSONRules and Strategy States
        ws.rules = this.props.managers.strategy.convertWSIntoJSONRules(ws)

        switch (ws.type) {
          case "basic":
            // BASIC WS
            if (ws.items.length == 0) {
              // Basic WS has zero items
              delete strategy.states[wsId]
            }
            else if (ws.items.length == 1) {
              // Basic WS has only one item
              strategy.states[wsId] = ""
            }
            else if (ws.items.length >= 2) {
              // Basic WS has at least 2 items. Now, a comparison is possible
              strategy.states[wsId] = "has-success"
            }
            break;
          case "advanced":
            // ADVANCED WS
            if (ws.items.length == 0) {
              // Advanced WS has zero items
              delete strategy.states[wsId]
            }
            else if (ws.items.length >= 1) {
              // Advanced WS has at least 1 item. Now, a comparison is possible
              strategy.states[wsId] = "has-success"
            }
            break;
          default:
            break;
        }
      }

    // Strategy's rules
    strategy.data.rules = this.props.managers.strategy.jsonRulesAsString(strategy.workspaces)

    strategy.data.isDynamic = this.props.managers.strategy.isDynamic(strategy)
    strategy.isValidated = this.isValidated(strategy)


    if (this.props.action == "update") {
      strategy.patch.rules = strategy.data.rules
      strategy.patch.isDynamic = strategy.data.isDynamic
    }

    this.resetSelection()
    this.setState({ strategy })
    return strategy
  }
  addIndicatorIntoWS(ws, item) {
    ws.items.push(item)

    return ws
  }
  saveIndicatorOnWS(ws, prevItemId, item) {
    for (var x = 0; x < ws.items.length; x++)
      if (ws.items[x].id == prevItemId)
        ws.items[x] = item

    return ws
  }
  deleteIndicatorFromWS(ws, itemId) {
    for (var x = 0; x < ws.items.length; x++)
      if (ws.items[x].id == itemId)
        ws.items.splice(x, 1)

    return ws
  }
  onSortableChange(ws, items) {
    ws.items = items

    return ws
  }

  isValidated(obj) {
    for (var state of Object.values(obj.states))
      if (state != "has-success")
        return false

    if (!obj.states.basic_0 && !obj.states.basic_1 && !obj.states.advanced) {
      // All WS are empty
      return false
    }

    if (this.props.action == "update") {
      // If it's updating a Strategy, it must be somehow different than the original object
      if (areObjsEqual(obj.data, obj.initial))
        return false
    }

    return true
  }

  confirmClick(action, strategy) {
    this.setState({ isLoading: true })

    switch (action) {
      case "create":
        this.createObject(strategy)
        break;
      case "update":
        this.updateObject(strategy)
        break;
      default:
        break;
    }
  }

  async createObject(strategy) {
    let object = {
      name: strategy.data.name,
      desc: strategy.data.desc,
      type: strategy.data.type,
      is_public: strategy.data.isPublic,
      is_dynamic: strategy.data.isDynamic,
      rules: strategy.data.rules
    }

    let result = await this.props.managers.app.strategyCreate(object)

    if (result.status == 201) {
      this.objectCreated()
    }
    else {
      let msg = await this.props.getHttpTranslation(result, this.compId, "strategy")
      this.setState({
        isLoading: false,
        alertState: "has-danger",
        alertMsg: msg.text
      })
    }
  }
  async updateObject(strategy) {
    let object = { id: strategy.data.id }

    for (var [k, v] of Object.entries(strategy.patch))
      if (strategy.initial[k] != v)
        switch (k) {
          case "isDynamic":
            object.is_dynamic = v
            break;
          case "isPublic":
            object.is_public = v
            break;
          default:
            object[k] = v
            break;
        }

    let result = await this.props.managers.app.strategyUpdate(object)

    if (result.status == 200) {
      this.objectUpdated()
    }
    else {
      let msg = await this.props.getHttpTranslation(result, this.compId, "strategy")
      this.setState({
        isLoading: false,
        alertState: "has-danger",
        alertMsg: msg.text
      })
    }
  }
  objectCreated() {
    let { prefs, getString } = this.props;

    this.setState({
      isLoading: false,
      alert: (
        <ReactBSAlert
          success
          style={{ display: "block", marginTop: "-100px" }}
          title={getString(prefs.locale, this.compId, "alert_created_title")}
          onConfirm={() => this.hideAlert()}
          confirmBtnBsStyle="primary"
        >
          {getString(prefs.locale, this.compId, "alert_created_text_p1")}
          {" "}
          {getString(prefs.locale, this.compId, "alert_created_text_p2")}
        </ReactBSAlert>
      )
    });

    this.props.runItIfSuccess()
  }
  objectUpdated() {
    let { prefs, getString } = this.props;

    this.setState({
      isLoading: false,
      alert: (
        <ReactBSAlert
          success
          style={{ display: "block", marginTop: "-100px" }}
          title={getString(prefs.locale, this.compId, "alert_updated_title")}
          onConfirm={() => this.hideAlert()}
          confirmBtnBsStyle="primary"
        >
          {getString(prefs.locale, this.compId, "alert_updated_text")}
        </ReactBSAlert>
      )
    });

    this.props.runItIfSuccess()
  }

  toggleModal(modalId) {
    this.setState({ ["modal_" + modalId + "_isOpen"]: !this.state["modal_" + modalId + "_isOpen"] });
  };
  toggleNavLink(navId, value) {
    this.setState({ [navId]: value })
  }
  hideAlert() {
    this.fakeUnmount()

    this.setState({
      alert: null
    });
    this.props.toggleModal(this.props.modalId)
  };

  render() {
    let { prefs, getString, modalId, isOpen } = this.props;
    let {
      isLoading,

      modal_chooseWS_isOpen,
      modal_quoteDetail_isOpen,
      modal_movingAverageDetail_isOpen,
      modal_phiboDetail_isOpen,

      activeWsMode,

      iItems,
      strategy,
      selected,

      alert,
      alertState,
      alertMsg,
    } = this.state;

    return (
      <Modal isOpen={isOpen} size="xl" toggle={() => this.props.toggleModal(modalId)}>
        {alert}
        {/* Choose WS destination */}
        <Modal isOpen={modal_chooseWS_isOpen} toggle={() => this.toggleModal("chooseWS")}>
          <Card className="card-plain">
            <CardHeader className="modal-header">
              <button
                aria-hidden={true}
                className="close"
                data-dismiss="modal"
                type="button"
                onClick={() => this.toggleModal("chooseWS")}
              >
                <i className="nc-icon nc-simple-remove" />
              </button>
              <h5 className="modal-title">
                {getString(prefs.locale, this.compId, "title_wsDestination_add")}
                {" "}
                {getString(prefs.locale, "indicators", selected.subcatId)}
                {" "}
                {getString(prefs.locale, this.compId, "title_wsDestination_to")}
                ...
              </h5>
              <hr />
            </CardHeader>
            <CardBody>
              {/* WS Destination */}
              <FormGroup>
                <label>{getString(prefs.locale, this.compId, "input_wsDestination")}
                  {" "}
                  <i id={"input_wsDestination_hint"} className="nc-icon nc-alert-circle-i" />
                </label>
                <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"input_wsDestination_hint"}>
                  {getString(prefs.locale, this.compId, "input_wsDestination_hint")}
                </UncontrolledTooltip>
                <Select
                  className="react-select"
                  classNamePrefix="react-select"
                  name="wsDestination"
                  placeholder={getString(prefs.locale, "generic", "input_select")}
                  value={selected.workspace}
                  options={strategy.workspaces}
                  onChange={value => this.onSelectChange("wsDestination", value)}
                />
              </FormGroup>
            </CardBody>
            <CardFooter className="text-center">
              <LabelAlert alertState={alertState} alertMsg={alertMsg} />
              <Button
                className="btn-round"
                color="success"
                data-dismiss="modal"
                type="submit"
                disabled={
                  selected.workspace ?
                    false : true
                }
                onClick={() => this.openSubcategoryDetail("add", selected.workspace, selected.subcatId)}
              >
                {getString(prefs.locale, this.compId, "btn_add")}
              </Button>
            </CardFooter>
          </Card>
        </Modal>
        {/* Quote */}
        <ModalQuoteDetail
          {...this.props}
          modalId="quoteDetail"
          isOpen={modal_quoteDetail_isOpen}
          toggleModal={this.toggleModal}
          onCommit={this.onWSCommit}
          items={selected.subcatId == "quote" ? applyFilterToObjList(iItems, { subcategory: selected.subcatId }) : []}
          action={selected.subcatId == "quote" ? selected.action : ""}
          workspace={selected.subcatId == "quote" ? selected.workspace.items : []}
          wsId={selected.subcatId == "quote" ? selected.workspace.id : ""}
          selectedItem={selected.subcatId == "quote" ? selected.indicator : {}}
        />
        {/* Moving Average */}
        <ModalMovingAvgDetail
          {...this.props}
          modalId="movingAverageDetail"
          isOpen={modal_movingAverageDetail_isOpen}
          toggleModal={this.toggleModal}
          onCommit={this.onWSCommit}
          items={selected.subcatId == "moving_average" ? applyFilterToObjList(iItems, { subcategory: selected.subcatId }) : []}
          action={selected.subcatId == "moving_average" ? selected.action : ""}
          workspace={selected.subcatId == "moving_average" ? selected.workspace.items : []}
          wsId={selected.subcatId == "moving_average" ? selected.workspace.id : ""}
          selectedItem={selected.subcatId == "moving_average" ? selected.indicator : {}}
        />
        {/* Phibo PVPC */}
        <ModalPhiboDetail
          {...this.props}
          modalId="phiboDetail"
          isOpen={modal_phiboDetail_isOpen}
          toggleModal={this.toggleModal}
          onCommit={this.onWSCommit}
          items={selected.subcatId == "phibo" ? applyFilterToObjList(iItems, { subcategory: selected.subcatId }) : []}
          action={selected.subcatId == "phibo" ? selected.action : ""}
          workspace={selected.subcatId == "phibo" ? selected.workspace.items : []}
          wsId={selected.subcatId == "phibo" ? selected.workspace.id : ""}
          selectedItem={selected.subcatId == "phibo" ? selected.indicator : {}}
        />
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
              {getString(prefs.locale, this.compId, ["title_" + this.props.action])}
            </h5>
            <hr />
            <label>
              <p>{getString(prefs.locale, this.compId, "label_intro_p1")}</p>
              <p>{getString(prefs.locale, this.compId, "label_intro_p2")}</p>
            </label>
            <hr />
          </CardHeader>
          <CardBody>
            {/* Type */}
            <Row className="justify-content-center">
              <Col md="3" xs="5">
                <div
                  className={classnames("card-choice", { active: strategy.data.type == "buy" })}
                  onClick={() => this.onChoiceChange("type", "buy")}
                >
                  <input
                    id="buy"
                    name="type"
                    type="radio"
                    defaultChecked={strategy.data.isPublic}
                  />
                  <div id="radio_buy" className="icon mm">
                    <i className="nc-icon nc-spaceship mm" />
                  </div>
                  <label>{getString(prefs.locale, this.compId, "input_buy")}</label>
                </div>
                <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"radio_buy"}>
                  {getString(prefs.locale, this.compId, "input_buy_hint")}
                </UncontrolledTooltip>
              </Col>
              <Col md="3" xs="5">
                <div
                  className={classnames("card-choice", { active: strategy.data.type == "sell" })}
                  onClick={() => this.onChoiceChange("type", "sell")}
                >
                  <input
                    id="sell"
                    name="type"
                    type="radio"
                  />
                  <div id="radio_sell" className="icon mm">
                    <i className="nc-icon nc-spaceship fa-rotate-90 mm" />
                  </div>
                  <label>{getString(prefs.locale, this.compId, "input_sell")}</label>
                </div>
                <UncontrolledTooltip delay={{ show: 200 }} placement="right" target={"radio_sell"}>
                  {getString(prefs.locale, this.compId, "input_sell_hint")}
                </UncontrolledTooltip>
              </Col>
            </Row>
            <br />
            {/* Visibility */}
            <Row className="justify-content-center">
              <Col md="3" xs="5">
                <div
                  className={classnames("card-choice", { active: strategy.data.isPublic })}
                  onClick={() => this.onChoiceChange("isPublic", true)}
                >
                  <input
                    id="public"
                    name="type"
                    type="radio"
                    defaultChecked={strategy.data.isPublic}
                  />
                  <div id="radio_public" className="icon mm">
                    <i className="nc-icon nc-world-2 mm" />
                  </div>
                  <label>{getString(prefs.locale, this.compId, "input_public")}</label>
                </div>
                <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"radio_public"}>
                  {getString(prefs.locale, this.compId, "input_public_hint")}
                </UncontrolledTooltip>
              </Col>
              <Col md="3" xs="5">
                <div
                  className={classnames("card-choice", { active: !strategy.data.isPublic })}
                  onClick={() => this.onChoiceChange("isPublic", false)}
                >
                  <input
                    id="private"
                    name="type"
                    type="radio"
                  />
                  <div id="radio_private" className="icon mm">
                    <i className="nc-icon nc-key-25 mm" />
                  </div>
                  <label>{getString(prefs.locale, this.compId, "input_private")}</label>
                </div>
                <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"radio_private"}>
                  {getString(prefs.locale, this.compId, "input_private_hint")}
                </UncontrolledTooltip>
              </Col>
            </Row>
            <br />
            {/* Name and Logic */}
            <Row>
              {/* Name*/}
              <Col lg="9" xs="8">
                <FormGroup className={`has-label ${strategy.states.name}`}>
                  <label>{getString(prefs.locale, this.compId, "input_name")}</label>
                  <Input
                    type="text"
                    name="name"
                    autoComplete="off"
                    value={strategy.data.name}
                    onChange={e => this.onChange(e.target.value, e.target.name)}
                  />
                  {strategy.states.name == "has-danger" &&
                    <label className="error">
                      {getString(prefs.locale, this.compId, "error_name")}
                    </label>
                  }
                </FormGroup>
              </Col>
              {/* Logic Type */}
              <Col lg="3" xs="4">
                <FormGroup>
                  <label>
                    {getString(prefs.locale, this.compId, "input_logic")}
                    {" "}
                    <i id={"input_logic_hint"} className="nc-icon nc-alert-circle-i" />
                  </label>
                  <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"input_logic_hint"}>
                    {getString(prefs.locale, this.compId, "input_logic_hint")}
                  </UncontrolledTooltip>
                  <Input
                    type="text"
                    name="isDynamic"
                    disabled
                    value={strategy.data.isDynamic ?
                      getString(prefs.locale, this.compId, "label_logic_dynamic") :
                      getString(prefs.locale, this.compId, "label_logic_static")
                    }
                  />
                </FormGroup>
              </Col>
            </Row>
            {/* Description*/}
            <FormGroup className={`has-label ${strategy.states.desc}`}>
              <label>{getString(prefs.locale, this.compId, "input_description")}</label>
              <Input
                type="textarea"
                name="desc"
                value={strategy.data.desc}
                placeholder={getString(prefs.locale, this.compId, "label_description_placeholder")}
                onChange={e => this.onChange(e.target.value, e.target.name)}
              />
              {strategy.states.desc == "has-danger" &&
                <label className="error">
                  {getString(prefs.locale, this.compId, "error_desc")}
                </label>
              }
            </FormGroup>
            <br />

            {/* Workspaces */}
            <p className="card-category">
              {getString(prefs.locale, this.compId, "label_workspaces")}
            </p>
            <Nav pills role="wsMode" className="nav-pills nav-pills-icons justify-content-center">
              {/* Basic */}
              <NavItem>
                <NavLink
                  data-toggle="tab"
                  href="#"
                  role="wsMode"
                  className={activeWsMode === "basic" ? "active" : ""}
                  onClick={() => this.toggleNavLink("activeWsMode", "basic")}
                >
                  {getString(prefs.locale, this.compId, "label_basic")}
                </NavLink>
              </NavItem>
              {/* Transition */}
              <NavItem>
                <NavLink
                  data-toggle="tab"
                  href="#"
                  role="wsMode"
                  className={activeWsMode === "transition" ? "active" : ""}
                  onClick={() => this.toggleNavLink("activeWsMode", "transition")}
                >
                  {getString(prefs.locale, this.compId, "label_transition")}
                </NavLink>
              </NavItem>
              {/* Advanced */}
              <NavItem>
                <NavLink
                  data-toggle="tab"
                  href="#"
                  role="wsMode"
                  className={activeWsMode === "advanced" ? "active" : ""}
                  onClick={() => this.toggleNavLink("activeWsMode", "advanced")}
                >
                  {getString(prefs.locale, this.compId, "label_advanced")}
                </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={activeWsMode} className="tab-space tab-subcategories">
              <TabPane tabId="basic">
                <div className="text-center">
                  <label>
                    <p>{getString(prefs.locale, this.compId, "label_basic_intro_p1")}</p>
                    <p>{getString(prefs.locale, this.compId, "label_basic_intro_p2")}</p>
                  </label>
                </div>
                {/* Indicators */}
                <Row className="justify-content-center">
                  {this.renderSubcategoryAsCard(iItems, "quote")}
                  {this.renderSubcategoryAsCard(iItems, "moving_average")}
                  {this.renderSubcategoryAsCard(iItems, "phibo")}
                </Row>
                <br />
                <Row className="justify-content-center">
                  {this.renderBasicWS(strategy.workspaces)}
                </Row>
              </TabPane>
              <TabPane tabId="transition">
                <div className="text-center">
                  <label>
                    <p>{getString(prefs.locale, this.compId, "label_basic_intro_p1")}</p>
                    <p>{getString(prefs.locale, this.compId, "label_basic_intro_p2")}</p>
                  </label>
                </div>
                {/* Indicators */}
                <Row className="justify-content-center">
                  {this.renderSubcategoryAsCard(iItems, "quote")}
                  {this.renderSubcategoryAsCard(iItems, "moving_average")}
                  {this.renderSubcategoryAsCard(iItems, "phibo")}
                </Row>
                <br />
                <Row className="justify-content-center">
                  {this.renderTransitionWS(strategy.workspaces)}
                </Row>
              </TabPane>
              <TabPane tabId="advanced">
                <div className="text-center">
                  <label>
                    <p>{getString(prefs.locale, this.compId, "label_advanced_intro_p1")}</p>
                    <p>{getString(prefs.locale, "generic", "label_comingSoon")}</p>
                  </label>
                </div>
              </TabPane>
            </TabContent>
          </CardBody>
          <CardFooter className="text-center">
            <LabelAlert alertState={alertState} alertMsg={alertMsg} />
            <Button
              className="btn-simple btn-round"
              color="success"
              data-dismiss="modal"
              type="submit"
              disabled={
                !isLoading && strategy.isValidated ?
                  false : true
              }
              onClick={() => this.confirmClick(this.props.action, strategy)}
            >
              {isLoading ?
                <Spinner size="sm" /> :
                getString(prefs.locale, this.compId, ["btn_" + this.props.action])
              }
            </Button>
          </CardFooter>
        </Card>
      </Modal >
    )
  }
}

export default ModalStrategy;

ModalStrategy.propTypes = {
  managers: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  getHttpTranslation: PropTypes.func.isRequired,

  action: PropTypes.string.isRequired,
  objData: PropTypes.object.isRequired,

  modalId: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  toggleModal: PropTypes.func.isRequired,
  runItIfSuccess: PropTypes.func.isRequired
}
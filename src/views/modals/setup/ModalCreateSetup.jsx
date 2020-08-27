import React from "react";
import classnames from "classnames";
import PropTypes from "prop-types";
// reactstrap components
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardFooter,
  Col,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  FormGroup,
  Modal,
  Nav,
  Navbar,
  NavItem,
  NavLink,
  Input,
  Row,
  Spinner,
  TabContent,
  TabPane,
  UncontrolledDropdown,
  UncontrolledTooltip
} from "reactstrap";
// react component used to create sweet alerts
import ReactBSAlert from "react-bootstrap-sweetalert";
// Used to create a Sortable container
import SortableWithHandle from "../../../components/sortables/SortableWithHandle";

import RulesExplainer from "./RulesExplainer";
import ModalMovingAvgDetail from "./pricelagging/ModalMovingAvgDetail";

import LabelAlert from "../../../components/LabelAlert";
import {
  applyFilterToObjList,
  convertMaskedStringToFloat,
  convertFloatToCurrency,
  verifyLength,
  getFieldAsKey,
  getDistinctValuesFromList,
  retrieveObjFromObjList,
} from "../../../core/utils";


class ModalCreateSetup extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,
      isOpen: props.isOpen,
      isLoading: false,
      showAdvancedWS: true,

      modal_movingAverageDetail_isOpen: false,
      modal_phiboDetail_isOpen: false,

      activeNavId: "ws_main",

      currency: props.currency,

      iItems: [],
      selected: {
        subcategory: "",
        workspace: "ws_main"
      },

      setup: {
        workspaces: {
          ws_main: [],
          ws_centered_oscillator: [],
          ws_custom: []
        }
      },

      // Going to change setup: {}?, remeber to check/update this.clearInputFields()
      // setup: {
      //   data: {
      //     name: "",
      //     desc: "",
      //     stockExchange: "",
      //     balance: "",
      //   },
      //   states: {
      //     name: "",
      //     stockExchange: "",
      //     balance: ""
      //   },
      //   isValidated: undefined
      // },

      alertState: null,
      alertMsg: "",
    }

    this.moveIndicatorIntoWS = this.moveIndicatorIntoWS.bind(this)
    this.removeIndicatorFromWS = this.removeIndicatorFromWS.bind(this)
    this.onSortableChange = this.onSortableChange.bind(this)
    this.toggleModal = this.toggleModal.bind(this)
  }
  static getDerivedStateFromProps(props, state) {
    if (props.prefs.langId !== state.langId)
      return { langId: props.prefs.langId }
    if (props.isOpen !== state.isOpen)
      return { isOpen: props.isOpen }

    return null
  }
  componentDidMount() {
    this.prepareRequirements()
  }
  async prepareRequirements() {
    this.prepareData()
  }

  async prepareData() {
    let { getString } = this.props;
    let { langId, iItems } = this.state;

    iItems = await this.props.managers.market.indicatorData()

    // Adding further information
    for (var item of iItems) {
      // Preparing to be read by Sortable or List
      item.value = item.id
      item.label = getString(langId, "indicators", item.label_id)

      switch (item.category) {
        case "price_lagging":
          item.wsId_default = "ws_main"
          break;
        case "centered_oscillator":
          item.wsId_default = "ws_centered_oscillator"
          break;
        default:
          item.wsId_default = undefined
          break;
      }

      // Move Price into WS
      if (item.id == "close")
        this.moveIndicatorIntoWS(item.wsId_default, item)
      // Move Zero Line into WS
      else if (item.id == "zero_line") {
        item.unchangeable = true
        this.moveIndicatorIntoWS(item.wsId_default, item)
      }
    }

    console.log(iItems)

    this.setState({ iItems })
  }

  clearInputFields() {
    let { setup } = this.state

    setup = {
      data: {
        name: "",
        desc: "",
        stockExchange: "",
        balance: ""
      },
      states: {
        name: "",
        stockExchange: "",
        balance: ""
      },
      isValidated: undefined
    }

    this.setState({ setup })
  }

  onSortableChange(wsId, items) {
    let { setup } = this.state;

    setup.workspaces[wsId] = items

    this.setState({ setup })
  };

  onDragStart(e, subcatId) {
    this.setState({ isDragging: true })
    e.dataTransfer.setData("id", subcatId)

    console.log("Dragging " + subcatId)
  }
  onDrop(e, wsId) {
    this.setState({ isDragging: false })
    let subcatId = e.dataTransfer.getData("id");

    let selected = {
      subcategory: subcatId,
      workspace: wsId
    }

    this.setState({ selected })

    console.log("Dropping " + subcatId)
    console.log(selected)
  }

  onChange(event, stateName) {
    let newState = { setup: this.state.setup }

    if (this.state.alertState !== null) {
      newState.alertState = null
      newState.alertMsg = ""
    }

    newState.setup.data[stateName] = event.target.value

    switch (stateName) {
      case "name":
        if (this.verifyWalletName(event.target.value))
          newState.setup.states[stateName] = "has-success"
        else
          newState.setup.states[stateName] = "has-danger"
        break;
      case "balance":
        if (verifyLength(event.target.value, 1))
          newState.setup.states[stateName] = "has-success"
        else
          newState.setup.states[stateName] = "has-danger"
        break;
      default:
        break;
    }

    newState.setup.isValidated = this.isValidated(newState.setup)

    this.setState(newState)
  }

  iSubcategoryAsNavItem(iItems, subcatId) {

    let filters = { subcategory: subcatId }
    iItems = applyFilterToObjList(iItems, filters)
    let subcategories = getDistinctValuesFromList(iItems, "subcategory")

    return subcategories.map((subcatId) => {
      return (
        <NavItem
          key={"navItem_" + subcatId}
          draggable
          onClick={() => this.selectSubcategoryClick(subcatId)}
          onDragStart={(e) => this.onDragStart(e, subcatId)}
          onDragEnd={() => this.setState({ isDragging: false })}
        >
          <NavLink
            href="#">
            <span className="btn-label btn-label-left">
              <i className="nc-icon nc-simple-add" />
            </span>
            {" "}
            {this.props.getString(this.state.langId, "indicators", subcatId)}
          </NavLink>
        </NavItem >
      )
    });
  }

  selectSubcategoryClick(subcatId) {
    let modalId = undefined

    let selected = { subcategory: subcatId }

    switch (subcatId) {
      case "quote":
        break;
      case "zero_line":
        break;
      case "moving_average":
        modalId = "movingAverageDetail"
        selected.workspace = "ws_main"
        break;
      case "phibo":
        modalId = "phiboDetail"
        selected.workspace = "ws_centered_oscillator"
        break;
      default:
        break;
    }

    this.setState({ selected })

    if (modalId)
      this.toggleModal(modalId)
  }
  editIndicatorClick(wsId, itemId) {
    return null
    // Do something
  }

  moveIndicatorIntoWS(wsId, item) {
    let { setup } = this.state;

    if (setup.workspaces[wsId])
      setup.workspaces[wsId].push(item)

    this.setState({ setup })
  }
  removeIndicatorFromWS(wsId, itemId) {
    let { setup } = this.state;

    for (var x = 0; x < setup.workspaces[wsId].length; x++)
      if (itemId == setup.workspaces[wsId][x].id)
        setup.workspaces[wsId].splice(x, 1)

    console.log(setup)

    this.setState({ setup })
  }

  async confirmClick(e) {
    e.preventDefault();
    this.setState({ isLoading: true })

    let { compId, wallet } = this.state

    let data = {
      name: wallet.data.name,
      desc: wallet.data.desc,
      se_short: wallet.data.stockExchange.se_short,
      balance: convertMaskedStringToFloat(wallet.data.balance, this.state.currency),
      currency: this.state.currency.code
    };

    let result = await this.props.managers.app.walletCreate(data)

    if (result.status == 201) {
      this.objectCreated()
    }
    else {
      let msg = await this.props.getHttpTranslation(result, compId, "wallet")
      this.setState({
        isLoading: false,
        alertState: "has-danger",
        alertMsg: msg.text
      })
    }
  }

  objectCreated() {
    this.setState({
      isLoading: false,
      alert: (
        <ReactBSAlert
          success
          style={{ display: "block", marginTop: "-100px" }}
          title={this.props.getString(this.state.langId, this.state.compId, "alert_created_title")}
          onConfirm={() => this.hideAlert()}
          confirmBtnBsStyle="primary"
        >
          {this.props.getString(this.state.langId, this.state.compId, "alert_created_text")}
        </ReactBSAlert>
      )
    });

    this.clearInputFields()
    this.props.runItIfSuccess()
  }

  isValidated(obj) {
    for (var state of Object.values(obj.states))
      if (state != "has-success")
        return false
    return true
  }

  toggleModal(modalId) {
    this.setState({ ["modal_" + modalId + "_isOpen"]: !this.state["modal_" + modalId + "_isOpen"] });
  };
  toggleNavLink(navId, value) {
    this.setState({ [navId]: value })
  }
  hideAlert() {
    this.setState({
      alert: null
    });
    this.props.toggleModal(this.props.modalId)
  };

  render() {
    let { getString, modalId } = this.props;
    let {
      langId, compId, isOpen,
      isLoading,
      isDragging,

      modal_movingAverageDetail_isOpen,
      modal_phiboDetail_isOpen,

      activeNavId,

      currency,

      iItems,
      selected,
      selectedSubcategory,
      selectedWS,

      setup,

      alert,
      alertState,
      alertMsg,
    } = this.state;

    return (
      <Modal isOpen={isOpen} size="xl" toggle={() => this.props.toggleModal(modalId)}>
        {alert}
        <ModalMovingAvgDetail
          {...this.props}
          modalId="movingAverageDetail"
          isOpen={modal_movingAverageDetail_isOpen}
          toggleModal={this.toggleModal}
          items={
            selectedSubcategory == "moving_average" ?
              applyFilterToObjList(iItems, { subcategory: selected.subcategory }) : []
          }
          workspace={setup.workspaces[selected.workspace]}
          wsId={selected.workspace}
          moveIndicatorIntoWS={this.moveIndicatorIntoWS}
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
              {getString(langId, compId, "title")}
            </h5>
            <hr />
            <label>
              <p>{getString(langId, compId, "label_intro_p1")}</p>
              <p>{getString(langId, compId, "label_intro_p2")}</p>
              <p>
                <i className="nc-icon nc-bulb-63" />
                {" "}
                Apply indicators by dragging & dropping too.
              </p>
            </label>
            <hr />
          </CardHeader>
          <CardBody>
            <Row>
              {/* Quote and Indicators */}
              <Col xs="12" sm="12" md="12" lg="4" xl="3">
                <Card>
                  <CardHeader>
                    <p className="card-category">
                      Quote and Indicators
                    </p>
                  </CardHeader>
                  <Navbar className="navbar-transparent">
                    <Nav navbar>
                      {this.iSubcategoryAsNavItem(iItems, "zero_line")}
                      {this.iSubcategoryAsNavItem(iItems, "quote")}
                      {this.iSubcategoryAsNavItem(iItems, "moving_average")}
                      {this.iSubcategoryAsNavItem(iItems, "phibo")}
                    </Nav>
                  </Navbar>
                </Card>
              </Col>
              {/* Workspaces*/}
              <Col xs="12" sm="12" md="12" lg="8" xl="9">
                <Card>
                  <CardBody>
                    <p className="card-category">
                      Workspaces
                    </p>
                    {/* WS nav tabs */}
                    <div className="nav-tabs-navigation">
                      <div className="nav-tabs-wrapper">
                        <Nav tabs>
                          {/* Main */}
                          <NavItem>
                            <NavLink
                              id="tab_ws_main_hint"
                              href="#"
                              className={activeNavId == "ws_main" ? "active" : ""}
                              onClick={() => this.toggleNavLink("activeNavId", "ws_main")}
                              onDragOver={() => this.toggleNavLink("activeNavId", "ws_main")}
                            >
                              {getString(langId, compId, "tab_ws_main")}
                            </NavLink>
                            <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"tab_ws_main_hint"}>
                              {getString(langId, compId, "tab_ws_main_hint")}
                            </UncontrolledTooltip>
                          </NavItem>
                          {/* Centered Oscillator */}
                          <NavItem>
                            <NavLink
                              id="tab_ws_centered_oscillator_hint"
                              href="#"
                              className={activeNavId == "ws_centered_oscillator" ? "active" : ""}
                              onClick={() => this.toggleNavLink("activeNavId", "ws_centered_oscillator")}
                              onDragOver={() => this.toggleNavLink("activeNavId", "ws_centered_oscillator")}
                            >
                              {getString(langId, compId, "tab_ws_centered_oscillator")}
                            </NavLink>
                            <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"tab_ws_centered_oscillator_hint"}>
                              {getString(langId, compId, "tab_ws_centered_oscillator_hint")}
                            </UncontrolledTooltip>
                          </NavItem>
                          {/* Custom */}
                          <NavItem>
                            <NavLink
                              id="tab_ws_custom_hint"
                              href="#"
                              className={activeNavId == "ws_custom" ? "active" : ""}
                              onClick={() => this.toggleNavLink("activeNavId", "ws_custom")}
                              onDragOver={() => this.toggleNavLink("activeNavId", "ws_custom")}
                            >
                              {getString(langId, compId, "tab_ws_custom")}
                            </NavLink>
                            <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"tab_ws_custom_hint"}>
                              {getString(langId, compId, "tab_ws_custom_hint")}
                            </UncontrolledTooltip>
                          </NavItem>
                        </Nav>
                      </div>
                    </div>
                    {/* WS tab content */}
                    <TabContent activeTab={activeNavId}>
                      {/* Main */}
                      <TabPane
                        tabId="ws_main"
                        className="drop-area"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => this.onDrop(e, "ws_main")}>
                        <SortableWithHandle
                          context="ws_main"
                          items={setup.workspaces.ws_main}
                          onEditItem={this.editIndicatorClick}
                          onRemoveItem={this.removeIndicatorFromWS}
                          onSortableChange={this.onSortableChange} />
                      </TabPane>
                      {/* Centered Oscillator */}
                      <TabPane
                        tabId="ws_centered_oscillator"
                        className="drop-area drop-target"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => this.onDrop(e, "ws_centered_oscillator")}>
                        <SortableWithHandle
                          context="ws_centered_oscillator"
                          items={setup.workspaces.ws_centered_oscillator}
                          onEditItem={this.editIndicatorClick}
                          onRemoveItem={this.removeIndicatorFromWS}
                          onSortableChange={this.onSortableChange} />
                      </TabPane>
                      {/* Custom */}
                      <TabPane
                        tabId="ws_custom"
                        className="drop-area"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => this.onDrop(e, "ws_custom")}>
                        <SortableWithHandle
                          context="ws_custom"
                          items={setup.workspaces.ws_custom}
                          onEditItem={this.editIndicatorClick}
                          onRemoveItem={this.removeIndicatorFromWS}
                          onSortableChange={this.onSortableChange} />
                      </TabPane>
                    </TabContent>
                  </CardBody>
                </Card>
              </Col>
              {/* Explainer */}
              <Col md="12">
                <Card>
                  <CardHeader>
                    <p className="card-category">
                      Explainer
                    </p>
                  </CardHeader>
                  <CardBody>
                    <RulesExplainer
                      managers={this.props.managers}
                      prefs={this.props.prefs}
                      getString={this.props.getString}
                      workspaces={setup.workspaces}
                      filters={setup.workspaces.ws_main} />
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </CardBody>
          <CardFooter className="text-center">
            <LabelAlert alertState={alertState} alertMsg={alertMsg} />
            <Button
              className="btn-round"
              color="success"
              data-dismiss="modal"
              type="submit"
              disabled={
                !isLoading && setup.isValidated ?
                  false : true
              }
              onClick={e => this.confirmClick(e)}
            >
              {isLoading ?
                <Spinner animation="border" size="sm" /> :
                getString(langId, compId, "btn_confirm")
              }
            </Button>
          </CardFooter>
        </Card>
      </Modal >
    )
  }
}

export default ModalCreateSetup;

ModalCreateSetup.propTypes = {
  managers: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  getHttpTranslation: PropTypes.func.isRequired,

  modalId: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  toggleModal: PropTypes.func.isRequired,
  runItIfSuccess: PropTypes.func.isRequired
}
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
import { deepCloneObj } from "../../../core/utils";

class ModalStrategyView extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase();

    this.state = {
      isOpen: undefined,

      iItems: [],

      strategy: {
        data: {
          name: "",
          desc: "",
          type: "buy",
          isPublic: true,
          isDynamic: undefined,
          rules: "",
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
          }
        ],
      },

      currency: { code: "BRL", symbol: "R$", thousands_separator_symbol: ".", decimal_symbol: "," },
    }
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

    newState.strategy = {
      data: {
        name: "",
        desc: "",
        type: "buy",
        isPublic: true,
        isDynamic: undefined,
        rules: "",
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
        }
      ],
      isValidated: undefined
    }

    this.setState(newState)
  }

  async prepareRequirements() {
    let { prefs, getString, objData } = this.props;
    let { currency, iItems, strategy } = this.state;

    currency = await this.props.managers.app.currencyRetrieve(prefs.currency)
    iItems = await this.props.managers.strategy.prepareIndicatorItems(getString, prefs)

    strategy = this.prepareToView(iItems, strategy, objData)

    console.log(strategy)

    this.setState({ currency, iItems, strategy })
  }
  prepareToView(iItems, strategy, objData) {
    let { getString, prefs } = this.props;
    let { currency } = this.state;
    let wsRules = JSON.parse(objData.rules)

    for (var [wsId, rules] of Object.entries(wsRules)) {
      let ws = this.props.managers.strategy.convertJSONRulesIntoWS(getString, prefs, currency, iItems, wsId, rules)

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

    return strategy
  }

  onWSCommit(action, wsId, item) {
    let { strategy } = this.state;

    strategy.data.rules = []

    for (var ws of strategy.workspaces)
      if (ws.id === wsId) {
        // WS Data
        switch (action) {
          case "add":
            ws = this.addIndicatorIntoWS(ws, item)
            break;
        }
        // WS JSONRules
        ws.rules = this.props.managers.strategy.convertWSIntoJSONRules(ws)
      }

    // Strategy's rules
    strategy.data.rules = this.props.managers.strategy.jsonRulesAsString(strategy.workspaces)

    strategy.data.isDynamic = this.props.managers.strategy.isDynamic(strategy)

    this.setState({ strategy })
    return strategy
  }
  addIndicatorIntoWS(ws, item) {
    ws.items.push(item)

    return ws
  }

  render() {
    let { prefs, getString, modalId, isOpen } = this.props;
    let {
      strategy,
    } = this.state;

    return (
      <Modal isOpen={isOpen} size="xl" toggle={() => this.props.toggleModal(modalId)}>
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
              {strategy.data.name}
            </h5>
            <hr />
          </CardHeader>
          <CardBody>
            {/* Type and Visibility */}
            <Row className="justify-content-center">
              {/* Type */}
              <Col md="4" xs="5">
                <div className="card-choice active">
                  <input
                    id="type"
                    name="type"
                    type="radio"
                  />
                  <div id="radio_type" className="icon mm">
                    {strategy.data.type === "buy" ?
                      <i className="nc-icon nc-spaceship mm" /> :
                      <i className="nc-icon nc-spaceship fa-rotate-90 mm" />
                    }
                  </div>
                  <label>
                    {strategy.data.type === "buy" ?
                      getString(prefs.locale, this.compId, "input_buy") :
                      getString(prefs.locale, this.compId, "input_sell")
                    }
                  </label>
                </div>
                <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"radio_type"}>
                  {strategy.data.type === "buy" ?
                    getString(prefs.locale, this.compId, "input_buy_hint") :
                    getString(prefs.locale, this.compId, "input_sell_hint")
                  }
                </UncontrolledTooltip>
              </Col>
              {/* Visibility */}
              <Col md="4" xs="5">
                <div className="card-choice active">
                  <input
                    id="visilibity"
                    name="visilibity"
                    type="radio"
                  />
                  <div id="radio_visibility" className="icon mm">
                    {strategy.data.isPublic ?
                      <i className="nc-icon nc-world-2 mm" /> :
                      <i className="nc-icon nc-key-25 mm" />
                    }
                  </div>
                  <label>
                    {strategy.data.isPublic ?
                      getString(prefs.locale, this.compId, "input_public") :
                      getString(prefs.locale, this.compId, "input_private")
                    }
                  </label>
                </div>
                <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"radio_visibility"}>
                  {strategy.data.isPublic ?
                    getString(prefs.locale, this.compId, "input_public_hint") :
                    getString(prefs.locale, this.compId, "input_private_hint")
                  }
                </UncontrolledTooltip>
              </Col>
            </Row>
            <Row className="mt-3" />
            {/* Name and Logic */}
            <Row>
              {/* Name */}
              <Col lg="9" xs="8">
                <FormGroup>
                  <label>{getString(prefs.locale, this.compId, "input_name")}</label>
                  <Input
                    type="text"
                    name="name"
                    autoComplete="off"
                    value={strategy.data.name}
                  />
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
                    name="logicType"
                    disabled
                    value={strategy.data.isDynamic ?
                      getString(prefs.locale, this.compId, "label_logic_dynamic") :
                      getString(prefs.locale, this.compId, "label_logic_static")
                    }
                  />
                </FormGroup>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Modal>
    )
  }
}

export default ModalStrategyView;
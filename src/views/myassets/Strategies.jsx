import React from "react";
import PropTypes from "prop-types";
// react plugin for creating notifications over the dashboard
import NotificationAlert from "react-notification-alert";
// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Col,
  Row
} from "reactstrap";
// react component for creating dynamic tables
import FixedButton from "../../components/FixedPlugin/FixedButton";
// react component used to create sweet alerts
import ReactBSAlert from "react-bootstrap-sweetalert";

import StrategyCard from "./StrategyCard";
import ModalStrategy from "../modals/strategy/ModalStrategy";
import { orderBy, getDistinctValuesFromList } from "../../core/utils";

class Strategies extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,

      pageFirstLoading: true,
      modal_strategyDetail_isOpen: false,

      action: "create",
      objData: {},

      alert: null,
      strategies: [],
      sStrategyNames: [],
    }

    this.prepareData = this.prepareData.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.onClick = this.onClick.bind(this);
  }
  static getDerivedStateFromProps(props, state) {
    if (props.prefs.langId !== state.langId)
      return { langId: props.prefs.langId }
    return null
  }
  componentDidMount() {
    this.props.setNavbarTitleId("title_" + this.state.compId)
    this.prepareRequirements()
  }

  async prepareRequirements() {
    // Check User's subscription

    await this.prepareData()
    this.setState({ pageFirstLoading: false })
  }

  async prepareData() {
    let strategies = await this.props.managers.app.strategyData()
    strategies = orderBy(strategies, ['create_time'])
    let sStrategyNames = getDistinctValuesFromList(strategies, "name")

    this.setState({ strategies, sStrategyNames })
  }

  renderStrategies(strategies) {
    return strategies.map((strategy) => {
      return (
        <Col key={strategy.id} lg="6" md="12">
          <StrategyCard
            {...this.props}
            strategy={strategy}
            onClick={this.onClick}
          />
        </Col >
      )
    })
  }

  onClick(action, obj) {
    switch (action) {
      case "create":
        this.createClick()
        break;
      case "update":
        this.updateClick(obj)
        break;
      case "delete":
        this.deleteClick(obj)
        break;
      default:
        break;
    }
  }
  createClick() {
    this.setState({ action: "create" })
    this.toggleModal("strategyDetail")
  }
  updateClick(obj) {
    let objData = {
      id: obj.id,
      name: obj.name,
      desc: obj.desc,
      isDynamic: obj.is_dynamic,
      isPublic: obj.is_public,
      rules: obj.rules
    }

    this.setState({ action: "update", objData })
    this.toggleModal("strategyDetail")
  }
  deleteClick(obj) {
    this.setState({
      alert: (
        <ReactBSAlert
          warning
          style={{ display: "block", marginTop: "-100px" }}
          title={this.props.getString(this.state.langId, this.state.compId, "alert_confirming_title")}
          onConfirm={() => this.deleteObject(obj)}
          onCancel={() => this.hideAlert()}
          confirmBtnBsStyle="primary"
          cancelBtnBsStyle="danger"
          confirmBtnText={this.props.getString(this.state.langId, this.state.compId, "btn_alert_confirm")}
          cancelBtnText={this.props.getString(this.state.langId, this.state.compId, "btn_alert_cancel")}
          showCancel
        >
          {this.props.getString(this.state.langId, this.state.compId, "alert_confirming_text")}
        </ReactBSAlert>
      )
    });
  }
  async deleteObject(obj) {
    let result = await this.props.managers.app.strategyDelete(obj.id)

    if (result.status == 204)
      this.objectDeleted()
    else
      this.hideAlert()
  }
  objectDeleted() {
    this.setState({
      alert: (
        <ReactBSAlert
          success
          style={{ display: "block", marginTop: "-100px" }}
          title={this.props.getString(this.state.langId, this.state.compId, "alert_deleted_title")}
          onConfirm={() => this.hideAlert()}
          confirmBtnBsStyle="primary"
        >
          {this.props.getString(this.state.langId, this.state.compId, "alert_deleted_text")}
        </ReactBSAlert>
      )
    });

    this.prepareData()
  }

  toggleModal(modalId) {
    this.setState({ ["modal_" + modalId + "_isOpen"]: !this.state["modal_" + modalId + "_isOpen"] });
  };
  hideAlert() {
    this.setState({
      alert: null
    });
  };

  render() {
    let { getString } = this.props;
    let {
      langId,
      compId,

      pageFirstLoading,
      modal_strategyDetail_isOpen,

      action,
      objData,

      alert,

      strategies,
      sStrategyNames
    } = this.state;

    return (
      <div className="content">
        <NotificationAlert ref="notificationAlert" />
        {alert}
        <ModalStrategy
          {...this.props}
          modalId="strategyDetail"
          isOpen={modal_strategyDetail_isOpen}
          toggleModal={this.toggleModal}
          action={action}
          objData={action == "update" ? objData : {}}
          sStrategyNames={sStrategyNames}
          runItIfSuccess={this.prepareData}
        />
        <Card className="card-plain">
          <CardHeader>
            <Row>
              <Col>
                <CardTitle tag="h4">{getString(langId, compId, "card_title")}</CardTitle>
              </Col>
              <Col className="text-right">
                <Button
                  type="submit"
                  className="btn-round"
                  outline
                  color="success"
                  onClick={() => this.onClick("create")}
                >
                  {getString(langId, compId, "btn_newStrategy")}
                </Button>
              </Col>
            </Row>
          </CardHeader>
          <CardBody>
            <Row>
              {this.renderStrategies(strategies)}
            </Row>
          </CardBody>
        </Card>
      </div>
    )
  }
}

export default Strategies;

Strategies.propTypes = {
  managers: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  setNavbarTitleId: PropTypes.func.isRequired
}
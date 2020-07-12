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
  Row,
  Col,
  UncontrolledTooltip
} from "reactstrap";
// react component for creating dynamic tables
import ReactTable from "react-table";
// react component used to create sweet alerts
import ReactBSAlert from "react-bootstrap-sweetalert";
import FixedButton from "../../components/FixedPlugin/FixedButton";

import ModalOpenPosition from "../modals/position/ModalOpenPosition";
import ModalUpdatePosition from "../modals/position/ModalUpdatePosition";
import {
  convertFloatToCurrency,
  convertFloatToPercentage,
  deepCloneObj,
  integerWithThousandsSeparator,
  orderByDesc
} from "../../core/utils";
import TimeManager from "../../core/managers/TimeManager";
import { getString } from "../../core/lang";

class Positions extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,

      pageFirstLoading: true,

      alert: null,
      data: [],
      walletOptions: [],
      assetOptions: [],

      position: {
        data: {
          typeIsBuy: true,
          wallet: undefined,
          asset: undefined,
          amount: undefined,

          startedOn: undefined,
          s_price: undefined,
          s_cost: undefined,
          s_opCost: undefined,
          s_totalCost: undefined,

          endedOn: undefined,
          e_price: undefined,
          e_cost: undefined,
          e_opCost: undefined,
          e_totalCost: undefined
        },
        patch: {},  // Used only to update Position
        states: {
          walletState: undefined,
          assetState: undefined,
          amountState: undefined,
          startedOnState: undefined,
          endedOnState: undefined,
          s_priceState: undefined,
          e_priceState: undefined
        },

        isValidated: undefined
      },

      currency: { code: "USD", symbol: "$", thousands_separator_symbol: ",", decimal_symbol: "." },
      modal_openPosition_isOpen: false,
      modal_updatePosition_isOpen: false,
    }

    this.prepareData = this.prepareData.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.createClick = this.createClick.bind(this);
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
    let walletOptions = await this.props.managers.app.walletsForSelect()
    let currency = await this.props.managers.app.currencyRetrieve(this.props.prefs.currency)

    this.setState({ currency, walletOptions })
    await this.prepareData()
    this.setState({ pageFirstLoading: false })
  }

  async prepareData() {
    let { langId, compId } = this.state
    let positions = await this.props.managers.app.positionList()

    if (positions.data) {
      for (var obj of positions.data) {
        obj.wallet = await this.props.managers.app.walletRetrieve(obj.wallet)
        obj.wallet.value = obj.wallet.id
        obj.wallet.label = obj.wallet.name

        obj.asset = await this.props.managers.market.assetRetrieve(obj.asset_symbol)
        obj.asset = { value: obj.asset.asset_symbol, label: obj.asset.asset_label }

        obj.currency = await this.props.managers.app.currencyRetrieve(obj.wallet.currency)

        obj.type = await this.props.managers.app.positionTypeRetrieve(obj.type)
        if (obj.type.name == "buy")
          obj.typeIsBuy = true
        else
          obj.typeIsBuy = false

        obj.s_opCostPercent = Math.round(obj.s_operational_cost / obj.s_total_price * 100 * 100) / 100
        obj.e_opCostPercent = Math.round(obj.e_operational_cost / obj.e_total_price * 100 * 100) / 100
        obj.s_totalCost = obj.s_total_price + obj.s_operational_cost
        obj.e_totalCost = obj.e_total_price + obj.e_operational_cost
      }

      positions.data = orderByDesc(positions.data, "started_on")

      let data = positions.data.map((obj, key) => {
        return {
          key: key,
          id: obj.id,
          startedOn: TimeManager.getMoment(obj.started_on, false),
          startedOn_label: obj.started_on.substring(0, 10),
          endedOn: obj.ended_on ? TimeManager.getMoment(obj.ended_on, false) : null,
          endedOn_label: obj.ended_on ? TimeManager.getDateString(obj.ended_on) : null,
          wallet: obj.wallet,
          wallet_label: obj.wallet.name,
          asset: obj.asset,
          asset_symbol: obj.asset_symbol,
          asset_label: obj.asset_label,
          type: obj.type,
          typeIsBuy: obj.typeIsBuy,
          type_label: obj.typeIsBuy ? getString(langId, compId, "item_buy") : getString(langId, compId, "item_sell"),
          amount: integerWithThousandsSeparator(obj.amount, obj.currency.thousands_separator_symbol),

          s_price: convertFloatToCurrency(obj.s_unit_price, obj.currency),
          s_cost: convertFloatToCurrency(obj.s_total_price, obj.currency),
          s_opCost: convertFloatToCurrency(obj.s_operational_cost, obj.currency),
          s_opCostPercent: convertFloatToPercentage(obj.s_opCostPercent, obj.currency.decimal_symbol),
          s_totalCost: convertFloatToCurrency(obj.s_totalCost, obj.currency),

          e_price: obj.e_unit_price ? convertFloatToCurrency(obj.e_unit_price, obj.currency) : "",
          e_cost: obj.e_total_price ? convertFloatToCurrency(obj.e_total_price, obj.currency) : "",
          e_opCost: obj.e_operational_cost ? convertFloatToCurrency(obj.e_operational_cost, obj.currency) : "",
          e_opCostPercent: obj.e_opCostPercent ? convertFloatToPercentage(obj.e_opCostPercent, obj.currency.decimal_symbol) : "",
          e_totalCost: obj.e_totalCost ? convertFloatToCurrency(obj.e_totalCost, obj.currency) : "",

          actions: (
            <div className="actions-right">
              {/* use this button to edit kind of action */}
              <Button
                id={"positions_edit_" + obj.id}
                onClick={() => {
                  let obj = this.state.data.find(obj => obj.key === key);
                  this.updateClick(obj)
                }}
                color="warning"
                size="sm"
                className="btn-icon btn-link edit"
              >
                <i className="fa fa-edit" />
              </Button>{" "}
              <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"positions_edit_" + obj.id}>
                {this.props.getString(this.state.langId, this.state.compId, "positions_edit_hint")}
              </UncontrolledTooltip>
              {/* use this button to remove the data row */}
              <Button
                id={"positions_delete_" + obj.id}
                onClick={() => {
                  let obj = this.state.data.find(obj => obj.key === key);
                  this.deleteClick(obj)
                }}
                color="danger"
                size="sm"
                className="btn-icon btn-link remove"
              >
                <i className="fa fa-times" />
              </Button>
              <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"positions_delete_" + obj.id}>
                {this.props.getString(this.state.langId, this.state.compId, "positions_delete_hint")}
              </UncontrolledTooltip>
            </div>
          )
        }
      })

      this.setState({ data })
    }
  }

  createClick() {
    this.toggleModal("openPosition")
  }

  async updateClick(positionData) {
    let assetOptions = await this.props.managers.market.assetsForSelect(positionData.wallet.se_short)
    let currency = await this.props.managers.app.currencyRetrieve(positionData.wallet.currency)

    let position = {
      data: positionData,
      patch: {},
      states: {},

      isValidated: undefined
    }

    this.setState({
      position,
      assetOptions,
      currency
    })
    this.toggleModal("updatePosition")
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
          confirmBtnBsStyle="info"
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
    let result = await this.props.managers.app.positionDelete(obj.id)

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
          confirmBtnBsStyle="info"
        >
          {this.props.getString(this.state.langId, this.state.compId, "alert_deleted_text")}
        </ReactBSAlert>
      )
    });

    this.prepareData()
  }

  hideAlert() {
    this.setState({
      alert: null
    });
  };

  notify(msg) {
    let options = {
      place: "tc",
      message: msg,
      type: "danger",
      icon: "nc-icon nc-alert-circle-i",
      autoDismiss: 7
    };
    this.refs.notificationAlert.notificationAlert(options);
  }

  toggleModal(modalId) {
    this.setState({ ["modal_" + modalId + "_isOpen"]: !this.state["modal_" + modalId + "_isOpen"] });
  };

  render() {
    let { getString } = this.props;
    let {
      langId,
      compId,

      pageFirstLoading,

      alert,

      data,
      walletOptions,
      assetOptions,

      position,
      currency,

      modal_openPosition_isOpen,
      modal_updatePosition_isOpen,
    } = this.state;

    return (
      <div className="content">
        <NotificationAlert ref="notificationAlert" />
        {alert}
        <ModalOpenPosition
          {...this.props}
          modalId="openPosition"
          isOpen={modal_openPosition_isOpen}
          walletOptions={walletOptions}
          currency={currency}
          toggleModal={this.toggleModal}
          runItIfSuccess={this.prepareData}
        />
        <ModalUpdatePosition
          {...this.props}
          modalId="updatePosition"
          isOpen={modal_updatePosition_isOpen}
          position={{ ...position }}         // send just a copy
          walletOptions={walletOptions}
          assetOptions={assetOptions}
          currency={currency}
          toggleModal={this.toggleModal}
          runItIfSuccess={this.prepareData}
        />
        <Row>
          <Col md="12">
            <Card>
              <CardHeader>
                <CardTitle tag="h4">{getString(langId, compId, "card_title")}</CardTitle>
              </CardHeader>
              <CardBody>
                <ReactTable
                  data={data}
                  filterable
                  columns={[
                    {
                      Header: getString(langId, compId, "header_startedOn"),
                      accessor: "startedOn_label",
                      width: 120
                    },
                    {
                      Header: getString(langId, compId, "header_endedOn"),
                      accessor: "endedOn_label",
                      width: 120
                    },
                    {
                      Header: getString(langId, compId, "header_wallet"),
                      accessor: "wallet_label",
                    },
                    {
                      Header: getString(langId, compId, "header_asset"),
                      accessor: "asset_label",
                      width: 110
                    },
                    {
                      Header: getString(langId, compId, "header_type"),
                      accessor: "type_label",
                      width: 90
                    },
                    {
                      Header: getString(langId, compId, "header_amount"),
                      accessor: "amount",
                      className: "text-right"
                    },
                    {
                      Header: getString(langId, compId, "header_price"),
                      accessor: "s_price",
                      className: "text-right"
                    },
                    {
                      Header: getString(langId, compId, "header_opCost"),
                      accessor: "s_opCost",
                      width: 100,
                      className: "text-right"
                    },
                    {
                      Header: getString(langId, compId, "header_totalCost"),
                      accessor: "s_totalCost",
                      className: "text-right"
                    },
                    {
                      Header: getString(langId, compId, "header_actions"),
                      accessor: "actions",
                      width: 120,
                      sortable: false,
                      filterable: false
                    }
                  ]}
                  defaultPageSize={10}
                  noDataText={
                    pageFirstLoading ?
                      getString(langId, "generic", "label_loading") :
                      data.length == 0 ?
                        getString(langId, compId, "table_emptyData") :
                        getString(langId, compId, "table_noDataFound")
                  }
                  showPaginationBottom
                  className="-striped -highlight info-pagination"
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
        <FixedButton
          {...this.props}
          id="positions_newPosition"
          position="bottom"
          onClick={this.createClick}
          icon="fa fa-plus fa-2x"
        />
      </div>
    )
  }
}

export default Positions;

Positions.propTypes = {
  managers: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  setNavbarTitleId: PropTypes.func.isRequired
}
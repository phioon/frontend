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
import ReactTable from "react-table-v6";
// react component used to create sweet alerts
import ReactBSAlert from "react-bootstrap-sweetalert";
import FixedButton from "../../components/FixedPlugin/FixedButton";

import ModalCreateWallet from "../modals/wallet/ModalCreateWallet";
import ModalOpenPosition from "../modals/position/ModalOpenPosition";
import ModalUpdatePosition from "../modals/position/ModalUpdatePosition";
import {
  convertFloatToCurrency,
  convertFloatToPercentage,
  getDistinctValuesFromList,
  integerWithThousandsSeparator,
  orderBy,
  percentage,
  round,
  rtDefaultFilter
} from "../../core/utils";
import TimeManager from "../../core/managers/TimeManager";

class Positions extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase();

    this.state = {
      pageFirstLoading: true,

      modal_createWallet_isOpen: false,
      modal_openPosition_isOpen: false,
      modal_updatePosition_isOpen: false,

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

      currency: { code: "BRL", symbol: "R$", thousands_separator_symbol: ".", decimal_symbol: "," },
    }

    this.prepareRequirements = this.prepareRequirements.bind(this);
    this.prepareData = this.prepareData.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.createWallet = this.createWallet.bind(this);
    this.openPosition = this.openPosition.bind(this);
  }
  componentDidMount() {
    this.props.setNavbarTitleId("title_" + this.compId)
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
    let { prefs, getString } = this.props;
    let positions = await this.props.managers.app.positionList()

    if (positions.data) {
      let assets = getDistinctValuesFromList(positions.data, "asset_symbol")
      assets = await this.props.managers.market.assetList(true, assets)

      for (var obj of positions.data) {
        obj.wallet = await this.props.managers.app.walletRetrieve(obj.wallet)
        obj.wallet.value = obj.wallet.id
        obj.wallet.label = obj.wallet.name

        obj.asset = assets[obj.asset_symbol].data
        obj.asset = { value: obj.asset.asset_symbol, label: obj.asset.asset_label }

        obj.currency = await this.props.managers.app.currencyRetrieve(obj.wallet.currency)

        obj.type = await this.props.managers.app.positionTypeRetrieve(obj.type)
        if (obj.type.name == "buy")
          obj.typeIsBuy = true
        else
          obj.typeIsBuy = false

        obj.total_opCost = this.props.managers.measure.opCost_currency([obj])
        obj.s_opCostPercent = percentage(obj.s_operational_cost, obj.s_total_price, 2)
        obj.e_opCostPercent = percentage(obj.e_operational_cost, obj.e_total_price, 2)
        obj.s_totalCost = round(obj.s_total_price + obj.s_operational_cost, 2)
        obj.e_totalCost = round(obj.e_total_price + obj.e_operational_cost, 2)
      }

      positions.data = orderBy(positions.data, ["-started_on"])

      let data = positions.data.map((obj, key) => {
        return {
          key: key,
          id: obj.id,
          startedOn: TimeManager.getMoment(obj.started_on, false),
          startedOn_label: TimeManager.getLocaleDateString(obj.started_on, false),
          endedOn: obj.ended_on ? TimeManager.getMoment(obj.ended_on, false) : null,
          endedOn_label: obj.ended_on ? TimeManager.getLocaleDateString(obj.ended_on, false) : null,
          wallet: obj.wallet,
          wallet_label: obj.wallet.name,
          asset: obj.asset,
          asset_symbol: obj.asset_symbol,
          asset_label: obj.asset_label,
          type: obj.type,
          typeIsBuy: obj.typeIsBuy,
          type_label: obj.typeIsBuy ? getString(prefs.locale, this.compId, "item_buy") : getString(prefs.locale, this.compId, "item_sell"),
          amount: integerWithThousandsSeparator(obj.amount, obj.currency.thousands_separator_symbol),

          total_opCost: convertFloatToCurrency(obj.total_opCost, obj.currency),

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
                id={"edit_" + obj.id}
                onClick={() => {
                  let obj = this.state.data.find(obj => obj.key === key);
                  this.updateClick(obj)
                }}
                color="warning"
                size="sm"
                className="btn-icon btn-link edit"
              >
                <i id="position_edit" className="fa fa-edit" />
              </Button>{" "}
              <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"edit_" + obj.id}>
                {getString(prefs.locale, this.compId, "positions_edit_hint")}
              </UncontrolledTooltip>
              {/* use this button to remove the data row */}
              <Button
                id={"delete_" + obj.id}
                onClick={() => {
                  let obj = this.state.data.find(obj => obj.key === key);
                  this.deleteClick(obj)
                }}
                color="danger"
                size="sm"
                className="btn-icon btn-link remove"
              >
                <i id="position_delete" className="fa fa-times" />
              </Button>
              <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"delete_" + obj.id}>
                {getString(prefs.locale, this.compId, "positions_delete_hint")}
              </UncontrolledTooltip>
            </div>
          )
        }
      })

      this.setState({ data })
    }
  }

  async onClick(action, obj) {
    switch (action) {
      case "create":
        this.openPosition()
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
  createWallet() {
    this.toggleModal("createWallet")
  }
  openPosition() {
    this.toggleModal("openPosition")
  }
  async updateClick(obj) {
    let assetOptions = await this.props.managers.market.assetsForSelect(obj.wallet.se_short)
    let currency = await this.props.managers.app.currencyRetrieve(obj.wallet.currency)

    let position = {
      data: obj,
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
    let { prefs, getString } = this.props;

    this.setState({
      alert: (
        <ReactBSAlert
          warning
          style={{ display: "block", marginTop: "-100px" }}
          title={getString(prefs.locale, this.compId, "alert_confirming_title")}
          onConfirm={() => this.deleteObject(obj)}
          onCancel={() => this.hideAlert()}
          confirmBtnBsStyle="primary"
          cancelBtnBsStyle="danger"
          confirmBtnText={getString(prefs.locale, this.compId, "btn_alert_confirm")}
          cancelBtnText={getString(prefs.locale, this.compId, "btn_alert_cancel")}
          showCancel
        >
          {getString(prefs.locale, this.compId, "alert_confirming_text")}
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
    let { prefs, getString } = this.props;

    this.setState({
      alert: (
        <ReactBSAlert
          success
          style={{ display: "block", marginTop: "-100px" }}
          title={getString(prefs.locale, this.compId, "alert_deleted_title")}
          onConfirm={() => this.hideAlert()}
          confirmBtnBsStyle="primary"
        >
          {getString(prefs.locale, this.compId, "alert_deleted_text")}
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
    let { prefs, getString } = this.props;
    let {
      pageFirstLoading,

      modal_createWallet_isOpen,
      modal_openPosition_isOpen,
      modal_updatePosition_isOpen,

      alert,

      data,
      walletOptions,
      assetOptions,

      position,
      currency
    } = this.state;

    return (
      <div className="content">
        <NotificationAlert ref="notificationAlert" />
        {alert}
        <ModalCreateWallet
          {...this.props}
          modalId="createWallet"
          isOpen={modal_createWallet_isOpen}
          sWalletNames={[]}
          currency={currency}
          toggleModal={this.toggleModal}
          runItIfSuccess={this.prepareRequirements}
        />
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
        <Card>
          <CardHeader>
            <Row>
              <Col>
                <CardTitle tag="h4">{getString(prefs.locale, this.compId, "card_title")}</CardTitle>
              </Col>
              <Col className="text-right">
                <Button
                  id="position_new"
                  type="submit"
                  className="btn-round"
                  outline
                  color="success"
                  onClick={() => walletOptions.length == 0 ? this.createWallet() : this.onClick("create")}
                >
                  {getString(prefs.locale, this.compId, "btn_newPosition")}
                </Button>
              </Col>
            </Row>
          </CardHeader>
          <CardBody>
            <ReactTable
              data={data}
              filterable={data.length > 0 ? true : false}
              defaultFilterMethod={rtDefaultFilter}
              columns={[
                {
                  Header: getString(prefs.locale, this.compId, "header_startedOn"),
                  accessor: "startedOn_label",
                },
                {
                  Header: getString(prefs.locale, this.compId, "header_endedOn"),
                  accessor: "endedOn_label",
                },
                {
                  Header: getString(prefs.locale, this.compId, "header_wallet"),
                  accessor: "wallet_label",
                },
                {
                  Header: getString(prefs.locale, this.compId, "header_asset"),
                  accessor: "asset_label",
                },
                {
                  Header: getString(prefs.locale, this.compId, "header_type"),
                  accessor: "type_label",
                },
                {
                  Header: getString(prefs.locale, this.compId, "header_amount"),
                  accessor: "amount",
                  className: "text-right"
                },
                {
                  Header: getString(prefs.locale, this.compId, "header_price"),
                  accessor: "s_price",
                  className: "text-right",
                  filterable: false
                },
                {
                  Header: getString(prefs.locale, this.compId, "header_opCost"),
                  accessor: "total_opCost",
                  className: "text-right",
                  filterable: false
                },
                {
                  Header: getString(prefs.locale, this.compId, "header_totalCost"),
                  accessor: "s_totalCost",
                  className: "text-right",
                  filterable: false
                },
                {
                  Header: getString(prefs.locale, this.compId, "header_actions"),
                  accessor: "actions",
                  sortable: false,
                  filterable: false
                }
              ]}
              defaultPageSize={10}
              previousText={getString(prefs.locale, "reacttable", "label_previous")}
              nextText={getString(prefs.locale, "reacttable", "label_next")}
              pageText={getString(prefs.locale, "reacttable", "label_page")}
              ofText={getString(prefs.locale, "reacttable", "label_of")}
              rowsText={getString(prefs.locale, "reacttable", "label_rows")}
              noDataText={
                pageFirstLoading ?
                  getString(prefs.locale, "generic", "label_loading") :
                  data.length == 0 ?
                    getString(prefs.locale, this.compId, "table_emptyData") :
                    getString(prefs.locale, this.compId, "table_noDataFound")
              }
              showPaginationBottom
              className="-striped -highlight default-pagination"
            />
          </CardBody>
        </Card>
        <FixedButton
          {...this.props}
          id={"newPosition"}
          position="bottom"
          icon="fa fa-plus fa-2x"
          onClick={() => walletOptions.length == 0 ? this.createWallet() : this.onClick("create")}
          showTooltip={pageFirstLoading ? false : data.length == 0 ? true : false}
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
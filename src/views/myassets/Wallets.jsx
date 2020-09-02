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
  Row,
  UncontrolledTooltip
} from "reactstrap";
// react component for creating dynamic tables
import ReactTable from "react-table";
// react component used to create sweet alerts
import ReactBSAlert from "react-bootstrap-sweetalert";
import FixedButton from "../../components/FixedPlugin/FixedButton";

import ModalCreateWallet from "../modals/wallet/ModalCreateWallet";
import ModalUpdateWallet from "../modals/wallet/ModalUpdateWallet";
import { convertFloatToCurrency, getValueListFromObjList, orderBy } from "../../core/utils";

class Wallets extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,

      pageFirstLoading: true,

      alert: null,
      data: [],
      sWalletNames: [],

      wallet: {
        data: {
          id: undefined,
          name: undefined,
          desc: undefined,
          stockExchange: undefined,
          balance: undefined,
          balanceCurr: undefined,
        },
        patch: {},  // Used only to update Wallet
        states: {
          nameState: undefined,
          descState: undefined,
          balanceState: undefined,
        },

        isValidated: undefined,
      },

      currency: { code: "BRL", symbol: "R$", thousands_separator_symbol: ".", decimal_symbol: "," },

      modal_createWallet_isOpen: false,
      modal_updateWallet_isOpen: false,
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
    let currency = await this.props.managers.app.currencyRetrieve(this.props.prefs.currency)
    this.setState({ currency })

    await this.prepareData()
    this.setState({ pageFirstLoading: false })
  }

  async prepareData() {
    let wallets = await this.props.managers.app.walletList()

    if (wallets.data) {
      for (var obj of wallets.data) {
        obj.stockExchange = await this.props.managers.market.stockExchangeRetrieve(obj.se_short)
        obj.currency = await this.props.managers.app.currencyRetrieve(obj.currency)
      }

      wallets.data = orderBy(wallets.data, ["name"])

      let data = wallets.data.map((obj, key) => {
        return {
          key: key,
          id: obj.id,
          name: obj.name,
          desc: obj.desc,
          stockExchange: obj.stockExchange.se_name,
          currency: obj.currency.code,
          balance: convertFloatToCurrency(obj.balance, obj.currency),
          actions: (
            <div className="actions-right">
              {/* use this button to edit kind of action */}
              <Button
                id={"wallets_edit_" + obj.id}
                onClick={() => {
                  let obj = this.state.data.find(obj => obj.key === key);
                  this.updateClick(obj)
                }}
                color="warning"
                size="sm"
                className="btn-icon btn-link edit"
              >
                <i className="fa fa-edit" />
              </Button>
              {" "}
              <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"wallets_edit_" + obj.id}>
                {this.props.getString(this.state.langId, this.state.compId, "wallets_edit_hint")}
              </UncontrolledTooltip>
              {/* use this button to remove the data row */}
              <Button
                id={"wallets_delete_" + obj.id}
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
              <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"wallets_delete_" + obj.id}>
                {this.props.getString(this.state.langId, this.state.compId, "wallets_delete_hint")}
              </UncontrolledTooltip>
            </div>
          )
        }
      })

      let sWalletNames = getValueListFromObjList(wallets.data, "name")
      this.setState({ data, sWalletNames })
    }
  }
  async updateClick(walletData) {
    let currency = await this.props.managers.app.currencyRetrieve(walletData.currency)

    let wallet = {
      data: walletData,
      patch: {},
      states: {},

      isValidated: undefined
    }

    this.setState({
      wallet,
      currency,
    })

    this.toggleModal("updateWallet")
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
    let result = await this.props.managers.app.walletDelete(obj.id)

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

  hideAlert() {
    this.setState({ alert: null });
  };

  createClick() {
    this.toggleModal("createWallet")
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
      wallet,
      sWalletNames,
      currency,

      modal_createWallet_isOpen,
      modal_updateWallet_isOpen,

    } = this.state;

    return (
      <div className="content">
        <NotificationAlert ref="notificationAlert" />
        {alert}
        <ModalCreateWallet
          {...this.props}
          modalId="createWallet"
          isOpen={modal_createWallet_isOpen}
          sWalletNames={sWalletNames}
          currency={currency}
          toggleModal={this.toggleModal}
          runItIfSuccess={this.prepareData}
        />
        <ModalUpdateWallet
          {...this.props}
          modalId="updateWallet"
          isOpen={modal_updateWallet_isOpen}
          wallet={{ ...wallet }}              // send just a copy
          sWalletNames={sWalletNames}
          currency={currency}
          toggleModal={this.toggleModal}
          runItIfSuccess={this.prepareData}
        />
        <Card>
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
                  onClick={this.createClick}
                >
                  {getString(langId, compId, "btn_newWallet")}
                </Button>
              </Col>
            </Row>
          </CardHeader>
          <CardBody>
            <ReactTable
              data={data}
              filterable={data.length > 0 ? true : false}
              columns={[
                {
                  Header: getString(langId, compId, "header_name"),
                  accessor: "name"
                },
                {
                  Header: getString(langId, compId, "header_desc"),
                  accessor: "desc"
                },
                {
                  Header: getString(langId, compId, "header_stockExchange"),
                  accessor: "stockExchange",
                },
                {
                  Header: getString(langId, compId, "header_balance"),
                  accessor: "balance",
                  className: "text-right"
                },
                {
                  Header: getString(langId, compId, "header_actions"),
                  accessor: "actions",
                  sortable: false,
                  filterable: false
                }
              ]}
              defaultPageSize={10}
              previousText={getString(langId, "reacttable", "label_previous")}
              nextText={getString(langId, "reacttable", "label_next")}
              pageText={getString(langId, "reacttable", "label_page")}
              ofText={getString(langId, "reacttable", "label_of")}
              rowsText={getString(langId, "reacttable", "label_rows")}
              noDataText={
                pageFirstLoading ?
                  getString(langId, "generic", "label_loading") :
                  data.length == 0 ?
                    getString(langId, compId, "table_emptyData") :
                    getString(langId, compId, "table_noDataFound")
              }
              showPaginationBottom
              className="-striped -highlight default-pagination"
            />
          </CardBody>
        </Card>
        <FixedButton
          {...this.props}
          id="newWallet"
          position="bottom"
          onClick={this.createClick}
          icon="fa fa-plus fa-2x"
          showTooltip={pageFirstLoading ? false : data.length == 0 ? true : false}
        />
      </div>
    )
  }
}

export default Wallets;

Wallets.propTypes = {
  managers: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  setAuthStatus: PropTypes.func.isRequired,
  setNavbarTitleId: PropTypes.func.isRequired
}
/*!

=========================================================
* Paper Dashboard PRO React - v1.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/paper-dashboard-pro-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React from "react";
// react component for creating dynamic tables
import ReactTable from "react-table";

// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col
} from "reactstrap";

class ReactTables extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      langId: this.props.langId,
      compId: this.constructor.name.toLowerCase(),

      columns: this.props.columns,
      data: this.props.data,
    }
  }
  static getDerivedStateFromProps(props, state) {
    if (props.langId !== state.langId) {
      return {
        langId: props.langId
      }
    }
    return null
  }

  render() {
    let { getString } = this.props;
    let { langId, columns, data } = this.state

    return (
      <>
        <div className="content">
          <Row>
            <Col md="12">
              <Card>
                <CardHeader>
                  <CardTitle tag="h4">React-Tables</CardTitle>
                </CardHeader>
                <CardBody>
                  <ReactTable
                    data={data}
                    filterable
                    columns={columns}
                    defaultPageSize={10}
                    showPaginationTop={false}
                    showPaginationBottom
                    /*
                      You can choose between primary-pagination, info-pagination, success-pagination, warning-pagination, danger-pagination or none - which will make the pagination buttons gray
                    */
                    className="-striped -highlight primary-pagination"
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </>
    );
  }
}

export default ReactTables;

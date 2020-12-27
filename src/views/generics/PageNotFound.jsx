import React from "react";
import { Redirect } from "react-router-dom";
import PropTypes from "prop-types";
// reactstrap components
import {
  Button,
  Col,
  Row,
  Card,
  CardTitle,
  CardBody,
  CardFooter,
} from "reactstrap";

class PageNotFound extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase()

    this.state = {
      redirectTo: undefined
    };
  }
  componentDidMount() {
    this.props.setNavbarTitleId(`title_empty`)
  }

  render() {
    let { getString, prefs } = this.props;
    let { redirectTo } = this.state;

    return (
      <div className="content centered">
        <Row className="justify-content-center">
          <Col md="10" xs="12">
            <Card className="card-plain text-center">
              <CardTitle tag="h4">
                {getString(prefs.locale, this.compId, "label_title")}
              </CardTitle>
              <CardBody>
                <h5 className="description">
                  <small>
                    {getString(prefs.locale, this.compId, "label_desc")}
                  </small>
                </h5>
              </CardBody>
              <CardFooter>
                <Button
                  id="strategy_new"
                  type="submit"
                  className="btn-round"
                  outline
                  color="success"
                  onClick={() => this.setState({ redirectTo: "/" })}
                >
                  {getString(prefs.locale, this.compId, "btn_footer")}
                </Button>
              </CardFooter>
            </Card>
          </Col>
        </Row>
        { redirectTo && <Redirect to={redirectTo} />}
      </div >
    )
  }
}

export default PageNotFound

PageNotFound.propTypes = {
  prefs: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  managers: PropTypes.object.isRequired,
  setNavbarTitleId: PropTypes.func.isRequired
}
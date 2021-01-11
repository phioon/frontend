import React from "react";
import {
  Button,
  Card,
  CardBody,
  Col,
  Row,
} from "reactstrap";

class StrategyItem extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase();

    this.state = {
      onHover: undefined
    }
  }

  onClick(action, obj) {
    this.props.onClick(action, obj)
  }

  render() {
    let { size, strategy, removableIndex } = this.props;
    let { onHover } = this.state;

    return (
      <a
        className="muted"
        href={this.props.managers.app.strategyPagePath(strategy.uuid)}
        onMouseOver={() => this.setState({ onHover: true })}
        onMouseOut={() => this.setState({ onHover: false })}
        onClick={e => e.preventDefault()}
      >
        <Card className={`card-strategy-mini ${onHover ? "" : "card-plain"}`}>
          <CardBody>
            <Row>
              <Col className="align-center" onClick={() => this.onClick("goToStrategyPage", strategy)}>
                <div className={`avatar-icon ${size} ${strategy.type === "buy" ? "icon-success" : "icon-danger"}`}>
                  {strategy.type === "buy" ?
                    <i className="nc-icon nc-spaceship" /> :
                    <i className="nc-icon nc-spaceship fa-rotate-90" />}
                </div>
                <div>
                  {size === "sm" ?
                    strategy.name :
                    <h5><small>{strategy.name}</small></h5>
                  }
                  <p className="description">
                    <small>- {strategy.owner_username}
                    </small>
                  </p>
                </div>
              </Col>
              {removableIndex >= 0 &&
                <Col xs="1" className="centered">
                  <Button
                    className="btn-icon btn-neutral"
                    color="default"
                    size="sm"
                    onClick={() => this.props.onClick("remove", removableIndex)}
                  >
                    <i className="nc-icon nc-simple-remove" />
                  </Button>
                </Col>
              }
            </Row>
          </CardBody>
        </Card>
      </a>

    )
  }
}

export default StrategyItem;

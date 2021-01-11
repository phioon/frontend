import React from "react";
import {
  Button,
  Card,
  CardBody,
  Col,
  Row,
} from "reactstrap";

class UserItem extends React.Component {
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
    let { user, size, removableIndex } = this.props;
    let { onHover } = this.state;

    return (
      <a
        className="muted"
        href={this.props.managers.app.userProfilePath(user.username)}
        onMouseOver={() => this.setState({ onHover: true })}
        onMouseOut={() => this.setState({ onHover: false })}
        onClick={e => e.preventDefault()}
      >
        <Card className={`card-user-mini ${onHover ? "" : "card-plain"}`}>
          <CardBody>
            <Row className="align-center">
              <Col onClick={() => this.onClick("goToProfile", user)}>
                <div className={`avatar-picture ${size} text-center centered`}>
                  <span>{user.initials}</span>
                </div>
                <div>
                  {size === "sm" ?
                    user.full_name :
                    <h5><small>{user.full_name}</small></h5>
                  }
                  <p className="description">
                    <small>@{user.username}</small>
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
      </a >

    )
  }
}

export default UserItem;

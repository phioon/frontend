import React from "react";
import PropTypes from "prop-types";
// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  Col,
  Modal,
  Row
} from "reactstrap";
// javascript plugin used to create scrollbars on windows
import PerfectScrollbar from "perfect-scrollbar";
import Skeleton from "react-loading-skeleton";

import UserFollowingItem from "../../../components/listItems/UserFollowingItem";

var ps;

class ModalFollowing extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase();

    this.state = {
      firstLoading: true,

      iUsers: [],
      nextCursor: undefined,
    }

    this.userFollowingRef = React.createRef();
    this.onOpened = this.onOpened.bind(this);
    this.onClosed = this.onClosed.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.onClick = this.onClick.bind(this);
  }
  componentDidUpdate(prevProps) {
    if (prevProps.isOpen !== this.props.isOpen) {
      if (this.props.isOpen && this.state.firstLoading)
        this.fetchNext()
    }
    else if (prevProps.username !== this.props.username)
      this.fakeUnmount()
  }

  // Perfect Scrollbar
  onOpened() {
    // if you are using a Windows Machine, the scrollbars will have a Mac look
    if (navigator.platform.indexOf("Win") > -1) {
      ps = new PerfectScrollbar(this.userFollowingRef.current);
    }

    this.userFollowingRef.current.addEventListener("scroll", this.handleScroll);
  }
  onClosed() {
    // we need to destroy the false scrollbar when we navigate
    // to a page that doesn't have this component rendered
    if (navigator.platform.indexOf("Win") > -1) {
      ps.destroy();
      ps = null;
    }
  }

  handleScroll(e) {
    var node = e.target;
    let bottom = Math.round(node.scrollHeight - node.scrollTop, 0) === node.clientHeight;

    if (bottom) {
      this.fetchNext()
    }
  }
  fakeUnmount() {
    this.setState({
      firstLoading: true,
      iUsers: [],
      nextCursor: undefined
    })
  }

  async fetchNext() {
    let { username } = this.props;
    let { firstLoading, iUsers, nextCursor } = this.state;

    if (firstLoading || nextCursor) {
      let result = await this.props.managers.app.userFollowing(username, nextCursor)

      if (result.status == 200) {
        let data = result.data
        iUsers = iUsers.concat(data.results)

        nextCursor = this.getCursor(data.next)
      }
    }

    this.setState({ firstLoading: false, iUsers, nextCursor })
  }
  getCursor(url) {
    let cursor = undefined
    let strLookup = "cursor="

    if (url)
      cursor = String(url).substring(url.indexOf(strLookup) + strLookup.length)

    return cursor
  }

  async onClick(action, obj) {
    switch (action) {
      case "follow":
        await this.followClick(obj)
        break;
      case "goToProfile":
        this.props.toggleModal(this.props.modalId)
        this.props.onClick(action, obj)
        break;
      default:
        this.props.onClick(action, obj)
        break;
    }
  }
  async followClick(user) {
    let result = undefined

    if (user.is_followed_by_me)
      result = await this.props.managers.app.userUnfollow(user.username)
    else
      result = await this.props.managers.app.userFollow(user.username)

    if (result.status == 200) {
      this.props.onClick("refreshProfile")

      user = result.data.following_user
      this.overrideObj(user)
    }
  }
  overrideObj(user) {
    let { iUsers } = this.state;
    for (var obj of iUsers)
      if (obj.username === user.username) {
        obj.is_followed_by_me = user.is_followed_by_me
        break;
      }

    this.setState({ iUsers })
  }

  renderUsers(iUsers) {
    let { prefs, getString } = this.props;

    return iUsers.map((iUser, i) => {
      return (
        <UserFollowingItem
          key={`${iUser.username}__${i}`}
          prefs={prefs}
          getString={getString}
          managers={this.props.managers}
          onClick={this.onClick}
          user={this.props.user}
          item={iUser}
        />
      )
    })
  }
  renderSkeletons(amount = 10) {
    let rows = [...new Array(amount)]

    return rows.map((prop, i) => {
      return (
        <Row key={i}>
          <Col xs="10">
            <Skeleton />
          </Col>
          <Col xs="2" className="ml-auto">
            <Button className="btn-neutral" />
          </Col>
        </Row>
      )
    })
  }

  render() {
    let { prefs, getString, modalId, isOpen } = this.props;
    let { firstLoading, iUsers } = this.state;

    return (
      <div>
        <Modal isOpen={isOpen} toggle={() => this.props.toggleModal(modalId)} className="modal-following"
          onOpened={this.onOpened}
          onClosed={this.onClosed}
        >
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
              <h5 className="modal-title">
                {getString(prefs.locale, this.compId, "title")}
              </h5>
              <hr />
            </CardHeader>
            <div className="card-body" ref={this.userFollowingRef}>
              {firstLoading ?
                this.renderSkeletons() :
                iUsers.length === 0 ?
                  <div className="description centered">
                    {getString(prefs.locale, this.compId, "label_noFollowing")}
                  </div> :
                  this.renderUsers(iUsers)
              }
            </div>
          </Card>
        </Modal>
      </div>
    )
  }
}


export default ModalFollowing;

ModalFollowing.propTypes = {
  prefs: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  modalId: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  toggleModal: PropTypes.func.isRequired
}
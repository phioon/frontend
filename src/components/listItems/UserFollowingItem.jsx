import React from "react";
import PropTypes from "prop-types";
// reactstrap components
import {
	Button,
	Col,
	Row,
	Spinner,
} from "reactstrap";

class UserFollowingItem extends React.Component {
	constructor(props) {
		super(props);
		this.compId = this.constructor.name.toLowerCase();

		this.state = {
			btnFollow_onHover: undefined,
			isLoading_follow: undefined
		};

		this.onClick = this.onClick.bind(this);
	}

	async onClick(action, obj) {
		switch (action) {
			case "follow":
				this.setState({ isLoading_follow: true })
				await this.props.onClick(action, obj)
				this.setState({ isLoading_follow: false })
				break;
			default:
				this.props.onClick(action, obj)
				break;
		}
	}

	render() {
		let { getString, prefs, user, item } = this.props;
		let { btnFollow_onHover, isLoading_follow } = this.state;

		return (
			<Row className="user-item">
				<Col className="align-center">
					<a
						className="text-default"
						href={this.props.managers.app.userProfilePath(item.username)}
						onClick={e => {
							e.preventDefault()
							this.onClick("goToProfile", item)
						}}
					>
						{item.full_name}
						<br />
						<small className="description">@{item.username}</small>
					</a>
				</Col>
				<Col className="text-right">
					{user.username !== item.username &&
						<Button
							className="btn-round description"
							size="sm"
							outline
							onMouseOver={() => this.setState({ btnFollow_onHover: true })}
							onMouseOut={() => this.setState({ btnFollow_onHover: false })}
							onClick={() => this.onClick("follow", item)}
							color={isLoading_follow ?
								"default" :
								item.is_followed_by_me && btnFollow_onHover ?
									"danger" :
									item.is_a_follower && btnFollow_onHover ?
										"success" :
										"default"
							}
						>
							{isLoading_follow ?
								<Spinner size="sm" /> :
								item.is_followed_by_me ?
									btnFollow_onHover ?
										getString(prefs.locale, this.compId, "label_unfollow") :
										getString(prefs.locale, this.compId, "label_following") :
									getString(prefs.locale, this.compId, "label_follow")
							}
						</Button>
					}
				</Col>
			</Row>
		)
	}
}

export default UserFollowingItem;

UserFollowingItem.propTypes = {
	getString: PropTypes.func.isRequired,
	prefs: PropTypes.object.isRequired,

	user: PropTypes.object.isRequired,
}
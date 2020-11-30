class GtagManager {
	constructor() {
		this.sModule = "gtag"

		this.userParams = {
			userId: "id",
			userSubscription: "subscription.name",
			userLocale: "prefs.locale",
			userCurrency: "prefs.currency"
		}
	}

	setConfiguration(obj) {
		window.dataLayer.push(obj)
	}

	getUserProperties(user) {
		let obj = {}

		for (var [k, v] of Object.entries(this.userParams)) {
			if (v.includes(".")) {
				// Parameter must be accessed by a path. It's not directly assigned to user object...
				let [key, param] = String(v).split(".")
				obj[k] = user[key][param]
			}
			else {
				// Parameter directly assigned to user object...
				obj[k] = user[v]
			}
		}

		return obj
	}
	userInitialize(user, isLoginEvent) {
		let obj = this.getUserProperties(user)

		if (isLoginEvent)
			obj.event = "login"

		window.dataLayer.push(obj)
	}
	userLogout() {
		let obj = { event: "logout" }

		for (var param of Object.keys(this.userParams))
			obj[param] = undefined

		window.dataLayer.push(obj)
	}

	sendEvent(eventName, args) {
		if (args)
			window.dataLayer.push({ event: eventName, ...args })
		else
			window.dataLayer.push({ event: eventName })
	}
}

export default GtagManager;
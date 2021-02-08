import AuthManager from "./AuthManager";
import StorageManager from "./StorageManager";
import { deepCloneObj, httpRequest, indexOfObj, sleep } from "../utils";

class SearchManager {
	constructor(getHttpTranslation) {
		this.getHttpTranslation = getHttpTranslation

		this.sModule = "search"

		this.apis = {
			wsSearch: {
				options: {
					headers: {
						"Content-Type": "application/json",
						"Authorization": ""
					}
				},
				request: "/api/search/"
			},
		}
		this.query_lastCheck = ""
		this.query_next = ""
		this.rQueue = []
	}

	async startRequest(sKey) {
		let waitTime = 200
		let waitTimeLimit = 3000
		let waitedTime = 0

		while (this.rQueue.includes(sKey) && waitedTime <= waitTimeLimit) {
			// console.log(sKey + " waiting... rQueue: [" + this.rQueue + "]")
			await sleep(waitTime)
			waitedTime += waitTime
		}
		this.rQueue.push(sKey)
	}
	finishRequest(sKey) {
		this.rQueue.splice(this.rQueue.indexOf(sKey), 1)
	}
	formatQuery(query) {
		// Removes trailing spaces and transform to lower case...
		query = query.replace(/\s+/g, " ").trim()
		// Removes @
		query = query.replace("@", "")

		query = String(query).toLowerCase()
		return query
	}

	// Multi Model
	async multiSearch(query, top = 5) {
		// This function is triggered after an onChange() function. That means, every change on the field will trigger it.
		// To avoid stressing our backend, we'll try to reduce the amount of requests.
		const sKey = "multiSearch"
		query = this.formatQuery(query)
		if (query.length === 0) {
			// this.formatQuery() may remove some characters, turning query empty again...
			return {}
		}

		this.query_next = query                   // Sets the latest query to be used
		await this.startRequest(sKey)

		this.query_lastCheck = this.query_next    // Gets what's going to be the next query to be used
		query = this.query_lastCheck
		let subKey = query.replace(" ", "_")

		let result = await StorageManager.isUpToDate(this.sModule, sKey, subKey)
		if (result) {
			this.finishRequest(sKey)
			return result
		}

		let wsInfo = this.getApi("wsSearch")
		wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()
		wsInfo.method = "get"
		wsInfo.params = { q: query, top: top }

		result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers, wsInfo.params)

		if (result.status == 200) {
			result = result.data
			result = await StorageManager.store(sKey, result, subKey)
		}
		else {
			this.getHttpTranslation(result, "multisearch", "search", true)
			result = await StorageManager.getItem(sKey, subKey)
		}

		this.finishRequest(sKey)
		return result
	}
	async multiSearchCleanUp() {
		const sKey = "multiSearch"

		let sItem = await StorageManager.getItem(sKey)
		delete sItem.version

		for (var k of Object.keys(sItem)) {
			let isUpToDate = await StorageManager.isUpToDate(this.sModule, sKey, k)

			if (!isUpToDate)
				await StorageManager.removeItem(sKey, k)
		}
	}

	// User
	async userSearch(query, cursor = null) {
		// Backend uses CursorPagination. It's safer if [query_params] goes on Request instead of Params.
		query = this.formatQuery(query)
		if (query.length === 0) {
			// this.formatQuery() may remove some characters, turning query empty again...
			return {}
		}

		let wsInfo = this.getApi("wsSearch")
		wsInfo.request += `users/`
		wsInfo.request += `?q=${query}`
		if (cursor)
			wsInfo.request += `&cursor=${cursor}`

		wsInfo.method = "get"
		wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()

		let result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers)

		if (result.status != 200)
			this.getHttpTranslation(result, "usersearch", "search", true)

		return result
	}
	// Strategy
	async strategySearch(query, cursor = null) {
		// Backend uses CursorPagination. It's safer if [query_params] goes on Request instead of Params.
		query = this.formatQuery(query)
		if (query.length === 0) {
			// this.formatQuery() may remove some characters, turning query empty again...
			return {}
		}

		let wsInfo = this.getApi("wsSearch")
		wsInfo.request += `strategies/`
		wsInfo.request += `?q=${query}`
		if (cursor)
			wsInfo.request += `&cursor=${cursor}`

		wsInfo.method = "get"
		wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()

		let result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers)

		if (result.status != 200)
			this.getHttpTranslation(result, "strategysearch", "search", true)

		return result
	}

	// Recent Searches
	async recentSearchList() {
		// Stack structure. Last added item appears first.
		const sKey = "recentSearches"

		let sData = await StorageManager.getData(sKey)
		if (!sData)
			sData = []

		return sData
	}
	async recentSearchAdd(obj, context) {
		const sKey = "recentSearches"

		obj.context = context
		let keyField = undefined

		switch (context) {
			case "strategy":
				keyField = "uuid"
				break;
			case "user":
				keyField = "username"
				break;
			default:
				return
		}

		let sData = await StorageManager.getData(sKey)
		if (sData) {
			// There are stored searches...
			// Removes older searches for the same object (if it exists)
			let index = indexOfObj(sData, keyField, obj[keyField])

			if (index >= 0)
				sData = await this.recentSearchRemove(index)
		}
		else
			sData = []

		sData.splice(0, 0, obj)

		return await StorageManager.store(sKey, sData)
	}
	async recentSearchRemove(index) {
		const sKey = "recentSearches"
		let sData = await StorageManager.getData(sKey)

		if (sData && index >= 0) {
			sData.splice(index, 1)
			await StorageManager.store(sKey, sData)
		}
		return sData
	}
	async recentSearchClear() {
		const sKey = "recentSearches"
		await StorageManager.removeData(sKey)
	}

	getApi(apiId) {
		if (apiId in this.apis)
			return deepCloneObj(this.apis[apiId]);
		return null
	}
}

export default SearchManager;
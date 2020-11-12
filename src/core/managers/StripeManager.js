import AuthManager from "./AuthManager";
import { deepCloneObj, httpRequest, sleep } from "../utils";

import { loadStripe } from "@stripe/stripe-js";
var stripe_api = undefined;
if (process.env.NODE_ENV === "production")
  stripe_api = "pk_test_51HkbgHHiGSreEiGHpC8mXSmf5R2YNkDfLEhQIFrICQ646F9YnnUUYFFJehSO4btkE4s032OnaFFWgI5W9idI94be00f9gieyx3"
// stripe_api = "pk_live_51HkbgHHiGSreEiGHRC2RRIjONTMJOmfvsy3U857OtRm5s1FDM53EzjwocgrLWxZnxPMAP1rEej1aTurciVE7G9vj00FwTs4wTj"
else
  stripe_api = "pk_test_51HkbgHHiGSreEiGHpC8mXSmf5R2YNkDfLEhQIFrICQ646F9YnnUUYFFJehSO4btkE4s032OnaFFWgI5W9idI94be00f9gieyx3"

const stripe = loadStripe(stripe_api);

class StripeManager {
  constructor(getHttpTranslation) {
    this.getHttpTranslation = getHttpTranslation

    this.sModule = "stripe"
    this.apis = {
      wsCheckout: {
        options: {
          headers: {
            "Content-Type": "application/json",
            "Authorization": ""
          }
        },
        request: "/api/stripe/checkout/"
      },
      wsCustomerPortal: {
        options: {
          headers: {
            "Content-Type": "application/json",
            "Authorization": ""
          }
        },
        request: "/api/stripe/customer-portal/"
      },
    }

    this.rQueue = []
  }
  async startRequest() {
    let waitTime = 200
    let waitTimeLimit = 3000
    let waitedTime = 0

    while (!stripe && waitedTime <= waitTimeLimit) {
      console.log("Waiting for Stripe instance to become available...")
      await sleep(waitTime)
      waitedTime += waitTime
    }
  }

  async checkoutSessionCreate(data) {
    await this.startRequest()

    let wsInfo = this.getApi("wsCheckout")
    wsInfo.method = "post"
    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()
    wsInfo.data = data

    let result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers, undefined, wsInfo.data)

    if (result.status == 200) {
      result = result.data;
      (await stripe).redirectToCheckout(result)
    }
    else
      this.getHttpTranslation(result, "checkoutsessioncreate", "stripe", true)

    return result
  }
  async checkoutSessionRetrieve(sessionId) {
    await this.startRequest()

    let wsInfo = this.getApi("wsCheckout")
    wsInfo.request += `${sessionId}/`
    wsInfo.method = "get"
    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()

    let result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers)

    if (result.status == 200) {
      result = result.data;
    }
    else
      this.getHttpTranslation(result, "checkoutsessionretrieve", "stripe", true)

    return result
  }

  async customerPortalSessionCreate() {
    await this.startRequest()

    let wsInfo = this.getApi("wsCustomerPortal")
    wsInfo.method = "post"
    wsInfo.options.headers.Authorization = "token " + AuthManager.instantToken()

    let result = await httpRequest(wsInfo.method, wsInfo.request, wsInfo.options.headers)

    if (result.status == 200) {
      result = result.data;

      if (result.url)
        window.location.href = result.url;
    }
    else
      this.getHttpTranslation(result, "customerportalopen", "stripe", true)

    return result
  }

  getApi(apiId) {
    if (apiId in this.apis)
      return deepCloneObj(this.apis[apiId]);
    return null
  }
}

export default StripeManager;
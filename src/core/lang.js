export function getLangList() {
  return Object.keys(strings)
}

export function getString(langId, compId, strId) {
  if (langId in strings && compId in strings[langId] && strId in strings[langId][compId]) {
    return strings[langId][compId][strId];
  } else {
    if (strId === "") {
      // In some cases - labelAlerts - strId can be ""
      return ""
    }
    else
      return strings["enUS"][compId][strId];
  }
}

const strings = {
  enUS: {
    generic: {
      label_comingSoon: "Coming Soon...",
      label_loading: "Loading...",
    },
    appnavbar: {
      title_default: "Dashboard",
      title_openpositions: "Open Positions",
      title_positions: "My Assets",
      title_suggestions: "Technical Analysis",
      title_userprofile: "My Profile",
      title_walletoverview: "Overview",
      title_wallets: "My Assets",

      placeholder_search: "Search...",

      profile: "Profile",
      logout: "Log out"
    },
    assetfilter: {
      label_title: "Assets",
    },
    authnavbar: {
      signUp: "Sign Up",
      login: "Login"
    },
    charts: {
      chart_title_profitability: "Profitability over time (%)",
      chart_title_diversification: "Diversification (%)",
      chart_title_profitabilityRanking: "Profitability Ranking (%)",

      chart_tooltip_profitability: "% Profitability",

      label_groupBy: "Group By",
      label_order: "Order by",
      label_assets: "Asset",
      label_countries: "Country",
      label_sectors: "Sector",
      label_wallets: "Wallet",
      label_overall: "Overall",

      dropdown_timeInterval_daily: "Daily",
      dropdown_timeInterval_monthly: "Monthly",
      dropdown_timeInterval_top5: "TOP 5",
      dropdown_timeInterval_top10: "TOP 10",

      limitReached_asset_hint: "There are too many Assets on current selection. Try filtering it. ;)",
      limitReached_wallet_hint: "There are too many Wallets on current selection. Try filtering it. ;)",

      amountInvested_groupByAsset_hint: "Investments grouped by Assets.",
      amountInvested_groupByCountry_hint: "Investments grouped by Countries.",
      amountInvested_groupBySector_hint: "Investments grouped by Sectors.",

      profitabilityRanking_groupByAsset_hint: "Group by Asset.",
      profitabilityRanking_groupByWallet_hint: "Group by Asset.",
      profitabilityRanking_greater_hint: "Greater profitability.",
      profitabilityRanking_lesser_hint: "Lesser profitability.",

      result_overall_hint: "Profitability of the current selection over time.",
      result_groupByAsset_hint: "Group by Asset.",
      result_groupByWallet_hint: "Group by Wallet.",
    },
    confirmemail: {
      card_header: "Email Confirmation",
      btn_login: "Go to Login",
      btn_request: "Request a new email",

      alert_emailConfirmed_title: "Email verified!",
      alert_emailConfirmed_text: "Now, let's enjoy the app. ;)"
    },
    countries: {
      br: "Brazil",
      pt: "Portugal",
      us: "United States",
      gb: "United Kingdom"
    },
    dimensions: {
      assets: "Asset",
      positionDates: "Opening Interval",
      positionMonths: "Month (Opening)",
      positions: "Position",
      positionTypes: "Type",
      wallets: "Wallet"
    },
    fixedfilter: {
      label_title: "Filters"
    },
    fixedplugin: {
      newWallet_hint: "Create a Wallet.",
      newPosition_hint: "Open a new Position.",
      filters_hint: "Try some filters.",
    },
    footer: {
      webSite: "WEBSITE",
      appStore: "APP STORE",
      googlePlay: "GOOGLE PLAY",
      allRightsReserved: "All rights reserved"
    },
    forgotpassword: {
      card_header: "Recover Access",
      input_email: "Email",
      btn_recover: "Recover",
      label_emailSent: "I've emailed you instructions for recovering your access. Please, check if you received it. ;)"
    },
    httptranslation: {
      wallet_limitReached: "Need more wallets to manage your investments? Go premium and enjoy it! ;)",

      user_profileUpdated: "Profile updated!",

      user_alreadyExists: "hmm... If I'm not wrong, I've seen you here. Did you forget your password?",
      user_emailNotConfirmed: "Before we continue, I need you to confirm your email... Did you not receive the Confirmation Email yet?",
      user_emailCouldNotBeSent: "Ok, good news is that your user has been created. Bad news, my team couldn't send you a confirmation email. I already asked them to handle it, so you should receive an email in a couple hours. ;)",
      user_amountOfSessions: "Ooops... Seems like the amount of sessions for this user is exceeded. Wait a few minutes and try again.",
      user_invalidCredentials: "Seems like your credentials are incorrect. Please, try again.",
      user_password_entirelyNumeric: "Your new password has only numbers. Please, try a more secure combination.",
      user_password_invalid: "Seems like your current password is invalid. Please, try again.",
      user_password_tooSimilar: "Your new password is too similar to your personal data. Please, try a more secure combination.",
      user_tokenExpired: "Seems like this link has expired :( But don't worry! If you couldn't recover your access yet, please, proceed requesting a new one.",
      user_tokenExpired_confirmEmail: "Seems like this link has expired :( But don't worry! You can request a new one on Login page. ;)",

      backend_serviceUnavailable: "Ooops... Sorry for that. :( My team asked for a couple minutes to solve an issue. I'll be working offline for a while. Requests may become slower.",

      general_unauthorizedCodes: "I noticed you were away for a while and I decided to log you off, just in case. ;) Let's get back to work?",
      general_internalErrorCodes: "Ooops... Sorry for that. :( Seems like my team had a hard time processing your request.",
      general_noResponseReceived: "Ooops... Sorry for that. :( Seems like my team is out for lunch or they are ignoring me... I'll keep trying to reach them.",
      general_couldNotSendRequest: "I couldn't send your request. Check your internet connection and try again?",
    },
    languages: {
      enUS: "English",
      ptBR: "Português (Brasil)",
    },
    login: {
      card_header: "Login",
      input_email: "Email",
      input_password: "Password",

      btn_login: "Login",
      btn_forgotPassword: "Forgot Password",
      btn_resendEmail: "Resend Email",

      label_emailSent: "I've emailed you instructions for confirming your email again. Please, check if you received it. ;)"
    },
    measures: {
      currency: "Currency",
      percentage: "Percentage",
      number: "Number",
      label_format: "Format",

      amountInvested_kpi_label: "Amount Invested",
      amountInvested_title_hint: "Operational Costs included.",
      amountInvested_currency_hint: "Amount invested of your operations.",
      amountInvested_percentage_hint: "Amount Invested divided by wallet's balance.",
      amountInvested_alert_walletBallance: "Amount Invested is higher than Wallet's balance. Check wallet's balance to correct this metric.",

      closingVolume_kpi_label: "Closing Volume",
      closingVolume_title_hint: "Taking into account only closed Positions, it's the sum of closing value. For example, for an PURCHASE operation, I'll sum up its sale's price.",
      closingVolume_currency_hint: "Sum of Closing Volume of your operations.",

      opCost_kpi_label: "Operational Cost",
      opCost_title_hint: "Here, I'm including both opening and closing costs of a Position.",
      opCost_currency_hint: "Taxes, fees, comissions...",
      opCost_percentage_hint: "Operational Cost divided by Amount Invested.",

      result_kpi_label: "Profitability",
      result_title_hint: "Net profit. That's right, I've already considered your Operational Cost.",
      result_currency_hint: "How much your money is earning.",
      result_percentage_hint: "Gains/Losses divided by Amount Invested.",

      result_series_label: "Profitability over time",

      totalVolume_kpi_label: "Total Volume",
      totalVolume_title_hint: "Taking into account both open and closed Positions.",
      totalVolume_currency_hint: "Sum of Volume of your operations.",

      winners_kpi_label: "Winners",
      winners_number_hint: "Amount of Positions with positive result.",
      winners_percentage_hint: "Winner Positions divided by the total amount of Positions."
    },
    modalopenposition: {
      title: "Open a new Position",
      hint: "A Position is made of 2 Transactions: Opening (e.g Buy) and Closing (e.g Sale). For now, only opening info is needed.",

      input_type_buy: "BUY",
      input_type_sell: "SELL",
      input_select: "Select...",
      input_wallet: "Wallet",
      input_asset: "Asset",
      input_asset_noOptions: "Firstly, select a Wallet.",
      input_amount: "Amount",
      input_date: "Date",
      input_date_hint: "When did this operation happen?",
      input_price: "Price",
      input_price_hint: "In case operation was fractionated into different prices, what about we use average price?",
      input_cost: "Cost",
      input_cost_hint: "Here, I multiply Amount by Price.",
      input_opCost: "Operational Cost",
      input_opCost_hint: "Taxes, emoluments, fees... Any extra cost in this operation.",
      input_opCost_format: "Operational Cost format",
      input_totalCost: "Total Cost",
      input_totalCost_hint: "Cost + Operational Cost",

      opCost_currency_hint: "Use Currency format for field Operational Cost.",
      opCost_percentage_hint: "Use Percentage format for field Operational Cost.",

      alert_created_title: "Created!",
      alert_created_text: "Position has been created.",

      btn_confirm: "Create",
    },
    modalupdateposition: {
      title: "Update Position",
      label_intro_p1: "A Position is made of 2 events: Opening and Closing.",
      label_intro_p2: "I understand that a Position is closed once the fields under CLOSING tab are filled. ;)",

      tab_openingInfo: "OPENING",
      tab_closingInfo: "CLOSING",

      input_type: "Type",
      input_type_buy: "BUY",
      input_type_sell: "SELL",
      input_select: "Select...",
      input_wallet: "Wallet",
      input_asset: "Asset",
      input_amount: "Amount",
      input_purchaseDate: "Purchase Date",
      input_saleDate: "Sale Date",
      input_price: "Price",
      input_price_hint: "In case operation was fractionated into different prices, what about we use average price?",
      input_cost: "Cost",
      input_cost_hint: "Here, I multiply Amount by Price.",
      input_opCost: "Operational Cost",
      input_opCost_hint: "Taxes, emoluments, fees... Any extra cost in this operation.",
      input_opCost_format: "Operational Cost format",
      input_totalCost: "Total Cost",
      input_totalCost_hint: "Cost + Operational Cost",

      opCost_currency_hint: "Use Currency format for field Operational Cost.",
      opCost_percentage_hint: "Use Percentage format for field Operational Cost.",

      alert_updated_title: "Updated!",
      alert_updated_text: "Position has been updated.",

      alert_purchaseDateMissing: "Seems like you left the field 'Purchase Date' empty. Anyhow, Position will be updated, but it will be considered 'open' until field 'Purchase Date' is filled.",
      alert_saleDateMissing: "Seems like you left the field 'Sale Date' empty. Anyhow, Position will be updated, but it will be considered 'open' until field 'Sale Date' is filled.",

      btn_confirm: "Update",
    },
    modalchangepassword: {
      title: "Change Password",
      label_intro_p1: "I know having a complex password may be difficult to remember later, but we are talking of your personal data here.",
      label_intro_p2: "So, I'll ask you only 2 things for your new password:",
      label_intro_p3: "1. At least 8 characters long.",
      label_intro_p4: "2. Not entirely numeric.",

      input_currentPassword: "Current Password",
      input_newPassword: "New Password",
      input_confirmPassword: "Confirm Password",

      alert_passwordChanged_title: "Password changed",
      alert_passwordChanged_text: "Your password has been changed.",

      btn_confirm: "Change"
    },
    modalcreatewallet: {
      title: "Create Wallet",
      label_intro_p1: "I see you don't have a wallet yet...",
      label_intro_p2: "What if we create your first wallet now? Then, we'll be able to open Positions, take a look at Technical Analysis, and so on!",

      input_select: "Select...",

      input_name: "Name",
      input_description: "Description",
      input_currency: "Currency",
      input_stockExchange: "Stock Exchange",
      input_stockExchange_hint: "I need to bind a wallet to a Stock Exchange.",
      input_balance: "Initial Balance",
      input_balance_hint: "How much money will we start with?",

      error_name: "It's important that Wallet's name is unique.",

      alert_created_title: "Created!",
      alert_created_text: "Your wallet has been created.",

      btn_confirm: "Create",
    },
    modalupdatewallet: {
      title: "Update Wallet",

      input_name: "Name",
      input_description: "Description",
      input_currency: "Currency",
      input_stockExchange: "Stock Exchange",
      input_stockExchange_hint: "This wallet is bound to a Stock Exchange and I can't unbound it. :/",
      input_balance: "Balance",
      input_balance_hint: "What is the current balance?",

      error_name: "It's important that Wallet's name is unique.",

      alert_updated_title: "Updated!",
      alert_updated_text: "Your Wallet has been updated.",

      btn_confirm: "Update",
    },
    modalusercreated: {
      title: "We are almost there...",
      stepTitle1: "1. Confirm your email",
      stepDesc1: "Within a few minutes, you will receive an email with an account activation link.",
      stepTitle2: "2. Log in",
      stepDesc2: "Once your account is activated, you can log in to the app.",
      stepTitle3: "3. Enjoy it",
      stepDesc3: "You are about to have access to the best investor advisory platform.",
      footer: "If you have more questions, don't hesitate to contact us! It will be a pleasure to help you.",
      btn_goToLogin: "Go to Login"
    },
    monthLong: {
      "01": "January",
      "02": "February",
      "03": "March",
      "04": "April",
      "05": "May",
      "06": "June",
      "07": "July",
      "08": "August",
      "09": "September",
      "10": "October",
      "11": "November",
      "12": "December",
    },
    monthShort: {
      "01": "Jan",
      "02": "Feb",
      "03": "Mar",
      "04": "Apr",
      "05": "May",
      "06": "Jun",
      "07": "Jul",
      "08": "Aug",
      "09": "Sep",
      "10": "Oct",
      "11": "Nov",
      "12": "Dec",
    },
    openingintervalfilter: {
      label_title: "Opening Interval",
      title_hint: "It's related to the date positions were opened.",

      input_dateFrom: "From...",
      input_dateTo: "To...",

      alert_timeInterval_noPositions: "Ops... I didn't find any Position opened within this time interval. Would you like to try another one?",
    },
    positions: {
      card_title: "Positions",
      btn_newPosition: "New Position",

      table_noDataFound: "hmm... I didn't find any Position with this filter. Did I miss something?! ",
      table_emptyData: "Don't have your Positions here yet? Create it clicking on the button at your right. ;)",

      header_startedOn: "Started On",
      header_endedOn: "Ended On",
      header_wallet: "Wallet",
      header_type: "Type",
      header_asset: "Asset",
      header_amount: "Amount",
      header_price: "Price",
      header_opCost: "Op. Cost",
      header_totalCost: "Total Cost",
      header_actions: "Actions",

      item_buy: "Purchase",
      item_sell: "Sale",

      btn_alert_cancel: "Cancel",
      btn_alert_confirm: "Confirm",
      alert_confirming_title: "Are you sure?",
      alert_confirming_text: "Once deleted, it's not possible to recover it back.",
      alert_confirming_footer: "Once deleted, it's not possible to recover it back.",
      alert_deleted_title: "Deleted!",
      alert_deleted_text: "Position has been deleted.",

      positions_edit_hint: "Edit this Position.",
      positions_delete_hint: "Delete this Position."
    },
    register: {
      alert_generalErrorTitle: "Something went wrong...",
      alert_tryAgain: "Ooops... Sorry for that. :( Could you try again?",
      alert_404or50X: "Ooops... Sorry for that. :( Seems like my team had a hard time processing your request.",
      alert_couldNotSendRequest: "I couldn't send your request. Could you verify your internet connection and try again?",
      alert_username:
        "Ooops... A user with that email address already exists. Did you forget your password?",

      error_enterValidEmail: "Here, I need a valid email.",
      error_passwordLength: "It must have at least 8 characters.",
      error_passwordMatch: "Seems like password fields are not matching.",
      error_acceptPrivacyPolicy: "To proceed, I need you to accept our Privacy Policy.",

      info_selectNationality: "Select one",

      leftArea_infoTitle1: "Convenience",
      leftArea_infoDesc1: "Stop wasting time analysing tons of charts every day. Let us take care of it for you.",
      leftArea_infoTitle2: "Efficiency",
      leftArea_infoDesc2: "Be aware of prices on their supports and resistances in real-time.",
      leftArea_infoTitle3: "Control",
      leftArea_infoDesc3: "Manage your investments in a simple way.",

      card_header: "Create your account",
      info_orBeCassical: "or be classical",
      input_firstName: "First Name",
      input_lastName: "Last Name",
      input_email: "Email",
      input_password: "Password",
      input_confirmPassword: "Confirm Password",
      input_nationality: "Nationality",
      checkbox_iAgreeToThe: "I agree to the",
      checkbox_privacyPolicy: "privacy policy.",
      btn_createAccount: "Create account",
      btn_forgotPassword: "Forgot password",
    },
    sectors: {
      basic_materials: "Basic Materials",
      communication_services: "Communication Services",
      consumer_cyclical: "Consumer Cyclical",
      consumer_defensive: "Consumer Defensive",
      energy: "Energy",
      financial: "Financial",
      financial_services: "Financial",
      healthcare: "Healthcare",
      industrials: "Industrials",
      real_estate: "Real Estate",
      technology: "Technology",
      utilities: "Utilities",
    },
    setupcard: {
      label_buy: "BUY",
      label_sell: "SELL",
      label_maxPrice: "MAX PRICE",
      label_minPrice: "MIN PRICE",
      label_target: "TARGET",
      label_stopLoss: "STOP LOSS",
      label_gainPercent: "GAIN PERCENTAGE",
      label_lossPercent: "LOSS PERCENTAGE",
      label_riskReward: "RISK / REWARD",

      label_occurrencies: "OCCURRENCIES",
      label_successRate: "SUCCESS RATE",
      label_lastOccurrence: "LAST OCCURRENCE",

      label_gain: "GAIN !  \\o/",
      label_loss: ":( I hope you're already out.",
      label_buyingArea: "Time to Buy !",

      priceLimit_hint: "Price Limit suggested for this operation. It may be different connsidering your Risk Management.",
      stopLoss_hint: "Here is a safety spot where I believe price won't reach again. If it happens, leave the operation and wait for a new opportunity.",
      target_hint: "It is a projection to estimate where price may reach. Most of the time, I use Fibonacci sequence.",
      gainPercent_hint: "Price Suggested divided by Target.",
      lossPercent_hint: "Price Suggested divided by Stop Loss.",
      riskReward_hint: "Target divided by Stop Loss represents the correlation between Risk and Reward. The higher this number is, the better.",
      startedOn_hint: "Operation started on:",

      occurrencies_hint: "Amount of times this Technical Condition occurred for this Asset in the last 4 years.",
      successRate_hint: "Setup's success rate for this Asset in the last 4 years.",
      lastOccurrence_hint: "Last time this Technical Condition occurred for this Asset.",

      progressBar_stopLoss_hint: "Stop Loss",
      progressBar_target_hint: "Target",
      progressBar_endedOn_hint: "Operation ended on:",

      nav_summary: "Summary",
      nav_technicalCondition: "Technical Condition",
      nav_chart: "Chart",
    },
    setupintervalfilter: {
      label_title: "Time Interval",
      title_hint: "It's related to the date operations started on.",

      input_dateFrom: "From...",
      input_dateTo: "To...",

      alert_timeInterval_noSetups: "Ops... I didn't find any Technical Analysis within this time interval. Would you like to try another one?",
    },
    setpassword: {
      card_header: "Recover Account",
      input_password: "New Password",
      input_confirmPassword: "Confim Password",
      btn_recover: "Change Password",
      btn_login: "Go to Login",

      alert_passwordReseted_title: "Your password has been changed!",
      alert_passwordReseted_text: "Now we can log in again. ;)",
    },
    sidebar: {
      profile: "Profile",
      profileMini: "P",
      settings: "Settings",
      settingsMini: "S",

      myassets: "My Assets",
      wallets: "Wallets",
      walletsMini: "W",
      positions: "Positions",
      positionsMini: "P",

      wallet: "Wallet",
      walletoverview: "Overview",
      walletoverviewMini: "O",
      openpositions: "Open Positions",
      openpositionsMini: "OP",
      walletmanagerMini: "M",
      walletmanager: "Manager",

      technicalAnalysis: "Technical Analysis",
      suggestions: "Suggestions",
      suggestionsMini: "S",
    },
    statusfilter: {
      label_title: "Status",
    },
    stockexchangefilter: {
      label_title: "Stock Exchanges",
    },
    subscriptions: {
      basic_label: "BASIC",
      basic_desc_p1: "It's a great option if you are looking for basic functionalities.",
      basic_desc_p2: "So, I prepared a bundle of basic features that I hope it will fit your needs.",
      basic_desc_p3: "And it's for free! \\o/",

      premium_label: "PREMIUM",
      premium_desc_p1: "If you are looking for a more robust platform, I can show you our second option.",
      premium_desc_p2: "Thank to AI technology, I could learn how to do things humans usually do, and one of them is Technical Analysis.",
      premium_desc_p3: "",
      premium_desc_p4: "I'm designed to help investors being more efficient and secure.",

      platinum_label: "PLATINUM",
      platinum_desc_p1: "I see... You are a big player, looking for a way to improve your results.",
      platinum_desc_p2: "So, you need an intelligent platform for assets in the entire world",
      platinum_desc_p3: "I'm designed to help investors being more efficient and secure."
    },
    suggestions: {
      title: "Suggestions",
      label_noWallets_p1: "Hmm... Seems like you don't have a Wallet created so far... Let's create one?",
      label_noWallets_p2: "That way, I'll know which Stock Exchange you operate in, so I can look for the best opportunities there! ;)",
      label_noNews_p1: "Hmm... I do not see new opportunities over here.",
      label_noNews_p2: "Let me check again and I will get back to you! ;)",

      item_open: "On-going",
      item_closed: "Closed",
    },
    technicalconditions: {
      "btl_ema_7__trend_ema_610+": "Price is getting more support and starting an upward trend. Moving Averages 34, 144 and 610 are aligned up and Price is breaking above EMA 34. Gains may vary between 7% and 23%.",
      "btl_ema_7__trend_ema_144+": "Price is getting more support and starting an upward trend. Moving Averages 34, 144 and 610 are aligned up and Price is breaking above EMA 34. Gains may vary between 7% and 23%.",
      "btl_ema_0__trend_ema_610-": "Price is getting more resistance and starting an downward trend. Moving Averages 34, 144 and 610 are aligned down and Price is breaking bellow EMA 34. Gains may vary between 7% and 16%'.",
      "btl_ema_0__trend_ema_144-": "Price is getting more resistance and starting an downward trend. Moving Averages 34, 144 and 610 are aligned down and Price is breaking bellow EMA 34. Gains may vary between 7% and 16%.",
      phibo_1292_up_p1: "Price reached a key technical support after a retraction of <fibo_pct_retraction>% of Wave 1 and drew a Pivot Up.",
      phibo_1292_up_p2: "Support Lines are aligned up, increasing the probability of starting a long Wave 3.",
      phibo_305_up_p1: "Price reached an important technical support after a retraction of <fibo_pct_retraction>% of Wave 1 and drew a Pivot Up.",
      phibo_305_up_p2: "Support Lines are aligned up, increasing the probability of starting a Wave 3.",
      phibo_72_up_p1: "Price reached a technical support after a retraction of <fibo_pct_retraction>% of Wave 1 and drew a Pivot Up, increasing the probability of, at least, testing last top again.",

      phibo_1292_down_p1: "Price reached a key technical resistance after a retraction of <fibo_pct_retraction>% of Wave 1 and drew a Pivot Down.",
      phibo_1292_down_p2: "Resistance Lines are aligned down, increasing the probability of starting a long Wave 3.",
      phibo_305_down_p1: "Price reached an important technical resistance after a retraction of <fibo_pct_retraction>% of Wave 1 and drew a Pivot Down.",
      phibo_305_down_p2: "Resistance Lines are aligned down, increasing the probability of starting a Wave 3.",
      phibo_72_down_p1: "Price reached a technical resistance after a retraction of 21% from the recent bottom and drew a Pivot Down, increasing the probability of, at least, testing last bottom again.",
    },
    timeline: {
      title: "Timeline",
    },
    userprofile: {
      title_personalData: "Personal Data",
      title_prefs: "Preferences",

      label_joinedOn: "JOINED US ON",
      label_subscription: "SUBSCRIPTION",
      label_subscription_hint: "Your current plan.",
      label_expiresOn: "EXPIRES ON",
      label_expiresOn_hint: "It means your current subscription will last till this date.",
      label_renewsOn: "RENEWS ON",
      label_renewsOn_hint: "Probably, you will see a new transaction in your credit card on this date.",

      label_insights: "Insights",
      // Basic
      label_positions: "POSITIONS",
      label_positions_hint: "Amount of Positions managed.",
      label_volume: "TOTAL VOLUME",
      label_volume_hint: "Total volume negotiated. It includes both purchase and sale operations.",
      label_result: "RESULT",
      label_result_hint: "How much your money is earning.",
      // Premium
      label_suggestions: "Suggestions",
      label_suggestions_hint: "Amount of suggestions since the date you joined us.",

      input_select: "Select...",
      input_email: "Email",
      btn_changePassword: "Change Password",
      input_firstName: "First Name",
      input_lastName: "Last Name",
      input_nationality: "Nationality",
      input_birthday: "Birthday",
      input_birthday_hint: "I could send birthday gifts. Who knows...",

      input_currency: "Main Currency",
      input_currency_hint: "Do you invest in different countries? I could convert the currencies to your preferred one on dashboards and reports. ",
      input_language: "Language",

      btn_save: "Save"
    },
    walletfilter: {
      label_title: "Wallets",
    },
    walletoverview: {
      label_format: "Format",
      label_groupBy: "Group By",
      label_assets: "Assets",
      label_countries: "Countries",
      label_sectors: "Sectors",
      label_wallets: "Wallets",
      label_overall: "Overall",

      item_open: "Open",
      item_closed: "Closed",

      position_new_hint: "Open a new Position.",
    },
    wallets: {
      card_title: "Wallets",
      btn_newWallet: "New Wallet",

      table_noDataFound: "Don't have a Wallet yet? Create it clicking on the button at your right. ;)",

      header_name: "Name",
      header_balance: "Balance",
      header_desc: "Description",
      header_stockExchange: "Stock Exchange",
      header_currency: "Currency",
      header_actions: "Actions",

      btn_alert_cancel: "Cancel",
      btn_alert_confirm: "Confirm",
      alert_confirming_title: "Are you sure?",
      alert_confirming_text: "Positions linked to this Wallet are going to be deleted too.",
      alert_confirming_footer: "Once deleted, it's not possible to recover it back.",
      alert_deleted_title: "Deleted!",
      alert_deleted_text: "Your wallet has been deleted.",

      wallets_edit_hint: "Edit this Wallet.",
      wallets_delete_hint: "Delete this Wallet."
    },
  },
  ptBR: {
    generic: {
      label_comingSoon: "Em breve...",
      label_loading: "Carregando...",
    },
    appnavbar: {
      title_default: "Dashboard",
      title_openpositions: "Posições Abertas",
      title_positions: "Meus Ativos",
      title_suggestions: "Análise Técnica",
      title_userprofile: "Meu Perfil",
      title_walletoverview: "Visão Geral",
      title_wallets: "Meus Ativos",

      placeholder_search: "Pesquisar...",

      profile: "Perfil",
      logout: "Sair"
    },
    assetfilter: {
      label_title: "Ativos",
    },
    authnavbar: {
      signUp: "Criar Conta",
      login: "Login"
    },
    charts: {
      chart_title_diversification: "Diversificação (%)",
      chart_title_profitability: "Rentabilidade pelo tempo (%)",
      chart_title_profitabilityRanking: "Ranking de Rentabilidade (%)",

      chart_tooltip_profitability: "% Rentabilidade",

      label_groupBy: "Agrupar por",
      label_order: "Ordernar por",
      label_assets: "Ativo",
      label_countries: "País",
      label_sectors: "Setor",
      label_wallets: "Carteira",
      label_overall: "Geral",

      dropdown_timeInterval_daily: "Diário",
      dropdown_timeInterval_monthly: "Mensal",
      dropdown_timeInterval_top5: "TOP 5",
      dropdown_timeInterval_top10: "TOP 10",

      limitReached_asset_hint: "Existem muitos Ativos na seleção atual. Experimente filtra-los. ;)",
      limitReached_wallet_hint: "Existem muitas Carteiras na seleção atual. Experimente filtra-las. ;)",

      amountInvested_groupByAsset_hint: "Investimentos agrupados por Ativos.",
      amountInvested_groupByCountry_hint: "Investimentos agrupados por Paises",
      amountInvested_groupBySector_hint: "Investimentos agrupados por Setores.",

      profitabilityRanking_groupByAsset_hint: "Agrupar por Ativo.",
      profitabilityRanking_groupByWallet_hint: "Agrupar por Carteira.",
      profitabilityRanking_greater_hint: "Maior rentabilidade.",
      profitabilityRanking_lesser_hint: "Menor rentabilidade.",

      result_overall_hint: "Rentabilidade da seleção atual pelo tempo.",
      result_groupByAsset_hint: "Agrupar por Ativo.",
      result_groupByWallet_hint: "Agrupar por Carteira.",
    },
    confirmemail: {
      card_header: "Confirmação de E-mail",
      btn_login: "Ir para Login",

      alert_emailConfirmed_title: "E-mail verificado!",
      alert_emailConfirmed_text: "Agora é só curtir o app. ;)"
    },
    countries: {
      br: "Brasil",
      pt: "Portugal",
      us: "Estados Unidos",
      gb: "Reino Unido"
    },
    dimensions: {
      assets: "Ativo",
      positionDates: "Intervalo de Abertura",
      positionMonths: "Mês (Início)",
      positions: "Posição",
      positionTypes: "Tipo",
      wallets: "Carteira"
    },
    fixedfilter: {
      label_title: "Filtros"
    },
    fixedplugin: {
      newWallet_hint: "Criar uma Carteira.",
      newPosition_hint: "Abrir uma nova Posição.",
      filters_hint: "Experimente alguns filtros.",
    },
    footer: {
      webSite: "WEBSITE",
      appStore: "APP STORE",
      googlePlay: "GOOGLE PLAY",
      allRightsReserved: "Todos os direitos reservados"
    },
    forgotpassword: {
      card_header: "Recuperação de Acesso",
      input_email: "E-mail",
      btn_recover: "Recuperar",
      label_emailSent: "Envei um e-mail para você com instruções para recuperação de seu acesso. Dê uma olhada lá, por gentileza. ;)"
    },
    httptranslation: {
      wallet_limitReached: "Precisa de mais carteiras para gerenciar seus investimentos? Atualize seu plano e aproveite! ;)",

      user_profileUpdated: "Perfil atualizado!",

      user_emailCouldNotBeSent: "Ok, a boa notícia é que seu usuário foi criado. Má notícia, meu time não está conseguindo te enviar o email de confirmação. Já pedi para darem uma olhada no seu caso, então você deve receber um email nas próximas horas. ;)",
      user_emailNotConfirmed: "Antes de continuar, preciso que confirme seu e-mail... Ainda não recebeu o E-mail de Confirmação?",
      user_alreadyExists: "hmm... Se não me engano, eu já te vi por aqui. Esqueceu a senha?",
      user_amountOfSessions: "Ooops... A quantidade de sessões para este usuário foi excedida. Aguarde alguns minutos e tente novamente.",
      user_invalidCredentials: "Parece que suas credenciais estão incorretas. Por favor, tente novamente.",
      user_password_entirelyNumeric: "Sua nova senha possui apenas numeros. Que tal uma combinação mais segura?",
      user_password_invalid: "Parece que sua senha atual está incorreta. Por favor, tente novamente.",
      user_password_tooSimilar: "Parece que sua nova senha é muito similar à suas informações pessoais. Que tal tentar uma combinação mais segura?",
      user_tokenExpired: "hmm... Este link expirou :( Mas não se preocupe! Se você ainda não conseguiu recuperar seu acesso, basta solicitar um novo e-mail de Recupeção de Acesso.",
      user_tokenExpired_confirmEmail: "hmm... Este link expirou :( Mas não se preocupe! Você pode solicitar um novo link na página de Login. ;)",

      backend_serviceUnavailable: "Ooops... Me perdoe. :( Meu time me pediu alguns minutos para resolver um probleminha. Vou trabalhar em modo offline por um tempo. Pode ser que isso deixe as coisas mais lentas.",

      general_successCodes: "Feito.",
      general_unauthorizedCodes: "Percebi que ficou um tempo fora e, por segurança, decidi deslogar seu usuário. ;) Vamos voltar aos trabalhos?",
      general_internalErrorCodes: "Ooops... Me perdoe. :( Parece que meu time teve dificuldade para processar sua requisição.",
      general_noResponseReceived: "Ooops... Me perdoe. :( Parece que meu time saiu para comer algo ou estão me ignorando... Vou continuar tentando contata-los.",
      general_couldNotSendRequest: "Não estou conseguindo enviar sua requisição. Verifique sua conexão com a internet e tentar novamente?",
    },
    languages: {
      enUS: "English",
      ptBR: "Português (Brasil)",
    },
    login: {
      card_header: "Login",
      input_email: "E-mail",
      input_password: "Senha",

      btn_login: "Login",
      btn_forgotPassword: "Esqueceu a Senha",
      btn_resendEmail: "Reenviar E-mail",

      label_emailSent: "Envei um e-mail para você com instruções para confirmação de seu e-mail. Dê uma olhada lá, por gentileza. ;)"
    },
    measures: {
      currency: "Moeda",
      percentage: "Porcentagem",
      number: "Número",
      label_format: "Formato",

      amountInvested_kpi_label: "Valor Aplicado",
      amountInvested_title_hint: "Custo Operacional incluso.",
      amountInvested_currency_hint: "Valor Aplicado de suas Operações.",
      amountInvested_percentage_hint: "Valor Aplicado dividido pelo Saldo da Carteira.",
      amountInvested_alert_walletBallance: "Valor Aplicado é maior que o Saldo da Carteira. Dê uma olhada no Saldo da Carteira para corrigir esta métrica.",

      closingVolume_kpi_label: "Vol. Fechamento",
      closingVolume_title_hint: "Considerando apenas as Posições fechadas, eu somo o valor de fechamento. Por exemplo, para uma operação de COMPRA, vou somar seu valor da venda.",
      closingVolume_currency_hint: "Soma do Volume de Fechamento de suas Operações.",

      opCost_kpi_label: "Custo Operacional",
      opCost_title_hint: "Aqui, considero tanto os custos de abertura quanto de fechamento de uma Posição.",
      opCost_currency_hint: "Taxas, impostos, comissões, emolumentos...",
      opCost_percentage_hint: "Custo Operacional dividido pelo Valor Aplicado.",

      result_kpi_label: "Rentabilidade",
      result_title_hint: "Rentabilidade liquida. Isso mesmo, já descontei seu Custo Operacional.",
      result_currency_hint: "O quanto seu dinheiro está rendendo.",
      result_percentage_hint: "Ganhos/Perdas divididos pelo Valor Aplicado.",

      result_series_label: "Rentabilidade pelo tempo",

      totalVolume_kpi_label: "Volume Total",
      totalVolume_title_hint: "Considerando Posições abertas e fechadas.",
      totalVolume_currency_hint: "Soma do Volume de suas Operações.",

      winners_kpi_label: "Vencedoras",
      winners_number_hint: "Quantidade de Posições vencedoras.",
      winners_percentage_hint: "Quantidade de Posições Vencedoras dividido pela quantidade total de Posições."
    },
    modalopenposition: {
      title: "Abrir nova Posição",
      hint: "Uma posição é feita de 2 Transações: Abertura (ex. Compra) e Fechamento (ex. Venda). Nesse momento, apenas os dados da abertura são necessários.",

      input_select: "Selecione...",
      input_wallet: "Carteira",
      input_asset: "Ativo",
      input_asset_noOptions: "Primeiramente, selecione a Carteira.",
      input_type: "Tipo",
      input_type_buy: "COMPRA",
      input_type_sell: "VENDA",
      input_amount: "Quantidade",
      input_date: "Data",
      input_date_hint: "Quando a operação foi realizada?",
      input_price: "Preço",
      input_price_hint: "Caso a operação foi fracionada em diferentes preços, que tal usarmos preço médio?",
      input_cost: "Custo",
      input_cost_hint: "Aqui, multiplico Quantidade pelo Preço. ",
      input_opCost: "Custo Operacional",
      input_opCost_hint: "Impostos, emolumentos, taxas... Qualquer custo extra nesta operação.",
      input_opCost_format: "Formato de Custo Operacional",
      input_totalCost: "Custo Total",
      input_totalCost_hint: "Custo + Custo Operacional",

      opCost_currency_hint: "Use formato de Moeda para o campo Custo Operacional.",
      opCost_percentage_hint: "Use formato de Porcentagem para o campo Custo Operacional.",

      alert_created_title: "Criada!",
      alert_created_text: "Posição foi criada com sucesso.",

      btn_confirm: "Criar",
    },
    modalupdateposition: {
      title: "Atualizar Posição",
      label_intro_p1: "Uma posição possui 2 eventos: Abertura e Fechamento.",
      label_intro_p2: "Eu entendo que uma Posição está fechada quando os campos da aba FECHAMENTO estão preenchidos. ;)",

      tab_openingInfo: "ABERTURA",
      tab_closingInfo: "FECHAMENTO",

      input_type: "Tipo",
      input_type_buy: "COMPRA",
      input_type_sell: "VENDA",
      input_select: "Selecione...",
      input_wallet: "Carteira",
      input_asset: "Ativo",
      input_amount: "Quantidade",
      input_purchaseDate: "Data da Compra",
      input_saleDate: "Data da Venda",
      input_price: "Preço",
      input_price_hint: "Caso a operação foi fracionada em diferentes preços, que tal usarmos preço médio?",
      input_cost: "Custo",
      input_cost_hint: "Aqui, multiplico Quantidade pelo Preço. ",
      input_opCost: "Custo Operacional",
      input_opCost_hint: "Impostos, emolumentos, taxas... Qualquer custo extra nesta operação.",
      input_opCost_format: "Formato de Custo Operacional",
      input_totalCost: "Custo Total",
      input_totalCost_hint: "Custo + Custo Operacional",

      opCost_currency_hint: "Use formato de Moeda para o campo Custo Operacional.",
      opCost_percentage_hint: "Use formato de Porcentagem para o campo Custo Operacional.",

      alert_created_title: "Atualizada!",
      alert_created_text: "Posição foi atualizada com sucesso.",

      alert_purchaseDateMissing: "Vejo que deixou o campo 'Data da Compra' vazio. Tudo bem, vou atualizar a Posição com esses dados, mas vou considera-la como 'Aberta' até que o campo 'Data da Compra' esteja preenchido. ;)",
      alert_saleDateMissing: "Vejo que deixou o campo 'Data da Venda' vazio. Tudo bem, vou atualizar a Posição com esses dados, mas vou considera-la como 'Aberta' até que o campo 'Data da Venda' esteja preenchido. ;)",

      btn_confirm: "Atualizar",
    },
    modalchangepassword: {
      title: "Alterar Senha",
      label_intro_p1: "Eu entendo que uma senha complexa pode ser dificil de lembrar depois, mas estamos falando de seus dados pessoais aqui. ;)",
      label_intro_p2: "Então, para sua nova senha, vou te pedir apenas 2 coisas:",
      label_intro_p3: "1. Ao menos 8 caracteres",
      label_intro_p4: "2. Não seja apenas números.",

      input_currentPassword: "Senha Atual",
      input_newPassword: "Nova Senha",
      input_confirmPassword: "Confirmar Senha",

      alert_passwordChanged_title: "Senha alterada",
      alert_passwordChanged_text: "Sua senha foi alterada.",

      btn_confirm: "Alterar"
    },
    modalcreatewallet: {
      title: "Criar Carteira",
      label_intro_p1: "Vejo que você ainda não tem carteiras por aqui...",
      label_intro_p2: "Que tal criarmos sua primeira carteira? Assim, poderemos criar Posições, acessar Análises Técnicas, e muito mais!",

      input_select: "Selecione...",

      input_name: "Nome",
      input_description: "Descrição",
      input_currency: "Moeda",
      input_stockExchange: "Bolsa de Valores",
      input_stockExchange_hint: "Preciso vincular uma carteira à uma Bolsa de Valores.",
      input_balance: "Saldo Inicial",
      input_balance_hint: "Vamos começar com quanto?",

      error_name: "É importante que o nome da carteira seja único.",

      alert_created_title: "Criada!",
      alert_created_text: "Sua Carteira foi criada com sucesso.",

      btn_confirm: "Criar",
    },
    modalupdatewallet: {
      title: "Atualizar Carteira",

      input_name: "Nome",
      input_description: "Descrição",
      input_currency: "Moeda",
      input_stockExchange: "Bolsa de Valores",
      input_stockExchange_hint: "Esta carteira está vinculada à uma Bolsa de Valores e eu não posso desvincula-la. :/",
      input_balance: "Saldo",
      input_balance_hint: "Qual o saldo atual da carteira?",

      error_name: "É importante que o nome da Carteira seja único.",

      alert_updated_title: "Atualizada!",
      alert_updated_text: "Sua Carteira foi atualizada com sucesso.",

      btn_confirm: "Atualizar",
    },
    modalusercreated: {
      title: "Estamos quase lá...",
      stepTitle1: "1. Confirme seu e-mail",
      stepDesc1: "Dentro de alguns minutos, você receberá um e-mail com um link de ativação da sua nova conta.",
      stepTitle2: "2. Realize o login",
      stepDesc2: "Com a conta ativada, você está liberado para logar em nossa plataforma.",
      stepTitle3: "3. Aproveite",
      stepDesc3: "Você está prestes a conhecer a melhor plataforma de assistência ao investidor.",
      footer: "Se tiver alguma dúvida, entre em contato com a gente! Vai ser um prazer te ajudar.",
      btn_goToLogin: "Ir para Login"
    },
    monthLong: {
      "01": "Janeiro",
      "02": "Fevereiro",
      "03": "Março",
      "04": "Abril",
      "05": "Maio",
      "06": "Junho",
      "07": "Julho",
      "08": "Agosto",
      "09": "Setembro",
      "10": "Outubro",
      "11": "Novembro",
      "12": "Dezembro",
    },
    monthShort: {
      "01": "Jan",
      "02": "Fev",
      "03": "Mar",
      "04": "Abr",
      "05": "Mai",
      "06": "Jun",
      "07": "Jul",
      "08": "Ago",
      "09": "Set",
      "10": "Out",
      "11": "Nov",
      "12": "Dez",
    },
    openingintervalfilter: {
      label_title: "Intervalo Abertura",
      title_hint: "Relacionado às datas em que as Posições foram abertas.",

      input_dateFrom: "A partir de...",
      input_dateTo: "Até...",

      alert_timeInterval_noPositions: "Oops... Não encontrei Posições que foram abertas neste intervalo de tempo. Gostaria de tentar outro intervalo?",
    },
    positions: {
      card_title: "Posições",
      btn_newPosition: "Nova PosiÇão",

      table_noDataFound: "hmm... Não encontrei nenhuma Posição com esses filtros. Será que perdi algo?",
      table_emptyData: "Ainda não tem suas Posições aqui? Crie uma no botão à direita da tela. ;)",

      header_startedOn: "Início",
      header_endedOn: "Fim",
      header_wallet: "Carteira",
      header_type: "Tipo",
      header_asset: "Ativo",
      header_amount: "Quantidade",
      header_price: "Preço",
      header_opCost: "Custo Op.",
      header_totalCost: "Custo Total",
      header_actions: "Ações",

      item_buy: "Compra",
      item_sell: "Venda",

      btn_alert_cancel: "Cancelar",
      btn_alert_confirm: "Confirmar",
      alert_confirming_title: "Você tem certeza?",
      alert_confirming_text: "Uma vez removida, não é possível recupera-la.",
      alert_confirming_footer: "Uma vez removida, não é possível recupera-la.",
      alert_deleted_title: "Removida!",
      alert_deleted_text: "Posição foi removida com sucesso.",

      positions_edit_hint: "Editar esta Posição.",
      positions_delete_hint: "Deletar esta Posição."
    },
    register: {
      error_enterValidEmail: "Aqui, preciso de um e-mail válido.",
      error_passwordLength: "Precisa ser no minimo 8 caracteres.",
      error_passwordMatch: "Parece que os campos de senha não estão iguais.",
      error_acceptPrivacyPolicy: "Para prosseguir, preciso que aceite nossa Politica de Privacidade.",

      leftArea_infoTitle1: "Praticidade",
      leftArea_infoDesc1: "Pare de perder tempo todos os dias analisando gráficos de dezenas de ativos. Deixa isso com a gente.",
      leftArea_infoTitle2: "Eficiência",
      leftArea_infoDesc2: "Saiba quando os preços estão em pontos de suporte e resistência em tempo real.",
      leftArea_infoTitle3: "Controle",
      leftArea_infoDesc3: "Gerencie seus investimentos de forma simples.",

      card_header: "Crie sua conta",
      info_orBeCassical: "ou vá em modo clássico mesmo",
      input_firstName: "Primeiro Nome",
      input_lastName: "Último Nome",
      input_email: "E-mail",
      input_password: "Senha",
      input_confirmPassword: "Confirmar Senha",
      input_nationality: "Nacionalidade",
      checkbox_iAgreeToThe: "Eu concordo com a",
      checkbox_privacyPolicy: "política de privacidade.",

      btn_createAccount: "Criar conta",
      btn_forgotPassword: "Esqueceu a Senha",
    },
    sectors: {
      basic_materials: "Materiais Básicos",
      communication_services: "Comunicações",
      consumer_cyclical: "Consumo Cíclico",
      consumer_defensive: "Consumo não Cíclico",
      energy: "Energia",
      financial: "Financeiro",
      financial_services: "Financeiro",
      healthcare: "Saúde",
      industrials: "Indústria",
      real_estate: "Fundos Imobiliarios",
      technology: "Tecnologia",
      utilities: "Utilidades",
    },
    setupcard: {
      label_buy: "COMPRA",
      label_sell: "VENDA",
      label_maxPrice: "PREÇO MÁXIMO",
      label_minPrice: "PREÇO MÍNIMO",
      label_stopLoss: "STOP LOSS",
      label_target: "ALVO",
      label_gainPercent: "PORCENTAGEM GANHO",
      label_lossPercent: "PORCENTAGEM PERDA",
      label_riskReward: "RISCO / RETORNO",

      label_occurrencies: "OCORRÊNCIAS",
      label_successRate: "TAXA DE SUCESSO",
      label_lastOccurrence: "ÚLTIMA OCORRÊNCIA",

      label_gain: "GAIN !  \\o/",
      label_loss: ":( Espero que já tenha saído.",
      label_buyingArea: "Hora de comprar !",

      priceLimit_hint: "Preço Limite sugerido para esta operação. Este pode mudar, considerando seu Gerenciamento de Risco.",
      stopLoss_hint: "Aqui é um ponto de segurança onde acredito que o Preço não alcance novamente. Se isso acontecer, saia da operação e aguarde uma nova oportunidade.",
      target_hint: "Alvo é uma projeção para estimar onde o Preço pode chegar. Na maioria das vezes, utilizo sequência de Fibonacci.",
      gainPercent_hint: "Preço Limite dividido pelo Alvo.",
      lossPercent_hint: "Preço Limite dividido pelo Stop Loss.",
      riskReward_hint: "Alvo dividido pelo Stop Loss representa a relação Risco x Retorno da operação. Quanto maior este número, melhor.",
      startedOn_hint: "Data de Início da Operação.",

      occurrencies_hint: "Quantidade de vezes em que esta Condição Técnica aconteceu para este Ativo nos últimos 4 anos.",
      successRate_hint: "Taxa de Sucesso deste Setup para este Ativo nos últimos 4 anos.",
      lastOccurrence_hint: "Última vez em que esta Condição Técnica aconteceu para este Ativo.",

      progressBar_stopLoss_hint: "Stop Loss",
      progressBar_target_hint: "Alvo",
      progressBar_endedOn_hint: "Data de conclusão da Operação.",

      nav_summary: "Resumo",
      nav_technicalCondition: "Condição Técnica",
      nav_chart: "Gráfico",
    },
    setupintervalfilter: {
      label_title: "Intervalo Tempo",
      title_hint: "Relacionado às datas em que as Operações iniciaram.",

      input_dateFrom: "A partir de...",
      input_dateTo: "Até...",

      alert_timeInterval_noSetups: "Oops... Não encontrei Análises Técnicas neste intervalo de tempo. Gostaria de tentar outro intervalo?",
    },
    setpassword: {
      card_header: "Recuperação de Conta",
      input_password: "Nova Senha",
      input_confirmPassword: "Confimar Senha",
      btn_recover: "Alterar Senha",
      btn_login: "Ir para Login",

      alert_passwordReseted_title: "Sua senha foi alterada!",
      alert_passwordReseted_text: "Agora, já podemos tentar logar novamente. ;)"
    },
    sidebar: {
      profile: "Perfil",
      profileMini: "P",
      settings: "Configurações",
      settingsMini: "CFG",

      myassets: "Meus Ativos",
      wallets: "Carteiras",
      walletsMini: "C",
      positions: "Posições",
      positionsMini: "P",

      wallet: "Carteira",
      walletoverview: "Visão Geral",
      walletoverviewMini: "VG",
      openpositions: "Posições Abertas",
      openpositionsMini: "PA",
      walletmanagerMini: "M",
      walletmanager: "Manager",

      technicalAnalysis: "Análise Técnica",
      suggestions: "Recomendações",
      suggestionsMini: "R",
    },
    statusfilter: {
      label_title: "Status",
    },
    stockexchangefilter: {
      label_title: "Bolsa de Valores",
    },
    suggestions: {
      title: "Recomendações",
      label_noWallets_p1: "Hmm... Parece que você ainda tem Carteiras criadas por aqui... Que tal criar a primeira?",
      label_noWallets_p2: "Dessa forma, vou saber em qual Bolsa de Valores você atua para que eu possa procurar pelas melhores oportunidades lá! ;)",
      label_noNews_p1: "Hmm... Não estou encontrando novas oportunidades por aqui.",
      label_noNews_p2: "Assim que eu souber de algo, te aviso! ;)",

      item_open: "Em andamento",
      item_closed: "Fechado",
    },
    technicalconditions: {
      "btl_ema_7__trend_ema_610+": "Preço está ganhando mais suporte e iniciando uma tendência de alta. Médias Móveis 34, 144 e 610 estão alinhadas para cima e o Preço está rompendo acima da MME 34. Ganhos podem variar entre 7% e 23%.",
      "btl_ema_7__trend_ema_144+": "Preço está ganhando mais suporte e iniciando uma tendência de alta. Médias Móveis 34, 144 e 610 estão alinhadas para cima e o Preço está rompendo acima da MME 34. Ganhos podem variar entre 7% e 23%.",
      "btl_ema_0__trend_ema_610-": "Preço está ganhando mais resistência e iniciando uma tendência de baixa. Médias Móveis 34, 144 e 610 estão alinhadas para baixo e o Preço está rompendo abaixo da MME 34. Ganhos podem variar entre 7% e 16%.",
      "btl_ema_0__trend_ema_144-": "Preço está ganhando mais resistência e iniciando uma tendência de baixa. Médias Móveis 34, 144 e 610 estão alinhadas para baixo e o Preço está rompendo abaixo da MME 34. Ganhos podem variar entre 7% e 16%.",

      phibo_1292_up_p1: "Preço alcançou um suporte técnico chave após retração de <fibo_pct_retraction>% da Onda 1 e confirmou um Pivô de Alta.",
      phibo_1292_up_p2: "Linhas de Suporte estão alinhadas para cima, o que aumenta a probabilidade de início de uma longa onda 3.",
      phibo_305_up_p1: "Preço alcançou um suporte técnico importante após retração de <fibo_pct_retraction>% da Onda 1 e confirmou um Pivô de Alta.",
      phibo_305_up_p2: "Linhas de Suporte estão alinhadas para cima, o que aumenta a probabilidade de início de onda 3.",
      phibo_72_up_p1: "Preço alcançou um suporte técnico após retração de <fibo_pct_retraction>% da Onda 1 e confirmou um Pivô de Alta, aumentando a probabilidade de, ao menos, o preço testar o topo anterior novamente.",

      phibo_1292_down_p1: "Preço alcançou uma resistência técnica chave após retração de <fibo_pct_retraction>% da Onda 1 e confirmou um Pivô de Baixa.",
      phibo_1292_down_p2: "Linhas de Resistência estão alinhadas para baixo, o que aumenta a probabilidade de início de uma longa onda 3.",
      phibo_305_down_p1: "Preço alcançou uma resistência técnica importante após retração de <fibo_pct_retraction>% da Onda 1 e confirmou um Pivô de Baixa.",
      phibo_305_down_p2: "Linhas de Resistência estão alinhadas para baixo, o que aumenta a probabilidade de início de onda 3.",
      phibo_72_down_p1: "Preço alcançou uma resistência técnica após retração de <fibo_pct_retraction>% da Onda 1 e confirmou um Pivô de Baixa, aumentando a probabilidade de, ao menos, o preço testar o fundo anterior novamente.",
    },
    timeline: {
      title: "Linha do Tempo",
    },
    userprofile: {
      title_personalData: "Dados Pessoais",
      title_prefs: "Preferências",

      label_joinedOn: "MEMBRO DESDE",
      label_subscription: "ASSINATURA",
      label_subscription_hint: "Seu plano atual.",
      label_expiresOn: "EXPIRA EM",
      label_expiresOn_hint: "Sua assinatura permanecerá ativa até esta data.",
      label_renewsOn: "RENOVAÇÃO EM",
      label_renewsOn_hint: "Provavelmente, você verá uma nova transação em seu cartão de crédito nesta data.",

      label_insights: "Insights",
      // Basic
      label_positions: "POSIÇÕES",
      label_positions_hint: "Quantidade de Posições gerenciadas.",
      label_volume: "VOLUME TOTAL",
      label_volume_hint: "Volume total negociado. Inclui ambas operações de compra e venda.",
      label_result: "RESULTADO",
      label_result_hint: "O quanto seu dinheiro está rendendo.",
      // Premium
      label_suggestions: "RECOMENDAÇÕES",
      label_suggestions_hint: "Quantidade de recomendações desde a data em que temos você com a gente.",

      input_select: "Selecione...",
      input_email: "E-mail",
      btn_changePassword: "Alterar Senha",
      input_firstName: "Primeiro Nome",
      input_lastName: "Último Nome",
      input_nationality: "Nacionalidade",
      input_birthday: "Data de Nascimento",
      input_birthday_hint: "Eu poderia enviar presentes de aniversário. Quem sabe...",

      input_currency: "Moeda Principal",
      input_currency_hint: "Investe em diferentes países? Posso converter outras moedas para a de sua preferência em relatórios e dashboards. ",
      input_language: "Língua",

      btn_save: "Salvar"
    },
    walletfilter: {
      label_title: "Carteiras",
    },
    walletoverview: {
      label_format: "Formato",
      label_groupBy: "Agrupar por",
      label_assets: "Ativos",
      label_countries: "Países",
      label_sectors: "Setores",
      label_wallets: "Carteiras",
      label_overall: "Geral",

      item_open: "Aberto",
      item_closed: "Fechado",

      position_new_hint: "Abrir uma nova Posição.",
    },
    wallets: {
      card_title: "Carteiras",
      btn_newWallet: "Nova Carteira",

      table_noDataFound: "hmm... Não encontrei nenhuma Carteira com esses filtros. Será que perdi algo?",
      table_emptyData: "Ainda não tem Carteiras aqui? Crie uma no botão à direita da tela. ;)",

      header_name: "Nome",
      header_balance: "Saldo",
      header_desc: "Descrição",
      header_stockExchange: "Bolsa de Valores",
      header_currency: "Moeda",
      header_actions: "Ações",

      btn_alert_cancel: "Cancelar",
      btn_alert_confirm: "Confirmar",
      alert_confirming_title: "Você tem certeza?",
      alert_confirming_text: "Posições relacionadas a esta Carteira também serão removidas.",
      alert_confirming_footer: "Uma vez removida, não é possível recupera-la.",
      alert_deleted_title: "Removida!",
      alert_deleted_text: "Sua Carteira foi removida com sucesso.",

      wallets_edit_hint: "Editar esta Carteira.",
      wallets_delete_hint: "Deletar esta Carteira."
    },
  },
};
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
      label_days: "days",

      input_select: "Select...",
      input_noOptions: "No options available..."
    },
    appnavbar: {
      title_default: "Dashboard",
      title_openpositions: "Open Positions",
      title_positions: "My Assets",
      title_strategies: "Technical Analysis",
      title_phitrader: "Technical Analysis",
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
    momentcalendar: {
      sameDay: "Today, at",
      next: "Next",
      nextDay: "Tomorrow, at",
      lastDay: "Yesterday, at",
      last: "Last"
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
      positionDates: "Open Interval",
      positionMonths: "Month (Open)",
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

      user_emailAlreadyExists: "hmm... If I'm not wrong, I've seen your email here before. Did you forget your password?",
      user_usernameAlreadyExists: "hmm... This username is taken already... Let's try another one.",
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

      general_unauthorizedCodes: "I noticed you were away for a while and, for your own security, I decided to log you off. ;) Let's get back to work?",
      general_internalErrorCodes: "Ooops... Sorry for that. :( Seems like my team had a hard time processing your request.",
      general_noResponseReceived: "Ooops... Sorry for that. :( Seems like my team is out for lunch or they are just ignoring me... I'll keep trying to reach them.",
      general_couldNotSendRequest: "I couldn't send your request. Could you check your internet connection and try again?",
    },
    indicators: {
      // Time Intervals
      any: "Any",
      d: "Daily",
      // Sub Categories
      quote: "Quote",
      moving_average: "Moving Average",
      phibo: "Phibo PVPC",
      roc: "Rate of Change",
      // Quote
      open: "Open",
      high: "High",
      low: "Low",
      close: "Close",
      volume: "Volume",
      // Zero Line
      zero_line: "Zero Line",
      // Indicators
      sma_close7: "SMA 7",
      sma_close10: "SMA 10",
      sma_close20: "SMA 20",
      sma_close21: "SMA 21",
      sma_close30: "SMA 30",
      sma_close50: "SMA 50",
      sma_close55: "SMA 55",
      sma_close100: "SMA 100",
      sma_close200: "SMA 200",

      ema_close8: "EMA 8",
      ema_close9: "EMA 9",
      ema_close17: "EMA 17",
      ema_close34: "EMA 34",
      ema_close50: "EMA 50",
      ema_close72: "EMA 72",
      ema_close144: "EMA 144",
      ema_close200: "EMA 200",
      ema_close305: "EMA 305",
      ema_close610: "EMA 610",
      ema_close1292: "EMA 1292",
      ema_close2584: "EMA 2584",

      pv72: "Phibo PV 72",
      pv305: "Phibo PV 305",
      pv1292: "Phibo PV 1292",
      pc72: "Phibo PC 72",
      pc305: "Phibo PC 305",
      pc1292: "Phibo PC 1292",

      roc_emaclose8: "ROC EMA 8",
      roc_emaclose9: "ROC EMA 9",
      roc_emaclose17: "ROC EMA 17",
      roc_emaclose34: "ROC EMA 34",
      roc_emaclose50: "ROC EMA 50",
      roc_emaclose72: "ROC EMA 72",
      roc_emaclose144: "ROC EMA 144",
      roc_emaclose200: "ROC EMA 200",
      roc_emaclose305: "ROC EMA 305",
      roc_emaclose610: "ROC EMA 610",
      roc_emaclose1292: "ROC EMA 1292",
      roc_emaclose2584: "ROC EMA 2584",
    },
    languages: {
      enUS: "English",
      ptBR: "Português (Brasil)",
    },
    locales: {
      enUS: "en-us",
      ptBR: "pt-br",
    },
    login: {
      card_header: "Login",
      input_email: "Username or email",
      input_password: "Password",

      btn_login: "Login",
      btn_forgotPassword: "Forgot Password",
      btn_signUp: "Sign Up",
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
      amountInvested_currency_hint: "Amount invested in your operations.",
      amountInvested_percentage_hint: "Amount Invested divided by wallet's balance.",
      amountInvested_alert_walletBallance: "Amount Invested is higher than Wallet's balance. Check wallet's balance to correct this metric.",

      closeVolume_kpi_label: "Close Volume",
      closeVolume_title_hint: "Taking into account only closed Positions, it's the sum of close value. For example, for an PURCHASE operation, I'll sum up its sale's price.",
      closeVolume_currency_hint: "Close Volume of your operations.",

      count_kpi_label: "Positions",
      count_number_hint: "Amount of Positions in current selection.",

      opCost_kpi_label: "Operational Cost",
      opCost_title_hint: "Here, I'm including both open and close operational costs.",
      opCost_currency_hint: "Taxes, fees, comissions...",
      opCost_percentage_hint: "Operational Cost divided by Amount Invested.",

      openVolume_kpi_label: "Open Volume",
      openVolume_title_hint: "Amount invested in your operations. Operational cost not included.",
      openVolume_currency_hint: "Open Volume of your operations.",

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
      winners_percentage_hint: "Winner Positions divided by the amount of Positions."
    },
    modalopenposition: {
      title: "Open a new Position",
      hint: "A Position is made of 2 Transactions: Open (e.g Buy) and Close (e.g Sale). For now, only open info is needed.",

      input_type_buy: "BUY",
      input_type_sell: "SELL",
      input_wallet: "Wallet",
      input_asset: "Asset",
      input_asset_noOptions: "First, select a Wallet.",
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
      label_intro_p1: "A Position is made of 2 events: Open and Close.",
      label_intro_p2: "I understand that a Position is closed once the fields under CLOSE tab are filled. ;)",

      tab_openInfo: "OPEN",
      tab_closeInfo: "CLOSE",

      input_type: "Type",
      input_type_buy: "BUY",
      input_type_sell: "SELL",
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
    modalmovingavgdetail: {
      title: "Moving Average",

      label_ema: "Exponential",
      label_sma: "Simple / Arithmetic",

      input_type: "Type",
      input_type_hint: "Which moving average are we talking about?",
      input_periods: "Periods",
      input_periods_hint: "Amount of periods considered to calculate this moving average.",
      input_periods_noOptions: "First, select Type.",

      btn_add: "Add",
      btn_save: "Save",
    },
    modalquotedetail: {
      title: "Quote",

      input_type: "Quote",
      input_type_hint: "Which quote value are you looking for?",

      btn_add: "Add",
      btn_save: "Save",
    },
    modalphibodetail: {
      title: "Phibo PVPC",

      input_type: "Indicator",
      input_type_hint: "Which Phibo PVPC indicator are we talking about?",

      btn_add: "Add",
      btn_save: "Save",
    },
    modalstrategy: {
      title_create: "Create Strategy",
      title_update: "Update Strategy",
      label_intro_p1: "A Strategy is a set of rules/filters that can be applied to the relation between Price and Indicators.",
      label_intro_p2: "Once created, it can be applied to any time interval, unless you force it on the advanced workspace.",

      label_workspaces: "Workspaces",

      label_basic: "Basic",
      label_transition: "Transition",
      label_basic_intro_p1: "Click or move the following indicators into the Workspace desired...",
      label_basic_intro_p2: "Then, reorder them accordingly to the way they should appear on a chart.",

      label_advanced: "Advanced",
      label_advanced_intro_p1: "Is there something you couldn't do on Basic mode? No problem, you can aggregate the best of both modes...",

      input_name: "Name",
      input_logic: "Logic",
      label_logic_dynamic: "Dynamic",
      label_logic_static: "Static",
      input_logic_hint: "A Dynamic Strategy can be applied to any time interval (d, m60). It becomes Static if the time interval is set in one the rules.",
      input_description: "Description",
      label_description_placeholder: "A detailed description may help other users understand how your Strategy works...",
      input_public: "Public",
      input_public_hint: "Other users can see this strategy.",
      input_private: "Private",
      input_private_hint: "Only you can see this strategy.",
      input_buy: "Buy",
      input_buy_hint: "Purchase Strategy.",
      input_sell: "Sell",
      input_sell_hint: "Sale Strategy.",

      label_basic_0: "Now",
      label_basic_0_intro: "How indicators should be aligned now?",
      label_basic_1: "Before",
      label_basic_1_intro: "How indicators should be aligned on the previous candle?",
      btn_goToRules: "See rules...",
      btn_goToExplainer: "See explanation...",

      title_wsDestination_add: "Add",
      title_wsDestination_to: "to",
      input_wsDestination: "Workspace",
      input_wsDestination_hint: "Where would you like to send this Indicator to?",

      alert_updated_title: "Updated!",
      alert_updated_text: "Your Strategy has been updated.",

      alert_created_title: "Created!",
      alert_created_text_p1: "Your Strategy has been created.",
      alert_created_text_p2: "Now, you can run it and see the results! ;) ",

      error_name: "It's important that the name is less than 24 characters and unique between your Strategies.",
      error_desc: "It seems too long... Please, try to keep it lesser than 1000 characters.",

      btn_add: "Add",
      btn_create: "Create",
      btn_update: "Update"
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
    openintervalfilter: {
      label_title: "Open Interval",
      title_hint: "It's related to the date positions were opened.",

      input_dateFrom: "From...",
      input_dateTo: "To...",

      alert_timeInterval_noPositions: "Ops... I didn't find any Position opened within this time interval. Would you like to try another one?",
    },
    phitrader: {
      title: "Phi Trader",
      label_intro_p1: "Hi! I'm Phi, the Artificial Intelligence behind PHIOON's main trading strategies...",
      label_intro_p2: "Here, I'll expose all my operations, with details like: entry point, target, stop loss and the reason of it.",
      label_intro_p3: "Be aware that they",
      label_intro_notRecommendation: "are not recommendations",
      label_intro_p4: "but I believe you could use my experience to analyze and learning with it.",

      label_noWallets_p1: "Hmm... Seems like you don't have a Wallet created so far... Let's create one?",
      label_noWallets_p2: "That way, I'll know which Stock Exchange you work with, so I can share my operations with you! ;)",
      btn_goToWallets: "Go to Wallets",

      label_noNews_p1: "Hmm... I don't have any operations so far.",
      label_noNews_p2: "As soon as I see an opportunity, I'll let you know! ;)",

      item_open: "On-going",
      item_closed: "Closed",
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
      alert_deleted_title: "Deleted!",
      alert_deleted_text: "Position has been deleted.",

      positions_edit_hint: "Edit this Position.",
      positions_delete_hint: "Delete this Position."
    },
    privacypolicy: {
      label_intro_p1: "We tried to keep this Policy as simple as possible. Anyway, in case of any question, feel free to contact us using our service channels.",
      label_intro_p2: "PHIOON S.A.'s Privacy Policy was designed to reaffirm our commitment to security, privacy and transparency in the treatment of your information. In addition, it describes how your information is collected and processed when:",
      label_intro_p2_1: "  . You download our app on your smartphone/tablet.",
      label_intro_p2_2: "  . Access our websites.",
      label_intro_p2_3: "  . Request or use our services.",
      label_intro_p2_4: "  . Become a customer.",
      label_intro_p2_5: "  . Contact us through our service channels.",
      label_intro_p3: "These informations may refer to those which identifies You, whether for registration purposes, such as your name and e-mail address, or those which is necessary to provide PHIOON services efficiently and securely, such as your operation history on the financial market, your ID number to synchronize your operations with Stock Exchange's portal, among others. We may also collect and process location data to allow PHIOON to offer better services and ensure the security of your account.",
      label_policy_1: "PHIOON collects and processes personal data for the following purposes: identification and authentication; enabling offers and services; planning and implementing new products; prevention of technical or security problems in the identification and authentication process; and improving our services.",
      label_policy_2: "By accessing our websites, download the application or request and use PHIOON services, you expressly agree to the collection and processing of personal data necessary for the provision of better services. This consent may be revoked at any time through one of the available communication channels.",
      label_policy_3: "We may also store and maintain information to ensure the safety and reliability of PHIOON's services, as well as to comply with legal requirements.",
      label_policy_4: "You will be able to request the review and correction of your data free of charge and at any time. To do this, simply contact us through one of the available service channels. When ending your relationship with PHIOON, if you wish to delete your data, remember that PHIOON, in order to comply with legal obligations, will store certain data for the period and under the terms required by current legislation.",
      label_policy_5: "PHIOON may use, format and publish testimonials related to PHIOON posted by You on profiles and public pages on social networks, together with your name and images (including profile photos), on websites, applications or institutional and advertising materials for marketing purposes related to PHIOON's services and products.",
      label_policy_6: "PHIOON is always available to answer your questions and ensure your control over your data."
    },
    reacttable: {
      label_previous: "Previous",
      label_next: "Next",
      label_page: "Page",
      label_of: "of",
      label_rows: "rows",
    },
    register: {
      alert_generalErrorTitle: "Something went wrong...",
      alert_tryAgain: "Ooops... Sorry for that. :( Could you try again?",
      alert_404or50X: "Ooops... Sorry for that. :( Seems like my team had a hard time processing your request.",
      alert_couldNotSendRequest: "I couldn't send your request. Could you verify your internet connection and try again?",
      alert_username:
        "Ooops... A user with that email address already exists. Did you forget your password?",

      error_enterValidEmail: "Here, I need a valid email.",
      error_username_minReq: "It can have letters (a-z), numbers (0-9) underscores (_) and periods (.)",
      error_passwordLength: "It must have at least 8 characters.",
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
      input_fullName: "Full Name",
      input_email: "Email",
      input_username: "Username",
      input_password: "Password",
      input_confirmPassword: "Confirm Password",
      input_nationality: "Nationality",
      checkbox_iAgreeToThe: "I agree to the",
      checkbox_privacyPolicy: "privacy policy.",
      btn_createAccount: "Create account",
      btn_forgotPassword: "Forgot password",
    },
    rulesexplainer: {
      label_basic_noItems_p1: "hmm... Seems like there is no indicators over here yet...",
      label_basic_noItems_p2: "Try dragging and dropping them into this area.",
      label_basic_onlyOneItem: "We're almost there... Keep dropping indicators here. I need at least 2 of them. ;)",
      label_explain_gte: ">=",
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
      investment_funds: "Investment Funds",
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
      label_estimatedTime: "ESTIMATED TIME",

      label_gain: "GAIN !  \\o/",
      label_loss: ":( I hope you're already out.",
      label_buyingArea: "Time to Buy !",

      label_notAvailableData: "...",
      notAvailableData_hint: "I don't have enough data to calculate this metric. :/",

      priceLimit_hint: "Price Limit suggested for this operation. It may be different connsidering your Risk Management.",
      stopLoss_hint: "Here is a safety spot where I believe price won't reach again. If it happens, leave the operation and wait for a new opportunity.",
      target_hint: "It is a projection to estimate where price may reach. Most of the time, I use Fibonacci sequence.",
      gainPercent_hint: "If everything goes well, that'll be the profit.",
      lossPercent_hint: "If everything goes well, that'll be the profit.",
      riskReward_hint: "Target divided by Stop Loss represents the correlation between Risk and Reward. The higher this number is, the better.",
      startedOn_hint: "Operation started on:",

      successRate_hint: "Setup's success rate for this Asset in the last 4 years.",
      estimatedTime_hint: "Based on its history, that's an estimative of how long it may take to reach the target.",
      occurrencies_hint: "Amount of times this Technical Condition occurred for this Asset in the last 4 years.",
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

      technicalAnalysis: "Technical Analysis",
      strategiesMini: "S",
      strategies: "Strategies",
      phitrader: "Phi Trader",
      phitraderMini: "PHI",
    },
    statusfilter: {
      label_title: "Status",
    },
    stockexchangefilter: {
      label_title: "Stock Exchanges",
    },
    strategies: {
      card_title: "Strategies",
      btn_newStrategy: "New Strategy",

      label_noWallets_p1: "Hmm... Seems like you don't have a Wallet created so far... Let's create one?",
      label_noWallets_p2: "That way, I'll know which Stock Exchange you operate in, so I can bring you strategies and indicators that are available there! ;)",
      btn_goToWallets: "Go to Wallets",

      label_noStrategies_p1: "Are you ready to start saving time and always having the best opportunities at one click?",
      label_noStrategies_p2: "Go ahead and create your first Strategy !",
      label_noStrategies_p3: "Ah! I hope you enjoy the journey... Once you get used to it, there is no way back! ;)",

      card_results_title: "Results",

      input_stockExchange: "Stock Exchange",
      input_stockExchange_hint: "Which Stock Exchange are we talking about?",
      input_timeInterval: "Interval",
      input_timeInterval_hint: "Which time interval the Strategy's rules should be applied in?",

      btn_alert_cancel: "Cancel",
      btn_alert_confirm: "Confirm",
      alert_confirming_title: "Are you sure?",
      alert_confirming_text: "Once deleted, it's not possible to recover it back.",
      alert_deleted_title: "Deleted!",
      alert_deleted_text: "Your Strategy has been deleted.",
    },
    strategycardmini: {
      label_public: "Public",
      label_public_hint: "Other users can see this strategy.",
      label_private: "Private",
      label_private_hint: "Only you can see this strategy.",

      icon_type_buy_hint: "Purchase Strategy.",
      icon_type_sell_hint: "Sale Strategy.",

      label_cat_basic: "Basic",
      label_cat_basic_hint: "It looks for a specific ordering in the latest period (candle) only.",
      label_cat_transition: "Transition",
      label_cat_transition_hint: "It looks for moviments in the last 2 periods (candles). Example: \"Price overcoming EMA 34\".",
      label_cat_advanced: "Advanced",
      label_cat_advanced_hint: "It's well planned to catch specific moviments.",

      label_logic: "Type",
      label_dynamic: "Dynamic",
      label_dynamic_hint: "It can be completly applied to any time interval (weekly, daily, m60...)",
      label_static: "Static",
      label_static_hint: "Some rules are fixed to a specific time interval.",
      label_category: "Category",

      btn_run_hint: "Run Strategy.",
      btn_view_hint: "View Strategy.",
      btn_update_hint: "Update Strategy.",
      btn_delete_hint: "Delete Strategy.",
    },
    strategyresults: {
      header_asset: "Asset",
      header_name: "Name",
      header_quote: "Quote",
      header_volume: "Volume Avg.",
      header_lastTradeTime: "Last trade time",

      table_firstLoad: "Run a Strategy and let's see what we can find... ;)",
      table_emptyData: "Right now, there are no assets matching this technical condition. Maybe later...",
      table_noDataFound: "hmm... Did I miss something?! Please, check your filters. ;)"
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
    technicalconditions: {
      "btl_ema_7__trend_ema_610+": "Price is getting more support and starting an upward trend. Moving Averages 34, 144 and 610 are aligned up and Price is breaking above EMA 34. Gains may vary between 7% and 23%.",
      "btl_ema_7__trend_ema_144+": "Price is getting more support and starting an upward trend. Moving Averages 34, 144 and 610 are aligned up and Price is breaking above EMA 34. Gains may vary between 7% and 23%.",
      "btl_ema_0__trend_ema_610-": "Price is getting more resistance and starting an downward trend. Moving Averages 34, 144 and 610 are aligned down and Price is breaking bellow EMA 34. Gains may vary between 7% and 16%'.",
      "btl_ema_0__trend_ema_144-": "Price is getting more resistance and starting an downward trend. Moving Averages 34, 144 and 610 are aligned down and Price is breaking bellow EMA 34. Gains may vary between 7% and 16%.",
      phibo_1292_up_p1: "Price reached a key technical support after a retracement of <fibo_pct_retraction>% of Wave 1 and drew a Pivot Up.",
      phibo_1292_up_p2: "Support Lines are aligned up, increasing the probability of starting a long Wave 3.",
      phibo_305_up_p1: "Price reached an important technical support after a retracement of <fibo_pct_retraction>% of Wave 1 and drew a Pivot Up.",
      phibo_305_up_p2: "Support Lines are aligned up, increasing the probability of starting a Wave 3.",
      phibo_72_up_p1: "Price reached a technical support after a retracement of <fibo_pct_retraction>% of Wave 1 and drew a Pivot Up, increasing the probability of, at least, testing last top again.",

      phibo_1292_down_p1: "Price reached a key technical resistance after a retracement of <fibo_pct_retraction>% of Wave 1 and drew a Pivot Down.",
      phibo_1292_down_p2: "Resistance Lines are aligned down, increasing the probability of starting a long Wave 3.",
      phibo_305_down_p1: "Price reached an important technical resistance after a retracement of <fibo_pct_retraction>% of Wave 1 and drew a Pivot Down.",
      phibo_305_down_p2: "Resistance Lines are aligned down, increasing the probability of starting a Wave 3.",
      phibo_72_down_p1: "Price reached a technical resistance after a retracement of 21% from the recent bottom and drew a Pivot Down, increasing the probability of, at least, testing last bottom again.",
    },
    termsofuse: {
      label_intro_p1: "",
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
      label_phiOperations: "PHI TRADER",
      label_phiOperations_hint: "Operations made by Phi since you joined us.",

      input_email: "Email",
      btn_changePassword: "Change Password",
      input_username: "Username",
      input_firstName: "First Name",
      input_lastName: "Last Name",
      input_nationality: "Nationality",
      input_birthday: "Birthday",
      input_birthday_hint: "I could send birthday gifts. Who knows...",

      input_currency: "Main Currency",
      input_currency_hint: "Do you invest in different countries? I could convert the currencies to your preferred one on dashboards and reports. ",
      input_language: "Language",

      error_username_minReq: "Letters (a-z), numbers (0-9), underscores (_) and periods (.)",
      error_username_taken: "Username taken :/",
      error_username_couldNotCheck: "Something went wrong :/ Let's try again later.",

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
      label_days: "dias",

      input_select: "Selecione...",
      input_noOptions: "Opções indisponíveis..."
    },
    appnavbar: {
      title_default: "Dashboard",
      title_openpositions: "Posições Abertas",
      title_positions: "Meus Ativos",
      title_strategies: "Análise Técnica",
      title_phitrader: "Análise Técnica",
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
    momentcalendar: {
      sameDay: "Hoje, às",
      next: "Próxima",
      nextDay: "Amanhã, às",
      lastDay: "Ontem, às",
      last: "Última"
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
      label_emailSent: "Envei um e-mail para você com instruções para recuperar seu acesso. Dê uma olhada lá, por gentileza. ;)"
    },
    httptranslation: {
      wallet_limitReached: "Precisa de mais carteiras para gerenciar seus investimentos? Atualize seu plano e aproveite! ;)",
      strategy_limitReached: "Precisa de mais estratégias para melhorar seus resultados? Atualize seu plano e aproveite! ;)",

      user_profileUpdated: "Perfil atualizado!",

      user_emailAlreadyExists: "hmm... Se não me engano, eu já vi seu email por aqui antes. Esqueceu a senha?",
      user_usernameAlreadyExists: "hmm... This username is taken already... Let's try another one.",
      user_emailCouldNotBeSent: "Ok, a boa notícia é que seu usuário foi criado. Má notícia, meu time não está conseguindo te enviar o email de confirmação. Já pedi para darem uma olhada no seu caso, então você deve receber um email nas próximas horas. ;)",
      user_emailNotConfirmed: "Antes de continuar, preciso que confirme seu e-mail... Ainda não recebeu o E-mail de Confirmação?",
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
      general_couldNotSendRequest: "Não estou conseguindo enviar sua requisição. Poderia verificar sua conexão com a internet e tentar novamente?",
    },
    indicators: {
      // Time Intervals
      any: "Qualquer",
      d: "Diário",
      // Sub Categories
      quote: "Cotação",
      moving_average: "Média Móvel",
      phibo: "Phibo PVPC",
      roc: "Taxa de Variação",
      // Quote
      open: "Abertura",
      high: "Máxima",
      low: "Mínima",
      close: "Fechamento",
      volume: "Volume",
      // Zero Line
      zero_line: "Linha Zero",
      // Indicators
      sma_close7: "MMA 7",
      sma_close10: "MMA 10",
      sma_close20: "MMA 20",
      sma_close21: "MMA 21",
      sma_close30: "MMA 30",
      sma_close50: "MMA 50",
      sma_close55: "MMA 55",
      sma_close100: "MMA 100",
      sma_close200: "MMA 200",

      ema_close8: "MME 8",
      ema_close9: "MME 9",
      ema_close17: "MME 17",
      ema_close34: "MME 34",
      ema_close50: "MME 50",
      ema_close72: "MME 72",
      ema_close144: "MME 144",
      ema_close200: "MME 200",
      ema_close305: "MME 305",
      ema_close610: "MME 610",
      ema_close1292: "MME 1292",
      ema_close2584: "MME 2584",

      pv72: "Phibo PV 72",
      pv305: "Phibo PV 305",
      pv1292: "Phibo PV 1292",
      pc72: "Phibo PC 72",
      pc305: "Phibo PC 305",
      pc1292: "Phibo PC 1292",

      roc_emaclose8: "ROC MME 8",
      roc_emaclose9: "ROC MME 9",
      roc_emaclose17: "ROC MME 17",
      roc_emaclose34: "ROC MME 34",
      roc_emaclose50: "ROC MME 50",
      roc_emaclose72: "ROC MME 72",
      roc_emaclose144: "ROC MME 144",
      roc_emaclose200: "ROC MME 200",
      roc_emaclose305: "ROC MME 305",
      roc_emaclose610: "ROC MME 610",
      roc_emaclose1292: "ROC MME 1292",
      roc_emaclose2584: "ROC MME 2584",
    },
    languages: {
      enUS: "English",
      ptBR: "Português (Brasil)",
    },
    locales: {
      enUS: "en-us",
      ptBR: "pt-br",
    },
    login: {
      card_header: "Login",
      input_email: "Usuário ou e-mail",
      input_password: "Senha",

      btn_login: "Login",
      btn_signUp: "Criar Conta",
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
      amountInvested_currency_hint: "Valor Aplicado em suas Operações.",
      amountInvested_percentage_hint: "Valor Aplicado dividido pelo Saldo da Carteira.",
      amountInvested_alert_walletBallance: "Valor Aplicado é maior que o Saldo da Carteira. Dê uma olhada no Saldo da Carteira para corrigir esta métrica.",

      closeVolume_kpi_label: "Vol. Fechamento",
      closeVolume_title_hint: "Considerando apenas as Posições fechadas, eu somo o valor de fechamento. Por exemplo, para uma operação de COMPRA, vou somar seu valor de venda.",
      closeVolume_currency_hint: "Volume de Fechamento de suas Operações.",

      count_kpi_label: "Posições",
      count_number_hint: "Quantidade de Posições na seleção atual.",

      opCost_kpi_label: "Custo Operacional",
      opCost_title_hint: "Aqui, considero tanto os custos de abertura quanto de fechamento de uma Posição.",
      opCost_currency_hint: "Taxas, impostos, comissões, emolumentos...",
      opCost_percentage_hint: "Custo Operacional dividido pelo Valor Aplicado.",

      openVolume_kpi_label: "Vol. Abertura",
      openVolume_title_hint: "Valor aplicado em suas Operações. Custo operacional não incluso.",
      openVolume_currency_hint: "Volume de Abertura de suas operações.",

      result_kpi_label: "Rentabilidade",
      result_title_hint: "Rentabilidade liquida. Isso mesmo, já descontei seu Custo Operacional.",
      result_currency_hint: "O quanto seu dinheiro está rendendo.",
      result_percentage_hint: "Ganhos/Perdas divididos pelo Valor Aplicado.",

      result_series_label: "Rentabilidade pelo tempo",

      totalVolume_kpi_label: "Volume Total",
      totalVolume_title_hint: "Considerando Posições abertas e fechadas.",
      totalVolume_currency_hint: "Soma do Volume de suas Operações.",

      winners_kpi_label: "Vencedoras",
      winners_number_hint: "Quantidade de Posições com resultado positivo.",
      winners_percentage_hint: "Quantidade de Posições vencedoras dividido pela quantidade de Posições."
    },
    mysetups: {
      card_title: "Setups",

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
    modalopenposition: {
      title: "Abrir nova Posição",
      hint: "Uma posição é feita de 2 Transações: Abertura (ex. Compra) e Fechamento (ex. Venda). Nesse momento, apenas os dados da abertura são necessários.",

      input_wallet: "Carteira",
      input_asset: "Ativo",
      input_asset_noOptions: "Primeiro, selecione a Carteira.",
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

      tab_openInfo: "ABERTURA",
      tab_closeInfo: "FECHAMENTO",

      input_type: "Tipo",
      input_type_buy: "COMPRA",
      input_type_sell: "VENDA",
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
    modalmovingavgdetail: {
      title: "Média Móvel",

      label_ema: "Exponencial",
      label_sma: "Simples / Aritmética",

      input_type: "Tipo",
      input_type_hint: "Estamos falando de qual média móvel?",
      input_periods: "Períodos",
      input_periods_hint: "Quantidade de períodos considerados para calcular esta média móvel.",
      input_periods_noOptions: "Primeiro, selecione o Tipo.",

      btn_add: "Adicionar",
      btn_save: "Salvar",
    },
    modalquotedetail: {
      title: "Cotação",

      input_type: "Cotação",
      input_type_hint: "Qual valor de cotação estamos procurando?",

      btn_add: "Adicionar",
      btn_save: "Salvar",
    },
    modalphibodetail: {
      title: "Phibo PVPC",

      input_type: "Indicador",
      input_type_hint: "De qual linha Phibo PVPC estamos falando?",

      btn_add: "Adicionar",
      btn_save: "Salvar",
    },
    modalstrategy: {
      title_create: "Criar Estratégia",
      title_update: "Atualizar Estratégia",
      label_intro_p1: "Uma Estratégia é um conjunto de regras/filtros que pode ser aplicado à relação entre Preço e Indicadores.",
      label_intro_p2: "Uma vez criada, ela pode ser aplicada à qualquer tempo gráfico, a menos que você force isso na área avançada.",

      label_workspaces: "Áreas de Trabalho",

      label_basic: "Básica",
      label_transition: "Transição",
      label_basic_intro_p1: "Clique ou mova os seguintes indicadores para a Área de Trabalho desejada...",
      label_basic_intro_p2: "Depois, realinhe os indicadores da forma como eles deveriam aparecer em um gráfico.",

      label_advanced: "Avançada",
      label_advanced_intro_p1: "As outras Áreas de Trabalho não foram suficientes? Sem problemas, é possível aproveitar o melhor de cada uma delas...",

      input_name: "Nome",
      input_logic: "Lógica",
      label_logic_dynamic: "Dinâmica",
      label_logic_static: "Estática",
      input_logic_hint: "Uma estratégia Dinâmica pode ser aplicada em qualquer tempo gráfico. Ela se torna Estática caso o tempo gráfico seja forçado em uma das regras.",
      input_description: "Descrição",
      label_description_placeholder: "Uma descrição bem escrita pode ajudar outros usuários a entenderem melhor como sua Estratégia funciona...",
      input_public: "Pública",
      input_public_hint: "Outros usuários podem ver esta estratégia.",
      input_private: "Privada",
      input_private_hint: "Apenas você pode ver esta estratégia.",
      input_buy: "Compra",
      input_buy_hint: "Estratégia de Compra.",
      input_sell: "Venda",
      input_sell_hint: "Estratégia de Venda.",

      label_basic_0: "Agora",
      label_basic_0_intro: "Como os indicadores deveriam estar alinhados agora?",
      label_basic_1: "Antes",
      label_basic_1_intro: "Como os indicadores deveriam estar alinhados no candle anterior?",
      btn_goToRules: "Ver regras...",
      btn_goToExplainer: "Ver explicação...",

      title_wsDestination_add: "Adicionar",
      title_wsDestination_to: "em",
      input_wsDestination: "Área de Trabalho",
      input_wsDestination_hint: "Para onde vamos mandar este indicador?",

      alert_updated_title: "Atualizada!",
      alert_updated_text: "Sua Estratégia foi atualizada com sucesso.",

      alert_created_title: "Criada!",
      alert_created_text_p1: "Sua Estratégia foi criada com sucesso.",
      alert_created_text_p2: "Agora, você pode executa-la e ver os resultados! ;)",

      error_name: "É importante que o nome seja menor que 24 caracteres e único entre as suas Estratégias.",
      error_desc: "Descrição muito longa, não? Tente mante-la com no máximo 2000 caracteres.",

      btn_add: "Adicionar",
      btn_create: "Criar",
      btn_update: "Atualizar"
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
    openintervalfilter: {
      label_title: "Intervalo Abertura",
      title_hint: "Relacionado às datas em que as Posições foram abertas.",

      input_dateFrom: "A partir de...",
      input_dateTo: "Até...",

      alert_timeInterval_noPositions: "Oops... Não encontrei Posições que foram abertas neste intervalo de tempo. Gostaria de tentar outro intervalo?",
    },
    phitrader: {
      title: "Phi Trader",
      label_intro_p1: "Olá! Sou o Phi, a Inteligência Artificial por trás das estratégias de mercado do PHIOON...",
      label_intro_p2: "Aqui, vou expor todas as minhas operações, com detalhes como: alvo, stop loss e o motivo de ter entrado na operação.",
      label_intro_p3: "Elas",
      label_intro_notRecommendation: "não são recomendações",
      label_intro_p4: "mas acredito que você pode aproveitar a minha experiência para analisar e aprender com elas.",

      label_noWallets_p1: "Hmm... Parece que você ainda tem Carteiras criadas por aqui... Que tal criar a primeira?",
      label_noWallets_p2: "Dessa forma, vou saber com qual Bolsa de Valores você trabalha, para então compartilhar minhas operações com você! ;)",
      btn_goToWallets: "Ir para Carteiras",

      label_noNews_p1: "Hmm... Não tenho operações abertas no momento.",
      label_noNews_p2: "Assim que eu ver uma oportunidade, te aviso! ;)",

      item_open: "Em andamento",
      item_closed: "Fechado",
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
    privacypolicy: {
      label_intro_p1: "Tentamos deixar essa Política o mais simples possível. Mas caso ainda tenha dúvidas, vamos conversar pelos canais de atendimento.",
      label_intro_p2: "A Política de Privacidade da PHIOON S.A. foi elaborada para reafirmar nosso compromisso com a segurança, privacidade e a transparência no tratamento das suas informações. Além disso, ela descreve como suas informações são coletadas e tratadas quando:",
      label_intro_p2_1: "  . Você baixa nosso aplicativo em seu celular/tablet.",
      label_intro_p2_2: "  . Acessa nossos websites",
      label_intro_p2_3: "  . Solicita ou Usa nossos serviços",
      label_intro_p2_4: "  . Se torna nosso cliente",
      label_intro_p2_5: "  . Entra em contato com a gente pelos canais de atendimento",
      label_intro_p3: "Essas informações podem se referir àquelas para identificar Você, seja para fins de cadastro, tais como seu nome e endereço de e-mail, ou ainda àquelas necessárias para prover os serviços do PHIOON de forma eficiente e segura, tais como seu histórico de operações no mercado financeiro, seu CPF para sincronizar suas operações com o portal CEI, dentre outras. Podemos também coletar e tratar dados locacionais para permitir ao PHIOON oferecer melhores serviços e garantir a segurança da sua conta.",
      label_policy_1: "O PHIOON coleta e trata dados pessoais com os seguintes propósitos: identificação e autenticação; viabilização de ofertas e serviços; planejamento e implantação de novos produtos; prevenção de problemas técnicos ou de segurança nos processo de identificação e autenticação; e melhoria de nossos serviços.",
      label_policy_2: "Ao acessar nossos websites, baixar o aplicativo ou solicitar e utilizar os serviços do PHIOON, Você concorda expressamente com a coleta e tratamento de dados pessoais necessários para o fornecimento de serviços melhores. A revogação deste consentimento poderá ser realizada a qualquer momento por meio dos canais de comunicação disponíveis do PHIOON.",
      label_policy_3: "Podemos também armazenar e manter informações para garantir a segurança e a confiabilidade dos serviços do PHIOON, bem como para cumprir com determinações legais.",
      label_policy_4: "Você poderá solicitar a revisão e correção de seus dados sem qualquer ônus e a qualquer tempo. Para isso, basta entrar em contato por meio de um dos canais de atendimento disponíveis. Ao terminar sua relação com o PHIOON, caso deseje excluir seus dados, lembre-se que o PHIOON, com o fim de cumprir com obrigações legais, armazenará determinados dados pelo período e nos termos que a legislação vigente aplicável exigir.",
      label_policy_5: "O PHIOON poderá utilizar, formatar e divulgar depoimentos referentes ao PHIOON postados por Você em perfis e páginas públicas nas redes sociais, juntamente com seu nome e imagens (incluindo fotos de perfil), em websites, aplicativos ou materiais institucionais e publicitários para a divulgação dos serviços prestados pelo PHIOON.",
      label_policy_6: "O PHIOON está sempre à disposição para esclarecer suas dúvidas e garantir seu controle sobre seus dados."
    },
    reacttable: {
      label_previous: "Anterior",
      label_next: "Próxima",
      label_page: "Página",
      label_of: "de",
      label_rows: "linhas",
    },
    register: {
      error_enterValidEmail: "Aqui, preciso de um e-mail válido.",
      error_username_minReq: "Pode conter letras (a-z), números (0-9), underscores (_) e pontos (.)",
      error_passwordLength: "Precisa ser no minimo 8 caracteres.",
      error_acceptPrivacyPolicy: "Para prosseguir, preciso que aceite nossa Politica de Privacidade.",

      leftArea_infoTitle1: "Praticidade",
      leftArea_infoDesc1: "Pare de perder tempo todos os dias analisando gráficos de dezenas de ativos. Deixa isso com a gente.",
      leftArea_infoTitle2: "Eficiência",
      leftArea_infoDesc2: "Saiba quando os preços estão em pontos de suporte e resistência em tempo real.",
      leftArea_infoTitle3: "Controle",
      leftArea_infoDesc3: "Gerencie seus investimentos de forma simples.",

      card_header: "Crie sua conta",
      info_orBeCassical: "ou vá em modo clássico mesmo",
      input_fullName: "Nome Completo",
      input_email: "E-mail",
      input_username: "Usuário",
      input_password: "Senha",
      input_confirmPassword: "Confirmar Senha",
      input_nationality: "Nacionalidade",
      checkbox_iAgreeToThe: "Eu concordo com a",
      checkbox_privacyPolicy: "política de privacidade.",

      btn_createAccount: "Criar conta",
      btn_forgotPassword: "Esqueceu a Senha",
    },
    rulesexplainer: {
      label_basic_noItems_p1: "hmm... Parece que não há indicadores por aqui ainda...",
      label_basic_noItems_p2: "Tente arrasta-los para esta área.",
      label_basic_onlyOneItem: "Estamos quase lá... Continue arrastando os indicadores para esta área. Preciso de ao menos dois deles aqui. ;)",
      label_explain_gte: ">=",
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
      investment_funds: "Fundos de Investimento",
      real_estate: "Imobiliário",
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
      label_estimatedTime: "PRAZO ESTIMADO",

      label_gain: "GAIN !  \\o/",
      label_loss: ":( Espero que já tenha saído.",
      label_buyingArea: "Hora de comprar !",

      label_notAvailableData: "...",
      notAvailableData_hint: "Não tenho dados suficientes para calcular esta métrica. :/",

      priceLimit_hint: "Preço Limite sugerido para esta operação. Este pode mudar, considerando seu Gerenciamento de Risco.",
      stopLoss_hint: "Aqui é um ponto de segurança onde acredito que o Preço não alcance novamente. Se isso acontecer, saia da operação e aguarde uma nova oportunidade.",
      target_hint: "Alvo é uma projeção para estimar onde o Preço pode chegar. Na maioria das vezes, utilizo sequência de Fibonacci.",
      gainPercent_hint: "Se tudo der certo, este será o lucro.",
      lossPercent_hint: "Se tudo der certo, este será o lucro.",
      riskReward_hint: "Alvo dividido pelo Stop Loss representa a relação Risco x Retorno da operação. Quanto maior este número, melhor.",
      startedOn_hint: "Data de Início da Operação.",

      successRate_hint: "Taxa de Sucesso deste Setup para este Ativo nos últimos 4 anos.",
      estimatedTime_hint: "Baseado em seu histórico, esta é uma previsão estimada para que o papel alcance o alvo.",
      occurrencies_hint: "Quantidade de vezes em que esta Condição Técnica aconteceu para este Ativo nos últimos 4 anos.",
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

      technicalAnalysis: "Análise Técnica",
      strategiesMini: "E",
      strategies: "Estratégias",
      phitrader: "Phi Trader",
      phitraderMini: "PHI",
    },
    statusfilter: {
      label_title: "Status",
    },
    stockexchangefilter: {
      label_title: "Bolsa de Valores",
    },
    strategies: {
      card_title: "Estratégias",
      btn_newStrategy: "Nova Estratégia",

      label_noWallets_p1: "Hmm... Parece que você ainda tem Carteiras criadas por aqui... Que tal criar a primeira?",
      label_noWallets_p2: "Dessa forma, vou saber em qual Bolsa de Valores você atua, para trazer estratégias e indicadores disponíveis por lá! ;)",
      btn_goToWallets: "Ir para Carteiras",

      label_noStrategies_p1: "Está preparado para começar a economizar tempo e ainda ter as melhores oportunidades do mercado à um clique?",
      label_noStrategies_p2: "Então comece criando a sua primeira Estratégia !",
      label_noStrategies_p3: "Ah! Espero que aproveite a experiência... Uma vez que se acostuma, não tem mais volta! ;)",

      card_results_title: "Resultados",

      input_stockExchange: "Bolsa de Valores",
      input_stockExchange_hint: "Estamos falando de qual Bolsa de Valores?",
      input_timeInterval: "Intervalo",
      input_timeInterval_hint: "As regras da estratégia devem ser aplicada em qual tempo gráfico?",

      btn_alert_cancel: "Cancelar",
      btn_alert_confirm: "Confirmar",
      alert_confirming_title: "Você tem certeza?",
      alert_confirming_text: "Uma vez removida, não é possível recupera-la.",
      alert_deleted_title: "Removida!",
      alert_deleted_text: "Sua Estratégia foi removida com sucesso.",
    },
    strategycardmini: {
      label_public: "Pública",
      label_public_hint: "Outros usuários podem ver esta Estratégia.",
      label_private: "Privada",
      label_private_hint: "Apenas você pode ver esta Estratégia.",

      icon_type_buy_hint: "Estratégia de Compra.",
      icon_type_sell_hint: "Estratégia de Venda.",

      label_cat_basic: "Básica",
      label_cat_basic_hint: "Verifica a ordem dos indicadores no último período (candle) apenas.",
      label_cat_transition: "Transição",
      label_cat_transition_hint: "Procura por movimentos dentro dos 2 últimos períodos (candles). Exemplo: \"Preço superando MME 34.\"",
      label_cat_advanced: "Avançada",
      label_cat_advanced_hint: "Geralmente, é bem planejada para identificar movimentos específicos.",

      label_logic: "Lógica",
      label_dynamic: "Dinâmica",
      label_dynamic_hint: "Se aplica completamente a qualquer tempo gráfico (semanal, diário, m60...)",
      label_static: "Estática",
      label_static_hint: "Algumas regras estão fixadas para tempos gráficos específicos.",
      label_category: "Categoria",

      btn_run_hint: "Executar Estratégia.",
      btn_view_hint: "Visualizar Estratégia.",
      btn_update_hint: "Atualizar Estratégia.",
      btn_delete_hint: "Deletar Estratégia.",
    },
    strategyresults: {
      header_asset: "Ativo",
      header_name: "Nome",
      header_quote: "Cotação",
      header_volume: "Vol. Médio",
      header_lastTradeTime: "Última negociação",

      table_firstLoad: "Execute uma Estratégia e vamos ver o que encontramos... ;)",
      table_emptyData: "Nesse momento, não há ativos nesta condição técnica. Talvez mais tarde...",
      table_noDataFound: "hmm... Será que perdi algo?! Por favor, dê uma olhada nos seus filtros. ;)"
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
      label_phiOperations: "PHI TRADER",
      label_phiOperations_hint: "Operações feitas pelo Phi desde a data em que temos você com a gente.",

      input_email: "E-mail",
      btn_changePassword: "Alterar Senha",
      input_username: "Usuário",
      input_firstName: "Primeiro Nome",
      input_lastName: "Último Nome",
      input_nationality: "Nacionalidade",
      input_birthday: "Data de Nascimento",
      input_birthday_hint: "Eu poderia enviar presentes de aniversário. Quem sabe...",

      input_currency: "Moeda Principal",
      input_currency_hint: "Investe em diferentes países? Posso converter outras moedas para a de sua preferência em relatórios e dashboards. ",
      input_language: "Língua",

      error_username_minReq: "Letras (a-z), números (0-9), underscores (_) e pontos (.)",
      error_username_taken: "Nome de usuário em uso :/",
      error_username_couldNotCheck: "Algo deu errado :/ Vamos tentar novamente mais tarde.",

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
      alert_deleted_title: "Removida!",
      alert_deleted_text: "Sua Carteira foi removida com sucesso.",

      wallets_edit_hint: "Editar esta Carteira.",
      wallets_delete_hint: "Deletar esta Carteira."
    },
  },
};
const locale = {
  phioon: {
    email_support: "helpme@phioon.com"
  },
  generic: {
    label_comingSoon: "Coming Soon...",
    label_loading: "Loading...",
    label_days: "days",

    label_sharedLinkCopied: "Link copied to clipboard (CRTL-C).",

    input_search: "Search...",
    input_select: "Select...",
    input_noOptions: "No options available..."
  },
  appnavbar: {
    title_default: "Dashboard",
    title_empty: "",
    title_home: "Home",
    title_myaccount: "My Account",
    title_openpositions: "Open Positions",
    title_phitrader: "Technical Analysis",
    title_positions: "My Assets",
    title_recentsearches: "Recent Searches",
    title_searchresults: "Results",
    title_searchstrategyresults: "Strategies",
    title_searchuserresults: "Users",
    title_strategies: "My Assets",
    title_strategypage: "Strategy",
    title_userprofile: "User",
    title_usersubscription: "My Plan",
    title_walletoverview: "Overview",
    title_wallets: "My Assets",

    label_profile: "Profile",
    label_subscription: "My Plan",
    label_logout: "Log out"
  },
  assetfilter: {
    label_title: "Assets",
  },
  authnavbar: {
    signUp: "Sign Up",
    login: "Login"
  },
  charts: {
    chart_profitability_title: "Profitability over time (%)",
    chart_diversification_title: "Diversification (%)",
    chart_profitabilityRanking_title: "Profitability Ranking (%)",
    chart_usage_title: "Runs",
    chart_usage_desc: "Last 30 days",

    chart_tooltip_profitability: "% Profitability",

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
  filtercard: {
    label_title: "Filters",
    label_clear: "Clear Filters",

    label_wallet: "Wallet",
    label_asset: "Asset",
    label_type: "Type",
    label_status: "Status",
    label_sector: "Sector",
    label_stockExchange: "Stock Exchange",

    label_open_dateFrom: "Open after",
    label_open_dateTo: "Open before",
    label_close_dateFrom: "Closed after",
    label_close_dateTo: "Close before",

    input_periods_noOptions: "There are no open positions.",

    alert_timeInterval_noPositionsOpened: "Oops... I didn't find any Position opened within this time interval. Try another one ;)",
    alert_timeInterval_noPositionsClosed: "Oops... I didn't find any Position closed within this time interval. Try another one ;)",
    alert_timeInterval_invalidFormat: "Oops... Seems like date/time format is not valid."
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
  home: {
    label_noWallets_p1: "Hmm... Seems like you don't have a Wallet created so far... Let's create one?",
    label_noWallets_p2: "That way, I'll know which Stock Exchange you operate in, so I can bring you the most used strategies there! ;)",
    btn_goToWallets: "Go to Wallets",

    card_shortcuts_title: "Shortcuts",
    card_mostRuns_title: "Trending on PHIOON",
    card_topRated_title: "Top Rated",
    card_classics_title: "Classics",
    card_ma_crossings_title: "Moving Average Crossing",
  },
  httptranslation: {
    wallet_limitReached: "Need more wallets to manage your investments? Go premium and enjoy it! ;)",
    strategy_limitReached: "Neew more strategies to improve your results? Go premium and enjoy it! ;)",
    strategy_addedToCollection: "Strategy added to your collection.",
    strategy_removedFromCollection: "Strategy removed from your collection.",
    strategy_thanksForFeedback: "Submitted! Thank you for your feedback. ;)",
    strategy_notAvailable: "Strategy not available anymore :/ Maybe its owner deleted or it's not Public anymore.",

    user_profileUpdated: "Profile updated!",
    user_planPastDue_p1: "hmm... Something wrong happened while renewing your Plan :/",
    user_planPastDue_p2: "It may be a good idea to check your Subscription to make sure your data is correct. ;)",
    user_goToPlan: "Go to My Plan",

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

    general_successCodes: "Done.",
    general_unauthorizedCodes: "I noticed you were away for a while and, for your own security, I decided to log you off. ;) Let's get back to work?",
    general_internalErrorCodes: "Ooops... Sorry for that. :( Seems like my team had a hard time processing your request.",
    general_noResponseReceived: "Ooops... Sorry for that. :( Seems like my team is out for lunch or they are just ignoring me... I'll keep trying to reach them.",
    general_couldNotSendRequest: "I couldn't send your request. Could you check your internet connection and try again?",
  },
  indicators: {
    constant: "Fixed Value",
    // Time Intervals
    any: "Any",
    d: "Daily",
    // Sub Categories
    quote: "Quote",
    moving_average: "Moving Average",
    phibo: "Phibo PVPC",
    roc: "Rate of Change",
    // Tools
    comparison: "Comparison",
    distance: "Distance",
    slope: "Slope",
    // Quote
    open: "Open",
    high: "High",
    low: "Low",
    close: "Close",
    volume: "Volume",
    // Zero Line
    zero_line: "Zero Line",
    // Indicators
    ema: "Exponential Moving Average",
    sma: "Simple Moving Average",
    // Slopes
    label_slope: "slope",
    label_upwards: "Upwards",
    label_downwards: "Downwards",
    // Instances
    sma_close_7: "SMA 7",
    sma_close_10: "SMA 10",
    sma_close_20: "SMA 20",
    sma_close_21: "SMA 21",
    sma_close_30: "SMA 30",
    sma_close_50: "SMA 50",
    sma_close_55: "SMA 55",
    sma_close_100: "SMA 100",
    sma_close_200: "SMA 200",

    ema_close_8: "EMA 8",
    ema_close_9: "EMA 9",
    ema_close_17: "EMA 17",
    ema_close_34: "EMA 34",
    ema_close_50: "EMA 50",
    ema_close_72: "EMA 72",
    ema_close_144: "EMA 144",
    ema_close_200: "EMA 200",
    ema_close_305: "EMA 305",
    ema_close_610: "EMA 610",
    ema_close_1292: "EMA 1292",
    ema_close_2584: "EMA 2584",

    pv_72: "Phibo PV 72",
    pv_305: "Phibo PV 305",
    pv_1292: "Phibo PV 1292",
    pc_72: "Phibo PC 72",
    pc_305: "Phibo PC 305",
    pc_1292: "Phibo PC 1292",

    roc_ema_close_8: "ROC EMA 8",
    roc_ema_close_9: "ROC EMA 9",
    roc_ema_close_17: "ROC EMA 17",
    roc_ema_close_34: "ROC EMA 34",
    roc_ema_close_50: "ROC EMA 50",
    roc_ema_close_72: "ROC EMA 72",
    roc_ema_close_144: "ROC EMA 144",
    roc_ema_close_200: "ROC EMA 200",
    roc_ema_close_305: "ROC EMA 305",
    roc_ema_close_610: "ROC EMA 610",
    roc_ema_close_1292: "ROC EMA 1292",
    roc_ema_close_2584: "ROC EMA 2584",

    roc_sma_close_7: "ROC SMA 7",
    roc_sma_close_10: "ROC SMA 10",
    roc_sma_close_20: "ROC SMA 20",
    roc_sma_close_21: "ROC SMA 21",
    roc_sma_close_30: "ROC SMA 30",
    roc_sma_close_50: "ROC SMA 50",
    roc_sma_close_55: "ROC SMA 55",
    roc_sma_close_100: "ROC SMA 100",
    roc_sma_close_200: "ROC SMA 200",
  },
  languages: {
    enUS: "English",
    ptBR: "Português",
  },
  linkitem: {
    input_name: "Link Name",
    input_url: "URL",
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

    amountInvested_kpi_label: "Amount Invested",
    amountInvested_title_hint: "Operational Costs included.",
    amountInvested_currency_hint: "Amount invested in your operations.",
    amountInvested_percentage_hint: "Amount Invested divided by wallet's balance.",
    amountInvested_alert_walletBallance: "Amount Invested is higher than Wallet's balance. Check wallet's balance to correct this metric.",

    closeVolume_kpi_label: "Close Volume",
    closeVolume_title_hint: "Taking into account only closed positions, it's the sum of the close price. For example, for an PURCHASE position, I'll sum up its sale's price.",
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
  myaccount: {
    title_personalData: "Personal Data",
    title_prefs: "Preferences",
    title_links: "Links",

    input_email: "Email",
    btn_changePassword: "Change Password",
    input_username: "Username",
    input_firstName: "First Name",
    input_lastName: "Last Name",
    input_nationality: "Nationality",
    input_birthday: "Birthday",
    input_birthday_hint: "I could send birthday gifts. Who knows...",
    input_aboutMe: "Bio",

    input_currency: "Main Currency",
    input_currency_hint: "Do you invest in different countries? I could convert the currencies to your preferred one on dashboards and reports. ",
    input_language: "Language",

    error_username_minReq: "Letters (a-z), numbers (0-9), underscores (_) and periods (.)",
    error_username_length: "It's important that it has between 3 and 32 characters. ;)",
    error_username_taken: "Username taken :/",
    error_username_couldNotCheck: "Something went wrong :/ Let's try again later.",

    btn_save: "Save"
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
    label_intro_p2: "What if we create your first wallet now? Then, we'll be able to open Positions, see Strategies, check Phi Trader's operations and much more!",

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
  modalcomparisondetail: {
    title: "Comparison",
    label_intro_p1: "Use this tool to compare indicator values between each other.",
    label_intro_p2: "You can also compare them with a fixed value.",

    label_item1: "Indicator 1",
    label_item2: "Indicator 2",

    input_operator: "Op.",
    input_operator_hint: "Operation to be made between these 2 values.",
    input_interval: "Time Interval",
    input_interval_hint: "Leave it ANY if you want to keep this strategy dynamic and reuse it on other time intervals.",
    input_subcategory: "Category",
    input_subcategory_hint: "Choose one of the available indicator category.",
    input_indicator: "Type",
    input_indicator_hint: "Which type of the selected indicator do you need?",
    input_instance: "Indicator",
    input_instance_hint: "Its value will be be used for the comparison.",
    input_offset: "Offset",
    input_offset_hint: "Default value is 0, which means the latest period (candle). If you select 1, I'll consider a period before and so on...",
    input_constant: "Fixed Value",
    input_constant_hint: "A value that should be used to compare with the other indicator's value.",

    warning_couldUseBasicWS: "Looking at this rule, seems like it would be possible to move it to workspace Basic... Your strategy would become faster to execute and easier to understand. ;)",
    error_instancesAreEqual: "Hmm... Am I wrong or these 2 elements are the same? They will always be equal each other, unless you want to compare them between different Time Intervals...",

    btn_add: "Add",
    btn_save: "Save",
  },
  modaldistancedetail: {
    title: "Distance",
    label_intro_p1: "Use this tool to monitor how close 2 indicators should be to each other.",
    label_intro_p2: "You can also monitor their distance to a fixed value.",

    label_item1: "Indicator 1",
    label_item2: "Indicator 2",

    input_threshold: "Threshold",
    input_threshold_hint: "How close should these indicators be to each other? I like to work with a distance of 1%.",
    threshold_currency_hint: "Calculation: |v1 - v2|",
    threshold_percentage_hint: "Calculation: |v1 - v2| / v1",
    input_interval: "Time Interval",
    input_interval_hint: "Leave it ANY if you want to keep this strategy dynamic and reuse it on other time intervals.",
    input_subcategory: "Category",
    input_subcategory_hint: "Choose one of the available indicator category.",
    input_indicator: "Type",
    input_indicator_hint: "Which type of the selected indicator do you need?",
    input_instance: "Indicator",
    input_instance_hint: "Its value will be be used for the comparison.",
    input_offset: "Offset",
    input_offset_hint: "Default value is 0, which means the latest period (candle). If you select 1, I'll consider a period before and so on...",
    input_constant: "Fixed Value",
    input_constant_hint: "A value that should be used to be compared to the other indicator's value.",

    warning_usingCurrency: "Hmm... I prefer using percentage format to calculate distance. It would make your strategy work pretty well for any asset price range... Just a thought... ;)",
    error_instancesAreEqual: "Hmm... Am I wrong or these 2 elements are the same? They will always be equal each other, unless you want to compare them between different Time Intervals...",

    btn_add: "Add",
    btn_save: "Save",
  },
  modalfollowers: {
    title: "Followers",
    label_noFollowers: "User doesn't have followers yet."
  },
  modalfollowing: {
    title: "Following",
    label_noFollowing: "User doesn't follow anyone yet."
  },
  modalmovingavgdetail: {
    title: "Moving Average",

    input_type: "Type",
    input_type_hint: "Which moving average are we talking about?",
    input_periods: "Periods",
    input_periods_hint: "Amount of periods considered to calculate this moving average.",
    input_periods_noOptions: "First, select Type.",

    btn_add: "Add",
    btn_save: "Save",
  },
  modalopenposition: {
    title: "Open a new Position",
    hint: "A Position is made of 2 Transactions: Open (e.g Buy) and Close (e.g Sell). For now, only open info is needed.",

    input_type_buy: "LONG",
    input_type_sell: "SHORT",

    input_wallet: "Wallet",
    input_asset: "Asset",
    input_asset_noOptions: "First, select a Wallet.",
    input_amount: "Amount",
    input_date: "Date",
    input_date_hint: "When did this operation happen?",
    input_price: "Average Price",
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
  modalslopedetail: {
    title: "Slope",
    label_intro_p1: "Use this tool to set an expected slope for a specific indicator.",
    label_intro_p2: "It could be an upward or downward slope. What do you want to see on the chart?",

    input_interval: "Time Interval",
    input_interval_hint: "Leave it ANY if you want to keep this strategy dynamic and reuse it on other time intervals.",
    input_subcategory: "Category",
    input_subcategory_hint: "Choose one of the available indicator category.",
    input_indicator: "Indicator",
    input_indicator_hint: "Which indicator are we talking about?",
    input_periods: "Periods",
    input_periods_hint: "Amount of periods considered to calculate this indicator.",
    input_offset: "Offset",
    input_offset_hint: "Default value is 0, which means the latest period (candle). If you select 1, I'll consider a period before and so on...",
    input_slope: "Slope",
    input_slope_hint: "Set what is the expected behavior for this indicator.",

    label_upward: "Upward",
    label_downward: "Downward",

    btn_add: "Add",
    btn_save: "Save",
  },
  modalstrategy: {
    title_create: "Create Strategy",
    title_update: "Update Strategy",
    title_view: "Strategy Details",

    label_intro_p1: "A Strategy is a set of rules/filters that can be applied to the relation between Price and Indicators.",
    label_intro_p2: "Once created, it can be applied to any time interval, unless you force it on the advanced workspace.",

    label_workspaces: "Workspaces",

    label_basic: "Basic",
    label_basic_intro_p1: "Click or move the following indicators into the Workspace desired...",
    label_basic_intro_p2: "Then, reorder them accordingly to the way they should appear on a chart.",

    label_advanced: "Advanced",
    label_advanced_intro_p1: "Advanced workspace has been created to complement the other workspaces...",
    label_advanced_intro_p2: "Use the following tools to make your Strategy even more powerful.",
    label_advanced_intro: "Bring out the big guns into this area... Then, reorder them to keep it organized ;)",

    input_name: "Name",
    input_logic: "Logic",
    label_logic_dynamic: "Dynamic",
    label_logic_static: "Static",
    input_logic_hint: "A Dynamic Strategy can be applied to any time interval (w, d, m60...). It becomes Static if a specific interval is set for one of the rules.",
    input_description: "Technical Description",
    label_description_placeholder: "A detailed description may help other users understand how your Strategy works...",
    input_public: "Public",
    input_public_hint: "Other users can see this strategy.",
    input_private: "Private",
    input_private_hint: "Only you can see this strategy.",
    input_buy: "Buy",
    input_buy_hint: "Buy Strategy.",
    input_sell: "Sell",
    input_sell_hint: "Sell Strategy.",

    label_basic_0: "Last Candle",
    label_basic_0_intro: "Define how indicators should be aligned",
    label_basic_1: "Previous Candle",
    label_basic_1_intro: "Define how indicators should be aligned",
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
    error_desc: "It seems too long... Please, try to keep it lesser than 2000 characters.",

    btn_add: "Add",
    btn_create: "Create",
    btn_update: "Update",
    btn_view: "Back"
  },
  modalnewreview: {
    title: "Review this strategy",

    label_createdBy: "created by",

    input_review: "Leave a review (optional)",
    label_clickToRate: "Click to Rate",
    label_tapToRate: "Tap to Rate",

    error_review: "It seems too long... Please, try to keep it lesser than 1000 characters.",

    btn_footer: "Avaliar",
  },
  modalstrategyresults: {
    input_stockExchange: "Stock Exchange",
    input_stockExchange_hint: "Which Stock Exchange are we talking about?",
    input_interval: "Interval",
    input_interval_hint: "Which time interval the Strategy's rules should be applied to?",

    label_readMore: "more",
    label_loading: "Making sure everything is ready...",
    label_running: "Looking for assets matching this Strategy...",

    header_asset: "Asset",
    header_name: "Name",
    header_quote: "Quote",
    header_volume: "Volume Avg.",
    header_lastTradeTime: "Last trade time",

    table_emptyData: "Right now, there are no assets matching this technical condition. Maybe later...",
    table_noDataFound: "hmm... I couldn't find any asset with these filters. Did I miss something?",

    btn_footer: "Back"
  },
  modalupdateposition: {
    title: "Update Position",
    label_intro_p1: "A Position is made of 2 events: Open and Close.",
    label_intro_p2: "I understand that a Position is closed once the fields under CLOSE tab are filled. ;)",

    tab_openInfo: "OPEN",
    tab_closeInfo: "CLOSE",

    input_type_buy: "LONG",
    input_type_sell: "SHORT",
    input_wallet: "Wallet",
    input_asset: "Asset",
    input_amount: "Amount",
    input_purchaseDate: "Purchase Date",
    input_saleDate: "Sale Date",
    input_price: "Average Price",
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
    stepTitle3: "3. Leverage your results",
    stepDesc3: "Become even more efficient in the financial market.",
    footer_p1: "If you have questions, send us a message at",
    footer_p2: "We are happy to help you ;)",

    btn_goToLogin: "Go to Login"
  },
  momentrelative: {
    sameDay: "Today, at",
    next: "Next",
    nextDay: "Tomorrow, at",
    lastDay: "Yesterday, at",
    last: "Last"
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
  openpositions: {
    item_buy: "Long",
    item_sell: "Short",
  },
  pagenotfound: {
    label_title: "Page not available. :(",
    label_desc: "The link you followed may be broken, or the page may have been removed.",
    btn_footer: "Go back to PHIOON"
  },
  phitrader: {
    title: "Phi Trader",
    label_intro_p1: "Hi! I'm Phi, the Artificial Intelligence behind PHIOON's main trading strategies...",
    label_intro_p2: "Here, I'll expose all my operations, with details like: entry point, target, stop loss and the reason of it.",
    label_intro_p3: "Be aware that they",
    label_intro_notRecommendation: "are not recommendations",
    label_intro_p4: "but I believe you could use my experience to analyze and learning with them.",

    label_noWallets_p1: "Hmm... Seems like you don't have a Wallet created so far... Let's create one?",
    label_noWallets_p2: "That way, I'll know which Stock Exchange you work with, so I can share my operations with you! ;)",
    btn_goToWallets: "Go to Wallets",

    label_noNews_p1: "Hmm... I don't have any operations so far.",
    label_noNews_p2: "As soon as I see an opportunity, I'll let you know! ;)",

    section_operations: "Operations",
    item_waiting: "Waiting",
    item_canceled: "Canceled",
    item_in_progress: "On-Going",
    item_gain: "Gain",
    item_loss: "Loss",
  },
  positions: {
    card_title: "Positions",
    btn_newPosition: "New Position",

    table_noDataFound: "hmm... I couldn't find any position with these filters. Did I miss something?",
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

    item_buy: "Long",
    item_sell: "Short",

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
  recentsearches: {
    btn_clear: "Clear recent searches"
  },
  register: {
    alert_generalErrorTitle: "Something went wrong...",
    alert_tryAgain: "Ooops... Sorry for that. :( Could you try again?",
    alert_404or50X: "Ooops... Sorry for that. :( Seems like my team had a hard time processing your request.",
    alert_couldNotSendRequest: "I couldn't send your request. Could you verify your internet connection and try again?",
    alert_username: "Ooops... A user with that email address already exists. Did you forget your password?",

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
    input_firstName: "First Name",
    input_lastName: "Last Name",
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
  search: {
    label_noRecentSearch_title: "Search PHIOON",
    label_noRecentSearch_desc: "Find users and strategies all around the world...",
  },
  searchresults: {
    card_users_title: "Users",
    card_strategies_title: "Strategies",

    btn_seeMore: "See more",
  },
  searchstrategyresults: {
    title: "Showing Strategies for"
  },
  searchuserresults: {
    title: "Showing Users for"
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
  phioperationcard: {
    label_long: "LONG",
    label_short: "SHORT",
    label_entryPrice: "ENTRY PRICE",
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

    label_waiting: "Waiting for it to reach Entry Price...",
    label_canceled: "CANCELED ! At least it wasn't a Loss ;)",
    label_gain: "Gain!  \\o/",
    label_loss: "Stop Loss triggered. :/",
    label_buyingArea: "Operation is active and offering even better Risk/Reward.",
    label_sellingArea: "Operation is active and offering even better Risk/Reward.",

    label_notAvailableData: "...",
    notAvailableData_hint: "I don't have enough data to calculate this metric. :/",

    btn_details: "Details",
    nav_summary: "Summary",
    nav_technicalCondition: "Technical Condition",

    entryPrice_hint: "Price suggested to start this operation. It may be different considering your Risk Management.",
    priceLimit_hint: "Price Limit suggested for this operation. It may be different considering your Risk Management.",
    stopLoss_hint: "Here is a safety spot where I believe price won't reach again. If it happens, leave the operation and wait for a new opportunity.",
    target_hint: "It is a projection to estimate where price may reach. Most of the time, I use Fibonacci sequence.",
    gainPercent_hint: "Potential profit for this operation.",
    lossPercent_hint: "Potential capital risk for this operation.",
    riskReward_hint: "Potential Gain divided by Potential Loss. The higher this number is, the better.",
    radarOn_hint: "On radar since...",

    successRate_hint: "Backtest's result for this Setup and Asset.",
    estimatedTime_hint: "Statistically speaking, that's an estimative of how long it may take to reach the target.",
    occurrencies_hint: "Amount of times this Technical Condition occurred for this Asset in the last 4 years.",
    lastOccurrence_hint: "Last time this Technical Condition occurred for this Asset.",

    progressBar_stopLoss_hint: "Stop Loss",
    progressBar_target_hint: "Target",
    progressBar_endedOn_hint: "Operation ended on:",
    icon_type_long_hint: "Long operation",
    icon_type_short_hint: "Short operation",
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
    myaccount: "My Account",
    myaccountMini: "MA",
    subscription: "My Plan",
    subscriptionMini: "MP",

    home: "Home",

    myassets: "My Assets",
    wallets: "Wallets",
    walletsMini: "W",
    positions: "Positions",
    positionsMini: "P",
    strategies: "Strategies",
    strategiesMini: "S",

    dashboards: "Dashboards",
    walletoverview: "Overview",
    walletoverviewMini: "O",
    openpositions: "Open Positions",
    openpositionsMini: "OP",

    phitrader: "Phi Trader",
    phitraderMini: "PHI",
  },
  statusfilter: {
    label_title: "Status",
  },
  stockexchangefilter: {
    label_title: "Stock Exchanges",
  },
  strategycardmini: {
    label_public: "Public",
    label_public_hint: "Other users can see this strategy.",
    label_private: "Private",
    label_private_hint: "Only you can see this strategy.",

    icon_type_buy_hint: "Buy Strategy",
    icon_type_sell_hint: "Sell Strategy",

    label_dynamic: "Dynamic",
    label_dynamic_hint: "Applies to any time interval.",
    label_static: "Static",
    label_static_hint: "Some rules are fixed to specific time intervals.",
    label_public: "Public",
    label_private: "Private"
  },
  strategycomponents: {
    btn_save: "Add to Saved",
    btn_save_hint: "Add to Saved.",
    btn_unsave: "Remove from Saved",
    btn_unsave_hint: "Remove from Saved.",

    btn_view: "See Rules",
    btn_update: "Update",
    btn_delete: "Delete",

    btn_strategyPage: "See details",
    btn_userProfile: "Go to User Profile",
    btn_rate: "Rate",
    btn_share: "Share",

    btn_run_hint: "Run Strategy.",
  },
  strategypage: {
    label_createdBy: "Created by",

    label_totalRuns: "Runs",
    label_saved: "Saved",
    label_rating: "Rating",

    label_ratings_available_hint: "out of 5.",
    label_ratings_notAvailable_hint: "There is no ratings enough.",

    card_description_title: "Technical Description",
    card_description_empty: "This strategy doesn't have a description yet... :(",
    btn_showMore: "Show more",
    btn_showLess: "Show less",

    card_reviews_title: "Ratings e Reviews",
    card_reviews_empty: "How did you like this strategy? Let us know... ;)",
    label_clickToRate: "Click to Rate",
    label_tapToRate: "Tap to Rate",
    btn_review: "Write a Review",

    card_indicators_title: "Indicators",
  },
  strategies: {
    title: "Strategies",
    btn_newStrategy: "New Strategy",
    btn_goToGallery: "Go to Gallery",

    label_noWallets_p1: "Hmm... Seems like you don't have a Wallet created so far... Let's create one?",
    label_noWallets_p2: "That way, I'll know which Stock Exchange you operate in, so I can bring you strategies and indicators that are available there! ;)",
    btn_goToWallets: "Go to Wallets",

    label_myStrategies_noStrategies_p1: "Create, test and share strategies with your friends...",
    label_myStrategies_noStrategies_p2: "Be aware when the market's best opportunities happen in real time.",
    btn_learnMore: "How does it work?",

    label_savedStrategies_noStrategies_p1: "You don't have strategies saved yet... ",
    label_savedStrategies_noStrategies_p2: "You can always go to Home page and see what most users are using lately. ;)",

    card_myStrategies_title: "My",
    card_savedStrategies_title: "Saved",

    btn_alert_cancel: "Cancel",
    btn_alert_confirm: "Confirm",
    alert_confirming_title: "Are you sure?",
    alert_confirming_text: "Once deleted, it's not possible to recover it back.",
    alert_deleted_title: "Deleted!",
    alert_deleted_text: "Your Strategy has been deleted.",
  },
  subscriptionbasic: {
    label_title: "BASIC",

    label_month: "mon",

    label_perDay: "per day",
    label_runs: "runs",

    label_stockExchange: "Stock Exchange",
    label_stockExchange_hint: "Soon, other stock exchanges will be included in PHIOON. ;)",
    label_wallets: "Wallets",
    label_staticPanels: "Position Panels",
    label_staticPanels_hint: "Auto-Refresh not available.",
    label_strategyRuns: "Strategy runs",
    label_strategies: "Strategies",

    btn_downgrade: "Downgrade"
  },
  subscriptionpremium: {
    label_title: "PREMIUM",

    label_month: "mon",

    label_perDay: "per day",
    label_runs: "runs",

    label_stockExchange: "Stock Exchange",
    label_stockExchange_hint: "Soon, other stock exchanges will be included in PHIOON. ;)",
    label_stockExchanges: "Stock Exchanges",
    label_stockExchanges_hint: "Soon, other stock exchanges will be included in PHIOON. ;)",
    label_wallets: "Wallets",
    label_dashboards: "Position Dashboards",
    label_dashboards_hint: "Auto-Refresh included.",
    label_strategyRuns: "Strategy runs",
    label_strategies: "Strategies",
    label_phiTrader: "Phi Trader",

    btn_upgrade: "Upgrade",
    btn_downgrade: "Downgrade"
  },
  subscriptionplatinum: {
    label_title: "PLATINUM",

    label_month: "mon",

    label_perDay: "per day",
    label_runs: "runs",

    label_stockExchange: "Stock Exchange",
    label_stockExchange_hint: "Soon, other stock exchanges will be included in PHIOON. ;)",
    label_stockExchanges: "Stock Exchanges",
    label_stockExchanges_hint: "Soon, other stock exchanges will be included in PHIOON. ;)",
    label_wallets: "Wallets",
    label_dashboards: "Position Dashboards",
    label_dashboards_hint: "Auto-Refresh included.",
    label_strategyRuns: "Strategy runs",
    label_strategies: "Strategies",
    label_phiTrader: "Phi Trader",

    btn_upgrade: "Upgrade",
    btn_downgrade: "Downgrade"
  },
  subscriptioncurrent: {
    label_joinedOn: "JOINED US ON",
    label_subscription: "SUBSCRIPTION",
    label_subscription_hint: "Your current plan.",
    label_expiresOn: "EXPIRES ON",
    label_expiresOn_hint: "It means your current subscription will last till this date.",
    label_renewsOn: "RENEWS ON",
    label_renewsOn_hint: "Probably, you will see a new transaction in your credit card on this date.",

    label_monthly: "Monthly",
    label_yearly: "Annual",
    btn_manage: "Manage Subscription",

    label_insights: "Insights",
    // Basic
    label_positions: "POSITIONS",
    label_positions_hint: "Amount of Positions managed.",
    label_volume: "TOTAL VOLUME",
    label_volume_hint: "Total volume negotiated. It includes both purchase and sale operations.",
    label_result: "RESULT",
    label_result_hint: "How much your money has earned so far.",
    // Premium
    label_phiOperations: "PHI TRADER",
    label_phiOperations_hint: "Phi operations since you joined us.",
    label_strategies: "STRATEGIES",
    label_strategies_hint: "Amount of favorite strategies.",
  },
  technicalconditions: {
    "btl_ema_7__trend_ema_610+": "Price is getting more support and starting an upward trend. Moving Averages 34, 144 and 610 are aligned up and Price is breaking above EMA 34. Gains may vary between 7% and 23%.",
    "btl_ema_7__trend_ema_144+": "Price is getting more support and starting an upward trend. Moving Averages 34, 144 and 610 are aligned up and Price is breaking above EMA 34. Gains may vary between 7% and 23%.",
    "btl_ema_0__trend_ema_610-": "Price is getting more resistance and starting an downward trend. Moving Averages 34, 144 and 610 are aligned down and Price is breaking bellow EMA 34. Gains may vary between 7% and 16%'.",
    "btl_ema_0__trend_ema_144-": "Price is getting more resistance and starting an downward trend. Moving Averages 34, 144 and 610 are aligned down and Price is breaking bellow EMA 34. Gains may vary between 7% and 16%.",

    pvpc_1292_long_p1: "Price reached a key technical support after a retracement of <fibonacci.retracement_pct>% of Wave 1 and drew a Pivot Up.",
    pvpc_1292_long_p2: "Support Lines are aligned up, increasing the probability of starting a long Wave 3.",
    pvpc_305_long_p1: "Price reached an important technical support after a retracement of <fibonacci.retracement_pct>% of Wave 1 and drew a Pivot Up.",
    pvpc_305_long_p2: "Support Lines are aligned up, increasing the probability of starting a Wave 3.",
    pvpc_72_long_p1: "Price reached a technical support after a retracement of <fibonacci.retracement_pct>% of Wave 1 and drew a Pivot Up, increasing the probability of, at least, testing last top again.",

    pvpc_1292_short_p1: "Price reached a key technical resistance after a retracement of <fibonacci.retracement_pct>% of Wave 1 and drew a Pivot Down.",
    pvpc_1292_short_p2: "Resistance Lines are aligned down, increasing the probability of starting a long Wave 3.",
    pvpc_305_short_p1: "Price reached an important technical resistance after a retracement of <fibonacci.retracement_pct>% of Wave 1 and drew a Pivot Down.",
    pvpc_305_short_p2: "Resistance Lines are aligned down, increasing the probability of starting a Wave 3.",
    pvpc_72_short_p1: "Price reached a technical resistance after a retracement of <fibonacci.retracement_pct>% from the recent bottom and drew a Pivot Down, increasing the probability of, at least, testing last bottom again.",
  },
  userfollowingitem: {
    label_follow: "Follow",
    label_following: "Following",
    label_unfollow: "Unfollow",
  },
  userprofile: {
    label_editProfile: "Edit Profile",
    label_follow: "Follow",
    label_followBack: "Follow Back",
    label_following: "Following",
    label_unfollow: "Unfollow",
    label_followers: "Followers",
    label_share: "Share",
    label_strategies: "Strategies",
    label_report: "Report user",

    tab_overview: "Overview",
    tab_about: "About",

    card_popularStrategies_title: "Popular Strategies",
    label_showMore: "Show more",
    label_showLess: "Show less",

    card_bio_title: "Bio",
    card_bio_noBio: "User doesn't have a Bio yet... :(",

    card_links_title: "Mais Informações",
  },
  usersubscription: {
    label_monthly: "Monthly",
    label_yearly: "Yearly",

    alert_subscriptionDone_title: "Welcome to the next level!",
    alert_subscriptionDone_text_p1: "I hope you will enjoy this new experience!",
    alert_subscriptionDone_text_p2: "Within few minutes you will receive your invoice details by email. ;)",
    btn_getStarted: "Get Started",
  },
  walletfilter: {
    label_title: "Wallets",
  },
  walletoverview: {
    item_buy: "Long",
    item_sell: "Short",

    item_open: "Open",
    item_closed: "Closed",

    position_new_hint: "Open a new Position.",
  },
  wallets: {
    card_title: "Wallets",
    btn_newWallet: "New Wallet",

    table_noDataFound: "hmm... I couldn't find any wallet with these filters. Did I miss something?",
    table_emptyData: "Don't have a Wallet yet? Create it clicking on the button at your right. ;)",

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
}

export default locale;
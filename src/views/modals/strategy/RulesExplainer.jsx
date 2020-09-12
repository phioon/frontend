import React from "react";
import PropTypes from "prop-types";

class RulesExplainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,
    }
  }
  explainRules(ws) {
    if (ws.type == "basic")
      return this.explainBasicRules(ws)
    else
      return this.explainAdvancedRules(ws)
  }

  explainBasicRules(ws) {
    let { getString } = this.props;
    let { langId, compId } = this.state;

    if (ws.items.length == 0)
      return (
        <div className="text-center">
          <label>{getString(langId, compId, "label_basic_noItems_p1")}</label>
          <label>{getString(langId, compId, "label_basic_noItems_p2")}</label>
        </div>
      )
    else if (ws.items.length == 1)
      return (
        <div className="text-center">
          <label>{getString(langId, compId, "label_basic_onlyOneItem")}</label>
        </div>)
    else
      return ws.items.map((rule, key) => {
        return (
          <div key={ws.id + "_rule_" + key}>
            {ws.items.length > key + 1 &&
              <li>
                <label>
                  <b>{getString(langId, "indicators", rule.id)}</b>
                  {" "}
                  {getString(langId, compId, "label_explain_gte")}
                  {" "}
                  <b>{getString(langId, "indicators", ws.items[key + 1].id)}</b>
                  {"."}
                </label>
              </li>
            }
          </div>
        )
      })
  }
  explainAdvancedRules(ws) {
    return <label>{getString(langId, "generic", "label_comingsoon")}</label>
  }

  render() {
    let { workspace } = this.props;

    return (
      <>
        {this.explainRules(workspace)}
      </>
    )
  }
}

export default RulesExplainer;

RulesExplainer.propTypes = {
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,

  workspace: PropTypes.object.isRequired,
}
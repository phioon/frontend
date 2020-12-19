import React from "react";
import PropTypes from "prop-types";
import { Button, Col } from "reactstrap";
import { SortableContainer, SortableElement } from "react-sortable-hoc";

import { arrayMove } from "../../core/utils";

const SortableItem = SortableElement((props) => {
  return (
    <div className="sortable-item">
      <span className="sortable-item-handle" />
      <Col>{props.item.element}</Col>
      <Col lg="2" sm="3" xs="3" className="text-right">
        {props.onUpdateItem &&
          <Button
            id={"ws_edit_" + props.item.value}
            onClick={() => props.onUpdateItem(props.context, props.i)}
            color="warning"
            size="sm"
            className="btn-icon btn-neutral edit"
          >
            <i className="far fa-edit" />
          </Button>
        }

        {props.onRemoveItem &&
          <Button
            id={"ws_delete_" + props.item.value}
            onClick={() => props.onRemoveItem("delete", props.context, props.i)}
            color="danger"
            size="sm"
            className="btn-icon btn-neutral remove"
          >
            <i className="fa fa-times" />
          </Button>
        }
      </Col>
    </div>
  )
});

const SortableList = SortableContainer((props) => {
  return (
    <div>
      {props.items.map((item, index) => (
        <SortableItem
          key={index}
          index={index}
          item={item}
          disabled={Boolean(props.onSortableChange)}

          i={index}
          context={props.context}
          onUpdateItem={props.onUpdateItem}
          onRemoveItem={props.onRemoveItem} />
      ))}
    </div>
  );
});


class SortableRulesAdv extends React.Component {
  constructor(props) {
    super(props);
  }

  onSortEnd(items, { oldIndex, newIndex }) {
    items = arrayMove(items, oldIndex, newIndex)

    this.props.onSortableChange("sort", this.props.context, items)
  }

  render() {
    let { items } = this.props

    return (
      <SortableList
        {...this.props}
        onSortEnd={({ oldIndex, newIndex }) => this.onSortEnd(items, { oldIndex, newIndex })} />
    )
  }
}

SortableRulesAdv.propTypes = {
  items: PropTypes.array.isRequired,
  context: PropTypes.string.isRequired,
  onSortableChange: PropTypes.func.isRequired,
  onUpdateItem: PropTypes.func.isRequired,
  onRemoveItem: PropTypes.func.isRequired
}

export default SortableRulesAdv;
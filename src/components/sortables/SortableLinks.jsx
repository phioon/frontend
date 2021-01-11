import React from "react";
import PropTypes from "prop-types";
import { SortableContainer, SortableElement } from "react-sortable-hoc";

import { arrayMove } from "../../core/utils";
import LinkItem from "../listItems/LinkItem";

const SortableItem = SortableElement((props) => {
  return (
    <div className="sortable-item">
      <span className="sortable-item-handle" />
      <LinkItem {...props} />
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

          i={index}
          {...props} />
      ))}
    </div>
  );
});


class SortableLinks extends React.Component {
  constructor(props) {
    super(props);
  }

  onSortEnd(items, { oldIndex, newIndex }) {
    items = arrayMove(items, oldIndex, newIndex)

    this.props.onLinkCommit("sort", items)
  }

  render() {
    let { items } = this.props;

    return (
      <SortableList
        {...this.props}
        onSortEnd={({ oldIndex, newIndex }) => this.onSortEnd(items, { oldIndex, newIndex })}
      />
    )
  }
}

SortableLinks.propTypes = {
  items: PropTypes.array.isRequired,
}

export default SortableLinks;
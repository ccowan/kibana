import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
import ColumnMetrics from './column_metrics';
class Column extends Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      selectedTab: 'metrics'
    };
    this.handleChange = this.handleChange.bind(this);
    this.switchTab = this.switchTab.bind(this);
    this.toggleVisible = this.toggleVisible.bind(this);
  }

  switchTab(selectedTab) {
    this.setState({ selectedTab });
  }

  handleChange(part) {
    if (this.props.onChange) {
      const { model } = this.props;
      const doc = _.assign({}, model, part);
      this.props.onChange(doc);
    }
  }

  toggleVisible(e) {
    e.preventDefault();
    this.setState({ visible: !this.state.visible });
  }

  render() {
    const params = {
      className: this.props.className,
      disableDelete: this.props.disableDelete,
      fields: this.props.fields,
      name: this.props.name,
      onAdd: this.props.onAdd,
      onChange: this.handleChange,
      onClone: this.props.onClone,
      onDelete: this.props.onDelete,
      onMouseDown: this.props.onMouseDown,
      onTouchStart: this.props.onTouchStart,
      onSortableItemMount: this.props.onSortableItemMount,
      onSortableItemReadyToMove: this.props.onSortableItemReadyToMove,
      model: this.props.model,
      panel: this.props.panel,
      selectedTab: this.state.selectedTab,
      sortData: this.props.sortData,
      style: this.props.style,
      switchTab: this.switchTab,
      toggleVisible: this.toggleVisible,
      visible: this.state.visible
    };
    return (<ColumnMetrics {...params}/>);
  }

}

Column.defaultProps = {
  name: 'metrics'
};

Column.propTypes = {
  className: PropTypes.string,
  disableDelete: PropTypes.bool,
  fields: PropTypes.object,
  name: PropTypes.string,
  onAdd: PropTypes.func,
  onChange: PropTypes.func,
  onClone: PropTypes.func,
  onDelete: PropTypes.func,
  onMouseDown: PropTypes.func,
  onSortableItemMount: PropTypes.func,
  onSortableItemReadyToMove: PropTypes.func,
  onTouchStart: PropTypes.func,
  model: PropTypes.object,
  panel: PropTypes.object,
  sortData: PropTypes.string,
};

export default Column;

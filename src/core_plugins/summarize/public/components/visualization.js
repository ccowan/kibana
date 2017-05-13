import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import getLastValue from './lib/get_last_value';
import ticFormatter from './lib/tick_formatter';
class Visualization extends Component {

  constructor(props) {
    super(props);
    this.renderRow = this.renderRow.bind(this);
  }

  renderRow(row) {
    const { model } = this.props;
    const rowId = _.get(row, `${model.id_field}`);
    let rowDisplay = rowId;
    if (model.display_field) {
      rowDisplay = _.get(row, `${model.display_field}`, rowId);
    }
    const columns = row.data.map(item => {
      const column = model.columns.find(c => c.id === item.id);
      if (!column) return null;
      const formatter = ticFormatter(column.formatter, column.value_template);
      const key = `${rowId}-${item.id}`;
      const value = formatter(getLastValue(item.data));
      return (<td key={key} className="summarize__value">{ value }</td>);
    });
    return (
      <tr key={rowId}>
        <td>{rowDisplay}</td>
        {columns}
      </tr>
    );
  }

  renderHeader() {
    const { model, visData } = this.props;
    const first = _.first(visData.data);
    const columns  = first.data.map(item => {
      return (<th key={item.id}>{item.label}</th>);
    });
    const label = model.label || model.display_field || model.id_field;
    return (
      <tr>
        <th>{label}</th>
        { columns }
      </tr>
    );
  }

  render() {
    const { visData } = this.props;
    if (!Array.isArray(visData.data)) return null;
    const rows = visData.data.map(this.renderRow);
    const header = this.renderHeader();
    return(
      <div className="summarize__visualization">
        <table className="table">
          <thead>
            {header}
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>
    );
  }

}

Visualization.propTypes = {
  visData: PropTypes.object,
  model: PropTypes.object,
  backgroundColor: PropTypes.string
};

export default Visualization;

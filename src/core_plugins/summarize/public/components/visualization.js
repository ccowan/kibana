import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import ticFormatter from './lib/tick_formatter';
import calculateLabel from '../../common/calculate_label';
import Pagination from './pagination';
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
      const value = formatter(item.last);
      let trend;
      if (column.trend_arrows) {
        const trendClass = item.slope > 0 ? 'fa-long-arrow-up' : 'fa-long-arrow-down';
        trend = (
          <span className="summarize__trend">
            <i className={`fa ${trendClass}`}></i>
          </span>
        );
      }
      return (
        <td key={key} className="summarize__value">
          <span className="summarize__value-display">{ value }</span>
          {trend}
        </td>
      );
    });
    return (
      <tr key={rowId}>
        <td className="summarize__fieldName">{rowDisplay}</td>
        {columns}
      </tr>
    );
  }

  renderHeader() {
    const { model } = this.props;
    const columns  = model.columns.map(item => {
      const metric = _.last(item.metrics);
      const label = item.label || calculateLabel(metric, item.metrics);
      return (
        <th
          className="summarize__columnName"
          key={item.id}>{label}</th>
      );
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
    const { visData, model, pageNumber } = this.props;
    const header = this.renderHeader();
    let rows;
    let pagination;
    let resultsInfo;
    if (visData.total && _.isArray(visData.data)) {
      rows = visData.data.map(this.renderRow);
      pagination = (
        <Pagination
          currentPage={pageNumber}
          pageSize={Number(model.page_size)}
          total={visData.total}
          onChange={this.props.onPaginate} />
      );
      resultsInfo = (
        <div className="summarize__totalResults">
          <div>{visData.total} results, showing page {pageNumber} of {Math.ceil(visData.total / model.page_size)}.</div>
        </div>
      );
    } else {
      rows = (
        <tr>
          <td
            className="summarize__noResults"
            colSpan={model.columns.length + 1}>No results available</td>
        </tr>
      );
    }
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
        {pagination}
        {resultsInfo}
      </div>
    );
  }

}

Visualization.propTypes = {
  visData: PropTypes.object,
  model: PropTypes.object,
  backgroundColor: PropTypes.string,
  onPaginate: PropTypes.func,
  pageNumber: PropTypes.number
};

export default Visualization;

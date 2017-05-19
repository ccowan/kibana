import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import ticFormatter from './lib/tick_formatter';
import calculateLabel from '../../common/calculate_label';
import Pagination from './pagination';

function getColor(rules, colorKey, value) {
  let color;
  if (rules) {
    rules.forEach((rule) => {
      if (rule.opperator && rule.value != null) {
        if (_[rule.opperator](value, rule.value)) {
          color = rule[colorKey];
        }
      }
    });
  }
  return color;
}

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
    const keys = Object.keys(row.data);
    const columns = keys.map(key => {
      const item = row.data[key];
      const column = model.columns.find(c => c.id === key);
      if (!column) return null;
      const formatter = ticFormatter(column.formatter, column.value_template);
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
      const style = { color: getColor(column.color_rules, 'text', item.last) };
      return (
        <td key={`${rowId}-${key}`} className="summarize__value" style={style}>
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
    const { model, sort, onSort } = this.props;
    const columns  = model.columns.map(item => {
      const metric = _.last(item.metrics);
      const label = item.label || calculateLabel(metric, item.metrics);
      const field = `data.${item.id}.last`;
      const handleClick = () => {
        if (model.indexing) {
          let order;
          if (sort.field === field) {
            order = sort.order === 'asc' ? 'desc' : 'asc';
          } else {
            order = 'asc';
          }
          onSort({ field, order });
        }
      };
      let sortComponent;
      if (model.indexing && sort.field === field) {
        const sortIcon = sort.order === 'asc' ? 'sort-amount-asc' : 'sort-amount-desc';
        sortComponent = (
          <i className={`fa fa-${sortIcon}`}></i>
        );
      }
      return (
        <th
          className="summarize__columnName"
          onClick={handleClick}
          key={item.id}>{label} {sortComponent}</th>
      );
    });
    const label = model.label || model.display_field || model.id_field;
    const sortIcon = sort.order === 'asc' ? 'sort-amount-asc' : 'sort-amount-desc';
    let sortComponent;
    if (!sort.field) {
      sortComponent = (
        <i className={`fa fa-${sortIcon}`}></i>
      );
    }
    const handleSortClick = () => {
      let order;
      if (!sort.field) {
        order = sort.order === 'asc' ? 'desc' : 'asc';
      } else {
        order = 'asc';
      }
      onSort({ field: null, order });
    };
    return (
      <tr>
        <th onClick={handleSortClick}>{label} {sortComponent}</th>
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
    let reversedClass = '';

    if (this.props.reversed) {
      reversedClass = 'reversed';
    }

    if (visData.total && _.isArray(visData.data)) {
      rows = visData.data.map(this.renderRow);
      pagination = (
        <Pagination
          currentPage={pageNumber}
          pageSize={Number(model.page_size)}
          total={visData.total}
          reversed={this.props.reversed}
          onChange={this.props.onPaginate} />
      );
      resultsInfo = (
        <div className={`summarize__totalResults ${reversedClass}`}>
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
      <div className={`summarize__visualization ${reversedClass}`}>
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
  sort: PropTypes.object,
  onSort: PropTypes.func,
  pageNumber: PropTypes.number,
  reversed: PropTypes.bool
};

export default Visualization;

import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
class Pagination extends Component {

  constructor(props) {
    super(props);
    this.renderPage = this.renderPage.bind(this);
  }

  renderPage(page) {
    const { currentPage, onChange } = this.props;
    if (currentPage === page + 1) {
      return (
        <li className="summarize__pagination-currentPage" key={`pagination-${page}`}>
          {page + 1}
        </li>
      );
    } else {
      return (
        <li className="summarize__pagination-page" key={`pagination-${page}`}>
          <a onClick={() => onChange(page + 1)}>{page + 1}</a>
        </li>
      );
    }
  }

  render() {
    const { currentPage, pageSize, total, windowSize, onChange } = this.props;
    const totalPages = Math.ceil(total / pageSize);
    let start;
    let end;

    const middle = Math.ceil(windowSize / 2);
    const middlePlusOne = middle + 1;
    const middleMinusOne = middle - 1;

    if (totalPages <= windowSize) {
      start = 1;
      end = totalPages;
    } else {
      if (currentPage <= middlePlusOne) {
        start = 1;
        end = windowSize;
      } else if (currentPage + middleMinusOne >= totalPages) {
        start = totalPages - (windowSize - 1);
        end = totalPages;
      } else {
        start = currentPage - middle;
        end = currentPage + middleMinusOne;
      }
    }

    const pages = _.range(start - 1, end).map(this.renderPage);

    let prev;
    if (currentPage > 1) {
      prev = (
        <li className="summarize__pagination-prev">
          <a onClick={() => onChange(currentPage - 1)}>
            <i className="fa fa-chevron-left"></i>
          </a>
        </li>
      );
    }

    let next;
    if (currentPage < totalPages) {
      next = (
        <li className="summarize__pagination-next">
          <a onClick={() => onChange(currentPage + 1)}>
            <i className="fa fa-chevron-right"></i>
          </a>
        </li>
      );
    }

    return(
      <div className="summarize__pagination">
        <ul>
          {prev}
          {pages}
          {next}
        </ul>
      </div>
    );
  }

}

Pagination.defaultProps = {
  windowSize: 10,
  pageSize: 10
};

Pagination.propTypes = {
  onChange: PropTypes.func,
  currentPage: PropTypes.number,
  pageSize: PropTypes.number,
  total: PropTypes.number,
  windowSize: PropTypes.number
};

export default Pagination;

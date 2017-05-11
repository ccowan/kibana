import React, { Component, PropTypes } from 'react';
class ColumnOptions extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return(
      <div/>
    );
  }

}

ColumnOptions.propTypes = {
  fields: PropTypes.object,
  model: PropTypes.object,
  onChange: PropTypes.func
};

export default ColumnOptions;

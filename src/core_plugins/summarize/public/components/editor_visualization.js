import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import Visualization from './visualization';
import Error from './error';

class EditorVisualization extends Component {

  constructor(props) {
    super(props);
    this.state = {
      height: 250,
      dragging: false
    };

    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
  }

  handleMouseDown() {
    this.setState({ dragging: true });
  }

  handleMouseUp() {
    this.setState({ dragging: false });
  }

  componentWillMount() {
    this.handleMouseMove = (event) => {
      if (this.state.dragging) {
        const height = this.state.height + event.movementY;
        if (height > 250) {
          this.setState({ height });
        }
      }
    };
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
  }

  componentDidMount() {
    const el = findDOMNode(this.visDiv);
    el.setAttribute('render-counter', 'disabled');
  }

  render() {
    const { model } = this.props;
    const style = { height: this.state.height };
    if (this.state.dragging) {
      style.userSelect = 'none';
    }
    const visBackgroundColor = '#FFF';
    let body;
    if (!model.id_field) {
      body = (
        <Error message="You must supply an ID field." />
      );
    } else {
      body = (
          <Visualization
            backgroundColor={visBackgroundColor}
            className="dashboard__visualization"
            model={this.props.model}
            onBrush={this.props.onBrush}
            onChange={this.handleChange}
            onPaginate={this.props.onPaginate}
            pageNumber={this.props.pageNumber}
            sort={this.props.sort}
            onSort={this.props.onSort}
            visData={this.props.visData} />
      );
    }
    return (
      <div>
        <div
          style={style}
          data-shared-item={true}
          ref={(el) => this.visDiv = el}
          className="vis_editor__visualization">
          {body}
        </div>
        <div
          className="vis_editor__visualization-draghandle"
          onMouseDown={this.handleMouseDown}
          onMouseUp={this.handleMouseUp}>
          <i className="fa fa-ellipsis-h"></i>
        </div>
      </div>
    );
  }
}

EditorVisualization.propTypes = {
  model: PropTypes.object,
  onBrush: PropTypes.func,
  onChange: PropTypes.func,
  onPaginate: PropTypes.func,
  pageNumber: PropTypes.number,
  sort: PropTypes.object,
  onSort: PropTypes.func,
  visData: PropTypes.object
};

export default EditorVisualization;


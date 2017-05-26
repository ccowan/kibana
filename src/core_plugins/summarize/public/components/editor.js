import React, { Component, PropTypes } from 'react';
import EditorVisualization from './editor_visualization';
import EditorPanel from './editor_panel';
class Editor extends Component {

  constructor(props) {
    super(props);
    this.state = { model: props.model };
  }

  render() {
    const handleChange = (part) => {
      const nextModel = { ...this.state.model, ...part };
      this.setState({ model: nextModel });
      if (this.props.onChange) {
        this.props.onChange(nextModel);
      }
    };
    const { model } = this.state;
    return(
      <div className="vis_editor">
        <EditorVisualization
          model={model}
          visData={this.props.visData}
          onBrush={this.props.onBrush}
          onPaginate={this.props.onPaginate}
          pageNumber={this.props.pageNumber}
          onSort={this.props.onSort}
          sort={this.props.sort}
          onToggleAutoApply={this.props.onToggleAutoApply}
          onCommit={this.props.onCommit}
          dirty={this.props.dirty}
          autoApply={this.props.autoApply}
          onChange={handleChange} />
        <EditorPanel
          dashboards={this.props.dashboards}
          fields={this.props.fields}
          model={model}
          visData={this.props.visData}
          onChange={handleChange} />
      </div>
    );
  }

}

Editor.propTypes = {
  fields: PropTypes.object,
  model: PropTypes.object,
  onChange: PropTypes.func,
  onPaginate: PropTypes.func,
  pageNumber: PropTypes.number,
  sort: PropTypes.object,
  onSort: PropTypes.func,
  visData: PropTypes.object,
  onCommit: PropTypes.func,
  onToggleAutoApply: PropTypes.func,
  dirty: PropTypes.bool,
  autoApply: PropTypes.bool,
  dashboards: PropTypes.array
};

export default Editor;

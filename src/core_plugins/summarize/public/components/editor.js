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
          onChange={handleChange} />
        <EditorPanel
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
  visData: PropTypes.object
};

export default Editor;

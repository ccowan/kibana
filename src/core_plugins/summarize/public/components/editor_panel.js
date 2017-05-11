import React, { Component, PropTypes } from 'react';
import PanelOptions from './panel_options';
import Columns from './columns';
class EditorPanel extends Component {

  constructor(props) {
    super(props);
    this.state = { selectedTab: 'options' };
  }

  switchTab(selectedTab) {
    this.setState({ selectedTab });
  }

  render() {
    const { selectedTab } = this.state;
    let view;
    if (selectedTab === 'columns') {
      view = (
        <Columns
          fields={this.props.fields}
          onChange={this.props.onChange}
          model={this.props.model}
          visData={this.props.visData} />
      );
    } else {
      view = (
        <PanelOptions
          fields={this.props.fields}
          onChange={this.props.onChange}
          model={this.props.model}
          visData={this.props.visData} />
      );
    }
    return(
      <div className="summarize__editorPanel vis_editor_main">
        <div>
          <div className="kbnTabs">
            <div className={`kbnTabs__tab${selectedTab === 'options' && '-active' || ''}`}
              onClick={() => this.switchTab('options')}>Panel Options</div>
            <div className={`kbnTabs__tab${selectedTab === 'columns' && '-active' || ''}`}
              onClick={() => this.switchTab('columns')}>Columns</div>
          </div>
          {view}
        </div>
      </div>
    );
  }

}

EditorPanel.propTypes = {
  fields: PropTypes.object,
  model: PropTypes.object,
  visData: PropTypes.object,
  onChange: PropTypes.func
};

export default EditorPanel;

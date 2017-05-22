import React, { Component, PropTypes } from 'react';
import Select from 'react-select';
import createSelectHandler from '../../../metrics/public/components/lib/create_select_handler';
import createTextHandler from '../../../metrics/public/components/lib/create_text_handler';
class IndexingOptions extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { model, onChange } = this.props;
    const handleSelectChange = createSelectHandler(onChange);
    const handleTextChange = createTextHandler(onChange);
    const frequencyOptions = [
      { label: 'Every 30 Seconds', value: 30000 },
      { label: 'Every minute', value: 60000 },
      { label: 'Every 5 minutes', value: 300000 },
      { label: 'Every 10 minutes', value: 600000 },
    ];

    const timeSpanUnits = [
      { label: 'seconds ago', value: 's' },
      { label: 'minutes ago', value: 'm' },
      { label: 'hours ago', value: 'h' },
      { label: 'days ago', value: 'd' },
      { label: 'weeks ago', value: 'w' },
      { label: 'months ago', value: 'M' },
      { label: 'years ago', value: 'y' },
    ];
    if (!model.indexing) {
      const handleActivate = () => {
        this.props.onChange({ indexing: true });
      };
      return (
        <div className="summarize__indexOptions">
          <div className="summarize__explanation">
            <p>
              <strong>Indexing is currently de-activated.</strong>
            </p>
            <p>
              This means the data is being generated live from Elasticsearch and
              sorting on columns is disabled. Unfortunately, Elasticsarch can not
              sort columns with pipeline aggregations since they are run in the
              reduce phase after other aggregations have already completed.  By
              enabling this option, the results will be served from a separate index,
              created by an "background" process on the Kibana server.
            </p>
            <p>Click the "Activate Indexing" button below to configure this background
            process. <em>The indexing process won't begin until this visualization is saved.</em></p>
            <p>
              <button
                onClick={handleActivate}
                className="thor__button-solid-primary">Activate Indexing</button>
            </p>
          </div>
        </div>
      );
    }
    const handleDeactivate = () => {
      this.props.onChange({ indexing: false });
    };
    return(
        <div className="summarize__indexOptions">
          <div className="summarize__explanation">
            <p>
              <strong>Indexing is currently active.</strong>
            </p>
            <p>
              <button
                onClick={handleDeactivate}
                className="thor__button-solid-danger">Deactivate Indexing</button>
            </p>
            <p>The data for this visualization is created in the background
              it will not be relative to the Kibana "time picker", global filters
              will still be applied. The time range will be relative to the Elasticsearch
              server (which usually is UTC). This normally isn't a problem if all your systems
             are using UTC for their timestamps.</p>
          </div>
          <div className="summarize__indexingSettings">
            <div className="vis_editor__row">
              <div className="vis_editor__label">From</div>
              <input
                type="number"
                step={1}
                className="vis_editor__input-grows"
                onChange={handleTextChange('from_value')}
                value={model.from_value} />
              <div className="vis_editor__row_item" style={{ marginLeft: 5 }}>
                <Select
                  clearable={false}
                  options={timeSpanUnits}
                  onChange={handleSelectChange('from_units')}
                  value={model.from_units}/>
              </div>
              <div className="vis_editor__label">To</div>
              <input
                type="number"
                step={1}
                className="vis_editor__input-grows"
                onChange={handleTextChange('to_value')}
                value={model.to_value} />
              <div className="vis_editor__row_item" style={{ marginLeft: 5 }}>
                <Select
                  clearable={false}
                  options={timeSpanUnits}
                  onChange={handleSelectChange('to_units')}
                  value={model.to_units}/>
              </div>
            </div>
            <div className="vis_editor__row">
              <div className="vis_editor__label">Target Index</div>
              <input
                type="text"
                className="vis_editor__input-grows"
                onChange={handleTextChange('target_index')}
                value={model.target_index} />
              <div className="vis_editor__label">Indexing Frequency</div>
              <div className="vis_editor__row_item">
                <Select
                  clearable={false}
                  options={frequencyOptions}
                  onChange={handleSelectChange('indexing_frequency')}
                  value={model.indexing_frequency}/>
              </div>
            </div>
          </div>
        </div>
    );
  }

}

IndexingOptions.propTypes = {
  fields: PropTypes.object,
  onChange: PropTypes.func,
  model: PropTypes.object,
  saved: PropTypes.bool,
  visData: PropTypes.object
};

export default IndexingOptions;

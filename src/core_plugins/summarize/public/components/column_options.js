import React, { Component, PropTypes } from 'react';
import DataFormatPicker from './data_format_picker';
import createSelectHandler from './lib/create_select_handler';
import createTextHandler from './lib/create_text_handler';
import FieldSelect from './aggs/field_select';
import Select from 'react-select';
import YesNo from './yes_no';

class ColumnOptions extends Component {
  render() {
    const defaults = { offset_time: '', value_template: '' };
    const model = { ...defaults, ...this.props.model };
    const handleSelectChange = createSelectHandler(this.props.onChange);
    const handleTextChange = createTextHandler(this.props.onChange);

    const functionOptions = [
      { label: 'Sum', value: 'sum' },
      { label: 'Max', value: 'max' },
      { label: 'Min', value: 'min' },
      { label: 'Avg', value: 'mean' },
      { label: 'Overall Sum', value: 'overall_sum' },
      { label: 'Overall Max', value: 'overall_max' },
      { label: 'Overall Min', value: 'overall_min' },
      { label: 'Overall Avg', value: 'overall_avg' },
      { label: 'Cumlative Sum', value: 'cumlative_sum' },
    ];

    return (
      <div>
        <div className="vis_editor__series_config-container">
          <div className="vis_editor__series_config-row">
            <DataFormatPicker
              onChange={handleSelectChange('formatter')}
              value={model.formatter}/>
            <div className="vis_editor__label">Template (eg.<code>{'{{value}}/s'}</code>)</div>
            <input
              className="vis_editor__input-grows"
              onChange={handleTextChange('value_template')}
              value={model.value_template}/>
          </div>
          <div className="vis_editor__series_config-row">
            <div className="vis_editor__label">Filter</div>
            <input
              className="vis_editor__input-grows"
              onChange={handleTextChange('filter')}
              value={model.filter}/>
            <div className="vis_editor__label">Show Trend Arrows</div>
            <YesNo
              value={model.trend_arrows}
              name="trend_arrows"
              onChange={this.props.onChange} />
          </div>
          <div className="vis_editor__series_config-row">
            <div className="vis_editor__label">Aggregate Column By</div>
            <div className="vis_editor__row_item">
              <FieldSelect
                fields={this.props.fields}
                indexPattern={this.props.panel.index_pattern}
                value={model.aggregate_by}
                onChange={handleSelectChange('aggregate_by')} />
            </div>
            <div className="vis_editor__label">Aggregate Function</div>
            <div className="vis_editor__row_item">
              <Select
                value={model.aggregate_function}
                options={functionOptions}
                onChange={handleSelectChange('aggregate_function')}/>
            </div>
          </div>
        </div>
      </div>
    );
  }

}

ColumnOptions.propTypes = {
  fields: PropTypes.object,
  model: PropTypes.object,
  panel: PropTypes.object,
  onChange: PropTypes.func
};

export default ColumnOptions;


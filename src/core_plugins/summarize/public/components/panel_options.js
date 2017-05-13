import React, { PropTypes } from 'react';
import FieldSelect from '../../../metrics/public/components/aggs/field_select';
import IndexPattern from '../../../metrics/public/components/index_pattern';
import createSelectHandler from '../../../metrics/public/components/lib/create_select_handler';
import createTextHandler from '../../../metrics/public/components/lib/create_text_handler';
import Select from 'react-select';
function PanelOptions(props) {
  const { model, fields, onChange } = props;
  const handleSelectChange = createSelectHandler(props.onChange);
  const handleTextChange = createTextHandler(props.onChange);
  const indexPattern = model.index_pattern;
  const label = model.label || '';
  const intervalOptions = [
    { label: 'Every 30 seconds', value: 30000 },
    { label: 'Every 1 Minute', value: 60000 },
    { label: 'Every 5 Minutes', value: 300000 },
    { label: 'Every 10 Minutes', value: 600000 },
  ];
  return (
    <div className="summarize__panelOptions">
      <div className="vis_editor__row">
        <div className="vis_editor__label">ID Field</div>
        <div className="vis_editor__row_item">
          <FieldSelect
            value={model.id_field}
            onChange={handleSelectChange('id_field')}
            fields={fields}
            indexPattern={indexPattern} />
        </div>
        <div className="vis_editor__label">Display Field</div>
        <div className="vis_editor__row_item">
          <FieldSelect
            value={model.display_field}
            onChange={handleSelectChange('display_field')}
            fields={fields}
            indexPattern={indexPattern} />
        </div>
        <div className="vis_editor__label">Label</div>
        <input
          type="text"
          className="vis_editor__input-grows"
          onChange={handleTextChange('label')}
          value={label} />
      </div>
      <IndexPattern
        model={model}
        fields={fields}
        onChange={onChange} />
      <div className="vis_editor__row">
        <div className="vis_editor__label">Index to write summarized results</div>
        <input
          type="text"
          className="vis_editor__input-grows"
          onChange={handleTextChange('target_index')}
          value={model.target_index} />
        <div className="vis_editor__label">Indexing Interval</div>
        <div className="vis_editor__row_item">
          <Select
            options={intervalOptions}
            onChange={handleSelectChange('run_interval')}
            value={model.run_interval} />
        </div>
      </div>
    </div>
  );
}

PanelOptions.propTypes = {
  fields: PropTypes.object,
  model: PropTypes.object,
  visData: PropTypes.object,
  onChange: PropTypes.func
};

export default PanelOptions;

import React, { PropTypes } from 'react';
import FieldSelect from './aggs/field_select';
import IndexPattern from '../../../metrics/public/components/index_pattern';
import Select from 'react-select';
import createSelectHandler from './lib/create_select_handler';
import createTextHandler from './lib/create_text_handler';
import YesNo from './yes_no';
function PanelOptions(props) {
  const { dashboards, model, fields, onChange } = props;
  const handleSelectChange = createSelectHandler(props.onChange);
  const handleTextChange = createTextHandler(props.onChange);
  const indexPattern = model.index_pattern;
  const label = model.label || '';
  const dashboardOptions = dashboards.map(doc => {
    return {
      label: doc.title,
      value: doc.id
    };
  });
  let fieldIdClassName;
  if (!model.id_field) {
    fieldIdClassName = 'summarize__selectError';
  }
  return (
    <div className="summarize__panelOptions">
      <div className="vis_editor__row">
        <div className="vis_editor__label">ID Field</div>
        <div className="vis_editor__row_item">
          <FieldSelect
            className={fieldIdClassName}
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
        <div className="vis_editor__label">Number of Rows to Display</div>
        <input
          type="number" step={1}
          className="vis_editor__input"
          onChange={handleTextChange('page_size')}
          size={3}
          value={model.page_size}/>
        <div className="vis_editor__label">Panel Filter</div>
        <input
          type="text"
          className="vis_editor__input-grows"
          onChange={handleTextChange('filter')}
          value={model.filter}/>
        <div className="vis_editor__label">Ignore Global Filter</div>
        <YesNo
          value={model.ignore_global_filter}
          name="ignore_global_filter"
          onChange={props.onChange}/>
      </div>
      <div className="vis_editor__row">
        <div className="vis_editor__label">Drilldown Dashboard</div>
        <div className="vis_editor__row_item">
          <Select
            onChange={handleSelectChange('drilldown_dashboard')}
            options={dashboardOptions}
            value={model.drilldown_dashboard} />
        </div>
      </div>
    </div>
  );
}

PanelOptions.propTypes = {
  fields: PropTypes.object,
  model: PropTypes.object,
  visData: PropTypes.object,
  onChange: PropTypes.func,
  dashboards: PropTypes.array
};

export default PanelOptions;

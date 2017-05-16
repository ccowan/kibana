import React, { Component, PropTypes } from 'react';
import {
  handleAdd,
  handleDelete,
  handleChange
} from '../../../metrics/public/components/lib/collection_actions';
import { newColumnFn } from '../lib/new_column_fn';
import { reIdColumn } from '../lib/re_id_column';
import Sortable from 'react-anything-sortable';
import Column from './column';
class Columns extends Component {

  constructor(props) {
    super(props);
    this.renderRow = this.renderRow.bind(this);
  }

  handleClone(column) {
    const newColumn = reIdColumn(column);
    handleAdd.call(null, this.props, () => newColumn);
  }

  renderRow(row) {
    const { props } = this;
    const { fields, model, name } = props;
    return (
      <Column
        disableDelete={model[name].length < 2}
        fields={fields}
        key={row.id}
        onAdd={handleAdd.bind(null, props, newColumnFn)}
        onChange={handleChange.bind(null, props)}
        onClone={() => this.handleClone(row)}
        onDelete={handleDelete.bind(null, props, row)}
        model={row}
        panel={model}
        sortData={row.id} />
    );
  }

  render() {
    const { model, name } = this.props;
    const columns = model[name]
      .map(this.renderRow);
    const handleSort = (data) => {
      const columns = data.map(id => model[name].find(s => s.id === id));
      this.props.onChange({ columns });
    };
    return (
      <div
        className="vis_editor__container">
        <Sortable
          dynamic={true}
          direction="vertical"
          onSort={handleSort}
          sortHandle="vis_editor__sort">
          { columns }
        </Sortable>
      </div>
    );

  }

}

Columns.defaultProps = {
  name: 'columns'
};

Columns.propTypes = {
  name: PropTypes.string,
  fields: PropTypes.object,
  model: PropTypes.object,
  visData: PropTypes.object,
  onChnage: PropTypes.func
};

export default Columns;

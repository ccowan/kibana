/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import PropTypes from 'prop-types';
import React from 'react';
import {
  EuiComboBox,
} from '@elastic/eui';
import generateByTypeFilter from '../lib/generate_by_type_filter';

function FieldSelect(props) {
  const { type, fields, indexPattern, value, onChange, disabled } = props;
  if (type === 'count') {
    return null;
  }
  const options = (fields[indexPattern] || [])
    .filter(generateByTypeFilter(props.restrict))
    .map(field => {
      return { label: field.name, value: field.name };
    });

  const selectedOption = options.find(option => {
    return value === option.value;
  });
  const selectedOptions = selectedOption ? [selectedOption] : [];

  return (
    <div data-test-subj="fieldSelector" className="vis_editor__row_item">
      <EuiComboBox
        placeholder="Select field..."
        isDisabled={disabled}
        options={options}
        selectedOptions={selectedOptions}
        onChange={onChange}
        singleSelection={true}
      />
    </div>
  );
}

FieldSelect.defaultProps = {
  indexPattern: '*',
  disabled: false,
  restrict: 'none'
};

FieldSelect.propTypes = {
  disabled: PropTypes.bool,
  fields: PropTypes.object,
  id: PropTypes.string,
  indexPattern: PropTypes.string,
  onChange: PropTypes.func,
  restrict: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.string
};

export default FieldSelect;

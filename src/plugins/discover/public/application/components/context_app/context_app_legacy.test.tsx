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

import React from 'react';
import { ContextAppLegacy } from './context_app_legacy';
import { IIndexPattern } from '../../../../../data/common/index_patterns';
import { mountWithIntl } from 'test_utils/enzyme_helpers';
import { DocTableLegacy } from '../../angular/doc_table/create_doc_table_react';
import { findTestSubject } from '@elastic/eui/lib/test';

describe('ContextAppLegacy test', () => {
  const hit = {
    _id: '123',
    _index: 'test_index',
    _score: null,
    _version: 1,
    _source: {
      category: ["Men's Clothing"],
      currency: 'EUR',
      customer_first_name: 'Walker',
      customer_full_name: 'Walker Texas Ranger',
      customer_gender: 'MALE',
      customer_last_name: 'Ranger',
    },
    fields: [{ order_date: ['2020-10-19T13:35:02.000Z'] }],
    sort: [1603114502000, 2092],
  };
  const indexPattern = {
    id: 'test_index_pattern',
  } as IIndexPattern;
  const defaultProps = {
    columns: ['_source'],
    filter: () => {},
    hits: [hit],
    infiniteScroll: true,
    sorting: ['order_date', 'desc'],
    minimumVisibleRows: 5,
    indexPattern,
    status: 'loaded',
  };

  it('renders correctly', () => {
    const component = mountWithIntl(<ContextAppLegacy {...defaultProps} />);
    expect(component).toMatchSnapshot();
    expect(component.find(DocTableLegacy).length).toBe(1);
    const loadingIndicator = findTestSubject(component, 'contextApp_loadingIndicator');
    expect(loadingIndicator.length).toBe(0);
  });

  it('renders loading indicator', () => {
    const props = { ...defaultProps };
    props.status = 'loading';
    const component = mountWithIntl(<ContextAppLegacy {...props} />);
    expect(component).toMatchSnapshot();
    expect(component.find('DocTableLegacy').length).toBe(0);
    const loadingIndicator = findTestSubject(component, 'contextApp_loadingIndicator');
    expect(loadingIndicator.length).toBe(1);
  });
});

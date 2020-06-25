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
import { mountWithIntl } from 'test_utils/enzyme_helpers';
import { PercentileAgg } from './percentile';
import { PositiveRateAgg } from './positive_rate';
import { PercentileRankAgg } from './percentile_rank';
import { StandardAgg } from './std_agg';
import { StandardDeviationAgg } from './std_deviation';
import { TopHitAgg } from './top_hit';
import { FilterRatioAgg } from './filter_ratio';
import { ScriptField } from './script_field';
import { SCRIPTED_FIELD_VALUE } from '../../../../common/constants';
import { FIELDS, METRIC, SERIES, PANEL } from '../../../test_utils';
import { AggComponent } from './types';

const runTestFor = (Component: AggComponent, aggType: string) => {
  describe(aggType, () => {
    const metric = {
      ...METRIC,
      type: aggType,
      field: SCRIPTED_FIELD_VALUE,
      script: 'doc["system.cpu.user.pct"].value * 100',
    };
    const series = { ...SERIES, metrics: [metric] };
    const panel = { ...PANEL, series };

    it('should have ScriptField component when script field selected', () => {
      const wrapper = mountWithIntl(
        <div>
          <Component
            onAdd={jest.fn()}
            onChange={jest.fn()}
            onDelete={jest.fn()}
            panel={panel}
            fields={FIELDS}
            model={metric}
            series={series}
            siblings={series.metrics}
            dragHandleProps={{}}
          />
        </div>
      );
      expect(wrapper.find(ScriptField).length).toBe(1);
      expect(wrapper.find(ScriptField).html()).not.toBe(null);
    });
    it('should NOT display ScriptField component when script field not selected', () => {
      const wrapper = mountWithIntl(
        <div>
          <Component
            onAdd={jest.fn()}
            onChange={jest.fn()}
            onDelete={jest.fn()}
            panel={PANEL}
            fields={FIELDS}
            model={METRIC}
            series={SERIES}
            siblings={SERIES.metrics}
            dragHandleProps={{}}
          />
        </div>
      );
      expect(wrapper.find(ScriptField).html()).toBe(null);
    });
  });
};

describe('ScriptField', () => {
  runTestFor(PercentileAgg, 'percentile');
  runTestFor(PercentileRankAgg, 'percentile_rank');
  runTestFor(PositiveRateAgg, 'positive_rate');
  runTestFor(StandardAgg, 'avg');
  runTestFor(StandardDeviationAgg, 'std_deviation');
  runTestFor(TopHitAgg, 'top_hit');

  describe('count', () => {
    const metric = {
      type: 'count',
    };
    const series = { ...SERIES, metrics: [metric] };
    const panel = { ...PANEL, series };
    it('should NOT display ScriptField component when script field not selected', () => {
      const wrapper = mountWithIntl(
        <div>
          <StandardAgg
            onAdd={jest.fn()}
            onChange={jest.fn()}
            onDelete={jest.fn()}
            panel={panel}
            fields={FIELDS}
            model={metric}
            series={series}
            siblings={series.metrics}
            dragHandleProps={{}}
          />
        </div>
      );
      expect(wrapper.find(ScriptField).html()).toBe(null);
    });
  });
  describe('filter_ratio', () => {
    it('should display ScriptField component when script field selected', () => {
      const metric = {
        type: 'filter_ratio',
        denominator: '*',
        numerator: '*',
        metric_agg: 'avg',
        field: SCRIPTED_FIELD_VALUE,
        script: 'doc["system.cpu.user.pct"]',
      };
      const series = { ...SERIES, metrics: [metric] };
      const panel = { ...PANEL, series };
      const wrapper = mountWithIntl(
        <div>
          <FilterRatioAgg
            onAdd={jest.fn()}
            onChange={jest.fn()}
            onDelete={jest.fn()}
            panel={panel}
            fields={FIELDS}
            model={metric}
            series={series}
            siblings={series.metrics}
            dragHandleProps={{}}
          />
        </div>
      );
      expect(wrapper.find(ScriptField).length).toBe(1);
      expect(wrapper.find(ScriptField).html()).not.toBe(null);
    });
    it('should NOT display ScriptField component when count selected as agg', () => {
      const metric = {
        type: 'filter_ratio',
        denominator: '*',
        numerator: '*',
        metric_agg: 'count',
      };
      const series = { ...SERIES, metrics: [metric] };
      const panel = { ...PANEL, series };
      const wrapper = mountWithIntl(
        <div>
          <FilterRatioAgg
            onAdd={jest.fn()}
            onChange={jest.fn()}
            onDelete={jest.fn()}
            panel={panel}
            fields={FIELDS}
            model={metric}
            series={series}
            siblings={series.metrics}
            dragHandleProps={{}}
          />
        </div>
      );
      expect(wrapper.find(ScriptField).html()).toBe(null);
    });
    it('should NOT display ScriptField component when script field is NOT selected', () => {
      const metric = {
        type: 'filter_ratio',
        denominator: '*',
        numerator: '*',
        metric_agg: 'avg',
        field: 'system.cpu.user.pct',
      };
      const series = { ...SERIES, metrics: [metric] };
      const panel = { ...PANEL, series };
      const wrapper = mountWithIntl(
        <div>
          <FilterRatioAgg
            onAdd={jest.fn()}
            onChange={jest.fn()}
            onDelete={jest.fn()}
            panel={panel}
            fields={FIELDS}
            model={metric}
            series={series}
            siblings={series.metrics}
            dragHandleProps={{}}
          />
        </div>
      );
      expect(wrapper.find(ScriptField).html()).toBe(null);
    });
  });
});

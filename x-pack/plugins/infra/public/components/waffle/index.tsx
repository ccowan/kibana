/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { EuiButton, EuiEmptyPrompt } from '@elastic/eui';
import { get, last, max, min } from 'lodash';
import React from 'react';
import styled from 'styled-components';
import { InfraMetricType } from '../../../common/graphql/types';
import {
  isWaffleMapGroupWithGroups,
  isWaffleMapGroupWithNodes,
} from '../../containers/waffle/type_guards';
import {
  InfraWaffleData,
  InfraWaffleMapBounds,
  InfraWaffleMapFormatterType,
  InfraWaffleMapGroup,
  InfraWaffleMapOptions,
} from '../../lib/lib';
import { createFormatter } from '../../utils/formatters';
import { AutoSizer } from '../auto_sizer';
import { InfraLoadingPanel } from '../loading';
import { GroupOfGroups } from './group_of_groups';
import { GroupOfNodes } from './group_of_nodes';
import { Legend } from './legend';
import { applyWaffleMapLayout } from './lib/apply_wafflemap_layout';

interface Props {
  options: InfraWaffleMapOptions;
  map: InfraWaffleData;
  loading: boolean;
  reload: () => void;
}

interface MetricFormatter {
  formatter: InfraWaffleMapFormatterType;
  template: string;
  bounds?: { min: number; max: number };
}

interface MetricFormatters {
  [key: string]: MetricFormatter;
}

const METRIC_FORMATTERS: MetricFormatters = {
  [InfraMetricType.count]: { formatter: InfraWaffleMapFormatterType.number, template: '{{value}}' },
  [InfraMetricType.cpu]: {
    formatter: InfraWaffleMapFormatterType.percent,
    template: '{{value}}',
    bounds: { min: 0, max: 1 },
  },
  [InfraMetricType.memory]: {
    formatter: InfraWaffleMapFormatterType.percent,
    template: '{{value}}',
    bounds: { min: 0, max: 1 },
  },
  [InfraMetricType.rx]: { formatter: InfraWaffleMapFormatterType.bits, template: '{{value}}/s' },
  [InfraMetricType.tx]: { formatter: InfraWaffleMapFormatterType.bits, template: '{{value}}/s' },
  [InfraMetricType.disk]: {
    formatter: InfraWaffleMapFormatterType.bytes,
    template: '{{value}}',
    bounds: { min: 0, max: 1 },
  },
};

const extractValuesFromMap = (groups: InfraWaffleMapGroup[], values: number[] = []): number[] => {
  return groups.reduce((acc: number[], group: InfraWaffleMapGroup) => {
    if (isWaffleMapGroupWithGroups(group)) {
      return acc.concat(extractValuesFromMap(group.groups, values));
    }
    if (isWaffleMapGroupWithNodes(group)) {
      return acc.concat(group.nodes.map(node => last(node.metrics).value));
    }
    return acc;
  }, values);
};

const calculateBoundsFromMap = (map: InfraWaffleData): InfraWaffleMapBounds => {
  const values = extractValuesFromMap(map);
  return { min: min(values), max: max(values) };
};

export class Waffle extends React.Component<Props, {}> {
  public render() {
    const { loading, map, reload } = this.props;
    if (loading) {
      return <InfraLoadingPanel height="100%" width="100%" text="Loading data" />;
    } else if (!loading && map && map.length === 0) {
      return (
        <EuiEmptyPrompt
          title={<h2>There is no data to display.</h2>}
          titleSize="m"
          body={<p>Try adjusting your time or filter.</p>}
          actions={
            <EuiButton
              iconType="refresh"
              color="primary"
              fill
              onClick={() => {
                reload();
              }}
            >
              Check for new data
            </EuiButton>
          }
        />
      );
    }
    const metric = last(this.props.options.metrics);
    const metricFormatter = get(
      METRIC_FORMATTERS,
      metric.type,
      METRIC_FORMATTERS[InfraMetricType.count]
    );
    const bounds = (metricFormatter && metricFormatter.bounds) || calculateBoundsFromMap(map);
    return (
      <AutoSizer content>
        {({ measureRef, content: { width = 0, height = 0 } }) => {
          const groupsWithLayout = applyWaffleMapLayout(map, width, height);
          return (
            <WaffleMapOuterContiner innerRef={(el: any) => measureRef(el)}>
              <WaffleMapInnerContainer>
                {groupsWithLayout.map(this.renderGroup(bounds))}
              </WaffleMapInnerContainer>
              <Legend
                formatter={this.formatter}
                bounds={bounds}
                legend={this.props.options.legend}
              />
            </WaffleMapOuterContiner>
          );
        }}
      </AutoSizer>
    );
  }

  // TODO: Change this to a real implimentation using the tickFormatter from the prototype as an example.
  private formatter = (val: string | number) => {
    const metric = last(this.props.options.metrics);
    const metricFormatter = get(
      METRIC_FORMATTERS,
      metric.type,
      METRIC_FORMATTERS[InfraMetricType.count]
    );
    if (val == null) {
      return '';
    }
    const formatter = createFormatter(metricFormatter.formatter, metricFormatter.template);
    return formatter(val);
  };

  private handleDrilldown() {
    return;
  }

  private renderGroup = (bounds: InfraWaffleMapBounds) => (group: InfraWaffleMapGroup) => {
    if (isWaffleMapGroupWithGroups(group)) {
      return (
        <GroupOfGroups
          onDrilldown={this.handleDrilldown}
          key={group.id}
          options={this.props.options}
          group={group}
          formatter={this.formatter}
          bounds={bounds}
        />
      );
    }
    if (isWaffleMapGroupWithNodes(group)) {
      return (
        <GroupOfNodes
          key={group.id}
          options={this.props.options}
          group={group}
          onDrilldown={this.handleDrilldown}
          formatter={this.formatter}
          isChild={false}
          bounds={bounds}
        />
      );
    }
  };
}

const WaffleMapOuterContiner = styled.div`
  flex: 1 0 0;
  display: flex;
  justify-content: center;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
`;

const WaffleMapInnerContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-content: flex-start;
  padding: 10px;
`;

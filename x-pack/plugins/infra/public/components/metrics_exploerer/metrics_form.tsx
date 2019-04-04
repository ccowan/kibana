/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  EuiButton,
  EuiComboBox,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiHorizontalRule,
  EuiSelect,
  EuiText,
} from '@elastic/eui';

import { FormattedMessage, InjectedIntl, injectI18n } from '@kbn/i18n/react';
import React, { useCallback } from 'react';
import { StaticIndexPatternField } from 'ui/index_patterns';
import { colorPalette, MetricsExplorerColorPalette } from '../../../common/color_palette';
import {
  MetricsExplorerAggregation,
  MetricsExplorerMetric,
} from '../../../server/routes/metrics_explorer/types';
import { MetricsExplorerColorPicker } from './color_picker';

interface Props {
  id: number;
  metric: MetricsExplorerMetric;
  intl: InjectedIntl;
  onChange: (id: number, metric: MetricsExplorerMetric) => void;
  onDelete: (id: number) => void;
  fields: StaticIndexPatternField[];
  isDeleteable: boolean;
}

const isMetricsExplorerAggregation = (subject: any): subject is MetricsExplorerAggregation => {
  return Object.keys(MetricsExplorerAggregation).includes(subject);
};

export const MetricForm = injectI18n(
  ({ fields, intl, onChange, onDelete, id, metric, isDeleteable }: Props) => {
    const intlPrefix = 'xpack.infra.metricsExplorer';

    const fieldLabel = intl.formatMessage({
      id: `${intlPrefix}.fieldLabel`,
      defaultMessage: 'Field',
    });

    const handleAggregationChange = useCallback(
      e =>
        onChange(id, {
          ...metric,
          aggregation:
            (isMetricsExplorerAggregation(e.target.value) && e.target.value) ||
            MetricsExplorerAggregation.count,
        }),
      [id, metric]
    );

    const handleFieldChange = useCallback(
      selectedOptions => {
        const field = (selectedOptions.length === 1 && selectedOptions[0].label) || null;
        if (field) {
          onChange(id, { ...metric, field });
        }
      },
      [id, metric]
    );

    const handleColorChange = useCallback(
      (color: MetricsExplorerColorPalette) => onChange(id, { ...metric, color }),
      [id, metric]
    );

    const handleMetricDelete = useCallback(() => onDelete(id), [id]);

    const fieldType =
      metric.aggregation === MetricsExplorerAggregation.cardinality ? 'string' : 'number';

    return (
      <div style={{ width: 300 }}>
        <EuiFormRow
          label={intl.formatMessage({
            id: `${intlPrefix}.aggregationLabel`,
            defaultMessage: 'Aggregation',
          })}
        >
          <EuiSelect
            value={metric.aggregation}
            options={Object.keys(MetricsExplorerAggregation).map(k => ({
              value: k,
              text: k,
            }))}
            onChange={handleAggregationChange}
          />
        </EuiFormRow>
        <EuiFormRow label={fieldLabel}>
          <EuiComboBox
            isDisabled={metric.aggregation === MetricsExplorerAggregation.count}
            placeholder={fieldLabel}
            fullWidth
            singleSelection={{ asPlainText: true }}
            selectedOptions={[{ label: metric.field || '' }]}
            options={fields
              .filter(f => f.aggregatable && f.type === fieldType)
              .map(f => ({ label: f.name }))}
            onChange={handleFieldChange}
            isClearable={false}
          />
        </EuiFormRow>
        <EuiFormRow>
          <EuiFlexGroup gutterSize="s">
            <EuiFlexItem grow={false}>
              <EuiText size="xs">
                <strong>
                  <FormattedMessage
                    id={`${intlPrefix}.seriesColorLabel`}
                    defaultMessage="Series Color"
                  />
                </strong>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <MetricsExplorerColorPicker
                value={metric.color || MetricsExplorerColorPalette.color0}
                onChange={handleColorChange}
                colorPalete={colorPalette}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFormRow>
        {isDeleteable && (
          <React.Fragment>
            <EuiHorizontalRule />
            <EuiButton fullWidth fill color="danger" onClick={handleMetricDelete}>
              <FormattedMessage
                id={`${intlPrefix}.deleteMetricButtonLabel`}
                defaultMessage="Delete Metric"
              />
            </EuiButton>
          </React.Fragment>
        )}
      </div>
    );
  }
);

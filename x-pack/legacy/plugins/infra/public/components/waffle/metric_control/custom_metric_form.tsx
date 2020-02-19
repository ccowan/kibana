/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React, { useState, useCallback } from 'react';
import uuid from 'uuid';
import {
  EuiForm,
  EuiButton,
  EuiButtonEmpty,
  EuiFormRow,
  EuiFieldText,
  EuiComboBox,
  EuiSelect,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiHorizontalRule,
  EuiPopoverTitle,
} from '@elastic/eui';
import { IFieldType } from 'src/plugins/data/public';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n/react';
import {
  SnapshotCustomAggregation,
  SnapshotCustomMetricInput,
  SNAPSHOT_CUSTOM_AGGREGATIONS,
  SnapshotCustomAggregationRT,
} from '../../../../common/http_api/snapshot_api';

interface SelectedOption {
  label: string;
}

const AGGREGATION_LABELS = {
  ['avg']: i18n.translate('xpack.infra.waffle.customMetrics.aggregationLables.avg', {
    defaultMessage: 'Average',
  }),
  ['max']: i18n.translate('xpack.infra.waffle.customMetrics.aggregationLables.max', {
    defaultMessage: 'Max',
  }),
  ['min']: i18n.translate('xpack.infra.waffle.customMetrics.aggregationLables.min', {
    defaultMessage: 'Min',
  }),
  ['rate']: i18n.translate('xpack.infra.waffle.customMetrics.aggregationLables.rate', {
    defaultMessage: 'Rate',
  }),
};

interface Props {
  metric?: SnapshotCustomMetricInput;
  fields: IFieldType[];
  customMetrics: SnapshotCustomMetricInput[];
  onChange: (metric: SnapshotCustomMetricInput) => void;
  onCancel: () => void;
}

export const CustomMetricForm = ({ onCancel, fields, onChange, metric }: Props) => {
  const [label, setLabel] = useState<string | undefined>(metric ? metric.label : void 0);
  const [aggregation, setAggregation] = useState<SnapshotCustomAggregation>(
    metric ? metric.aggregation : 'avg'
  );
  const [field, setField] = useState<string | undefined>(metric ? metric.field : void 0);

  const handleSubmit = useCallback(() => {
    if (metric && aggregation && field) {
      onChange({
        ...metric,
        label,
        aggregation,
        field,
      });
    } else if (aggregation && field) {
      const newMetric: SnapshotCustomMetricInput = {
        type: 'custom',
        id: uuid.v1(),
        label,
        aggregation,
        field,
      };
      onChange(newMetric);
    }
  }, [metric, aggregation, field, onChange, label]);

  const handleLabelChange = useCallback(
    e => {
      setLabel(e.target.value);
    },
    [setLabel]
  );

  const handleFieldChange = useCallback(
    (selectedOptions: SelectedOption[]) => {
      setField(selectedOptions[0].label);
    },
    [setField]
  );

  const handleAggregationChange = useCallback(
    e => {
      const value = e.target.value;
      const aggValue: SnapshotCustomAggregation = SnapshotCustomAggregationRT.is(value)
        ? value
        : 'avg';
      setAggregation(aggValue);
    },
    [setAggregation]
  );

  const fieldOptions = fields
    .filter(f => f.aggregatable && f.type === 'number' && !(field && field === f.name))
    .map(f => ({ label: f.name }));

  const aggregationOptions = SNAPSHOT_CUSTOM_AGGREGATIONS.map(k => ({
    text: AGGREGATION_LABELS[k as SnapshotCustomAggregation],
    value: k,
  }));

  const isSubmitDisabled = !field || !aggregation;

  const title = metric
    ? i18n.translate('xpack.waffle.customMetricPanelLabel.edit', {
        defaultMessage: 'Edit custom metric',
      })
    : i18n.translate('xpack.waffle.customMetricPanelLabel.add', {
        defaultMessage: 'Add custom metric',
      });

  return (
    <div style={{ width: 685 }}>
      <EuiForm>
        <EuiPopoverTitle>{title}</EuiPopoverTitle>
        <div style={{ padding: 16 }}>
          <EuiFormRow
            label={i18n.translate('xpack.waffle.customMetrics.metricLabel', {
              defaultMessage: 'Metric',
            })}
            display="rowCompressed"
            fullWidth
          >
            <EuiFlexGroup alignItems="center" gutterSize="s">
              <EuiFlexItem grow={false}>
                <EuiSelect
                  onChange={handleAggregationChange}
                  value={aggregation}
                  options={aggregationOptions}
                  fullWidth
                />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiText color="subdued">
                  <span>of</span>
                </EuiText>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiComboBox
                  fullWidth
                  placeholder={i18n.translate('xpack.infra.waffle.customMetrics.fieldPlaceholder', {
                    defaultMessage: 'Select a field',
                  })}
                  singleSelection={{ asPlainText: true }}
                  selectedOptions={field ? [{ label: field }] : []}
                  options={fieldOptions}
                  onChange={handleFieldChange}
                  isClearable={false}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFormRow>
          <EuiFormRow
            label={i18n.translate('xpack.waffle.customMetrics.labelLabel', {
              defaultMessage: 'Label (optional)',
            })}
            display="rowCompressed"
            fullWidth
          >
            <EuiFieldText
              name="label"
              placeholder={i18n.translate('xpack.waffle.customMetrics.labelPlaceholder', {
                defaultMessage: 'Choose a name to appear in the "Metric" dropdown',
              })}
              compressed
              value={label}
              fullWidth
              onChange={handleLabelChange}
            />
          </EuiFormRow>
        </div>
        <EuiHorizontalRule margin="xs" />
        <EuiFlexGroup style={{ padding: '6px 16px 16px' }} alignItems="center">
          <EuiFlexItem>
            <div>
              <EuiButtonEmpty onClick={onCancel} size="s" flush="left">
                <FormattedMessage
                  id="xpack.infra.waffle.customMetrics.cancelLabel"
                  defaultMessage="Cancel"
                />
              </EuiButtonEmpty>
            </div>
          </EuiFlexItem>
          <EuiFlexItem>
            <div style={{ textAlign: 'right' }}>
              <EuiButton
                type="submit"
                size="s"
                fill
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
              >
                <FormattedMessage
                  id="xpack.infra.waffle.customMetrics.submitLabel"
                  defaultMessage="Save"
                />
              </EuiButton>
            </div>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiForm>
    </div>
  );
};

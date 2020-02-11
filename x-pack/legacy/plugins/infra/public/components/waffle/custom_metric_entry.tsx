/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { useCallback } from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiButtonIcon, EuiButtonEmpty } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { SnapshotCustomMetricInput } from '../../../common/http_api/snapshot_api';

interface Props {
  metric: SnapshotCustomMetricInput;
  onEdit: () => void;
  onDelete: () => void;
}

export const getCustomMetricLabel = (metric: SnapshotCustomMetricInput) => {
  const METRIC_LABELS = {
    avg: i18n.translate('xpack.infra.waffle.aggregationNames.avg', {
      defaultMessage: 'Avg of {field}',
      values: { field: metric.field },
    }),
    max: i18n.translate('xpack.infra.waffle.aggregationNames.max', {
      defaultMessage: 'Max of {field}',
      values: { field: metric.field },
    }),
    min: i18n.translate('xpack.infra.waffle.aggregationNames.min', {
      defaultMessage: 'Min of {field}',
      values: { field: metric.field },
    }),
    rate: i18n.translate('xpack.infra.waffle.aggregationNames.rate', {
      defaultMessage: 'Rate of {field}',
      values: { field: metric.field },
    }),
  };
  return metric.label ? metric.label : METRIC_LABELS[metric.aggregation];
};

export const CustomMetricEntry = ({ metric, onEdit, onDelete }: Props) => {
  const label = getCustomMetricLabel(metric);
  const handleEdit = useCallback(
    e => {
      e.stopPropagation();
      onEdit();
    },
    [onEdit]
  );
  const handleDelete = useCallback(
    e => {
      e.stopPropagation();
      onDelete();
    },
    [onDelete]
  );
  return (
    <EuiFlexGroup gutterSize="none" alignItems="center">
      <EuiFlexItem>{label}</EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiButtonIcon iconType="pencil" onClick={handleEdit} />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiButtonIcon iconType="trash" onClick={handleDelete} />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  EuiContextMenuPanelDescriptor,
  EuiContextMenu,
  EuiPopover,
  EuiFilterButton,
  EuiFilterGroup,
  EuiIcon,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n/react';
import React, { useCallback, useState } from 'react';
import {
  InfraSnapshotMetricInput,
  InfraSnapshotMetricType,
  InfraNodeType,
  InfraSnapshotGroupbyInput,
} from '../../graphql/types';

interface Props {
  nodeType: InfraNodeType;
  changeNodeType: (nodeType: InfraNodeType) => void;
  changeGroupBy: (groupBy: InfraSnapshotGroupbyInput[]) => void;
  changeMetric: (metric: InfraSnapshotMetricInput) => void;
}

const navItems = [
  {
    id: InfraNodeType.host,
    label: i18n.translate('xpack.infra.waffle.nodeTypeSwitcher.hostsLabel', {
      defaultMessage: 'Hosts',
    }),
    icon: 'storage',
  },
  {
    id: InfraNodeType.pod,
    label: 'Kubernetes',
    icon: 'logoKubernetes',
  },
  {
    id: InfraNodeType.container,
    label: 'Docker',
    icon: 'logoDocker',
  },
];

export const WaffleNodeTypeSwitcher = ({
  changeNodeType,
  changeMetric,
  changeGroupBy,
  nodeType,
}: Props) => {
  const createClickHandlerFor = (id: InfraNodeType) => () => {
    changeNodeType(id);
    changeGroupBy([]);
    changeMetric({ type: InfraSnapshotMetricType.cpu });
  };
  const onClickDepends = [changeNodeType, changeGroupBy, changeMetric];
  const closePopover = () => setPopoerState(false);
  const openPopover = () => setPopoerState(true);
  const [isPopoverOpen, setPopoerState] = useState<boolean>(false);

  const panels: EuiContextMenuPanelDescriptor[] = [
    {
      id: 0,
      title: '',
      items: navItems.map(item => ({
        name: item.label,
        icon: item.icon,
        onClick: useCallback(createClickHandlerFor(item.id), onClickDepends),
      })),
    },
  ];

  const currentNodeType = navItems.find(item => item.id === nodeType);
  if (!currentNodeType) {
    throw new Error(
      i18n.translate('xpack.infra.waffle.nodeTypeSwitcher.error', {
        defaultMessage: '"{nodeType}" is not a valid node type.',
        values: { nodeType },
      })
    );
  }

  const button = (
    <EuiFilterGroup>
      <EuiFilterButton onClick={openPopover} hasActiveFilters>
        <FormattedMessage
          id="xpack.infra.waffle.nodeTypeSwitcher.filterLabel"
          defaultMessage="View"
        />
      </EuiFilterButton>
      <EuiFilterButton iconType="arrowDown" onClick={openPopover}>
        <EuiFlexGroup alignItems="center" gutterSize="s">
          <EuiFlexItem>
            <EuiIcon type={currentNodeType.icon} />
          </EuiFlexItem>
          <EuiFlexItem>{currentNodeType.label}</EuiFlexItem>
        </EuiFlexGroup>
      </EuiFilterButton>
    </EuiFilterGroup>
  );

  return (
    <EuiPopover
      isOpen={isPopoverOpen}
      id="nodeTypePanel"
      button={button}
      panelPaddingSize="none"
      closePopover={closePopover}
      anchorPosition="downLeft"
    >
      <EuiContextMenu initialPanelId={0} panels={panels} />
    </EuiPopover>
  );
};

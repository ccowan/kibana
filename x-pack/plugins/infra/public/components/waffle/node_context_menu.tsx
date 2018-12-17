/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { EuiContextMenu, EuiContextMenuPanelDescriptor, EuiPopover } from '@elastic/eui';
import { InjectedIntl, injectI18n } from '@kbn/i18n/react';
import React from 'react';

import { InfraNodeType, InfraTimerangeInput } from '../../graphql/types';
import { InfraWaffleMapNode, InfraWaffleMapOptions } from '../../lib/lib';
import { getNodeDetailUrl, getNodeLogsUrl } from '../../pages/link_to';

interface Props {
  options: InfraWaffleMapOptions;
  timeRange: InfraTimerangeInput;
  children: any;
  node: InfraWaffleMapNode;
  nodeType: InfraNodeType;
  isPopoverOpen: boolean;
  closePopover: () => void;
  intl: InjectedIntl;
}

export const NodeContextMenu = injectI18n(
  ({ options, timeRange, children, node, isPopoverOpen, closePopover, nodeType, intl }: Props) => {
    const nodeId = node.path.length > 0 ? node.path[node.path.length - 1].value : undefined;
    const nodeLogsUrl = nodeId
      ? getNodeLogsUrl({
          nodeType,
          nodeId,
          time: timeRange.to,
        })
      : undefined;
    const nodeDetailUrl = nodeId
      ? getNodeDetailUrl({
          nodeType,
          nodeId,
          from: timeRange.from,
          to: timeRange.to,
        })
      : undefined;

    const apmTracesUrl = {
      name: intl.formatMessage(
        {
          id: 'xpack.infra.nodeContextMenu.viewAPMTraces',
          defaultMessage: 'View {nodeType} APM traces',
        },
        { nodeType }
      ),
      href: `../app/apm#/?_g=()&kuery=${nodeField}~20~3A~20~22${node.id}~22`,
    };

    const panels: EuiContextMenuPanelDescriptor[] = [
      {
        id: 0,
        title: '',
        items: [
          ...(nodeLogsUrl
            ? [
                {
                  name: intl.formatMessage({
                    id: 'xpack.infra.nodeContextMenu.viewLogsName',
                    defaultMessage: 'View logs',
                  }),
                  href: nodeLogsUrl,
                },
              ]
            : []),
          ...(nodeDetailUrl
            ? [
                {
                  name: intl.formatMessage({
                    id: 'xpack.infra.nodeContextMenu.viewMetricsName',
                    defaultMessage: 'View metrics',
                  }),
                  href: nodeDetailUrl,
                },
              ]
            : []),
          ...[apmTracesUrl],
        ],
      },
    ];

    return (
      <EuiPopover
        closePopover={closePopover}
        id={`${node.pathId}-popover`}
        isOpen={isPopoverOpen}
        button={children}
        panelPaddingSize="none"
      >
        <EuiContextMenu initialPanelId={0} panels={panels} />
      </EuiPopover>
    );
  }
);

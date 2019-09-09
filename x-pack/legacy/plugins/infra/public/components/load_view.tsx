/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Fragment, useCallback, useState } from 'react';

import {
  EuiInMemoryTable,
  EuiButtonEmpty,
  EuiTitle,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';

interface Props {
  title?: string;
  views?: Array<{ name: string; id: string | number }>;
}

export const LoadView = ({
  title = i18n.translate('xpack.infra.openView.defaultTitle', { defaultMessage: 'Load View' }),
  views = [
    {
      id: 1,
      name: 'Web Frontends Pods by Node',
    },
    {
      id: 2,
      name: 'Database Pods by Node and Namespace',
    },
    {
      id: 3,
      name: 'Production Containers by Node',
    },
    {
      id: 4,
      name: 'Hosts by Availability Zone',
    },
  ],
}: Props) => {
  const [isFlyoutOpen, setFlyoutState] = useState<boolean>(false);
  const closeFlyout = useCallback(() => setFlyoutState(false), []);
  const openFlyout = useCallback(() => setFlyoutState(true), []);
  const search = {
    onChange: () => void 0,
    box: {
      incremental: true,
    },
  };
  const columns = [
    {
      field: 'name',
      name: i18n.translate('xpack.infra.openView.columnNames.name', { defaultMessage: 'Name' }),
      sortable: true,
      truncateText: true,
      render: (name: string) => {
        return <EuiButtonEmpty>{name}</EuiButtonEmpty>;
      },
    },
    {
      name: i18n.translate('xpack.infra.openView.columnNames.actions', {
        defaultMessage: 'Actions',
      }),
      actions: [
        {
          name: i18n.translate('xpack.infra.openView.actionNames.delete', {
            defaultMessage: 'Delete',
          }),
          description: i18n.translate('xpack.infra.openView.actionDescription.delete', {
            defaultMessage: 'Delete a view',
          }),
          icon: 'trash',
          color: 'danger',
          onClick: () => void 0,
        },
      ],
    },
  ];
  const flyout = (
    <EuiFlyout onClose={closeFlyout}>
      <EuiFlyoutHeader>
        <EuiTitle size="m">
          <h2>{title}</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiInMemoryTable
          items={views}
          columns={columns}
          loading={false}
          search={search}
          pagination={true}
          sorting={true}
        />
      </EuiFlyoutBody>
    </EuiFlyout>
  );
  return (
    <Fragment>
      <EuiButtonEmpty onClick={openFlyout}>{title}</EuiButtonEmpty>
      {isFlyoutOpen ? flyout : null}
    </Fragment>
  );
};

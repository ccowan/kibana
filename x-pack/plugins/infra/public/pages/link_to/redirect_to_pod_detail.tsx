/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { Redirect, RouteComponentProps } from 'react-router-dom';

import { LoadingPage } from '../../components/loading_page';
import { WithSource } from '../../containers/with_source';

export const RedirectToPodDetail = ({ match, location }: RouteComponentProps<{ name: string }>) => (
  <WithSource>
    {({ configuredFields }) => {
      if (!configuredFields) {
        return <LoadingPage message="Loading pod details" />;
      }

      return <Redirect to={`/metrics/pod/${match.params.name}`} />;
    }}
  </WithSource>
);

export const getPodDetailUrl = ({ name }: { name: string }) => `#/link-to/pod-detail/${name}`;

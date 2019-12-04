/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { TSVBMetricModelCreator, TSVBMetricModel } from '../../../types';

export const awsEC2CpuUtilization: TSVBMetricModelCreator = (
  timeField,
  indexPattern
): TSVBMetricModel => ({
  id: 'awsEC2CpuUtilization',
  requires: ['aws.ec2'],
  index_pattern: indexPattern,
  interval: '>=300s',
  time_field: timeField,
  type: 'timeseries',
  series: [
    {
      id: 'total',
      split_mode: 'everything',
      metrics: [
        {
          field: 'aws.ec2.cpu.total.pct',
          id: 'avg-cpu',
          type: 'avg',
        },
        {
          id: 'convert-to-percent',
          script: 'params.avg / 100',
          type: 'calculation',
          variables: [
            {
              field: 'avg-cpu',
              id: 'var-avg',
              name: 'avg',
            },
          ],
        },
      ],
    },
  ],
});

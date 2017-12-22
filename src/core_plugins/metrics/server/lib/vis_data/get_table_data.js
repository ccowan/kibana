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

import buildRequestBody from './table/build_request_body';
import handleErrorResponse from './handle_error_response';
import { get } from 'lodash';
import processBucket from './table/process_bucket';
export async function getTableData(req, panel) {
  const { callWithRequest } = req.server.plugins.elasticsearch.getCluster('data');
  const params = {
    index: panel.index_pattern,
    body: buildRequestBody(req, panel)
  };
  try {
    const resp = await callWithRequest(req, 'search', params);
    const buckets = get(resp, 'aggregations.pivot.buckets', []);
    return { type: 'table', series: buckets.map(processBucket(panel)), meta: { request: params.body, response: resp } };
  } catch (err) {
    if (err.body) {
      err.response = err.body;
      return { type: 'table', ...handleErrorResponse(panel)(err), meta: { request: params.body } };
    }
  }
}

/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { DefaultItemIconButtonAction } from '@elastic/eui/src/components/basic_table/action_types';
import { Dispatch } from 'react';
import { Case } from '../../../../containers/case/types';

import * as i18n from './translations';
import { UpdateCase } from '../../../../containers/case/use_get_cases';

interface GetActions {
  caseStatus: string;
  dispatchUpdate: Dispatch<Omit<UpdateCase, 'refetchCasesStatus'>>;
  deleteCaseOnClick: (deleteCase: Case) => void;
}

export const getActions = ({
  caseStatus,
  dispatchUpdate,
  deleteCaseOnClick,
}: GetActions): Array<DefaultItemIconButtonAction<Case>> => [
  {
    description: i18n.DELETE,
    icon: 'trash',
    name: i18n.DELETE,
    onClick: deleteCaseOnClick,
    type: 'icon',
    'data-test-subj': 'action-delete',
  },
  caseStatus === 'open'
    ? {
        description: i18n.CLOSE_CASE,
        icon: 'folderCheck',
        name: i18n.CLOSE_CASE,
        onClick: (theCase: Case) =>
          dispatchUpdate({
            updateKey: 'status',
            updateValue: 'closed',
            caseId: theCase.id,
            version: theCase.version,
          }),
        type: 'icon',
        'data-test-subj': 'action-close',
      }
    : {
        description: i18n.REOPEN_CASE,
        icon: 'folderExclamation',
        name: i18n.REOPEN_CASE,
        onClick: (theCase: Case) =>
          dispatchUpdate({
            updateKey: 'status',
            updateValue: 'open',
            caseId: theCase.id,
            version: theCase.version,
          }),
        type: 'icon',
        'data-test-subj': 'action-open',
      },
];

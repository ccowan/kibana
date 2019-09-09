/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Fragment, useState, useCallback, ChangeEvent } from 'react';

import {
  EuiButtonEmpty,
  EuiButton,
  EuiFormRow,
  EuiFieldText,
  EuiModal,
  EuiModalBody,
  EuiModalHeader,
  EuiModalFooter,
  EuiModalHeaderTitle,
  EuiOverlayMask,
  EuiSpacer,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n/react';

interface Props {
  buttonText?: string;
  formTitle?: string;
  formDescription?: string;
  onSave?: (name: string) => void;
}

export const SaveView = ({
  buttonText = i18n.translate('xpack.infra.saveView.defaultButtonText', {
    defaultMessage: 'Save View',
  }),
  formDescription = i18n.translate('xpack.infra.saveView.defaultFormdescription', {
    defaultMessage: 'Save your current view so you can recall it in the future.',
  }),
  formTitle = i18n.translate('xpack.infra.saveView.defaultFormTitle', {
    defaultMessage: 'Save View',
  }),
  onSave = () => void 0,
}: Props) => {
  const [isModalOpen, setOpenState] = useState<boolean>(false);
  const [draftName, setDraftName] = useState<string>('');

  const closeModal = useCallback(() => setOpenState(false), []);
  const openModal = useCallback(() => setOpenState(true), []);

  const handleSaveAndCloseModal = useCallback(() => {
    onSave(draftName);
    setDraftName('');
    closeModal();
  }, [onSave, closeModal]);

  const handleTextFieldChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setDraftName(e.target.value);
  }, []);

  const modal = (
    <EuiOverlayMask>
      <EuiModal onClose={closeModal}>
        <EuiModalHeader>
          <EuiModalHeaderTitle>{formTitle}</EuiModalHeaderTitle>
        </EuiModalHeader>
        <EuiModalBody>
          <p>{formDescription}</p>
          <EuiSpacer size="m" />
          <EuiFormRow
            label={i18n.translate('xpack.infra.saveView.nameFieldLabel', {
              defaultMessage: 'Name',
            })}
            fullWidth
          >
            <EuiFieldText
              name="name"
              value={draftName}
              onChange={handleTextFieldChange}
              fullWidth
            />
          </EuiFormRow>
        </EuiModalBody>
        <EuiModalFooter>
          <EuiButtonEmpty onClick={closeModal}>Cancel</EuiButtonEmpty>
          <EuiButton onClick={handleSaveAndCloseModal} fill>
            <FormattedMessage id="xpack.infra.saveView.saveButtonText" defaultMessage="Save" />
          </EuiButton>
        </EuiModalFooter>
      </EuiModal>
    </EuiOverlayMask>
  );
  return (
    <Fragment>
      <EuiButtonEmpty onClick={openModal}>{buttonText}</EuiButtonEmpty>
      {isModalOpen ? modal : null}
    </Fragment>
  );
};

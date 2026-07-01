import { useAlert } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    CircularLoader,
    IconDelete16,
    MenuItem,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
    NoticeBox,
} from '@dhis2/ui'
import React, { useState } from 'react'
import {
    isMaybeStillProcessingError,
    useDeleteModelMutation,
    useSectionHandle,
} from '../../../lib'
import { ModelSection } from '../../../types'
import classes from './DeleteAction.module.css'

export function DeleteAction({
    disabled,
    modelId,
    modelDisplayName,
    onCancel,
    onDeleteSuccess,
    section,
}: {
    disabled: boolean
    modelId: string
    modelDisplayName: string
    onCancel: () => void
    onDeleteSuccess: () => void
    section?: ModelSection
}) {
    const [showConfirmationDialog, setShowConfirmationDialog] = useState(false)
    const deleteAndClose = () => {
        setShowConfirmationDialog(false)
        onDeleteSuccess()
    }
    const closeAndCancel = () => {
        setShowConfirmationDialog(false)
        onCancel()
    }

    return (
        <>
            <MenuItem
                dense
                dataTest={'delete-action'}
                destructive
                disabled={disabled}
                label={i18n.t('Delete')}
                icon={<IconDelete16 />}
                onClick={() => setShowConfirmationDialog(true)}
            />

            {showConfirmationDialog && (
                <ConfirmationDialog
                    modelId={modelId}
                    modelDisplayName={modelDisplayName}
                    onDeleteSuccess={deleteAndClose}
                    onCancel={closeAndCancel}
                    section={section}
                />
            )}
        </>
    )
}

function ConfirmationDialog({
    modelId,
    modelDisplayName,
    onCancel,
    onDeleteSuccess,
    section,
}: {
    modelId: string
    modelDisplayName: string
    onCancel: () => void
    onDeleteSuccess: () => void
    section?: ModelSection
}) {
    const sectionFromHandle = useSectionHandle()
    const sectionOrSectionFromHandle = section ?? sectionFromHandle

    const deleteModelMutation = useDeleteModelMutation(
        sectionOrSectionFromHandle!.namePlural,
        {
            onSuccess: () => {
                showDeletionSuccess()
                onDeleteSuccess()
            },
        }
    )

    const { show: showDeletionSuccess } = useAlert(
        () =>
            i18n.t('Successfully deleted {{modelType}} "{{displayName}}"', {
                displayName: modelDisplayName,
                modelType: sectionOrSectionFromHandle?.title ?? '',
            }),
        { success: true }
    )

    const { error } = deleteModelMutation
    const modelType = sectionOrSectionFromHandle?.title ?? ''
    const errorReports = error?.details?.response?.errorReports
    const maybeStillProcessing = isMaybeStillProcessingError(error)
    return (
        <Modal dataTest="delete-confirmation-modal">
            <ModalTitle>
                {i18n.t(
                    'Are you sure that you want to delete "{{- displayName}}"?',
                    { displayName: modelDisplayName }
                )}
            </ModalTitle>

            {!!error && (
                <ModalContent>
                    <NoticeBox
                        warning={maybeStillProcessing}
                        error={!maybeStillProcessing}
                        title={
                            maybeStillProcessing
                                ? i18n.t(
                                      'The deletion may still be in progress'
                                  )
                                : i18n.t(
                                      'Something went wrong deleting the {{modelType}}',
                                      { modelType }
                                  )
                        }
                    >
                        {maybeStillProcessing ? (
                            <div>
                                {i18n.t(
                                    'The request to delete {{modelType}} "{{displayName}}" timed out, but the server may still be processing it. Refresh the list in a moment to check whether it was deleted before trying again.',
                                    { displayName: modelDisplayName, modelType }
                                )}
                            </div>
                        ) : (
                            <>
                                <div>
                                    {i18n.t(
                                        'Failed to delete {{modelType}} "{{displayName}}"! {{messages}}',
                                        {
                                            displayName: modelDisplayName,
                                            modelType,
                                            messages:
                                                error?.details?.message ?? '',
                                        }
                                    )}
                                </div>

                                {!!errorReports?.length && (
                                    <ul>
                                        {errorReports.map(({ message }) => (
                                            <li key={message}>{message}</li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        )}
                    </NoticeBox>
                </ModalContent>
            )}

            <ModalActions>
                <ButtonStrip>
                    <Button
                        disabled={deleteModelMutation.isLoading}
                        destructive
                        onClick={() =>
                            deleteModelMutation.mutate({
                                id: modelId,
                                displayName: modelDisplayName,
                            })
                        }
                    >
                        {deleteModelMutation.isLoading && (
                            <span className={classes.deleteButtonLoadingIcon}>
                                <CircularLoader extrasmall />
                            </span>
                        )}

                        {deleteModelMutation.isError
                            ? i18n.t('Try again')
                            : i18n.t('Confirm deletion')}
                    </Button>

                    <Button
                        disabled={deleteModelMutation.isLoading}
                        onClick={onCancel}
                    >
                        {i18n.t('Cancel')}
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}

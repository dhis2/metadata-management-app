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
    useDeleteModelMutation,
    useModelSectionHandleOrThrow,
} from '../../../lib'
import classes from './DeleteAction.module.css'

export function DeleteAction({
    disabled,
    modelId,
    modelDisplayName,
    onCancel,
    onDeleteSuccess,
}: {
    disabled: boolean
    modelId: string
    modelDisplayName: string
    onCancel: () => void
    onDeleteSuccess: () => void
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
}: {
    modelId: string
    modelDisplayName: string
    onCancel: () => void
    onDeleteSuccess: () => void
}) {
    const section = useModelSectionHandleOrThrow()

    const deleteModelMutation = useDeleteModelMutation(section.namePlural, {
        onSuccess: () => {
            showDeletionSuccess()
            onDeleteSuccess()
        },
    })

    const { show: showDeletionSuccess } = useAlert(
        () =>
            i18n.t('Successfully deleted {{modelType}} "{{displayName}}"', {
                displayName: modelDisplayName,
                modelType: section.title,
            }),
        { success: true }
    )

    const errorReports =
        deleteModelMutation.error?.details?.response?.errorReports
    return (
        <Modal dataTest="delete-confirmation-modal">
            <ModalTitle>
                {i18n.t(
                    'Are you sure that you want to delete "{{- displayName}}"?',
                    { displayName: modelDisplayName }
                )}
            </ModalTitle>

            {!!deleteModelMutation.error && (
                <ModalContent>
                    <NoticeBox
                        error
                        title={i18n.t(
                            'Something went wrong deleting the {{modelType}}',
                            { modelType: section.title }
                        )}
                    >
                        <div>
                            {i18n.t(
                                'Failed to delete {{modelType}} "{{displayName}}"! {{messages}}',
                                {
                                    displayName: modelDisplayName,
                                    modelType: section.title,
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

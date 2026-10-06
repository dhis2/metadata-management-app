import { useAlert } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
} from '@dhis2/ui'
import React from 'react'
import { useSchemaFromHandle } from '../../../lib'
import { useBulkDeleteMutation } from './useBulkDeleteMutation'

type BulkDeleteDialogProps = {
    selectedModels: Set<string>
    onClose: () => void
    onDeleteSuccess: () => void
}

export const BulkDeleteDialog = ({
    selectedModels,
    onClose,
    onDeleteSuccess,
}: BulkDeleteDialogProps) => {
    const schema = useSchemaFromHandle()
    const number = selectedModels.size

    const { show: showSuccessAlert } = useAlert(
        i18n.t('Successfully deleted {{number}} items', { number }),
        { success: true }
    )
    const { show: showErrorAlert } = useAlert(
        i18n.t('Some items could not be deleted'),
        { critical: true }
    )

    const mutation = useBulkDeleteMutation(schema.plural, {
        onSuccess: () => {
            showSuccessAlert()
            onDeleteSuccess()
            onClose()
        },
        onError: () => {
            showErrorAlert()
            onDeleteSuccess()
            onClose()
        },
    })

    return (
        <Modal onClose={onClose} dataTest="bulk-delete-dialog">
            <ModalTitle>
                {i18n.t('Delete {{number}} items', { number })}
            </ModalTitle>
            <ModalContent>
                {i18n.t(
                    'Are you sure you want to delete these {{number}} items? This cannot be undone.',
                    { number }
                )}
            </ModalContent>
            <ModalActions>
                <ButtonStrip>
                    <Button
                        secondary
                        onClick={onClose}
                        disabled={mutation.isLoading}
                    >
                        {i18n.t('Cancel')}
                    </Button>
                    <Button
                        destructive
                        loading={mutation.isLoading}
                        onClick={() =>
                            mutation.mutate({
                                ids: Array.from(selectedModels),
                            })
                        }
                        dataTest="bulk-delete-confirm-button"
                    >
                        {i18n.t('Delete')}
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}

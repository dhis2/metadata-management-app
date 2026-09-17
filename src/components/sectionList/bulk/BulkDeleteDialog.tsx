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
import React, { useState } from 'react'
import { useSchemaFromHandle } from '../../../lib'
import { BulkDeleteErrorsDialog } from './BulkDeleteErrorsDialog'
import {
    BulkDeleteResult,
    useBulkDeleteMutation,
} from './useBulkDeleteMutation'

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
    const [failedResults, setFailedResults] = useState<BulkDeleteResult[]>()

    const { show: showSuccessAlert } = useAlert(
        i18n.t('Successfully deleted {{number}} items', { number }),
        { success: true }
    )

    const mutation = useBulkDeleteMutation(schema.plural, {
        onSuccess: (results) => {
            const failed = results.filter(
                (result) => result.status === 'rejected'
            )
            if (failed.length === 0) {
                showSuccessAlert()
                onDeleteSuccess()
                onClose()
            } else {
                // Defer onDeleteSuccess (cache invalidation + clearing the
                // selection) until the errors dialog is closed: clearing the
                // selection now would drop selectedModels to empty, which
                // unmounts the toolbar's selected-state view (and this
                // dialog along with it) before the user ever sees the error.
                setFailedResults(results)
            }
        },
    })

    if (failedResults) {
        return (
            <BulkDeleteErrorsDialog
                schema={schema}
                results={failedResults}
                onClose={() => {
                    onDeleteSuccess()
                    onClose()
                }}
            />
        )
    }

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

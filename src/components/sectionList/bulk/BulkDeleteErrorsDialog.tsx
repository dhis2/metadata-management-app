import i18n from '@dhis2/d2-i18n'
import {
    Button,
    IconChevronDown16,
    IconChevronUp16,
    IconErrorFilled16,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
} from '@dhis2/ui'
import React, { useState } from 'react'
import { ApiErrorReport, Schema, useModelMultiSelectQuery } from '../../../lib'
import { PartialLoadedDisplayableModel } from '../../../types/models'
import css from './Bulk.module.css'
import { BulkDeleteResult } from './useBulkDeleteMutation'

type FailedResult = { id: string; error: ApiErrorReport }

type BulkDeleteErrorsDialogProps = {
    schema: Schema
    results: BulkDeleteResult[]
    onClose: () => void
}

export const BulkDeleteErrorsDialog = ({
    schema,
    results,
    onClose,
}: BulkDeleteErrorsDialogProps) => {
    const failed: FailedResult[] = results
        .filter((result) => result.status === 'rejected')
        .map((result) => ({ id: result.id, error: result.error }))
    const allFailed = failed.length === results.length

    const { selected } =
        useModelMultiSelectQuery<PartialLoadedDisplayableModel>({
            query: {
                resource: schema.plural,
                params: { fields: ['id', 'displayName'] },
            },
            selected: failed.map(({ id }) => ({ id })),
        })

    return (
        <Modal large onClose={onClose} dataTest="bulk-delete-errors-dialog">
            <ModalTitle>
                {i18n.t(
                    '{{failedCount}} of {{total}} items could not be deleted',
                    { failedCount: failed.length, total: results.length }
                )}
            </ModalTitle>
            <ModalContent>
                <p className={css.errorSummary}>
                    {allFailed
                        ? i18n.t('None of the selected items could be deleted:')
                        : i18n.t(
                              'The remaining items were deleted successfully. The items below could not be deleted:'
                          )}
                </p>
                <div className={css.errorList}>
                    {failed.map(({ id, error }) => {
                        const displayName =
                            selected.find((model) => model.id === id)
                                ?.displayName ?? id
                        return (
                            <FailedItemRow
                                key={id}
                                displayName={displayName}
                                error={error}
                            />
                        )
                    })}
                </div>
            </ModalContent>
            <ModalActions>
                <Button primary onClick={onClose}>
                    {i18n.t('Close')}
                </Button>
            </ModalActions>
        </Modal>
    )
}

const FailedItemRow = ({
    displayName,
    error,
}: {
    displayName: string
    error: ApiErrorReport
}) => {
    const [showDetails, setShowDetails] = useState(false)

    return (
        <div className={css.errorRow}>
            <button
                type="button"
                className={css.errorRowHeader}
                aria-expanded={showDetails}
                onClick={() => setShowDetails((prev) => !prev)}
            >
                <span className={css.errorRowIcon}>
                    <IconErrorFilled16 />
                </span>
                <span className={css.errorRowDisplayName}>{displayName}</span>
                <span className={css.errorRowChevron}>
                    {showDetails ? <IconChevronUp16 /> : <IconChevronDown16 />}
                </span>
            </button>
            {showDetails && (
                <div className={css.errorRowDetail}>
                    {error.errors.length > 0 ? (
                        <ul className={css.errorRowList}>
                            {error.errors.map((apiError, index) => (
                                <li key={index}>{apiError.message}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className={css.errorRowMessageRaw}>
                            {error.message}
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}

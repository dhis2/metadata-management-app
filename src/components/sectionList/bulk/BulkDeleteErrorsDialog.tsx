import { useAlert } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    IconChevronDown16,
    IconChevronRight16,
    IconCopy16,
    IconLaunch16,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
    Tooltip,
} from '@dhis2/ui'
import React, { useId, useState } from 'react'
import { Schema, useModelMultiSelectQuery } from '../../../lib'
import { PartialLoadedDisplayableModel } from '../../../types/models'
import { LinkButton } from '../../LinkButton'
import css from './Bulk.module.css'
import {
    getBulkDeleteErrorDetails,
    getBulkDeleteErrorSummary,
} from './bulkDeleteErrorSummary'
import { BulkDeleteResult } from './useBulkDeleteMutation'

type FailedItem = {
    id: string
    displayName: string
    summary: string
    details: string[]
}

type BulkDeleteErrorsDialogProps = {
    schema: Schema
    results: BulkDeleteResult[]
    retrying: boolean
    onRetry: (ids: string[]) => void
    onClose: () => void
}

const formatErrorsForClipboard = (items: FailedItem[]) =>
    items
        .map((item) =>
            [
                `${item.displayName} (${item.id}): ${item.summary}`,
                ...item.details.map((detail) => `  - ${detail}`),
            ].join('\n')
        )
        .join('\n\n')

export const BulkDeleteErrorsDialog = ({
    schema,
    results,
    retrying,
    onRetry,
    onClose,
}: BulkDeleteErrorsDialogProps) => {
    const failed = results.flatMap((result) =>
        result.status === 'rejected' ? [result] : []
    )

    const { selected } =
        useModelMultiSelectQuery<PartialLoadedDisplayableModel>({
            query: {
                resource: schema.plural,
                params: { fields: ['id', 'displayName'] },
            },
            selected: failed.map(({ id }) => ({ id })),
        })

    const failedItems: FailedItem[] = failed.map(({ id, error }) => ({
        id,
        displayName:
            selected.find((model) => model.id === id)?.displayName ?? id,
        summary: getBulkDeleteErrorSummary(error),
        details: getBulkDeleteErrorDetails(error),
    }))

    const { show: showCopiedAlert } = useAlert(
        i18n.t('Errors copied to clipboard'),
        { success: true }
    )
    const handleCopy = async () => {
        await navigator.clipboard.writeText(
            formatErrorsForClipboard(failedItems)
        )
        showCopiedAlert()
    }

    return (
        <Modal large onClose={onClose} dataTest="bulk-delete-errors-dialog">
            <ModalTitle>
                {i18n.t(
                    '{{failedCount}} of {{total}} items could not be deleted',
                    { failedCount: failed.length, total: results.length }
                )}
            </ModalTitle>
            <ModalContent>
                <ul className={css.errorList}>
                    {failedItems.map((item) => (
                        <FailedItemRow key={item.id} item={item} />
                    ))}
                </ul>
            </ModalContent>
            <ModalActions>
                <div className={css.errorActions}>
                    <Button
                        secondary
                        icon={<IconCopy16 />}
                        onClick={handleCopy}
                        disabled={retrying}
                    >
                        {i18n.t('Copy errors')}
                    </Button>
                    <ButtonStrip end>
                        <Button
                            secondary
                            loading={retrying}
                            onClick={() => onRetry(failed.map(({ id }) => id))}
                            dataTest="bulk-delete-errors-retry-button"
                        >
                            {i18n.t('Retry failed items')}
                        </Button>
                        <Button primary onClick={onClose} disabled={retrying}>
                            {i18n.t('Close')}
                        </Button>
                    </ButtonStrip>
                </div>
            </ModalActions>
        </Modal>
    )
}

const FailedItemRow = ({ item }: { item: FailedItem }) => {
    const [showDetails, setShowDetails] = useState(false)
    const detailsId = useId()

    return (
        <li className={css.errorRow}>
            <div className={css.errorRowHeader}>
                <button
                    type="button"
                    className={css.errorRowToggle}
                    aria-expanded={showDetails}
                    aria-controls={detailsId}
                    onClick={() => setShowDetails((prev) => !prev)}
                >
                    <span className={css.errorRowChevron}>
                        {showDetails ? (
                            <IconChevronDown16 />
                        ) : (
                            <IconChevronRight16 />
                        )}
                    </span>
                    <span className={css.errorRowText}>
                        <span className={css.errorRowDisplayName}>
                            {item.displayName}
                        </span>
                        <span className={css.errorRowSummary}>
                            {item.summary}
                        </span>
                    </span>
                </button>
                <Tooltip content={i18n.t('Open in a new tab')}>
                    <LinkButton
                        small
                        secondary
                        to={{ pathname: item.id }}
                        target="_blank"
                        rel="noreferrer"
                        className={css.errorRowLink}
                    >
                        {i18n.t('Open')}
                        <IconLaunch16 />
                    </LinkButton>
                </Tooltip>
            </div>
            {showDetails && (
                <ul id={detailsId} className={css.errorRowDetails}>
                    {item.details.map((detail, index) => (
                        <li key={index}>{detail}</li>
                    ))}
                </ul>
            )}
        </li>
    )
}

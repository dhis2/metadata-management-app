import i18n from '@dhis2/d2-i18n'
import { Button, DataTableToolbar } from '@dhis2/ui'
import { useQueryClient } from '@tanstack/react-query'
import React from 'react'
import {
    isSchemaSection,
    isSectionBulkDeletable,
    useCanMergeModelInCurrentSection,
    useLocationState,
    useSchemaOrUndefined,
    useSectionHandle,
} from '../../../lib'
import { LinkButton } from '../../LinkButton'
import { BulkDeleteDialog } from '../bulk/BulkDeleteDialog'
import { BulkSharingDialog } from '../bulk/BulkSharingDialog'
import css from './Toolbar.module.css'

export type ToolbarSelectedProps = {
    selectedModels: Set<string>
    onDeselectAll: () => void
    downloadButtonElement: JSX.Element | null
}

export const ToolbarSelected = ({
    selectedModels,
    onDeselectAll,
    downloadButtonElement,
}: ToolbarSelectedProps) => {
    const [sharingDialogOpen, setSharingDialogOpen] = React.useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const queryClient = useQueryClient()
    const section = useSectionHandle()
    const maybeSchema = useSchemaOrUndefined(
        section && isSchemaSection(section) ? section.name : undefined
    )
    const sharable = maybeSchema?.shareable
    const mergeable = useCanMergeModelInCurrentSection()
    const isOrgUnitSection = section?.name === 'organisationUnit'
    const bulkDeletable =
        !!section && isSchemaSection(section) && isSectionBulkDeletable(section)
    const handleClose = () => setSharingDialogOpen(false)
    const handleDeleteSuccess = () => {
        queryClient.invalidateQueries()
        onDeselectAll()
    }
    const searchStateWithSelectedModels = useLocationState({
        selectedModels,
    })

    return (
        <DataTableToolbar
            className={css.listHeaderBulk}
            dataTest={'multi-actions-toolbar'}
        >
            <span>
                {i18n.t('{{number}} selected', { number: selectedModels.size })}
            </span>
            {sharable && (
                <Button small onClick={() => setSharingDialogOpen(true)}>
                    {i18n.t('Update sharing')}
                </Button>
            )}
            {mergeable && (
                <LinkButton
                    small
                    to={'merge'}
                    state={searchStateWithSelectedModels}
                >
                    {i18n.t('Merge...')}
                </LinkButton>
            )}
            {isOrgUnitSection && (
                <LinkButton
                    small
                    to={'move'}
                    state={searchStateWithSelectedModels}
                >
                    {i18n.t('Move...')}
                </LinkButton>
            )}
            {downloadButtonElement}
            {bulkDeletable && (
                <Button
                    small
                    destructive
                    onClick={() => setDeleteDialogOpen(true)}
                    dataTest="bulk-delete-button"
                >
                    {i18n.t('Delete')}
                </Button>
            )}
            <Button small onClick={() => onDeselectAll()}>
                {i18n.t('Deselect all')}
            </Button>
            {sharingDialogOpen && (
                <BulkSharingDialog
                    onClose={handleClose}
                    selectedModels={selectedModels}
                />
            )}
            {deleteDialogOpen && (
                <BulkDeleteDialog
                    onClose={() => setDeleteDialogOpen(false)}
                    onDeleteSuccess={handleDeleteSuccess}
                    selectedModels={selectedModels}
                />
            )}
        </DataTableToolbar>
    )
}

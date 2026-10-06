import i18n from '@dhis2/d2-i18n'
import { Button } from '@dhis2/ui'
import React, { useState } from 'react'
import { DownloadDialog } from '../download'
import { ToolbarNormal } from './ToolbarNormal'
import { ToolbarSelected } from './ToolbarSelected'

export type DefaultToolbarProps = {
    selectedModels: Set<string>
    onDeselectAll: () => void
    refetch: () => void
    downloadable?: boolean
}

export const DefaultToolbar = ({
    selectedModels,
    onDeselectAll,
    refetch,
    downloadable = true,
}: DefaultToolbarProps) => {
    const [downloadDialogOpen, setDownloadDialogOpen] = useState(false)

    const isAnySelected = selectedModels.size > 0

    const DownloadButtonElement = downloadable ? (
        <Button small onClick={() => setDownloadDialogOpen(true)}>
            {i18n.t('Download')}
        </Button>
    ) : null

    return (
        <>
            {isAnySelected ? (
                <ToolbarSelected
                    selectedModels={selectedModels}
                    onDeselectAll={onDeselectAll}
                    downloadButtonElement={DownloadButtonElement}
                    refetch={refetch}
                />
            ) : (
                <ToolbarNormal downloadButtonElement={DownloadButtonElement} />
            )}
            {downloadDialogOpen && (
                <DownloadDialog
                    onClose={() => setDownloadDialogOpen(false)}
                    selectedModels={selectedModels}
                />
            )}
        </>
    )
}

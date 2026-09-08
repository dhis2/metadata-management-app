import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
    SingleSelect,
    SingleSelectOption,
} from '@dhis2/ui'
import { IconCross24 } from '@dhis2/ui-icons'
import React, { useState } from 'react'
import { DrawerLayout, DrawerPortal } from '../drawer'
import drawerCss from '../drawer/Drawer.module.css'
import { MATRIX_SIZES, type MatrixSize } from './mockSharingData'
import { SharingMatrix } from './SharingMatrix'
import css from './SharingMatrix.module.css'
import { useSharingMatrix } from './useSharingMatrix'

/* PROTOTYPE ENTRY POINT — see README.md in this folder for the design
   decisions this implements. Nothing here talks to the API. */

type BulkSharingMatrixDrawerProps = {
    isOpen: boolean
    onClose: () => void
}

export const BulkSharingMatrixDrawer = ({
    isOpen,
    onClose,
}: BulkSharingMatrixDrawerProps) => {
    const [size, setSize] = useState<MatrixSize>('default')

    return (
        <DrawerPortal
            isOpen={isOpen}
            onClose={onClose}
            disableFocusTrap
            header={<MatrixDrawerHeader onClose={onClose} />}
        >
            {/* keyed so switching preset resets edits rather than leaving
                them pointing at objects that no longer exist */}
            <MatrixDrawerBody
                key={size}
                size={size}
                onSizeChange={setSize}
                onClose={onClose}
            />
        </DrawerPortal>
    )
}

const MatrixDrawerHeader = ({ onClose }: { onClose: () => void }) => (
    <div className={drawerCss.drawerHeader}>
        <div className={drawerCss.drawerHeaderContent} />
        <button
            className={drawerCss.drawerCloseButton}
            onClick={onClose}
            aria-label={i18n.t('Close drawer')}
            type="button"
        >
            <IconCross24 />
        </button>
    </div>
)

const SizeSwitcher = ({
    size,
    onSizeChange,
}: {
    size: MatrixSize
    onSizeChange: (size: MatrixSize) => void
}) => (
    <div className={css.sizeSwitcher}>
        <span>{i18n.t('Prototype example')}</span>
        <div style={{ width: 190 }}>
            <SingleSelect
                dense
                selected={size}
                onChange={({ selected }) =>
                    onSizeChange(selected as MatrixSize)
                }
            >
                {MATRIX_SIZES.map((option) => (
                    <SingleSelectOption
                        key={option.value}
                        value={option.value}
                        label={option.label}
                    />
                ))}
            </SingleSelect>
        </div>
    </div>
)

const MatrixDrawerBody = ({
    size,
    onSizeChange,
    onClose,
}: {
    size: MatrixSize
    onSizeChange: (size: MatrixSize) => void
    onClose: () => void
}) => {
    const api = useSharingMatrix(size)
    const [previewOpen, setPreviewOpen] = useState(false)
    const hasChanges = api.changeSummary.edits > 0

    return (
        <DrawerLayout
            footer={
                <div className={drawerCss.drawerFooter}>
                    <div className={drawerCss.drawerFooterActions}>
                        <ButtonStrip>
                            <Button
                                primary
                                small
                                disabled={!hasChanges}
                                onClick={() => setPreviewOpen(true)}
                            >
                                {i18n.t('Apply changes')}
                            </Button>
                            <Button
                                secondary
                                small
                                disabled={!hasChanges}
                                onClick={api.discardAll}
                            >
                                {i18n.t('Discard all changes')}
                            </Button>
                            <Button secondary small onClick={onClose}>
                                {i18n.t('Cancel')}
                            </Button>
                        </ButtonStrip>
                    </div>
                    <span className={css.footerCount}>
                        {hasChanges
                            ? i18n.t(
                                  '{{edits}} access changes across {{objects}} objects',
                                  {
                                      edits: api.changeSummary.edits,
                                      objects: api.changeSummary.objects,
                                  }
                              )
                            : i18n.t('No changes yet')}
                    </span>
                    <SizeSwitcher size={size} onSizeChange={onSizeChange} />
                </div>
            }
        >
            <SharingMatrix api={api} />

            {previewOpen && (
                <PatchPreviewModal
                    api={api}
                    onClose={() => setPreviewOpen(false)}
                />
            )}
        </DrawerLayout>
    )
}

/* Stands in for the save request. Its real job is to make the sparse-patch
   decision visible: only touched cells appear, untouched sharing is never
   mentioned in the payload. */
const PatchPreviewModal = ({
    api,
    onClose,
}: {
    api: ReturnType<typeof useSharingMatrix>
    onClose: () => void
}) => (
    <Modal onClose={onClose} large position="middle">
        <ModalTitle>{i18n.t('Would send (prototype — no request)')}</ModalTitle>
        <ModalContent>
            <p className={css.previewNote}>
                {i18n.t(
                    '{{count}} of {{total}} objects are patched. Objects with no touched cell are absent entirely — untouched sharing is never overwritten.',
                    {
                        count: api.patches.length,
                        total: api.objects.length,
                    }
                )}
            </p>
            <pre className={css.patchPreview}>
                {JSON.stringify(api.patches, null, 2)}
            </pre>
        </ModalContent>
        <ModalActions>
            <ButtonStrip>
                <Button primary onClick={onClose}>
                    {i18n.t('Close')}
                </Button>
            </ButtonStrip>
        </ModalActions>
    </Modal>
)

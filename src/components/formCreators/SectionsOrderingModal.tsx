import { useAlert, useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    Divider,
    IconArrowDown16,
    IconArrowUp16,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
} from '@dhis2/ui'
import cx from 'classnames'
import React from 'react'
import { Section } from './SectionFormList'
import css from './SectionsOrderingModal.module.css'

export const SectionsOrderingModal = ({
    onClose,
    sections,
    onReorder,
    sectionsFieldName,
    programStage = false,
}: {
    onClose: () => void
    sections: Section[]
    onReorder: (index: number, value: Section) => void
    sectionsFieldName: string
    programStage?: boolean
}) => {
    const [orderedSections, setOrderedSections] =
        React.useState<Section[]>(sections)
    const [isSaving, setIsSaving] = React.useState(false)
    const dataEngine = useDataEngine()
    const saveAlert = useAlert(
        ({ message }) => message,
        (options) => options
    )

    const saveOrdering = async () => {
        try {
            setIsSaving(true)
            for (const [index, section] of orderedSections.entries()) {
                if (section.id !== sections[index]?.id) {
                    await dataEngine.mutate({
                        resource: sectionsFieldName,
                        id: section.id,
                        type: 'json-patch',
                        data: [
                            {
                                op: 'replace',
                                path: '/sortOrder',
                                value: index,
                            },
                        ],
                    })
                }
                onReorder(index, section)
            }
            saveAlert.show({
                message: programStage
                    ? i18n.t('New program stages order saved successfully')
                    : i18n.t('New sections order saved successfully'),
                success: true,
            })
            onClose()
        } catch {
            saveAlert.show({
                message: programStage
                    ? i18n.t('Error saving new program stages order.')
                    : i18n.t('Error saving new sections order.'),
                error: true,
            })
        } finally {
            setIsSaving(false)
        }
    }

    const onMove = (section: Section, moveIndexBy: number) => {
        const newSections = [...orderedSections]
        const index = newSections.findIndex((s) => s.id === section.id)
        newSections.splice(index, 1)
        newSections.splice(index + moveIndexBy, 0, section)
        setOrderedSections(newSections)
    }

    const isUnchanged = React.useMemo(() => {
        return orderedSections.every((s, i) => s.id === sections[i]?.id)
    }, [orderedSections, sections])

    return (
        <Modal onClose={onClose} large dataTest="bulk-sharing-dialog">
            <ModalTitle>
                {programStage
                    ? i18n.t('Reorder program stages')
                    : i18n.t('Reorder form sections')}
            </ModalTitle>
            <ModalContent className={css.sectionRows}>
                {orderedSections.map((section, index) => (
                    <React.Fragment key={section.id}>
                        <div
                            className={cx(css.sectionRow, {
                                [css.sectionRowDeleted]: section.deleted,
                            })}
                        >
                            <text>
                                {section.displayName}
                                <text className={css.warningText}>
                                    {section.deleted &&
                                        ' ' + i18n.t('(marked for deletion)')}
                                </text>
                            </text>
                            <div className={css.sectionRowButtons}>
                                <Button
                                    small
                                    secondary
                                    icon={<IconArrowUp16 />}
                                    onClick={() => onMove(section, -1)}
                                    disabled={index === 0 || section.deleted}
                                />
                                <Button
                                    small
                                    secondary
                                    icon={<IconArrowDown16 />}
                                    onClick={() => onMove(section, 1)}
                                    disabled={
                                        index === orderedSections.length - 1 ||
                                        section.deleted
                                    }
                                />
                            </div>
                        </div>
                        <Divider />
                    </React.Fragment>
                ))}
            </ModalContent>
            <ModalActions>
                <ButtonStrip>
                    <Button onClick={onClose}>{i18n.t('Cancel')}</Button>
                    <Button
                        primary
                        onClick={saveOrdering}
                        loading={isSaving}
                        disabled={isUnchanged}
                    >
                        {programStage
                            ? i18n.t('Save program stage ordering')
                            : i18n.t('Save section ordering')}
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}

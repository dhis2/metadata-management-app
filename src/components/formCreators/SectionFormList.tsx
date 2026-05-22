import i18n from '@dhis2/d2-i18n'
import { Button, ButtonStrip, IconAdd16 } from '@dhis2/ui'
import React, { useState } from 'react'
import { useFieldArray } from 'react-final-form-arrays'
import {
    DrawerHeader,
    DrawerPortal,
    StandardFormSectionTitle,
    MoreDropdownButton,
    MoreDropdownItem,
    MoreDropdownDivider,
} from '../../components'
import { TranslationDialog } from '../../components/sectionList/translation'
import { BaseListModel, SchemaName } from '../../lib'
import { Access, DisplayableModel } from '../../types/models'
import css from './SectionFormList.module.css'
import { SectionsOrderingModal } from './SectionsOrderingModal'

export type Section = {
    id: string
    displayName: string
    description?: string
    deleted?: boolean
    access?: Access
}

type SectionFormComponent<
    TValues extends Section,
    TExtraProps
> = React.ComponentType<
    {
        onSubmitted: (values: TValues) => void
        onCancel: () => void
        section: DisplayableModel | null | undefined
    } & TExtraProps
>

export function SectionFormSectionsList<TValues extends Section, TExtraProps>({
    sectionsFieldName,
    schemaName,
    level,
    SectionFormComponent,
    withReordering,
    otherProps,
    warningNotice,
}: Readonly<{
    sectionsFieldName: string
    schemaName: SchemaName
    level: 'primary' | 'secondary'
    SectionFormComponent: SectionFormComponent<TValues, TExtraProps>
    withReordering: boolean
    otherProps?: TExtraProps
    warningNotice?: React.ReactNode
}>) {
    const [sectionFormOpen, setSectionFormOpen] = useState<
        DisplayableModel | null | undefined
    >(undefined)
    const [orderSectionsFormOpen, setOrderSectionsFormOpen] = useState(false)
    // use null as open, but new model
    const isSectionFormOpen = !!sectionFormOpen || sectionFormOpen === null
    const sectionFieldArray = useFieldArray<Section>(sectionsFieldName).fields

    const handleDeletedSection = (index: number) => {
        sectionFieldArray.update(index, {
            ...sectionFieldArray.value[index],
            deleted: true,
        })
    }

    const handleCancelDeletedSection = (index: number) => {
        sectionFieldArray.update(index, {
            ...sectionFieldArray.value[index],
            deleted: false,
        })
    }

    const handleSubmittedSection = (values: TValues) => {
        const isEditSection = sectionFormOpen && sectionFormOpen.id

        if (isEditSection) {
            const index = sectionFieldArray.value.findIndex(
                (s) => s.id === sectionFormOpen.id
            )
            if (index !== -1) {
                sectionFieldArray.update(index, values)
            }
        } else {
            sectionFieldArray.push(values)
        }
        setSectionFormOpen(undefined)
    }

    return (
        <div className={css.sectionsList}>
            <DrawerPortal
                isOpen={isSectionFormOpen}
                level={level}
                onClose={() => setSectionFormOpen(undefined)}
                header={
                    <DrawerHeader onClose={() => setSectionFormOpen(undefined)}>
                        {sectionFormOpen === null
                            ? i18n.t('New section')
                            : i18n.t('Edit section')}
                    </DrawerHeader>
                }
            >
                {sectionFormOpen !== undefined && (
                    <SectionFormComponent
                        {...(otherProps ?? ({} as TExtraProps))}
                        section={sectionFormOpen as DisplayableModel | null}
                        onCancel={() => setSectionFormOpen(undefined)}
                        onSubmitted={handleSubmittedSection}
                    />
                )}
            </DrawerPortal>

            {orderSectionsFormOpen && (
                <SectionsOrderingModal
                    onClose={() => setOrderSectionsFormOpen(false)}
                    sections={sectionFieldArray.value}
                    onReorder={sectionFieldArray.update}
                    sectionsFieldName={sectionsFieldName}
                />
            )}

            <div>
                <StandardFormSectionTitle>
                    {i18n.t('Sections')}
                </StandardFormSectionTitle>
                <p className={css.description}>
                    {i18n.t('Configure data and options for form sections.')}
                </p>
                {warningNotice}
            </div>

            <div className={css.sectionItems}>
                {sectionFieldArray.value?.map((section, index) => {
                    if (section.deleted) {
                        return (
                            <div
                                className={css.sectionCardDeleted}
                                key={section.id}
                            >
                                <div className={css.deletedSectionText}>
                                    {i18n.t(
                                        'Section {{sectionName}} will be removed on save',
                                        { sectionName: section.displayName }
                                    )}
                                </div>

                                <Button
                                    small
                                    onClick={() =>
                                        handleCancelDeletedSection(index)
                                    }
                                >
                                    {i18n.t('Restore section')}
                                </Button>
                            </div>
                        )
                    }

                    return (
                        <ListInFormItem
                            key={section.id}
                            item={section}
                            schemaName={schemaName}
                            onClick={() => setSectionFormOpen(section)}
                            onDelete={() => handleDeletedSection(index)}
                        />
                    )
                })}
            </div>

            <div>
                <ButtonStrip>
                    <Button
                        secondary
                        small
                        icon={<IconAdd16 />}
                        onClick={() => setSectionFormOpen(null)}
                    >
                        {i18n.t('Add section')}
                    </Button>
                    {withReordering && (
                        <Button
                            secondary
                            small
                            onClick={() => setOrderSectionsFormOpen(true)}
                            disabled={sectionFieldArray.value?.length <= 1}
                        >
                            {i18n.t('Reorder sections')}
                        </Button>
                    )}
                </ButtonStrip>
            </div>
        </div>
    )
}

export type ListItem = {
    id: string
    displayName: string
    description?: string
    deleted?: boolean
    access?: Access
}

export const ListInFormItem = ({
    item,
    schemaName,
    onClick,
    onDelete,
    translatable = true,
    disabled = false,
}: {
    item: ListItem
    schemaName: SchemaName
    onClick?: () => void
    onDelete?: () => void
    translatable?: boolean
    disabled?: boolean
}) => {
    const [translationDialogModel, setTranslationDialogModel] = useState<
        BaseListModel | undefined
    >(undefined)

    const openTranslationDialog = () => {
        if (item.access !== undefined) {
            setTranslationDialogModel(item as BaseListModel)
        }
    }

    return (
        <>
            <div className={css.sectionItem}>
                <div
                    className={css.sectionItemClickable}
                    onClick={() => {
                        // we dont want click handler on the wrapping "sectionItem" div
                        // since that will cause annoying issues with bubbling events in dropdown menu etc
                        onClick?.()
                    }}
                >
                    <div className={css.sectionIdentifiers}>
                        <div className={css.sectionName}>
                            {item.displayName}
                        </div>
                        {item.description && (
                            <div className={css.sectionDescription}>
                                {item.description}
                            </div>
                        )}
                    </div>
                </div>
                <div className={css.sectionActions}>
                    <MoreDropdownButton>
                        <MoreDropdownItem
                            label={i18n.t('Edit')}
                            onClick={onClick}
                            disabled={disabled}
                        />
                        {item.access !== undefined && translatable && (
                            <MoreDropdownItem
                                label={i18n.t('Translate')}
                                onClick={openTranslationDialog}
                            />
                        )}
                        <MoreDropdownItem
                            label={i18n.t('Copy ID')}
                            onClick={() => {
                                navigator.clipboard.writeText(item.id)
                            }}
                            disabled={disabled}
                        />
                        <MoreDropdownDivider />
                        <MoreDropdownItem
                            label={i18n.t('Delete')}
                            destructive
                            onClick={onDelete}
                            disabled={disabled}
                        />
                    </MoreDropdownButton>
                </div>
            </div>
            {translationDialogModel && (
                <TranslationDialog
                    model={translationDialogModel}
                    onClose={() => setTranslationDialogModel(undefined)}
                    schemaName={schemaName}
                />
            )}
        </>
    )
}

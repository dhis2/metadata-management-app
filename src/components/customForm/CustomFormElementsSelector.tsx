import i18n from '@dhis2/d2-i18n'
import {
    Checkbox,
    CircularLoader,
    IconChevronDown16,
    IconChevronUp16,
    IconWarning16,
    InputField,
} from '@dhis2/ui'
import React, { useState } from 'react'
import { useSectionHandle } from '../../lib'
import styles from './CustomFormContents.module.css'

type ElementSelectorFunction = ({
    id,
    name,
    type,
    disabled,
}: {
    id: string
    name?: string
    type: string
    disabled: boolean
}) => void

const SubsectionSpacer = ({ children }: { children: React.ReactNode }) => (
    <div className={styles.formSectionSpacing}>{children}</div>
)

type ElementItem = {
    id: string
    displayName: string
    key?: string
}

const ElementList = ({
    insertElement,
    elements,
    type,
    disabled,
}: {
    insertElement: ElementSelectorFunction
    elements: ElementItem[]
    type: string
    disabled: boolean
}) => {
    return (
        <ul className={styles.elementsList}>
            {elements.map((element) => (
                <li key={`element_${element.id}`}>
                    <button
                        type="button"
                        className={styles.elementButton}
                        onClick={() => {
                            insertElement({
                                type,
                                id: element.id,
                                name: element.displayName,
                                disabled,
                            })
                        }}
                    >
                        {element.displayName}
                    </button>
                </li>
            ))}
        </ul>
    )
}

export type ElementTypes = {
    name: string
    elements: { id: string; displayName: string; key?: string }[]
    type: string
}[]

export const LoadingCustomFormElementsSelector = ({
    insertElement,
    previewMode,
    loading,
    elementTypes,
}: {
    insertElement: ElementSelectorFunction
    previewMode: boolean
    loading: boolean
    elementTypes: ElementTypes
}) => {
    if (loading) {
        return <CircularLoader />
    }
    return (
        <CustomFormElementsSelector
            insertElement={insertElement}
            previewMode={previewMode}
            elementTypes={elementTypes}
        />
    )
}

const CustomFormElementsSelector = ({
    insertElement,
    previewMode,
    elementTypes,
}: {
    insertElement: ElementSelectorFunction
    previewMode: boolean
    elementTypes: ElementTypes
}) => {
    const [selectedElementType, setSelectedElementType] = useState<string[]>([])
    const updateElementTypes = (elementType: string) => {
        setSelectedElementType((prev) => {
            const filtered = prev.filter((t) => t !== elementType)
            return prev.includes(elementType)
                ? filtered
                : [...filtered, elementType]
        })
    }
    const section = useSectionHandle()
    const isProgramCustomForm = section?.name !== 'dataSet'

    const [fieldsDisabled, setFieldsDisabled] = useState<boolean>(false)
    const [filter, setFilter] = useState<string>('')

    return (
        <>
            <SubsectionSpacer>
                <div className={styles.customFormSubtitle}>
                    {i18n.t('Select elements')}
                </div>
                {previewMode && (
                    <div className={styles.previewElementsWarning}>
                        <IconWarning16 />
                        <div>
                            {i18n.t(
                                'Elements cannot be added while previewing the form'
                            )}
                        </div>
                    </div>
                )}
            </SubsectionSpacer>
            <SubsectionSpacer>
                <InputField
                    placeholder={i18n.t('Filter elements')}
                    onChange={(e) => {
                        setFilter(e?.value ?? '')
                    }}
                    value={filter}
                    className={styles.elementFilter}
                ></InputField>
            </SubsectionSpacer>

            <SubsectionSpacer>
                {!isProgramCustomForm && (
                    <Checkbox
                        checked={fieldsDisabled}
                        onChange={() => {
                            setFieldsDisabled((prev) => !prev)
                        }}
                        label={i18n.t('Insert grey (disabled) fields')}
                    />
                )}
            </SubsectionSpacer>
            {elementTypes.map((elementType) => {
                const selected = selectedElementType.includes(elementType.type)
                const cleanedFilter = filter
                    .normalize('NFD')
                    .replaceAll(/\p{Diacritic}/gu, '')
                    .toLowerCase()
                const filteredElements = elementType.elements.filter(
                    (e: ElementItem) =>
                        e.displayName
                            .normalize('NFD')
                            .replaceAll(/\p{Diacritic}/gu, '')
                            .toLowerCase()
                            .includes(cleanedFilter)
                )

                return (
                    <div
                        className={styles.elementSelectorBlock}
                        key={`selector_${elementType.type}`}
                    >
                        <details
                            onToggle={() => {
                                updateElementTypes(elementType.type)
                            }}
                        >
                            <summary className={styles.elementTypeTitleSummary}>
                                <span
                                    className={styles.elementTypePrefix}
                                >{`${elementType.name}: `}</span>
                                <span>{filteredElements.length}</span>
                                {selected ? (
                                    <IconChevronUp16 />
                                ) : (
                                    <IconChevronDown16 />
                                )}
                            </summary>
                            <ElementList
                                insertElement={insertElement}
                                elements={filteredElements}
                                type={elementType.type}
                                disabled={fieldsDisabled}
                            ></ElementList>
                        </details>
                    </div>
                )
            })}
        </>
    )
}

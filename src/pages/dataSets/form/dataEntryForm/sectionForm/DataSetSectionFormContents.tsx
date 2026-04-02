import i18n from '@dhis2/d2-i18n'
import {
    CheckboxFieldFF,
    Field,
    RadioFieldFF,
    SingleSelectFieldFF,
    TextAreaFieldFF,
} from '@dhis2/ui'
import { useQuery } from '@tanstack/react-query'
import DOMPurify from 'dompurify'
import { uniqBy } from 'lodash'
import React, { useMemo } from 'react'
import {
    Field as FieldRFF,
    useField,
    useForm,
    useFormState,
} from 'react-final-form'
import { useParams } from 'react-router-dom'
import {
    CodeField,
    DescriptionField,
    DrawerFormFooter,
    DrawerLayout,
    NameFieldWithAdditionalUniquenessConstraint,
    SectionedFormErrorNotice,
    SectionedFormSection,
    SectionedFormSections,
    StandardFormField,
    StandardFormSectionDescription,
    StandardFormSectionTitle,
    TransferHeader,
} from '../../../../../components'
import { BaseModelTransfer } from '../../../../../components/metadataFormControls/ModelTransfer/BaseModelTransfer'
import {
    SchemaName,
    SchemaSection,
    useBoundResourceQueryFn,
} from '../../../../../lib'
import { DisplayableModel } from '../../../../../types/models'
import { DataElementsTransferField } from './DataElementsTransferField'
import type { SectionFormValues } from './DataSetSectionForm'
import styles from './DataSetSectionFormContents.module.css'

const dataSetSectionSchemaSection = {
    name: SchemaName.section,
    namePlural: 'sections',
    title: i18n.t('Section'),
    titlePlural: i18n.t('Sections'),
    parentSectionKey: 'dataSet',
} satisfies SchemaSection

export type DataSetSectionFormProps = {
    onCancel?: () => void
}

export type DataSetDataElementsType = {
    dataSetElements: {
        dataElement: DisplayableModel & {
            categoryCombo: DisplayableModel & { categories: DisplayableModel[] }
        }
    }[]
    sections: { dataElements: { id: string }[]; id: string }[]
    indicators: DisplayableModel[]
}

export const DataSetSectionFormContents = ({
    onCancel,
}: DataSetSectionFormProps) => {
    const dataSetId = useParams()?.id
    const form = useForm<SectionFormValues>()
    const { submitting, values } = useFormState({
        subscription: { submitting: true, values: true },
    })

    const { input: dataElementsInput, meta: dataElementsMeta } = useField<
        (DisplayableModel & { categoryCombo: { id: string } })[]
    >('dataElements', {
        multiple: true,
        validateFields: [],
    })
    const { input: indicatorsInput, meta: indicatorsMeta } = useField<
        DisplayableModel[]
    >('indicators', {
        multiple: true,
        validateFields: [],
    })

    const defaultDisplayModeField = useField(`displayOptions.pivotMode`, {
        type: 'radio',
        value: 'n/a',
    })
    const pivotDisplayModeField = useField(`displayOptions.pivotMode`, {
        type: 'radio',
        value: 'pivot',
    })
    const moveCategoriesDisplayModeField = useField(
        `displayOptions.pivotMode`,
        {
            type: 'radio',
            value: 'move_categories',
        }
    )

    const queryFn = useBoundResourceQueryFn()
    const { data, isLoading } = useQuery({
        queryFn: queryFn<DataSetDataElementsType>,
        queryKey: [
            {
                resource: 'dataSets',
                id: values.dataSet.id,
                params: {
                    fields: [
                        'dataSetElements[dataElement[id,displayName,categoryCombo[id,displayName,categories[id,displayName]]]]',
                        'indicators[id,displayName]',
                        'sections[dataElements, id]',
                    ].concat(),
                },
            },
        ] as const,
    })

    const availableCategories = useMemo(() => {
        if (!data) {
            return []
        }
        const sectionsDataElements = data.dataSetElements.filter((de) =>
            dataElementsInput.value.map((v) => v.id).includes(de.dataElement.id)
        )

        return uniqBy(
            sectionsDataElements.flatMap(
                (de) => de.dataElement.categoryCombo.categories
            ),
            'id'
        )
    }, [data, dataElementsInput.value])

    const formContent = (
        <>
            <SectionedFormSections>
                <SectionedFormSection name="setup">
                    <StandardFormSectionTitle>
                        {i18n.t('Section setup')}
                    </StandardFormSectionTitle>
                    <StandardFormSectionDescription>
                        {i18n.t(
                            'Setup the basic information for this section.'
                        )}
                    </StandardFormSectionDescription>
                    <StandardFormField>
                        <NameFieldWithAdditionalUniquenessConstraint
                            schemaSection={dataSetSectionSchemaSection}
                            modelId={values.id}
                            additionalNameUniquenessConstraint={
                                dataSetId
                                    ? `dataSet.id:eq:${dataSetId}`
                                    : undefined
                            }
                        />
                    </StandardFormField>
                    <StandardFormField>
                        <CodeField
                            schemaSection={dataSetSectionSchemaSection}
                            modelId={values.id}
                        />
                    </StandardFormField>
                    <StandardFormField>
                        <DescriptionField
                            helpText={i18n.t(
                                'Shown in the data entry form with the section title.'
                            )}
                        />
                    </StandardFormField>
                </SectionedFormSection>
                <SectionedFormSection name="sectionDataElements">
                    <StandardFormSectionTitle>
                        {i18n.t('Section data elements')}
                    </StandardFormSectionTitle>
                    <StandardFormSectionDescription>
                        {i18n.t(
                            'Choose what data is collected for this section.'
                        )}
                    </StandardFormSectionDescription>
                    <DataElementsTransferField
                        isLoading={isLoading}
                        sectionId={values.sectionId}
                        sections={data?.sections}
                        dataSetElements={data?.dataSetElements}
                        input={dataElementsInput}
                        meta={dataElementsMeta}
                    />
                </SectionedFormSection>
                <SectionedFormSection name="sectionIndicators">
                    <StandardFormSectionTitle>
                        {i18n.t('Section indicators')}
                    </StandardFormSectionTitle>
                    <StandardFormSectionDescription>
                        {i18n.t(
                            'Choose what indicators are shown in this section.'
                        )}
                    </StandardFormSectionDescription>
                    <Field
                        error={indicatorsMeta.invalid}
                        validationText={
                            (indicatorsMeta.touched &&
                                indicatorsMeta.error?.toString()) ||
                            ''
                        }
                        name="indicators"
                    >
                        <BaseModelTransfer
                            selected={indicatorsInput.value}
                            onChange={({ selected }) => {
                                indicatorsInput.onChange(selected)
                                indicatorsInput.onBlur()
                            }}
                            leftHeader={
                                <TransferHeader>
                                    {i18n.t('Available indicators')}
                                </TransferHeader>
                            }
                            rightHeader={
                                <TransferHeader>
                                    {i18n.t('Selected indicators')}
                                </TransferHeader>
                            }
                            filterPlaceholder={i18n.t(
                                'Filter available indicators'
                            )}
                            filterPlaceholderPicked={i18n.t(
                                'Filter selected indicators'
                            )}
                            enableOrderChange
                            height={'350px'}
                            optionsWidth="500px"
                            selectedWidth="500px"
                            filterable
                            filterablePicked
                            available={data?.indicators ?? []}
                            maxSelections={Infinity}
                            sourceEmptyPlaceholder={
                                <p className={styles.emptyPlaceholder}>
                                    {i18n.t(
                                        'No indicators available. Add indicators to this data set to use them in sections.'
                                    )}
                                </p>
                            }
                        />
                    </Field>
                </SectionedFormSection>
                <SectionedFormSection name="displayOptions">
                    <StandardFormSectionTitle>
                        {i18n.t('Display options')}
                    </StandardFormSectionTitle>
                    <StandardFormSectionDescription>
                        {i18n.t(
                            'Customize how this section looks in the form.'
                        )}
                    </StandardFormSectionDescription>
                    <StandardFormField>
                        <FieldRFF
                            name="showRowTotals"
                            type="checkbox"
                            dataTest="formfields-showRowTotals"
                            component={CheckboxFieldFF}
                            label={i18n.t('Row totals')}
                        />
                    </StandardFormField>
                    <StandardFormField>
                        <FieldRFF
                            name="showColumnTotals"
                            type="checkbox"
                            dataTest="formfields-showColumnTotals"
                            component={CheckboxFieldFF}
                            label={i18n.t('Column totals')}
                        />
                    </StandardFormField>
                    <StandardFormField>
                        <FieldRFF
                            name="disableDataElementAutoGroup"
                            type="checkbox"
                            dataTest="formfields-disableDataElementAutoGroup"
                            component={CheckboxFieldFF}
                            label={i18n.t(
                                'Disable automatic grouping of data elements'
                            )}
                        />
                    </StandardFormField>
                    <div>
                        <p>{i18n.t('Display mode')}</p>
                        <div className={styles.displayModeOptions}>
                            <StandardFormField>
                                <RadioFieldFF
                                    label={i18n.t(
                                        'Default: data elements as rows, categories as columns',
                                        { nsSeparator: '~:~' }
                                    )}
                                    input={defaultDisplayModeField.input}
                                    meta={defaultDisplayModeField.meta}
                                />
                            </StandardFormField>
                            <StandardFormField>
                                <RadioFieldFF
                                    label={i18n.t(
                                        'Pivot: categories as rows, data elements as columns',
                                        { nsSeparator: '~:~' }
                                    )}
                                    input={pivotDisplayModeField.input}
                                    meta={pivotDisplayModeField.meta}
                                />
                            </StandardFormField>
                            <StandardFormField>
                                <RadioFieldFF
                                    label={i18n.t(
                                        'Move a category to rows: default mode with one category moved to rows',
                                        { nsSeparator: '~:~' }
                                    )}
                                    input={moveCategoriesDisplayModeField.input}
                                    meta={moveCategoriesDisplayModeField.meta}
                                />
                            </StandardFormField>
                        </div>
                        {moveCategoriesDisplayModeField.input.checked &&
                            availableCategories.length > 1 &&
                            data && (
                                <div className={styles.pivotedCategorySelector}>
                                    <FieldRFF
                                        required
                                        component={SingleSelectFieldFF}
                                        inputWidth="400px"
                                        name="displayOptions.pivotedCategory"
                                        label={i18n.t(
                                            'Category to move to rows'
                                        )}
                                        options={availableCategories.map(
                                            (cc) => ({
                                                value: cc.id,
                                                label: cc.displayName,
                                            })
                                        )}
                                    />
                                </div>
                            )}
                        <StandardFormField>
                            <FieldRFF
                                component={TextAreaFieldFF}
                                inputWidth="400px"
                                name="displayOptions.beforeSectionText"
                                label={i18n.t(
                                    'Content to display before a section'
                                )}
                                helpText={i18n.t(
                                    'HTML links and basic styling can be included'
                                )}
                                format={(value) =>
                                    typeof value === 'string'
                                        ? DOMPurify.sanitize(value)
                                        : value
                                }
                            />
                        </StandardFormField>
                        <StandardFormField>
                            <FieldRFF
                                component={TextAreaFieldFF}
                                inputWidth="400px"
                                name="displayOptions.afterSectionText"
                                label={i18n.t(
                                    'Content to display after a section'
                                )}
                                validateFields={[]}
                                helpText={i18n.t(
                                    'HTML links and basic styling can be included'
                                )}
                                format={(value) =>
                                    typeof value === 'string'
                                        ? DOMPurify.sanitize(value)
                                        : value
                                }
                            />
                        </StandardFormField>
                    </div>
                </SectionedFormSection>
            </SectionedFormSections>
            <SectionedFormErrorNotice />
        </>
    )

    if (!onCancel) {
        return null
    }
    return (
        <DrawerLayout
            footer={
                <DrawerFormFooter
                    submitLabel={i18n.t('Save section')}
                    cancelLabel={i18n.t('Cancel')}
                    submitting={submitting ?? false}
                    onSubmitClick={() => form.submit()}
                    onCancelClick={onCancel}
                    infoMessage={i18n.t(
                        'Saving a section does not save other changes to the data set'
                    )}
                />
            }
        >
            {formContent}
        </DrawerLayout>
    )
}

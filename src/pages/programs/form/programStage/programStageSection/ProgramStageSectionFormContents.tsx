import i18n from '@dhis2/d2-i18n'
import { Field, SingleSelectFieldFF } from '@dhis2/ui'
import { useQuery } from '@tanstack/react-query'
import React, { useMemo } from 'react'
import { Field as FieldRFF, useField, useFormState } from 'react-final-form'
import {
    DescriptionField,
    NameField,
    SectionedFormSection,
    SectionedFormSections,
    StandardFormField,
    StandardFormSectionDescription,
    StandardFormSectionTitle,
    TransferHeader,
} from '../../../../../components'
import { BaseModelTransfer } from '../../../../../components/metadataFormControls/ModelTransfer/BaseModelTransfer'
import { useBoundResourceQueryFn } from '../../../../../lib'
import { DisplayableModel } from '../../../../../types/models'
import { MandatoryDataElementsWarning } from '../MandatoryDataElementsWarning'
import { getMandatoryDataElementsMissingFromSections } from '../mandatoryStageDataElements'
import { stageSectionSchemaSection } from './ProgramStageSectionForm'
import styles from './StageSectionFormContents.module.css'

const displayOptions = [
    {
        label: i18n.t('Listing'),
        value: 'LISTING',
    },
    {
        label: i18n.t('Sequential'),
        value: 'SEQUENTIAL',
    },
    {
        label: i18n.t('Matrix'),
        value: 'MATRIX',
    },
]

export type ProgramStateSectionDataElements = {
    programStageDataElements: {
        id: string
        compulsory: boolean
        dataElement: { id: string; displayName: string }
    }[]
    programStageSections: { dataElements: { id: string }[]; id: string }[]
}

export const ProgramStageSectionFormContents = () => {
    const queryFn = useBoundResourceQueryFn()
    const { values } = useFormState({ subscription: { values: true } })

    const { data, isLoading } = useQuery({
        queryFn: queryFn<ProgramStateSectionDataElements>,
        queryKey: [
            {
                resource: 'programStages',
                id: values.programStage.id,
                params: {
                    fields: [
                        'programStageDataElements[id,compulsory,dataElement[id,displayName]]',
                        'programStageSections[dataElements[id], id]',
                    ].concat(),
                },
            },
        ] as const,
    })

    const { input: dataElementsInput, meta: dataElementsMeta } = useField<
        DisplayableModel[]
    >('dataElements', {
        multiple: true,
        validateFields: [],
    })

    const availableDataElements = useMemo(() => {
        if (!data?.programStageSections || !data?.programStageDataElements) {
            return []
        }
        const otherSectionsDataElements = data.programStageSections
            .filter((section) => section.id !== values.id)
            .flatMap((section) => section.dataElements?.map((de) => de.id))

        return data.programStageDataElements
            .map((de) => de.dataElement)
            .filter((de) => !otherSectionsDataElements.includes(de.id))
    }, [data, values.id])

    const missingMandatoryDataElements = useMemo(() => {
        const otherSections = (data?.programStageSections ?? []).filter(
            (s) => s.id !== values.id
        )
        const selectedDataElements = Array.isArray(dataElementsInput.value)
            ? dataElementsInput.value
            : []
        const currentSection = {
            dataElements: selectedDataElements.map((de) => ({ id: de.id })),
        }
        return getMandatoryDataElementsMissingFromSections({
            programStageDataElements: data?.programStageDataElements,
            programStageSections: [...otherSections, currentSection],
        })
    }, [data, values.id, dataElementsInput.value])

    return (
        <SectionedFormSections>
            <SectionedFormSection name="setup">
                <StandardFormSectionTitle>
                    {i18n.t('Section setup')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t('Setup the basic information for this section.')}
                </StandardFormSectionDescription>
                <StandardFormField>
                    <NameField schemaSection={stageSectionSchemaSection} />
                </StandardFormField>
                <StandardFormField>
                    <DescriptionField
                        helpText={i18n.t(
                            'Explain the purpose of this section.'
                        )}
                    />
                </StandardFormField>
                <StandardFormField>
                    <FieldRFF<string | undefined>
                        inputWidth="500px"
                        name="renderType.DESKTOP.type"
                        render={(props) => (
                            <SingleSelectFieldFF
                                {...props}
                                label={i18n.t('Desktop display')}
                                options={displayOptions}
                            />
                        )}
                        required
                    />
                </StandardFormField>
                <StandardFormField>
                    <FieldRFF<string | undefined>
                        inputWidth="500px"
                        name="renderType.MOBILE.type"
                        render={(props) => (
                            <SingleSelectFieldFF
                                {...props}
                                label={i18n.t('Mobile display')}
                                options={displayOptions}
                            />
                        )}
                        required
                    />
                </StandardFormField>
            </SectionedFormSection>
            <SectionedFormSection name="sectionDataElements">
                <StandardFormSectionTitle>
                    {i18n.t('Section data elements')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t('Choose what data is collected for this section.')}
                </StandardFormSectionDescription>
                <div className={styles.notice}>
                    <MandatoryDataElementsWarning
                        missingDataElements={missingMandatoryDataElements}
                        className={styles.mandatoryWarningNotice}
                    />
                </div>
                <StandardFormField>
                    <Field
                        error={dataElementsMeta.invalid}
                        validationText={
                            (dataElementsMeta.touched &&
                                dataElementsMeta.error?.toString()) ||
                            ''
                        }
                        name="attributes"
                    >
                        <BaseModelTransfer
                            loading={isLoading}
                            selected={dataElementsInput.value || []}
                            onChange={({ selected }) => {
                                dataElementsInput.onChange(selected)
                                dataElementsInput.onBlur()
                            }}
                            leftHeader={
                                <TransferHeader>
                                    {i18n.t('Available data elements')}
                                </TransferHeader>
                            }
                            rightHeader={
                                <TransferHeader>
                                    {i18n.t('Selected data elements')}
                                </TransferHeader>
                            }
                            filterPlaceholder={i18n.t(
                                'Filter available data elements'
                            )}
                            filterPlaceholderPicked={i18n.t(
                                'Filter selected data elements'
                            )}
                            enableOrderChange
                            height={'350px'}
                            optionsWidth="500px"
                            selectedWidth="500px"
                            filterable
                            filterablePicked
                            available={[
                                ...availableDataElements,
                                ...dataElementsInput.value,
                            ]}
                            maxSelections={Infinity}
                        />
                    </Field>
                </StandardFormField>
            </SectionedFormSection>
        </SectionedFormSections>
    )
}

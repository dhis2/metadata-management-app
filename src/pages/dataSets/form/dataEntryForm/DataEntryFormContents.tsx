import { useDataEngine, useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { Button } from '@dhis2/ui'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
    createSearchParams,
    Link,
    useParams,
    useSearchParams,
} from 'react-router-dom'
import {
    StandardFormSectionDescription,
    StandardFormSectionTitle,
    SectionedFormSection,
} from '../../../../components'
import { CustomFormDataPayload } from '../../../../components/customForm/CustomFormEdit'
import { CustomFormEditEntry } from '../../../../components/customForm/CustomFormEditEntry'
import { useDataSetCustomFormElements } from '../../../../components/customForm/useGetCustomFormElements'
import { SectionFormSectionsList } from '../../../../components/formCreators/SectionFormList'
import {
    FormType,
    TabbedFormTypePicker,
} from '../../../../components/formCreators/TabbedFormTypePicker'
import { UnsavedDataElementsNotice } from '../../../../components/formCreators/UnsavedDataElementsNotice'
import {
    FORM_SECTION_PARAM_KEY,
    hasUnsavedDataElements,
    scrollToSection,
} from '../../../../lib'
import { SchemaName } from '../../../../types'
import { DisplayOptionsField } from '../DisplayOptionsField'
import { useDataSetField, useDataSetFormState } from '../formHooks'
import classes from './DataEntryFormContents.module.css'
import { EditOrNewDataSetSectionForm } from './sectionForm'

export const DataEntryFromContents = React.memo(function FormFormContents({
    name,
}: {
    name: string
}) {
    const { apiVersion } = useConfig()
    const hasDisplayOptions = apiVersion >= 42
    const sections = useDataSetField('sections').input.value
    const dataEntryForm = useDataSetField('dataEntryForm').input.value
    const dataSetElements = useDataSetField('dataSetElements').input.value
    const { initialValues } = useDataSetFormState({
        subscription: { initialValues: true },
    })
    const hasUnsavedNewDataElements = useMemo(
        () =>
            hasUnsavedDataElements(
                dataSetElements,
                initialValues?.dataSetElements
            ),
        [dataSetElements, initialValues?.dataSetElements]
    )
    const [selectedFormType, setSelectedFormType] = useState<FormType>(
        FormType.DEFAULT
    )
    const modelId = useParams().id
    const [searchParams] = useSearchParams()
    const isClone = !!searchParams.get('clonedId')
    const toDataSearchParam = useMemo(
        () =>
            createSearchParams({
                ...Object.fromEntries(searchParams),
                [FORM_SECTION_PARAM_KEY]: 'data',
            }).toString(),
        [searchParams]
    )

    useEffect(() => {
        if (dataEntryForm) {
            setSelectedFormType(FormType.CUSTOM)
        } else if (sections.length > 0) {
            setSelectedFormType(FormType.SECTION)
        }
    }, [dataEntryForm, sections])
    const dataEngine = useDataEngine()

    const { loading, elementTypes, refetch } = useDataSetCustomFormElements()
    const updateDataSetCustomForm = useCallback(
        async (
            data: CustomFormDataPayload,
            onSuccess: (data: CustomFormDataPayload) => void,
            onError: (e: Error) => void
        ) => {
            try {
                const response = await dataEngine.mutate(
                    {
                        resource: `dataSets/${modelId}/form`,
                        type: 'create',
                        data: data,
                    },
                    {
                        onComplete: () => {
                            // the response from this post is empty, so we use the data we passed if it was successful
                            onSuccess(data)
                        },
                        onError,
                    }
                )
                return { data: response }
            } catch (error) {
                console.error(error)
            }
        },
        [dataEngine, modelId]
    )

    return (
        <SectionedFormSection name={name}>
            <StandardFormSectionTitle>
                {i18n.t('Data entry form')}
            </StandardFormSectionTitle>
            <StandardFormSectionDescription>
                {i18n.t(
                    'Choose and configure how the data entry form looks and works.'
                )}
            </StandardFormSectionDescription>
            <TabbedFormTypePicker
                sectionsLength={sections.length}
                hasDataEntryForm={!!dataEntryForm}
                hasDataToDisplay={dataSetElements.length > 0}
                onFormTypeChange={setSelectedFormType}
                selectedFormType={selectedFormType}
                modelId={modelId}
            >
                {selectedFormType === FormType.DEFAULT && (
                    <div className={classes.basicFormDetails}>
                        <StandardFormSectionTitle>
                            {i18n.t('Basic form')}
                        </StandardFormSectionTitle>
                        <div className={classes.basicFormDescription}>
                            {i18n.t(
                                'Displays a form with the data elements in the order they were added to this data set.'
                            )}
                        </div>
                        <Link
                            to={{ search: toDataSearchParam }}
                            replace
                            onClick={() => {
                                scrollToSection('data')
                            }}
                        >
                            <Button secondary small>
                                {i18n.t('Manage data elements')}
                            </Button>
                        </Link>
                    </div>
                )}
                {selectedFormType === FormType.SECTION && (
                    <>
                        {(hasUnsavedNewDataElements || isClone) && (
                            <UnsavedDataElementsNotice
                                message={i18n.t(
                                    'Save changes to this data set before editing sections'
                                )}
                            />
                        )}
                        <SectionFormSectionsList
                            sectionsFieldName={'sections'}
                            SectionFormComponent={EditOrNewDataSetSectionForm}
                            schemaName={SchemaName.section}
                            level={'primary'}
                            withReordering
                            disabled={hasUnsavedNewDataElements || isClone}
                            isClone={isClone}
                        />
                    </>
                )}
                {selectedFormType === FormType.CUSTOM && (
                    <>
                        {(hasUnsavedNewDataElements || isClone) && (
                            <UnsavedDataElementsNotice
                                message={i18n.t(
                                    'Save changes to this data set before editing the form'
                                )}
                            />
                        )}
                        <CustomFormEditEntry
                            level={'primary'}
                            loading={loading}
                            elementTypes={elementTypes}
                            refetch={refetch}
                            updateCustomForm={updateDataSetCustomForm}
                            customFormTarget="data set"
                            disabled={hasUnsavedNewDataElements || isClone}
                        />
                    </>
                )}
                {hasDisplayOptions && (
                    <div className={classes.displayOptions}>
                        <StandardFormSectionTitle>
                            {i18n.t('Display options')}
                        </StandardFormSectionTitle>
                        <DisplayOptionsField
                            withSectionsDisplayOptions={
                                selectedFormType === FormType.SECTION
                            }
                        />
                    </div>
                )}
            </TabbedFormTypePicker>
        </SectionedFormSection>
    )
})

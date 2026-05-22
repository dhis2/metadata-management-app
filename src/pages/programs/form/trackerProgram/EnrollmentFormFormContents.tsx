import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { Button, NoticeBox } from '@dhis2/ui'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useField, UseFieldConfig, useFormState } from 'react-final-form'
import {
    createSearchParams,
    Link,
    useParams,
    useSearchParams,
} from 'react-router-dom'
import {
    SectionedFormSection,
    StandardFormSectionDescription,
    StandardFormSectionTitle,
} from '../../../../components'
import { CustomFormDataPayload } from '../../../../components/customForm/CustomFormEdit'
import { CustomFormEditEntry } from '../../../../components/customForm/CustomFormEditEntry'
import { useProgramsCustomFormElements } from '../../../../components/customForm/useGetCustomFormElements'
import { SectionFormSectionsList } from '../../../../components/formCreators/SectionFormList'
import {
    FormType,
    TabbedFormTypePicker,
} from '../../../../components/formCreators/TabbedFormTypePicker'
import { FORM_SECTION_PARAM_KEY, scrollToSection } from '../../../../lib'
import { SchemaName } from '../../../../types'
import { ProgramValues } from '../../EditTrackerProgram'
import { EditOrNewEnrollmentSectionForm } from '../sectionForm/EntrollmentSectionForm'
import styles from './EnrollmentFormFormContents.module.css'
import { MandatoryAttributesWarning } from './MandatoryAttributesWarning'
import { getMandatoryAttributesMissingFromSections } from './mandatoryEnrollmentAttributes'

const useProgramField = <T extends keyof ProgramValues>(
    name: T,
    options?: UseFieldConfig<ProgramValues[T], ProgramValues[T]>
) => useField<ProgramValues[T]>(name, options)

export const EnrollmentFormFormContents = React.memo(function FormFormContents({
    name,
}: {
    name: string
}) {
    const sections = useProgramField('programSections').input.value
    const dataEntryForm = useProgramField('dataEntryForm').input.value
    const { initialValues } = useFormState({
        subscription: { initialValues: true },
    })
    const missingMandatoryAttributes = useMemo(
        () =>
            getMandatoryAttributesMissingFromSections({
                programTrackedEntityAttributes:
                    initialValues?.programTrackedEntityAttributes,
                programSections: sections,
            }),
        [initialValues?.programTrackedEntityAttributes, sections]
    )
    const [selectedFormType, setSelectedFormType] = useState<FormType>(
        FormType.DEFAULT
    )
    const [searchParams] = useSearchParams()
    const toEnrollmentDataSearchParam = useMemo(
        () =>
            createSearchParams({
                ...Object.fromEntries(searchParams),
                [FORM_SECTION_PARAM_KEY]: 'enrollmentData',
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

    const modelId = useParams().id
    const { loading, elementTypes, refetch } = useProgramsCustomFormElements()
    const createProgramCustomForm = useCallback(
        async (
            data: CustomFormDataPayload,
            onSuccess: (data: CustomFormDataPayload) => void,
            onError: (e: Error) => void
        ) => {
            try {
                const response = await dataEngine.mutate(
                    {
                        resource: `dataEntryForms`,
                        type: 'create',
                        data: data,
                    },
                    {
                        onError,
                    }
                )
                await dataEngine.mutate(
                    {
                        resource: `programs`,
                        id: modelId as string,
                        type: 'json-patch',
                        data: [
                            {
                                op: 'replace',
                                path: '/dataEntryForm',
                                value: { id: data.id },
                            },
                        ],
                    },
                    {
                        onComplete: () => {
                            // use the data we passed if form was saved and associated to program
                            onSuccess(data)
                        },
                    }
                )
                return { data: response }
            } catch (error) {
                console.error(error)
            }
        },
        [dataEngine, modelId]
    )

    const updateProgramCustomForm = useCallback(
        async (
            data: CustomFormDataPayload,
            onSuccess: (data: CustomFormDataPayload) => void,
            onError: (e: Error) => void
        ) => {
            try {
                const response = await dataEngine.mutate(
                    {
                        resource: `dataEntryForms`,
                        id: data.id,
                        type: 'json-patch',
                        data: [
                            {
                                op: 'replace',
                                path: '/htmlCode',
                                value: data.htmlCode,
                            },
                        ],
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
        [dataEngine]
    )

    const updateOrCreateCustomForm = (
        data: CustomFormDataPayload,
        onSuccess: (data: CustomFormDataPayload) => void,
        onError: (e: Error) => void,
        existingFormId: string | undefined
    ) =>
        existingFormId
            ? updateProgramCustomForm(data, onSuccess, onError)
            : createProgramCustomForm(data, onSuccess, onError)

    return (
        <SectionedFormSection name={name}>
            <StandardFormSectionTitle>
                {i18n.t('Enrollment: Form', { nsSeparator: '~:~' })}
            </StandardFormSectionTitle>
            <StandardFormSectionDescription>
                {i18n.t(
                    'Choose and configure the type of form that will be used to collect information during enrollment.'
                )}
            </StandardFormSectionDescription>
            <TabbedFormTypePicker
                sectionsLength={sections.length}
                hasDataEntryForm={!!dataEntryForm}
                hasDataToDisplay={
                    !!initialValues?.programTrackedEntityAttributes?.length
                }
                onFormTypeChange={setSelectedFormType}
                selectedFormType={selectedFormType}
                modelId={modelId}
            >
                {selectedFormType === FormType.DEFAULT && (
                    <div className={styles.basicFormDetails}>
                        <StandardFormSectionTitle>
                            {i18n.t('Basic form')}
                        </StandardFormSectionTitle>
                        <div className={styles.basicFormDescription}>
                            {i18n.t(
                                'Displays a form with attributes in the order they were added to the enrollment'
                            )}
                        </div>
                        <Link
                            to={{ search: toEnrollmentDataSearchParam }}
                            replace
                            onClick={() => {
                                scrollToSection('enrollmentData')
                            }}
                        >
                            <Button secondary small>
                                {i18n.t('Manage attributes')}
                            </Button>
                        </Link>
                    </div>
                )}
                {selectedFormType === FormType.SECTION && (
                    <SectionFormSectionsList
                        sectionsFieldName={'programSections'}
                        SectionFormComponent={EditOrNewEnrollmentSectionForm}
                        schemaName={SchemaName.programSection}
                        level={'primary'}
                        otherProps={{ sectionsLength: sections.length }}
                        withReordering
                        warningNotice={
                            <MandatoryAttributesWarning
                                missingAttributes={missingMandatoryAttributes}
                                className={styles.sectionWarningNotice}
                            />
                        }
                    />
                )}
                {selectedFormType === FormType.CUSTOM && (
                    <CustomFormEditEntry
                        level={'primary'}
                        loading={loading}
                        refetch={refetch}
                        elementTypes={elementTypes}
                        updateCustomForm={updateOrCreateCustomForm}
                        customFormTarget="program enrollment"
                    />
                )}
            </TabbedFormTypePicker>
        </SectionedFormSection>
    )
})

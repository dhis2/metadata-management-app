import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { Button } from '@dhis2/ui'
import cx from 'classnames'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useFormState } from 'react-final-form'
import {
    SectionedFormSection,
    StandardFormSectionDescription,
    StandardFormSectionTitle,
} from '../../../../components'
import { CustomFormDataPayload } from '../../../../components/customForm/CustomFormEdit'
import { CustomFormEditEntry } from '../../../../components/customForm/CustomFormEditEntry'
import { useProgramsStageSectionCustomFormElements } from '../../../../components/customForm/useGetCustomFormElements'
import { SectionFormSectionsList } from '../../../../components/formCreators/SectionFormList'
import {
    FormType,
    TabbedFormTypePicker,
} from '../../../../components/formCreators/TabbedFormTypePicker'
import { SchemaName, scrollToSection } from '../../../../lib'
import styles from '../trackerProgram/EnrollmentFormFormContents.module.css'
import { MandatoryDataElementsWarning } from './MandatoryDataElementsWarning'
import { getMandatoryDataElementsMissingFromSections } from './mandatoryStageDataElements'
import { EditOrNewStageSectionForm } from './programStageSection/ProgramStageSectionForm'

export const StageFormFormContents = ({
    isSubsection,
    sectionLabel,
    name,
    isTrackerProgram = true,
}: {
    isSubsection: boolean
    sectionLabel: string
    name: string
    isTrackerProgram?: boolean
}) => {
    const { values, initialValues } = useFormState({
        subscription: { values: true, initialValues: true },
    })
    const currentSections = isTrackerProgram
        ? values.programStageSections
        : values.programStages?.[0]?.programStageSections
    const currentForm = isTrackerProgram
        ? values.dataEntryForm
        : values.programStages?.[0]?.dataEntryForm
    const stageId = isTrackerProgram ? values.id : values.programStages[0]?.id
    const hasDataElements = isTrackerProgram
        ? values.programStageDataElements?.length > 0
        : values.programStages?.[0]?.programStageDataElements?.length > 0

    const initialDataElements = isTrackerProgram
        ? initialValues.programStageDataElements
        : initialValues.programStages?.[0]?.programStageDataElements

    const missingMandatoryDataElements = useMemo(
        () =>
            getMandatoryDataElementsMissingFromSections({
                programStageDataElements: initialDataElements,
                programStageSections: currentSections,
            }),
        [initialDataElements, currentSections]
    )

    const [selectedFormType, setSelectedFormType] = useState<FormType>(
        FormType.DEFAULT
    )

    useEffect(() => {
        if (currentForm) {
            setSelectedFormType(FormType.CUSTOM)
        } else if (currentSections?.length > 0) {
            setSelectedFormType(FormType.SECTION)
        }
    }, [currentForm, currentSections])

    const dataEngine = useDataEngine()

    const { loading, elementTypes, refetch } =
        useProgramsStageSectionCustomFormElements(stageId)
    const createProgramStageCustomForm = useCallback(
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
                        resource: `programStages`,
                        id: stageId as string,
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
        [dataEngine, stageId]
    )

    const updateProgramStageCustomForm = useCallback(
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
            ? updateProgramStageCustomForm(data, onSuccess, onError)
            : createProgramStageCustomForm(data, onSuccess, onError)

    return (
        <SectionedFormSection name={name}>
            <StandardFormSectionTitle>{sectionLabel}</StandardFormSectionTitle>
            <StandardFormSectionDescription>
                {isTrackerProgram
                    ? i18n.t(
                          'Configure the form for data collection for events in this program stage.'
                      )
                    : i18n.t(
                          'Configure the form for data collection for events in this program.'
                      )}
            </StandardFormSectionDescription>
            <TabbedFormTypePicker
                sectionsLength={currentSections?.length}
                hasDataEntryForm={!!currentForm}
                hasDataToDisplay={hasDataElements}
                onFormTypeChange={setSelectedFormType}
                selectedFormType={selectedFormType}
                modelId={stageId}
            >
                {selectedFormType === FormType.DEFAULT && (
                    <div className={styles.basicFormDetails}>
                        <StandardFormSectionTitle>
                            {i18n.t('Basic form')}
                        </StandardFormSectionTitle>
                        <div className={styles.basicFormDescription}>
                            {isTrackerProgram
                                ? i18n.t(
                                      'This form displays an auto-generated list of the data elements defined for this program stage.'
                                  )
                                : i18n.t(
                                      'This form displays an auto-generated list of the data elements defined for this program.'
                                  )}
                        </div>
                        <div>
                            <Button
                                secondary
                                small
                                onClick={() => {
                                    if (isTrackerProgram) {
                                        scrollToSection('stageData')
                                    } else {
                                        scrollToSection('data')
                                    }
                                }}
                            >
                                {i18n.t('Edit or rearrange the data elements')}
                            </Button>
                        </div>
                    </div>
                )}
                <div
                    className={cx({
                        [styles['hidden']]:
                            selectedFormType !== FormType.SECTION,
                    })}
                >
                    <SectionFormSectionsList
                        sectionsFieldName={
                            isTrackerProgram
                                ? 'programStageSections'
                                : 'programStages[0].programStageSections'
                        }
                        withReordering={isTrackerProgram}
                        SectionFormComponent={EditOrNewStageSectionForm}
                        schemaName={SchemaName.programStageSection}
                        level={isSubsection ? 'secondary' : 'primary'}
                        otherProps={{
                            sectionsLength: currentSections?.length ?? 0,
                            stageId: stageId,
                        }}
                        warningNotice={
                            <MandatoryDataElementsWarning
                                missingDataElements={
                                    missingMandatoryDataElements
                                }
                                className={styles.sectionWarningNotice}
                            />
                        }
                    />
                </div>
                <div
                    className={cx({
                        [styles['hidden']]:
                            selectedFormType !== FormType.CUSTOM,
                    })}
                >
                    <CustomFormEditEntry
                        level={isSubsection ? 'secondary' : 'primary'}
                        loading={loading}
                        refetch={refetch}
                        elementTypes={elementTypes}
                        updateCustomForm={updateOrCreateCustomForm}
                        customFormTarget={
                            isTrackerProgram ? 'program stage' : 'program'
                        }
                        fieldName={
                            isTrackerProgram
                                ? 'dataEntryForm'
                                : 'programStages[0].dataEntryForm'
                        }
                    />
                </div>
            </TabbedFormTypePicker>
        </SectionedFormSection>
    )
}

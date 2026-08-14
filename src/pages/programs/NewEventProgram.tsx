import { useAlert } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { useQueryClient } from '@tanstack/react-query'
import arrayMutators from 'final-form-arrays'
import React, { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
    DefaultFormFooter,
    DefaultSectionedFormSidebar,
    FormBase,
    SectionedFormErrorNotice,
    SectionedFormLayout,
} from '../../components'
import {
    createFormError,
    SectionedFormProvider,
    SECTIONS_MAP,
    trimTrimmableFields,
    useCreateModel,
    useNavigateWithSearchState,
} from '../../lib'
import { defaultNavigateTo, EnhancedOnSubmit } from '../../lib/form/useOnSubmit'
import { ProgramValues } from './EditTrackerProgram'
import { eventProgramInitialValues, eventProgramValidate } from './form'
import { EventProgramFormContents } from './form/eventProgram/EventProgramFormContents'
import { EventProgramFormDescriptor } from './form/eventProgram/eventProgramFormDescriptor'

type NewEventProgramOptions = {
    readonly onSubmitted?: () => void
    readonly footer?: React.ReactNode
    readonly redirectOnSubmitted?: boolean
}

const useOnSubmitEventProgram = ({
    onSubmitted,
    redirectOnSubmitted = true,
}: Pick<
    NewEventProgramOptions,
    'onSubmitted' | 'redirectOnSubmitted'
>): EnhancedOnSubmit<ProgramValues> => {
    const createProgramStage = useCreateModel(
        SECTIONS_MAP.programStage.namePlural
    )
    const createProgram = useCreateModel(SECTIONS_MAP.program.namePlural)
    const queryClient = useQueryClient()
    const saveAlert = useAlert(
        ({ message }) => message,
        (options) => options
    )
    const navigate = useNavigateWithSearchState()
    const [searchParams] = useSearchParams()

    return useMemo(
        () => async (values, _form, options) => {
            const { programStages, ...programValues } = values

            const programResponse = await createProgram(
                trimTrimmableFields(programValues)
            )
            if (programResponse.error) {
                return createFormError(programResponse.error)
            }

            const stage = {
                ...programStages[0],
                program: {
                    id: (programResponse.data as { response: { uid: string } })
                        ?.response.uid,
                },
                name: programValues.name,
            }

            const programStageResponse = await createProgramStage(stage)
            if (programStageResponse.error) {
                return createFormError(programStageResponse.error)
            }
            saveAlert.show({
                message: i18n.t('Created successfully'),
                success: true,
            })
            queryClient.invalidateQueries({
                queryKey: [
                    { resource: SECTIONS_MAP.program.namePlural },
                    { resource: SECTIONS_MAP.programStage.namePlural },
                ],
            })

            if (redirectOnSubmitted) {
                const navTo = defaultNavigateTo({
                    section: SECTIONS_MAP.program,
                    submitAction: options?.submitAction,
                    responseData: programResponse.data,
                    searchParams,
                })
                if (navTo) {
                    navigate(navTo)
                }
            }
            onSubmitted?.()
            return programResponse
        },
        [
            createProgramStage,
            createProgram,
            queryClient,
            navigate,
            saveAlert,
            searchParams,
            onSubmitted,
            redirectOnSubmitted,
        ]
    )
}

export const NewEventProgram = ({
    onSubmitted,
    footer,
    redirectOnSubmitted = true,
}: NewEventProgramOptions = {}) => {
    const onSubmit = useOnSubmitEventProgram({
        onSubmitted,
        redirectOnSubmitted,
    })
    return (
        <FormBase
            onSubmit={onSubmit}
            initialValues={eventProgramInitialValues}
            validate={eventProgramValidate}
            subscription={{}}
            mutators={{ ...arrayMutators }}
            section={SECTIONS_MAP.program}
        >
            {({ handleSubmit }) => {
                return (
                    <SectionedFormProvider
                        formDescriptor={EventProgramFormDescriptor}
                    >
                        <SectionedFormLayout
                            sidebar={<DefaultSectionedFormSidebar />}
                            footer={footer}
                        >
                            <form onSubmit={handleSubmit}>
                                <EventProgramFormContents />
                                {!footer && <DefaultFormFooter />}
                            </form>
                            <SectionedFormErrorNotice />
                        </SectionedFormLayout>
                    </SectionedFormProvider>
                )
            }}
        </FormBase>
    )
}

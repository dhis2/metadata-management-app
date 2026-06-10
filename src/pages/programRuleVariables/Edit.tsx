import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { useParams } from 'react-router-dom'
import {
    DefaultFormFooter,
    DefaultSectionedFormSidebar,
    FormBase,
    SectionedFormErrorNotice,
    SectionedFormLayout,
} from '../../components'
import {
    SectionedFormProvider,
    SECTIONS_MAP,
    useBoundResourceQueryFn,
    useOnSubmitEdit,
} from '../../lib'
import {
    fieldFilters,
    ProgramRuleVariableFormValues,
} from './form/fieldFilters'
import { ProgramRuleVariableFormDescriptor } from './form/formDescriptor'
import { ProgramRuleVariableFormFields } from './form/ProgramRuleVariableFormFields'
import { validate } from './form/programRuleVariableSchema'

export const Component = () => {
    const modelId = useParams().id as string
    const section = SECTIONS_MAP.programRuleVariable
    const queryFn = useBoundResourceQueryFn()

    const query = {
        resource: 'programRuleVariables',
        id: modelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }

    const programRuleVariableQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<ProgramRuleVariableFormValues>,
    })

    const initialValues = programRuleVariableQuery.data

    return (
        <FormBase
            onSubmit={useOnSubmitEdit({ section, modelId })}
            initialValues={initialValues}
            section={section}
            includeAttributes={false}
            validate={validate}
            subscription={{}}
        >
            {({ handleSubmit }) => {
                return (
                    <SectionedFormProvider
                        formDescriptor={ProgramRuleVariableFormDescriptor}
                    >
                        <SectionedFormLayout
                            sidebar={<DefaultSectionedFormSidebar />}
                        >
                            <form onSubmit={handleSubmit}>
                                <ProgramRuleVariableFormFields />
                                <DefaultFormFooter cancelTo="/programRuleVariables" />
                            </form>
                            <SectionedFormErrorNotice />
                        </SectionedFormLayout>
                    </SectionedFormProvider>
                )
            }}
        </FormBase>
    )
}

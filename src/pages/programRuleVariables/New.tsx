import React from 'react'
import {
    DefaultFormFooter,
    DefaultSectionedFormSidebar,
    FormBase,
    SectionedFormErrorNotice,
    SectionedFormLayout,
} from '../../components'
import { SectionedFormProvider, SECTIONS_MAP, useOnSubmitNew } from '../../lib'
import { ProgramRuleVariableFormDescriptor } from './form/formDescriptor'
import { ProgramRuleVariableFormFields } from './form/ProgramRuleVariableFormFields'
import { initialValues, validate } from './form/programRuleVariableSchema'

export const Component = () => {
    const section = SECTIONS_MAP.programRuleVariable

    return (
        <FormBase
            onSubmit={useOnSubmitNew({ section })}
            initialValues={initialValues}
            section={section}
            includeAttributes={false}
            subscription={{}}
            validate={validate}
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

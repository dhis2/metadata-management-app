import React from 'react'
import {
    DefaultFormFooter,
    DefaultSectionedFormSidebar,
    FormBase,
    SectionedFormErrorNotice,
    SectionedFormLayout,
} from '../../components'
import { SectionedFormProvider, SECTIONS_MAP, useOnSubmitNew } from '../../lib'
import { ValidationRuleFormDescriptor } from './form/formDescriptor'
import ValidationRuleFormFields from './form/ValidationRuleFormFields'
import { initialValues, validate } from './form/validationRuleSchema'

const section = SECTIONS_MAP.validationRule

export const Component = ({
    onSubmitted,
    footer,
    redirectOnSubmitted = true,
}: {
    readonly onSubmitted?: () => void
    readonly footer?: React.ReactNode
    readonly redirectOnSubmitted?: boolean
} = {}) => {
    return (
        <FormBase
            onSubmit={useOnSubmitNew({
                section,
                onSubmitted,
                redirectOnSubmitted,
            })}
            initialValues={initialValues}
            validate={validate}
            section={section}
        >
            {({ handleSubmit }) => {
                return (
                    <SectionedFormProvider
                        formDescriptor={ValidationRuleFormDescriptor}
                    >
                        <SectionedFormLayout
                            sidebar={<DefaultSectionedFormSidebar />}
                            footer={footer}
                        >
                            <form onSubmit={handleSubmit}>
                                <ValidationRuleFormFields />
                                {!footer && (
                                    <DefaultFormFooter cancelTo="/validationRules" />
                                )}
                            </form>
                            <SectionedFormErrorNotice />
                        </SectionedFormLayout>
                    </SectionedFormProvider>
                )
            }}
        </FormBase>
    )
}

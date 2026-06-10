import React from 'react'
import {
    DefaultSectionedFormSidebar,
    FormBase,
    SectionedFormErrorNotice,
    SectionedFormLayout,
} from '../../components'
import { DefaultFormFooter } from '../../components/form/DefaultFormFooter'
import { SectionedFormProvider, SECTIONS_MAP, useOnSubmitNew } from '../../lib'
import { ProgramIndicatorFormDescriptor } from './form/formDescriptor'
import { ProgramIndicatorsFormFields } from './form/ProgramIndicatorFormFields'
import { initialValues, validate } from './form/programIndicatorsFormSchema'

const section = SECTIONS_MAP.programIndicator

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
            subscription={{}}
        >
            {({ handleSubmit }) => {
                return (
                    <SectionedFormProvider
                        formDescriptor={ProgramIndicatorFormDescriptor}
                    >
                        <SectionedFormLayout
                            sidebar={<DefaultSectionedFormSidebar />}
                        >
                            <form onSubmit={handleSubmit}>
                                <ProgramIndicatorsFormFields />
                                {footer ?? (
                                    <DefaultFormFooter cancelTo="/programIndicators" />
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

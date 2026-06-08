import React from 'react'
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
    useOnSubmitNewWithGroups,
} from '../../lib'
import { IndicatorFormDescriptor } from './form/formDescriptor'
import { IndicatorFormFields } from './form/IndicatorFormFields'
import { initialValues, validate } from './form/indicatorSchema'

const section = SECTIONS_MAP.indicator

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
            onSubmit={useOnSubmitNewWithGroups({
                section,
                groupResource: 'indicatorGroups',
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
                        formDescriptor={IndicatorFormDescriptor}
                    >
                        <SectionedFormLayout
                            sidebar={<DefaultSectionedFormSidebar />}
                        >
                            <form onSubmit={handleSubmit}>
                                <IndicatorFormFields />
                                {footer ?? (
                                    <DefaultFormFooter cancelTo="/indicators" />
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

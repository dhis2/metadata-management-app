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

export const Component = () => {
    return (
        <FormBase
            onSubmit={useOnSubmitNewWithGroups({
                section,
                groupResource: 'indicatorGroups',
            })}
            initialValues={initialValues}
            validate={validate}
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
                                <DefaultFormFooter cancelTo="/indicators" />
                            </form>
                            <SectionedFormErrorNotice />
                        </SectionedFormLayout>
                    </SectionedFormProvider>
                )
            }}
        </FormBase>
    )
}

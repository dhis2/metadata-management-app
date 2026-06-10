import React from 'react'
import { FormBase } from '../../components'
import { DefaultNewFormContents } from '../../components/form/DefaultFormContents'
import { SECTIONS_MAP, useOnSubmitNew } from '../../lib'
import IndicatorGroupFormFields from './form/IndicatorGroupFormFields'
import { initialValues, validate } from './form/indicatorGroupSchema'

const section = SECTIONS_MAP.indicatorGroup

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
            <DefaultNewFormContents section={section} footer={footer}>
                <IndicatorGroupFormFields />
            </DefaultNewFormContents>
        </FormBase>
    )
}

import React from 'react'
import { FormBase } from '../../components'
import { DefaultNewFormContents } from '../../components/form/DefaultFormContents'
import { SECTIONS_MAP, useOnSubmitNew } from '../../lib'
import DataApprovalLevelFormFields from './form/DataApprovalLevelFormFields'
import { initialValues, validate } from './form/dataApprovalLevelsSchema'

const section = SECTIONS_MAP.dataApprovalLevel

export const Component = () => {
    return (
        <FormBase
            onSubmit={useOnSubmitNew({ section })}
            initialValues={initialValues}
            validate={validate}
            includeAttributes={false}
        >
            <DefaultNewFormContents section={section}>
                <DataApprovalLevelFormFields />
            </DefaultNewFormContents>
        </FormBase>
    )
}

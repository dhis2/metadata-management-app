import i18n from '@dhis2/d2-i18n'
import { InputFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field as FieldRFF } from 'react-final-form'
import {
    StandardFormField,
    ExpressionBuilderEntry,
    MissingValueStrategyField,
} from '../../../components'
import { PaddedContainer } from '../../../components/ExpressionBuilder/PaddedContainer'
import { SchemaName, SchemaSection } from '../../../lib'
import css from './PredictorFormFields.module.css'

const expressionSchemaSection = {
    name: 'expression' as SchemaName,
    namePlural: 'expressions',
} as SchemaSection

export const ExpressionFields = ({
    fieldName,
    objectName,
    validationResource,
    showMissingValueStrategy,
    clearable = false,
    required = true,
}: {
    fieldName: string
    objectName: string
    validationResource: string
    showMissingValueStrategy: boolean
    clearable?: boolean
    required?: boolean
}) => {
    const title = objectName
        ? objectName.charAt(0).toUpperCase() + objectName.slice(1)
        : undefined
    return (
        <div className={css.expressionContainer}>
            <PaddedContainer title={title}>
                <StandardFormField>
                    <ExpressionBuilderEntry
                        fieldName={`${fieldName}.expression`}
                        title={i18n.t('Edit {{objectName}} expression', {
                            objectName,
                        })}
                        editButtonText={i18n.t(
                            'Edit {{objectName}} expression',
                            { objectName }
                        )}
                        setUpButtonText={i18n.t(
                            'Set up {{objectName}} expression',
                            { objectName }
                        )}
                        validationResource={validationResource}
                        validateSchemaSection={expressionSchemaSection}
                        validateProperty="expression"
                        clearable={clearable}
                        type="predictor"
                    />
                </StandardFormField>
                <StandardFormField>
                    <FieldRFF<string | undefined>
                        component={InputFieldFF}
                        inputWidth="400px"
                        name={`${fieldName}.description`}
                        dataTest={`formfields-${fieldName}.description`}
                        label={i18n.t('Description')}
                        helpText={i18n.t(
                            'Summarize what this {{objectName}} measures.',
                            { objectName }
                        )}
                        required={required}
                    />
                </StandardFormField>
                {showMissingValueStrategy && (
                    <StandardFormField>
                        <MissingValueStrategyField fieldName="generator" />
                    </StandardFormField>
                )}
            </PaddedContainer>
        </div>
    )
}

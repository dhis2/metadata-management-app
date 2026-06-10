import i18n from '@dhis2/d2-i18n'
import { InputFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field as FieldRFF } from 'react-final-form'
import { StandardFormField, ExpressionBuilderEntry } from '../../../components'
import { PaddedContainer } from '../../../components/ExpressionBuilder/PaddedContainer'
import { SECTIONS_MAP } from '../../../lib'
import css from './NumeratorDenominatorFields.module.css'

export const NumeratorDenominatorFields = ({
    fieldName,
    objectName,
    validationResource,
}: {
    fieldName: string
    objectName: string
    validationResource: string
}) => {
    const title = objectName
        ? objectName.charAt(0).toUpperCase() + objectName.slice(1)
        : undefined
    return (
        <div className={css.expressionContainer}>
            <PaddedContainer title={title}>
                <StandardFormField>
                    <ExpressionBuilderEntry
                        fieldName={fieldName}
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
                        validateSchemaSection={SECTIONS_MAP.indicator}
                        type="indicator"
                    />
                </StandardFormField>
                <StandardFormField>
                    <FieldRFF<string | undefined>
                        component={InputFieldFF}
                        inputWidth="400px"
                        name={`${fieldName}Description`}
                        dataTest={`formfields-${fieldName}Description`}
                        label={i18n.t('Description')}
                        helpText={i18n.t(
                            'Summarize what this {{objectName}} measures.',
                            { objectName }
                        )}
                    />
                </StandardFormField>
            </PaddedContainer>
        </div>
    )
}

import i18n from '@dhis2/d2-i18n'
import { Button, ButtonStrip, TextAreaFieldFF } from '@dhis2/ui'
import React, { useCallback, useEffect, useState } from 'react'
import { useField } from 'react-final-form'
import { useParams } from 'react-router-dom'
import { SchemaSection, useSectionHandle } from '../../lib'
import { useValidator } from '../../lib/models/useFieldValidators'
import { ExpressionBuilder } from './ExpressionBuilder'
import styles from './ExpressionBuilder.module.css'
import { ExpressionBuilderType } from './types'
import { useExpressionValidator } from './useExpressionValidator'

type ExpressionBuilderEntryProps = Readonly<{
    fieldName: string
    title: string
    editButtonText: string
    setUpButtonText: string
    clearButtonText?: string
    validationResource: string
    descriptionFieldName?: string
    helpText?: string
    validateSchemaSection?: SchemaSection
    validateProperty?: string
    clearable?: boolean
    programId?: string
    programType?: string
    type?: ExpressionBuilderType
    disabled?: boolean
}>

export const ExpressionBuilderEntry = ({
    fieldName,
    title,
    editButtonText,
    setUpButtonText,
    clearButtonText = i18n.t('Clear expression'),
    validationResource,
    validateSchemaSection,
    validateProperty,
    clearable = false,
    programId,
    programType,
    type = 'default',
    disabled = false,
}: ExpressionBuilderEntryProps) => {
    const [showExpressionBuilder, setShowExpressionBuilder] = useState(false)

    const [initialExpressionValidation] = useExpressionValidator(
        validationResource,
        programId
    )
    const [expressionDescription, setExpressionDescription] = useState<
        string | undefined
    >(undefined)
    const descriptionToShow = expressionDescription
    const schema = useSectionHandle() as SchemaSection

    const schemaValidate = useValidator({
        schemaSection: validateSchemaSection ?? schema,
        property: validateProperty ?? fieldName,
    })
    const params = useParams()
    const isEdit = !!params?.id

    const { input, meta } = useField<string>(fieldName, {
        validate: schemaValidate,
    })

    const clearExpression = useCallback(() => {
        input.onChange('')
        setExpressionDescription(undefined)
        input?.onBlur()
    }, [setExpressionDescription, input])

    useEffect(() => {
        const performInitialValidation = async () => {
            if (input.value && initialExpressionValidation !== undefined) {
                const initialValidation = await initialExpressionValidation(
                    input.value
                )
                setExpressionDescription(
                    initialValidation?.expressionDescription ??
                        i18n.t('Invalid expression')
                )
            }
        }
        performInitialValidation()
    }, [input.value, initialExpressionValidation])

    return (
        <div>
            <div className={styles.expression}>
                {(isEdit || descriptionToShow) && (
                    <div
                        className={styles.expressionBox}
                        data-test={`${fieldName}-expression-description`}
                    >
                        {descriptionToShow || i18n.t('(No Value)')}
                    </div>
                )}
                <TextAreaFieldFF
                    dataTest={`formfields-${fieldName}`}
                    input={input}
                    meta={meta}
                    inputWidth="400px"
                    disabled
                    className={styles.expressionHiddenInput}
                />
            </div>

            <div className={styles.buttonWrapper}>
                <ButtonStrip>
                    <Button
                        small
                        secondary
                        onClick={() => {
                            setShowExpressionBuilder(true)
                        }}
                        dataTest={`edit-${fieldName}-expression-button`}
                        disabled={disabled}
                    >
                        {isEdit || descriptionToShow
                            ? editButtonText
                            : setUpButtonText}
                    </Button>
                    {clearable && descriptionToShow && !disabled && (
                        <Button small secondary onClick={clearExpression}>
                            {clearButtonText}
                        </Button>
                    )}
                </ButtonStrip>
            </div>

            {showExpressionBuilder && (
                <ExpressionBuilder
                    title={title}
                    onClose={() => setShowExpressionBuilder(false)}
                    initialValue={input.value}
                    fieldName={fieldName}
                    validationResource={validationResource}
                    programId={programId}
                    programType={programType}
                    type={type}
                    clearable={clearable}
                    clearExpression={clearExpression}
                />
            )}
        </div>
    )
}

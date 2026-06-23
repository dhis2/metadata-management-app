import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    IconInfo16,
    NoticeBox,
    Modal,
    ModalContent,
    ModalTitle,
    ModalActions,
} from '@dhis2/ui'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useField } from 'react-final-form'
import { StandardFormField } from '../standardForm'
import styles from './ExpressionBuilder.module.css'
import { ExpressionBuilderType } from './types'
import {
    useExpressionValidator,
    ValidationResult,
} from './useExpressionValidator'
import { VariableSelectionBox } from './VariableSelectionBox'

const ValidationBox = ({
    response,
    validating,
    validatedValue,
    validate,
    isEmpty,
    clearable,
}: {
    response: ValidationResult | null
    validating: boolean
    isEmpty: boolean
    validatedValue: string | null
    validate: () => void
    clearable: boolean
}) => {
    if (isEmpty) {
        return clearable ? null : (
            <NoticeBox
                error
                title={i18n.t('Expression cannot be empty')}
            ></NoticeBox>
        )
    }
    if (!response || validating) {
        // the button here does not do anything, but will cause the input to blur (and validate) if clicked
        return (
            <NoticeBox title={i18n.t('Expression not yet validated')}>
                <Button
                    disabled={validating}
                    small
                    loading={validating}
                    onClick={validate}
                    dataTest="expression-builder-modal-validate-button"
                >
                    {i18n.t('Validate')}
                </Button>
            </NoticeBox>
        )
    }
    if (response?.error) {
        return (
            <NoticeBox
                dataTest="expression-builder-modal-input-validation"
                warning
                title={i18n.t('Invalid expression')}
            >
                <p>{validatedValue}</p>
            </NoticeBox>
        )
    }
    return (
        <NoticeBox valid title={i18n.t('Valid expression')}>
            <div className={styles.validExpressionDescription}>
                {response?.expressionDescription}
            </div>
        </NoticeBox>
    )
}

export const ExpressionBuilder = ({
    fieldName,
    validationResource,
    onClose,
    title,
    initialValue,
    programId,
    type,
    clearable,
    clearExpression,
}: {
    fieldName: string
    validationResource: string
    onClose: () => void
    title: string
    initialValue: string
    programId?: string
    type: ExpressionBuilderType
    clearable: boolean
    clearExpression?: () => void
}) => {
    const { input: expressionInput } = useField(fieldName)
    const expressionRef = useRef<HTMLTextAreaElement>(null)

    const [validate, validating, validatedValue] = useExpressionValidator(
        validationResource,
        programId
    )
    const [validationResponse, setValidationResponse] =
        useState<ValidationResult | null>(null)
    const [isEmpty, setIsEmpty] = useState<boolean>(false)
    const [initiallyValidated, setInitiallyValidated] = useState<boolean>(false)

    const validateCurrentState = useCallback(async () => {
        const currentText = expressionRef?.current?.value
        if (currentText === '') {
            setIsEmpty(true)
            return false
        }
        setIsEmpty(false)
        const result = await validate(currentText)
        setValidationResponse(result ?? null)
        return !result?.error
    }, [validate])

    const clearValidationState = useCallback(() => {
        setIsEmpty(false)
        setValidationResponse(null)
    }, [setIsEmpty, setValidationResponse])

    const performInitialValidation = useCallback(
        async (s: string) => {
            if (
                !validate ||
                !setValidationResponse ||
                !setIsEmpty ||
                !setInitiallyValidated
            ) {
                return
            }
            if (s.trim() === '') {
                setIsEmpty(true)
            } else {
                const result = await validate(s)
                setValidationResponse(result ?? null)
            }
            setInitiallyValidated(true)
        },
        [setIsEmpty, setValidationResponse, setInitiallyValidated, validate]
    )

    useEffect(() => {
        performInitialValidation(initialValue)
    }, [initialValue, performInitialValidation])

    return (
        <Modal onClose={onClose} fluid dataTest="expression-builder-modal">
            <div
                className={styles.expressionBuilderModalDimensions}
                id="expression-builder-modal"
            >
                <ModalTitle>{title}</ModalTitle>

                <ModalContent>
                    <div className={styles.expressionBuilderContentContainer}>
                        <div className={styles.expressionBuilderEntryContainer}>
                            <div className={styles.expressionField}>
                                <StandardFormField dataTest="expression-entry-textfield">
                                    <textarea
                                        ref={expressionRef}
                                        defaultValue={initialValue}
                                        onChange={(e) => {
                                            if (
                                                e?.target?.value.trim() === ''
                                            ) {
                                                setIsEmpty(true)
                                            } else {
                                                setValidationResponse(null)
                                                setIsEmpty(false)
                                            }
                                        }}
                                        aria-describedby="messageTemplate-help"
                                    />
                                </StandardFormField>
                            </div>
                            <div>
                                {initiallyValidated && (
                                    <ValidationBox
                                        response={validationResponse}
                                        validating={validating}
                                        validatedValue={validatedValue}
                                        validate={validateCurrentState}
                                        isEmpty={isEmpty}
                                        clearable={clearable}
                                    />
                                )}

                                <div className={styles.fieldHelpText}>
                                    <IconInfo16 />
                                    <div id="messageTemplate-help">
                                        {i18n.t(
                                            'Add operators, variables or program data from the right sidebar'
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <VariableSelectionBox
                            elementRef={expressionRef}
                            clearValidationState={clearValidationState}
                            programId={programId}
                            type={type}
                        />
                    </div>
                </ModalContent>
                <ModalActions>
                    <ButtonStrip end>
                        <Button
                            onClick={onClose}
                            secondary
                            dataTest="cancel-expression-button"
                        >
                            {i18n.t('Cancel')}
                        </Button>
                        <Button
                            onClick={async () => {
                                if (isEmpty && clearable && clearExpression) {
                                    clearExpression()
                                    onClose?.()
                                    return
                                }
                                let proceed = validationResponse !== null
                                if (validationResponse === null || isEmpty) {
                                    proceed = await validateCurrentState()
                                }
                                if (proceed) {
                                    expressionInput.onChange(
                                        expressionRef?.current?.value ?? ''
                                    )
                                    expressionInput.onBlur()
                                    onClose?.()
                                } else {
                                    // if invalid, the ValidationBox will display warning
                                    return
                                }
                            }}
                            primary
                            dataTest="apply-expression-button"
                            disabled={
                                validating ||
                                (isEmpty && !clearable) ||
                                !initiallyValidated ||
                                !!validationResponse?.error
                            }
                        >
                            {i18n.t('Apply')}
                        </Button>
                    </ButtonStrip>
                </ModalActions>
            </div>
        </Modal>
    )
}

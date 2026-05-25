import i18n from '@dhis2/d2-i18n'
import { Button, IconErrorFilled24, theme } from '@dhis2/ui'
import React, { useRef, useEffect, RefObject } from 'react'
import { Field as FieldRFF, useField, FieldInputProps } from 'react-final-form'
import { StandardFormField } from '../../../components'
import styles from './QueryDefinitionField.module.css'

export type SQLVariables = Record<string, { label: string }>

const SQL_Variables: SQLVariables = {
    _current_user_id: { label: i18n.t('Current user id') },
    _current_username: { label: i18n.t('Current username') },
}

const insertElement = ({
    id,
    elementRef,
    input,
}: {
    id: string
    elementRef: RefObject<HTMLInputElement | HTMLTextAreaElement>
    input: FieldInputProps<string>
}): number | undefined => {
    if (!elementRef.current) {
        return
    }

    const elementText = '${' + id + '}'

    const cursorStartIndex = elementRef.current.selectionStart ?? 0
    const value = elementRef.current.value
    const newText =
        value.slice(0, cursorStartIndex) +
        elementText +
        value.slice(cursorStartIndex)
    input.onChange(newText)

    // force focus then blur to trigger rerun of validations
    elementRef.current.focus()
    elementRef.current.blur()
    elementRef.current.focus()

    return cursorStartIndex + elementText.length
}

export const QueryDefinitionField = ({ isQuery }: { isQuery: boolean }) => {
    const { input: sqlQueryInput } = useField('sqlQuery')

    const sqlQueryRef = useRef<HTMLTextAreaElement>(null)

    const pendingCursorRef = useRef<{
        elementRef: RefObject<HTMLInputElement | HTMLTextAreaElement>
        position: number
    } | null>(null)

    useEffect(() => {
        if (pendingCursorRef.current) {
            const { elementRef, position } = pendingCursorRef.current
            elementRef.current?.setSelectionRange(position, position)
            pendingCursorRef.current = null
        }
    }, [pendingCursorRef.current])

    return (
        <div className={styles.queryContainer}>
            <div className={styles.queryEditContainer}>
                <StandardFormField>
                    <FieldRFF name="sqlQuery">
                        {({ input, meta }) => {
                            const showError = meta.error && meta.touched
                            return (
                                <div data-test="formfields-sqlQuery">
                                    <div className={styles.queryFieldLabel}>
                                        {i18n.t('SQL query *')}
                                    </div>
                                    <div className={styles.queryField}>
                                        <textarea
                                            className={
                                                showError
                                                    ? styles.inputError
                                                    : styles.input
                                            }
                                            {...input}
                                            ref={sqlQueryRef}
                                            aria-describedby="sqlQuery-help"
                                        />
                                        {showError && (
                                            <div className={styles.errorIcon}>
                                                <IconErrorFilled24
                                                    color={theme.error}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    {showError && (
                                        <div
                                            className={styles.errorStyling}
                                            data-test="formfields-sqlQuery-validation"
                                        >
                                            {meta.error}
                                        </div>
                                    )}
                                    <p className={styles.helpText}>
                                        {i18n.t(
                                            'Only SELECT statements allowed. Sensitive tables, including user information, cannot be queried.'
                                        )}
                                    </p>
                                </div>
                            )
                        }}
                    </FieldRFF>
                </StandardFormField>
            </div>

            {isQuery && (
                <div className={styles.queryVariablesContainer}>
                    <div className={styles.templateVariablesText}>
                        {i18n.t('Insert a variable:', { nsSeparator: '~:~' })}
                    </div>
                    {Object.keys(SQL_Variables).map((v) => (
                        <div key={v} className={styles.variableButton}>
                            <Button
                                secondary
                                dataTest={`queryVariable_button_${v}`}
                                small
                                onClick={() => {
                                    const elementRef = sqlQueryRef
                                    const position = insertElement({
                                        id: v,
                                        elementRef,
                                        input: sqlQueryInput,
                                    })
                                    if (position !== undefined) {
                                        pendingCursorRef.current = {
                                            elementRef,
                                            position,
                                        }
                                    }
                                }}
                            >
                                {SQL_Variables[v].label}
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

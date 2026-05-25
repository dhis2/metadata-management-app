import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    InputField,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
} from '@dhis2/ui'
import React, { useState } from 'react'
import css from './VariablePromptModal.module.css'

const BUILT_IN_TOKENS = new Set(['_current_user_id', '_current_username'])

const VARIABLE_PATTERN = /\$\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g

export const extractUserDefinedVariables = (sql: string): string[] => {
    if (!sql) {
        return []
    }
    const found = new Set<string>()
    let match: RegExpExecArray | null
    VARIABLE_PATTERN.lastIndex = 0
    while ((match = VARIABLE_PATTERN.exec(sql)) !== null) {
        const name = match[1]
        if (!BUILT_IN_TOKENS.has(name)) {
            found.add(name)
        }
    }
    return Array.from(found)
}

type Props = {
    variables: string[]
    onCancel: () => void
    onSubmit: (values: Record<string, string>) => void
}

export const VariablePromptModal = ({
    variables,
    onCancel,
    onSubmit,
}: Props) => {
    const [values, setValues] = useState<Record<string, string>>(() =>
        Object.fromEntries(variables.map((name) => [name, '']))
    )

    const allFilled = variables.every((name) => values[name].trim().length > 0)

    return (
        <Modal onClose={onCancel} small position="middle">
            <ModalTitle>{i18n.t('Query variables')}</ModalTitle>
            <ModalContent>
                <div className={css.modalContent}>
                    {variables.map((name) => (
                        <InputField
                            key={name}
                            label={`\${${name}}`}
                            value={values[name]}
                            onChange={({ value }) =>
                                setValues((prev) => ({
                                    ...prev,
                                    [name]: value ?? '',
                                }))
                            }
                            dataTest={`variable-input-${name}`}
                        />
                    ))}
                </div>
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button onClick={onCancel} secondary>
                        {i18n.t('Cancel')}
                    </Button>
                    <Button
                        primary
                        disabled={!allFilled}
                        onClick={() => onSubmit(values)}
                        dataTest="variable-prompt-submit"
                    >
                        {i18n.t('Run query')}
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}

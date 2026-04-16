import i18n from '@dhis2/d2-i18n'
import { Box } from '@dhis2/ui'
import React from 'react'
import { ExpressionBuilderEntry } from '../../../components'
import { PaddedContainer } from '../../../components/ExpressionBuilder/PaddedContainer'
import { TooltipWrapper } from '../../../components/tooltip'
import { SchemaName, SchemaSection } from '../../../lib'
import styles from '../form/actions/ProgramRuleActionForm.module.css'

const programRuleActionSchemaSection = {
    name: 'programRuleAction' as SchemaName,
    namePlural: 'programRuleActions',
} as SchemaSection

export function ExpressionField({
    fieldName = 'data',
    label,
    programId,
    clearable = true,
    disabled = false,
    required = false,
}: Readonly<{
    fieldName?: string
    label: string
    programId?: string
    clearable?: boolean
    disabled?: boolean
    required?: boolean
}>) {
    return (
        <TooltipWrapper
            condition={!!disabled}
            content={i18n.t('Expression can not be edited after saving')}
        >
            <Box width="800px" minWidth="100px">
                <PaddedContainer
                    title={
                        required ? i18n.t('Expression *') : i18n.t('Expression')
                    }
                >
                    <ExpressionBuilderEntry
                        fieldName={fieldName}
                        title={i18n.t('Edit expression')}
                        editButtonText={i18n.t('Edit expression')}
                        setUpButtonText={i18n.t('Set up expression')}
                        validationResource="programRuleActions/data/expression/description"
                        clearable={clearable}
                        programId={programId}
                        type="programRule"
                        validateSchemaSection={programRuleActionSchemaSection}
                        validateProperty={fieldName}
                        disabled={disabled}
                    />
                </PaddedContainer>
                <span className={styles.expressionLabel}>{label}</span>
            </Box>
        </TooltipWrapper>
    )
}

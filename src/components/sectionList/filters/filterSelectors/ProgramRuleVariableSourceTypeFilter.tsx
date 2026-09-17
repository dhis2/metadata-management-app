import i18n from '@dhis2/d2-i18n'
import { SingleSelect, SingleSelectOption } from '@dhis2/ui'
import React, { useEffect, useState } from 'react'
import { getConstantTranslation, useSectionListFilter } from '../../../../lib'
import { ProgramRuleVariableSourceType } from '../../../../types/generated/models'
import css from './Filters.module.css'

const SOURCE_TYPES = [
    {
        value: ProgramRuleVariableSourceType.DATAELEMENT_NEWEST_EVENT_PROGRAM_STAGE,
        label: getConstantTranslation(
            ProgramRuleVariableSourceType.DATAELEMENT_NEWEST_EVENT_PROGRAM_STAGE
        ),
    },
    {
        value: ProgramRuleVariableSourceType.DATAELEMENT_NEWEST_EVENT_PROGRAM,
        label: getConstantTranslation(
            ProgramRuleVariableSourceType.DATAELEMENT_NEWEST_EVENT_PROGRAM
        ),
    },
    {
        value: ProgramRuleVariableSourceType.DATAELEMENT_CURRENT_EVENT,
        label: getConstantTranslation(
            ProgramRuleVariableSourceType.DATAELEMENT_CURRENT_EVENT
        ),
    },
    {
        value: ProgramRuleVariableSourceType.DATAELEMENT_PREVIOUS_EVENT,
        label: getConstantTranslation(
            ProgramRuleVariableSourceType.DATAELEMENT_PREVIOUS_EVENT
        ),
    },
    {
        value: ProgramRuleVariableSourceType.CALCULATED_VALUE,
        label: getConstantTranslation(
            ProgramRuleVariableSourceType.CALCULATED_VALUE
        ),
    },
    {
        value: ProgramRuleVariableSourceType.TEI_ATTRIBUTE,
        label: getConstantTranslation(
            ProgramRuleVariableSourceType.TEI_ATTRIBUTE
        ),
    },
]

export const ProgramRuleVariableSourceTypeFilter = () => {
    const [filter, setFilter] = useSectionListFilter(
        'programRuleVariableSourceType'
    )
    const [value, setValue] = useState(filter || '')

    const handleChange = ({ selected }: { selected: string }) => {
        setValue(selected)
        setFilter(selected || undefined)
    }

    useEffect(() => {
        if (!filter) {
            setValue('')
        }
    }, [filter])

    return (
        <SingleSelect
            className={css.identifiableSelectionFilter}
            selected={value}
            placeholder={i18n.t('Select source type')}
            onChange={handleChange}
            dense
            dataTest="select-source-type"
        >
            <SingleSelectOption
                key="none"
                label={i18n.t('All source types')}
                value=""
            />
            {SOURCE_TYPES.map(({ value, label }) => (
                <SingleSelectOption key={value} label={label} value={value} />
            ))}
        </SingleSelect>
    )
}

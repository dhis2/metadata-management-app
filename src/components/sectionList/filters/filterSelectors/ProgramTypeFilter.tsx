import i18n from '@dhis2/d2-i18n'
import { SingleSelect, SingleSelectOption } from '@dhis2/ui'
import React, { useEffect, useState } from 'react'
import { useSectionListFilter } from '../../../../lib'
import { ProgramType } from '../../../../types/generated/models'
import css from './Filters.module.css'

const PROGRAM_TYPES = [
    {
        value: ProgramType.WITH_REGISTRATION,
        label: i18n.t('Tracker program'),
    },
    {
        value: ProgramType.WITHOUT_REGISTRATION,
        label: i18n.t('Event program'),
    },
]

export const ProgramTypeFilter = () => {
    const [filter, setFilter] = useSectionListFilter('programType')
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
            placeholder={i18n.t('Select program type')}
            onChange={handleChange}
            dense
            dataTest="select-program-type"
        >
            <SingleSelectOption
                key="none"
                label={i18n.t('All program types')}
                value=""
            />
            {PROGRAM_TYPES.map(({ value, label }) => (
                <SingleSelectOption key={value} label={label} value={value} />
            ))}
        </SingleSelect>
    )
}

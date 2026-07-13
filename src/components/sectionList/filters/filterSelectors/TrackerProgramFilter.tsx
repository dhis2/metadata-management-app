import i18n from '@dhis2/d2-i18n'
import React from 'react'
import { useSectionListFilter } from '../../../../lib'
import { createFilterDataQuery } from './createFilterDataQuery'
import { ModelFilterSelect } from './ModelFilter'

const query = {
    result: {
        resource: 'programs',
        params: (params: any) => ({
            ...params,
            fields: ['id', 'displayName'],
            filters: ['programType:eq:WITH_REGISTRATION'],
            order: 'displayName:asc',
            pageSize: 5,
        }),
    },
}

export const TrackerProgramFilter = () => {
    const [filter, setFilter] = useSectionListFilter('program')

    const selected = filter?.[0]

    return (
        <ModelFilterSelect
            placeholder={i18n.t('Program')}
            query={query}
            selected={selected}
            onChange={({ selected }) =>
                setFilter(selected ? [selected] : undefined)
            }
        />
    )
}

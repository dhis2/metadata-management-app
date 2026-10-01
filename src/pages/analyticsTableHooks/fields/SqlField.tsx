import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { TextAreaFieldFF } from '@dhis2/ui'
import React, { useCallback } from 'react'
import { Field } from 'react-final-form'
import { useParams } from 'react-router-dom'
import { AnalyticsTablePhase } from '../../../types/generated'
import { WrapQueryResponse } from '../../../types/query'

type ExistingHook = { id: string; sql: string }

type FormValues = {
    phase?: string
    resourceTableType?: string
    analyticsTableType?: string
}

const phaseToField = {
    [AnalyticsTablePhase.RESOURCE_TABLE_POPULATED]: 'resourceTableType',
    [AnalyticsTablePhase.ANALYTICS_TABLE_POPULATED]: 'analyticsTableType',
} as const satisfies Record<string, 'resourceTableType' | 'analyticsTableType'>

export function SqlField() {
    const engine = useDataEngine()
    const { id: routeId } = useParams<{ id?: string }>()

    const validate = useCallback(
        async (sql?: string, allValues?: FormValues) => {
            const trimmedSql = sql?.trim()
            const phase = allValues?.phase
            if (!trimmedSql || !phase) {
                return undefined
            }

            const targetField = phaseToField[phase as keyof typeof phaseToField]
            if (!targetField) {
                return undefined
            }

            const targetValue = allValues?.[targetField]
            if (!targetValue) {
                return undefined
            }

            const filter = [
                `phase:eq:${phase}`,
                `${targetField}:eq:${targetValue}`,
                ...(routeId ? [`id:ne:${routeId}`] : []),
            ]

            const response = (await engine.query({
                result: {
                    resource: 'analyticsTableHooks',
                    params: { fields: ['id', 'sql'], filter, paging: false },
                },
            })) as WrapQueryResponse<{ analyticsTableHooks: ExistingHook[] }>

            const hits = response.result.analyticsTableHooks ?? []
            return hits.some((hook) => hook.sql?.trim() === trimmedSql)
                ? i18n.t(
                      'An analytics table hook with this table and SQL already exists.'
                  )
                : undefined
        },
        [engine, routeId]
    )

    return (
        <Field
            component={TextAreaFieldFF}
            name="sql"
            label={i18n.t('SQL')}
            required
            inputWidth="400px"
            dataTest="formfields-sql"
            validate={validate}
        />
    )
}

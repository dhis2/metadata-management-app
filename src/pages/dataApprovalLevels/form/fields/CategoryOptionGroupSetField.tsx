import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import React, { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { ModelSingleSelectRefreshableFormField } from '../../../../components/metadataFormControls/ModelSingleSelect/ModelSingleSelectRefreshableField'
import { SECTIONS_MAP } from '../../../../lib'
import { WrapQueryResponse } from '../../../../types/query'

export function CategoryOptionGroupSetField() {
    const engine = useDataEngine()
    const { id: routeId } = useParams<{ id?: string }>()

    const validate = useCallback(
        async (
            value?: { id?: string },
            allValues?: { orgUnitLevel?: number }
        ) => {
            const level = allValues?.orgUnitLevel
            const cogsId = value?.id
            if (level == null || !cogsId) {
                return undefined
            }

            const filter = [
                `orgUnitLevel:eq:${level}`,
                `categoryOptionGroupSet.id:eq:${cogsId}`,
            ]
            if (routeId) {
                filter.push(`id:ne:${routeId}`)
            }

            const response = (await engine.query({
                result: {
                    resource: 'dataApprovalLevels',
                    params: { pageSize: 1, fields: 'id', filter },
                },
            })) as WrapQueryResponse<{ pager: { total: number } }>

            if (response.result.pager.total > 0) {
                return i18n.t(
                    'An approval level for this organisation unit level and category option group set combination already exists.'
                )
            }
            return undefined
        },
        [engine, routeId]
    )

    return (
        <ModelSingleSelectRefreshableFormField
            name="categoryOptionGroupSet"
            label={i18n.t('Category option group set')}
            dataTest="formfields-categoryoptiongroupset"
            query={{
                resource: 'categoryOptionGroupSets',
                params: {
                    fields: ['id', 'displayName'],
                    order: 'displayName:iasc',
                },
            }}
            section={SECTIONS_MAP.categoryOptionGroupSet}
            clearable
            validate={validate}
        />
    )
}

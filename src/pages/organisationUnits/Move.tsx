import i18n from '@dhis2/d2-i18n'
import { Button, ButtonStrip } from '@dhis2/ui'
import { useQuery } from '@tanstack/react-query'
import React, { useEffect, useMemo, useState } from 'react'
import { LinkButton } from '../../components/LinkButton'
import { useLocationWithState } from '../../lib'
import { useBoundResourceQueryFn } from '../../lib/query/useBoundQueryFn'
import css from './move/Move.module.css'
import {
    MoveOrgUnitFormFields,
    OrgUnitTarget,
    SourceOrgUnit,
} from './move/MoveOrgUnitFormFields'
import { MoveOrgUnitSummary } from './move/MoveOrgUnitSummary'

type OrgUnitPathResponse = {
    organisationUnits: Array<{
        id: string
        path: string
        displayName: string
    }>
}

export const Component = () => {
    const location = useLocationWithState<{ selectedModels: Set<string> }>()
    const queryFn = useBoundResourceQueryFn()

    const preselectedIds: string[] = useMemo(
        () => Array.from(location.state?.selectedModels ?? []),
        [location.state?.selectedModels]
    )

    const { data: preselectedData } = useQuery({
        queryKey: [
            {
                resource: 'organisationUnits',
                params: {
                    fields: ['id', 'path', 'displayName'],
                    filter: `id:in:[${preselectedIds.join(',')}]`,
                    paging: false,
                },
            },
        ],
        queryFn: queryFn<OrgUnitPathResponse>,
        enabled: preselectedIds.length > 0,
    })

    const [sources, setSources] = useState<SourceOrgUnit[]>([])
    const [target, setTarget] = useState<OrgUnitTarget | undefined>()

    useEffect(() => {
        if (preselectedData?.organisationUnits) {
            setSources(preselectedData.organisationUnits)
        }
    }, [preselectedData])

    return (
        <div className={css.moveForm}>
            <h2 className={css.title}>{i18n.t('Move organisation units')}</h2>
            <div className={css.description}>
                <p>
                    {i18n.t(
                        'Choose the organisation units to move and their new position in the hierarchy. All descendants move with them.'
                    )}
                </p>
            </div>

            <MoveOrgUnitFormFields
                sources={sources}
                onSourcesChange={setSources}
                target={target}
                onTargetChange={setTarget}
            />

            <MoveOrgUnitSummary sources={sources} target={target} />

            <ButtonStrip className={css.actions}>
                <Button primary disabled={sources.length === 0 || !target}>
                    {i18n.t('Move')}
                </Button>
                <LinkButton secondary to="../">
                    {i18n.t('Cancel')}
                </LinkButton>
            </ButtonStrip>
        </div>
    )
}

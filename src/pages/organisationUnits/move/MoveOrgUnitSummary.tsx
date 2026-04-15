import i18n from '@dhis2/d2-i18n'
import { NoticeBox } from '@dhis2/ui'
import React from 'react'
import css from './Move.module.css'
import { OrgUnitTarget, SourceOrgUnit } from './MoveOrgUnitFormFields'

type MoveOrgUnitSummaryProps = {
    sources: SourceOrgUnit[]
    target: OrgUnitTarget | undefined
}

export const MoveOrgUnitSummary = ({
    sources,
    target,
}: MoveOrgUnitSummaryProps) => {
    if (sources.length === 0) {
        return null
    }

    const summaryTitle = target
        ? i18n.t(
              '{{count}} organisation units, and any units inside, will be moved to {{targetName}}.',
              {
                  count: sources.length,
                  targetName: target.displayName,
                  interpolation: { escapeValue: false },
              }
          )
        : i18n.t(
              '{{count}} organisation units, and any units inside, will be moved. Choose an organisation to move them into.',
              { count: sources.length }
          )

    return (
        <div className={css.summary}>
            <NoticeBox
                className={!target ? css.summaryPlaceholder : undefined}
                title={summaryTitle}
            />
        </div>
    )
}

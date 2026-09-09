import i18n from '@dhis2/d2-i18n'
import React from 'react'
import { OVERVIEW_SECTIONS, SECTIONS_MAP } from '../../lib'
import { SummaryCard, SummaryCardGroup } from './card'
import { OverviewGroup } from './group'

const TITLE = OVERVIEW_SECTIONS.other.titlePlural

export const OtherOverview = () => {
    return (
        <OverviewGroup title={TITLE}>
            {/* <OverviewGroupSummary>
                {i18n.t(
                    'Placeholder for other'
                )}
            </OverviewGroupSummary> */}
            <OtherCardGroup />
        </OverviewGroup>
    )
}

export const OtherCardGroup = ({ showTitle }: { showTitle?: boolean }) => {
    return (
        <SummaryCardGroup
            title={showTitle ? TITLE : undefined}
            section={OVERVIEW_SECTIONS.other}
        >
            <SummaryCard section={SECTIONS_MAP.icon}>
                {i18n.t(
                    'Upload, modify and view icons which can be assigned to other metadata.'
                )}
            </SummaryCard>
            <SummaryCard section={SECTIONS_MAP.attribute}>
                {i18n.t('Create, modify and view attributes.')}
            </SummaryCard>
            <SummaryCard section={SECTIONS_MAP.constant}>
                {i18n.t(
                    'Create constants which can be included in expressions of indicator and validation rules.'
                )}
            </SummaryCard>
            <SummaryCard section={SECTIONS_MAP.externalMapLayer}>
                {i18n.t('Configure external map layers for use in GIS.')}
            </SummaryCard>
            <SummaryCard section={SECTIONS_MAP.legendSet}>
                {i18n.t(
                    'Create, modify and view predefined legends for maps and other visualisations.'
                )}
            </SummaryCard>
            <SummaryCard section={SECTIONS_MAP.document}>
                {i18n.t(
                    'Upload documents or link to external URLs as resources that can be referenced from other apps.'
                )}
            </SummaryCard>
            <SummaryCard section={SECTIONS_MAP.locale}>
                {i18n.t(
                    'Create and manage locales for database content. A locale is a combination of language and country.'
                )}
            </SummaryCard>
            <SummaryCard section={SECTIONS_MAP.pushAnalysis}>
                {i18n.t(
                    'Manage analytics to be emailed to specific user groups on a daily, weekly or monthly basis.'
                )}
            </SummaryCard>
            <SummaryCard section={SECTIONS_MAP.analyticsTableHook}>
                {i18n.t(
                    'Configure hooks in SQL that run during the analytics process.'
                )}
            </SummaryCard>
            <SummaryCard section={SECTIONS_MAP.sqlView}>
                {i18n.t(
                    'Create SQL database views, typically based on resource tables, to provide convenient views for third-party tools.'
                )}
            </SummaryCard>
        </SummaryCardGroup>
    )
}

export const Component = OtherOverview

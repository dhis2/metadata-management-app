import i18n from '@dhis2/d2-i18n'
import React from 'react'
import { OVERVIEW_SECTIONS, SECTIONS_MAP } from '../../lib'
import { SummaryCard, SummaryCardGroup } from './card'
import { OverviewGroup, OverviewGroupSummary } from './group'

const TITLE = i18n.t('Programs')

export const ProgramsOverview = () => {
    return (
        <OverviewGroup title={TITLE}>
            <OverviewGroupSummary>
                {i18n.t(
                    'Programs are used to collect, manage, and analyze event-based and longitudinal data. They allow you to define program stages, track entities such as people or items over time, and apply rules and relationships to support flexible data capture and analysis.'
                )}
            </OverviewGroupSummary>
            <ProgramsCardGroup />
        </OverviewGroup>
    )
}

export const ProgramsCardGroup = ({ showTitle }: { showTitle?: boolean }) => {
    return (
        <SummaryCardGroup
            title={showTitle ? TITLE : undefined}
            section={OVERVIEW_SECTIONS.programs}
        >
            <SummaryCard section={SECTIONS_MAP.program}>
                {i18n.t(
                    'Create, modify and view programs. A program has program stages and defines which actions should be taken at each stage.'
                )}
            </SummaryCard>
            <SummaryCard section={SECTIONS_MAP.trackedEntityAttribute}>
                {i18n.t(
                    'Create, modify and view tracked entity attributes. An attribute can be used to register extra information for a tracked entity.'
                )}
            </SummaryCard>
            <SummaryCard section={SECTIONS_MAP.relationshipType}>
                {i18n.t(
                    'Create, modify and view relationship types. A relationship is typically wife and husband or mother and child.'
                )}
            </SummaryCard>
            <SummaryCard section={SECTIONS_MAP.trackedEntityType}>
                {i18n.t(
                    'Define types of entities which can be tracked through the system, which can be anything from persons to commodities.'
                )}
            </SummaryCard>
            <SummaryCard section={SECTIONS_MAP.programRule}>
                {i18n.t(
                    'Program rules allow you to create and control dynamic behavior of the user interface in the Tracker Capture and Event Capture apps.'
                )}
            </SummaryCard>
            <SummaryCard section={SECTIONS_MAP.programRuleVariable}>
                {i18n.t(
                    'Variables you use to create program rule expressions.'
                )}
            </SummaryCard>
            <SummaryCard
                section={SECTIONS_MAP.programDisaggregation}
                hideNew={true}
            >
                {i18n.t('Set disaggregation mappings for program indicators.')}
            </SummaryCard>
        </SummaryCardGroup>
    )
}

export const Component = ProgramsOverview

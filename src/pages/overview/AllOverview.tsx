import i18n from '@dhis2/d2-i18n'
import React from 'react'
import { CategoryCardGroup } from './Categories'
import { DataApprovalCardGroup } from './DataApproval'
import { DataElementsCardGroup } from './DataElements'
import { DataSetsCardGroup } from './DataSets'
import { OverviewGroup } from './group'
import { IndicatorsCardGroup } from './Indicators'
import { OptionSetsCardGroup } from './OptionSets'
import { OrganisationUnitsCardGroup } from './OrganisationUnits'
import { OtherCardGroup } from './Other'
import { ProgramsCardGroup } from './Programs'
import { ValidationsCardGroup } from './Validations'

export const AllOverview = () => {
    return (
        <OverviewGroup title={i18n.t('Metadata management')}>
            <CategoryCardGroup showTitle={true} />
            <DataElementsCardGroup showTitle={true} />
            <DataSetsCardGroup showTitle={true} />
            <IndicatorsCardGroup showTitle={true} />
            <OrganisationUnitsCardGroup showTitle={true} />
            <ProgramsCardGroup showTitle={true} />
            <OptionSetsCardGroup showTitle={true} />
            <ValidationsCardGroup showTitle={true} />
            <DataApprovalCardGroup showTitle={true} />
            <OtherCardGroup showTitle={true} />
        </OverviewGroup>
    )
}

export const Component = AllOverview
export default AllOverview

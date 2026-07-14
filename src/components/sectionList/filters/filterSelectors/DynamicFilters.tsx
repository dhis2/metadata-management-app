import React from 'react'
import { ConfigurableFilterKey } from '../../../../lib'
import { useFilterKeys } from '../useFilterKeys'
import { FormNameFilter } from './FormNameFilter'
import { IndicatorFilter } from './IndicatorFilter'
import { ProgramTypeFilter } from './ProgramTypeFilter'
import { TrackerProgramFilter } from './TrackerProgramFilter'
import {
    AggregationTypeFilter,
    CategoryComboFilter,
    Categoryfilter,
    CategoryOptionFilter,
    CategoryOptionGroupFilter,
    CategoryOptionGroupSetFilter,
    DataDimensionTypeFilter,
    IndicatorTypeFilter,
    IndicatorGroupFilter,
    IndicatorGroupSetFilter,
    DomainTypeSelectionFilter,
    IgnoreApprovalFilter,
    PublicAccessFilter,
    ValueTypeSelectionFilter,
    FormTypeFilter,
    DataSetFilter,
    DataElementGroupFilter,
    DataElementGroupSetFilter,
    DataElementFilter,
    CompulsoryFilter,
    DataDimensionFilter,
    ProgramFilter,
    ProgramIndicatorFilter,
    ProgramIndicatorGroupFilter,
    OrganisationUnitGroupFilter,
    OrganisationUnitGroupSetFilter,
    ValidationRuleGroupFilter,
    ProgramRuleVariableSourceTypeFilter,
} from '.'

type FilterKeyToComponentMap = Partial<Record<ConfigurableFilterKey, React.FC>>

const filterKeyToComponentMap: FilterKeyToComponentMap = {
    aggregationType: AggregationTypeFilter,
    category: Categoryfilter,
    categoryCombo: CategoryComboFilter,
    categoryOption: CategoryOptionFilter,
    categoryOptionGroup: CategoryOptionGroupFilter,
    categoryOptionGroupSet: CategoryOptionGroupSetFilter,
    compulsory: CompulsoryFilter,
    dataDimension: DataDimensionFilter,
    dataDimensionType: DataDimensionTypeFilter,
    dataElement: DataElementFilter,
    dataElementGroup: DataElementGroupFilter,
    dataElementGroupSet: DataElementGroupSetFilter,
    dataSet: DataSetFilter,
    domainType: DomainTypeSelectionFilter,
    formName: FormNameFilter,
    formType: FormTypeFilter,
    ignoreApproval: IgnoreApprovalFilter,
    indicator: IndicatorFilter,
    indicatorGroup: IndicatorGroupFilter,
    indicatorGroupSet: IndicatorGroupSetFilter,
    indicatorType: IndicatorTypeFilter,
    organisationUnitGroup: OrganisationUnitGroupFilter,
    organisationUnitGroupSet: OrganisationUnitGroupSetFilter,
    program: ProgramFilter,
    trackerProgram: TrackerProgramFilter,
    programType: ProgramTypeFilter,
    programIndicator: ProgramIndicatorFilter,
    programIndicatorGroup: ProgramIndicatorGroupFilter,
    programRuleVariableSourceType: ProgramRuleVariableSourceTypeFilter,
    publicAccess: PublicAccessFilter,
    valueType: ValueTypeSelectionFilter,
    validationRuleGroup: ValidationRuleGroupFilter,
}

export const DynamicFilters = () => {
    const filterKeys = useFilterKeys()

    return (
        <>
            {filterKeys.map((filterKey) => {
                const FilterComponent = filterKeyToComponentMap[filterKey]
                return FilterComponent ? (
                    <span data-test="dynamic-filter" key={filterKey}>
                        <FilterComponent key={filterKey} />
                    </span>
                ) : null
            })}
        </>
    )
}

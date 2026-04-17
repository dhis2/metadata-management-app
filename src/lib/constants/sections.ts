import i18n from '@dhis2/d2-i18n'
import {
    SectionMap,
    Section,
    SchemaSection,
    SchemaName,
    SchemaSectionMap,
    SchemaAuthorityType,
    OverviewSectionMap,
    OverviewSection,
    NonSchemaSection,
} from '../../types'

// for convenience so types can be imported with the map below
export type {
    SectionMap,
    Section,
    SchemaSection,
    SchemaSectionMap,
    NonSchemaSection,
}

export const SCHEMA_SECTIONS = {
    category: {
        name: SchemaName.category,
        namePlural: 'categories',
        title: i18n.t('Category'),
        titlePlural: i18n.t('Categories'),
        parentSectionKey: 'category',
        duplicable: true,
    },
    categoryOption: {
        name: SchemaName.categoryOption,
        namePlural: 'categoryOptions',
        title: i18n.t('Category option'),
        titlePlural: i18n.t('Category options'),
        parentSectionKey: 'category',
        duplicable: true,
    },
    categoryCombo: {
        name: SchemaName.categoryCombo,
        namePlural: 'categoryCombos',
        title: i18n.t('Category combination'),
        titlePlural: i18n.t('Category combinations'),
        parentSectionKey: 'category',
    },
    categoryOptionCombo: {
        name: SchemaName.categoryOptionCombo,
        namePlural: 'categoryOptionCombos',
        title: i18n.t('Category option combination'),
        titlePlural: i18n.t('Category option combinations'),
        parentSectionKey: 'category',
    },
    categoryOptionGroup: {
        name: SchemaName.categoryOptionGroup,
        namePlural: 'categoryOptionGroups',
        title: i18n.t('Category option group'),
        titlePlural: i18n.t('Category option groups'),
        parentSectionKey: 'category',
    },
    categoryOptionGroupSet: {
        name: SchemaName.categoryOptionGroupSet,
        namePlural: 'categoryOptionGroupSets',
        title: i18n.t('Category option group set'),
        titlePlural: i18n.t('Category option group sets'),
        parentSectionKey: 'category',
    },
    dataElement: {
        name: SchemaName.dataElement,
        namePlural: 'dataElements',
        title: i18n.t('Data element'),
        titlePlural: i18n.t('Data elements'),
        parentSectionKey: 'dataElement',
        duplicable: true,
    },
    dataElementGroup: {
        name: SchemaName.dataElementGroup,
        namePlural: 'dataElementGroups',
        title: i18n.t('Data element group'),
        titlePlural: i18n.t('Data element groups'),
        parentSectionKey: 'dataElement',
        duplicable: true,
    },
    dataElementGroupSet: {
        name: SchemaName.dataElementGroupSet,
        namePlural: 'dataElementGroupSets',
        title: i18n.t('Data element group set'),
        titlePlural: i18n.t('Data element group sets'),
        parentSectionKey: 'dataElement',
        duplicable: true,
    },
    dataSet: {
        name: SchemaName.dataSet,
        namePlural: 'dataSets',
        title: i18n.t('Data set'),
        titlePlural: i18n.t('Data sets'),
        parentSectionKey: 'dataSet',
    },
    dataSetNotificationTemplate: {
        name: SchemaName.dataSetNotificationTemplate,
        namePlural: 'dataSetNotificationTemplates',
        title: i18n.t('Data set notification'),
        titlePlural: i18n.t('Data set notifications'),
        parentSectionKey: 'dataSet',
        duplicable: true,
    },
    indicator: {
        name: SchemaName.indicator,
        namePlural: 'indicators',
        title: i18n.t('Indicator'),
        titlePlural: i18n.t('Indicators'),
        parentSectionKey: 'indicator',
        duplicable: true,
    },
    indicatorType: {
        name: SchemaName.indicatorType,
        namePlural: 'indicatorTypes',
        title: i18n.t('Indicator type'),
        titlePlural: i18n.t('Indicator types'),
        parentSectionKey: 'indicator',
        duplicable: true,
    },
    indicatorGroup: {
        name: SchemaName.indicatorGroup,
        namePlural: 'indicatorGroups',
        title: i18n.t('Indicator group'),
        titlePlural: i18n.t('Indicator groups'),
        parentSectionKey: 'indicator',
        duplicable: true,
    },
    indicatorGroupSet: {
        name: SchemaName.indicatorGroupSet,
        namePlural: 'indicatorGroupSets',
        title: i18n.t('Indicator group set'),
        titlePlural: i18n.t('Indicator group sets'),
        parentSectionKey: 'indicator',
        duplicable: true,
    },
    organisationUnit: {
        name: SchemaName.organisationUnit,
        namePlural: 'organisationUnits',
        title: i18n.t('Organisation unit'),
        titlePlural: i18n.t('Organisation units'),
        parentSectionKey: 'organisationUnit',
        duplicable: true,
    },
    organisationUnitGroup: {
        name: SchemaName.organisationUnitGroup,
        namePlural: 'organisationUnitGroups',
        title: i18n.t('Organisation unit group'),
        titlePlural: i18n.t('Organisation unit groups'),
        parentSectionKey: 'organisationUnit',
    },
    organisationUnitGroupSet: {
        name: SchemaName.organisationUnitGroupSet,
        namePlural: 'organisationUnitGroupSets',
        title: i18n.t('Organisation unit group set'),
        titlePlural: i18n.t('Organisation unit group sets'),
        parentSectionKey: 'organisationUnit',
    },
    organisationUnitLevel: {
        name: SchemaName.organisationUnitLevel,
        namePlural: 'organisationUnitLevels',
        title: i18n.t('Organisation unit level'),
        titlePlural: i18n.t('Organisation unit levels'),
        parentSectionKey: 'organisationUnit',
    },
    trackedEntityAttribute: {
        name: SchemaName.trackedEntityAttribute,
        namePlural: 'trackedEntityAttributes',
        title: i18n.t('Tracked entity attribute'),
        titlePlural: i18n.t('Tracked entity attributes'),
        parentSectionKey: 'programs',
    },
    trackedEntityType: {
        name: SchemaName.trackedEntityType,
        namePlural: 'trackedEntityTypes',
        title: i18n.t('Tracked entity type'),
        titlePlural: i18n.t('Tracked entity types'),
        parentSectionKey: 'programs',
    },
    program: {
        name: SchemaName.program,
        namePlural: 'programs',
        title: i18n.t('Program'),
        titlePlural: i18n.t('Programs'),
        parentSectionKey: 'programs',
    },
    programIndicator: {
        name: SchemaName.programIndicator,
        namePlural: 'programIndicators',
        title: i18n.t('Program indicator'),
        titlePlural: i18n.t('Program indicators'),
        parentSectionKey: 'indicator',
        duplicable: true,
    },
    programIndicatorGroup: {
        name: SchemaName.programIndicatorGroup,
        namePlural: 'programIndicatorGroups',
        title: i18n.t('Program indicator group'),
        titlePlural: i18n.t('Program indicator groups'),
        parentSectionKey: 'indicator',
        duplicable: true,
    },
    programRule: {
        name: SchemaName.programRule,
        namePlural: 'programRules',
        title: i18n.t('Program rule'),
        titlePlural: i18n.t('Program rules'),
        parentSectionKey: 'programs',
    },
    programRuleVariable: {
        name: SchemaName.programRuleVariable,
        namePlural: 'programRuleVariables',
        title: i18n.t('Program rule variable'),
        titlePlural: i18n.t('Program rule variables'),
        parentSectionKey: 'programs',
    },
    programStage: {
        name: SchemaName.programStage,
        namePlural: 'programStages',
        title: i18n.t('Program stage'),
        titlePlural: i18n.t('Program stages'),
        parentSectionKey: 'programs',
    },
    relationshipType: {
        name: SchemaName.relationshipType,
        namePlural: 'relationshipTypes',
        title: i18n.t('Relationship type'),
        titlePlural: i18n.t('Relationship types'),
        parentSectionKey: 'programs',
    },

    validationRule: {
        name: SchemaName.validationRule,
        namePlural: 'validationRules',
        title: i18n.t('Validation rule'),
        titlePlural: i18n.t('Validation rules'),
        parentSectionKey: 'validation',
    },
    validationRuleGroup: {
        name: SchemaName.validationRuleGroup,
        namePlural: 'validationRuleGroups',
        title: i18n.t('Validation rule group'),
        titlePlural: i18n.t('Validation rule groups'),
        parentSectionKey: 'validation',
    },
    validationNotificationTemplate: {
        name: SchemaName.validationNotificationTemplate,
        namePlural: 'validationNotificationTemplates',
        title: i18n.t('Validation notification'),
        titlePlural: i18n.t('Validation notifications'),
        parentSectionKey: 'validation',
    },
    constant: {
        name: SchemaName.constant,
        namePlural: 'constants',
        title: i18n.t('Constant'),
        titlePlural: i18n.t('Constants'),
        parentSectionKey: 'other',
    },
    optionGroup: {
        name: SchemaName.optionGroup,
        namePlural: 'optionGroups',
        title: i18n.t('Option group'),
        titlePlural: i18n.t('Option groups'),
        parentSectionKey: 'optionSet',
    },
    attribute: {
        name: SchemaName.attribute,
        namePlural: 'attributes',
        title: i18n.t('Attribute'),
        titlePlural: i18n.t('Attributes'),
        parentSectionKey: 'other',
    },
    optionSet: {
        name: SchemaName.optionSet,
        namePlural: 'optionSets',
        title: i18n.t('Option set'),
        titlePlural: i18n.t('Option sets'),
        parentSectionKey: 'optionSet',
    },
    optionGroupSet: {
        name: SchemaName.optionGroupSet,
        namePlural: 'optionGroupSets',
        title: i18n.t('Option group set'),
        titlePlural: i18n.t('Option group sets'),
        parentSectionKey: 'optionSet',
    },
    predictor: {
        name: SchemaName.predictor,
        namePlural: 'predictors',
        title: i18n.t('Predictor'),
        titlePlural: i18n.t('Predictors'),
        parentSectionKey: 'indicator',
        duplicable: true,
    },
    pushAnalysis: {
        name: SchemaName.pushAnalysis,
        namePlural: 'pushAnalyses',
        title: i18n.t('Push analysis'),
        titlePlural: i18n.t('Push analyses'),
        parentSectionKey: 'other',
        maxApiVersion: 42,
    },
    externalMapLayer: {
        name: SchemaName.externalMapLayer,
        namePlural: 'externalMapLayers',
        title: i18n.t('External map layer'),
        titlePlural: i18n.t('External map layers'),
        parentSectionKey: 'other',
    },
    dataApprovalLevel: {
        name: SchemaName.dataApprovalLevel,
        namePlural: 'dataApprovalLevels',
        title: i18n.t('Data approval level'),
        titlePlural: i18n.t('Data approval levels'),
        parentSectionKey: 'dataApproval',
    },
    dataApprovalWorkflow: {
        name: SchemaName.dataApprovalWorkflow,
        namePlural: 'dataApprovalWorkflows',
        title: i18n.t('Data approval workflow'),
        titlePlural: i18n.t('Data approval workflows'),
        parentSectionKey: 'dataApproval',
    },
    sqlView: {
        name: SchemaName.sqlView,
        namePlural: 'sqlViews',
        title: i18n.t('SQL view'),
        titlePlural: i18n.t('SQL views'),
        parentSectionKey: 'other',
    },
    legendSet: {
        name: SchemaName.legendSet,
        namePlural: 'legendSets',
        title: i18n.t('Legend'),
        titlePlural: i18n.t('Legends'),
        parentSectionKey: 'other',
    },
    analyticsTableHook: {
        name: SchemaName.analyticsTableHook,
        namePlural: 'analyticsTableHooks',
        title: i18n.t('Analytics table hook'),
        titlePlural: i18n.t('Analytics table hooks'),
        parentSectionKey: 'other',
    },
    icon: {
        name: SchemaName.icon,
        namePlural: 'icons',
        title: i18n.t('Icon'),
        titlePlural: i18n.t('Icons'),
        parentSectionKey: 'other',
    },
    predictorGroup: {
        name: SchemaName.predictorGroup,
        namePlural: 'predictorGroups',
        title: i18n.t('Predictor group'),
        titlePlural: i18n.t('Predictor groups'),
        parentSectionKey: 'indicator',
        duplicable: true,
    },
} as const satisfies SchemaSectionMap

export type OverviewSectionName = keyof typeof OVERVIEW_SECTIONS
export const OVERVIEW_SECTIONS = {
    category: {
        name: SchemaName.category,
        namePlural: 'categories',
        title: i18n.t('Category'),
        titlePlural: i18n.t('Categories'),
        breadcrumbLabel: i18n.t('Categories overview'),
        componentName: 'Categories',
    },
    dataElement: {
        name: SchemaName.dataElement,
        namePlural: 'dataElements',
        title: i18n.t('Data element'),
        titlePlural: i18n.t('Data elements'),
        breadcrumbLabel: i18n.t('Data elements overview'),
        componentName: 'DataElements',
    },
    dataSet: {
        name: SchemaName.dataSet,
        namePlural: 'dataSets',
        title: i18n.t('Data set'),
        titlePlural: i18n.t('Data sets'),
        breadcrumbLabel: i18n.t('Data sets overview'),
        componentName: 'DataSets',
    },
    indicator: {
        name: SchemaName.indicator,
        namePlural: 'indicators',
        title: i18n.t('Indicator'),
        titlePlural: i18n.t('Indicators and Predictors'),
        componentName: 'Indicators',
    },
    organisationUnit: {
        name: SchemaName.organisationUnit,
        namePlural: 'organisationUnits',
        title: i18n.t('Organisation unit'),
        titlePlural: i18n.t('Organisation units'),
        breadcrumbLabel: i18n.t('Organisation units overview'),
        componentName: 'OrganisationUnits',
    },
    programs: {
        name: 'programs',
        namePlural: 'programs',
        title: i18n.t('Programs'),
        titlePlural: i18n.t('Programs'),
        breadcrumbLabel: i18n.t('Programs overview'),
        componentName: 'Programs',
    },
    optionSet: {
        name: SchemaName.optionSet,
        namePlural: 'optionSets',
        title: i18n.t('Option set'),
        titlePlural: i18n.t('Option sets'),
        breadcrumbLabel: i18n.t('Option sets overview'),
        componentName: 'OptionSets',
    },
    validation: {
        name: 'validation',
        namePlural: 'validations',
        title: i18n.t('Validation'),
        titlePlural: i18n.t('Validations'),
        componentName: 'Validations',
    },
    dataApproval: {
        name: 'dataApproval',
        namePlural: 'dataApproval',
        title: i18n.t('Data approval'),
        titlePlural: i18n.t('Data approval'),
        componentName: 'DataApproval',
    },
    other: {
        name: 'other',
        namePlural: 'other',
        title: i18n.t('Other'),
        titlePlural: i18n.t('Other'),
        componentName: 'Other',
    },
} as const satisfies OverviewSectionMap

export const NON_SCHEMA_SECTION = {
    locale: {
        name: 'locale',
        namePlural: 'locales/dbLocales',
        routeName: 'locales',
        title: i18n.t('Locale'),
        titlePlural: i18n.t('Locales'),
        parentSectionKey: 'other',
        authorities: [
            {
                type: SchemaAuthorityType.CREATE_PUBLIC,
                authorities: ['F_LOCALE_ADD'],
            },
            {
                type: SchemaAuthorityType.CREATE_PRIVATE,
                authorities: ['F_LOCALE_ADD'],
            },
            {
                type: SchemaAuthorityType.DELETE,
                authorities: ['F_LOCALE_DELETE'],
            },
        ],
    },
    programDisaggregation: {
        name: 'programDisaggregation',
        namePlural: 'programDisaggregations',
        title: i18n.t('Program disaggregation'),
        titlePlural: i18n.t('Program disaggregations'),
        parentSectionKey: 'programs',
        minApiVersion: 42,
        authorities: [
            {
                type: SchemaAuthorityType.CREATE_PUBLIC,
                authorities: ['F_SYSTEM_SETTING', 'F_LOCALE_ADD'],
            },
            {
                type: SchemaAuthorityType.CREATE_PRIVATE,
                authorities: ['F_SYSTEM_SETTING', 'F_LOCALE_ADD'],
            },
            {
                type: SchemaAuthorityType.DELETE,
                authorities: ['F_SYSTEM_SETTING'],
            },
        ],
    },
} as const satisfies SectionMap

export const SECTIONS_MAP = {
    ...SCHEMA_SECTIONS,
    ...NON_SCHEMA_SECTION,
} as const satisfies SectionMap

export const sectionNames = new Set<string>(
    Object.values(SECTIONS_MAP).map((section) => section.name)
)

export type SectionKey = keyof typeof SECTIONS_MAP
export type SectionName =
    (typeof SECTIONS_MAP)[keyof typeof SECTIONS_MAP]['name']

export const isSchemaSection = (section: Section): section is SchemaSection => {
    const schema = (SCHEMA_SECTIONS as SectionMap)[section.name]
    return schema !== undefined && !!schema.parentSectionKey
}

export const isOverviewSection = (
    section: Section
): section is OverviewSection => {
    return (
        !(section as SchemaSection).parentSectionKey &&
        (OVERVIEW_SECTIONS as OverviewSectionMap)[section.name] !== undefined
    )
}

export const isNonSchemaSection = (
    section: Section
): section is NonSchemaSection => {
    return (NON_SCHEMA_SECTION as SectionMap)[section.name] !== undefined
}

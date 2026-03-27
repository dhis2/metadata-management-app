import i18n from '@dhis2/d2-i18n'

const TRANSLATED_PROPERTY: Record<string, string> = {
    aggregationType: i18n.t('Aggregation type'),
    aggregateExportCategoryOptionCombo: i18n.t(
        'Category option combination for aggregate data export'
    ),
    aggregateExportAttributeOptionCombo: i18n.t(
        'Attribute option combination for aggregate data export'
    ),
    aggregateExportDataElement: i18n.t(
        'Data element for aggregate data export'
    ),
    attributeCombo: i18n.t('Attribute category combination'),
    analyticsType: i18n.t('Analytics type'),
    bidirectional: i18n.t('Bidirectional'),
    category: i18n.t('Category'),
    categoryCombo: i18n.t('Category combination'),
    categoryOption: i18n.t('Category option'),
    categoryOptionGroup: i18n.t('Category option group'),
    categoryOptionGroupSet: i18n.t('Category option group set'),
    code: i18n.t('Code'),
    compulsory: i18n.t('Compulsory'),
    created: i18n.t('Created'),
    createdBy: i18n.t('Created by'),
    dataElement: i18n.t('Data element'),
    dataElementGroup: i18n.t('Data element group'),
    dataElementGroupSet: i18n.t('Data element group set'),
    dataDimension: i18n.t('Data dimension'),
    dataDimensionType: i18n.t('Data dimension type'),
    dataSet: i18n.t('Data set'),
    description: i18n.t('Description'),
    displayFromToName: i18n.t('Name seen from initiating entity'),
    displayInForm: i18n.t('Display in form'),
    displayToFromName: i18n.t('Name seen from receiving entity'),
    domainType: i18n.t('Domain type'),
    expression: i18n.t('Expression'),
    favorite: i18n.t('Favorite'),
    filter: i18n.t('Filter'),
    formName: i18n.t('Form name'),
    formType: i18n.t('Form type'),
    fromToName: i18n.t('Relationship name seen from initiating entity'),
    href: i18n.t('API URL'),
    id: i18n.t('Id'),
    ignoreApproval: i18n.t('Ignore data approval'),
    indicator: i18n.t('Indicator'),
    indicatorGroup: i18n.t('Indicator group'),
    indicatorGroupSet: i18n.t('Indicator group set'),
    indicatorType: i18n.t('Indicator type'),
    lastUpdated: i18n.t('Last updated'),
    lastUpdatedBy: i18n.t('Last updated by'),
    name: i18n.t('Name'),
    optionGroupSet: i18n.t('Option group set'),
    organisationUnitGroup: i18n.t('Organisation unit group'),
    organisationUnitGroupSet: i18n.t('Organisation unit group set'),
    program: i18n.t('Program'),
    programIndicator: i18n.t('Program indicator'),
    programIndicatorGroup: i18n.t('Program indicator group'),
    programRuleVariableSourceType: i18n.t('Source type'),
    programStage: i18n.t('Program stage'),
    priority: i18n.t('Priority'),
    condition: i18n.t('Condition'),
    referral: i18n.t('Referral'),
    sharing: i18n.t('Sharing'),
    shortName: i18n.t('Short name'),
    toFromName: i18n.t('Relationship name seen from receiving entity'),
    trackedEntityAttribute: i18n.t('Tracked entity attribute'),
    useCodeForOptionSet: i18n.t('Use code for option set'),
    user: i18n.t('Owner'), // user refers to the owner of the object
    valueType: i18n.t('Value type'),
    validationRuleGroup: i18n.t('Validation rule group'),
    zeroIsSignificant: i18n.t('Zero is significant'),
    displayDescription: i18n.t('Description'),
    allowAuditLog: i18n.t('Enable tracked entity instance audit log'),
    featureType: i18n.t('Feature type'),
    programType: i18n.t('Program type'),
    maxTeiCountToReturn: i18n.t(
        'Maximum number of tracked entity instances to return in search'
    ),
    minAttributesRequiredToSearch: i18n.t(
        'Minimum number of attributes required to search'
    ),
    subjectTemplate: i18n.t('Subject template'),
    messageTemplate: i18n.t('Message template'),
    programStageLabel: i18n.t('Program stage label'),
    dueDateLabel: i18n.t('Scheduled date label'),
    executionDateLabel: i18n.t('Report date label'),
    eventLabel: i18n.t('Event label'),
    trackedEntityAttributeLabel: i18n.t('Tracked entity attribute label'),
    enrollmentDateLabel: i18n.t('Enrollment date label'),
    incidentDateLabel: i18n.t('Incident date label'),
    noteLabel: i18n.t('Note label'),
    enrollmentLabel: i18n.t('Enrollment label'),
    followUpLabel: i18n.t('Follow up label'),
    orgUnitLabel: i18n.t('Organisation unit label'),
    relationshipLabel: i18n.t('Relationship label'),
    enrollmentsLabel: i18n.t('Enrollment label (Plural)'),
    eventsLabel: i18n.t('Event label (Plural)'),
    programStagesLabel: i18n.t('Program stage label (Plural)'),
    trackedEntityTypesLabel: i18n.t('Names'),
}

const camelCaseToSentenceCase = (camelCase: string) =>
    camelCase
        .replace(/([A-Z])/g, (str) => ` ${str.toLowerCase()}`)
        .replace(/^./, (str) => str.toUpperCase())

const markNotTranslated = (property: string) =>
    `** ${camelCaseToSentenceCase(property)} **`

export const getTranslatedProperty = (property: string) => {
    if (i18n.exists(property)) {
        return i18n.t(property)
    }
    if (property in TRANSLATED_PROPERTY) {
        return TRANSLATED_PROPERTY[property]
    }
    return markNotTranslated(property)
}

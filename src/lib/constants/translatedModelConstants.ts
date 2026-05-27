import i18n from '@dhis2/d2-i18n'

// because of the way d2-i18n works, we cannot translate dynamic values
// so we have to list them manually
export const AGGREGATION_TYPE = {
    SUM: i18n.t('Sum'),
    AVERAGE: i18n.t('Average'),
    AVERAGE_SUM_ORG_UNIT: i18n.t('Average (sum in org unit)'),
    LAST: i18n.t('Last value (sum in org unit hierarchy)'),
    LAST_AVERAGE_ORG_UNIT: i18n.t('Last value (average in org unit)'),
    LAST_LAST_ORG_UNIT: i18n.t('Last value (last in org unit hierarchy)'),
    LAST_IN_PERIOD: i18n.t('Last value in period (sum in org unit hierarchy)'),
    LAST_IN_PERIOD_AVERAGE_ORG_UNIT: i18n.t(
        'Last value in period (average in org unit hierarchy)'
    ),
    FIRST: i18n.t('First value (sum in org unit hierarchy)'),
    FIRST_AVERAGE_ORG_UNIT: i18n.t(
        'First value (average in org unit hierarchy)'
    ),
    FIRST_FIRST_ORG_UNIT: i18n.t('First value (first in org unit hierarchy)'),
    COUNT: i18n.t('Count'),
    STDDEV: i18n.t('Standard deviation'),
    VARIANCE: i18n.t('Variance'),
    MIN: i18n.t('Min'),
    MAX: i18n.t('Max'),
    MIN_SUM_ORG_UNIT: i18n.t('Min (sum in org unit)'),
    MAX_SUM_ORG_UNIT: i18n.t('Max (sum in org unit)'),
    NONE: i18n.t('None'),
    CUSTOM: i18n.t('Custom'),
    DEFAULT: i18n.t('Default'),
}

export const DOMAIN_TYPE = {
    AGGREGATE: i18n.t('Aggregate'),
    TRACKER: i18n.t('Tracker'),
}

export const VALUE_TYPE = {
    TEXT: i18n.t('Text'),
    LONG_TEXT: i18n.t('Long text'),
    MULTI_TEXT: i18n.t('Text with multiple values'),
    LETTER: i18n.t('Letter'),
    PHONE_NUMBER: i18n.t('Phone number'),
    EMAIL: i18n.t('Email'),
    BOOLEAN: i18n.t('Yes/No'),
    TRUE_ONLY: i18n.t('Yes only'),
    DATE: i18n.t('Date'),
    DATETIME: i18n.t('Date and time'),
    TIME: i18n.t('Time'),
    NUMBER: i18n.t('Number'),
    UNIT_INTERVAL: i18n.t('Unit interval'),
    PERCENTAGE: i18n.t('Percentage'),
    INTEGER: i18n.t('Integer'),
    INTEGER_POSITIVE: i18n.t('Positive integer'),
    INTEGER_NEGATIVE: i18n.t('Negative integer'),
    INTEGER_ZERO_OR_POSITIVE: i18n.t('Positive or Zero integer'),
    TRACKER_ASSOCIATE: i18n.t('Tracker associate'),
    USERNAME: i18n.t('Username'),
    COORDINATE: i18n.t('Coordinate'),
    ORGANISATION_UNIT: i18n.t('Organisation unit'),
    REFERENCE: i18n.t('Reference'),
    AGE: i18n.t('Age'),
    URL: i18n.t('URL'),
    FILE_RESOURCE: i18n.t('File'),
    IMAGE: i18n.t('Image'),
    GEOJSON: i18n.t('GeoJSON'),
}

export const DATA_DIMENSION_TYPE = {
    DISAGGREGATION: i18n.t('Disaggregation'),
    ATTRIBUTE: i18n.t('Attribute'),
}

export const GEOMETRY_TYPE = {
    POINT: i18n.t('Point'),
    MULTIPOINT: i18n.t('MultiPoint'),
    LINESTRING: i18n.t('LineString'),
    MULTILINESTRING: i18n.t('MultiLineString'),
    POLYGON: i18n.t('Polygon'),
    MULTIPOLYGON: i18n.t('MultiPolygon'),
    GEOMETRYCOLLECTION: i18n.t('GeometryCollection'),
}

export const FORM_TYPE = {
    CUSTOM: i18n.t('Custom'),
    DEFAULT: i18n.t('Default'),
    SECTION: i18n.t('Section'),
    SECTION_MULTIORG: i18n.t('Section Multi-org'),
}

export const ANALYTICS_TYPE = {
    EVENT: i18n.t('Event'),
    ENROLLMENT: i18n.t('Enrollment'),
}

const PERIOD_TYPE = {
    BiMonthly: i18n.t('Bi-monthly'),
    BiWeekly: i18n.t('Bi-weekly'),
    Daily: i18n.t('Daily'),
    FinancialFeb: i18n.t('Financial Year February'),
    FinancialApril: i18n.t('Financial Year April'),
    FinancialJuly: i18n.t('Financial Year July'),
    FinancialAug: i18n.t('Financial Year August'),
    FinancialSep: i18n.t('Financial Year September'),
    FinancialNov: i18n.t('Financial Year November'),
    FinancialOct: i18n.t('Financial Year Octobter'),
    Monthly: i18n.t('Monthly'),
    Quarterly: i18n.t('Quarterly'),
    QuarterlyNov: i18n.t('Quarterly November'),
    SixMonthlyApril: i18n.t('Six-Monthly April'),
    SixMonthlyNov: i18n.t('Six-Monthly November'),
    SixMonthly: i18n.t('Six-Monthly'),
    TwoYearly: i18n.t('Two-Yearly'),
    Weekly: i18n.t('Weekly'),
    WeeklyFriday: i18n.t('Weekly Friday'),
    WeeklySaturday: i18n.t('Weekly Saturday'),
    WeeklySunday: i18n.t('Weekly Sunday'),
    WeeklyThursday: i18n.t('Weekly Thursday'),
    WeeklyWednesday: i18n.t('Weekly Wednesday'),
    Yearly: i18n.t('Yearly'),
}

const OPERATOR = {
    equal_to: i18n.t('Equal to'),
    not_equal_to: i18n.t('Not equal to'),
    greater_than: i18n.t('Greater than'),
    greater_than_or_equal_to: i18n.t('Greater than or equal to'),
    less_than: i18n.t('Less than'),
    less_than_or_equal_to: i18n.t('Less than or equal to'),
    compulsory_pair: i18n.t('Compulsory pair'),
    exclusive_pair: i18n.t('Exclusive pair'),
}

const IMPORTANCE = {
    HIGH: i18n.t('High'),
    MEDIUM: i18n.t('Medium'),
    LOW: i18n.t('Low'),
}

const SEND_STRATEGY = {
    COLLECTIVE_SUMMARY: i18n.t('Collective summary'),
    SINGLE_NOTIFICATION: i18n.t('Single notification'),
}

const DATA_SET_NOTIFICATION_TRIGGER = {
    SCHEDULED_DAYS: i18n.t('Scheduled days'),
    DATA_SET_COMPLETION: i18n.t('Data set completion'),
}

const PROGRAM_NOTIFICATION_TRIGGER = {
    COMPLETION: i18n.t('Program completion'),
    ENROLLMENT: i18n.t('Program enrollment'),
    SCHEDULED_DAYS_DUE_DATE: i18n.t('Days scheduled (due date)'),
    SCHEDULED_DAYS_INCIDENT_DATE: i18n.t('Days scheduled (incident date)'),
    SCHEDULED_DAYS_ENROLLMENT_DATE: i18n.t('Days scheduled (enrollment date)'),
    PROGRAM_RULE: i18n.t('Program rule'),
}

const NOTIFICATION_RECIPIENT = {
    ORGANISATION_UNIT_CONTACT: i18n.t('Organisation unit contact'),
    USER_GROUP: i18n.t('User group'),
    TRACKED_ENTITY_INSTANCE: i18n.t('Tracked entity instance'),
    USERS_AT_ORGANISATION_UNIT: i18n.t('Users at Organisation Unit'),
    PROGRAM_ATTRIBUTE: i18n.t('Program attribute'),
    WEB_HOOK: i18n.t('Web hook'),
    DATA_ELEMENT: i18n.t('Data element'),
}

const RENDERING_TYPE = {
    DEFAULT: i18n.t('Default'),
    DROPDOWN: i18n.t('Dropdown'),
    VERTICAL_RADIOBUTTONS: i18n.t('Vertical radiobuttons'),
    HORIZONTAL_RADIOBUTTONS: i18n.t('Horizontal radiobuttons'),
    VERTICAL_CHECKBOXES: i18n.t('Vertical checkboxes'),
    HORIZONTAL_CHECKBOXES: i18n.t('Horizontal checkboxes'),
    SHARED_HEADER_RADIOBUTTONS: i18n.t('Shared header radiobuttons'),
    ICONS_AS_BUTTONS: i18n.t('Icons as buttons'),
    SPINNER: i18n.t('Spinner'),
    ICON: i18n.t('Icon'),
    TOGGLE: i18n.t('Toggle'),
    VALUE: i18n.t('Value'),
    SLIDER: i18n.t('Slider'),
    LINEAR_SCALE: i18n.t('Linear scale'),
    AUTOCOMPLETE: i18n.t('Autocomplete'),
    QR_CODE: i18n.t('Qr code'),
    BAR_CODE: i18n.t('Bar code'),
    GS1_DATAMATRIX: i18n.t('Gs1 datamatrix'),
    CANVAS: i18n.t('Canvas'),
}

const REPORTING_RATE = {
    REPORTING_RATE: i18n.t('Reporting rate'),
    REPORTING_RATE_ON_TIME: i18n.t('Reporting rate on time'),
    ACTUAL_REPORTS: i18n.t('Actual reports'),
    ACTUAL_REPORTS_ON_TIME: i18n.t('Actual reports on time'),
    EXPECTED_REPORTS: i18n.t('Expected reports'),
}

const PREDICTOR_ORG_UNIT_SOURCE = {
    SELECTED: i18n.t('At selected level(s) only'),
    DESCENDANTS: i18n.t('At selected level(s) and all levels below'),
}

const MISSING_VALUE_STRATEGY = {
    SKIP_IF_ANY_VALUE_MISSING: i18n.t('Skip if any value is missing'),
    SKIP_IF_ALL_VALUES_MISSING: i18n.t('Skip if all values are missing'),
    NEVER_SKIP: i18n.t('Never skip'),
}

const VALIDATION_STRATEGY = {
    ON_COMPLETE: i18n.t('On complete'),
    ON_UPDATE_AND_INSERT: i18n.t('On update and insert'),
}

const ANALYTICS_TABLE_HOOK_PHASE = {
    RESOURCE_TABLE_POPULATED: i18n.t('Resource tables'),
    ANALYTICS_TABLE_POPULATED: i18n.t('Analytics tables'),
}

const ANALYTICS_TABLE_TYPE = {
    DATA_VALUE: i18n.t('Data value'),
    COMPLETENESS: i18n.t('Completeness'),
    COMPLETENESS_TARGET: i18n.t('Completeness target'),
    ORG_UNIT_TARGET: i18n.t('Organisation unit target'),
    VALIDATION_RESULT: i18n.t('Validation result'),
    OWNERSHIP: i18n.t('Ownership'),
    TRACKED_ENTITY_INSTANCE_EVENTS: i18n.t('Tracked entity instance events'),
    TRACKED_ENTITY_INSTANCE_ENROLLMENTS: i18n.t(
        'Tracked entity instance enrollments'
    ),
    TRACKED_ENTITY_INSTANCE: i18n.t('Tracked entity instance'),
}

const RESOURCE_TABLE_TYPE = {
    ORG_UNIT_STRUCTURE: i18n.t('Organisation unit structure'),
    DATA_SET_ORG_UNIT_CATEGORY: i18n.t('Data set organisation unit category'),
    CATEGORY_OPTION_COMBO_NAME: i18n.t('Category option combo name'),
    DATA_ELEMENT_GROUP_SET_STRUCTURE: i18n.t(
        'Data element group set structure'
    ),
    INDICATOR_GROUP_SET_STRUCTURE: i18n.t('Indicator group set structure'),
    ORG_UNIT_GROUP_SET_STRUCTURE: i18n.t(
        'Organisation unit group set structure'
    ),
    CATEGORY_STRUCTURE: i18n.t('Category structure'),
    DATA_ELEMENT_STRUCTURE: i18n.t('Data element structure'),
    DATA_SET: i18n.t('Data set'),
    PERIOD_STRUCTURE: i18n.t('Period structure'),
    DATE_PERIOD_STRUCTURE: i18n.t('Date period structure'),
    DATA_ELEMENT_CATEGORY_OPTION_COMBO: i18n.t(
        'Data element category option combo'
    ),
    DATA_APPROVAL_REMAP_LEVEL: i18n.t('Data approval remap level'),
    DATA_APPROVAL_MIN_LEVEL: i18n.t('Data approval min level'),
    TEI_RELATIONSHIP_COUNT: i18n.t(
        'Tracked entity instance relationship count'
    ),
}

const PROGRAM_RULE_VARIABLE_SOURCE_TYPE = {
    DATAELEMENT_NEWEST_EVENT_PROGRAM_STAGE: i18n.t(
        'Data element in newest event in program stage'
    ),
    DATAELEMENT_NEWEST_EVENT_PROGRAM: i18n.t(
        'Data element in newest event in program'
    ),
    DATAELEMENT_CURRENT_EVENT: i18n.t('Data element from current event'),
    DATAELEMENT_PREVIOUS_EVENT: i18n.t('Data element from previous event'),
    CALCULATED_VALUE: i18n.t('Calculated value'),
    TEI_ATTRIBUTE: i18n.t('Tracked entity attribute'),
}

const MATERIALIZED_VIEW = {
    VIEW: 'View',
    MATERIALIZED_VIEW: 'Materialized view',
    QUERY: 'Query',
}

const CACHE_STRATEGY = {
    NO_CACHE: 'No cache',
    CACHE_1_MINUTE: 'Cache for 1 minute',
    CACHE_5_MINUTES: 'Cache for 5 minutes',
    CACHE_10_MINUTES: 'Cache for 10 minutes',
    CACHE_15_MINUTES: 'Cache for 15 minutes',
    CACHE_30_MINUTES: 'Cache for 30 minutes',
    CACHE_1_HOUR: 'Cache for one hour',
    CACHE_6AM_TOMORROW: 'Cache until 6am tomorrow',
    CACHE_TWO_WEEKS: 'Cache for two weeks',
    RESPECT_SYSTEM_SETTING: 'Respect system setting',
}

const allConstantTranslations: Record<string, string> = {
    ...AGGREGATION_TYPE,
    ...ANALYTICS_TYPE,
    ...DOMAIN_TYPE,
    ...VALUE_TYPE,
    ...CACHE_STRATEGY,
    ...DATA_DIMENSION_TYPE,
    ...GEOMETRY_TYPE,
    ...FORM_TYPE,
    ...PERIOD_TYPE,
    ...OPERATOR,
    ...IMPORTANCE,
    ...RENDERING_TYPE,
    ...SEND_STRATEGY,
    ...DATA_SET_NOTIFICATION_TRIGGER,
    ...PROGRAM_NOTIFICATION_TRIGGER,
    ...NOTIFICATION_RECIPIENT,
    ...REPORTING_RATE,
    ...PREDICTOR_ORG_UNIT_SOURCE,
    ...MISSING_VALUE_STRATEGY,
    ...MATERIALIZED_VIEW,
    ...VALIDATION_STRATEGY,
    ...PROGRAM_RULE_VARIABLE_SOURCE_TYPE,
    ...ANALYTICS_TABLE_HOOK_PHASE,
    ...ANALYTICS_TABLE_TYPE,
    ...RESOURCE_TABLE_TYPE,
}

export const getConstantTranslation = (constant: string): string => {
    return allConstantTranslations[constant] || constant
}

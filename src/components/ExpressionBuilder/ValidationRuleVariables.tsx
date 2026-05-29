import i18n from '@dhis2/d2-i18n'
import { NoticeBox, SingleSelect, SingleSelectOption } from '@dhis2/ui'
import React, { useCallback, useState } from 'react'
import { SchemaName, useSchema, getConstantTranslation } from '../../lib'
import { ModelSingleSelect } from '../metadataFormControls/ModelSingleSelect'
import styles from './ExpressionBuilder.module.css'
import { ExpressionList, ExpressionListInner } from './ExpressionList'
import { ExpressionBuilderType } from './types'

export type InsertElementType = (s: string) => void
type Element = {
    id: string
    displayName: string
}
export type ElementType = {
    type: string
    name: string
    elements?: Element[]
    component: React.ComponentType<{
        elements: Element[]
        insertElement: InsertElementType
        programId?: string
        isProgramIndicator?: boolean
    }>
}
type BasicIdentifiable = {
    id: string
    displayName: string
}
type ProgramTEA = BasicIdentifiable & {
    trackedEntityAttribute: { id: string }
}

type ProgramWithTEA = {
    programTrackedEntityAttributes: ProgramTEA[]
}

const DefaultList = ({
    elements,
    insertElement,
}: {
    elements: Element[]
    insertElement: InsertElementType
}) => {
    return (
        <ExpressionListInner
            elements={elements}
            insertElement={insertElement}
            postQuerySearch={true}
            onRetryClick={() => {}}
        ></ExpressionListInner>
    )
}

const DATA_ELEMENTS_QUERY = {
    resource: 'dataElementOperands',
    params: {
        fields: ['id', 'displayName'],
        order: ['displayName'],
        totals: true,
        filters: ['dataElement.domainType:eq:AGGREGATE'],
    },
}

const DataElementsList = ({
    insertElement,
}: {
    insertElement: InsertElementType
}) => {
    const insertElementFormatted = useCallback(
        (s: string) => {
            insertElement(`#{${s}}`)
        },
        [insertElement]
    )
    return (
        <ExpressionList
            query={DATA_ELEMENTS_QUERY}
            insertElement={insertElementFormatted}
            overrideSearchFilter="displayName:ilike:"
        />
    )
}

const INDICATORS_QUERY = {
    resource: 'indicators',
    params: {
        fields: ['id', 'displayName'],
        order: ['displayName'],
    },
}

const IndicatorsList = ({
    insertElement,
}: {
    insertElement: InsertElementType
}) => {
    const insertElementFormatted = useCallback(
        (s: string) => {
            insertElement(`N{${s}}`)
        },
        [insertElement]
    )
    return (
        <ExpressionList
            query={INDICATORS_QUERY}
            insertElement={insertElementFormatted}
        />
    )
}

const ORGANISATION_UNIT_GROUPS_QUERY = {
    resource: 'organisationUnitGroups',
    params: {
        fields: ['id', 'displayName'],
        order: ['displayName'],
    },
}

const OrganisationUnitGroupsList = ({
    insertElement,
}: {
    insertElement: InsertElementType
}) => {
    const insertElementFormatted = useCallback(
        (s: string) => {
            insertElement(`OUG{${s}}`)
        },
        [insertElement]
    )
    return (
        <ExpressionList
            query={ORGANISATION_UNIT_GROUPS_QUERY}
            insertElement={insertElementFormatted}
        />
    )
}

const CONSTANTS_QUERY = {
    resource: 'constants',
    params: {
        fields: ['id', 'displayName'],
        order: ['displayName'],
    },
}

const ConstantsList = ({
    insertElement,
}: {
    insertElement: InsertElementType
}) => {
    const insertElementFormatted = useCallback(
        (s: string) => {
            insertElement(`C{${s}}`)
        },
        [insertElement]
    )
    return (
        <ExpressionList
            query={CONSTANTS_QUERY}
            insertElement={insertElementFormatted}
        />
    )
}

const DATA_SETS_QUERY = {
    resource: 'dataSets',
    params: {
        fields: ['id', 'displayName'],
        order: ['displayName'],
    },
}

const DataSetsList = ({
    insertElement,
}: {
    insertElement: InsertElementType
}) => {
    const schema = useSchema('reportingRate' as SchemaName)
    const reportingTypes =
        schema?.properties?.metric?.constants?.map((constant) => ({
            value: constant,
            label: getConstantTranslation(constant),
        })) || null
    const [reportingType, setReportingType] = useState<string>('REPORTING_RATE')
    const insertElementFormatted = useCallback(
        (s: string) => {
            insertElement(`R{${s}.${reportingType}}`)
        },
        [insertElement, reportingType]
    )
    if (!reportingTypes) {
        return null
    }
    return (
        <>
            <div className={styles.preliminarySelect}>
                <SingleSelect
                    selected={reportingType}
                    onChange={(e) => {
                        setReportingType(e.selected)
                    }}
                >
                    {reportingTypes.map((opt) => (
                        <SingleSelectOption
                            key={opt.value}
                            label={opt.label}
                            value={opt.value}
                        />
                    ))}
                </SingleSelect>
            </div>
            <ExpressionList
                query={DATA_SETS_QUERY}
                insertElement={insertElementFormatted}
            />
        </>
    )
}

const ProgramNotSelectedNoticeBox = () => (
    <div className={styles.programNotSelectedWarning}>
        <NoticeBox>{i18n.t('Program has not been selected')}</NoticeBox>
    </div>
)

const PROGRAMS_SELECT_QUERY = {
    resource: 'programs',
    params: {
        fields: ['id', 'displayName'],
    },
}

const ProgramAttributeComponent = ({
    programId,
    insertElement,
}: {
    programId?: string
    insertElement: (s: string) => void
}) => {
    const programTEAQuery = {
        resource: 'programs',
        params: {
            filters: [`id:eq:${programId}`],
            fields: [
                'programTrackedEntityAttributes[id,displayName,trackedEntityAttribute[id]]',
            ],
        },
    }
    if (!programId) {
        return null
    }
    return (
        <ExpressionList
            query={programTEAQuery}
            insertElement={insertElement}
            transform={(p) => {
                const program = p[0] as unknown as ProgramWithTEA
                const attributes = program?.programTrackedEntityAttributes ?? []
                return attributes.map((tea) => ({
                    displayName: tea.displayName,
                    id: tea.trackedEntityAttribute.id,
                }))
            }}
            postQuerySearch={true}
        />
    )
}

const ProgramJunction = ({
    programElementType,
    programId,
    insertElementFormatted,
}: {
    programElementType: string
    programId: string
    insertElementFormatted: (s: string) => void
}) => {
    // program data elements
    if (programElementType === 'D') {
        const programDataElementsQuery = {
            resource: 'programDataElements',
            params: {
                program: programId,
                fields: ['displayName', 'dataElement'],
            },
        }
        return (
            <ExpressionList
                query={programDataElementsQuery}
                insertElement={insertElementFormatted}
                transform={(
                    f: { displayName: string; dataElement: { id: string } }[]
                ) => f.map((d) => ({ ...d, id: d?.dataElement?.id }))}
            />
        )
    }
    // program indicators
    if (programElementType === 'I') {
        const programIndicatorsQuery = {
            resource: 'programIndicators',
            params: {
                filters: [`program.id:eq:${programId}`],
            },
        }
        return (
            <ExpressionList
                query={programIndicatorsQuery}
                insertElement={insertElementFormatted}
            />
        )
    }
    // program tracked entity attributes (have to be retrieved from program info)
    if (programElementType === 'A') {
        return (
            <ProgramAttributeComponent
                programId={programId}
                insertElement={insertElementFormatted}
            />
        )
    }
}

const programElementTypes = [
    { value: 'D', label: i18n.t('Data elements') },
    { value: 'A', label: i18n.t('Program tracked entity attributes') },
    { value: 'I', label: i18n.t('Indicators') },
]

const ProgramsList = ({
    insertElement,
    programId,
}: {
    insertElement: InsertElementType
    programId?: string
}) => {
    const [program, setProgram] = useState<BasicIdentifiable>()
    const resolvedProgramId = programId ?? program?.id
    const [programElementType, setProgramElementType] = useState<string>(
        programElementTypes[0]?.value
    )
    const insertElementFormatted = useCallback(
        (s: string) => {
            if (programElementType === 'I') {
                insertElement(`${programElementType}{${s}}`)
            } else {
                insertElement(
                    `${programElementType}{${resolvedProgramId}.${s}}`
                )
            }
        },
        [insertElement, programElementType, resolvedProgramId]
    )

    return (
        <>
            <div
                className={
                    !programElementType || !resolvedProgramId
                        ? styles.preliminarySelectNoProgram
                        : styles.preliminarySelect
                }
            >
                <ModelSingleSelect
                    query={PROGRAMS_SELECT_QUERY}
                    onChange={(program) => {
                        setProgram(program)
                    }}
                    placeholder={i18n.t('Select a Program')}
                    selected={
                        programId ? { id: programId, displayName: '' } : program
                    }
                    disabled={!!programId}
                />
                <div>
                    <SingleSelect
                        selected={programElementType}
                        onChange={(e) => {
                            setProgramElementType(e.selected)
                        }}
                    >
                        {programElementTypes.map((opt) => (
                            <SingleSelectOption
                                key={opt.value}
                                label={opt.label}
                                value={opt.value}
                            />
                        ))}
                    </SingleSelect>
                </div>
            </div>
            {!programElementType || !resolvedProgramId ? null : (
                <ProgramJunction
                    programElementType={programElementType}
                    programId={resolvedProgramId}
                    insertElementFormatted={insertElementFormatted}
                ></ProgramJunction>
            )}
        </>
    )
}

const ProgramStageList = ({
    insertElement,
    programId,
}: {
    insertElement: InsertElementType
    programId?: string
}) => {
    const [programStage, setProgramStage] = useState<BasicIdentifiable>()
    const programStageId = programStage?.id

    const insertElementFormatted = useCallback(
        (s: string) => {
            insertElement(`#{${programStageId}.${s}}`)
        },
        [insertElement, programStageId]
    )

    const programStagesSelectQuery = {
        resource: 'programStages',
        params: {
            filters: programId ? [`program.id:eq:${programId}`] : [],
            fields: ['id', 'displayName'],
        },
    }

    const programStageDataElementsQuery = {
        resource: 'programStages',
        params: {
            filters: [`id:eq:${programStageId}`],
            fields: [
                'displayName',
                'programStageDataElements[dataElement[id,displayName]]',
            ],
        },
    }
    if (!programId) {
        return <ProgramNotSelectedNoticeBox />
    }

    return (
        <>
            <div className={styles.preliminarySelect}>
                <ModelSingleSelect
                    query={programStagesSelectQuery}
                    onChange={(program) => {
                        setProgramStage(program)
                    }}
                    placeholder={i18n.t('Select a Program stage')}
                    selected={programStage}
                />
            </div>
            {programStageId ? (
                <ExpressionList
                    query={programStageDataElementsQuery}
                    insertElement={insertElementFormatted}
                    transform={(
                        value: {
                            displayName?: string
                            programStageDataElements?: {
                                dataElement: Element
                            }[]
                        }[]
                    ) => {
                        const list = value[0]?.programStageDataElements ?? []
                        return list.map((d) => d.dataElement)
                    }}
                    postQuerySearch={true}
                />
            ) : null}
        </>
    )
}

const ProgramAttributes = ({
    insertElement,
    programId,
    isProgramIndicator = false,
}: {
    insertElement: InsertElementType
    programId?: string
    isProgramIndicator?: boolean
}) => {
    const insertElementFormatted = useCallback(
        (s: string) => {
            insertElement(`A{${s}}`)
        },
        [insertElement]
    )

    if (isProgramIndicator && !programId) {
        return <ProgramNotSelectedNoticeBox />
    }

    return (
        <ProgramAttributeComponent
            programId={programId}
            insertElement={insertElementFormatted}
        />
    )
}

const ProgramRuleVariablesList = ({
    insertElement,
    programId,
}: {
    insertElement: InsertElementType
    programId?: string
}) => {
    const insertElementFormatted = useCallback(
        (s: string) => {
            insertElement(`#{${s}}`)
        },
        [insertElement]
    )

    if (!programId) {
        return <ProgramNotSelectedNoticeBox />
    }

    const programRuleVariablesQuery = {
        resource: 'programRuleVariables',
        params: {
            filters: [`program.id:eq:${programId}`],
            fields: ['name', 'displayName'],
            order: ['displayName'],
            paging: false,
        },
    }

    return (
        <ExpressionList
            query={programRuleVariablesQuery}
            insertElement={insertElementFormatted}
            transform={(variables) =>
                (
                    variables as unknown as {
                        name: string
                        displayName: string
                    }[]
                ).map((v) => ({
                    id: v.name,
                    displayName: v.displayName,
                }))
            }
            postQuerySearch={true}
        />
    )
}

const OPERATOR_ELEMENTS = [
    { id: '+', displayName: i18n.t('+ (add)') },
    { id: '-', displayName: i18n.t('- (subtract)') },
    { id: '*', displayName: i18n.t('* (multiply)') },
    { id: '/', displayName: i18n.t('/ (divide)') },
    { id: '%', displayName: i18n.t('% (percent)') },
    { id: '(', displayName: i18n.t('(') },
    { id: ')', displayName: i18n.t(')') },
    { id: 'days', displayName: i18n.t('days') },
    { id: 'if(', displayName: i18n.t('if(') },
    { id: 'isNull(', displayName: i18n.t('isNull(') },
    { id: 'isNotNull(', displayName: i18n.t('isNotNull(') },
    { id: 'firstNonNull(', displayName: i18n.t('firstNonNull(') },
    { id: 'greatest(', displayName: i18n.t('greatest(') },
    { id: 'least(', displayName: i18n.t('least(') },
    { id: 'log(', displayName: i18n.t('log(') },
    { id: 'log10(', displayName: i18n.t('log10(') },
]

const PROGRAM_INDICATOR_OPERATOR_ELEMENTS = [
    { id: '+', displayName: i18n.t('+ (add)') },
    { id: '-', displayName: i18n.t('- (subtract)') },
    { id: '*', displayName: i18n.t('* (multiply)') },
    { id: '/', displayName: i18n.t('/ (divide)') },
    { id: '%', displayName: i18n.t('% (percent)') },
    { id: '(', displayName: i18n.t('(') },
    { id: ')', displayName: i18n.t(')') },
    { id: '>', displayName: i18n.t('> (greater than)') },
    { id: '>=', displayName: i18n.t('>= (greater than or equal to)') },
    { id: '<', displayName: i18n.t('< (less than)') },
    { id: '<=', displayName: i18n.t('<= (less than or equal to)') },
    { id: '==', displayName: i18n.t('== (equals)') },
    { id: '!=', displayName: i18n.t('!= (does not equal)') },
    { id: '!', displayName: i18n.t('! (not)') },
    { id: '&&', displayName: i18n.t('&& (and)') },
    { id: '||', displayName: i18n.t('|| (or)') },
    { id: 'days', displayName: i18n.t('days') },
    { id: 'if(', displayName: i18n.t('if(') },
    { id: 'isNull(', displayName: i18n.t('isNull(') },
    { id: 'isNotNull(', displayName: i18n.t('isNotNull(') },
    { id: 'firstNonNull(', displayName: i18n.t('firstNonNull(') },
    { id: 'greatest(', displayName: i18n.t('greatest(') },
    { id: 'least(', displayName: i18n.t('least(') },
    { id: 'log(', displayName: i18n.t('log(') },
    { id: 'log10(', displayName: i18n.t('log10(') },
]

const INDICATOR_OPERATOR_ELEMENTS = [
    ...OPERATOR_ELEMENTS,
    { id: '.periodOffset(', displayName: i18n.t('.periodOffset(') },
]

const PREDICTOR_OPERATOR_ELEMENTS = [
    ...OPERATOR_ELEMENTS,
    { id: 'avg(', displayName: i18n.t('avg(') },
    { id: 'count(', displayName: i18n.t('count(') },
    { id: 'max(', displayName: i18n.t('max(') },
    { id: 'median(', displayName: i18n.t('median(') },
    { id: 'min(', displayName: i18n.t('min(') },
    { id: 'percentileCont(', displayName: i18n.t('percentileCont(') },
    { id: 'stddev(', displayName: i18n.t('stddev(') },
    { id: 'stddevPop(', displayName: i18n.t('stddevPop(') },
    { id: 'stddevSamp(', displayName: i18n.t('stddevSamp(') },
    { id: 'sum(', displayName: i18n.t('sum(') },
    { id: 'contains(', displayName: i18n.t('contains(') },
    { id: 'containsItems(', displayName: i18n.t('containsItems(') },
    { id: 'is(', displayName: i18n.t('is(') },
    { id: 'firstNonNull(', displayName: i18n.t('firstNonNull(') },
    { id: 'normDistCum(', displayName: i18n.t('normDistCum(') },
    { id: 'normDistDen(', displayName: i18n.t('normDistDen(') },
    { id: 'null', displayName: i18n.t('null') },
    { id: 'orgUnit.ancestor(', displayName: i18n.t('orgUnit.ancestor(') },
    { id: 'orgUnit.dataSet(', displayName: i18n.t('orgUnit.dataSet(') },
    { id: 'orgUnit.group(', displayName: i18n.t('orgUnit.group(') },
    { id: 'orgUnit.program(', displayName: i18n.t('orgUnit.program(') },
    { id: 'removeZeros(', displayName: i18n.t('removeZeros(') },
    { id: '.maxDate(', displayName: i18n.t('.maxDate(') },
    { id: '.minDate(', displayName: i18n.t('.minDate(') },

    // normDistCum
]

const baseElementTypes: ElementType[] = [
    {
        type: 'dataElement',
        name: i18n.t('Data elements'),
        component: DataElementsList,
    },
    {
        type: 'programs',
        name: i18n.t('Program data'),
        component: ProgramsList,
    },
    {
        type: 'organisationUnitGroups',
        name: i18n.t('Org unit counts'),
        component: OrganisationUnitGroupsList,
    },
    {
        type: 'constants',
        name: i18n.t('Constants'),
        component: ConstantsList,
    },
    {
        type: 'dataSets',
        name: i18n.t('Reporting rates'),
        component: DataSetsList,
    },
]

export const defaultElementTypes = [
    {
        type: 'operator',
        name: i18n.t('Operators'),
        elements: OPERATOR_ELEMENTS,
        component: DefaultList,
    },
    ...baseElementTypes,
]

const indicatorElementTypes = [
    {
        type: 'operator',
        name: i18n.t('Operators'),
        elements: INDICATOR_OPERATOR_ELEMENTS,
        component: DefaultList,
    },
    ...baseElementTypes,
    {
        type: 'indicator',
        name: i18n.t('Indicators'),
        component: IndicatorsList,
    },
]

const predictorElementTypes = [
    {
        type: 'operator',
        name: i18n.t('Operators'),
        elements: PREDICTOR_OPERATOR_ELEMENTS,
        component: DefaultList,
    },
    ...baseElementTypes,
]

const PI_VARIABLE_ELEMENTS = [
    {
        id: 'V{analytics_period_end}',
        displayName: i18n.t('Analytics period end'),
    },
    {
        id: 'V{analytics_period_start}',
        displayName: i18n.t('Analytics period start'),
    },
    { id: 'V{completed_date}', displayName: i18n.t('Completed date') },
    { id: 'V{creation_date}', displayName: i18n.t('Creation date') },
    { id: 'V{current_date}', displayName: i18n.t('Current date') },
    { id: 'V{due_date}', displayName: i18n.t('Due date') },
    { id: 'V{enrollment_status}', displayName: i18n.t('Enrollment status') },
    { id: 'V{event_date}', displayName: i18n.t('Event date') },
    { id: 'V{event_status}', displayName: i18n.t('Event status') },
    { id: 'V{program_stage_id}', displayName: i18n.t('Program stage id') },
    { id: 'V{program_stage_name}', displayName: i18n.t('Program stage name') },
    { id: 'V{sync_date}', displayName: i18n.t('Sync date') },
    { id: 'V{value_count}', displayName: i18n.t('Value count') },
    {
        id: 'V{zero_pos_value_count}',
        displayName: i18n.t('Zero or positive value count'),
    },
].sort((a, b) => a.displayName?.localeCompare(b.displayName))

const PI_VARIABLE_ELEMENTS_COUNT = [
    ...PI_VARIABLE_ELEMENTS,
    { id: 'V{enrollment_count}', displayName: i18n.t('Enrollment count') },
    { id: 'V{event_count}', displayName: i18n.t('Event count') },
    { id: 'V{org_unit_count}', displayName: i18n.t('Organisation unit count') },
    {
        id: 'V{tei_count}',
        displayName: i18n.t('Tracked entity instance count'),
    },
].sort((a, b) => a.displayName?.localeCompare(b.displayName))

const PROGRAM_RULE_VARIABLE_IDS = [
    'V{completed_date}',
    'V{current_date}',
    'V{due_date}',
    'V{enrollment_date}',
    'V{enrollment_id}',
    'V{enrollment_status}',
    'V{environment}',
    'V{event_count}',
    'V{event_date}',
    'V{event_id}',
    'V{event_status}',
    'V{incident_date}',
    'V{orgunit_code}',
    'V{program_stage_id}',
    'V{program_stage_name}',
]

const PROGRAM_RULE_VARIABLE_ELEMENTS: Element[] = PROGRAM_RULE_VARIABLE_IDS.map(
    (id) => ({ id, displayName: id })
)

const PROGRAM_RULE_FUNCTION_ELEMENTS = [
    { id: 'd2:ceil( <number> )', displayName: 'd2:ceil( <number> )' },
    { id: 'd2:floor( <number> )', displayName: 'd2:floor( <number> )' },
    { id: 'd2:round( <number> )', displayName: 'd2:round( <number> )' },
    {
        id: 'd2:modulus( <number> , <number> )',
        displayName: 'd2:modulus( <number> , <number> )',
    },
    { id: 'd2:zing( <number> )', displayName: 'd2:zing( <number> )' },
    { id: 'd2:oizp( <number> )', displayName: 'd2:oizp( <number> )' },
    {
        id: 'd2:concatenate( <object>, <object>, ...)',
        displayName: 'd2:concatenate( <object>, <object>, ...)',
    },
    {
        id: 'd2:daysBetween( <date>, <date> )',
        displayName: 'd2:daysBetween( <date>, <date> )',
    },
    {
        id: 'd2:weeksBetween( <date>, <date> )',
        displayName: 'd2:weeksBetween( <date>, <date> )',
    },
    {
        id: 'd2:monthsBetween( <date>, <date> )',
        displayName: 'd2:monthsBetween( <date>, <date> )',
    },
    {
        id: 'd2:yearsBetween( <date>, <date> )',
        displayName: 'd2:yearsBetween( <date>, <date> )',
    },
    {
        id: 'd2:addDays( <date>, <number> )',
        displayName: 'd2:addDays( <date>, <number> )',
    },
    {
        id: 'd2:count( <sourcefield> )',
        displayName: 'd2:count( <sourcefield> )',
    },
    {
        id: 'd2:countIfValue( <sourcefield>, <text> )',
        displayName: 'd2:countIfValue( <sourcefield>, <text> )',
    },
    {
        id: 'd2:countIfZeroPos( <sourcefield> )',
        displayName: 'd2:countIfZeroPos( <sourcefield> )',
    },
    {
        id: 'd2:hasValue( <sourcefield> )',
        displayName: 'd2:hasValue( <sourcefield> )',
    },
    {
        id: 'd2:zpvc( <object>, <object>, ...)',
        displayName: 'd2:zpvc( <object>, <object>, ...)',
    },
    {
        id: 'd2:validatePattern( <text>, <regex> )',
        displayName: 'd2:validatePattern( <text>, <regex> )',
    },
    {
        id: 'd2:left( <text>, <number> )',
        displayName: 'd2:left( <text>, <number> )',
    },
    {
        id: 'd2:right( <text>, <number> )',
        displayName: 'd2:right( <text>, <number> )',
    },
    {
        id: 'd2:substring( <text>, <number>, <number> )',
        displayName: 'd2:substring( <text>, <number>, <number> )',
    },
    {
        id: 'd2:split( <text>, <text>, <number> )',
        displayName: 'd2:split( <text>, <text>, <number> )',
    },
    { id: 'd2:length( <text> )', displayName: 'd2:length( <text> )' },
    {
        id: 'd2:inOrgUnitGroup( <orgunit_group_code> )',
        displayName: 'd2:inOrgUnitGroup( <orgunit_group_code> )',
    },
    {
        id: 'd2:hasUserRole( <user_role> )',
        displayName: 'd2:hasUserRole( <user_role> )',
    },
    {
        id: 'd2:zScoreWFA( <ageInMonth>, <weight>, <gender> )',
        displayName: 'd2:zScoreWFA( <ageInMonth>, <weight>, <gender> )',
    },
    {
        id: 'd2:zScoreHFA( <ageInMonth>, <height>, <gender> )',
        displayName: 'd2:zScoreHFA( <ageInMonth>, <height>, <gender> )',
    },
    {
        id: 'd2:zScoreWFH( <height>, <weight>, <gender> )',
        displayName: 'd2:zScoreWFH( <height>, <weight>, <gender> )',
    },
    {
        id: 'd2:extractDataMatrixValue( <key>, <value>)',
        displayName: 'd2:extractDataMatrixValue( <key>, <value>)',
    },
    {
        id: 'd2:contains( <text>, <text>, ...)',
        displayName: 'd2:contains( <text>, <text>, ...)',
    },
    {
        id: 'd2:containsItems( <text>, <text>, ...)',
        displayName: 'd2:containsItems( <text>, <text>, ...)',
    },
    {
        id: 'd2:inUserGroup( <user_group_id> )',
        displayName: 'd2:inUserGroup( <user_group_id> )',
    },
    {
        id: 'd2:lastEventDate()',
        displayName: 'd2:lastEventDate()',
    },
    {
        id: 'd2:maxValue( <dataElement> )',
        displayName: 'd2:maxValue( <dataElement> )',
    },
    {
        id: 'd2:minValue( <dataElement> )',
        displayName: 'd2:minValue( <dataElement> )',
    },
]

const PROGRAM_RULE_OPERATOR_ELEMENTS = [
    { id: '+', displayName: '+' },
    { id: '-', displayName: '-' },
    { id: '*', displayName: '*' },
    { id: '/', displayName: '/' },
    { id: '%', displayName: '%' },
    { id: '>', displayName: '>' },
    { id: '>=', displayName: '>=' },
    { id: '<', displayName: '<' },
    { id: '<=', displayName: '<=' },
    { id: '==', displayName: '==' },
    { id: '!=', displayName: '!=' },
    { id: '!', displayName: 'NOT' },
    { id: '&&', displayName: 'AND' },
    { id: '||', displayName: 'OR' },
]

const programIndicatorElementTypes: ElementType[] = [
    {
        type: 'operator',
        name: i18n.t('Operators'),
        elements: PROGRAM_INDICATOR_OPERATOR_ELEMENTS,
        component: DefaultList,
    },
    {
        type: 'variables',
        name: i18n.t('Variables'),
        elements: PI_VARIABLE_ELEMENTS,
        component: DefaultList,
    },
    {
        type: 'programStage',
        name: i18n.t('Program stage data'),
        component: ProgramStageList,
    },
    {
        type: 'attributes',
        name: i18n.t('Attributes'),
        component: ProgramAttributes,
    },
    {
        type: 'constants',
        name: i18n.t('Constants'),
        component: ConstantsList,
    },
]

const programRuleElementTypes: ElementType[] = [
    {
        type: 'operator',
        name: i18n.t('Operators'),
        elements: PROGRAM_RULE_OPERATOR_ELEMENTS,
        component: DefaultList,
    },
    {
        type: 'variables',
        name: i18n.t('Variables'),
        elements: PROGRAM_RULE_VARIABLE_ELEMENTS,
        component: DefaultList,
    },
    {
        type: 'programRuleVariables',
        name: i18n.t('Program rule variables'),
        component: ProgramRuleVariablesList,
    },
    {
        type: 'functions',
        name: i18n.t('Functions'),
        elements: PROGRAM_RULE_FUNCTION_ELEMENTS,
        component: DefaultList,
    },
]

const programIndicatorElementTypesCount: ElementType[] = [
    ...programIndicatorElementTypes,
]
programIndicatorElementTypesCount[1] = {
    type: 'variables',
    name: i18n.t('Variables'),
    elements: PI_VARIABLE_ELEMENTS_COUNT,
    component: DefaultList,
}

export const getElementTypes = (
    type: ExpressionBuilderType,
    { aggregationType }: { aggregationType: string | undefined }
): ElementType[] => {
    if (type === 'programIndicator') {
        return aggregationType === 'COUNT'
            ? programIndicatorElementTypesCount
            : programIndicatorElementTypes
    }
    if (type === 'programRule') {
        return programRuleElementTypes
    }
    if (type === 'indicator') {
        return indicatorElementTypes
    }
    if (type === 'predictor') {
        return predictorElementTypes
    }
    return defaultElementTypes
}

import { render, within } from '@testing-library/react'
import React from 'react'
import schemaMock from '../../__mocks__/schema/programIndicatorsSchema.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import { getConstantTranslation, SECTIONS_MAP } from '../../lib'
import {
    randomDhis2Id,
    testCustomAttribute,
    testLegendSet,
    testProgram,
    testProgramIndicator,
} from '../../testUtils/builders'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { uiAssertions } from '../../testUtils/uiAssertions'
import { Program, ProgramTrackedEntityAttribute } from '../../types/generated'
import { Component as Edit } from './Edit'
import { staticOptions } from './form/OrgUnitField'
import { PROGRAM_INDICATOR_SPECIFIC_TRANSLATIONS } from './form/ProgramIndicatorFormFields'
import resetAllMocks = jest.resetAllMocks

const section = SECTIONS_MAP.programIndicator
const mockSchema = schemaMock
jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))
// Swaps in the fast test double from ModelTransfer/__mocks__ for the
// legend sets transfer field - the real @dhis2/ui Transfer it replaces is
// covered directly by BaseModelTransfer.spec.tsx.
jest.mock(
    '../../components/metadataFormControls/ModelTransfer/BaseModelTransfer'
)

describe('Program indicator form tests - Edit', () => {
    const updateMock = jest.fn()

    beforeEach(() => {
        resetAllMocks()
        const portalRoot = document.createElement('div')
        portalRoot.setAttribute('id', FOOTER_ID)
        document.body.appendChild(portalRoot)
    })

    afterEach(() => {
        const portalRoot = document.getElementById(FOOTER_ID)
        if (portalRoot) {
            portalRoot.remove()
        }
    })

    const renderForm = generateRenderer(
        { section, mockSchema },
        (
            routeOptions,
            {
                customTestData = {},
                programIndicatorOverwrites = {},
                matchingExistingElementFilter = undefined,
                id = randomDhis2Id(),
                overridePrograms,
            } = {}
        ) => {
            const programWithoutRegistration = testProgram({
                programType: 'WITHOUT_REGISTRATION' as Program.programType,
            })
            const programs = overridePrograms ?? [
                programWithoutRegistration,
                testProgram(),
                testProgram(),
            ]
            const attributes = [testCustomAttribute()]
            const legendSets = [testLegendSet(), testLegendSet()]
            const periodTypes = ['Daily', 'Monthly', 'Yearly']

            const programIndicator = testProgramIndicator({
                id,
                program: programWithoutRegistration,
                legendSets: [legendSets[0]],
                attributeValues: [
                    { attribute: attributes[0], value: 'attribute' },
                ],
                analyticsPeriodBoundaries: [
                    {
                        boundaryTarget: 'INCIDENT_DATE',
                        analyticsPeriodBoundaryType:
                            'BEFORE_START_OF_REPORTING_PERIOD',
                        offsetPeriodType: periodTypes[0],
                        offsetPeriods: 5,
                    },
                ],
                ...programIndicatorOverwrites,
            })
            if (programIndicatorOverwrites.orgUnitField === null) {
                delete programIndicator.orgUnitField
            }
            const screen = render(
                <TestComponentWithRouter
                    path={`/${section.namePlural}/:id`}
                    initialEntries={[`/${section.namePlural}/${id}`]}
                    customData={{
                        attributes: () => ({ attributes }),
                        programs: (_: any, params: any) => {
                            if (
                                params.params.id ===
                                programWithoutRegistration.id
                            ) {
                                return {
                                    programStages: [],
                                }
                            }
                            return Promise.resolve({
                                programs,
                            })
                        },
                        legendSets: () => ({
                            legendSets,
                            pager: {
                                page: 1,
                                total: 2,
                                pageSize: 20,
                                pageCount: 1,
                            },
                        }),
                        programIndicators: (type: any, params: any) => {
                            if (type === 'json-patch') {
                                updateMock(params)
                                return { statusCode: 204 }
                            }
                            if (type === 'read') {
                                if (params?.id) {
                                    return programIndicator
                                }
                                if (
                                    params?.params?.filter?.includes(
                                        matchingExistingElementFilter
                                    )
                                ) {
                                    return {
                                        pager: { total: 1 },
                                        programIndicators: [
                                            testProgramIndicator(),
                                        ],
                                    }
                                }
                                return {
                                    pager: { total: 0 },
                                    programIndicators: [],
                                }
                            }
                        },
                        periodTypes: () => ({
                            periodTypes: periodTypes.map((pt) => ({
                                name: pt,
                            })),
                        }),
                        'programIndicators/expression/description': () => ({
                            status: 'OK',
                        }),
                        'programIndicators/filter/description': () => ({
                            status: 'OK',
                        }),
                        ...customTestData,
                    }}
                    routeOptions={routeOptions}
                >
                    <Edit />
                </TestComponentWithRouter>
            )
            return {
                screen,
                attributes,
                programs,
                legendSets,
                programIndicator,
            }
        }
    )

    it('contain all the basic information fields', async () => {
        const { screen, programIndicator } = await renderForm()
        uiAssertions.expectNameFieldExist(programIndicator.name, screen)
        uiAssertions.expectInputFieldToExist(
            'shortName',
            programIndicator.shortName,
            screen
        )

        uiAssertions.expectCodeFieldExist(programIndicator.code, screen)
        uiAssertions.expectTextAreaFieldToExist(
            'description',
            programIndicator.description,
            screen
        )
        uiAssertions.expectColorAndIconFieldToExist(screen)
    })
    it('contain all the configuration field', async () => {
        const { screen, programs, programIndicator } = await renderForm()

        await uiAssertions.expectSelectToExistWithOptions(
            screen.getByTestId('programs-field'),
            {
                selected: programIndicator.program.displayName,
                options: programs,
            },
            screen
        )

        await uiAssertions.expectSelectToExistWithOptions(
            screen.getByTestId('aggregation-type-field'),
            {
                selected: getConstantTranslation(
                    programIndicator.aggregationType
                ),
                options: mockSchema.properties.aggregationType.constants.map(
                    (o) => ({
                        displayName: getConstantTranslation(o),
                    })
                ),
            },
            screen
        )

        uiAssertions.expectRadioFieldToExist(
            'analyticsType',
            [
                {
                    label: PROGRAM_INDICATOR_SPECIFIC_TRANSLATIONS.EVENT,
                    checked: programIndicator.analyticsType === 'EVENT',
                },
                {
                    label: PROGRAM_INDICATOR_SPECIFIC_TRANSLATIONS.ENROLLMENT,
                    checked: programIndicator.analyticsType === 'ENROLLMENT',
                },
            ],
            screen
        )

        await uiAssertions.expectSelectToExistWithOptions(
            screen.getByTestId('org-unit-field'),
            {
                selected: staticOptions.eventDefault.label,
                options: [
                    {
                        displayName: staticOptions.eventDefault.label,
                    },
                ],
            },
            screen
        )

        const expectedDecimalsOptions = [
            { displayName: '<No value>' },
            { displayName: '0' },
            { displayName: '1' },
            { displayName: '2' },
            { displayName: '3' },
            { displayName: '4' },
            { displayName: '5' },
        ]
        await uiAssertions.expectSelectToExistWithOptions(
            screen.getByTestId('decimals-field'),
            {
                selected: programIndicator.decimals,
                options: expectedDecimalsOptions,
            },
            screen
        )
    })
    it('shows the selected org-unit-field value (tracker program)', async () => {
        const programTrackedEntityAttributes = [
            {
                trackedEntityAttribute: {
                    valueType: 'ORGANISATION_UNIT',
                    displayName: 'entity attribute org unit',
                    id: randomDhis2Id(),
                },
            },
            {
                trackedEntityAttribute: {
                    valueType: 'TEXT',
                    displayName: 'other entity attribute',
                    id: randomDhis2Id(),
                },
            },
        ] as unknown as ProgramTrackedEntityAttribute[]
        const programWithRegistration = testProgram({
            programType: 'WITH_REGISTRATION' as Program.programType,
            programTrackedEntityAttributes,
        })
        const orgUnitOptions = [
            { displayName: staticOptions.eventDefault.label },
            programTrackedEntityAttributes[0].trackedEntityAttribute,
            { displayName: staticOptions.registration.label },
            { displayName: staticOptions.enrollment.label },
            { displayName: staticOptions.ownerAtStart.label },
            { displayName: staticOptions.ownerAtEnd.label },
        ]
        const orgUnitOption = staticOptions.ownerAtStart
        const overridePrograms = [
            programWithRegistration,
            testProgram(),
            testProgram(),
            testProgram(),
        ]
        const { screen, programs, programIndicator } = await renderForm({
            programIndicatorOverwrites: {
                orgUnitField: orgUnitOption.value,
                program: programWithRegistration,
                analyticsType: 'EVENT',
            },
            overridePrograms,
        })

        await uiAssertions.expectSelectToExistWithOptions(
            screen.getByTestId('programs-field'),
            {
                selected: programIndicator.program.displayName,
                options: programs,
            },
            screen
        )

        await uiAssertions.expectSelectToExistWithOptions(
            screen.getByTestId('org-unit-field'),
            {
                selected: orgUnitOption.label,
                options: orgUnitOptions,
            },
            screen
        )
    })
    it('shows default org unit field if none is selected (tracker program)', async () => {
        const programTrackedEntityAttributes = [
            {
                trackedEntityAttribute: {
                    valueType: 'ORGANISATION_UNIT',
                    displayName: 'entity attribute org unit',
                    id: randomDhis2Id(),
                },
            },
            {
                trackedEntityAttribute: {
                    valueType: 'TEXT',
                    displayName: 'other entity attribute',
                    id: randomDhis2Id(),
                },
            },
        ] as unknown as ProgramTrackedEntityAttribute[]
        const programWithRegistration = testProgram({
            programType: 'WITH_REGISTRATION' as Program.programType,
            programTrackedEntityAttributes,
        })
        const orgUnitOptions = [
            { displayName: staticOptions.eventDefault.label },
            programTrackedEntityAttributes[0].trackedEntityAttribute,
            { displayName: staticOptions.registration.label },
            { displayName: staticOptions.enrollment.label },
            { displayName: staticOptions.ownerAtStart.label },
            { displayName: staticOptions.ownerAtEnd.label },
        ]
        const orgUnitOption = staticOptions.eventDefault
        const overridePrograms = [
            programWithRegistration,
            testProgram(),
            testProgram(),
            testProgram(),
        ]
        const { screen, programs, programIndicator } = await renderForm({
            programIndicatorOverwrites: {
                orgUnitField: undefined,
                program: programWithRegistration,
                analyticsType: 'EVENT',
            },
            overridePrograms,
        })

        await uiAssertions.expectSelectToExistWithOptions(
            screen.getByTestId('programs-field'),
            {
                selected: programIndicator.program.displayName,
                options: programs,
            },
            screen
        )

        await uiAssertions.expectSelectToExistWithOptions(
            screen.getByTestId('org-unit-field'),
            {
                selected: orgUnitOption.label,
                options: orgUnitOptions,
            },
            screen
        )
    })
    it('contain expression and filter field', async () => {
        const { screen, programIndicator } = await renderForm()
        uiAssertions.expectTextAreaFieldToExist(
            'expression',
            programIndicator.expression,
            screen
        )
        uiAssertions.expectTextAreaFieldToExist(
            'filter',
            programIndicator.filter,
            screen
        )
    })
    it('contain the period boundaries', async () => {
        const { screen } = await renderForm()

        const boundariesList = screen.getAllByTestId(
            'analytics-period-boundary'
        )
        expect(boundariesList).toHaveLength(1)
        expect(boundariesList[0]).toHaveTextContent('Incident date')
        expect(boundariesList[0]).toHaveTextContent('Offset: 5')
        expect(boundariesList[0]).toHaveTextContent(
            'Type: Before start of reporting period'
        )
        expect(boundariesList[0]).toHaveTextContent('Period: Daily')
    })
    it('contain all the advance options fields', async () => {
        const { screen, programIndicator } = await renderForm()

        uiAssertions.expectCheckboxFieldToExist(
            'displayInForm',
            programIndicator.displayInForm,
            screen
        )
        uiAssertions.expectInputFieldToExist(
            'aggregateExportCategoryOptionCombo',
            programIndicator.aggregateExportCategoryOptionCombo,
            screen
        )
        uiAssertions.expectInputFieldToExist(
            'aggregateExportAttributeOptionCombo',
            programIndicator.aggregateExportAttributeOptionCombo,
            screen
        )
        uiAssertions.expectInputFieldToExist(
            'aggregateExportDataElement',
            programIndicator.aggregateExportDataElement,
            screen
        )
    })
    it('contain the legend transfer', async () => {
        const { screen, legendSets } = await renderForm()

        await uiAssertions.expectTransferFieldToExistWithOptions(
            'legendSets-field',
            { lhs: [legendSets[1]], rhs: [legendSets[0]] },
            screen
        )
    })
    it('contain all the attributes fields ', async () => {
        const { screen, attributes, programIndicator } = await renderForm()
        attributes.forEach((attribute: { id: string }) => {
            const attributeInput = screen.getByTestId(
                `attribute-${attribute.id}`
            )
            expect(attributeInput).toBeVisible()
            expect(
                within(
                    within(attributeInput).getByTestId('dhis2-uicore-input')
                ).getByRole('textbox')
            ).toHaveValue(programIndicator.attributeValues[0].value)
        })
    })
    it('maps orgUnitField:EVENT to null on save', async () => {
        const { screen, programIndicator } = await renderForm({
            programIndicatorOverwrites: { orgUnitField: 'EVENT' },
        })
        await uiActions.submitForm(screen)
        expect(updateMock).toHaveBeenCalledWith({
            data: [{ op: 'add', path: '/orgUnitField', value: null }],
            id: programIndicator.id,
            params: undefined,
            resource: 'programIndicators',
        })
    })
    it('shows null orgUnitField value with appropriate label', async () => {
        const programWithRegistration = testProgram({
            programType: 'WITH_REGISTRATION' as Program.programType,
        })
        const { screen } = await renderForm({
            programIndicatorOverwrites: {
                orgUnitField: null,
                program: programWithRegistration,
                analyticsType: 'EVENT',
            },
        })
        expect(screen.getByTestId('org-unit-field')).toHaveTextContent(
            staticOptions.eventDefault.label
        )
    })
    it('leaves other orgUnitField values unchanged', async () => {
        const orgUnitOption = staticOptions.ownerAtStart

        const programWithRegistration = testProgram({
            programType: 'WITH_REGISTRATION' as Program.programType,
        })
        const { screen } = await renderForm({
            programIndicatorOverwrites: {
                orgUnitField: orgUnitOption.value,
                program: programWithRegistration,
                analyticsType: 'EVENT',
            },
        })
        await uiActions.submitForm(screen)
        expect(updateMock).not.toHaveBeenCalled()
    })
    it('update decimals to 0', async () => {
        const { screen, programIndicator } = await renderForm({
            programIndicatorOverwrites: { decimals: 1, orgUnitField: null },
        })
        await uiActions.pickOptionFromSelect(
            screen.getByTestId('decimals-field'),
            1,
            screen
        )
        await uiActions.submitForm(screen)
        expect(updateMock).toHaveBeenCalledWith({
            data: [{ op: 'replace', path: '/decimals', value: 0 }],
            id: programIndicator.id,
            params: undefined,
            resource: 'programIndicators',
        })
    })
    it('displays 0 decimals correctly', async () => {
        const { screen } = await renderForm({
            programIndicatorOverwrites: { decimals: 0 },
        })
        const decimals = within(
            screen.getByTestId('decimals-field')
        ).getByTestId('dhis2-uicore-select-input')
        expect(decimals).toBeVisible()
        expect(decimals).toHaveTextContent('0')
    })
    it('should have a cancel button with a link back to the list view', async () => {
        const { screen } = await renderForm()
        const cancelButton = screen.getByTestId('form-cancel-link')
        expect(cancelButton).toBeVisible()
        expect(cancelButton).toHaveAttribute('href', `/${section.namePlural}`)
    })
    it('should do nothing and return to the list view on success when no field is changed', async () => {
        const { screen } = await renderForm({
            programIndicatorOverwrites: { orgUnitField: null },
        })
        await uiActions.submitForm(screen)
        expect(updateMock).not.toHaveBeenCalled()
    })
})

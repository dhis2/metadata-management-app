import { faker } from '@faker-js/faker'
import {
    render,
    waitFor,
    waitForElementToBeRemoved,
    within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import schemaMock from '../../__mocks__/schema/predictor.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import { useSystemSettingsStore, SECTIONS_MAP } from '../../lib'
import { useSchemaStore } from '../../lib/schemas/schemaStore'
import { ModelSchemas } from '../../lib/useLoadApp'
import { useCurrentUserStore } from '../../lib/user/currentUserStore'
import {
    randomDhis2Id,
    testOrgUnit,
    testOrgUnitLevel,
    testPredictorList,
} from '../../testUtils/builders'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { uiAssertions } from '../../testUtils/uiAssertions'
import { SystemSettings } from '../../types'
import type { OrganisationUnit } from '../../types/generated'
import { Component as Edit } from './Edit'
import { Component as New } from './New'
import resetAllMocks = jest.resetAllMocks

jest.setTimeout(40 * 1000)

const section = SECTIONS_MAP.predictor
const mockSchema = schemaMock

jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))

const EXPRESSION_SCHEMA = {
    properties: {
        expression: { propertyType: 'TEXT' },
    },
}

const setupStores = () => {
    useSchemaStore.getState().setSchemas({
        [section.name]: mockSchema,
        expression: EXPRESSION_SCHEMA,
    } as unknown as ModelSchemas)

    useCurrentUserStore.getState().setCurrentUser({
        organisationUnits: [testOrgUnit()] as OrganisationUnit[],
        authorities: new Set(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        settings: {},
    })

    useSystemSettingsStore.getState().setSystemSettings({} as SystemSettings)
}

describe('Predictors form tests', () => {
    const createMock = jest.fn()
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

    const periodTypeNames = ['Daily', 'Monthly', 'Yearly']

    const makeDataElements = () => [
        {
            id: randomDhis2Id(),
            displayName: faker.company.name(),
            categoryCombo: { id: randomDhis2Id(), isDefault: true },
        },
        {
            id: randomDhis2Id(),
            displayName: faker.company.name(),
            categoryCombo: { id: randomDhis2Id(), isDefault: true },
        },
    ]

    const makeOrgUnitLevels = () => [
        testOrgUnitLevel({ level: 1 }),
        testOrgUnitLevel({ level: 2 }),
        testOrgUnitLevel({ level: 3 }),
    ]

    const makeCommonCustomData = (
        dataElements: ReturnType<typeof makeDataElements>,
        orgUnitLevels: ReturnType<typeof makeOrgUnitLevels>
    ) => ({
        dataElements: () => ({
            dataElements,
            pager: { page: 1, total: 2, pageSize: 20, pageCount: 1 },
        }),
        periodTypes: () => ({
            periodTypes: periodTypeNames.map((pt) => ({ name: pt })),
        }),
        organisationUnitLevels: () => ({
            pager: {},
            organisationUnitLevels: orgUnitLevels,
        }),
        'predictors/expression/description': () => ({ status: 'OK' }),
    })

    describe('New', () => {
        const routeOptions = { handle: { section } }

        const renderForm = async () => {
            setupStores()
            const dataElements = makeDataElements()
            const orgUnitLevels = makeOrgUnitLevels()
            const screen = render(
                <TestComponentWithRouter
                    path={`/${section.namePlural}`}
                    customData={{
                        ...makeCommonCustomData(dataElements, orgUnitLevels),
                        predictors: (type: any, params: any) => {
                            if (type === 'create') {
                                createMock(params)
                                return { statusCode: 204 }
                            }
                            return { pager: { total: 0 }, predictors: [] }
                        },
                    }}
                    routeOptions={routeOptions}
                >
                    <New />
                </TestComponentWithRouter>
            )
            await waitForElementToBeRemoved(() =>
                screen.queryAllByTestId('dhis2-uicore-circularloader')
            )
            return { screen, dataElements, orgUnitLevels }
        }

        it('should contain all needed fields', async () => {
            const { screen, dataElements, orgUnitLevels } = await renderForm()

            uiAssertions.expectNameFieldExist('', screen)
            uiAssertions.expectInputFieldToExist('shortName', '', screen)
            uiAssertions.expectCodeFieldExist('', screen)
            uiAssertions.expectTextAreaFieldToExist('description', null, screen)

            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-periodtype'),
                {
                    selected: 'Monthly',
                    options: periodTypeNames.map((pt) => ({ displayName: pt })),
                },
                screen
            )

            expect(
                screen.getByTestId(
                    'edit-generator.expression-expression-button'
                )
            ).toBeVisible()

            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-output'),
                { options: dataElements },
                screen
            )

            await uiAssertions.expectMultiSelectToExistWithOptions(
                screen.getByTestId('formfields-organisationunitlevels'),
                { selected: [], options: orgUnitLevels },
                screen
            )
        })

        it('should have a cancel button with a link back to the list view', async () => {
            const { screen } = await renderForm()
            const cancelButton = screen.getByTestId('form-cancel-link')
            expect(cancelButton).toBeVisible()
            expect(cancelButton).toHaveAttribute(
                'href',
                `/${section.namePlural}`
            )
        })

        it('should submit data when all required fields are filled', async () => {
            const aName = faker.company.name()
            const aShortName = faker.company.name()
            const aCode = faker.science.chemicalElement().symbol
            const anExpression = faker.number.int().toString()
            const aGeneratorDescription = faker.lorem.sentence()

            const { screen, dataElements } = await renderForm()

            await uiActions.enterName(aName, screen)
            await uiActions.enterInputFieldValue(
                'shortName',
                aShortName,
                screen
            )
            await uiActions.enterCode(aCode, screen)

            await uiActions.pickOptionFromSelect(
                screen.getByTestId('formfields-output'),
                0,
                screen
            )

            await uiActions.applyNewExpressionWithinModal(
                'generator.expression',
                anExpression,
                screen
            )

            // generator.description is required by the zod schema.
            // Two description fields share the same dataTest (a bug), so use getAllByTestId.
            const descFields = screen.getAllByTestId(
                'formfields-denominatorDescription'
            )
            const generatorDescInput = within(descFields[0]).getByRole(
                'textbox'
            )
            await userEvent.type(generatorDescInput, aGeneratorDescription)
            await userEvent.tab()

            await uiActions.submitForm(screen)
            expect(createMock).toHaveBeenCalledTimes(1)
            expect(createMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        name: aName,
                        shortName: aShortName,
                        code: aCode,
                        output: expect.objectContaining({
                            id: dataElements[0].id,
                        }),
                        generator: expect.objectContaining({
                            expression: anExpression,
                        }),
                    }),
                })
            )
        })
    })

    describe('Edit', () => {
        const routeOptions = { handle: { section } }

        const renderForm = async () => {
            setupStores()
            const id = randomDhis2Id()
            const dataElements = makeDataElements()
            const orgUnitLevels = makeOrgUnitLevels()
            const aName = faker.company.name()
            const aShortName = faker.company.name()
            const aCode = faker.science.chemicalElement().symbol
            const anExpression =
                '#{' + faker.number.int({ min: 10000, max: 99999 }) + '}'

            const predictor = testPredictorList({
                id,
                name: aName,
                shortName: aShortName,
                code: aCode,
                periodType: periodTypeNames[1],
                output: {
                    id: dataElements[0].id,
                    displayName: dataElements[0].displayName,
                },
                organisationUnitLevels: [
                    {
                        id: orgUnitLevels[0].id,
                        displayName: orgUnitLevels[0].displayName,
                    },
                ],
                generator: {
                    expression: anExpression,
                    description: 'test generator description',
                    missingValueStrategy: 'NEVER_SKIP',
                },
                sampleSkipTest: undefined,
                organisationUnitDescendants: 'SELECTED',
                sequentialSampleCount: 2,
                annualSampleCount: 1,
                sequentialSkipCount: 0,
            })

            const screen = render(
                <TestComponentWithRouter
                    path={`/${section.namePlural}/:id`}
                    initialEntries={[`/${section.namePlural}/${id}`]}
                    customData={{
                        ...makeCommonCustomData(dataElements, orgUnitLevels),
                        predictors: (type: any, params: any) => {
                            if (type === 'json-patch') {
                                updateMock(params)
                                return { statusCode: 204 }
                            }
                            if (type === 'read') {
                                if (params?.id) {
                                    return predictor
                                }
                                return {
                                    pager: { total: 0 },
                                    predictors: [],
                                }
                            }
                        },
                    }}
                    routeOptions={routeOptions}
                >
                    <Edit />
                </TestComponentWithRouter>
            )
            await waitForElementToBeRemoved(() =>
                screen.queryAllByTestId('dhis2-uicore-circularloader')
            )
            return {
                screen,
                predictor,
                dataElements,
                orgUnitLevels,
                aName,
                aShortName,
                aCode,
                id,
            }
        }

        it('should contain all needed fields prefilled', async () => {
            const { screen, aName, aShortName, aCode, orgUnitLevels } =
                await renderForm()

            uiAssertions.expectNameFieldExist(aName, screen)
            uiAssertions.expectInputFieldToExist(
                'shortName',
                aShortName,
                screen
            )
            uiAssertions.expectCodeFieldExist(aCode, screen)

            // PeriodTypeSelect queries periodTypes only after predictor data loads.
            // Wait for the selected label to appear before asserting options.
            await waitFor(() =>
                expect(
                    screen.getByTestId('formfields-periodtype')
                ).toHaveTextContent('Monthly')
            )

            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-periodtype'),
                {
                    selected: 'Monthly',
                    options: periodTypeNames.map((pt) => ({ displayName: pt })),
                },
                screen
            )

            expect(screen.getByTestId('formfields-output')).toBeVisible()

            await uiAssertions.expectMultiSelectToExistWithOptions(
                screen.getByTestId('formfields-organisationunitlevels'),
                {
                    selected: [orgUnitLevels[0]],
                    options: orgUnitLevels,
                },
                screen
            )
        })

        it('should have a cancel button with a link back to the list view', async () => {
            const { screen } = await renderForm()
            const cancelButton = screen.getByTestId('form-cancel-link')
            expect(cancelButton).toBeVisible()
            expect(cancelButton).toHaveAttribute(
                'href',
                `/${section.namePlural}`
            )
        })

        it('should do nothing when no field is changed', async () => {
            const { screen } = await renderForm()
            await uiActions.submitForm(screen)
            expect(updateMock).not.toHaveBeenCalled()
        })

        it('should submit changes when a field is changed', async () => {
            const { screen, id } = await renderForm()
            const newCode = faker.science.chemicalElement().symbol

            await uiActions.clearInputField('code', screen)
            await uiActions.enterCode(newCode, screen)
            await uiActions.submitForm(screen)

            expect(updateMock).toHaveBeenCalledTimes(1)
            const patchPayload = updateMock.mock.calls[0][0]
            expect(patchPayload).toEqual(expect.objectContaining({ id }))

            const operations = patchPayload.data as Array<{
                op: string
                path: string
                value: unknown
            }>
            expect(operations).toContainEqual({
                op: 'replace',
                path: '/code',
                value: newCode,
            })
        })
    })
})

import { faker } from '@faker-js/faker'
import { act, render, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import optionSetSchemaMock from '../../__mocks__/schema/optionSet.json'
import schemaMock from '../../__mocks__/schema/trackedEntityAttributes.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import { ModelSchemas, SECTIONS_MAP } from '../../lib'
import { useSchemaStore } from '../../lib/schemas/schemaStore'
import {
    randomDhis2Id,
    randomLongString,
    testTrackedEntityAttribute,
} from '../../testUtils/builders'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { uiAssertions } from '../../testUtils/uiAssertions'
import { Component as Edit } from './Edit'
import { Component as New } from './New'

jest.retryTimes(2, { logErrorsBeforeRetry: true })

const section = SECTIONS_MAP.trackedEntityAttribute
const mockSchema = schemaMock

jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))

describe('TrackedEntityAttributes form tests', () => {
    const createMock = jest.fn()
    const updateMock = jest.fn()

    beforeEach(() => {
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

    describe('Common', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (routeOptions, { customTestData = {} } = {}) => {
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            optionSets: () => ({
                                optionSets: [],
                                pager: {
                                    page: 1,
                                    total: 0,
                                    pageSize: 20,
                                    pageCount: 0,
                                },
                            }),
                            trackedEntityTypes: () => ({
                                trackedEntityTypes: [],
                                pager: {
                                    page: 1,
                                    total: 0,
                                    pageSize: 20,
                                    pageCount: 0,
                                },
                            }),
                            legendSets: () => ({
                                legendSets: [],
                                pager: {
                                    page: 1,
                                    total: 0,
                                    pageSize: 20,
                                    pageCount: 0,
                                },
                            }),
                            'system/info': () => ({ encryption: true }),
                            attributes: () => ({ attributes: [] }),
                            trackedEntityAttributes: (
                                type: any,
                                params: any
                            ) => {
                                if (type === 'create') {
                                    createMock(params)
                                    return { statusCode: 204 }
                                }
                                return {
                                    pager: { total: 0 },
                                    trackedEntityAttributes: [],
                                }
                            },
                            ...customTestData,
                        }}
                        routeOptions={routeOptions}
                    >
                        <New />
                    </TestComponentWithRouter>
                )
                return { screen }
            }
        )

        it('should not submit when required values are missing', async () => {
            const { screen } = await renderForm()
            await uiActions.submitForm(screen)
            expect(createMock).not.toHaveBeenCalled()
            uiAssertions.expectFieldToHaveError(
                'formfields-name',
                'Required',
                screen
            )
            uiAssertions.expectFieldToHaveError(
                'formfields-shortName',
                'Required',
                screen
            )
        })

        it('should show error if name too long', async () => {
            const { screen } = await renderForm()
            const longText = randomLongString(231)
            await uiActions.enterName(longText, screen)
            await uiAssertions.expectNameToErrorWhenExceedsLength(screen)
            await uiActions.submitForm(screen)
            expect(createMock).not.toHaveBeenCalled()
        })

        it('should open the option set new form in a drawer when clicking the "Add new" button', async () => {
            const { screen } = await renderForm()

            useSchemaStore.getState().setSchemas({
                ...useSchemaStore.getState().schemas,
                optionSet: optionSetSchemaMock,
            } as unknown as ModelSchemas)

            await act(async () => {})

            const optionSetField = screen.getByTestId('formfields-optionSet')
            const addNewButton =
                within(optionSetField).getAllByRole('button')[1]
            await userEvent.click(addNewButton)

            expect(
                await screen.findByText('Add new Option set')
            ).toBeInTheDocument()
            expect(screen.getByTestId('optionSetNewForm')).toBeInTheDocument()
            expect(
                within(screen.getByTestId('optionSetNewForm')).getByTestId(
                    'form-submit-button'
                )
            ).toHaveTextContent('Save and close')
        })
    })

    describe('New', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (routeOptions, { customTestData = {} } = {}) => {
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            optionSets: () => ({
                                optionSets: [],
                                pager: {
                                    page: 1,
                                    total: 0,
                                    pageSize: 20,
                                    pageCount: 0,
                                },
                            }),
                            trackedEntityTypes: () => ({
                                trackedEntityTypes: [],
                                pager: {
                                    page: 1,
                                    total: 0,
                                    pageSize: 20,
                                    pageCount: 0,
                                },
                            }),
                            legendSets: () => ({
                                legendSets: [],
                                pager: {
                                    page: 1,
                                    total: 0,
                                    pageSize: 20,
                                    pageCount: 0,
                                },
                            }),
                            'system/info': () => ({ encryption: true }),
                            attributes: () => ({ attributes: [] }),
                            trackedEntityAttributes: (
                                type: any,
                                params: any
                            ) => {
                                if (type === 'create') {
                                    createMock(params)
                                    return { statusCode: 204 }
                                }
                                return {
                                    pager: { total: 0 },
                                    trackedEntityAttributes: [],
                                }
                            },
                            ...customTestData,
                        }}
                        routeOptions={routeOptions}
                    >
                        <New />
                    </TestComponentWithRouter>
                )
                return { screen }
            }
        )

        it('contains all needed fields', async () => {
            const { screen } = await renderForm()
            uiAssertions.expectNameFieldExist('', screen)
            uiAssertions.expectInputFieldToExist('formName', '', screen)
            uiAssertions.expectInputFieldToExist('shortName', '', screen)
            uiAssertions.expectCodeFieldExist('', screen)
            uiAssertions.expectTextAreaFieldToExist('description', null, screen)
        })

        it('submits basic info', async () => {
            const aName = faker.word.words()
            const aFormName = faker.word.words()
            const aShortName = faker.word.words()
            const aCode = faker.science.chemicalElement().symbol
            const aDescription = faker.company.buzzPhrase()
            const { screen } = await renderForm()
            await uiActions.enterName(aName, screen)
            await uiActions.enterInputFieldValue('formName', aFormName, screen)
            await uiActions.enterInputFieldValue(
                'shortName',
                aShortName,
                screen
            )
            await uiActions.enterCode(aCode, screen)
            await uiActions.enterInputFieldValue(
                'description',
                aDescription,
                screen
            )
            await uiActions.submitForm(screen)
            expect(createMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        name: aName,
                        formName: aFormName,
                        shortName: aShortName,
                        code: aCode,
                        description: aDescription,
                    }),
                })
            )
        })

        it('submits with value type and aggregation type', async () => {
            const aName = faker.word.words()
            const aShortName = faker.word.words()
            const { screen } = await renderForm()
            await uiActions.enterName(aName, screen)
            await uiActions.enterInputFieldValue(
                'shortName',
                aShortName,
                screen
            )
            await uiActions.submitForm(screen)
            expect(createMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        name: aName,
                        shortName: aShortName,
                        valueType: 'TEXT',
                        aggregationType: 'NONE',
                    }),
                })
            )
        })
    })

    describe('Edit', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (
                routeOptions,
                {
                    trackedEntityAttributeOverwrites = {},
                    id = randomDhis2Id(),
                } = {}
            ) => {
                const trackedEntityAttribute = testTrackedEntityAttribute({
                    id,
                    ...trackedEntityAttributeOverwrites,
                })
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}/:id`}
                        initialEntries={[`/${section.namePlural}/${id}`]}
                        customData={{
                            optionSets: () => ({
                                optionSets: [],
                                pager: {
                                    page: 1,
                                    total: 0,
                                    pageSize: 20,
                                    pageCount: 0,
                                },
                            }),
                            trackedEntityTypes: () => ({
                                trackedEntityTypes: [],
                                pager: {
                                    page: 1,
                                    total: 0,
                                    pageSize: 20,
                                    pageCount: 0,
                                },
                            }),
                            legendSets: () => ({
                                legendSets: [],
                                pager: {
                                    page: 1,
                                    total: 0,
                                    pageSize: 20,
                                    pageCount: 0,
                                },
                            }),
                            'system/info': () => ({ encryption: true }),
                            attributes: () => ({ attributes: [] }),
                            trackedEntityAttributes: (
                                type: any,
                                params: any
                            ) => {
                                if (type === 'json-patch') {
                                    updateMock(params)
                                    return { statusCode: 204 }
                                }
                                if (type === 'read') {
                                    if (params?.id) {
                                        return trackedEntityAttribute
                                    }
                                    return {
                                        pager: { total: 0 },
                                        trackedEntityAttributes: [],
                                    }
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <Edit />
                    </TestComponentWithRouter>
                )
                return { screen, trackedEntityAttribute }
            }
        )

        it('renders with prefilled values', async () => {
            const { screen, trackedEntityAttribute } = await renderForm()
            uiAssertions.expectNameFieldExist(
                trackedEntityAttribute.name,
                screen
            )
            uiAssertions.expectInputFieldToExist(
                'formName',
                trackedEntityAttribute.formName,
                screen
            )
            uiAssertions.expectInputFieldToExist(
                'shortName',
                trackedEntityAttribute.shortName,
                screen
            )
            uiAssertions.expectCodeFieldExist(
                trackedEntityAttribute.code,
                screen
            )
            uiAssertions.expectTextAreaFieldToExist(
                'description',
                trackedEntityAttribute.description,
                screen
            )
        })

        it('submits updated name', async () => {
            const { screen, trackedEntityAttribute } = await renderForm({
                trackedEntityAttributeOverwrites: {
                    name: faker.word.words(),
                    valueType: 'TEXT',
                    aggregationType: 'NONE',
                },
            })
            const newName = faker.word.words()
            await uiActions.enterName(newName, screen)
            await uiActions.submitForm(screen)
            expect(updateMock).toHaveBeenCalledWith({
                data: [{ op: 'replace', path: '/name', value: newName }],
                id: trackedEntityAttribute.id,
                params: undefined,
                resource: 'trackedEntityAttributes',
            })
        })
    })
})

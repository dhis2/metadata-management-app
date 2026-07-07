import { faker } from '@faker-js/faker'
import { act, render, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import schemaMock from '../../__mocks__/schema/optionGroups.json'
import optionSetSchemaMock from '../../__mocks__/schema/optionSet.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import { ModelSchemas, SECTIONS_MAP } from '../../lib'
import { useSchemaStore } from '../../lib/schemas/schemaStore'
import {
    randomDhis2Id,
    randomLongString,
    testOptionGroup,
    testOptionSet,
    testOption,
} from '../../testUtils/builders'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { uiAssertions } from '../../testUtils/uiAssertions'
import { Component as Edit } from './Edit'
import { Component as New } from './New'

const section = SECTIONS_MAP.optionGroup
const mockSchema = schemaMock

jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))

describe('OptionGroups form tests', () => {
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
                const optionSets = [testOptionSet()]
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            optionSets: () => ({ optionSets }),
                            optionGroups: (type: any, params: any) => {
                                if (type === 'create') {
                                    createMock(params)
                                    return { statusCode: 204 }
                                }
                                return { pager: { total: 0 }, optionGroups: [] }
                            },
                            ...customTestData,
                        }}
                        routeOptions={routeOptions}
                    >
                        <New />
                    </TestComponentWithRouter>
                )
                return { screen, optionSets }
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
            const { screen } = await renderForm({
                customTestData: {
                    attributes: () => ({ attributes: [] }),
                },
            })

            useSchemaStore.getState().setSchemas({
                ...useSchemaStore.getState().schemas,
                optionSet: optionSetSchemaMock,
            } as unknown as ModelSchemas)

            // Flush the useEffect dynamic import in ModelSingleSelectRefreshableFormField
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
                const optionSets = [testOptionSet()]
                const options = [testOption()]
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            optionSets: () => ({ optionSets }),
                            options: () => ({ options }),
                            optionGroups: (type: any, params: any) => {
                                if (type === 'create') {
                                    createMock(params)
                                    return { statusCode: 204 }
                                }
                                return { pager: { total: 0 }, optionGroups: [] }
                            },
                            ...customTestData,
                        }}
                        routeOptions={routeOptions}
                    >
                        <New />
                    </TestComponentWithRouter>
                )
                return { screen, optionSets, options }
            }
        )

        it('contains all needed fields', async () => {
            const { screen, optionSets } = await renderForm()
            uiAssertions.expectNameFieldExist('', screen)
            uiAssertions.expectInputFieldToExist('shortName', '', screen)
            uiAssertions.expectCodeFieldExist('', screen)
            uiAssertions.expectTextAreaFieldToExist('description', null, screen)
            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-optionSet'),
                { options: optionSets },
                screen
            )
        })

        it('submits basic info', async () => {
            const aName = faker.word.words()
            const aShortName = faker.word.words()
            const aCode = faker.science.chemicalElement().symbol
            const { screen, optionSets } = await renderForm()
            await uiActions.enterName(aName, screen)
            await uiActions.enterInputFieldValue(
                'shortName',
                aShortName,
                screen
            )
            await uiActions.enterCode(aCode, screen)
            await uiActions.pickOptionFromSelect(
                screen.getByTestId('formfields-optionSet'),
                0,
                screen
            )
            await uiActions.submitForm(screen)
            expect(createMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        name: aName,
                        shortName: aShortName,
                        code: aCode,
                        optionSet: expect.objectContaining({
                            id: optionSets[0].id,
                        }),
                    }),
                })
            )
        })

        it('shows options transfer field when an option set is selected', async () => {
            const { screen } = await renderForm({
                customData: ({ optionSets }: any) => ({
                    optionSets,
                    options: [testOption(), testOption()],
                }),
            })
            await uiActions.pickOptionFromSelect(
                screen.getByTestId('formfields-optionSet'),
                0,
                screen
            )
            const transferField = screen.getByTestId('options-field')
            expect(transferField).toBeInTheDocument()
        })
    })

    describe('Edit', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (
                routeOptions,
                { optionGroupOverwrites = {}, id = randomDhis2Id() } = {}
            ) => {
                const optionSet = testOptionSet()
                const optionGroup = testOptionGroup({
                    id,
                    optionSet,
                    ...optionGroupOverwrites,
                })
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}/:id`}
                        initialEntries={[`/${section.namePlural}/${id}`]}
                        customData={{
                            optionSets: () => ({ optionSets: [optionSet] }),
                            optionGroups: (type: any, params: any) => {
                                if (type === 'json-patch') {
                                    updateMock(params)
                                    return { statusCode: 204 }
                                }
                                if (type === 'read') {
                                    if (params?.id) {
                                        return optionGroup
                                    }
                                    return {
                                        pager: { total: 0 },
                                        optionGroups: [],
                                    }
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <Edit />
                    </TestComponentWithRouter>
                )
                return { screen, optionGroup }
            }
        )

        it('renders with prefilled values', async () => {
            const { screen, optionGroup } = await renderForm()
            uiAssertions.expectNameFieldExist(optionGroup.name, screen)
            uiAssertions.expectInputFieldToExist(
                'shortName',
                optionGroup.shortName,
                screen
            )
            uiAssertions.expectCodeFieldExist(optionGroup.code, screen)
        })

        it('submits updated name', async () => {
            const { screen, optionGroup } = await renderForm()
            const newName = faker.word.words()
            await uiActions.enterName(newName, screen)
            await uiActions.submitForm(screen)
            expect(updateMock).toHaveBeenCalledWith({
                data: [{ op: 'replace', path: '/name', value: newName }],
                id: optionGroup.id,
                params: undefined,
                resource: 'optionGroups',
            })
        })
    })
})

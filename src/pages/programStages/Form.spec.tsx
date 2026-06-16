import { render } from '@testing-library/react'
import React from 'react'
import schemaMock from '../../__mocks__/schema/programStages.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import { SECTIONS_MAP } from '../../lib'
import { testProgram } from '../../testUtils/builders'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { uiAssertions } from '../../testUtils/uiAssertions'
import { Component as Edit } from './Edit'
import { initialStageValue } from './form'
import { Component as New } from './New'

const section = SECTIONS_MAP.programStage
const mockSchema = schemaMock

const PROGRAM_FIELD = 'formfields-stage-program'

const emptyPager = { page: 1, total: 0, pageSize: 10, pageCount: 1 }

jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))

describe('Program Stage form tests', () => {
    const createMock = jest.fn()
    const updateMock = jest.fn()

    beforeEach(() => {
        jest.resetAllMocks()
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

    describe('New', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (routeOptions, { customTestData = {} }: any = {}) => {
                const programs = [
                    testProgram({ id: 'program1', name: 'Test Program 1' }),
                    testProgram({ id: 'program2', name: 'Test Program 2' }),
                ]
                const dataElements = [
                    { id: 'de1', displayName: 'Data Element 1' },
                    { id: 'de2', displayName: 'Data Element 2' },
                ]

                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            programs: () => ({
                                programs,
                                pager: {
                                    ...emptyPager,
                                    total: programs.length,
                                },
                            }),
                            dataElements: () => ({
                                dataElements,
                                pager: {
                                    ...emptyPager,
                                    total: dataElements.length,
                                },
                            }),
                            attributes: () => ({
                                attributes: [],
                                pager: emptyPager,
                            }),
                            programStages: (type: any, params: any) => {
                                if (type === 'create') {
                                    createMock(params)
                                    return {
                                        statusCode: 201,
                                        response: { uid: 'newStage1' },
                                    }
                                }
                                if (type === 'read') {
                                    return {
                                        pager: { total: 0 },
                                        programStages: [],
                                    }
                                }
                            },
                            ...customTestData,
                        }}
                        routeOptions={routeOptions}
                    >
                        <New />
                    </TestComponentWithRouter>
                )
                return { screen, programs, dataElements }
            }
        )

        it('renders the program selector and name field in basic information', async () => {
            const { screen } = await renderForm()
            expect(screen.getByTestId(PROGRAM_FIELD)).toBeVisible()
            uiAssertions.expectNameFieldExist('', screen)
        })

        it('does not submit when the required program and name are missing', async () => {
            const { screen } = await renderForm()
            await uiActions.submitForm(screen)
            expect(createMock).not.toHaveBeenCalled()
            uiAssertions.expectFieldToHaveError(
                'formfields-name',
                'Required',
                screen
            )
            uiAssertions.expectFieldToHaveError(
                PROGRAM_FIELD,
                'A program is required',
                screen
            )
        })

        it('submits with the selected program and name', async () => {
            const aName = 'My Stage'
            const { screen, programs } = await renderForm()

            await uiActions.enterName(aName, screen)
            await uiActions.pickOptionFromSelect(
                screen.getByTestId(PROGRAM_FIELD),
                0,
                screen
            )
            await uiActions.submitForm(screen)

            expect(createMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        name: aName,
                        program: expect.objectContaining({
                            id: programs[0].id,
                        }),
                    }),
                })
            )
        })

        it('has a cancel link back to the list view', async () => {
            const { screen } = await renderForm()
            const cancelButton = screen.getByTestId('form-cancel-link')
            expect(cancelButton).toBeVisible()
            expect(cancelButton).toHaveAttribute(
                'href',
                `/${section.namePlural}`
            )
        })
    })

    describe('Edit', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (routeOptions, { customTestData = {} }: any = {}) => {
                const programs = [
                    testProgram({ id: 'program1', name: 'Test Program 1' }),
                ]
                const existingStage = {
                    ...initialStageValue,
                    id: 'stage1',
                    name: 'Existing Stage',
                    displayName: 'Existing Stage',
                    program: { id: 'program1', displayName: 'Test Program 1' },
                }

                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}/:id`}
                        initialEntries={[`/${section.namePlural}/stage1`]}
                        customData={{
                            programs: () => ({ programs }),
                            dataElements: () => ({
                                dataElements: [],
                                pager: emptyPager,
                            }),
                            attributes: () => ({
                                attributes: [],
                                pager: emptyPager,
                            }),
                            programStages: (type: any, params: any) => {
                                if (type === 'read') {
                                    return existingStage
                                }
                                if (
                                    type === 'update' ||
                                    type === 'json-patch'
                                ) {
                                    updateMock(params)
                                    return { statusCode: 204 }
                                }
                            },
                            ...customTestData,
                        }}
                        routeOptions={routeOptions}
                    >
                        <Edit />
                    </TestComponentWithRouter>
                )
                return { screen, programs, existingStage }
            }
        )

        it('prefills the name and program from the loaded stage', async () => {
            const { screen } = await renderForm()

            await screen.findByTestId('formfields-name')
            const nameInput = screen
                .getByTestId('formfields-name')
                .querySelector('input') as HTMLInputElement
            expect(nameInput).toHaveValue('Existing Stage')

            const programField = screen.getByTestId(PROGRAM_FIELD)
            expect(programField).toHaveTextContent('Test Program 1')
        })
    })
})

import { faker } from '@faker-js/faker'
import { render, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import schemaMock from '../../__mocks__/schema/organisationUnitGroups.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import { SECTIONS_MAP } from '../../lib'
import {
    randomLongString,
    testCustomAttribute,
    testOrganisationUnitGroup,
} from '../../testUtils/builders'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { uiAssertions } from '../../testUtils/uiAssertions'
import { Component as Edit } from './Edit'
import { Component as New } from './New'
import resetAllMocks = jest.resetAllMocks

const section = SECTIONS_MAP.organisationUnitGroup
const mockSchema = schemaMock

// The first entries of the (otherwise static) color/symbol pickers, used to
// pick a deterministic value in tests.
const FIRST_AVAILABLE_COLOR = '#ffcdd2'
const FIRST_SYMBOL_FILENAME = '01.png'

const expectColorAndSymbolFieldToExist = (
    screen: ReturnType<typeof render>
) => {
    const field = screen.getByTestId('formfields-colorandsymbol')
    expect(field).toBeVisible()
}

jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))

describe('Organisation Unit groups form tests', () => {
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

    describe('Common', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (
                routeOptions,
                { matchingExistingElementFilter = undefined } = {}
            ) => {
                const attributes = [testCustomAttribute({ mandatory: false })]
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            attributes: () => ({ attributes }),
                            organisationUnitGroups: (
                                type: any,
                                params: any
                            ) => {
                                if (type === 'create') {
                                    createMock(params)
                                    return { statusCode: 204 }
                                }
                                if (type === 'read') {
                                    if (
                                        params?.params?.filter?.includes(
                                            matchingExistingElementFilter
                                        )
                                    ) {
                                        return {
                                            pager: { total: 1 },
                                            organisationUnitGroups: [
                                                testOrganisationUnitGroup(),
                                            ],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        organisationUnitGroups: [],
                                    }
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <New />
                    </TestComponentWithRouter>
                )
                return { screen, attributes }
            }
        )
        it('should not submit when a required values is missing ', async () => {
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
        it('should show an error if name field is too long', async () => {
            const { screen } = await renderForm()
            const longText = randomLongString(231)
            await uiActions.enterName(longText, screen)
            await uiAssertions.expectNameToErrorWhenExceedsLength(screen)
            await uiActions.submitForm(screen)
            expect(createMock).not.toHaveBeenCalled()
        })
        it('should show an error if short name field is too long', async () => {
            const { screen } = await renderForm()
            const longText = randomLongString(54)
            await uiActions.enterInputFieldValue('shortName', longText, screen)
            await uiAssertions.expectInputToErrorWhenExceedsLength(
                'shortName',
                50,
                screen
            )
            await uiActions.submitForm(screen)
            expect(createMock).not.toHaveBeenCalled()
        })
        it('should show an error if code field is too long', async () => {
            const { screen } = await renderForm()
            const longText = randomLongString(57)
            await uiActions.enterInputFieldValue('code', longText, screen)
            await uiAssertions.expectInputToErrorWhenExceedsLength(
                'code',
                50,
                screen
            )
            await uiActions.submitForm(screen)
            expect(createMock).not.toHaveBeenCalled()
        })
        it('should show an error if description field is too long', async () => {
            const { screen } = await renderForm()
            const longText = randomLongString(2010)
            await uiActions.enterInputFieldValue(
                'description',
                longText,
                screen
            )
            await uiAssertions.expectInputToErrorWhenExceedsLength(
                'description',
                2000,
                screen
            )
            await uiActions.submitForm(screen)
            expect(createMock).not.toHaveBeenCalled()
        })
        it('should show an error if name field is a duplicate', async () => {
            const existingName = faker.company.name()
            const { screen } = await renderForm({
                matchingExistingElementFilter: `name:ieq:${existingName}`,
            })
            await uiAssertions.expectNameToErrorWhenDuplicate(
                existingName,
                screen
            )
            await uiActions.submitForm(screen)
            expect(createMock).not.toHaveBeenCalled()
        })
        it('should show an error if short name field is a duplicate', async () => {
            const existingShortName = faker.company.name()
            const { screen } = await renderForm({
                matchingExistingElementFilter: `shortName:ieq:${existingShortName}`,
            })
            await uiAssertions.expectInputToErrorWhenDuplicate(
                'shortName',
                existingShortName,
                screen
            )
            await uiActions.submitForm(screen)
            expect(createMock).not.toHaveBeenCalled()
        })
        it('should show an error if code field is a duplicate', async () => {
            const existingCode = faker.science.chemicalElement().symbol
            const { screen } = await renderForm({
                matchingExistingElementFilter: `code:ieq:${existingCode}`,
            })
            await uiAssertions.expectCodeToErrorWhenDuplicate(
                existingCode,
                screen
            )
            await uiActions.submitForm(screen)
            expect(createMock).not.toHaveBeenCalled()
        })
    })
    describe('New', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (routeOptions) => {
                const attributes = [testCustomAttribute({ mandatory: false })]
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            attributes: () => ({ attributes }),
                            organisationUnitGroups: (
                                type: any,
                                params: any
                            ) => {
                                if (type === 'create') {
                                    createMock(params)
                                    return { statusCode: 204 }
                                }
                                if (type === 'read') {
                                    return {
                                        pager: { total: 0 },
                                        organisationUnitGroups: [],
                                    }
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <New />
                    </TestComponentWithRouter>
                )
                return { screen, attributes }
            }
        )
        it('contain all needed field', async () => {
            const { screen, attributes } = await renderForm()

            uiAssertions.expectNameFieldExist('', screen)
            uiAssertions.expectInputFieldToExist('shortName', '', screen)
            uiAssertions.expectCodeFieldExist('', screen)
            uiAssertions.expectTextAreaFieldToExist('description', '', screen)
            expectColorAndSymbolFieldToExist(screen)
            expect(screen.getByTestId('colorpicker-trigger')).toBeVisible()
            expect(screen.getByTestId('symbolpicker-trigger')).toBeVisible()
            expect(screen.getByText('Organisation units')).toBeVisible()
            attributes.forEach((attribute: { id: string }) => {
                expect(
                    screen.getByTestId(`attribute-${attribute.id}`)
                ).toBeVisible()
            })
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
        it('should submit the data', async () => {
            const { screen, attributes } = await renderForm()
            const aName = faker.animal.bird()
            const aShortName = faker.person.firstName()
            const aCode = faker.science.chemicalElement().symbol
            const aDescription = faker.company.buzzPhrase()
            const anAttribute = faker.internet.userName()

            await uiActions.enterName(aName, screen)
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

            await userEvent.click(screen.getByTestId('colorpicker-trigger'))
            await userEvent.click(screen.getByTitle(FIRST_AVAILABLE_COLOR))

            await userEvent.click(screen.getByTestId('symbolpicker-trigger'))
            await userEvent.click(screen.getByTitle(FIRST_SYMBOL_FILENAME))
            await userEvent.click(
                screen.getByRole('button', { name: 'Choose symbol' })
            )

            const attributeInput = within(
                screen.getByTestId(`attribute-${attributes[0].id}`)
            ).getByRole('textbox') as HTMLInputElement
            await userEvent.type(attributeInput, anAttribute)
            await uiActions.submitForm(screen)

            expect(createMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        name: aName,
                        shortName: aShortName,
                        code: aCode,
                        description: aDescription,
                        symbol: FIRST_SYMBOL_FILENAME,
                        attributeValues: [
                            {
                                attribute: expect.objectContaining({
                                    id: attributes[0].id,
                                }),
                                value: anAttribute,
                            },
                        ],
                    }),
                })
            )
            const payload = createMock.mock.calls[0][0].data
            expect(payload.color).toMatch(/^#[0-9a-f]{6}$/i)
        })
    })
    describe('Edit', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (routeOptions) => {
                const attributes = [testCustomAttribute({ mandatory: false })]
                const organisationUnitGroup = testOrganisationUnitGroup({
                    name: faker.company.name(),
                    shortName: faker.person.firstName(),
                    description: faker.company.buzzPhrase(),
                    color: FIRST_AVAILABLE_COLOR,
                    symbol: FIRST_SYMBOL_FILENAME,
                    organisationUnits: [],
                    attributeValues: [
                        { attribute: attributes[0], value: 'attribute' },
                    ],
                })
                const id = organisationUnitGroup.id

                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}/:id`}
                        initialEntries={[`/${section.namePlural}/${id}`]}
                        customData={{
                            attributes: () => ({ attributes }),
                            organisationUnitGroups: (
                                type: any,
                                params: any
                            ) => {
                                if (type === 'json-patch') {
                                    updateMock(params)
                                    return { statusCode: 204 }
                                }
                                if (type === 'read') {
                                    if (params?.id) {
                                        return organisationUnitGroup
                                    }
                                    return {
                                        pager: { total: 0 },
                                        organisationUnitGroups: [],
                                    }
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <Edit />
                    </TestComponentWithRouter>
                )
                return { screen, attributes, organisationUnitGroup }
            }
        )
        it('contain all needed field prefilled', async () => {
            const { screen, attributes, organisationUnitGroup } =
                await renderForm()

            uiAssertions.expectNameFieldExist(
                organisationUnitGroup.name,
                screen
            )
            uiAssertions.expectInputFieldToExist(
                'shortName',
                organisationUnitGroup.shortName,
                screen
            )
            uiAssertions.expectCodeFieldExist(
                organisationUnitGroup.code,
                screen
            )
            uiAssertions.expectTextAreaFieldToExist(
                'description',
                organisationUnitGroup.description,
                screen
            )
            expectColorAndSymbolFieldToExist(screen)
            expect(screen.getByTestId('colorpicker-trigger')).toHaveAttribute(
                'aria-label',
                `Color: ${organisationUnitGroup.color}`
            )
            expect(screen.getByTestId('symbolpicker-trigger')).toHaveAttribute(
                'aria-label',
                `Symbol: ${organisationUnitGroup.symbol}`
            )
            attributes.forEach((attribute: { id: string }) => {
                const attributeInput = screen.getByTestId(
                    `attribute-${attribute.id}`
                )
                expect(attributeInput).toBeVisible()
                expect(
                    within(
                        within(attributeInput).getByTestId('dhis2-uicore-input')
                    ).getByRole('textbox')
                ).toHaveValue(organisationUnitGroup.attributeValues[0].value)
            })
        })
        it('should submit the data and return to the list view on success when a field is changed', async () => {
            const { screen, organisationUnitGroup } = await renderForm()
            const newDescription = faker.company.buzzPhrase()

            await uiActions.enterInputFieldValue(
                'description',
                newDescription,
                screen
            )
            await uiActions.submitForm(screen)

            expect(updateMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: organisationUnitGroup.id,
                    data: [
                        {
                            op: 'replace',
                            path: '/description',
                            value: newDescription,
                        },
                    ],
                })
            )
        })
        it('should do nothing and return to the list view on success when no field is changed', async () => {
            const { screen } = await renderForm()
            await uiActions.submitForm(screen)
            expect(updateMock).not.toHaveBeenCalled()
        })
    })
})

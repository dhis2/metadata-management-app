import { faker } from '@faker-js/faker'
import { render, waitFor, within } from '@testing-library/react'
import React from 'react'
import schemaMock from '../../__mocks__/schema/dataElementGroupSets.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import { SECTIONS_MAP } from '../../lib'
import {
    randomLongString,
    testCustomAttribute,
    testDataElement,
    testDataElementGroup,
    testDataElementGroupSet,
} from '../../testUtils/builders'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { uiAssertions } from '../../testUtils/uiAssertions'
import { Component as Edit } from './Edit'
import { Component as New } from './New'
import resetAllMocks = jest.resetAllMocks

const section = SECTIONS_MAP.dataElementGroupSet
const mockSchema = schemaMock
jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))
describe('Data element group sets form tests', () => {
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
                            dataElementGroupSets: (type: any, params: any) => {
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
                                            dataElementGroupSets: [
                                                testDataElement(),
                                            ],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        dataElementGroupSets: [],
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
                const dataElementGroups = [
                    testDataElementGroup(),
                    testDataElementGroup(),
                ]
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            attributes: () => ({ attributes }),
                            dataElementGroups: () => ({
                                dataElementGroups,
                                pager: {},
                            }),
                            dataElementGroupSets: (type: any, params: any) => {
                                if (type === 'create') {
                                    createMock(params)
                                    return { statusCode: 204 }
                                }
                                if (type === 'read') {
                                    return {
                                        pager: { total: 0 },
                                        dataElementGroupSets: [],
                                    }
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <New />
                    </TestComponentWithRouter>
                )
                return { screen, attributes, dataElementGroups }
            }
        )
        it('contain all needed field', async () => {
            const { screen, attributes, dataElementGroups } = await renderForm()

            uiAssertions.expectNameFieldExist('', screen)
            uiAssertions.expectInputFieldToExist('shortName', '', screen)
            uiAssertions.expectCodeFieldExist('', screen)
            uiAssertions.expectTextAreaFieldToExist('description', '', screen)
            uiAssertions.expectCheckboxFieldToExist('compulsory', false, screen)
            uiAssertions.expectCheckboxFieldToExist(
                'dataDimension',
                false,
                screen
            )
            await uiAssertions.expectTransferFieldToExistWithOptions(
                'dataElementGroups-transfer',
                { lhs: dataElementGroups, rhs: [] },
                screen
            )
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
            const { screen, attributes, dataElementGroups } = await renderForm()
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
            await uiActions.clickOnCheckboxField('compulsory', screen)
            await uiActions.clickOnCheckboxField('dataDimension', screen)
            await uiActions.pickOptionInTransfer(
                'dataElementGroups-transfer',
                dataElementGroups[1].displayName,
                screen
            )

            const attributeInput = within(
                screen.getByTestId(`attribute-${attributes[0].id}`)
            ).getByRole('textbox') as HTMLInputElement
            await uiActions.pasteIntoInput(attributeInput, anAttribute)
            await uiActions.submitForm(screen)

            await waitFor(() =>
                expect(createMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        data: expect.objectContaining({
                            name: aName,
                            shortName: aShortName,
                            code: aCode,
                            description: aDescription,
                            dataElementGroups: [
                                expect.objectContaining({
                                    id: dataElementGroups[1].id,
                                }),
                            ],
                            compulsory: true,
                            dataDimension: true,
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
            )
        })
    })
    describe('Edit', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (routeOptions) => {
                const attributes = [testCustomAttribute({ mandatory: false })]
                const dataElementGroups = [
                    testDataElementGroup(),
                    testDataElementGroup(),
                    testDataElementGroup(),
                ]
                const dataElementGroupSet = testDataElementGroupSet({
                    dataElementGroups: [dataElementGroups[1]],
                    attributeValues: [
                        { attribute: attributes[0], value: 'attribute' },
                    ],
                })
                const id = dataElementGroupSet.id

                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}/:id`}
                        initialEntries={[`/${section.namePlural}/${id}`]}
                        customData={{
                            attributes: () => ({ attributes }),
                            dataElementGroups: () => ({
                                dataElementGroups,
                                pager: {},
                            }),
                            dataElementGroupSets: (type: any, params: any) => {
                                if (type === 'json-patch') {
                                    updateMock(params)
                                    return { statusCode: 204 }
                                }
                                if (type === 'read') {
                                    if (params?.id) {
                                        return dataElementGroupSet
                                    }
                                    return {
                                        pager: { total: 0 },
                                        dataElementGroupSets: [],
                                    }
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <Edit />
                    </TestComponentWithRouter>
                )
                return {
                    screen,
                    attributes,
                    dataElementGroups,
                    dataElementGroupSet,
                }
            }
        )

        it('contain all needed field prefilled', async () => {
            const {
                screen,
                attributes,
                dataElementGroups,
                dataElementGroupSet,
            } = await renderForm()

            uiAssertions.expectNameFieldExist(dataElementGroupSet.name, screen)
            uiAssertions.expectInputFieldToExist(
                'shortName',
                dataElementGroupSet.shortName,
                screen
            )
            uiAssertions.expectCodeFieldExist(dataElementGroupSet.code, screen)
            uiAssertions.expectTextAreaFieldToExist(
                'description',
                dataElementGroupSet.description,
                screen
            )
            uiAssertions.expectCheckboxFieldToExist(
                'compulsory',
                dataElementGroupSet.compulsory,
                screen
            )
            uiAssertions.expectCheckboxFieldToExist(
                'dataDimension',
                dataElementGroupSet.dataDimension,
                screen
            )
            await uiAssertions.expectTransferFieldToExistWithOptions(
                'dataElementGroups-transfer',
                {
                    lhs: [dataElementGroups[0], dataElementGroups[2]],
                    rhs: [dataElementGroups[1]],
                },
                screen
            )
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
        it('should do nothing and return to the list view on success when no field is changed', async () => {
            const { screen } = await renderForm()
            await uiActions.submitAndCloseForm(screen)
            await waitFor(() =>
                expect(
                    screen.queryByTestId('formfields-name')
                ).not.toBeInTheDocument()
            )
            expect(updateMock).not.toHaveBeenCalled()
        })
    })
})

import { faker } from '@faker-js/faker'
import { render, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import schemaMock from '../../__mocks__/schema/trackedEntityTypes.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import { SECTIONS_MAP } from '../../lib'
import {
    randomDhis2Id,
    randomLongString,
    testCustomAttribute,
    testTrackedEntityType,
} from '../../testUtils/builders'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { uiAssertions } from '../../testUtils/uiAssertions'
import { Component as Edit } from './Edit'
import { Component as New } from './New'
import resetAllMocks = jest.resetAllMocks

const section = SECTIONS_MAP.trackedEntityType
const mockSchema = schemaMock

jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))

const testTrackedEntityAttribute = (overwrites: Record<any, any> = {}) => ({
    id: randomDhis2Id(),
    displayName: faker.person.firstName(),
    valueType: 'TEXT',
    ...overwrites,
})

describe('Tracked entity types form tests', () => {
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
                const trackedEntityAttributes = [
                    testTrackedEntityAttribute(),
                    testTrackedEntityAttribute(),
                ]
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            attributes: () => ({ attributes }),
                            trackedEntityAttributes: () => ({
                                pager: {},
                                trackedEntityAttributes,
                            }),
                            trackedEntityTypes: (type: any, params: any) => {
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
                                            trackedEntityTypes: [
                                                testTrackedEntityType(),
                                            ],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        trackedEntityTypes: [],
                                    }
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <New />
                    </TestComponentWithRouter>
                )
                return { screen, attributes, trackedEntityAttributes }
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
    })

    describe('New', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (routeOptions) => {
                const attributes = [testCustomAttribute({ mandatory: false })]
                const trackedEntityAttributes = [
                    testTrackedEntityAttribute(),
                    testTrackedEntityAttribute(),
                    testTrackedEntityAttribute(),
                ]
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            attributes: () => ({ attributes }),
                            trackedEntityAttributes: () => ({
                                pager: {},
                                trackedEntityAttributes,
                            }),
                            trackedEntityTypes: (type: any, params: any) => {
                                if (type === 'create') {
                                    createMock(params)
                                    return { statusCode: 204 }
                                }
                                if (type === 'read') {
                                    return {
                                        pager: { total: 0 },
                                        trackedEntityTypes: [],
                                    }
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <New />
                    </TestComponentWithRouter>
                )
                return { screen, attributes, trackedEntityAttributes }
            }
        )

        it('contains all needed field', async () => {
            const { screen, attributes } = await renderForm()

            uiAssertions.expectNameFieldExist('', screen)
            uiAssertions.expectInputFieldToExist('shortName', '', screen)
            uiAssertions.expectColorAndIconFieldToExist(screen)
            uiAssertions.expectTextAreaFieldToExist('description', null, screen)

            uiAssertions.expectRadioFieldToExist(
                'featureType',
                [
                    { label: 'Point', checked: false },
                    { label: 'Polygon', checked: false },
                    { label: 'Do not collect location data', checked: true },
                ],
                screen
            )

            uiAssertions.expectCheckboxFieldToExist(
                'allowAuditLog',
                false,
                screen
            )

            const minAttributesInput = screen.getByTestId(
                'formfields-minattributesrequiredtosearch'
            )
            expect(minAttributesInput).toBeVisible()
            expect(
                within(minAttributesInput).getByRole('spinbutton')
            ).toHaveValue(1)

            const maxTeiCountInput = screen.getByTestId(
                'formfields-maxteicount'
            )
            expect(maxTeiCountInput).toBeVisible()
            expect(
                within(maxTeiCountInput).getByRole('spinbutton')
            ).toHaveValue(0)

            expect(
                screen.getByTestId('formfields-attributes-transfer')
            ).toBeVisible()

            for (const attribute of attributes) {
                expect(
                    screen.getByTestId(`attribute-${attribute.id}`)
                ).toBeVisible()
            }
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

        it('should submit the basic information', async () => {
            const { screen } = await renderForm()
            const aName = faker.animal.bird()
            const aShortName = faker.person.firstName()
            const aDescription = faker.company.buzzPhrase()

            await uiActions.enterName(aName, screen)
            await uiActions.enterInputFieldValue(
                'shortName',
                aShortName,
                screen
            )
            await uiActions.enterInputFieldValue(
                'description',
                aDescription,
                screen
            )
            await uiActions.clickOnCheckboxField('allowAuditLog', screen)

            await uiActions.submitForm(screen)

            expect(createMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        name: aName,
                        shortName: aShortName,
                        description: aDescription,
                        allowAuditLog: true,
                        featureType: 'NONE',
                        minAttributesRequiredToSearch: 1,
                        maxTeiCountToReturn: 0,
                        style: {},
                        trackedEntityTypeAttributes: [],
                        attributeValues: [],
                    }),
                })
            )
        })

        it('should submit with custom numeric values', async () => {
            const { screen } = await renderForm()
            const aName = faker.animal.bird()
            const aShortName = faker.person.firstName()
            const minAttributes = 3
            const maxTeiCount = 100

            await uiActions.enterName(aName, screen)
            await uiActions.enterInputFieldValue(
                'shortName',
                aShortName,
                screen
            )

            const minAttributesInput = within(
                screen.getByTestId('formfields-minattributesrequiredtosearch')
            ).getByRole('spinbutton')
            await userEvent.clear(minAttributesInput)
            await userEvent.type(minAttributesInput, minAttributes.toString())

            const maxTeiCountInput = within(
                screen.getByTestId('formfields-maxteicount')
            ).getByRole('spinbutton')
            await userEvent.clear(maxTeiCountInput)
            await userEvent.type(maxTeiCountInput, maxTeiCount.toString())

            await uiActions.submitForm(screen)

            expect(createMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        name: aName,
                        shortName: aShortName,
                        minAttributesRequiredToSearch: minAttributes,
                        maxTeiCountToReturn: maxTeiCount,
                    }),
                })
            )
        })

        it('should submit with tracked entity attributes', async () => {
            const { screen, trackedEntityAttributes } = await renderForm()
            const aName = faker.animal.bird()
            const aShortName = faker.person.firstName()

            await uiActions.enterName(aName, screen)
            await uiActions.enterInputFieldValue(
                'shortName',
                aShortName,
                screen
            )

            const transferField = screen.getByTestId(
                'formfields-attributes-transfer'
            )
            const leftside = within(transferField).getByTestId(
                'dhis2-uicore-transfer-leftside'
            )
            const optionToPick = within(leftside).getByText(
                trackedEntityAttributes[0].displayName,
                {
                    selector: '[data-test="dhis2-uicore-transferoption"]',
                }
            )
            await userEvent.click(optionToPick)
            const addButton = within(transferField).getByTestId(
                'dhis2-uicore-transfer-actions-addindividual'
            )
            await userEvent.click(addButton)

            await uiActions.submitForm(screen)

            expect(createMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        name: aName,
                        shortName: aShortName,
                        trackedEntityTypeAttributes: [
                            expect.objectContaining({
                                trackedEntityAttribute: expect.objectContaining(
                                    {
                                        id: trackedEntityAttributes[0].id,
                                    }
                                ),
                                mandatory: false,
                                searchable: false,
                                displayInList: false,
                            }),
                        ],
                    }),
                })
            )
        })

        it('should submit the attributes', async () => {
            const { screen, attributes } = await renderForm()
            const aName = faker.animal.bird()
            const aShortName = faker.person.firstName()
            const anAttribute = faker.internet.userName()

            await uiActions.enterName(aName, screen)
            await uiActions.enterInputFieldValue(
                'shortName',
                aShortName,
                screen
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
        })
    })

    describe('Edit', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (
                routeOptions,
                { trackedEntityTypeOverwrites = {}, id = randomDhis2Id() } = {}
            ) => {
                const attributes = [testCustomAttribute()]
                const trackedEntityAttributes = [
                    testTrackedEntityAttribute(),
                    testTrackedEntityAttribute(),
                    testTrackedEntityAttribute(),
                ]
                const trackedEntityType = testTrackedEntityType({
                    id,
                    allowAuditLog: true,
                    minAttributesRequiredToSearch: 2,
                    maxTeiCountToReturn: 50,
                    trackedEntityTypeAttributes: [
                        {
                            trackedEntityAttribute: trackedEntityAttributes[0],
                            mandatory: true,
                            searchable: true,
                            displayInList: true,
                        },
                    ],
                    attributeValues: [
                        { attribute: attributes[0], value: 'attribute value' },
                    ],
                    ...trackedEntityTypeOverwrites,
                })

                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}/:id`}
                        initialEntries={[`/${section.namePlural}/${id}`]}
                        customData={{
                            attributes: () => ({ attributes }),
                            trackedEntityAttributes: () => ({
                                pager: {},
                                trackedEntityAttributes,
                            }),
                            trackedEntityTypes: (type: any, params: any) => {
                                if (type === 'json-patch') {
                                    updateMock(params)
                                    return { statusCode: 204 }
                                }
                                if (type === 'read') {
                                    if (params?.id) {
                                        return trackedEntityType
                                    }
                                    return {
                                        pager: { total: 0 },
                                        trackedEntityTypes: [],
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
                    trackedEntityAttributes,
                    trackedEntityType,
                }
            }
        )

        it('contains the basic information field prefilled', async () => {
            const { screen, trackedEntityType } = await renderForm()

            uiAssertions.expectNameFieldExist(trackedEntityType.name, screen)
            uiAssertions.expectInputFieldToExist(
                'shortName',
                trackedEntityType.shortName,
                screen
            )
            uiAssertions.expectColorAndIconFieldToExist(screen)
            uiAssertions.expectTextAreaFieldToExist(
                'description',
                trackedEntityType.description,
                screen
            )
            uiAssertions.expectRadioFieldToExist(
                'featureType',
                [
                    {
                        label: 'Point',
                        checked: trackedEntityType.featureType === 'POINT',
                    },
                    {
                        label: 'Polygon',
                        checked: trackedEntityType.featureType === 'POLYGON',
                    },
                    {
                        label: 'Do not collect location data',
                        checked:
                            !trackedEntityType.featureType ||
                            trackedEntityType.featureType === 'NONE',
                    },
                ],
                screen
            )
            uiAssertions.expectCheckboxFieldToExist(
                'allowAuditLog',
                true,
                screen
            )

            const minAttributesInput = within(
                screen.getByTestId('formfields-minattributesrequiredtosearch')
            ).getByRole('spinbutton')
            expect(minAttributesInput).toHaveValue(2)

            const maxTeiCountInput = within(
                screen.getByTestId('formfields-maxteicount')
            ).getByRole('spinbutton')
            expect(maxTeiCountInput).toHaveValue(50)
        })

        it('contains attributes prefilled', async () => {
            const { screen, trackedEntityType, attributes } = await renderForm()

            for (const attribute of attributes) {
                const attributeInput = screen.getByTestId(
                    `attribute-${attribute.id}`
                )
                expect(attributeInput).toBeVisible()
                expect(
                    within(
                        within(attributeInput).getByTestId('dhis2-uicore-input')
                    ).getByRole('textbox')
                ).toHaveValue(trackedEntityType.attributeValues[0].value)
            }
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
            await uiActions.submitForm(screen)
            expect(updateMock).not.toHaveBeenCalled()
        })

        it('should submit the data successfully when a field is changed', async () => {
            const { screen, trackedEntityType } = await renderForm()
            const newName = faker.animal.bird()

            await uiActions.enterName(newName, screen)

            await uiActions.submitForm(screen)

            expect(updateMock).toHaveBeenCalledWith({
                data: [
                    {
                        op: 'replace',
                        path: '/name',
                        value: newName,
                    },
                ],
                id: trackedEntityType.id,
                params: undefined,
                resource: 'trackedEntityTypes',
            })
        })

        it('should submit when allowAuditLog is toggled', async () => {
            const { screen, trackedEntityType } = await renderForm()

            await uiActions.clickOnCheckboxField('allowAuditLog', screen)

            await uiActions.submitForm(screen)

            expect(updateMock).toHaveBeenCalledWith({
                data: [
                    {
                        op: 'replace',
                        path: '/allowAuditLog',
                        value: false,
                    },
                ],
                id: trackedEntityType.id,
                params: undefined,
                resource: 'trackedEntityTypes',
            })
        })

        it('should submit when numeric fields are changed', async () => {
            const { screen, trackedEntityType } = await renderForm()
            const newMinAttributes = 5

            const minAttributesInput = within(
                screen.getByTestId('formfields-minattributesrequiredtosearch')
            ).getByRole('spinbutton')
            await userEvent.clear(minAttributesInput)
            await userEvent.type(
                minAttributesInput,
                newMinAttributes.toString()
            )

            await uiActions.submitForm(screen)

            expect(updateMock).toHaveBeenCalledWith({
                data: [
                    {
                        op: 'replace',
                        path: '/minAttributesRequiredToSearch',
                        value: newMinAttributes,
                    },
                ],
                id: trackedEntityType.id,
                params: undefined,
                resource: 'trackedEntityTypes',
            })
        })
    })
})

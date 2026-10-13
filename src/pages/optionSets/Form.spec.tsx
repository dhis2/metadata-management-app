import { faker } from '@faker-js/faker'
import { render, waitFor } from '@testing-library/react'
import React from 'react'
import schemaMock from '../../__mocks__/schema/optionSet.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import { SECTIONS_MAP, getConstantTranslation } from '../../lib'
import {
    randomLongString,
    testOptionSet,
    testCustomAttribute,
} from '../../testUtils/builders'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { uiAssertions } from '../../testUtils/uiAssertions'
import { Component as Edit } from './Edit'
import { Component as New } from './New'
import resetAllMocks = jest.resetAllMocks

const ATTRIBUTE_TRANSLATIONS: Record<string, string> = {}

const section = SECTIONS_MAP.optionSet
const mockSchema = schemaMock
jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))

describe('Option sets form tests', () => {
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
                            optionSets: (type: any, params: any) => {
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
                                            optionSets: [testOptionSet()],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        optionSets: [],
                                    }
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <New />
                    </TestComponentWithRouter>
                )
                return { screen }
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
                            optionSets: (type: any, params: any) => {
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
                                            optionSets: [testOptionSet()],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        optionSets: [],
                                    }
                                }
                            },
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
            uiAssertions.expectCodeFieldExist('', screen)
            uiAssertions.expectTextAreaFieldToExist('description', '', screen)
            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-valueType'),
                {
                    selected: 'Text',
                    options: schemaMock.properties.valueType.constants.map(
                        (o) => ({
                            displayName: getConstantTranslation(o),
                        })
                    ),
                },
                screen
            )
        })
        it('allows you to select MULTI_TEXT as value type', async () => {
            const { screen } = await renderForm()
            await uiActions.pickOptionFromSelect(
                screen.getByTestId('formfields-valueType'),
                schemaMock.properties.valueType.constants.indexOf('MULTI_TEXT'),
                screen
            )
            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-valueType'),
                {
                    selected: getConstantTranslation('MULTI_TEXT'),
                    options: schemaMock.properties.valueType.constants.map(
                        (o) => ({
                            displayName: getConstantTranslation(o),
                        })
                    ),
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
        it.skip('should submit the data', async () => {
            const { screen, optionSets } = await renderForm()
            const aName = faker.animal.bird()
            const aCode = faker.science.chemicalElement().symbol
            const aDescription = faker.company.buzzPhrase()
            const aSortOrder = faker.number.int()

            await uiActions.enterName(aName, screen)
            await uiActions.enterCode(aCode, screen)
            await uiActions.enterInputFieldValue(
                'description',
                aDescription,
                screen
            )
            await uiActions.enterInputFieldValue(
                'sortOrder',
                String(aSortOrder),
                screen,
                { type: 'spinbutton' }
            )
            await uiActions.pickOptionFromSelect(
                screen.getByTestId('formfields-optionSet'),
                1,
                screen
            )
            const objectsToSelectIndices = Object.values(ATTRIBUTE_TRANSLATIONS)
                .map((_, ind) => (Math.random() > 0.8 ? ind : null))
                .filter(Boolean) as number[]

            await uiActions.pickOptionFromMultiSelect(
                screen.getByTestId('formfields-objecttypes'),
                objectsToSelectIndices,
                screen
            )

            const selectedObjectAttributes = Object.keys(
                ATTRIBUTE_TRANSLATIONS
            ).reduce((acc, cv, ind) => {
                acc[cv] = objectsToSelectIndices.includes(ind)
                return acc
            }, {} as Record<string, boolean>)

            await uiActions.clickOnCheckboxField('mandatory', screen)
            await uiActions.clickOnCheckboxField('unique', screen)

            await uiActions.submitForm(screen)

            expect(createMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        name: aName,
                        code: aCode,
                        description: aDescription,
                        optionSet: expect.objectContaining({
                            id: optionSets[1].id,
                        }),
                        sortOrder: aSortOrder,
                        ...selectedObjectAttributes,
                        mandatory: true,
                        unique: true,
                    }),
                })
            )
        })
    })
    describe('Edit', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (routeOptions) => {
                const optionSet = {
                    ...testOptionSet(),
                    name: faker.word.words(),
                    code: faker.science.chemicalElement().symbol,
                    options: [],
                }

                const attributes = [testCustomAttribute({ mandatory: false })]
                const id = optionSet.id
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}/:id`}
                        initialEntries={[`/${section.namePlural}/${id}`]}
                        customData={{
                            attributes: () => ({ attributes, pager: {} }),
                            optionSets: (type: any, params: any) => {
                                if (type === 'create') {
                                    createMock(params)
                                    return { statusCode: 204 }
                                }
                                if (type === 'json-patch') {
                                    updateMock(params)
                                    return { statusCode: 204 }
                                }
                                if (type === 'read') {
                                    if (params?.id) {
                                        return {
                                            ...optionSet,
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        optionSets: [],
                                    }
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <Edit />
                    </TestComponentWithRouter>
                )
                return { screen, optionSet }
            }
        )

        it('contains all needed fields prefilled', async () => {
            const { screen, optionSet } = await renderForm()

            uiAssertions.expectNameFieldExist(optionSet.name, screen)
            uiAssertions.expectCodeFieldExist(optionSet.code, screen)
            uiAssertions.expectTextAreaFieldToExist(
                'description',
                optionSet.description,
                screen
            )
            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-valueType'),
                {
                    selected: getConstantTranslation(optionSet.valueType),
                    options: schemaMock.properties.valueType.constants.map(
                        (o) => ({
                            displayName: getConstantTranslation(o),
                        })
                    ),
                    disabled: true,
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

import { faker } from '@faker-js/faker'
import { act, render, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import schemaMock from '../../__mocks__/schema/attributeSchema.json'
import optionSetSchemaMock from '../../__mocks__/schema/optionSet.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import * as lib from '../../lib'
import {
    ModelSchemas,
    SECTIONS_MAP,
    VALUE_TYPE,
    getConstantTranslation,
} from '../../lib'
import { useSchemaStore } from '../../lib/schemas/schemaStore'
import {
    randomLongString,
    testAttributeForm,
    testOptionSet,
} from '../../testUtils/builders'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { uiAssertions } from '../../testUtils/uiAssertions'
import { Component as Edit } from './Edit'
import { ATTRIBUTE_TRANSLATIONS } from './form/AttributeTypeComponent'
import { Component as New } from './New'
import resetAllMocks = jest.resetAllMocks

const testAttribute = testAttributeForm

const section = SECTIONS_MAP.attribute
const mockSchema = schemaMock
jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))

const VALUE_TYPES_OPTIONS =
    mockSchema.properties.valueType.constants?.map((constant) => ({
        value: constant,
        displayName: getConstantTranslation(constant),
    })) ?? []
const OBJECT_OPTIONS = Object.values(ATTRIBUTE_TRANSLATIONS).map((a) => ({
    displayName: a,
}))

describe('Attributes form tests', () => {
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
                const optionSets = [testOptionSet(), testOptionSet()]
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            optionSets: () => ({ optionSets }),
                            attributes: (type: any, params: any) => {
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
                                            attributes: [testAttribute()],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        optionGroupSets: [],
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
        it('should open the option sets new form in a drawer when clicking the "Add new" button', async () => {
            const { screen } = await renderForm()

            // Merge optionSet schema so the OptionSet New form can render inside the drawer
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
            (
                routeOptions,
                {
                    matchingExistingElementFilter = undefined,
                    overrideOptionSets = undefined,
                } = {}
            ) => {
                const optionSets = overrideOptionSets ?? [
                    testOptionSet(),
                    testOptionSet(),
                ]
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            optionSets: () => ({ optionSets }),
                            attributes: (type: any, params: any) => {
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
                                            attributes: [testAttribute()],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        optionGroupSets: [],
                                    }
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <New />
                    </TestComponentWithRouter>
                )
                return { screen, optionSets }
            }
        )

        it('contains all needed fields', async () => {
            const { screen, optionSets } = await renderForm()

            uiAssertions.expectNameFieldExist('', screen)
            uiAssertions.expectInputFieldToExist('shortName', '', screen)
            uiAssertions.expectCodeFieldExist('', screen)
            uiAssertions.expectTextAreaFieldToExist('description', '', screen)
            uiAssertions.expectCheckboxFieldToExist('mandatory', false, screen)
            uiAssertions.expectCheckboxFieldToExist('unique', false, screen)
            uiAssertions.expectInputFieldToExist(
                'sortOrder',
                '',
                screen,
                'spinbutton'
            )
            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-optionSet'),
                { options: optionSets },
                screen
            )
            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-valueType'),
                {
                    selected: 'Text',
                    options: mockSchema.properties.valueType.constants
                        .filter((o) => o !== 'MULTI_TEXT')
                        .map((o) => ({
                            displayName: getConstantTranslation(o),
                        })),
                },
                screen
            )

            await uiAssertions.expectMultiSelectToExistWithOptions(
                screen.getByTestId('formfields-objecttypes'),
                {
                    selected: [],
                    options: OBJECT_OPTIONS,
                },
                screen
            )
        })
        it('should not have multi text as a value type by default', async () => {
            const { screen } = await renderForm()
            const valueTypeOptions = await uiActions.openSingleSelect(
                screen.getByTestId('formfields-valueType'),
                screen
            )
            const multiTextOptions = valueTypeOptions.filter((opt) =>
                opt.textContent?.includes(VALUE_TYPE.MULTI_TEXT)
            )
            expect(multiTextOptions).toHaveLength(0)
        })
        it('locks value type when option set is selected (non multi-select)', async () => {
            const noMultiTextOptions = VALUE_TYPES_OPTIONS.map(
                (o) => o.value
            ).filter((o) => o !== 'MULTI_TEXT')
            const overrideOptionSets = [
                testOptionSet(),
                {
                    ...testOptionSet(),
                    valueType:
                        noMultiTextOptions[
                            Math.floor(
                                Math.random() * noMultiTextOptions.length
                            )
                        ],
                },
                testOptionSet(),
            ]
            const { screen, optionSets } = await renderForm({
                overrideOptionSets,
            })

            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-optionSet'),
                { options: optionSets },
                screen
            )
            await uiActions.pickOptionFromSelect(
                screen.getByTestId('formfields-optionSet'),
                1,
                screen
            )
            // relevant value type is selected and value type is disabled
            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-valueType'),
                {
                    options: VALUE_TYPES_OPTIONS.filter(
                        (o) =>
                            o.value !== 'MULTI_TEXT' ||
                            optionSets?.[1]?.valueType === 'MULTI_TEXT'
                    ),
                    selected: getConstantTranslation(
                        optionSets?.[1]?.valueType
                    ),
                    disabled: true,
                },
                screen
            )

            expect(
                screen.getByText(
                    'Disabled as the value type must match the value type of the selected option set.'
                )
            ).toBeInTheDocument()

            // clear selected option
            await uiActions.clearSingleSelect('formfields-optionSet', screen)

            // value type is still selected but is not disabled
            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-valueType'),
                {
                    options: VALUE_TYPES_OPTIONS.filter(
                        (o) => o.value !== 'MULTI_TEXT'
                    ),
                    selected: getConstantTranslation(
                        optionSets?.[1]?.valueType
                    ),
                    disabled: false,
                },
                screen
            )
            expect(
                screen.queryByText(
                    'Disabled as the value type must match the value type of the selected option set'
                )
            ).toBeNull()
        })
        it('removes multi-text value type if option set is cleared', async () => {
            const { screen, optionSets } = await renderForm({
                overrideOptionSets: [
                    testOptionSet(),
                    { ...testOptionSet(), valueType: 'MULTI_TEXT' },
                ],
            })

            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-optionSet'),
                { options: optionSets },
                screen
            )
            await uiActions.pickOptionFromSelect(
                screen.getByTestId('formfields-optionSet'),
                1,
                screen
            )

            // relevant value type is selected and value type is disabled
            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-valueType'),
                {
                    options: VALUE_TYPES_OPTIONS,
                    selected: getConstantTranslation('MULTI_TEXT'),
                    disabled: true,
                },
                screen
            )

            expect(
                screen.getByText(
                    'Disabled as the value type must match the value type of the selected option set.'
                )
            ).toBeInTheDocument()

            // clear selected option
            await uiActions.clearSingleSelect('formfields-optionSet', screen)

            // value type is cleared and is not disabled
            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-valueType'),
                {
                    options: VALUE_TYPES_OPTIONS.filter(
                        (o) => o.value !== 'MULTI_TEXT'
                    ),
                    selected: undefined,
                    disabled: false,
                },
                screen
            )
            expect(
                screen.queryByText(
                    'Disabled as the value type must match the value type of the selected option set'
                )
            ).toBeNull()
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
                const optionSets = [
                    testOptionSet(),
                    testOptionSet(),
                    testOptionSet(),
                ]
                const attribute = testAttribute({
                    optionSet: {
                        id: optionSets[1].id,
                        displayName: optionSets[1].displayName,
                    },
                    valueType:
                        VALUE_TYPES_OPTIONS[
                            Math.floor(
                                Math.random() * VALUE_TYPES_OPTIONS.length
                            )
                        ]?.value,
                })

                const id = attribute.id
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}/:id`}
                        initialEntries={[`/${section.namePlural}/${id}`]}
                        customData={{
                            optionSets: () => ({ optionSets, pager: {} }),
                            attributes: (type: any, params: any) => {
                                if (type === 'create') {
                                    createMock(params)
                                    return { statusCode: 204 }
                                }
                                if (type === 'read') {
                                    if (params?.id) {
                                        return {
                                            ...attribute,
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        attributes: [],
                                    }
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <Edit />
                    </TestComponentWithRouter>
                )
                return { screen, optionSets, attribute }
            }
        )

        it('contains all needed fields prefilled', async () => {
            const { screen, attribute, optionSets } = await renderForm()

            uiAssertions.expectNameFieldExist(attribute.name, screen)
            uiAssertions.expectInputFieldToExist(
                'shortName',
                attribute.shortName,
                screen
            )
            uiAssertions.expectCodeFieldExist(attribute.code, screen)
            uiAssertions.expectTextAreaFieldToExist(
                'description',
                attribute.description,
                screen
            )
            uiAssertions.expectCheckboxFieldToExist(
                'mandatory',
                attribute.mandatory,
                screen
            )
            uiAssertions.expectCheckboxFieldToExist(
                'unique',
                attribute.unique,
                screen
            )
            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-optionSet'),
                {
                    options: optionSets,
                    selected: attribute?.optionSet?.displayName,
                    disabled: false,
                },
                screen
            )

            const selectedObjects = (Object.keys(ATTRIBUTE_TRANSLATIONS)
                .map((key) => {
                    return attribute[key]
                        ? { displayName: ATTRIBUTE_TRANSLATIONS[key] }
                        : null
                })
                .filter(Boolean) ?? []) as { displayName: string }[]

            await uiAssertions.expectMultiSelectToExistWithOptions(
                screen.getByTestId('formfields-objecttypes'),
                {
                    selected: selectedObjects,
                    options: OBJECT_OPTIONS,
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
            await uiActions.submitForm(screen)
            expect(updateMock).not.toHaveBeenCalled()
        })
    })
})

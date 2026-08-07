import { faker } from '@faker-js/faker'
import { act, render, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import categoryCombosSchema from '../../__mocks__/schema/categoryCombosSchema.json'
import schemaMock from '../../__mocks__/schema/dataElements.json'
import optionSetSchemaMock from '../../__mocks__/schema/optionSet.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import { DISABLING_VALUE_TYPES } from '../../components/form/fields/AggregationTypeFieldByValueType'
import {
    DEFAULT_CATEGORYCOMBO_SELECT_OPTION,
    getConstantTranslation,
    ModelSchemas,
    SECTIONS_MAP,
    VALUE_TYPE,
} from '../../lib'
import { useSchemaStore } from '../../lib/schemas/schemaStore'
import {
    randomLongString,
    randomValueIn,
    testCategoryCombo,
    testCustomAttribute,
    testDataElement,
    testOptionSet,
} from '../../testUtils/builders'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { uiAssertions } from '../../testUtils/uiAssertions'
import { Component as New } from './New'
import resetAllMocks = jest.resetAllMocks

// "should change aggregation type to NONE..." below is an occasionally
// flaky, timing-sensitive test unrelated to any change here; retry masks
// it rather than fixes it, but that's the existing tradeoff carried over
// from before this file was split.
jest.retryTimes(2, { logErrorsBeforeRetry: true })

jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))

const section = SECTIONS_MAP.dataElement
const mockSchema = schemaMock

describe('Data elements form tests - Common', () => {
    const createMock = jest.fn()

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
        (routeOptions, { matchingExistingElementFilter = undefined } = {}) => {
            const attributes = [testCustomAttribute({ mandatory: false })]
            const categoryCombos = [
                testCategoryCombo(),
                testCategoryCombo(),
                testCategoryCombo(),
            ]
            const optionSets = [testOptionSet(), testOptionSet()]
            const screen = render(
                <TestComponentWithRouter
                    path={`/${section.namePlural}`}
                    customData={{
                        attributes: () => ({ attributes }),
                        optionSets: () => ({ pager: {}, optionSets }),
                        categoryCombos: () => ({
                            pager: {},
                            categoryCombos,
                        }),
                        dataElements: (type: any, params: any) => {
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
                                        dataElements: [testDataElement()],
                                    }
                                }
                                return {
                                    pager: { total: 0 },
                                    dataElements: [],
                                }
                            }
                        },
                    }}
                    routeOptions={routeOptions}
                >
                    <New />
                </TestComponentWithRouter>
            )
            return { screen, attributes, categoryCombos, optionSets }
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
        await uiActions.enterName(longText, screen, { paste: true })
        await uiAssertions.expectNameToErrorWhenExceedsLength(screen)
        await uiActions.submitForm(screen)
        expect(createMock).not.toHaveBeenCalled()
    })
    it('should show an error if short name field is too long', async () => {
        const { screen } = await renderForm()
        const longText = randomLongString(54)
        await uiActions.enterInputFieldValue('shortName', longText, screen, {
            paste: true,
        })
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
        await uiActions.enterInputFieldValue('code', longText, screen, {
            paste: true,
        })
        await uiAssertions.expectInputToErrorWhenExceedsLength(
            'code',
            50,
            screen
        )
        await uiActions.submitForm(screen)
        expect(createMock).not.toHaveBeenCalled()
    })
    it('should show an error if form name field is too long', async () => {
        const { screen } = await renderForm()
        const longText = randomLongString(247)
        await uiActions.enterInputFieldValue('formName', longText, screen, {
            paste: true,
        })
        await uiAssertions.expectInputToErrorWhenExceedsLength(
            'formName',
            230,
            screen
        )
        await uiActions.submitForm(screen)
        expect(createMock).not.toHaveBeenCalled()
    })
    it('should show an error if url field is too long', async () => {
        const { screen } = await renderForm()
        const longText = randomLongString(312)
        await uiActions.enterInputFieldValue('url', longText, screen, {
            paste: true,
        })
        await uiAssertions.expectInputToErrorWhenExceedsLength(
            'url',
            255,
            screen
        )
        await uiActions.submitForm(screen)
        expect(createMock).not.toHaveBeenCalled()
    })
    it('should show an error if field mask field is too long', async () => {
        const { screen } = await renderForm()
        const longText = randomLongString(312)
        await uiActions.enterInputFieldValue('fieldMask', longText, screen, {
            paste: true,
        })
        await uiAssertions.expectInputToErrorWhenExceedsLength(
            'fieldMask',
            255,
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
        await uiAssertions.expectNameToErrorWhenDuplicate(existingName, screen)
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
        await uiAssertions.expectCodeToErrorWhenDuplicate(existingCode, screen)
        await uiActions.submitForm(screen)
        expect(createMock).not.toHaveBeenCalled()
    })
    it('should change cat combo to default and disable cat combo field if domain is tracker', async () => {
        const { screen } = await renderForm()
        const aName = faker.animal.bird()
        const aShortName = faker.person.firstName()

        await uiActions.enterName(aName, screen, { paste: true })
        await uiActions.enterInputFieldValue('shortName', aShortName, screen, {
            paste: true,
        })
        await uiActions.pickOptionFromSelect(
            screen.getByTestId('formfields-categorycombo'),
            2,
            screen
        )
        await uiActions.pickRadioField('domainType', 'Tracker', screen)
        const catComboSelectInput = within(
            screen.getByTestId('formfields-categorycombo')
        ).getByTestId('dhis2-uicore-select-input')
        expect(catComboSelectInput).toBeVisible()
        expect(catComboSelectInput).toHaveTextContent('None')
        expect(catComboSelectInput).toHaveClass('disabled')

        await uiActions.submitForm(screen)
        expect(createMock).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    categoryCombo: expect.objectContaining({
                        id: DEFAULT_CATEGORYCOMBO_SELECT_OPTION.id,
                    }),
                }),
            })
        )
    })
    it('should change aggregation type to NONE and disable if value type is of certain type', async () => {
        const { screen } = await renderForm()
        const aName = faker.animal.bird()
        const aShortName = faker.person.firstName()
        const aValueType = randomValueIn([...DISABLING_VALUE_TYPES])

        await uiActions.enterName(aName, screen, { paste: true })
        await uiActions.enterInputFieldValue('shortName', aShortName, screen, {
            paste: true,
        })
        await uiActions.pickRadioField('domainType', 'Aggregate', screen)
        await uiActions.pickOptionFromSelect(
            screen.getByTestId('formfields-categorycombo'),
            2,
            screen
        )
        const valueTypeOptions = await uiActions.openSingleSelect(
            screen.getByTestId('formfields-valueType'),
            screen
        )
        const valueTypeOption = valueTypeOptions.find((opt) =>
            opt.textContent?.includes(getConstantTranslation(aValueType))
        )!
        await userEvent.click(valueTypeOption)
        await uiActions.closeSingleSelectIfOpen(
            screen.getByTestId('formfields-valueType'),
            screen
        )

        const aggregationTypeField = screen.getByTestId(
            'formfields-aggregationType'
        )
        await waitFor(() => {
            const aggregationTypeSelectInput = within(
                aggregationTypeField
            ).getByTestId('dhis2-uicore-select-input')
            expect(aggregationTypeSelectInput).toBeVisible()
            expect(aggregationTypeSelectInput).toHaveTextContent('None')
            expect(aggregationTypeSelectInput).toHaveClass('disabled')
        })

        await uiActions.submitForm(screen)
        expect(createMock).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    aggregationType: 'NONE',
                }),
            })
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
    it('should open the category combo new form in a drawer when clicking the "Add new" button', async () => {
        const { screen } = await renderForm()

        useSchemaStore.getState().setSchemas({
            ...useSchemaStore.getState().schemas,
            categoryCombo: categoryCombosSchema,
        } as unknown as ModelSchemas)

        await act(async () => {})

        const categoryComboField = screen.getByTestId(
            'formfields-categorycombo'
        )

        const addNewButton =
            within(categoryComboField).getAllByRole('button')[1]
        await userEvent.click(addNewButton)

        expect(
            await screen.findByText('Add new Category combination')
        ).toBeInTheDocument()
        expect(screen.getByTestId('categoryComboNewForm')).toBeInTheDocument()
        expect(
            within(screen.getByTestId('categoryComboNewForm')).getByTestId(
                'form-submit-button'
            )
        ).toHaveTextContent('Save and close')
    })

    it('should open the option set new form in a drawer when clicking the "Add new" button', async () => {
        const { screen } = await renderForm()

        useSchemaStore.getState().setSchemas({
            ...useSchemaStore.getState().schemas,
            optionSet: optionSetSchemaMock,
        } as unknown as ModelSchemas)

        await act(async () => {})

        const optionSetField = screen.getByTestId('formfields-optionset')
        const addNewButton = within(optionSetField).getAllByRole('button')[1]
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

    it('should open the option set new form in a drawer when clicking the "Add new" button on the comment option set field', async () => {
        const { screen } = await renderForm()

        useSchemaStore.getState().setSchemas({
            ...useSchemaStore.getState().schemas,
            optionSet: optionSetSchemaMock,
        } as unknown as ModelSchemas)

        await act(async () => {})

        const commentOptionSetField = screen.getByTestId(
            'formfields-commentoptionset'
        )
        const addNewButton = within(commentOptionSetField).getAllByRole(
            'button'
        )[1]
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

    it('should change the value type accordingly when an option set is selected', async () => {
        const { screen, optionSets } = await renderForm()

        const aName = faker.animal.bird()
        const aShortName = faker.person.firstName()
        await uiActions.enterName(aName, screen, { paste: true })
        await uiActions.enterInputFieldValue('shortName', aShortName, screen, {
            paste: true,
        })
        await uiActions.pickRadioField('domainType', 'Aggregate', screen)

        await uiActions.pickOptionFromSelect(
            screen.getByTestId('formfields-valueType'),
            5,
            screen
        )
        await uiActions.pickOptionFromSelect(
            screen.getByTestId('formfields-optionset'),
            1,
            screen
        )

        const valueType = within(
            screen.getByTestId('formfields-valueType')
        ).getByTestId('dhis2-uicore-select-input')
        expect(valueType).toBeVisible()
        expect(valueType).toHaveTextContent(
            getConstantTranslation(optionSets[0].valueType)
        )

        await uiActions.submitForm(screen)
        expect(createMock).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    valueType: optionSets[0].valueType,
                    optionSet: expect.objectContaining({
                        id: optionSets[0].id,
                    }),
                }),
            })
        )
    })
})

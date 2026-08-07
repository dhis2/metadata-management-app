import { render, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import schemaMock from '../../__mocks__/schema/dataElements.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import { DISABLING_VALUE_TYPES } from '../../components/form/fields/AggregationTypeFieldByValueType'
import { getConstantTranslation, SECTIONS_MAP, VALUE_TYPE } from '../../lib'
import {
    testCategoryCombo,
    testCustomAttribute,
    testDataElement,
    testLegendSet,
    testOptionSet,
    testOrgUnitLevel,
} from '../../testUtils/builders'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { uiAssertions } from '../../testUtils/uiAssertions'
import { DisplayableModel } from '../../types/models'
import { Component as Edit } from './Edit'
import resetAllMocks = jest.resetAllMocks

jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))
jest.mock(
    '../../components/metadataFormControls/ModelTransfer/BaseModelTransfer'
)

const section = SECTIONS_MAP.dataElement
const mockSchema = schemaMock

describe('Data elements form tests - Edit', () => {
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

    const renderForm = generateRenderer(
        { section, mockSchema },
        (routeOptions, { dataElementOverwrites }: any = {}) => {
            const attributes = [testCustomAttribute()]
            const categoryCombos = [
                testCategoryCombo(),
                testCategoryCombo(),
                testCategoryCombo(),
                testCategoryCombo(),
            ].filter((cc) => cc !== undefined)
            const optionSets =
                dataElementOverwrites?.optionSets ??
                [testOptionSet(), testOptionSet(), testOptionSet()].filter(
                    (cc) => cc !== undefined
                )

            const legendSets = [
                testLegendSet(),
                testLegendSet(),
                testLegendSet(),
                testLegendSet(),
            ]
            const organisationUnitLevels = [
                testOrgUnitLevel({ level: 1 }),
                testOrgUnitLevel({ level: 2 }),
                testOrgUnitLevel({ level: 3 }),
            ]
            const dataElement = testDataElement({
                zeroIsSignificant: true,
                aggregationLevels: [],
                domainType: 'AGGREGATE',
                commentOptionSet: optionSets[0],
                optionSet: optionSets[2],
                valueType: optionSets[2].valueType,
                legendSets: [legendSets[3]],
                categoryCombo: categoryCombos[3],
                attributeValues: [
                    { attribute: attributes[0], value: 'attribute' },
                ],
                ...dataElementOverwrites,
            })

            const id = dataElement.id

            const screen = render(
                <TestComponentWithRouter
                    path={`/${section.namePlural}/:id`}
                    initialEntries={[`/${section.namePlural}/${id}`]}
                    customData={{
                        attributes: () => ({ attributes }),
                        categoryCombos: () => ({
                            pager: {},
                            categoryCombos,
                        }),
                        optionSets: () => ({ pager: {}, optionSets }),
                        legendSets: () => ({ pager: {}, legendSets }),
                        organisationUnitLevels: () => ({
                            organisationUnitLevels,
                        }),
                        dataElements: (type: any, params: any) => {
                            if (type === 'json-patch') {
                                updateMock(params)
                                return { statusCode: 204 }
                            }
                            if (type === 'read') {
                                if (params?.id) {
                                    return dataElement
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
                    <Edit />
                </TestComponentWithRouter>
            )
            return {
                screen,
                attributes,
                categoryCombos,
                optionSets,
                legendSets,
                organisationUnitLevels,
                dataElement,
            }
        }
    )
    it('contains all fields prefilled', async () => {
        const {
            screen,
            dataElement,
            categoryCombos,
            optionSets,
            legendSets,
            attributes,
        } = await renderForm()

        uiAssertions.expectNameFieldExist(dataElement.name, screen)
        uiAssertions.expectInputFieldToExist(
            'shortName',
            dataElement.shortName,
            screen
        )
        uiAssertions.expectCodeFieldExist(dataElement.code, screen)
        uiAssertions.expectInputFieldToExist(
            'formName',
            dataElement.formName,
            screen
        )
        uiAssertions.expectTextAreaFieldToExist(
            'description',
            dataElement.description,
            screen
        )
        uiAssertions.expectInputFieldToExist('url', dataElement.url, screen)
        uiAssertions.expectInputFieldToExist(
            'fieldMask',
            dataElement.fieldMask,
            screen
        )
        uiAssertions.expectCheckboxFieldToExist(
            'zeroIsSignificant',
            true,
            screen
        )
        uiAssertions.expectRadioFieldToExist(
            'domainType',
            [
                { label: 'Aggregate', checked: true },
                {
                    label: 'Tracker',
                    checked: false,
                },
            ],
            screen
        )
        const valueTypeInput = within(
            screen.getByTestId('formfields-valueType')
        ).getByTestId('dhis2-uicore-select-input')
        expect(valueTypeInput).toBeVisible()
        expect(valueTypeInput).toHaveTextContent(
            getConstantTranslation(dataElement.valueType)
        )

        const aggregationType = within(
            screen.getByTestId('formfields-aggregationType')
        ).getByTestId('dhis2-uicore-select-input')
        expect(aggregationType).toBeVisible()
        if (
            DISABLING_VALUE_TYPES.includes(
                dataElement.valueType as (typeof DISABLING_VALUE_TYPES)[number]
            )
        ) {
            expect(aggregationType).toHaveTextContent('None')
        } else {
            expect(aggregationType).toHaveTextContent(
                getConstantTranslation(dataElement.aggregationType)
            )
        }

        await uiAssertions.expectSelectToExistWithOptions(
            screen.getByTestId('formfields-categorycombo'),
            {
                selected: dataElement.categoryCombo.displayName,
                options: [
                    { displayName: 'None' },
                    ...categoryCombos.map((cc: DisplayableModel) => ({
                        displayName: cc.displayName,
                    })),
                ],
            },
            screen
        )
        await uiAssertions.expectSelectToExistWithOptions(
            screen.getByTestId('formfields-optionset'),
            {
                selected: dataElement.optionSet!.displayName,
                options: [
                    { displayName: '<No value>' },
                    ...optionSets.map((cc: DisplayableModel) => ({
                        displayName: cc.displayName,
                    })),
                ],
            },
            screen
        )
        await uiAssertions.expectSelectToExistWithOptions(
            screen.getByTestId('formfields-commentoptionset'),
            {
                selected: dataElement.commentOptionSet!.displayName,
                options: [
                    { displayName: '<No value>' },
                    ...optionSets.map((cc: DisplayableModel) => ({
                        displayName: cc.displayName,
                    })),
                ],
            },
            screen
        )

        await uiAssertions.expectTransferFieldToExistWithOptions(
            'legendset-transfer',
            {
                lhs: [legendSets[0], legendSets[1], legendSets[2]],
                rhs: [legendSets[3]],
            },
            screen
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
            ).toHaveValue(dataElement.attributeValues[0].value)
        })
    })
    it('should have a cancel button with a link back to the list view', async () => {
        const { screen } = await renderForm()
        const cancelButton = screen.getByTestId('form-cancel-link')
        expect(cancelButton).toBeVisible()
        expect(cancelButton).toHaveAttribute('href', `/${section.namePlural}`)
    })
    it('should do nothing and return to the list view on success when no field is changed', async () => {
        const { screen } = await renderForm({
            dataElementOverwrites: {
                valueType: 'TEXT',
                aggregationType: 'NONE',
                optionSet: null,
            },
        })
        await uiActions.submitForm(screen)
        expect(updateMock).not.toHaveBeenCalled()
    })
    it('should have multi text as a value type if data element has option set with that value type', async () => {
        const { screen } = await renderForm({
            dataElementOverwrites: {
                valueType: 'MULTI_TEXT',
                optionSet: { ...testOptionSet(), valueType: 'MULTI_TEXT' },
            },
        })

        const valueType = within(
            screen.getByTestId('formfields-valueType')
        ).getByTestId('dhis2-uicore-select-input')
        expect(valueType).toBeVisible()
        expect(valueType).toHaveTextContent(VALUE_TYPE.MULTI_TEXT)
    })
    it('should require clicking through warning modal to change value type', async () => {
        const { screen } = await renderForm({
            dataElementOverwrites: {
                valueType: 'NUMBER',
                optionSet: null,
            },
        })
        const warningText = 'Change value type?'

        expect(screen.queryByText(warningText)).toBeNull()

        const valueType = within(
            screen.getByTestId('formfields-valueType')
        ).getByTestId('dhis2-uicore-select-input')
        expect(valueType).toBeVisible()
        expect(valueType).toHaveTextContent(VALUE_TYPE.NUMBER)

        const aValueType = 'COORDINATE'

        const valueTypeOptions = await uiActions.openSingleSelect(
            screen.getByTestId('formfields-valueType'),
            screen
        )
        const valueTypeOption = valueTypeOptions.find((opt) =>
            opt.textContent?.includes(getConstantTranslation(aValueType))
        )!
        await userEvent.click(valueTypeOption)

        expect(screen.getByText(warningText)).toBeInTheDocument()

        await userEvent.click(screen.getByTestId('confirmationModal-confirm'))

        expect(valueType).toHaveTextContent(getConstantTranslation(aValueType))
        expect(screen.queryByText(warningText)).toBeNull()
    })
    it('should revert to original value type if warning modal is cancelled', async () => {
        const { screen } = await renderForm({
            dataElementOverwrites: {
                valueType: 'NUMBER',
                optionSet: null,
            },
        })
        const warningText = 'Change value type?'

        expect(screen.queryByText(warningText)).toBeNull()

        const valueType = within(
            screen.getByTestId('formfields-valueType')
        ).getByTestId('dhis2-uicore-select-input')
        expect(valueType).toBeVisible()
        expect(valueType).toHaveTextContent(VALUE_TYPE.NUMBER)

        const aValueType = 'COORDINATE'

        const valueTypeOptions = await uiActions.openSingleSelect(
            screen.getByTestId('formfields-valueType'),
            screen
        )
        const valueTypeOption = valueTypeOptions.find((opt) =>
            opt.textContent?.includes(getConstantTranslation(aValueType))
        )!
        await userEvent.click(valueTypeOption)

        await waitFor(() => {
            expect(screen.getByText(warningText)).toBeInTheDocument()
        })

        await userEvent.click(screen.getByTestId('confirmationModal-cancel'))

        expect(valueType).toHaveTextContent(VALUE_TYPE.NUMBER)
        expect(screen.queryByText(warningText)).toBeNull()
    })
    it.skip('should require clicking through warning modal to change option set if that changes value type', async () => {
        const optionSets = [testOptionSet(), testOptionSet(), testOptionSet()]

        // ensure that the value types for options are different
        if (optionSets[0].valueType === optionSets[2].valueType) {
            optionSets[2].valueType = 'NUMBER'
            optionSets[0].valueType = 'COORDINATE'
        }
        const { screen } = await renderForm({
            dataElementOverwrites: {
                optionSets,
            },
        })
        const warningText =
            'Updating the option set will change the value type which may cause problems when generating analytics tables if there is existing data for this data element.'

        expect(screen.queryByText(warningText)).toBeNull()

        // Click a new option set (first from list, as None is in index 0)
        await uiActions.pickOptionFromSelect(
            screen.getByTestId('formfields-optionset'),
            1,
            screen
        )

        expect(screen.getByText(warningText)).toBeInTheDocument()

        // click confirm
        await userEvent.click(screen.getByTestId('confirmationModal-confirm'))

        // option set should be updated and warning should be removed
        await uiAssertions.expectSelectToExistWithOptions(
            screen.getByTestId('formfields-optionset'),
            {
                selected: optionSets[0].displayName,
                options: [
                    { displayName: '<No value>' },
                    ...optionSets.map((cc: DisplayableModel) => ({
                        displayName: cc.displayName,
                    })),
                ],
            },
            screen
        )
        expect(screen.queryByText(warningText)).toBeNull()
    })
    it('should not change option set without confirmation if it does not change value type', async () => {
        const optionSets = [testOptionSet(), testOptionSet(), testOptionSet()]

        if (optionSets[0].valueType === optionSets[2].valueType) {
            optionSets[2].valueType = 'NUMBER'
            optionSets[0].valueType = 'COORDINATE'
        }
        const { screen } = await renderForm({
            dataElementOverwrites: {
                optionSets,
            },
        })
        const warningText = 'Change option set and value type?'

        expect(screen.queryByText(warningText)).toBeNull()

        await uiActions.pickOptionFromSelect(
            screen.getByTestId('formfields-optionset'),
            1,
            screen
        )

        expect(screen.getByText(warningText)).toBeInTheDocument()

        await userEvent.click(screen.getByTestId('confirmationModal-cancel'))

        await uiAssertions.expectSelectToExistWithOptions(
            screen.getByTestId('formfields-optionset'),
            {
                selected: optionSets[2].displayName,
                options: [
                    { displayName: '<No value>' },
                    ...optionSets.map((cc: DisplayableModel) => ({
                        displayName: cc.displayName,
                    })),
                ],
            },
            screen
        )
        expect(screen.queryByText(warningText)).toBeNull()
    })
})

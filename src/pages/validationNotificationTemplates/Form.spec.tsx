import { faker } from '@faker-js/faker'
import { render, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import schemaMock from '../../__mocks__/schema/attributeSchema.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import { SECTIONS_MAP, generateDhis2Id } from '../../lib'
import {
    randomLongString,
    testUserGroup,
    testValidationRule,
    testValidationNotificationTemplateForm,
} from '../../testUtils/builders'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { uiAssertions } from '../../testUtils/uiAssertions'
import { Component as Edit } from './Edit'
import { VALIDATION_RULE_VARIABLES } from './form/ValidationNotificationTemplateFormFields'
import { Component as New } from './New'
import resetAllMocks = jest.resetAllMocks

const VALIDATION_RULES = Object.keys(VALIDATION_RULE_VARIABLES)

const section = SECTIONS_MAP.validationNotificationTemplate
const mockSchema = schemaMock
jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))

describe('Validation Notification form tests', () => {
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
                const userGroups = [testUserGroup(), testUserGroup()]
                const validationRules = [
                    testValidationRule(),
                    testValidationRule(),
                ]
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            validationRules: () => ({
                                validationRules,
                                pager: {},
                            }),
                            userGroups: () => ({ userGroups, pager: {} }),
                            validationNotificationTemplates: (
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
                                            validationNotificationTemplates: [
                                                testValidationNotificationTemplateForm(),
                                            ],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        validationNotificationTemplates: [],
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
        it('enters variables into subject template', async () => {
            const { screen } = await renderForm()
            const randomText = randomLongString(10)

            await uiActions.enterInputFieldValue(
                'subjectTemplate',
                randomText,
                screen,
                { supressTab: true }
            )
            // then select a button
            const validationRule =
                VALIDATION_RULES[
                    Math.floor(Math.random() * VALIDATION_RULES.length)
                ]
            await uiActions.clickButton(
                `validationRule_button_${validationRule}`,
                screen
            )
            uiAssertions.expectInputFieldToExist(
                'subjectTemplate',
                randomText + `V{${validationRule}}`,
                screen
            )

            // then check that it inserts at the last cursor position
            const field = screen.getByTestId('formfields-subjectTemplate')
            const input = within(field).getByRole('textbox') as HTMLInputElement
            const randomText2 = randomLongString(10)
            const validationRule2 =
                VALIDATION_RULES[
                    Math.floor(Math.random() * VALIDATION_RULES.length)
                ]
            await userEvent.type(input, randomText2, {
                initialSelectionStart: 0,
                initialSelectionEnd: 0,
                delay: null,
            })
            await uiActions.clickButton(
                `validationRule_button_${validationRule2}`,
                screen
            )
            uiAssertions.expectInputFieldToExist(
                'subjectTemplate',
                randomText2 +
                    `V{${validationRule2}}` +
                    randomText +
                    `V{${validationRule}}`,
                screen
            )
        })
        it('enters variables into message template', async () => {
            const { screen } = await renderForm()
            const randomText = randomLongString(10)

            await uiActions.enterInputFieldValue(
                'messageTemplate',
                randomText,
                screen,
                { supressTab: true }
            )
            // then select a button
            const validationRule =
                VALIDATION_RULES[
                    Math.floor(Math.random() * VALIDATION_RULES.length)
                ]
            await uiActions.clickButton(
                `validationRule_button_${validationRule}`,
                screen
            )
            uiAssertions.expectTextAreaFieldToExist(
                'messageTemplate',
                randomText + `V{${validationRule}}`,
                screen
            )

            // then check that it inserts at the last cursor position
            const field = screen.getByTestId('formfields-messageTemplate')
            const input = within(field).getByRole('textbox') as HTMLInputElement
            const randomText2 = randomLongString(10)
            const validationRule2 =
                VALIDATION_RULES[
                    Math.floor(Math.random() * VALIDATION_RULES.length)
                ]
            await userEvent.type(input, randomText2, {
                initialSelectionStart: 0,
                initialSelectionEnd: 0,
                delay: null,
            })
            await uiActions.clickButton(
                `validationRule_button_${validationRule2}`,
                screen
            )
            uiAssertions.expectTextAreaFieldToExist(
                'messageTemplate',
                randomText2 +
                    `V{${validationRule2}}` +
                    randomText +
                    `V{${validationRule}}`,
                screen
            )
        })
    })
    describe('New', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (
                routeOptions,
                { matchingExistingElementFilter = undefined } = {}
            ) => {
                const userGroups = [testUserGroup(), testUserGroup()]
                const validationRules = [
                    testValidationRule(),
                    testValidationRule(),
                ]
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            validationRules: () => ({
                                validationRules,
                                pager: {},
                            }),
                            userGroups: () => ({ userGroups, pager: {} }),
                            validationNotificationTemplates: (
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
                                            validationNotificationTemplates: [
                                                testValidationNotificationTemplateForm(),
                                            ],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        validationNotificationTemplates: [],
                                    }
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <New />
                    </TestComponentWithRouter>
                )
                return { screen, userGroups, validationRules }
            }
        )

        it('contains all needed fields', async () => {
            const { screen, validationRules, userGroups } = await renderForm()

            uiAssertions.expectNameFieldExist('', screen)
            uiAssertions.expectCodeFieldExist('', screen)
            await uiAssertions.expectTransferFieldToExistWithOptions(
                'validationRules-transfer',
                {
                    lhs: validationRules,
                    rhs: [],
                },
                screen
            )
            uiAssertions.expectInputFieldToExist('subjectTemplate', '', screen)
            uiAssertions.expectTextAreaFieldToExist(
                'messageTemplate',
                '',
                screen
            )

            await uiAssertions.expectMultiSelectToExistWithOptions(
                screen.getByTestId('formfields-recipientUserGroups'),
                {
                    selected: [],
                    options: userGroups,
                },
                screen
            )

            const notificationTypeOptions = [
                { label: 'Collective summary', checked: false },
                { label: 'Single notification', checked: false },
            ]
            uiAssertions.expectRadioFieldToExist(
                'notificationType',
                notificationTypeOptions,
                screen
            )

            uiAssertions.expectCheckboxFieldToExist(
                'notifyUsersInHierarchyOnly',
                false,
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
        it('should submit the data', async () => {
            const { screen, validationRules, userGroups } = await renderForm()
            const aName = faker.animal.bird()
            const aCode = faker.science.chemicalElement().symbol
            const aSubject = faker.animal.crocodilia()
            const aMessage = faker.company.buzzPhrase()

            const notificationTypeOptions = [
                {
                    label: 'Collective summary',
                    checked: false,
                    id: 'COLLECTIVE_SUMMARY',
                },
                {
                    label: 'Single notification',
                    checked: false,
                    id: 'SINGLE_NOTIFICATION',
                },
            ]
            const notificationOptionIndex = Math.floor(
                Math.random() * notificationTypeOptions.length
            )

            await uiActions.enterName(aName, screen)
            await uiActions.enterCode(aCode, screen)
            await uiActions.pickOptionInTransfer(
                'validationRules-transfer',
                validationRules[1].displayName,
                screen
            )
            await uiActions.enterInputFieldValue(
                'subjectTemplate',
                aSubject,
                screen
            )
            await uiActions.enterInputFieldValue(
                'messageTemplate',
                aMessage,
                screen
            )
            uiActions.pickRadioField(
                'notificationType',
                notificationTypeOptions[notificationOptionIndex].label,
                screen
            )

            const userGroupToSelectIndices = [1]
            await uiActions.pickOptionFromMultiSelect(
                screen.getByTestId('formfields-recipientUserGroups'),
                userGroupToSelectIndices,
                screen
            )

            await uiActions.clickOnCheckboxField(
                'notifyUsersInHierarchyOnly',
                screen
            )

            await uiActions.submitForm(screen)

            expect(createMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        name: aName,
                        code: aCode,
                        validationRules: [
                            expect.objectContaining({
                                id: validationRules[1].id,
                            }),
                        ],
                        subjectTemplate: aSubject,
                        messageTemplate: aMessage,
                        sendStrategy:
                            notificationTypeOptions[notificationOptionIndex].id,
                        recipientUserGroups: [
                            expect.objectContaining({ id: userGroups[1].id }),
                        ],
                        notifyUsersInHierarchyOnly: true,
                    }),
                })
            )
        })
    })
    describe('Edit', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (routeOptions) => {
                const userGroups = [
                    { ...testUserGroup(), id: generateDhis2Id() },
                    { ...testUserGroup(), id: generateDhis2Id() },
                ]
                const validationRules = [
                    testValidationRule(),
                    testValidationRule(),
                ]
                const validationNotificationTemplate =
                    testValidationNotificationTemplateForm()
                validationNotificationTemplate.recipientUserGroups = [
                    userGroups[0],
                ]
                validationNotificationTemplate.validationRules = [
                    validationRules[0],
                ]
                const id = validationNotificationTemplate.id
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}/:id`}
                        initialEntries={[`/${section.namePlural}/${id}`]}
                        customData={{
                            validationRules: () => ({
                                validationRules,
                                pager: {},
                            }),
                            userGroups: () => ({ userGroups, pager: {} }),
                            validationNotificationTemplates: (
                                type: any,
                                params: any
                            ) => {
                                if (type === 'json-patch') {
                                    updateMock(params)
                                    return { statusCode: 204 }
                                }
                                if (type === 'read') {
                                    if (params?.id) {
                                        return {
                                            ...validationNotificationTemplate,
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        validationNotificationTemplates: [],
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
                    userGroups,
                    validationRules,
                    validationNotificationTemplate,
                }
            }
        )
        it('contains all needed fields prefilled', async () => {
            const {
                screen,
                userGroups,
                validationRules,
                validationNotificationTemplate,
            } = await renderForm()

            uiAssertions.expectNameFieldExist(
                validationNotificationTemplate.name,
                screen
            )
            uiAssertions.expectCodeFieldExist(
                validationNotificationTemplate.code,
                screen
            )
            await uiAssertions.expectTransferFieldToExistWithOptions(
                'validationRules-transfer',
                {
                    lhs: [validationRules[1]],
                    rhs: [validationRules[0]],
                },
                screen
            )
            uiAssertions.expectInputFieldToExist(
                'subjectTemplate',
                validationNotificationTemplate.subjectTemplate,
                screen
            )
            uiAssertions.expectTextAreaFieldToExist(
                'messageTemplate',
                validationNotificationTemplate.messageTemplate,
                screen
            )

            await uiAssertions.expectMultiSelectToExistWithOptions(
                screen.getByTestId('formfields-recipientUserGroups'),
                {
                    selected: [userGroups[0]],
                    options: userGroups,
                },
                screen
            )
            uiAssertions.expectRadioFieldToExist(
                'notificationType',
                [
                    {
                        label: 'Collective summary',
                        checked:
                            validationNotificationTemplate.sendStrategy ===
                            'COLLECTIVE_SUMMARY',
                    },
                    {
                        label: 'Single notification',
                        checked:
                            validationNotificationTemplate.sendStrategy ===
                            'SINGLE_NOTIFICATION',
                    },
                ],
                screen
            )
            uiAssertions.expectCheckboxFieldToExist(
                'notifyUsersInHierarchyOnly',
                validationNotificationTemplate.notifyUsersInHierarchyOnly,
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

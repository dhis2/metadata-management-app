import { faker } from '@faker-js/faker'
import { render, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import schemaMock from '../../__mocks__/schema/dataSetNotificationTemplatesSchema.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import { SECTIONS_MAP } from '../../lib'
import {
    randomLongString,
    testDataSet,
    testUserGroup,
    testDataSetNotificationTemplateForm as testDataSetNotificationTemplate,
} from '../../testUtils/builders'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { uiAssertions } from '../../testUtils/uiAssertions'
import { Component as Edit } from './Edit'
import { DATA_SET_VARIABLES } from './form/DataSetNotificationsFormFields'
import { Component as New } from './New'

const section = SECTIONS_MAP.dataSetNotificationTemplate
const mockSchema = schemaMock
const VALIDATION_RULES = Object.keys(DATA_SET_VARIABLES)

jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))

describe('DataSetNotificationTemplate form tests', () => {
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
            (
                routeOptions,
                { matchingExistingElementFilter = undefined } = {}
            ) => {
                const dataSets = [testDataSet(), testDataSet()]
                const userGroups = [testUserGroup(), testUserGroup()]
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            dataSets: () => ({ pager: { total: 1 }, dataSets }),
                            userGroups: () => ({
                                pager: { total: 1 },
                                userGroups,
                            }),
                            dataSetNotificationTemplates: (
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
                                            dataSetNotificationTemplates: [
                                                testDataSetNotificationTemplate(),
                                            ],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        dataSetNotificationTemplates: [],
                                    }
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <New />
                    </TestComponentWithRouter>
                )
                return { screen, userGroups, dataSets }
            }
        )

        afterEach(() => {
            jest.clearAllMocks()
        })

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
                'formfields-messageTemplate',
                'Required',
                screen,
                { skipClassCheck: true }
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

        it('should show error if code too long', async () => {
            const { screen } = await renderForm()
            const longText = randomLongString(51)
            await uiActions.enterCode(longText, screen)
            await uiAssertions.expectCodeToErrorWhenExceedsLength(screen)
            await uiActions.submitForm(screen)
            expect(createMock).not.toHaveBeenCalled()
        })
        it('should show error if subject template is too long', async () => {
            const { screen } = await renderForm()
            const longText = randomLongString(101)
            await uiActions.enterInputFieldValue(
                'subjectTemplate',
                longText,
                screen
            )
            // await uiAssertions.expectCodeToErrorWhenExceedsLength(screen)
            await uiAssertions.expectInputToErrorWhenExceedsLength(
                'subjectTemplate',
                100,
                screen,
                { skipClassCheck: true }
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
        it.each([
            ['4', '4', 'After'],
            ['3.5', '3', 'After'],
            [' ', '', 'After'],
            ['-3', '3', 'Before'],
        ])(
            'takes value of %s sanitises it to %s, %s scheduled date',
            async (textInput, outputNumber, outputBeforeAfter) => {
                const { screen } = await renderForm()

                await uiActions.pickRadioField(
                    'dataSetNotificationTrigger',
                    'Scheduled days',
                    screen
                )
                await uiActions.enterInputFieldValue(
                    'relativeScheduledDays',
                    textInput,
                    screen,
                    { type: 'spinbutton' }
                )
                uiAssertions.expectInputFieldToExist(
                    'relativeScheduledDays',
                    outputNumber,
                    screen,
                    'spinbutton'
                )
                uiAssertions.expectRadioFieldToExist(
                    'beforeOrAfter',
                    [
                        {
                            label: 'Before',
                            checked: outputBeforeAfter === 'Before',
                        },
                        {
                            label: 'After',
                            checked: outputBeforeAfter === 'After',
                        },
                    ],
                    screen
                )
            }
        )
        it('shows notificationDays input only if notification is scheduled days', async () => {
            // select scheduled days
            const { screen } = await renderForm()
            // select 'Scheduled days'
            await uiActions.pickRadioField(
                'dataSetNotificationTrigger',
                'Scheduled days',
                screen
            )

            // assert that scheduled days selector is in document
            expect(
                screen.getByTestId('scheduledDaysSelector')
            ).toBeInTheDocument()
            // select 'Data set completion'
            await uiActions.pickRadioField(
                'dataSetNotificationTrigger',
                'Data set completion',
                screen
            )

            // assert that scheduled days selector is not in document
            expect(screen.queryByTestId('scheduledDaysSelector')).toBe(null)
        })
        it('shows appropriate fields based on recipient type', async () => {
            // if user group is selected as recipient, then user group selector is present and notifyUsersInHierarchyOnly
            // select scheduled days
            const { screen, userGroups } = await renderForm()

            // select 'User group'
            await uiActions.pickRadioField(
                'notification-recipient',
                'User group',
                screen
            )

            // if User group contact is selected as recipient, then user group selector is present and notifyUsersInHierarchyOnly
            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-recipientUserGroup'),
                {
                    options: userGroups.map(
                        ({ displayName }: { displayName: string }) => ({
                            displayName,
                        })
                    ),
                },
                screen
            )
            uiAssertions.expectCheckboxFieldToExist(
                'notifyUsersInHierarchyOnly',
                false,
                screen
            )
            expect(screen.queryByTestId('formFields-sendEmail')).toBe(null)
            expect(screen.queryByTestId('formFields-sendSms')).toBe(null)

            // select 'Organisation unit contact'
            await uiActions.pickRadioField(
                'notification-recipient',
                'Organisation unit contact',
                screen
            )

            // if Organisation unit contact is selected as recipient, then user group selector is not, delivery channels are present

            expect(screen.queryByTestId('formfields-recipientUserGroup')).toBe(
                null
            )
            expect(
                screen.queryByTestId('formfields-notifyUsersInHierarchyOnly')
            ).toBe(null)
            uiAssertions.expectCheckboxFieldToExist('sendEmail', false, screen)
            uiAssertions.expectCheckboxFieldToExist('sendSms', false, screen)
        })
    })

    describe('New', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (
                routeOptions,
                { matchingExistingElementFilter = undefined } = {}
            ) => {
                const dataSets = [testDataSet(), testDataSet()]
                const userGroups = [testUserGroup(), testUserGroup()]
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            dataSets: () => ({ pager: { total: 1 }, dataSets }),
                            userGroups: () => ({
                                pager: { total: 1 },
                                userGroups,
                            }),
                            dataSetNotificationTemplates: (
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
                                            dataSetNotificationTemplates: [
                                                testDataSetNotificationTemplate(),
                                            ],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        dataSetNotificationTemplates: [],
                                    }
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <New />
                    </TestComponentWithRouter>
                )
                return { screen, userGroups, dataSets }
            }
        )

        afterEach(() => {
            jest.clearAllMocks()
        })

        it('contains all needed fields', async () => {
            const { screen, dataSets } = await renderForm()
            // default selections
            uiAssertions.expectNameFieldExist('', screen)
            uiAssertions.expectCodeFieldExist('', screen)
            await uiAssertions.expectTransferFieldToExistWithOptions(
                'formfields-dataSets',
                {
                    lhs: dataSets,
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
            uiAssertions.expectRadioFieldToExist(
                'dataSetNotificationTrigger',
                [
                    { label: 'Data set completion', checked: false },
                    { label: 'Scheduled days', checked: false },
                ],
                screen
            )

            uiAssertions.expectRadioFieldToExist(
                'notification-recipient',
                [
                    { label: 'User group', checked: false },
                    { label: 'Organisation unit contact', checked: false },
                ],
                screen
            )
        })

        it('submits basic info', async () => {
            const aName = faker.word.words()
            const aCode = faker.science.chemicalElement().symbol
            const aSubject = faker.animal.crocodilia()
            const aMessage = faker.company.buzzPhrase()

            const { screen, dataSets, userGroups } = await renderForm()
            const userGroupsSelectIndex = Math.floor(
                Math.random() * userGroups.length
            )
            await uiActions.enterName(aName, screen)
            await uiActions.enterCode(aCode, screen)
            await uiActions.pickOptionInTransfer(
                'formfields-dataSets',
                dataSets[1].displayName,
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
            await uiActions.pickRadioField(
                'dataSetNotificationTrigger',
                'Scheduled days',
                screen
            )

            await uiActions.enterInputFieldValue(
                'relativeScheduledDays',
                '3',
                screen,
                { type: 'spinbutton' }
            )
            await uiActions.pickRadioField(
                'notification-recipient',
                'User group',
                screen
            )

            await uiActions.pickOptionFromSelect(
                screen.getByTestId('formfields-recipientUserGroup'),
                userGroupsSelectIndex,
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
                        dataSets: [
                            expect.objectContaining({
                                id: dataSets[1].id,
                            }),
                        ],
                        subjectTemplate: aSubject,
                        messageTemplate: aMessage,
                        sendStrategy: undefined,
                        notificationRecipient: 'USER_GROUP',
                        recipientUserGroup: {
                            id: userGroups[userGroupsSelectIndex].id,
                        },
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
                const userGroups = [testUserGroup(), testUserGroup()]
                const dataSets = [testDataSet(), testDataSet()]
                const dataSetNotificationTemplate = {
                    ...testDataSetNotificationTemplate(),
                    dataSetNotificationTrigger: 'SCHEDULED_DAYS',
                    notificationRecipient: 'USER_GROUP',
                }

                dataSetNotificationTemplate.recipientUserGroup = {
                    id: userGroups[0].id,
                }
                dataSetNotificationTemplate.dataSets = [dataSets[0]]
                const id = dataSetNotificationTemplate.id
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}/:id`}
                        initialEntries={[`/${section.namePlural}/${id}`]}
                        customData={{
                            dataSets: () => ({
                                dataSets,
                                pager: {},
                            }),
                            userGroups: () => ({ userGroups, pager: {} }),
                            dataSetNotificationTemplates: (
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
                                            ...dataSetNotificationTemplate,
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        dataSetNotificationTemplates: [],
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
                    dataSets,
                    dataSetNotificationTemplate,
                }
            }
        )

        afterEach(() => {
            jest.clearAllMocks()
        })

        it('renders with prefilled values', async () => {
            const {
                screen,
                dataSetNotificationTemplate,
                dataSets,
                userGroups,
            } = await renderForm()
            uiAssertions.expectNameFieldExist(
                dataSetNotificationTemplate.name,
                screen
            )
            uiAssertions.expectCodeFieldExist(
                dataSetNotificationTemplate.code,
                screen
            )
            await uiAssertions.expectTransferFieldToExistWithOptions(
                'formfields-dataSets',
                {
                    lhs: [dataSets[1]],
                    rhs: [dataSets[0]],
                },
                screen
            )
            uiAssertions.expectInputFieldToExist(
                'subjectTemplate',
                dataSetNotificationTemplate.subjectTemplate,
                screen
            )
            uiAssertions.expectTextAreaFieldToExist(
                'messageTemplate',
                dataSetNotificationTemplate.messageTemplate,
                screen
            )
            uiAssertions.expectRadioFieldToExist(
                'dataSetNotificationTrigger',
                [
                    { label: 'Data set completion', checked: false },
                    { label: 'Scheduled days', checked: true },
                ],
                screen
            )

            uiAssertions.expectRadioFieldToExist(
                'notification-recipient',
                [
                    { label: 'User group', checked: true },
                    { label: 'Organisation unit contact', checked: false },
                ],
                screen
            )

            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-recipientUserGroup'),
                {
                    options: userGroups.map(
                        ({ displayName }: { displayName: string }) => ({
                            displayName,
                        })
                    ),
                    selected: userGroups[0].displayName,
                },
                screen
            )
            uiAssertions.expectCheckboxFieldToExist(
                'notifyUsersInHierarchyOnly',
                dataSetNotificationTemplate.notifyUsersInHierarchyOnly,
                screen
            )
        })

        it('submits updated code', async () => {
            const { screen, dataSetNotificationTemplate } = await renderForm()
            const newCode = faker.word.words()
            await uiActions.enterCode(newCode, screen)
            await uiActions.submitForm(screen)
            expect(updateMock).toHaveBeenCalledWith({
                data: [{ op: 'replace', path: '/code', value: newCode }],
                id: dataSetNotificationTemplate.id,
                params: undefined,
                resource: 'dataSetNotificationTemplates',
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
            await uiActions.submitForm(screen)
            expect(updateMock).not.toHaveBeenCalled()
        })
    })
})

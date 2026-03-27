import { FetchError } from '@dhis2/app-runtime'
import { render, waitFor, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import { getSchemaProperty } from '../components/sectionList/modelValue/ModelValue'
import { longTextFields } from '../components/sectionList/translation/TranslatableFields'
import { getTranslateableFieldsForSchema } from '../components/sectionList/translation/TranslationForm'
import {
    defaultModelViewConfig,
    modelListViewsConfig,
    ModelPropertyConfig,
    Schema,
    toModelPropertyDescriptor,
    BaseListModel,
} from '../lib'
import { camelCaseToConstantCase } from '../lib/utils'
import {
    testAccess,
    testLocale,
    testUser,
    testUserGroup,
} from '../testUtils/builders'
import {
    defaultUserDataStoreData,
    error404,
    generateRenderer,
} from '../testUtils/generateRenderer'
import TestComponentWithRouter from '../testUtils/TestComponentWithRouter'
import { uiActions } from '../testUtils/uiActions'
import { ModelSection } from '../types'
import { DefaultSectionListProps } from './DefaultSectionList'

type TestConfig = {
    section: ModelSection
    mockSchema: Record<any, any>
    ComponentToTest: (props: DefaultSectionListProps) => React.ReactElement
    generateRandomElement: (values?: Record<any, any>) => Record<any, any>
    customData: Record<any, any>
}

const originalWarn = console.warn

jest.spyOn(console, 'warn').mockImplementation((value) => {
    if (!value.match(/No server timezone/)) {
        originalWarn(value)
    }
})

export const generateDefaultListTests = (testConfigs: TestConfig) => {
    if (testConfigs.section !== undefined) {
        generateDefaultListItemsTests(testConfigs)
        generateDefaultListRowActionsTests(testConfigs)
        generateDefaultListMultiActionsTests(testConfigs)
        generateDefaultListFiltersTests(testConfigs)
    } else {
        it('should have a fake test as a placeholder', () => {})
    }
}

export const generateDefaultListItemsTests = ({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
}: TestConfig) => {
    const getElementsMock = jest.fn()

    const renderList = generateRenderer(
        { section, mockSchema },
        (routeOptions, { customTestData = {} } = {}) => {
            const elements = [
                generateRandomElement(),
                generateRandomElement(),
                generateRandomElement(),
                generateRandomElement(),
                generateRandomElement(),
                generateRandomElement(),
            ]
            const pager = {
                page: 1,
                total: elements.length,
                pageSize: 20,
                pageCount: Math.ceil(elements.length / 20),
            }

            const screen = render(
                <TestComponentWithRouter
                    path={`/${section.namePlural}`}
                    customData={{
                        [section.namePlural]: (type: any, params: any) => {
                            if (type === 'read') {
                                getElementsMock(params)
                                const pageSize =
                                    params?.params?.pageSize ?? pager.pageSize
                                return {
                                    [section.namePlural]: elements,
                                    pager: {
                                        ...pager,
                                        page:
                                            params?.params?.page ?? pager.page,
                                        pageSize:
                                            params?.params?.pageSize ??
                                            pager.pageSize,
                                        pageCount: Math.ceil(
                                            elements.length / pageSize
                                        ),
                                    },
                                }
                            }
                        },
                        userDataStore: defaultUserDataStoreData,
                        ...customData,
                        ...customTestData,
                    }}
                    routeOptions={routeOptions}
                >
                    <ComponentToTest />
                </TestComponentWithRouter>
            )
            return { screen, elements, pager }
        }
    )

    describe(`${section.namePlural} default list tests`, () => {
        beforeEach(() => {
            jest.resetAllMocks()
        })
        it('should display all the items in the first page', async () => {
            const { screen, elements } = await renderList()
            const tableRows = screen.getAllByTestId('section-list-row')
            expect(tableRows.length).toBe(elements.length)
            elements.forEach((element: Record<any, any>, index: number) => {
                expect(tableRows[index]).toHaveTextContent(element.displayName)
            })
        })
        it('should display the default columns', async () => {
            const { screen } = await renderList()
            const tableHeaders = screen.getAllByTestId(
                'dhis2-uicore-datatablecellhead'
            )
            const sectionName =
                section.name as keyof typeof modelListViewsConfig
            const configs = modelListViewsConfig[sectionName] as Record<
                string,
                any
            >
            const columnsToRender =
                configs?.columns?.default ??
                defaultModelViewConfig.columns.default
            expect(tableHeaders).toHaveLength(columnsToRender.length + 2)
            columnsToRender.forEach(
                (column: ModelPropertyConfig, index: number) => {
                    expect(tableHeaders[index + 1]).toHaveTextContent(
                        toModelPropertyDescriptor(column).label
                    )
                }
            )
        })
        xit('can change the visible columns through manage view', async () => {
            const { screen } = await renderList()
            await userEvent.click(
                await screen.findByTestId('manage-view-button')
            )
            await waitFor(() => {
                const manageViewModal = screen.getByTestId('manage-view-modal')
                expect(manageViewModal).toBeVisible()
            })
        })
        it('should use the pagination navigator', async () => {
            const { screen } = await renderList()
            const pages = await uiActions.openSingleSelect(
                screen.getByTestId('section-list-pagination-actions'),
                screen
            )
            await userEvent.click(pages[0])
            expect(getElementsMock).toHaveBeenCalledTimes(2)
            expect(getElementsMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    params: expect.objectContaining({
                        page: 1,
                        pageSize: 5,
                    }),
                })
            )
            await userEvent.click(
                screen.getByTestId('section-list-pagination-actions-page-next')
            )
            expect(getElementsMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    params: expect.objectContaining({
                        page: 2,
                        pageSize: 5,
                    }),
                })
            )
            await userEvent.click(
                screen.getByTestId(
                    'section-list-pagination-actions-page-previous'
                )
            )
            expect(getElementsMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    params: expect.objectContaining({
                        page: 1,
                        pageSize: 5,
                    }),
                })
            )
        })
        it('can sort the results by columns using a non case sensitive manner', async () => {
            const { screen } = await renderList()

            const tableHeaders = screen.getAllByTestId(
                'dhis2-uicore-datatablecellhead'
            )
            const sectionName =
                section.name as keyof typeof modelListViewsConfig
            const configs = modelListViewsConfig[sectionName] as Record<
                string,
                any
            >
            const columnsToRender =
                configs?.columns?.default ??
                defaultModelViewConfig.columns.default
            for (const [index, column] of columnsToRender.entries()) {
                const columnDescriptor = toModelPropertyDescriptor(column)
                const columnProperties = getSchemaProperty(
                    mockSchema as Schema,
                    columnDescriptor.path
                )
                if (columnProperties?.sortable) {
                    await userEvent.click(
                        within(tableHeaders[index + 1]).getByTestId(
                            'dhis2-uicore-tableheadercellaction'
                        )
                    )
                    expect(getElementsMock).toHaveBeenLastCalledWith(
                        expect.objectContaining({
                            params: expect.objectContaining({
                                order: `${columnDescriptor.path}:iasc`,
                            }),
                        })
                    )
                    await userEvent.click(
                        within(tableHeaders[index + 1]).getByTestId(
                            'dhis2-uicore-tableheadercellaction'
                        )
                    )
                    expect(getElementsMock).toHaveBeenLastCalledWith(
                        expect.objectContaining({
                            params: expect.objectContaining({
                                order: `${columnDescriptor.path}:idesc`,
                            }),
                        })
                    )
                }
            }
        })
        it('should display error when an API call fails', async () => {
            const customTestData = {
                [section.namePlural]: (type: any) => {
                    if (type === 'read') {
                        return Promise.reject(new FetchError(error404))
                    }
                },
            }

            const { screen } = await renderList({ customTestData })
            const tableRows = within(
                screen.getByTestId('dhis2-uicore-tablebody')
            ).getAllByTestId('dhis2-uicore-datatablerow')
            expect(tableRows).toHaveLength(1)
            const noticeBox = within(tableRows[0]).getByTestId(
                'dhis2-uicore-noticebox'
            )
            expect(noticeBox).toBeVisible()
            expect(noticeBox).toHaveTextContent(
                'An error occurred while loading the items.'
            )
        })
        it('should show message when no items found', async () => {
            const customTestData = {
                [section.namePlural]: (type: any) => {
                    if (type === 'read') {
                        return {
                            [section.namePlural]: [],
                        }
                    }
                },
            }

            const { screen } = await renderList({ customTestData })
            const tableRows = within(
                screen.getByTestId('dhis2-uicore-tablebody')
            ).getAllByTestId('dhis2-uicore-datatablerow')
            expect(tableRows).toHaveLength(1)
            expect(tableRows[0]).toHaveTextContent(
                "There aren't any items that match your filter."
            )
        })
    })
}

export const generateDefaultListRowActionsTests = ({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
}: TestConfig) => {
    const deleteMock = jest.fn()
    const updateTranslationsMock = jest.fn()

    const renderList = generateRenderer(
        { section, mockSchema },
        (
            routeOptions,
            {
                elements = [generateRandomElement(), generateRandomElement()],
            } = {}
        ) => {
            const pager = {
                page: 1,
                total: elements.length,
                pageSize: 20,
                pageCount: Math.ceil(elements.length / 20),
            }
            const locales = [testLocale(), testLocale(), testLocale()]

            const screen = render(
                <TestComponentWithRouter
                    path={`/${section.namePlural}`}
                    customData={{
                        ...customData,
                        [section.namePlural]: (type: any, params: any) => {
                            if (type === 'read' && params.id !== undefined) {
                                if (params.id.match(/translations/)) {
                                    return { translations: [] }
                                }

                                return elements.find(
                                    (element: Record<any, any>) =>
                                        element.id === params.id
                                )
                            }
                            if (type === 'read') {
                                return {
                                    [section.namePlural]: elements,
                                    pager,
                                }
                            }
                            if (type === 'delete') {
                                const deletedIndex = elements.findIndex(
                                    (e: Record<any, any>) => e.id === params.id
                                )
                                elements.splice(deletedIndex, 1)
                                deleteMock(params)
                                return { statusCode: 204 }
                            }
                            if (
                                type === 'replace' &&
                                params.id !== undefined &&
                                params.id.match(/translations/)
                            ) {
                                updateTranslationsMock(params)
                                return { statusCode: 204 }
                            }
                        },
                        sharing: {
                            meta: {
                                allowExternalAccess: false,
                                allowPublicAccess: false,
                            },
                            object: {
                                displayName: '',
                                externalAccess: false,
                                id: 'abc',
                                name: '',
                                publicAccess: 'rw------',
                                userAccesses: [],
                                userGroupAccesses: [],
                            },
                        },
                        'locales/db': () => {
                            return locales
                        },
                        userDataStore: defaultUserDataStoreData,
                    }}
                    routeOptions={routeOptions}
                >
                    <ComponentToTest />
                </TestComponentWithRouter>
            )
            return { screen, elements, pager, locales }
        }
    )

    describe(`${section.namePlural} default row actions tests`, () => {
        it('should display the default actions in the actions menu', async () => {
            const { screen } = await renderList()
            const tableRows = screen.getAllByTestId('section-list-row')
            const actionsMenu = await uiActions.openListElementActionsMenu(
                tableRows[1],
                screen
            )
            expect(actionsMenu).toHaveTextContent('Show details')
            expect(actionsMenu).toHaveTextContent('Edit')
            if (mockSchema.shareable) {
                expect(actionsMenu).toHaveTextContent('Sharing settings')
            } else {
                expect(actionsMenu).not.toHaveTextContent('Sharing settings')
            }
            if (mockSchema.translatable) {
                expect(actionsMenu).toHaveTextContent('Translate')
            } else {
                expect(actionsMenu).not.toHaveTextContent('Translate')
            }
            expect(actionsMenu).toHaveTextContent('Delete')
        })
        it('has a link to an edit page in the row actions menu', async () => {
            const elementsWithEditAccess = generateRandomElement({
                access: testAccess({ write: true }),
            })
            const elementsWithoutEditAccess = generateRandomElement({
                access: testAccess({ write: false }),
            })
            const { screen, elements } = await renderList({
                elements: [elementsWithEditAccess, elementsWithoutEditAccess],
            })
            const tableRows = screen.getAllByTestId('section-list-row')
            const editableElementActionMenu =
                await uiActions.openListElementActionsMenu(tableRows[0], screen)
            expect(
                within(editableElementActionMenu).getByText('Edit').closest('a')
            ).toHaveAttribute(
                'href',
                `/${section.namePlural}/${elements[0].id}`
            )
            await userEvent.click(
                within(tableRows[0]).getByTestId('row-actions-menu-button')
            )
            expect(editableElementActionMenu).not.toBeVisible()

            const nonEditableElementActionMenu =
                await uiActions.openListElementActionsMenu(tableRows[1], screen)
            expect(
                within(nonEditableElementActionMenu)
                    .getByText('Edit')
                    .closest('a')
            ).not.toHaveAttribute('href')
        })
        it('has a show details button as the default row action', async () => {
            const elementsWithEditAccess = generateRandomElement({
                access: testAccess({ write: true }),
            })
            const elementsWithoutEditAccess = generateRandomElement({
                access: testAccess({ write: false }),
            })
            const { screen } = await renderList({
                elements: [elementsWithEditAccess, elementsWithoutEditAccess],
            })
            const tableRows = screen.getAllByTestId('section-list-row')

            const editableRowShowDetailsButton = within(
                tableRows[0]
            ).getByTestId('row-show-details-action-button')
            const nonEditableRowShowDetailsButton = within(
                tableRows[1]
            ).getByTestId('row-show-details-action-button')
            expect(editableRowShowDetailsButton).toBeVisible()
            expect(nonEditableRowShowDetailsButton).toBeVisible()
        })
        it.skip('deletes an item when pressing the delete action and updates the list', async () => {
            const elementsWithDeleteAccess = generateRandomElement({
                access: testAccess({ delete: true }),
            })
            const elementsWithoutDeleteAccess = generateRandomElement({
                access: testAccess({ delete: false }),
            })
            const elements = [
                elementsWithDeleteAccess,
                elementsWithoutDeleteAccess,
            ]
            const { screen } = await renderList({
                elements,
            })
            const tableRows = screen.getAllByTestId('section-list-row')
            expect(tableRows).toHaveLength(2)

            const deletableElementActionMenu =
                await uiActions.openListElementActionsMenu(tableRows[0], screen)
            screen.getByTestId('row-actions-menu')

            const deleteConfirmationModal = await uiActions.openModal(
                within(deletableElementActionMenu).getByText('Delete'),
                'delete-confirmation-modal',
                screen
            )
            await userEvent.click(
                within(deleteConfirmationModal).getByRole('button', {
                    name: 'Confirm deletion',
                })
            )
            await waitFor(() => {
                expect(deleteMock).toHaveBeenCalledWith(
                    expect.objectContaining({ id: elementsWithDeleteAccess.id })
                )
            })

            const nonDeletableElementActionMenu =
                await uiActions.openListElementActionsMenu(tableRows[1], screen)
            expect(
                within(nonDeletableElementActionMenu)
                    .getByText('Delete')
                    .closest('li')
            ).toHaveClass('disabled')
            await userEvent.click(
                within(nonDeletableElementActionMenu).getByText('Delete')
            )
            expect(screen.queryByTestId('delete-confirmation-modal')).toBeNull()

            const tableRowsUpdated = screen.getAllByTestId('section-list-row')
            expect(tableRowsUpdated).toHaveLength(1)
        })
        it('shows the detail panel when the show details action is clicked', async () => {
            const element = generateRandomElement({
                access: testAccess({ write: true }),
            })
            const { screen } = await renderList({
                elements: [element],
            })
            const tableRows = screen.getAllByTestId('section-list-row')

            const actionsMenu = await uiActions.openListElementActionsMenu(
                tableRows[0],
                screen
            )
            await userEvent.click(within(actionsMenu).getByText('Show details'))
            const detailsPanel = await screen.findByTestId('details-panel')
            expect(detailsPanel).toBeVisible()
            expect(detailsPanel).toHaveTextContent(element.displayName)
            if (element.code) {
                expect(detailsPanel).toHaveTextContent(element.code)
            }
            expect(detailsPanel).toHaveTextContent(element.id)
            expect(detailsPanel).toHaveTextContent(
                element.createdBy!.displayName
            )
            expect(detailsPanel).toHaveTextContent(
                element.lastUpdatedBy!.displayName
            )
            expect(detailsPanel).toHaveTextContent(
                element.lastUpdatedBy.displayName
            )
            expect(
                within(detailsPanel).getByText('API URL link').closest('a')
            ).toHaveAttribute('href', element.href)
            const editButton = within(detailsPanel).getByTestId('link-button')
            expect(editButton).toHaveTextContent('Edit')
            expect(editButton).toHaveAttribute(
                'href',
                `/${section.namePlural}/${element.id}`
            )
        })
        it('should open the sharing settings dialog when the sharing settings action is clicked', async () => {
            if (mockSchema.shareable) {
                const element = generateRandomElement({
                    access: testAccess({ write: true }),
                })
                const { screen } = await renderList({
                    elements: [element],
                })
                const tableRows = screen.getAllByTestId('section-list-row')
                const actionsMenu = await uiActions.openListElementActionsMenu(
                    tableRows[0],
                    screen
                )
                await userEvent.click(
                    within(actionsMenu).getByText('Sharing settings')
                )
                const sharingSettingModal = await screen.findByTestId(
                    'dhis2-uicore-sharingdialog'
                )
                expect(sharingSettingModal).toBeVisible()
            }
        })
        xit('should update the list view when the sharing settings dialog is closed', () => {})
        it('should open a translation dialog when the translate action is clicked', async () => {
            if (mockSchema.translatable) {
                const element = generateRandomElement({
                    access: testAccess({ write: true }),
                })
                const { screen, locales } = await renderList({
                    elements: [element],
                })
                const tableRows = screen.getAllByTestId('section-list-row')
                const actionsMenu = await uiActions.openListElementActionsMenu(
                    tableRows[0],
                    screen
                )
                await userEvent.click(
                    within(actionsMenu).getByText('Translate')
                )
                const translationModal = await uiActions.openModal(
                    within(actionsMenu).getByText('Translate'),
                    'translation-dialog',
                    screen
                )

                const availableLanguages = await uiActions.openSingleSelect(
                    screen.getByTestId('translation-dialog-locale-select'),
                    screen
                )
                expect(availableLanguages).toHaveLength(locales.length)
                await userEvent.click(availableLanguages[1])

                let expectedTranslations = [] as {
                    locale: string
                    property: string
                    value: string
                }[]
                const fields = getTranslateableFieldsForSchema(
                    mockSchema as Schema,
                    {} as BaseListModel
                )

                for (const field of fields) {
                    const inputContainerId = longTextFields.includes(field)
                        ? 'dhis2-uicore-textarea'
                        : 'dhis2-uicore-input'
                    const inputContainer = within(
                        screen.getByTestId(`field-${field}-translation-content`)
                    ).getByTestId(inputContainerId)
                    const input = within(inputContainer).getByRole('textbox')
                    const translation = `translated ${field}`
                    expectedTranslations = [
                        ...expectedTranslations,
                        {
                            locale: locales[1].locale,
                            property: camelCaseToConstantCase(field),
                            value: translation,
                        },
                    ]
                    await userEvent.type(input, translation)
                }
                await userEvent.click(
                    within(translationModal).getByTestId(
                        'submit-translations-button'
                    )
                )
                expect(updateTranslationsMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: `${element.id}/translations`,
                        data: { translations: expectedTranslations },
                    })
                )
            }
        })
    })
}

export const generateDefaultListMultiActionsTests = ({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
}: TestConfig) => {
    const renderList = generateRenderer(
        { section, mockSchema },
        (
            routeOptions,
            {
                elements = [
                    generateRandomElement({
                        access: testAccess({ write: true }),
                    }),
                    generateRandomElement({
                        access: testAccess({ write: true }),
                    }),
                ],
                sharingUsers = [testUser(), testUser()],
                sharingUserGroups = [testUserGroup(), testUserGroup()],
            } = {}
        ) => {
            const pager = {
                page: 1,
                total: elements.length,
                pageSize: 20,
                pageCount: Math.ceil(elements.length / 20),
            }

            const screen = render(
                <TestComponentWithRouter
                    path={`/${section.namePlural}`}
                    customData={{
                        ...customData,
                        [section.namePlural]: (type: any, params: any) => {
                            if (type === 'read') {
                                return {
                                    [section.namePlural]: elements,
                                    pager,
                                }
                            }
                        },
                        'sharing/search': () => ({
                            userGroups: sharingUserGroups,
                            users: sharingUsers,
                        }),
                        userDataStore: defaultUserDataStoreData,
                    }}
                    routeOptions={routeOptions}
                >
                    <ComponentToTest />
                </TestComponentWithRouter>
            )

            return { screen, elements, sharingUsers, sharingUserGroups }
        }
    )

    describe(`${section.name} default multiple actions tests`, () => {
        it('should display the multiple actions banner when 1 or more items are selected on deselect all ', async () => {
            const { screen } = await renderList()
            const tableRows = screen.getAllByTestId('section-list-row')

            const firstRowCheckbox = within(tableRows[0]).getByTestId(
                'section-list-row-checkbox'
            )
            await userEvent.click(firstRowCheckbox)
            let toolbar = await screen.findByTestId('multi-actions-toolbar')
            expect(toolbar).toBeVisible()
            expect(toolbar).toHaveTextContent('1 selected')

            const secondRowCheckbox = within(tableRows[1]).getByTestId(
                'section-list-row-checkbox'
            )
            await userEvent.click(secondRowCheckbox)
            toolbar = await screen.findByTestId('multi-actions-toolbar')
            expect(toolbar).toBeVisible()
            await waitFor(() => expect(toolbar).toHaveTextContent('2 selected'))

            await userEvent.click(within(toolbar).getByText('Deselect all'))
            await waitFor(() => {
                expect(firstRowCheckbox).not.toBeChecked()
                expect(secondRowCheckbox).not.toBeChecked()
                expect(
                    screen.queryByTestId('multi-actions-toolbar')
                ).not.toBeInTheDocument()
            })
        })
        xit('should update sharing settings for multiple items', async () => {
            const resolvePromise = () => Promise.resolve({})
            if (mockSchema.shareable) {
                global.fetch = jest.fn(() =>
                    Promise.resolve({
                        ok: true,
                        json: resolvePromise,
                    })
                ) as jest.Mock
                const sharingUsers = [
                    testUser({ displayName: 'b' }),
                    testUser({ displayName: 'd' }),
                ]
                const sharingUserGroups = [
                    testUserGroup({ displayName: 'c' }),
                    testUser({ displayName: 'a' }),
                ]

                const { screen, elements } = await renderList({
                    sharingUsers,
                    sharingUserGroups,
                })
                const tableRows = screen.getAllByTestId('section-list-row')

                await userEvent.click(
                    within(tableRows[0]).getByTestId(
                        'section-list-row-checkbox'
                    )
                )
                await userEvent.click(
                    within(tableRows[1]).getByTestId(
                        'section-list-row-checkbox'
                    )
                )
                const toolbar = screen.getByTestId('multi-actions-toolbar')
                expect(toolbar).toBeVisible()

                await uiActions.openModal(
                    within(toolbar).getByText('Update sharing'),
                    'bulk-sharing-dialog',
                    screen
                )

                const options = await uiActions.openSingleSelect(
                    screen.getByTestId('sharing-search-select'),
                    screen
                )
                expect(options).toHaveLength(
                    sharingUsers.length + sharingUserGroups.length
                )
                await userEvent.click(options[1])

                const accessOptions = await uiActions.openSingleSelect(
                    screen.getByTestId('metadata-access-select'),
                    screen
                )
                expect(accessOptions).toHaveLength(2)
                expect(accessOptions[0]).toHaveTextContent('Edit and view')
                expect(accessOptions[1]).toHaveTextContent('View only')
                await userEvent.click(accessOptions[0])

                await userEvent.click(
                    screen.getByTestId('add-to-sharing-actions-button')
                )
                await userEvent.click(
                    screen.getByTestId('update-sharing-button')
                )

                expect(global.fetch).toHaveBeenCalledWith(
                    `http://dhis2-imaginary-test-server/api/${section.namePlural}/sharing`,
                    expect.objectContaining({
                        body: JSON.stringify({
                            [section.namePlural]: [
                                elements[0].id,
                                elements[1].id,
                            ],
                            patch: [
                                {
                                    op: 'replace',
                                    path: `/sharing/users/${sharingUsers[0].id}`,
                                    value: {
                                        access: 'rw------',
                                        id: sharingUsers[0].id,
                                    },
                                },
                            ],
                        }),
                    })
                )
            }
        })
        it.skip('should download multiple items', async () => {
            const { screen, elements } = await renderList()
            const tableRows = screen.getAllByTestId('section-list-row')

            await userEvent.click(
                within(tableRows[0]).getByTestId('section-list-row-checkbox')
            )
            await userEvent.click(
                within(tableRows[1]).getByTestId('section-list-row-checkbox')
            )
            const toolbar = await screen.findByTestId('multi-actions-toolbar')
            expect(toolbar).toBeVisible()

            const downloadModal = await uiActions.openModal(
                within(toolbar).getByText('Download'),
                'download-modal',
                screen
            )
            const downloadModelsSelector = within(downloadModal).getByTestId(
                'download-models-to-include'
            )
            const radios = within(downloadModelsSelector).getAllByRole('radio')
            const selectedRadio = radios.find(
                (radio) => (radio as HTMLInputElement).checked
            )
            expect(selectedRadio).not.toBeNull()
            expect(selectedRadio!.closest('label')).toHaveTextContent(
                'Only selected (2)'
            )

            const downloadButton = within(downloadModal).getByTestId(
                'download-dialog-link'
            )
            expect(downloadButton).toHaveAttribute(
                'href',
                `http://dhis2-imaginary-test-server/api/metadata.json.zip?${section.namePlural}=true&download=true&skipSharing=false&filter=id%3Ain%3A%5B${elements[0].id}%2C${elements[1].id}%5D`
            )
        })
    })
}

export const generateDefaultListFiltersTests = ({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
}: TestConfig) => {
    const getElementsMock = jest.fn()

    const renderList = generateRenderer(
        { section, mockSchema },
        (routeOptions) => {
            const elements = [
                generateRandomElement(),
                generateRandomElement(),
                generateRandomElement(),
                generateRandomElement(),
                generateRandomElement(),
                generateRandomElement(),
            ]
            const pager = {
                page: 1,
                total: elements.length,
                pageSize: 20,
                pageCount: Math.ceil(elements.length / 20),
            }

            const screen = render(
                <TestComponentWithRouter
                    path={`/${section.namePlural}`}
                    customData={{
                        [section.namePlural]: (type: any, params: any) => {
                            if (type === 'read') {
                                getElementsMock(params)
                                return {
                                    [section.namePlural]: elements,
                                    pager,
                                }
                            }
                        },
                        userDataStore: defaultUserDataStoreData,
                        ...customData,
                    }}
                    routeOptions={routeOptions}
                >
                    <ComponentToTest />
                </TestComponentWithRouter>
            )

            return { screen, elements, pager }
        }
    )

    describe(`${section.namePlural} default filter tests`, () => {
        beforeEach(() => {
            jest.resetAllMocks()
        })

        it('can filter the results by identifiable using the input field', async () => {
            const { screen } = await renderList()
            const filtersWrapper = screen.getByTestId('filters-wrapper')
            const filterText = 'abc'
            const identifiableFilterInput = within(
                within(filtersWrapper).getByTestId('input-search-name')
            ).getByRole('textbox')
            await userEvent.type(identifiableFilterInput, filterText)
            await waitFor(() => {
                expect(getElementsMock).toHaveBeenCalledTimes(2)
            })
            expect(getElementsMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    params: expect.objectContaining({
                        filter: expect.arrayContaining([
                            'identifiable:token:abc',
                        ]),
                    }),
                })
            )
        })

        it('can clear identifiable filter with clear all filters button', async () => {
            const { screen } = await renderList()
            const filtersWrapper = screen.getByTestId('filters-wrapper')
            const identifiableFilterInput = within(
                within(filtersWrapper).getByTestId('input-search-name')
            ).getByRole('textbox')
            await userEvent.type(identifiableFilterInput, 'lalala')
            await waitFor(() => {
                expect(getElementsMock).toHaveBeenCalledTimes(2)
            })

            const clearFiltersButton = within(filtersWrapper).getByTestId(
                'clear-all-filters-button'
            )
            await userEvent.click(clearFiltersButton)
            await waitFor(() => {
                expect(identifiableFilterInput).toHaveValue('')
            })

            expect(getElementsMock).toHaveBeenCalledTimes(3)
            expect(getElementsMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    params: expect.objectContaining({
                        filter: expect.not.arrayContaining([
                            'identifiable:token:abc',
                        ]),
                    }),
                })
            )
        })
        it('should display the default filters', async () => {
            const { screen } = await renderList()
            const filtersWrapper = screen.getByTestId('filters-wrapper')
            const sectionName =
                section.name as keyof typeof modelListViewsConfig
            const configs = modelListViewsConfig[sectionName] as Record<
                string,
                any
            >
            const filtersToRender = configs?.filters?.default
            if (filtersToRender?.length > 0) {
                expect(
                    within(filtersWrapper).getAllByTestId('dynamic-filter')
                ).toHaveLength(filtersToRender.length)
            } else {
                expect(
                    within(filtersWrapper).queryByTestId('dynamic-filter')
                ).toBeNull()
            }
        })
        xit('can change the visible filters through manage view', () => {})
        xit('can remove all filters through manage view', () => {})
    })
}

import { faker } from '@faker-js/faker'
import {
    render,
    waitFor,
    waitForElementToBeRemoved,
    within,
} from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import organisationUnitsSchemaMock from '../../__mocks__/schema/organisationUnitsSchema.json'
import { getRelativeTime, ModelSchemas, SECTIONS_MAP } from '../../lib'
import { useSchemaStore } from '../../lib/schemas/schemaStore'
import { useCurrentUserStore } from '../../lib/user/currentUserStore'
import { testAccess, testOrgUnit } from '../../testUtils/builders'
import { defaultUserDataStoreData } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import type { OrganisationUnit } from '../../types/generated'
import { Component as OrgUnitsList } from './List'

const deleteOrgUnitMock = jest.fn()
const renderList = async ({
    rootOrgUnits = [testOrgUnit()] as Partial<OrganisationUnit>[],
    otherOrgUnits = [] as Partial<OrganisationUnit>[],
    userDataStore = defaultUserDataStoreData,
}) => {
    const routeOptions = {
        handle: { section: SECTIONS_MAP.organisationUnit },
    }

    const organisationUnits = [...otherOrgUnits, ...rootOrgUnits]

    useSchemaStore.getState().setSchemas({
        organisationUnit: organisationUnitsSchemaMock,
    } as unknown as ModelSchemas)

    useCurrentUserStore.getState().setCurrentUser({
        organisationUnits: rootOrgUnits as OrganisationUnit[],
        authorities: new Set(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        settings: {},
    })

    const result = render(
        <TestComponentWithRouter
            path="/organisationUnits"
            customData={{
                organisationUnits: (type: any, params: any) => {
                    if (type === 'read' && params.id !== undefined) {
                        const foundOrgUnit = organisationUnits.find(
                            (ou) => ou.id === params.id
                        )
                        return foundOrgUnit
                    }
                    if (type === 'read') {
                        const regex = /:(\w+)$/
                        const orgUnitFilter =
                            params.params.filter[0].match(regex)[1]
                        const filteredOrgUnits = organisationUnits.filter(
                            (ou) =>
                                ou.id === orgUnitFilter ||
                                ou.parent?.id === orgUnitFilter
                        )
                        return { organisationUnits: filteredOrgUnits }
                    }
                    if (type === 'delete') {
                        deleteOrgUnitMock(params)
                        return { statusCode: 204 }
                    }
                },
                userDataStore,
            }}
            routeOptions={routeOptions}
        >
            <OrgUnitsList />
        </TestComponentWithRouter>
    )

    await waitForElementToBeRemoved(() =>
        result.queryByTestId('dhis2-uicore-circularloader')
    )
    return result
}

describe('Organisation unit list', () => {
    const originalWarn = console.warn
    jest.spyOn(console, 'warn').mockImplementation((value) => {
        if (!value.match(/No server timezone/)) {
            originalWarn(value)
        }
    })

    it('should show every org unit in the right order', async () => {
        const rootOrg1 = testOrgUnit({
            level: 1,
            childCount: 2,
            displayName: 'Root1',
        })
        const rootOrg2 = testOrgUnit({
            level: 2,
            childCount: 1,
            displayName: 'Root2',
        })

        const root1Level2Child1 = testOrgUnit({
            level: 2,
            ancestors: [rootOrg1],
            parentId: rootOrg1.id,
            childCount: 1,
            displayName: 'Root1Level2A',
        })
        const root1Level2Child2 = testOrgUnit({
            level: 2,
            ancestors: [rootOrg1],
            parentId: rootOrg1.id,
            childCount: 0,
            displayName: 'Root1Level2B',
        })
        const root1Level3Child1 = testOrgUnit({
            level: 3,
            ancestors: [rootOrg1, root1Level2Child1],
            parentId: root1Level2Child1.id,
            childCount: 0,
            displayName: 'Root1Level3A',
        })
        const root2Level3Child = testOrgUnit({
            level: 3,
            ancestors: [rootOrg2],
            parentId: rootOrg2.id,
            childCount: 0,
            displayName: 'Root2Level3A',
        })

        const screen = await renderList({
            rootOrgUnits: [rootOrg1, rootOrg2],
            otherOrgUnits: [
                root1Level2Child1,
                root1Level2Child2,
                root1Level3Child1,
                root2Level3Child,
            ],
        })

        const tableRows = screen.getAllByTestId('dhis2-uicore-datatablerow')
        expect(tableRows.length).toBe(6)

        expect(tableRows[0]).toHaveTextContent('Name')
        expect(tableRows[0]).toHaveTextContent('Code')
        expect(tableRows[0]).toHaveTextContent('Last updated')
        expect(tableRows[0]).toHaveTextContent('Actions')

        expect(tableRows[1]).toHaveTextContent(rootOrg1.displayName!)
        expect(tableRows[1]).toHaveTextContent(rootOrg1.code!)
        expect(tableRows[1]).toHaveTextContent(
            getRelativeTime(new Date(rootOrg1.lastUpdated!))
        )

        expect(tableRows[2]).toHaveTextContent(root1Level2Child1.displayName!)
        expect(tableRows[2]).toHaveTextContent(root1Level2Child1.code!)
        expect(tableRows[2]).toHaveTextContent(
            getRelativeTime(new Date(root1Level2Child1.lastUpdated!))
        )

        expect(tableRows[3]).toHaveTextContent(root1Level2Child2.displayName!)
        expect(tableRows[3]).toHaveTextContent(root1Level2Child2.code!)
        expect(tableRows[3]).toHaveTextContent(
            getRelativeTime(new Date(root1Level2Child2.lastUpdated!))
        )

        expect(tableRows[4]).toHaveTextContent(rootOrg2.displayName!)
        expect(tableRows[4]).toHaveTextContent(rootOrg2.code!)
        expect(tableRows[4]).toHaveTextContent(
            getRelativeTime(new Date(rootOrg2.lastUpdated!))
        )

        expect(tableRows[5]).toHaveTextContent(root2Level3Child.displayName!)
        expect(tableRows[5]).toHaveTextContent(root2Level3Child.code!)
        expect(tableRows[5]).toHaveTextContent(
            getRelativeTime(new Date(root2Level3Child.lastUpdated!))
        )
    })

    it('should collapse visible tree nodes', async () => {
        const rootOrg1 = testOrgUnit({ level: 1, childCount: 2 })
        const rootOrg2 = testOrgUnit({ level: 2, childCount: 1 })

        const root1Level2Child1 = testOrgUnit({
            level: 2,
            ancestors: [rootOrg1],
            parentId: rootOrg1.id,
            childCount: 1,
            displayName: 'Root1Level2A',
        })
        const root1Level2Child2 = testOrgUnit({
            level: 2,
            ancestors: [rootOrg1],
            parentId: rootOrg1.id,
            childCount: 0,
            displayName: 'Root1Level2B',
        })
        const root1Level3Child1 = testOrgUnit({
            level: 3,
            ancestors: [rootOrg1, root1Level2Child1],
            parentId: root1Level2Child1.id,
            childCount: 0,
            displayName: 'Root1Level3A',
        })
        const root2Level3Child = testOrgUnit({
            level: 3,
            ancestors: [rootOrg2],
            parentId: rootOrg2.id,
            childCount: 0,
            displayName: 'Root2Level3A',
        })

        const screen = await renderList({
            rootOrgUnits: [rootOrg1, rootOrg2],
            otherOrgUnits: [
                root1Level2Child1,
                root1Level2Child2,
                root1Level3Child1,
                root2Level3Child,
            ],
        })

        const tableRows = screen.getAllByTestId('dhis2-uicore-datatablerow')
        expect(tableRows.length).toBe(6)

        const rootOrg2Row = tableRows[4]
        const rootOrg2RowExpandIcon =
            within(rootOrg2Row).getByTestId('row-expand-icon')
        await userEvent.click(rootOrg2RowExpandIcon)

        const tableRowsRefreshed = await screen.findAllByTestId(
            'dhis2-uicore-datatablerow'
        )
        expect(tableRowsRefreshed.length).toBe(5)

        expect(tableRows[1]).toHaveTextContent(rootOrg1.displayName!)
        expect(tableRows[2]).toHaveTextContent(root1Level2Child1.displayName!)
        expect(tableRows[3]).toHaveTextContent(root1Level2Child2.displayName!)
        expect(tableRows[4]).toHaveTextContent(rootOrg2.displayName!)
    })

    it('should expand a node tree', async () => {
        const rootOrg1 = testOrgUnit({ level: 1, childCount: 2 })
        const rootOrg2 = testOrgUnit({ level: 2, childCount: 1 })

        const root1Level2Child1 = testOrgUnit({
            level: 2,
            ancestors: [rootOrg1],
            parentId: rootOrg1.id,
            childCount: 1,
            displayName: 'Root1Level2A',
        })
        const root1Level2Child2 = testOrgUnit({
            level: 2,
            ancestors: [rootOrg1],
            parentId: rootOrg1.id,
            childCount: 0,
            displayName: 'Root1Level2B',
        })
        const root1Level3Child1 = testOrgUnit({
            level: 3,
            ancestors: [rootOrg1, root1Level2Child1],
            parentId: root1Level2Child1.id,
            childCount: 0,
            displayName: 'Root1Level3A',
        })
        const root2Level3Child = testOrgUnit({
            level: 3,
            ancestors: [rootOrg2],
            parentId: rootOrg2.id,
            childCount: 0,
            displayName: 'Root2Level3A',
        })

        const screen = await renderList({
            rootOrgUnits: [rootOrg1, rootOrg2],
            otherOrgUnits: [
                root1Level2Child1,
                root1Level2Child2,
                root1Level3Child1,
                root2Level3Child,
            ],
        })

        const tableRows = screen.getAllByTestId('dhis2-uicore-datatablerow')
        expect(tableRows.length).toBe(6)

        const root1Level2Child1Row = tableRows[2]
        const rootOrg2RowExpandIcon =
            within(root1Level2Child1Row).getByTestId('row-expand-icon')
        await userEvent.click(rootOrg2RowExpandIcon)

        let tableRowsRefreshed: any = []
        await waitFor(() => {
            tableRowsRefreshed = screen.getAllByTestId(
                'dhis2-uicore-datatablerow'
            )
            expect(tableRowsRefreshed.length).toBe(7)
        })

        expect(tableRowsRefreshed[1]).toHaveTextContent(rootOrg1.displayName!)
        expect(tableRowsRefreshed[2]).toHaveTextContent(
            root1Level2Child1.displayName!
        )
        expect(tableRowsRefreshed[3]).toHaveTextContent(
            root1Level3Child1.displayName!
        )
        expect(tableRowsRefreshed[4]).toHaveTextContent(
            root1Level2Child2.displayName!
        )
        expect(tableRowsRefreshed[5]).toHaveTextContent(rootOrg2.displayName!)
        expect(tableRowsRefreshed[6]).toHaveTextContent(
            root2Level3Child.displayName!
        )
    })

    it('should show a clickable delete action when org unit can be deleted', async () => {
        const rootOrg = testOrgUnit({
            level: 1,
            childCount: 0,
            access: testAccess({ delete: true }),
        })

        const screen = await renderList({
            rootOrgUnits: [rootOrg],
        })

        const tableRows = screen.getAllByTestId('dhis2-uicore-datatablerow')
        expect(tableRows.length).toBe(2)

        expect(tableRows[1]).toHaveTextContent(rootOrg.displayName!)
        const actionButton = within(tableRows[1]).getByTestId(
            'row-actions-menu-button'
        )
        await userEvent.click(actionButton)
        const actionsMenu = screen.getByTestId('row-actions-menu')
        expect(actionsMenu).toBeVisible()
        expect(
            within(actionsMenu).getByText('Delete').closest('li')
        ).not.toHaveClass('disabled')
    })

    it('should show a disabled delete action when org unit can not be deleted', async () => {
        const rootOrg = testOrgUnit({
            level: 1,
            childCount: 0,
            access: testAccess({ delete: false }),
        })

        const screen = await renderList({
            rootOrgUnits: [rootOrg],
        })

        const tableRows = screen.getAllByTestId('dhis2-uicore-datatablerow')
        expect(tableRows.length).toBe(2)

        expect(tableRows[1]).toHaveTextContent(rootOrg.displayName!)
        const actionButton = within(tableRows[1]).getByTestId(
            'row-actions-menu-button'
        )
        await userEvent.click(actionButton)
        const actionsMenu = screen.getByTestId('row-actions-menu')
        expect(actionsMenu).toBeVisible()
        expect(
            within(actionsMenu).getByText('Delete').closest('li')
        ).toHaveClass('disabled')
    })

    it('deletes an org unit when possible', async () => {
        const rootOrg = testOrgUnit({ level: 1, childCount: 2 })
        const child1 = testOrgUnit({
            level: 2,
            ancestors: [rootOrg],
            parentId: rootOrg.id,
            childCount: 0,
            access: testAccess({ delete: true }),
            displayName: 'ChildA',
        })
        const child2 = testOrgUnit({
            level: 2,
            ancestors: [rootOrg],
            parentId: rootOrg.id,
            childCount: 0,
            displayName: 'ChildB',
        })

        const screen = await renderList({
            rootOrgUnits: [rootOrg],
            otherOrgUnits: [child1, child2],
        })

        const tableRows = screen.getAllByTestId('dhis2-uicore-datatablerow')
        expect(tableRows.length).toBe(4)

        expect(tableRows[2]).toHaveTextContent(child1.displayName!)
        const actionButton = within(tableRows[2]).getByTestId(
            'row-actions-menu-button'
        )
        await userEvent.click(actionButton)
        const actionsMenu = screen.getByTestId('row-actions-menu')
        expect(actionsMenu).toBeVisible()
        await userEvent.click(within(actionsMenu).getByText('Delete'))

        const deleteConfirmationModal = await screen.findByTestId(
            'delete-confirmation-modal'
        )
        expect(deleteConfirmationModal).toBeVisible()

        await userEvent.click(
            within(deleteConfirmationModal).getByRole('button', {
                name: 'Confirm deletion',
            })
        )
        await waitFor(() => {
            expect(deleteOrgUnitMock).toHaveBeenCalledWith(
                expect.objectContaining({ id: child1.id })
            )
        })
    })

    it('has a link to an org unit edit page in the row actions menu', async () => {
        const rootOrg = testOrgUnit({
            level: 1,
            childCount: 2,
            access: testAccess({ delete: true }),
            displayName: 'ARoot1',
        })
        const child1 = testOrgUnit({
            level: 2,
            ancestors: [rootOrg],
            parentId: rootOrg.id,
            childCount: 0,
            access: testAccess({ delete: true }),
            displayName: 'ChildA',
        })
        const child2 = testOrgUnit({
            level: 2,
            ancestors: [rootOrg],
            parentId: rootOrg.id,
            childCount: 0,
            displayName: 'ChildB',
        })

        const screen = await renderList({
            rootOrgUnits: [rootOrg],
            otherOrgUnits: [child1, child2],
        })

        const tableRows = screen.getAllByTestId('dhis2-uicore-datatablerow')
        expect(tableRows.length).toBe(4)

        expect(tableRows[2]).toHaveTextContent(child1.displayName!)
        const actionButton = within(tableRows[2]).getByTestId(
            'row-actions-menu-button'
        )
        await userEvent.click(actionButton)
        const actionsMenu = screen.getByTestId('row-actions-menu')
        expect(actionsMenu).toBeVisible()
        expect(
            within(actionsMenu).getByText('Edit').closest('a')
        ).toHaveAttribute('href', `/organisationUnits/${child1.id}`)
    })

    it('has a button to open details panel', async () => {
        const rootOrg = testOrgUnit({
            level: 1,
            childCount: 2,
            access: testAccess({ delete: true }),
            displayName: 'ARoot1',
        })
        const child1 = testOrgUnit({
            level: 2,
            ancestors: [rootOrg],
            parentId: rootOrg.id,
            childCount: 0,
            access: testAccess({ delete: true }),
            displayName: 'ChildA',
        })
        const child2 = testOrgUnit({
            level: 2,
            ancestors: [rootOrg],
            parentId: rootOrg.id,
            childCount: 0,
            displayName: 'ChildB',
        })

        const screen = await renderList({
            rootOrgUnits: [rootOrg],
            otherOrgUnits: [child1, child2],
        })

        const tableRows = screen.getAllByTestId('dhis2-uicore-datatablerow')
        expect(tableRows.length).toBe(4)

        expect(tableRows[2]).toHaveTextContent(child1.displayName!)
        const actionCell = within(tableRows[2]).getByTestId('row-actions')
        const infoButton = within(actionCell).getAllByRole('button')[0]

        await userEvent.click(infoButton)

        const detailsPanel = await screen.findByTestId('details-panel')
        expect(detailsPanel).toBeVisible()
        expect(detailsPanel).toHaveTextContent(child1.displayName!)
        expect(detailsPanel).toHaveTextContent(child1.code!)
        expect(detailsPanel).toHaveTextContent(child1.id!)
        expect(detailsPanel).toHaveTextContent(child1.createdBy!.displayName!)
        expect(detailsPanel).toHaveTextContent(
            child1.lastUpdatedBy!.displayName!
        )
        expect(
            within(detailsPanel).getByText('API URL link').closest('a')
        ).toHaveAttribute('href', child1.href)
    })

    it('has show a detail panel', async () => {
        const rootOrg = testOrgUnit({ level: 1, childCount: 2 })
        const child1 = testOrgUnit({
            level: 2,
            ancestors: [rootOrg],
            parentId: rootOrg.id,
            childCount: 0,
            access: testAccess({ delete: true }),
            displayName: 'ChildA',
        })
        const child2 = testOrgUnit({
            level: 2,
            ancestors: [rootOrg],
            parentId: rootOrg.id,
            childCount: 0,
            displayName: 'ChildB',
        })

        const screen = await renderList({
            rootOrgUnits: [rootOrg],
            otherOrgUnits: [child1, child2],
        })

        const tableRows = screen.getAllByTestId('dhis2-uicore-datatablerow')
        expect(tableRows.length).toBe(4)

        expect(tableRows[2]).toHaveTextContent(child1.displayName!)
        const actionButton = within(tableRows[2]).getByTestId(
            'row-actions-menu-button'
        )
        await userEvent.click(actionButton)

        const actionsMenu = screen.getByTestId('row-actions-menu')
        expect(actionsMenu).toBeVisible()
        await userEvent.click(within(actionsMenu).getByText('Show details'))

        const detailsPanel = await screen.findByTestId('details-panel')
        expect(detailsPanel).toBeVisible()
        expect(detailsPanel).toHaveTextContent(child1.displayName!)
        expect(detailsPanel).toHaveTextContent(child1.code!)
        expect(detailsPanel).toHaveTextContent(child1.id!)
        expect(detailsPanel).toHaveTextContent(child1.createdBy!.displayName!)
        expect(detailsPanel).toHaveTextContent(
            child1.lastUpdatedBy!.displayName!
        )
        expect(
            within(detailsPanel).getByText('API URL link').closest('a')
        ).toHaveAttribute('href', child1.href)
    })

    it('should open and close the multi select toolbar', async () => {
        const rootOrg = testOrgUnit({ level: 1, childCount: 2 })
        const child1 = testOrgUnit({
            level: 2,
            ancestors: [rootOrg],
            parentId: rootOrg.id,
            childCount: 0,
            access: testAccess({ delete: true }),
        })
        const child2 = testOrgUnit({
            level: 2,
            ancestors: [rootOrg],
            parentId: rootOrg.id,
            childCount: 0,
        })

        const screen = await renderList({
            rootOrgUnits: [rootOrg],
            otherOrgUnits: [child1, child2],
        })

        const tableRows = screen.getAllByTestId('dhis2-uicore-datatablerow')
        expect(tableRows.length).toBe(4)

        const secondChildCell = await screen.findByText(child2.displayName!)
        const secondChildRow = secondChildCell.closest('tr')
        expect(secondChildRow).not.toBeNull()
        const secondChildCheckBox = within(
            secondChildRow as HTMLElement
        ).getByRole('checkbox')
        await userEvent.click(secondChildCheckBox)

        const toolbar = screen.getByTestId('multi-actions-toolbar')
        expect(toolbar).toBeVisible()
        expect(secondChildCheckBox).toBeChecked()

        await userEvent.click(within(toolbar).getByText('Deselect all'))
        expect(secondChildCheckBox).not.toBeChecked()
        expect(toolbar).not.toBeVisible()
    })

    it('should download all selected rows', async () => {
        const rootOrg = testOrgUnit({ level: 1, childCount: 2 })
        const child1 = testOrgUnit({
            level: 2,
            ancestors: [rootOrg],
            parentId: rootOrg.id,
            childCount: 0,
            access: testAccess({ delete: true }),
        })
        const child2 = testOrgUnit({
            level: 2,
            ancestors: [rootOrg],
            parentId: rootOrg.id,
            childCount: 0,
        })

        const screen = await renderList({
            rootOrgUnits: [rootOrg],
            otherOrgUnits: [child1, child2],
        })

        const tableRows = screen.getAllByTestId('dhis2-uicore-datatablerow')
        expect(tableRows.length).toBe(4)

        const rootRow = tableRows[1]
        const secondChildCell = await screen.findByText(child2.displayName!)
        const secondChildRow = secondChildCell.closest('tr')
        expect(secondChildRow).not.toBeNull()
        await userEvent.click(within(rootRow).getByRole('checkbox'))
        await userEvent.click(
            within(secondChildRow as HTMLElement).getByRole('checkbox')
        )

        const toolbar = screen.getByTestId('multi-actions-toolbar')
        await userEvent.click(within(toolbar).getByText('Download'))

        const downloadModal = await screen.findByTestId('download-modal')
        expect(downloadModal).toBeVisible()
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
    })
})

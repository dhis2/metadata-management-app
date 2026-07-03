import { render } from '@testing-library/react'
import React from 'react'
import schemaMock from '../../__mocks__/schema/categoriesOptionsSchema.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import { SECTIONS_MAP } from '../../lib'
import { testCategoryOptionGroup } from '../../testUtils/builders'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiAssertions } from '../../testUtils/uiAssertions'
import { Component as New } from './New'
import resetAllMocks = jest.resetAllMocks

const section = SECTIONS_MAP.categoryOption
const mockSchema = schemaMock

jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))

describe('Category options form tests', () => {
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

    describe('Common', () => {
        const renderForm = generateRenderer({ section, mockSchema }, () => {
            const categoryOptionGroups = [
                testCategoryOptionGroup(),
                testCategoryOptionGroup(),
            ]
            const screen = render(
                <TestComponentWithRouter
                    path={`/${section.namePlural}`}
                    customData={{
                        attributes: () => ({ attributes: [] }),
                        categoryOptionGroups: () => ({
                            pager: {},
                            categoryOptionGroups,
                        }),
                        categoryOptions: (type: any, params: any) => {
                            if (type === 'create') {
                                createMock(params)
                                return { statusCode: 204 }
                            }
                            if (type === 'read') {
                                return {
                                    pager: { total: 0 },
                                    categoryOptions: [],
                                }
                            }
                        },
                    }}
                >
                    <New />
                </TestComponentWithRouter>
            )
            return { screen, categoryOptionGroups }
        })

        it('should not show an "Add new" button for category option groups', async () => {
            const { screen } = await renderForm()

            uiAssertions.expectTransferFieldToHideAddNewButton(
                'formfields-categoryOptionGroups',
                screen
            )
        })

        it.todo('should not submit when a required values is missing')
        it.todo('should show an error if name field is too long')
        it.todo('should show an error if short name field is too long')
        it.todo('should show an error if code field is too long')
        it.todo('should show an error if name field is a duplicate')
        it.todo('should show an error if short name field is a duplicate')
        it.todo('should show an error if code field is a duplicate')
    })
    describe('New', () => {
        it.todo('contain all needed field')
        it.todo('should have a cancel button with a link back to the list view')
        it.todo('should submit the data')
    })
    describe('Edit', () => {
        it.todo('contain all needed field prefilled')
        it.todo(
            'should submit the data and return to the list view on success when a field is changed'
        )
        it.todo(
            'should do nothing and return to the list view on success when no field is changed'
        )
        it.todo('display dates in the required format')
    })
})

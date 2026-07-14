import categoryOptionCombosSchema from '../../__mocks__/schema/categoryOptionCombosSchema.json'
import { SECTIONS_MAP } from '../../lib'
import {
    testCategoryCombo,
    testCategoryOptionCombo,
} from '../../testUtils/builders'
import {
    generateDefaultListFiltersTests,
    generateDefaultListItemsTests,
    generateDefaultListMultiActionsTests,
} from '../defaultListTests'
import { Component as CategoryOptionComboList } from './List'

const section = SECTIONS_MAP.categoryOptionCombo
const mockSchema = categoryOptionCombosSchema
const ComponentToTest = CategoryOptionComboList
const generateRandomElement = testCategoryOptionCombo
const customData = {
    categoryCombos: (type: any, params: any) => {
        if (type === 'read') {
            return {
                categoryCombos: [
                    testCategoryCombo(),
                    testCategoryCombo(),
                    testCategoryCombo(),
                ],
                pager: { page: 1, total: 3, pageSize: 20, pageCount: 1 },
            }
        }
    },
    categoryOptions: (type: any, params: any) => {
        if (type === 'read') {
            return {
                categoryOptions: [],
                pager: { page: 1, total: 0, pageSize: 20, pageCount: 1 },
            }
        }
    },
}

const testConfig = {
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
}
generateDefaultListItemsTests(testConfig)
generateDefaultListFiltersTests(testConfig)
generateDefaultListMultiActionsTests(testConfig)

xdescribe('Category option combo additional tests', () => {
    it('should filter by category option', () => {})
    it('should filter by category combo', () => {})
    it('should display the show details, edit and translate actions in the menu', () => {})
    it('redirect to the edit page when clicking on the edit action', () => {})
    it('redirects to the edit page when clicking on the pencil icon', () => {})
    it('shows the detail panel when the show details action is clicked', () => {})
    it('shows an edit button in the details panel', () => {})
    it('can copy the api url in the details panel', () => {})
    it('should open a translation dialog when the translate action is clicked', () => {})
    it('should successfully save a new translation', () => {})
})

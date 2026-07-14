import schemaMock from '../../__mocks__/schema/categoriesOptionsSchema.json'
import { SECTIONS_MAP } from '../../lib'
import {
    testCategory,
    testCategoryOption,
    testCategoryOptionGroup,
} from '../../testUtils/builders'
import { generateDefaultListTests } from '../defaultListTests'
import { Component } from './List'

const section = SECTIONS_MAP.categoryOption
const mockSchema = schemaMock
const ComponentToTest = Component
const generateRandomElement = testCategoryOption
const customData = {
    categories: (type: any, params: any) => {
        if (type === 'read') {
            return {
                categories: [testCategory(), testCategory(), testCategory()],
                pager: { page: 1, total: 3, pageSize: 20, pageCount: 1 },
            }
        }
    },
    categoryOptionGroups: (type: any, params: any) => {
        if (type === 'read') {
            return {
                categoryOptionGroups: [testCategoryOptionGroup()],
                pager: { page: 1, total: 1, pageSize: 20, pageCount: 1 },
            }
        }
    },
}

generateDefaultListTests({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
})

xdescribe('Category option additional tests', () => {
    it('should filter by category', () => {})
    it('should filter by category option group', () => {})
    it('shows a merge action when selecting one of more cat options', () => {})
    it('does shows a merge action when the user does not have the right authority', () => {})
})

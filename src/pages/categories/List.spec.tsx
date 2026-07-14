import categorySchemaMock from '../../__mocks__/schema/categoriesSchema.json'
import { SECTIONS_MAP } from '../../lib'
import { testCategory, testCategoryCombo } from '../../testUtils/builders'
import { generateDefaultListTests } from '../defaultListTests'
import { Component as CategoryList } from './List'

const section = SECTIONS_MAP.category
const mockSchema = categorySchemaMock
const ComponentToTest = CategoryList
const generateRandomElement = testCategory
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
}

generateDefaultListTests({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
})

xdescribe('Category additional tests', () => {
    it('should filter by data dimension type', () => {})
    it('should filter by data category combo', () => {})
})

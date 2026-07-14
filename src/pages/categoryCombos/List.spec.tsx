import categoryCombosSchemaMock from '../../__mocks__/schema/categoryCombosSchema.json'
import { SECTIONS_MAP } from '../../lib'
import { testCategory, testCategoryCombo } from '../../testUtils/builders'
import { generateDefaultListTests } from '../defaultListTests'
import { Component as CategoryComboList } from './List'

const section = SECTIONS_MAP.categoryCombo
const mockSchema = categoryCombosSchemaMock
const ComponentToTest = CategoryComboList
const generateRandomElement = testCategoryCombo
const customData = {
    categories: (type: any, params: any) => {
        if (type === 'read') {
            return {
                categories: [testCategory(), testCategory(), testCategory()],
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

xdescribe('Category combos additional tests', () => {
    it('should filter by data dimension type', () => {})
    it('should filter by data category combo', () => {})
})

import schemaMock from '../../__mocks__/schema/categoriesOptionGroupSetsSchema.json'
import { SECTIONS_MAP } from '../../lib'
import { testCategoryOptionGroupSet } from '../../testUtils/builders'
import { generateDefaultListTests } from '../defaultListTests'
import { Component } from './List'

const section = SECTIONS_MAP.categoryOptionGroupSet
const mockSchema = schemaMock
const ComponentToTest = Component
const generateRandomElement = testCategoryOptionGroupSet
const customData = {}

generateDefaultListTests({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
})

xdescribe('Category option group set additional tests', () => {
    it('should filter by data dimension type', () => {})
})

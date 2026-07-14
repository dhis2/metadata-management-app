import schemaMock from '../../__mocks__/schema/categoriesOptionGroupsSchema.json'
import { SECTIONS_MAP } from '../../lib'
import { testCategoryOptionGroup } from '../../testUtils/builders'
import { generateDefaultListTests } from '../defaultListTests'
import { Component } from './List'

const section = SECTIONS_MAP.categoryOptionGroup
const mockSchema = schemaMock
const ComponentToTest = Component
const generateRandomElement = testCategoryOptionGroup
const customData = {}

generateDefaultListTests({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
})

xdescribe('Category option group additional tests', () => {
    it('should filter by data dimension type', () => {})
})

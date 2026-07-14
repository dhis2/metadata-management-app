import schemaMock from '../../__mocks__/schema/indicatorTypes.json'
import { SECTIONS_MAP } from '../../lib'
import { testIndicatorType } from '../../testUtils/builders'
import { generateDefaultListTests } from '../defaultListTests'
import { Component } from './List'

const section = SECTIONS_MAP.indicatorType
const mockSchema = schemaMock
const ComponentToTest = Component
const generateRandomElement = testIndicatorType
const customData = {}

generateDefaultListTests({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
})

xdescribe('Indicator type additional tests', () => {
    it('shows a merge action when selecting one of more indicator types', () => {})
    it('does shows a merge action when the user does not have the right authority', () => {})
})

import schemaMock from '../../__mocks__/schema/dataSets.json'
import { SECTIONS_MAP } from '../../lib'
import { testDataSet } from '../../testUtils/builders'
import { generateDefaultListTests } from '../defaultListTests'
import { Component } from './List'

const section = SECTIONS_MAP.dataSet
const mockSchema = schemaMock
const ComponentToTest = Component
const generateRandomElement = testDataSet
const customData = {}

generateDefaultListTests({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
})

xdescribe('Data sets additional tests', () => {
    it('should filter by form type', () => {})
})

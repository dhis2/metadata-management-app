import schemaMock from '../../__mocks__/schema/legendSetSchema.json'
import { SECTIONS_MAP } from '../../lib'
import { testLegendSets } from '../../testUtils/builders'
import { generateDefaultListTests } from '../defaultListTests'
import { Component } from './List'

const section = SECTIONS_MAP.legendSet
const mockSchema = schemaMock
const ComponentToTest = Component
const generateRandomElement = testLegendSets
const customData = {}

generateDefaultListTests({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
})

import schemaMock from '../../__mocks__/schema/indicators.json'
import { SECTIONS_MAP } from '../../lib'
import { testIndicator } from '../../testUtils/builders'
import { generateDefaultListTests } from '../defaultListTests'
import { Component } from './List'

const section = SECTIONS_MAP.indicator
const mockSchema = schemaMock
const ComponentToTest = Component
const generateRandomElement = testIndicator
const customData = {}

generateDefaultListTests({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
})

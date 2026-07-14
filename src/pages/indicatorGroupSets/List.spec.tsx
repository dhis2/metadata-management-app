import schemaMock from '../../__mocks__/schema/indicatorGroupSetsSchema.json'
import { SECTIONS_MAP } from '../../lib'
import { testIndicatorGroupSet } from '../../testUtils/builders'
import { generateDefaultListTests } from '../defaultListTests'
import { Component } from './List'

const section = SECTIONS_MAP.indicatorGroupSet
const mockSchema = schemaMock
const ComponentToTest = Component
const generateRandomElement = testIndicatorGroupSet
const customData = {}

generateDefaultListTests({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
})

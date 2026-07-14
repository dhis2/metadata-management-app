import schemaMock from '../../__mocks__/schema/dataElementGroupSets.json'
import { SECTIONS_MAP } from '../../lib'
import { testDataElementGroupSet } from '../../testUtils/builders'
import { generateDefaultListTests } from '../defaultListTests'
import { Component } from './List'

const section = SECTIONS_MAP.dataElementGroupSet
const mockSchema = schemaMock
const ComponentToTest = Component
const generateRandomElement = testDataElementGroupSet
const customData = {}

generateDefaultListTests({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
})

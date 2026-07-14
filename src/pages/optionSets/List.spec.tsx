import schemaMock from '../../__mocks__/schema/optionSet.json'
import { SECTIONS_MAP } from '../../lib'
import { testOptionSets } from '../../testUtils/builders'
import { generateDefaultListTests } from '../defaultListTests'
import { Component } from './List'

const section = SECTIONS_MAP.optionSet
const mockSchema = schemaMock
const ComponentToTest = Component
const generateRandomElement = testOptionSets
const customData = {}

generateDefaultListTests({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
})

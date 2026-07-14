import schemaMock from '../../__mocks__/schema/optionGroups.json'
import { SECTIONS_MAP } from '../../lib'
import { testOptionGroup } from '../../testUtils/builders'
import { generateDefaultListTests } from '../defaultListTests'
import { Component } from './List'

const section = SECTIONS_MAP.optionGroup
const mockSchema = schemaMock
const ComponentToTest = Component
const generateRandomElement = testOptionGroup
const customData = {}

generateDefaultListTests({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
})

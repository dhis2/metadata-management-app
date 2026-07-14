import schemaMock from '../../__mocks__/schema/optionGroupSetsSchema.json'
import { SECTIONS_MAP } from '../../lib'
import { testOptionGroupSetList } from '../../testUtils/builders'
import { generateDefaultListTests } from '../defaultListTests'
import { Component } from './List'

const section = SECTIONS_MAP.optionGroupSet
const mockSchema = schemaMock
const ComponentToTest = Component
const generateRandomElement = testOptionGroupSetList
const customData = {}

generateDefaultListTests({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
})

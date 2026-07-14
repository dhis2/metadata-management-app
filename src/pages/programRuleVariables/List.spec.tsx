import schemaMock from '../../__mocks__/schema/programRuleVariablesSchema.json'
import { SECTIONS_MAP } from '../../lib'
import { testProgramRuleVariable } from '../../testUtils/builders'
import { generateDefaultListTests } from '../defaultListTests'
import { Component } from './List'

const section = SECTIONS_MAP.programRuleVariable
const mockSchema = schemaMock
const ComponentToTest = Component
const generateRandomElement = testProgramRuleVariable
const customData = {}

generateDefaultListTests({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
})

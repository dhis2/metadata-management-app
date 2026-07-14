import schemaMock from '../../__mocks__/schema/programRulesSchema.json'
import { SECTIONS_MAP } from '../../lib'
import { testProgramRule } from '../../testUtils/builders'
import { generateDefaultListTests } from '../defaultListTests'
import { Component } from './List'

const section = SECTIONS_MAP.programRule
const mockSchema = schemaMock
const ComponentToTest = Component
const generateRandomElement = testProgramRule
const customData = {}

generateDefaultListTests({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
})

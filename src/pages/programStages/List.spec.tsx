import schemaMock from '../../__mocks__/schema/programStages.json'
import { SECTIONS_MAP } from '../../lib'
import { testProgramStage } from '../../testUtils/builders'
import { generateDefaultListTests } from '../defaultListTests'
import { Component } from './List'

const section = SECTIONS_MAP.programStage
const mockSchema = schemaMock
const ComponentToTest = Component
const generateRandomElement = testProgramStage
const customData = {}

generateDefaultListTests({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
})

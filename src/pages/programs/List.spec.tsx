import schemaMock from '../../__mocks__/schema/programs.json'
import { SECTIONS_MAP } from '../../lib'
import { testPrograms } from '../../testUtils/builders'
import { generateDefaultListTests } from '../defaultListTests'
import { Component } from './List'

const section = SECTIONS_MAP.program
const mockSchema = schemaMock
const ComponentToTest = Component
const generateRandomElement = testPrograms
const customData = {}

generateDefaultListTests({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
})

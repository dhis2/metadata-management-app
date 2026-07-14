import schemaMock from '../../__mocks__/schema/programIndicatorGroupsSchema.json'
import { SECTIONS_MAP } from '../../lib'
import { testProgramIndicatorGroup } from '../../testUtils/builders'
import { generateDefaultListTests } from '../defaultListTests'
import { Component } from './List'

const section = SECTIONS_MAP.programIndicatorGroup
const mockSchema = schemaMock
const ComponentToTest = Component
const generateRandomElement = testProgramIndicatorGroup
const customData = {}

generateDefaultListTests({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
})

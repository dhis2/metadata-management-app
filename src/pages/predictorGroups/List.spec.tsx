import schemaMock from '../../__mocks__/schema/predictorGroups.json'
import { SECTIONS_MAP } from '../../lib'
import { testPredictorGroup } from '../../testUtils/builders'
import { generateDefaultListTests } from '../defaultListTests'
import { Component } from './List'

const section = SECTIONS_MAP.predictorGroup
const mockSchema = schemaMock
const ComponentToTest = Component
const generateRandomElement = testPredictorGroup
const customData = {}

generateDefaultListTests({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
})

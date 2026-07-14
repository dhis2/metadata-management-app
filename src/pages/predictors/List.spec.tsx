import schemaMock from '../../__mocks__/schema/predictor.json'
import { SECTIONS_MAP } from '../../lib'
import { testPredictorList } from '../../testUtils/builders'
import { generateDefaultListTests } from '../defaultListTests'
import { Component } from './List'

const section = SECTIONS_MAP.predictor
const mockSchema = schemaMock
const ComponentToTest = Component
const generateRandomElement = testPredictorList
const customData = {}

generateDefaultListTests({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
})

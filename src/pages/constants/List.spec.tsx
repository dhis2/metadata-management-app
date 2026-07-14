import schemaMock from '../../__mocks__/schema/constant.json'
import { SECTIONS_MAP } from '../../lib'
import { testConstant } from '../../testUtils/builders'
import { generateDefaultListTests } from '../defaultListTests'
import { Component } from './List'

const section = SECTIONS_MAP.constant
const mockSchema = schemaMock
const ComponentToTest = Component
const generateRandomElement = testConstant
const customData = {}

generateDefaultListTests({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
})

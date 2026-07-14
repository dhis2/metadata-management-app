import schemaMock from '../../__mocks__/schema/dataApprovalLevel.json'
import { SECTIONS_MAP } from '../../lib'
import { testdataApprovalLevelList } from '../../testUtils/builders'
import { generateDefaultListTests } from '../defaultListTests'
import { Component } from './List'

const section = SECTIONS_MAP.dataApprovalLevel
const mockSchema = schemaMock
const ComponentToTest = Component
const generateRandomElement = testdataApprovalLevelList
const customData = {}

generateDefaultListTests({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
})

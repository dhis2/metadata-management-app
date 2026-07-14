import schemaMock from '../../__mocks__/schema/dataApprovalWorkflowSchema.json'
import { SECTIONS_MAP } from '../../lib'
import { testDataApprovalWorkflowList } from '../../testUtils/builders'
import { generateDefaultListTests } from '../defaultListTests'
import { Component } from './List'

const section = SECTIONS_MAP.dataApprovalWorkflow
const mockSchema = schemaMock
const ComponentToTest = Component
const generateRandomElement = testDataApprovalWorkflowList
const customData = {}

generateDefaultListTests({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
})

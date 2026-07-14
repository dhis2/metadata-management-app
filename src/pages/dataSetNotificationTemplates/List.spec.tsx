import dataSetNotificationTemplateSchemaMock from '../../__mocks__/schema/dataSetNotificationTemplatesSchema.json'
import { SECTIONS_MAP } from '../../lib'
import { testDataSetNotificationTemplate } from '../../testUtils/builders'
import { generateDefaultListTests } from '../defaultListTests'
import { Component as DataSetNotificationTemplateList } from './List'

const section = SECTIONS_MAP.dataSetNotificationTemplate
const mockSchema = dataSetNotificationTemplateSchemaMock
const ComponentToTest = DataSetNotificationTemplateList
const generateRandomElement = testDataSetNotificationTemplate
const customData = {}

generateDefaultListTests({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
})

xdescribe('DataSetNotificationTemplate additional tests', () => {})

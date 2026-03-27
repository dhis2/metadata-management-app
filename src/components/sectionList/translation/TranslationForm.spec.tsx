import { BaseListModel, Schema } from '../../../lib'
import { getTranslateableFieldsForSchema } from './TranslationForm'

describe('getTranslateableFieldsForSchema', () => {
    it('returns only translatable fields in correct order', () => {
        const mockSchema = {
            properties: {
                cat: { fieldName: 'catField', translatable: true },
                description: { fieldName: 'description', translatable: true },
                shortName: { fieldName: 'shortName', translatable: false },
                name: { fieldName: 'name', translatable: true },
                formName: { fieldName: 'formName', translatable: true },
                dog: { fieldName: 'dogField', translatable: true },
                turtle: { fieldName: 'turtleField', translatable: false },
            },
        }
        const result = getTranslateableFieldsForSchema(
            mockSchema as unknown as Schema,
            {} as BaseListModel
        )
        const expected = [
            'name',
            'formName',
            'description',
            'catField',
            'dogField',
        ]
        expect(result).toEqual(expected)
    })
})

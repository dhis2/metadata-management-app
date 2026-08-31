import { trimTrimmableFields } from './useOnSubmit'

describe('trimTrimmableFields', () => {
    it('trims leading and trailing whitespace from name, shortName, code and description', () => {
        const values = {
            name: '  Fever ',
            shortName: ' Fev ',
            code: ' FEVER ',
            description: '  A disease  ',
        }

        expect(trimTrimmableFields(values)).toEqual({
            name: 'Fever',
            shortName: 'Fev',
            code: 'FEVER',
            description: 'A disease',
        })
    })

    it('leaves internal whitespace untouched', () => {
        const values = { name: '  Fever  Symptoms  ' }

        expect(trimTrimmableFields(values)).toEqual({
            name: 'Fever  Symptoms',
        })
    })

    it('leaves values without leading/trailing whitespace unchanged', () => {
        const values = { name: 'Fever', code: 'FEVER' }

        expect(trimTrimmableFields(values)).toEqual({
            name: 'Fever',
            code: 'FEVER',
        })
    })

    it('does not mutate fields that are not in the trimmable list', () => {
        const values = { name: ' Fever ', comment: '  keep me  ' }

        expect(trimTrimmableFields(values)).toEqual({
            name: 'Fever',
            comment: '  keep me  ',
        })
    })

    it('ignores trimmable fields that are missing or not strings', () => {
        const values = { name: undefined, code: 123 } as unknown as {
            name?: string
            code?: number
        }

        expect(trimTrimmableFields(values)).toEqual({
            name: undefined,
            code: 123,
        })
    })

    it('does not mutate the original values object', () => {
        const values = { name: ' Fever ' }

        trimTrimmableFields(values)

        expect(values).toEqual({ name: ' Fever ' })
    })

    it('handles an empty object', () => {
        expect(trimTrimmableFields({})).toEqual({})
    })
})

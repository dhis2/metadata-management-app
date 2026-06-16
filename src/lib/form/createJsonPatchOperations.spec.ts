import {
    createJsonPatchOperations,
    sanitizeDirtyValueKeys,
} from './createJsonPatchOperations'

describe('sanitizeDirtyValueKeys', () => {
    it('leaves plain scalar fields untouched', () => {
        expect(sanitizeDirtyValueKeys(['name', 'shortName'])).toEqual([
            'name',
            'shortName',
        ])
    })

    it('collapses nested array edits of a complex key into the complex key', () => {
        expect(
            sanitizeDirtyValueKeys([
                'attributeValues[0].value',
                'attributeValues[1].value',
            ])
        ).toEqual(['attributeValues'])
    })

    it('collapses nested object edits of a complex key into the complex key', () => {
        expect(sanitizeDirtyValueKeys(['style.color', 'style.icon'])).toEqual([
            'style',
        ])
    })

    it('collapses a bare complex key into itself', () => {
        expect(sanitizeDirtyValueKeys(['programStages'])).toEqual([
            'programStages',
        ])
    })

    it('keeps a scalar field that shares a prefix with a complex key', () => {
        // 'programStagesLabel' starts with the 'programStages' complex key but
        // is its own scalar field - check that it is not collapsed away.
        expect(
            sanitizeDirtyValueKeys(['programStagesLabel', 'programStages[0]'])
        ).toEqual(['programStagesLabel', 'programStages'])
    })

    it('keeps a prefix-sharing scalar field when the complex key is not edited', () => {
        expect(sanitizeDirtyValueKeys(['programStagesLabel'])).toEqual([
            'programStagesLabel',
        ])
    })
})

describe('createJsonPatchOperations', () => {
    type LabelValues = { id?: string; programStagesLabel?: string }

    it('builds a replace op for an edited scalar that shares a complex-key prefix', () => {
        expect(
            createJsonPatchOperations<LabelValues>({
                dirtyFields: { programStagesLabel: true },
                originalValue: { programStagesLabel: 'Stages' },
                values: { programStagesLabel: 'Program stages' },
            })
        ).toEqual([
            {
                op: 'replace',
                path: '/programStagesLabel',
                value: 'Program stages',
            },
        ])
    })

    it('uses an add op when the field had no original value', () => {
        expect(
            createJsonPatchOperations<LabelValues>({
                dirtyFields: { programStagesLabel: true },
                originalValue: {},
                values: { programStagesLabel: 'Program stages' },
            })
        ).toEqual([
            {
                op: 'add',
                path: '/programStagesLabel',
                value: 'Program stages',
            },
        ])
    })
})

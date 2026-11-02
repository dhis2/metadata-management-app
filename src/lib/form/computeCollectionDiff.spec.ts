import { computeCollectionDiff } from './computeCollectionDiff'

const refs = (...ids: string[]) => ids.map((id) => ({ id }))

describe('computeCollectionDiff', () => {
    it('returns only added and removed IDs', () => {
        expect(
            computeCollectionDiff(refs('a', 'b', 'c'), refs('b', 'c', 'd'))
        ).toEqual({ additions: refs('d'), deletions: refs('a') })
    })

    it('ignores order, duplicate IDs and changes to display properties', () => {
        const initial = [
            { id: 'a', displayName: 'Old name' },
            { id: 'b', displayName: 'B' },
        ]
        const current = [
            { id: 'b', displayName: 'B' },
            { id: 'a', displayName: 'New name' },
            { id: 'a', displayName: 'New name' },
        ]

        expect(computeCollectionDiff(initial, current)).toEqual({
            additions: [],
            deletions: [],
        })
    })

    it('adds to an empty collection and removes all members', () => {
        expect(computeCollectionDiff([], refs('a', 'b'))).toEqual({
            additions: refs('a', 'b'),
            deletions: [],
        })
        expect(computeCollectionDiff(refs('a', 'b'), [])).toEqual({
            additions: [],
            deletions: refs('a', 'b'),
        })
        expect(computeCollectionDiff([], [])).toEqual({
            additions: [],
            deletions: [],
        })
    })

    it('does not mutate inputs or send extra member properties', () => {
        const initial = Object.freeze([
            Object.freeze({ id: 'a', path: '/a' }),
        ])
        const current = Object.freeze([
            Object.freeze({ id: 'b', path: '/b' }),
            Object.freeze({ id: 'b', path: '/b' }),
        ])

        expect(computeCollectionDiff(initial, current)).toEqual({
            additions: refs('b'),
            deletions: refs('a'),
        })
        expect(initial).toEqual([{ id: 'a', path: '/a' }])
        expect(current).toHaveLength(2)
    })

    it('keeps a small request for a large collection', () => {
        const initial = Array.from({ length: 100000 }, (_, id) => ({
            id: `unit${id}`,
        }))
        const current = [...initial.slice(3), ...refs('new1', 'new2')]

        expect(computeCollectionDiff(initial, current)).toEqual({
            additions: refs('new1', 'new2'),
            deletions: refs('unit0', 'unit1', 'unit2'),
        })
    })
})

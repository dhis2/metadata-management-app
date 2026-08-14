import { PartialUnit, findMinimumRootUnits } from './findMinimumRootUnits'

const unitToPath = {
    sierra: '/ImspTQPwCqd',
    'sierra/bo': '/ImspTQPwCqd/O6uvpzGd5pu',
    'sierra/bombali': '/ImspTQPwCqd/fdc6uOvgoji',
}

describe('findMinimumRootUnits', () => {
    it('should return a single root unit when there is only one unit', () => {
        const units = [{ path: unitToPath.sierra, level: 1 }]
        const result = findMinimumRootUnits(units)
        expect(result).toEqual([{ path: unitToPath.sierra, level: 1 }])
    })

    it('should return two root units when there are two sibling units', () => {
        const units = [
            { path: unitToPath['sierra/bo'], level: 2 },
            { path: unitToPath['sierra/bombali'], level: 2 },
        ]

        const result = findMinimumRootUnits(units)
        expect(result).toEqual([
            { path: unitToPath['sierra/bo'], level: 2 },
            { path: unitToPath['sierra/bombali'], level: 2 },
        ])
    })

    it('should return only the root unit when one unit is a child of another', () => {
        const units = [
            { path: '/sierra', level: 1 },
            { path: '/sierra/bo', level: 2 },
        ]
        const result = findMinimumRootUnits(units)
        expect(result).toEqual([{ path: '/sierra', level: 1 }])
    })

    it('should return only the root unit when one unit is a deep child of another', () => {
        const units = [
            { path: 'sierra', level: 1 },
            { path: 'sierra/bo/badija/ngele', level: 4 },
        ]
        const result = findMinimumRootUnits(units)
        expect(result).toEqual([{ path: 'sierra', level: 1 }])
    })

    it('should return multiple root units when paths do not overlap', () => {
        const units = [
            { path: 'sierra', level: 1 },
            { path: 'tanzania', level: 1 },
            { path: 'ethiopia', level: 1 },
        ]
        const result = findMinimumRootUnits(units)
        expect(result).toEqual([
            { path: 'sierra', level: 1 },
            { path: 'tanzania', level: 1 },
            { path: 'ethiopia', level: 1 },
        ])
    })

    it('should return the correct root units when there is a mix of roots and children', () => {
        const units = [
            { path: 'sierra/bo/badjia/ngelehun', level: 4 },
            { path: 'sierra/bo/baoma/faabu', level: 4 },
            { path: 'sierra/bo/baoma', level: 3 },
            { path: 'sierra/bo/bargbe', level: 3 },
        ]
        const result = findMinimumRootUnits(units)
        expect(result).toEqual([
            { path: 'sierra/bo/baoma', level: 3 },
            { path: 'sierra/bo/bargbe', level: 3 },
            { path: 'sierra/bo/badjia/ngelehun', level: 4 },
        ])
    })

    it('should return the root units when multiple nested children exist', () => {
        const units = [
            { path: 'sierra/bo', level: 2 },
            { path: 'sierra/bo/badjia', level: 3 },
            { path: 'sierra/bo/baomba', level: 3 },
            { path: 'sierra/bargbe/barlie', level: 3 },
            { path: 'sierra/bargbe/barlie/ngalu', level: 4 },
        ]
        const result = findMinimumRootUnits(units)
        expect(result).toEqual([
            { path: 'sierra/bo', level: 2 },
            { path: 'sierra/bargbe/barlie', level: 3 },
        ])
    })

    it('should handle empty input and return an empty array', () => {
        const units: PartialUnit[] = []
        const result = findMinimumRootUnits(units)
        expect(result).toEqual([])
    })

    it('should return all org units for org unit input where only id is provided', () => {
        const units = [{ id: 'a' }, { id: 'b' }] as unknown as PartialUnit[]
        const result = findMinimumRootUnits(units)
        expect(result).toEqual(units)
    })
})

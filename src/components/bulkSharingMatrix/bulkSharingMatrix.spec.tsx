import { render, renderHook, act, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import { buildMockMatrix } from './mockSharingData'
import { SharingMatrix } from './SharingMatrix'
import { useSharingMatrix } from './useSharingMatrix'

const Harness = () => {
    const api = useSharingMatrix('default')
    return <SharingMatrix api={api} />
}

describe('bulk sharing matrix prototype', () => {
    it('renders the grid with Public access pinned above the user groups', () => {
        render(<Harness />)

        expect(screen.getByText('Public access')).toBeInTheDocument()
        expect(screen.getByText('Administrators')).toBeInTheDocument()

        const rows = screen.getAllByTitle(/^(Public access|Administrators)$/)
        expect(rows[0]).toHaveTextContent('Public access')
    })

    it('transposes the matrix, swapping which axis is which', async () => {
        render(<Harness />)

        await userEvent.click(screen.getByText('Full matrix'))
        expect(screen.getByText('User or group')).toBeInTheDocument()
        expect(screen.getByText('All 40 objects')).toBeInTheDocument()

        await userEvent.click(screen.getByText('Transpose'))
        expect(screen.getByText('Object')).toBeInTheDocument()
        expect(screen.getByText('All 18 users and groups')).toBeInTheDocument()

        // and back again
        await userEvent.click(screen.getByText('Transpose'))
        expect(screen.getByText('All 40 objects')).toBeInTheDocument()
    })

    it('seeds outliers outside the first visible columns', () => {
        const { objects, entities, access } = buildMockMatrix('default')
        const publicRow = access['public']

        // column 24 (index 23) is the seeded public-access escalation
        expect(publicRow[objects[0].id].metadata).toBe('view')
        expect(publicRow[objects[23].id].metadata).toBe('edit')
        expect(entities[0].kind).toBe('public')
    })

    it('reports a mixed aggregate with its full breakdown', () => {
        const { result } = renderHook(() => useSharingMatrix('default'))

        const aggregate = result.current.getRowAggregate('public', 'metadata')
        expect(aggregate.mixed).toBe(true)
        expect(aggregate.total).toBe(40)
        expect(aggregate.breakdown).toEqual([
            { level: 'edit', count: 1 },
            { level: 'view', count: 39 },
        ])
    })

    it('reports a uniform row as not mixed', () => {
        const { result } = renderHook(() => useSharingMatrix('default'))

        const aggregate = result.current.getRowAggregate(
            result.current.entities[1].id,
            'metadata'
        )
        expect(aggregate.mixed).toBe(false)
        expect(aggregate.breakdown).toHaveLength(1)
    })

    it('emits operations only for touched cells', () => {
        const { result } = renderHook(() => useSharingMatrix('default'))
        const objectId = result.current.objects[3].id

        expect(result.current.patches).toHaveLength(0)

        act(() => {
            result.current.setCell('public', objectId, 'metadata', 'edit')
        })

        expect(result.current.patches).toHaveLength(1)
        expect(result.current.patches[0].id).toBe(objectId)
        expect(result.current.patches[0].operations).toEqual([
            { op: 'replace', path: '/sharing/public', value: 'rw------' },
        ])
        expect(result.current.changeSummary).toEqual({ edits: 1, objects: 1 })
    })

    it('drops an edit that returns a cell to its loaded value', () => {
        const { result } = renderHook(() => useSharingMatrix('default'))
        const objectId = result.current.objects[3].id

        act(() => {
            result.current.setCell('public', objectId, 'metadata', 'edit')
        })
        act(() => {
            result.current.setCell('public', objectId, 'metadata', 'view')
        })

        expect(result.current.changeSummary.edits).toBe(0)
        expect(result.current.patches).toHaveLength(0)
    })

    it('reports a one-directional row-axis diff', () => {
        const { result } = renderHook(() => useSharingMatrix('default'))

        act(() => {
            result.current.setRowAxis('public', 'metadata', 'edit')
        })
        expect(result.current.getRowAxisDiff('public', 'metadata')).toBe(
            'added'
        )

        act(() => {
            result.current.setRowAxis('public', 'metadata', 'none')
        })
        expect(result.current.getRowAxisDiff('public', 'metadata')).toBe(
            'removed'
        )
    })

    it('reports "both" when one row edit grants and revokes at once', () => {
        const { result } = renderHook(() => useSharingMatrix('default'))
        // EPI Programme Team is seeded as 39x No access and 1x Edit and view
        const epi = result.current.entities[4]
        expect(
            result.current.getRowAggregate(epi.id, 'metadata').breakdown
        ).toEqual([
            { level: 'edit', count: 1 },
            { level: 'none', count: 39 },
        ])

        act(() => {
            result.current.setRowAxis(epi.id, 'metadata', 'view')
        })

        expect(result.current.getRowAxisDiff(epi.id, 'metadata')).toBe('both')
    })

    it('flags objects whose sharing differs from the rest', () => {
        const { result } = renderHook(() => useSharingMatrix('default'))
        const typical = result.current.getObjectSummary(
            result.current.objects[0].id
        )
        // object 9 (index 8) carries two seeded deviations
        const outlier = result.current.getObjectSummary(
            result.current.objects[8].id
        )

        expect(typical.consistent).toBe(true)
        expect(typical.patternSize).toBe(37)
        expect(outlier.consistent).toBe(false)
        expect(outlier.patternSize).toBe(1)
    })

    it('counts every entity exactly once per axis', () => {
        const { result } = renderHook(() => useSharingMatrix('default'))
        const summary = result.current.getObjectSummary(
            result.current.objects[0].id
        )
        const total = (axis: 'metadata' | 'data') =>
            summary.counts[axis].reduce((sum, entry) => sum + entry.count, 0)

        expect(total('metadata')).toBe(result.current.entities.length)
        expect(total('data')).toBe(result.current.entities.length)
    })

    it('makes every object consistent once one is copied to all', () => {
        const { result } = renderHook(() => useSharingMatrix('default'))

        act(() => {
            result.current.copyColumnToAll(result.current.objects[0].id)
        })

        const outlier = result.current.getObjectSummary(
            result.current.objects[8].id
        )
        expect(outlier.consistent).toBe(true)
        expect(outlier.patternSize).toBe(result.current.objects.length)
    })

    it('reverts a single row without touching the others', () => {
        const { result } = renderHook(() => useSharingMatrix('default'))
        const [first, second] = result.current.entities

        act(() => {
            result.current.setRowAxis(first.id, 'metadata', 'edit')
            result.current.setRowAxis(second.id, 'metadata', 'none')
        })
        expect(result.current.isRowTouched(first.id)).toBe(true)

        act(() => {
            result.current.revertRow(first.id)
        })

        expect(result.current.isRowTouched(first.id)).toBe(false)
        expect(result.current.isRowTouched(second.id)).toBe(true)
    })

    it('copies one object sharing onto every other object', () => {
        const { result } = renderHook(() => useSharingMatrix('default'))
        // object 24 is the one carrying the public-access outlier
        const sourceId = result.current.objects[23].id

        expect(result.current.getRowAggregate('public', 'metadata').mixed).toBe(
            true
        )

        act(() => {
            result.current.copyColumnToAll(sourceId)
        })

        const aggregate = result.current.getRowAggregate('public', 'metadata')
        expect(aggregate.mixed).toBe(false)
        expect(aggregate.level).toBe('edit')
        expect(result.current.changeSummary.objects).toBe(39)
    })

    it('removes an entity from the payload when both axes reach No access', () => {
        const { result } = renderHook(() => useSharingMatrix('default'))
        const group = result.current.entities.find(
            (entity) => entity.kind === 'userGroup'
        )!

        act(() => {
            result.current.removeRow(group.id)
        })

        const patch = result.current.patches[0]
        expect(patch.operations[0]).toEqual({
            op: 'remove',
            path: `/sharing/userGroups/${group.id}`,
        })
    })
})

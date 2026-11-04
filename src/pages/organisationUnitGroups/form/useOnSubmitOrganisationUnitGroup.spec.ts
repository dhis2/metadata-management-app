import { useDataEngine } from '@dhis2/app-runtime'
import { renderHook } from '@testing-library/react'
import { createForm, FORM_ERROR } from 'final-form'
import { SECTIONS_MAP } from '../../../lib/constants'
import { useOnEditCompletedSuccessfully } from '../../../lib/form/useOnSubmit'
import { usePatchModel } from '../../../lib/form/usePatchModel'
import { DataEngine } from '../../../types'
import { OrganisationUnitGroupFormValues } from '../Edit'
import { useOnSubmitOrganisationUnitGroup } from './useOnSubmitOrganisationUnitGroup'

jest.mock('@dhis2/app-runtime', () => ({
    ...jest.requireActual('@dhis2/app-runtime'),
    useDataEngine: jest.fn(),
}))
jest.mock('../../../lib/form/usePatchModel')
jest.mock('../../../lib/form/useOnSubmit', () => ({
    ...jest.requireActual('../../../lib/form/useOnSubmit'),
    useOnEditCompletedSuccessfully: jest.fn(),
}))

const mutate = jest.fn()
const patch = jest.fn()
const completed = jest.fn()
const member = (id: string) => ({ id, displayName: id, path: `/${id}` })

const setup = () => {
    const initialValues = {
        id: 'groupId',
        name: 'Group',
        organisationUnits: [member('a'), member('b')],
    } as OrganisationUnitGroupFormValues
    const form = createForm<OrganisationUnitGroupFormValues>({
        initialValues,
        onSubmit: jest.fn(),
    })
    form.registerField('name', jest.fn(), { value: true })
    form.registerField('organisationUnits', jest.fn(), { value: true })
    const { result } = renderHook(() =>
        useOnSubmitOrganisationUnitGroup({
            modelId: initialValues.id,
            section: SECTIONS_MAP.organisationUnitGroup,
        })
    )
    return {
        form,
        submit: () => result.current(form.getState().values, form),
    }
}

beforeEach(() => {
    jest.clearAllMocks()
    mutate.mockResolvedValue({})
    patch.mockResolvedValue({ data: {} })
    jest.mocked(useDataEngine).mockReturnValue({
        mutate,
    } as unknown as DataEngine)
    jest.mocked(usePatchModel).mockReturnValue(patch)
    jest.mocked(useOnEditCompletedSuccessfully).mockReturnValue(completed)
})

describe('useOnSubmitOrganisationUnitGroup', () => {
    it('sends only a member diff for membership-only changes', async () => {
        const { form, submit } = setup()
        form.change('organisationUnits', [member('b'), member('c')])

        await submit()

        expect(patch).not.toHaveBeenCalled()
        expect(mutate).toHaveBeenCalledWith({
            resource: 'organisationUnitGroups/groupId/organisationUnits',
            type: 'create',
            data: { additions: [{ id: 'c' }], deletions: [{ id: 'a' }] },
        })
        expect(completed).toHaveBeenCalledWith(
            expect.objectContaining({ withChanges: true })
        )
    })

    it('patches other fields before posting the diff', async () => {
        const { form, submit } = setup()
        form.change('name', ' Updated ')
        form.change('organisationUnits', [])
        mutate.mockImplementationOnce(async () => {
            expect(patch).toHaveBeenCalledWith([
                { op: 'replace', path: '/name', value: 'Updated' },
            ])
            expect(completed).not.toHaveBeenCalled()
            return {}
        })

        await submit()

        expect(mutate).toHaveBeenCalledTimes(1)
        expect(completed).toHaveBeenCalledTimes(1)
    })

    it('skips the collection request when only other fields change', async () => {
        const { form, submit } = setup()
        form.change('name', 'Updated')

        await submit()

        expect(patch).toHaveBeenCalledTimes(1)
        expect(mutate).not.toHaveBeenCalled()
    })

    it('does not save unchanged or reordered memberships', async () => {
        const { form, submit } = setup()
        await submit()
        form.change('organisationUnits', [member('b'), member('a')])
        await submit()

        expect(patch).not.toHaveBeenCalled()
        expect(mutate).not.toHaveBeenCalled()
        expect(completed).toHaveBeenLastCalledWith(
            expect.objectContaining({ withChanges: false })
        )
    })

    it('stops before the collection request if the patch fails', async () => {
        const { form, submit } = setup()
        form.change('name', 'Updated')
        form.change('organisationUnits', [])
        patch.mockResolvedValueOnce({ error: new Error('Patch failed') })

        expect(await submit()).toHaveProperty(FORM_ERROR)
        expect(mutate).not.toHaveBeenCalled()
        expect(completed).not.toHaveBeenCalled()
    })

    it('keeps the form open and reports a partial save if membership fails', async () => {
        const { form, submit } = setup()
        form.change('name', 'Updated')
        form.change('organisationUnits', [])
        mutate.mockRejectedValueOnce(new Error('Membership failed'))

        expect(await submit()).toEqual({
            [FORM_ERROR]: expect.objectContaining({
                message:
                    'Organisation unit membership could not be saved. Other changes have already been saved.',
            }),
        })
        expect(completed).not.toHaveBeenCalled()
    })
})

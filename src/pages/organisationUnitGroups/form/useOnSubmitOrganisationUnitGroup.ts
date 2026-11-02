import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { useMemo } from 'react'
import { parseErrorResponse } from '../../../lib/errors'
import { computeCollectionDiff } from '../../../lib/form/computeCollectionDiff'
import { createFormError } from '../../../lib/form/createFormError'
import { createJsonPatchOperations } from '../../../lib/form/createJsonPatchOperations'
import {
    EnhancedOnSubmit,
    getNavigateTo,
    trimTrimmableFields,
    useOnEditCompletedSuccessfully,
    UseOnSubmitEditOptions,
} from '../../../lib/form/useOnSubmit'
import { usePatchModel } from '../../../lib/form/usePatchModel'
import { OrganisationUnitGroupFormValues } from '../Edit'

export const useOnSubmitOrganisationUnitGroup = ({
    modelId,
    section,
}: UseOnSubmitEditOptions) => {
    const dataEngine = useDataEngine()
    const patchDirtyFields = usePatchModel(modelId, section.namePlural)
    const onEditCompletedSuccessfully = useOnEditCompletedSuccessfully(section)

    return useMemo<EnhancedOnSubmit<OrganisationUnitGroupFormValues>>(
        () => async (values, form, options) => {
            const { initialValues, dirtyFields } = form.getState()
            const { organisationUnits, ...otherValues } = values
            const diff = computeCollectionDiff(
                initialValues.organisationUnits,
                organisationUnits
            )
            const membersChanged =
                diff.additions.length > 0 || diff.deletions.length > 0
            const jsonPatchOperations = createJsonPatchOperations({
                values: trimTrimmableFields(otherValues),
                originalValue: initialValues,
                dirtyFields: Object.fromEntries(
                    Object.entries(dirtyFields).filter(
                        ([field]) =>
                            field !== 'organisationUnits' &&
                            !field.startsWith('organisationUnits[') &&
                            !field.startsWith('organisationUnits.')
                    )
                ),
            })

            // Save ordinary fields first. These two requests are not atomic.
            if (jsonPatchOperations.length > 0) {
                const response = await patchDirtyFields(jsonPatchOperations)
                if (response.error) {
                    return createFormError(response.error)
                }
            }

            if (membersChanged) {
                try {
                    await dataEngine.mutate({
                        resource: `${section.namePlural}/${modelId}/organisationUnits`,
                        type: 'create',
                        data: diff,
                    })
                } catch (error) {
                    const parsedError = parseErrorResponse(error)
                    return createFormError(
                        jsonPatchOperations.length > 0
                            ? {
                                  ...parsedError,
                                  message: i18n.t(
                                      'Organisation unit membership could not be saved. Other changes have already been saved.'
                                  ),
                              }
                            : parsedError
                    )
                }
            }

            onEditCompletedSuccessfully({
                withChanges: jsonPatchOperations.length > 0 || membersChanged,
                navigateTo: getNavigateTo(options),
                submitAction: options?.submitAction,
            })
        },
        [
            dataEngine,
            patchDirtyFields,
            onEditCompletedSuccessfully,
            modelId,
            section.namePlural,
        ]
    )
}

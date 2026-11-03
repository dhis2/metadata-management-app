import { useAlert, useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { useMemo } from 'react'
import { useSystemSetting } from '../../../lib'
import { DataEngine } from '../../../types'

type DataSetsAndPrograms = {
    dataSets?: {
        id: string
    }[]
    programs?: { id: string }[]
}
type DirtyState = {
    dataSetsDirty: boolean
    programsDirty: boolean
}
export const useOnSaveDataSetsAndPrograms = () => {
    const dataEngine: DataEngine = useDataEngine()
    const saveAlert = useAlert(
        ({ message }) => message,
        (options) => options
    )
    const allowReferenceAssignments = useSystemSetting(
        'keyAllowObjectAssignment'
    )
    return useMemo(
        () =>
            async (
                orgId: string,
                values: DataSetsAndPrograms,
                { dataSetsDirty, programsDirty }: DirtyState
            ) => {
                if (!allowReferenceAssignments) {
                    return []
                }
                const fieldToSaveSeparately = []
                if (dataSetsDirty) {
                    fieldToSaveSeparately.push('dataSets')
                }
                if (programsDirty) {
                    fieldToSaveSeparately.push('programs')
                }

                const fieldToEditSeparatelyResults = await Promise.allSettled(
                    fieldToSaveSeparately.map((field) =>
                        dataEngine.mutate({
                            resource: `organisationUnits`,
                            type: 'update',
                            data: {
                                identifiableObjects:
                                    values[field as keyof DataSetsAndPrograms],
                            },
                            id: `${orgId}/${field}`,
                        })
                    )
                )

                const fieldToSaveSeparatelyErrors = fieldToSaveSeparately
                    .map((field, index) =>
                        fieldToEditSeparatelyResults[index].status ===
                        'rejected'
                            ? field
                            : undefined
                    )
                    .filter((field) => !!field)

                if (fieldToSaveSeparatelyErrors.length > 0) {
                    saveAlert.show({
                        message: i18n.t(
                            `The organisation unit was saved successfully but there was a problem saving ${fieldToSaveSeparatelyErrors.join(
                                ' and '
                            )}`
                        ),
                        warning: true,
                    })
                } else {
                    saveAlert.show({
                        message: i18n.t('Saved successfully'),
                        success: true,
                    })
                }
                return fieldToSaveSeparatelyErrors
            },
        [dataEngine, saveAlert]
    )
}

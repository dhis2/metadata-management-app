import i18n from '@dhis2/d2-i18n'
import { z } from 'zod'
import {
    createFormValidate,
    getDefaultsOld,
    modelFormSchemas,
} from '../../../lib'
import { DataSetNotificationTemplate } from '../../../types/generated'
import { DataSetNotificationResult } from '../Edit'

const { identifiable, withDefaultListColumns, referenceCollection } =
    modelFormSchemas

const dataSetNotificationTemplateBaseSchema = z.object({
    code: z.string().optional(),
    dataSetNotificationTrigger: z
        .nativeEnum(DataSetNotificationTemplate.dataSetNotificationTrigger)
        .optional(),
    notificationRecipient: z
        .nativeEnum(DataSetNotificationTemplate.notificationRecipient)
        .optional(),
    deliveryChannels: z.array(z.enum(['SMS', 'EMAIL', 'HTTP'])).default([]),
    messageTemplate: z.string(),
    subjectTemplate: z
        .string()
        .max(100, {
            message: i18n.t(
                'Please enter a maximum of {{upperBound}} characters',
                { upperBound: '100' }
            ),
        })
        .optional(),
    relativeScheduledDays: z.number().int().optional(),
    recipientUserGroup: z
        .object({
            id: z.string().optional(),
            displayName: z.string().optional(),
        })
        .optional()
        .default({}),
    dataSets: referenceCollection.default([]),
    sendStrategy: z
        .nativeEnum(DataSetNotificationTemplate.sendStrategy)
        .optional(),
    notifyUsersInHierarchyOnly: z.boolean().optional(),
})

export const dataSetNotificationTemplateFormSchema =
    dataSetNotificationTemplateBaseSchema.merge(identifiable).extend({
        dataSetNotificationTrigger: z.nativeEnum(
            DataSetNotificationTemplate.dataSetNotificationTrigger
        ),
        notificationRecipient: z.nativeEnum(
            DataSetNotificationTemplate.notificationRecipient
        ),
    })

export const dataSetNotificationTemplateListSchema =
    dataSetNotificationTemplateBaseSchema.merge(withDefaultListColumns)

export const initialValues = getDefaultsOld(
    dataSetNotificationTemplateFormSchema
) as DataSetNotificationResult

export const validate = createFormValidate(
    dataSetNotificationTemplateBaseSchema
)

/**
 * Converts form values back to API payload
 */

export type DataSetNotificationFormattedResult = Omit<
    DataSetNotificationResult,
    | 'relativeScheduledDays'
    | 'recipientUserGroup'
    | 'dataSets'
    | 'notifyUsersInHierarchyOnly'
> & {
    relativeScheduledDays?: number
    recipientUserGroup?: { id: string }
    dataSets?: { id: string }[]
    notifyUsersInHierarchyOnly?: DataSetNotificationResult['notifyUsersInHierarchyOnly']
}

export const transformFormValues = <
    TValues extends Partial<DataSetNotificationResult>
>(
    values: TValues
): DataSetNotificationResult => {
    const {
        recipientUserGroup,
        relativeScheduledDays,
        notifyUsersInHierarchyOnly,
        dataSets = [],
        ...rest
    } = values

    return {
        ...rest,
        relativeScheduledDays:
            rest.dataSetNotificationTrigger === 'SCHEDULED_DAYS' &&
            relativeScheduledDays
                ? Number(relativeScheduledDays)
                : undefined,
        recipientUserGroup:
            rest.notificationRecipient === 'USER_GROUP' &&
            recipientUserGroup?.id
                ? { id: recipientUserGroup.id }
                : undefined,
        notifyUsersInHierarchyOnly:
            rest.notificationRecipient === 'USER_GROUP' && recipientUserGroup
                ? Boolean(notifyUsersInHierarchyOnly)
                : undefined,
        dataSets: dataSets.map(({ id }) => ({ id })),
    } as unknown as DataSetNotificationResult
}

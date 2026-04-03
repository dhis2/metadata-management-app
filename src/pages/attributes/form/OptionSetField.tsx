import i18n from '@dhis2/d2-i18n'
import React, { useCallback } from 'react'
import { useHref } from 'react-router'
import { EditableInputWrapper } from '../../../components'
import {
    ModelSingleSelectFormField,
    useRefreshModelSingleSelect,
} from '../../../components/metadataFormControls/ModelSingleSelect'

export const OptionSetField = () => {
    const newOptionSetLink = useHref('/optionSets/new')
    const refreshOptionSet = useRefreshModelSingleSelect({
        resource: 'optionSets',
    })
    const inputWrapper = useCallback(
        (select: React.ReactElement) => (
            <EditableInputWrapper
                onRefresh={() => refreshOptionSet()}
                onAddNew={() => window.open(newOptionSetLink, '_blank')}
            >
                {select}
            </EditableInputWrapper>
        ),
        [refreshOptionSet, newOptionSetLink]
    )

    return (
        <ModelSingleSelectFormField
            inputWidth="400px"
            name="optionSet"
            label={i18n.t('Option set')}
            query={{
                resource: 'optionSets',
                params: {
                    fields: 'id,displayName,valueType',
                    order: 'displayName:iasc',
                },
            }}
            helpText={i18n.t(
                'Limit input to a set of predefined options. An option set will automatically set the value type.'
            )}
            clearable={true}
            clearText={i18n.t('Remove option set')}
            dataTest="formfields-optionSet"
            inputWrapper={inputWrapper}
        />
    )
}

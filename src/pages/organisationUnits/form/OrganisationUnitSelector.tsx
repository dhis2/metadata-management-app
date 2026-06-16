import i18n from '@dhis2/d2-i18n'
import { Field, NoticeBox, OrganisationUnitTree } from '@dhis2/ui'
import { IconInfo16 } from '@dhis2/ui-icons'
import React, { useMemo } from 'react'
import { useField } from 'react-final-form'
import { useSystemOrgUnits } from '../../../lib/'
import classes from './OrganisationUnitSelector.module.css'

export function OrganisationUnitSelector() {
    const fieldName = 'parent'
    const { input, meta } = useField(fieldName, {
        format: (value) => value,
        validate: (value) =>
            !value && systemRootOrgUnits.length > 0 ? 'Required' : undefined,
    })
    const systemRootOrgUnits = useSystemOrgUnits()
    const systemRootOrgUnitsIds = useMemo(
        () => systemRootOrgUnits.map((unit) => unit.id),
        [systemRootOrgUnits]
    )
    const systemRootOrgUnitsPaths = useMemo(
        () => systemRootOrgUnits.map((unit) => unit.path),
        [systemRootOrgUnits]
    )

    const { initiallyExpanded, selectedPath } = useMemo(() => {
        const selectedPath: string[] = input.value?.path
            ? [input.value.path]
            : []
        return {
            initiallyExpanded: [...systemRootOrgUnitsPaths, ...selectedPath],
            selectedPath,
        }
    }, [systemRootOrgUnitsPaths, input])

    const handleChange = (orgUnit: {
        displayName: string
        id: string
        path: string
    }) => {
        input.onChange({
            displayName: orgUnit.displayName,
            id: orgUnit.id,
            path: orgUnit.path,
        })
        input.onBlur()
    }

    return (
        <Field
            name="parent"
            error={meta.touched && meta.error}
            validationText={meta.touched ? meta.error : undefined}
        >
            {systemRootOrgUnits.length > 0 ? (
                <>
                    <div className={classes.selectedOrgUnitBox}>
                        <OrganisationUnitTree
                            key={initiallyExpanded.join(',')}
                            onChange={handleChange}
                            singleSelection
                            roots={systemRootOrgUnitsIds}
                            selected={selectedPath}
                            initiallyExpanded={initiallyExpanded}
                        />
                    </div>
                    {input.value?.displayName && (
                        <div className={classes.selectedOrgUnitInfo}>
                            <IconInfo16 />
                            <p>
                                {i18n.t(
                                    'Organisation unit will be positioned inside {{displayName}}',
                                    { displayName: input.value.displayName }
                                )}
                            </p>
                        </div>
                    )}
                </>
            ) : (
                <NoticeBox title={i18n.t('Creating first organisation unit')}>
                    {i18n.t(
                        'This is the first organisation unit and will be created as the root of the hierarchy.'
                    )}
                </NoticeBox>
            )}
        </Field>
    )
}

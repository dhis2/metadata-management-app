import i18n from '@dhis2/d2-i18n'
import { startCase } from 'lodash'
import React, { createContext, useState } from 'react'
import { useFormState } from 'react-final-form'
import { ValuesWithAttributes } from '../../../components/form/attributes/CustomAttributes'
import { SectionDescriptor, SectionedFormDescriptor } from './types'

/* Some of the types in this file may look complex.
    However they are here to help type-safety and autocommpletion for consumers.

    The only thing consumers need to do is pass the type of the formdescriptor to use the context.
        useSectionedFormDescriptor<typeof FormDescriptor>()
    This helps usage in specific form components.
*/

type AllFieldNames<T extends SectionedFormDescriptor> =
    T['sections'][number]['fields'][number]['name']

/* Helper to avoid returning undefined from a map when we know we have the value from the type.
And conversely - add undefined to TType if we dont have a specifc type for T*/
type EnforceIfInferrable<
    T extends SectionedFormDescriptor,
    TType
> = T extends SectionedFormDescriptor<infer U>
    ? unknown extends U
        ? TType | undefined
        : TType
    : never

function createContextValue<const T extends SectionedFormDescriptor>(
    descriptor: T
) {
    const fieldLabels = Object.fromEntries(
        descriptor.sections.flatMap((section) =>
            section.fields.map((f) => [f.name, f.label] as const)
        )
    ) as Record<AllFieldNames<T>, EnforceIfInferrable<T, string>>

    const sectionMap = Object.fromEntries(
        descriptor.sections.map((s) => [s.name, s])
    ) as Record<
        T['sections'][number]['name'],
        EnforceIfInferrable<T, SectionDescriptor>
    >

    const sections: T['sections'] = descriptor.sections
    return {
        formName: descriptor.name,
        formLabel: descriptor.label,
        sections,
        getSection: (name: T['sections'][number]['name']) => sectionMap[name],
        getFieldLabel: (field: AllFieldNames<T>) => {
            return fieldLabels[field] ?? startCase(field)
        },
    }
}

type SectionFormContextValue<T extends SectionedFormDescriptor> = ReturnType<
    typeof createContextValue<T>
>

export const SectionedFormContext = createContext<ReturnType<
    typeof createContextValue
> | null>(null)

export const SectionedFormProvider = <T extends SectionedFormDescriptor>({
    children,
    formDescriptor,
    attributesSectionName,
}: {
    formDescriptor: T
    children: React.ReactNode
    attributesSectionName?: string
}) => {
    const formState = useFormState<ValuesWithAttributes>({
        subscription: { initialValues: true },
    })
    const customAttributes = formState.initialValues.attributeValues?.map(
        (av) => av.attribute
    )

    const formDescriptorMaybeWithAttributes =
        customAttributes && customAttributes.length > 0
            ? {
                  ...formDescriptor,
                  sections: [
                      ...formDescriptor.sections,
                      {
                          name: attributesSectionName ?? 'attributes',
                          label: i18n.t('Attributes'),
                          fields: [
                              {
                                  name: 'attributeValues',
                                  label: i18n.t('Attributes'),
                              },
                          ],
                      },
                  ],
              }
            : formDescriptor
    const [contextValue] = useState(() =>
        createContextValue(formDescriptorMaybeWithAttributes)
    )

    return (
        <SectionedFormContext.Provider value={contextValue}>
            {children}
        </SectionedFormContext.Provider>
    )
}

export const useSectionedFormContext = <
    T extends SectionedFormDescriptor
>() => {
    const context = React.useContext(SectionedFormContext)
    if (!context) {
        throw new Error(
            'useSectionedFormDescriptor must be used within a SectionedFormDescriptorProvider'
        )
    }
    return context as SectionFormContextValue<T>
}

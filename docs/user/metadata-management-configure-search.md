# Configure search { #mmp_configure_search }

This chapter explains how to configure which attributes users can search for in a tracker program or in a tracked entity type, and how to give users search organisation units.

> **Note**
>
> The **Metadata Management** app replaces the functionality of the Maintenance app.
> If your instance does not have the **Metadata Management** app installed, use the Maintenance app instead. See [Configure programs in the Maintenance app](#configure_programs_in_maintenance_app).

You can give users search organisation units. This lets them search for tracked entity instances outside their data capture organisation units.

Users can search in the context of a program or in the context of a tracked entity type:

- To let users search in the context of a program, make some of the tracked entity attributes of the program searchable.
- To let users search in the context of a tracked entity type, make some of the attributes of the tracked entity type searchable.

For the other settings of a program, see [Configure programs (Metadata Management app)](#mmp_configure_programs). For the form of a tracked entity type and a tracked entity attribute, see [Tracked entity types, tracked entity attributes, and relationship types](#mmp_tracked_entity_relationship).

> **Background and reference**
>
> For background and concepts, see [Understanding programs, tracker configuration, and program disaggregation](#understanding_programs_and_tracker).

## Configure search for a tracker program { #mmp_configure_search_tracker_program }

To search in the context of a program, make some of the program attributes searchable. Unique program attributes are always searchable.

1. Open the **Metadata Management** app and click **Programs** > **Programs**.

2. Open or create a tracker program.

3. Go to the **Enrollment: Data** section.

4. If the program has no attributes, choose the attributes that you need.

5. In the **Manage attributes** table, choose **Searchable** for each attribute that users can search with.

6. Click **Save and close**.

The app disables **Searchable** for a unique attribute and shows the tooltip **Unique attributes are always searchable**.

Searchable program attributes belong to one of two search groups:

- **Unique group.** There is one group for each unique program attribute. A search cannot combine a unique attribute with other program attributes. The search result is 0 or 1 tracked entity instance.
- **Non-unique group.** This group contains all non-unique program attributes. A search can combine several of these attributes.

You can set two limits for a program search. Both are in the **Program Details** section of the program:

- **Minimum number of attributes required to search.** This sets how many of the non-unique attributes a user must enter before a search can run. The default is 1.
- **Maximum number of search results to display.** This sets how specific a search must be. It limits the number of matching tracked entities that a user can get for the search criteria. If the number of matching records is larger than this limit, the server rejects the search with an error instead of returning a partial list. The user must then enter more specific search criteria to reduce the number of matching records. Enter 0 to show all search results. The default is 0. For more information, see [Tracked entities collection limits](../developer/web-api/tracker.md#tracked-entities-collection-limits).

> **Note**
>
> The maximum limit applies only when the user searches outside the capture organisation units of the user. Within the capture scope, the user can see any number of results.

## Configure search for a tracked entity type { #mmp_configure_search_tracked_entity_type }

To search without a program, make some of the attributes of the tracked entity type searchable. Unique attributes of the tracked entity type are always searchable.

1. Open the **Metadata Management** app and click **Programs** > **Tracked entity types**.

2. To edit a tracked entity type, click its options menu and choose **Edit**.

3. Go to the **Tracked entity attributes** section.

4. If the tracked entity type has no attributes, choose the attributes that you need.

5. In the **Manage attributes** table, choose **Searchable** for each attribute that users can search with.

6. Click **Save and close**.

The app disables **Searchable** for a unique attribute and shows the tooltip **Unique attributes are always searchable**. The app also disables **Searchable** for attributes of the value types **Image** and **File**, and shows the tooltip **Image and File type attributes are not searchable**.

Searchable attributes of a tracked entity type belong to one of two search groups:

- **Unique group.** There is one group for each unique attribute. A search cannot combine a unique attribute with other attributes. The search result is 0 or 1 tracked entity instance.
- **Non-unique group.** This group contains all non-unique attributes. A search can combine several of these attributes.

You can set two limits for a tracked entity type search. Both are in the **Basic information** section of the tracked entity type:

- **Minimum number of attributes required to search.** This sets how many of the non-unique attributes a user must enter before a search can run. The value must be 1 or greater. The default is 1.
- **Maximum number of tracked entity instances to return when searching.** This sets how specific a search must be. It limits the number of matching tracked entity instances that a user can get for the search criteria. If the number of matching records is larger than this maximum, DHIS2 does not return them. The user must enter more specific search criteria to reduce the number of matching records. Enter 0 to show all search results. The default is 0.

> **Note**
>
> The maximum applies only to search results outside the capture organisation units of the user. Within the capture scope, the user can see any number of results.

## Configure search organisation units for a user { #mmp_configure_search_org_units }

To search in organisation units other than their data capture organisation units, a user needs search organisation units. A search organisation unit also gives the user access to search in all children of that organisation unit.

You configure this in the Users app, not in the **Metadata Management** app.

1. Open the Users app.

2. In the **Actions** column, open the menu of the user and choose **Edit**.

3. Go to the **Organisation unit access** section.

4. In **Search**, choose the organisation units.

5. Click **Save changes**.

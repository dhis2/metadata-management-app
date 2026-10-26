# Manage data approval { #mm_manage_data_approval }

This chapter explains how to configure data approval levels and data approval workflows in the **Metadata Management** app. You configure approval here, and users approve data in the **Data Approval** app.

> **Note**
>
> The **Metadata Management** app replaces the functionality of the Maintenance app.
> If your instance does not have the **Metadata Management** app installed, use the Maintenance app instead. See [Configure metadata](#maintenance_app).

> **Background and reference**
>
> For background on approval levels, workflows, and attribute option combos, see [Understanding data approval](#understanding_data_approval).
> For an overview of all parts of data approval, see [Approving data](#approving_data).

The **Data approval** section of the sidebar has two pages. The following table shows the objects that you can manage.

Table: Data approval objects in the Metadata Management app

| Object type | Available functions |
|---|---|
| Data approval level | Create, edit, clone, and delete |
| Data approval workflow | Create, edit, clone, and delete |

For **Clone** and **Delete**, see [Common actions](#mm_common_actions).

To set up data approval, do the following in order:

1. Create the data approval levels. See [Create or edit a data approval level](#mm_create_approval_level).
2. Create a data approval workflow that uses the levels. See [Create or edit a data approval workflow](#mm_create_approval_workflow).
3. Assign the workflow to each data set that needs approval. See [Assign a workflow to a data set](#mm_assign_approval_workflow).

## Create or edit a data approval level { #mm_create_approval_level }

Before you start, make sure that the organisation unit level where you want approval exists. If you want to approve by category option group set, create the category option group set first. See [Organisation unit levels](#mm_manage_organisation_unit_levels) and [Approving by category option group set](#data_approvals_approving_by_cogs).

1. Open the **Metadata Management** app and click **Data approval** > **Data approval levels**.
2. To create a data approval level, click **New**. To edit one, click the options menu of the level and choose **Edit**.
3. Enter a **Name**.
4. In **Organisation unit level**, choose the organisation unit level where data is approved.
5. Optional: In **Category option group set**, choose a category option group set. Approval at this level then covers the category option groups of this set.
6. Click **Save**.

The **Data approval levels** list shows the new level. The **Level** column shows the position of the level in the approval order. Level 1 is the highest level. DHIS2 sets the position when you save, so you cannot change the order in the app. For how DHIS2 orders the levels, see [Approval levels and workflows](#data_approvals_configuration).

You cannot create two data approval levels with the same **Organisation unit level** and the same **Category option group set**. If you try, the app shows the message **An approval level for this organisation unit level and category option group set combination already exists.**

## Create or edit a data approval workflow { #mm_create_approval_workflow }

Before you start, create the data approval levels that the workflow uses. If the data sets of the workflow use a category combination that is not the default, create that category combination first.

1. Open the **Metadata Management** app and click **Data approval** > **Data approval workflows**.
2. To create a data approval workflow, click **New**. To edit one, click the options menu of the workflow and choose **Edit**.
3. Enter a **Name**.
4. In **Period type**, choose the period type of the data that you approve, for example **Monthly**.
5. In **Data approval levels**, choose one or more levels.
6. In **Category combination**, choose the category combination of the data sets in the workflow. Choose **default** if the data sets do not use a category combination.
7. Click **Save**.

The **Data approval workflows** list shows the new workflow, with its **Period type**.

The **Category combination** of the workflow decides which attribute option combos you can approve. DHIS2 accepts an approval only for an attribute option combo of this category combination. See [Attribute option combos and approval](#data_approvals_aoc).

## Assign a workflow to a data set { #mm_assign_approval_workflow }

A data set is subject to approval only if it has a workflow. Data sets that you want to approve together share one workflow. Data sets that you want to approve separately each have their own workflow.

1. Open the **Metadata Management** app and click **Data sets** > **Data sets**.
2. Click the options menu of the data set and choose **Edit**.
3. In the **Validation** section, choose a workflow in **Approval workflow**. The menu lists the workflows that have the category combination of the data set. It also lists the workflows that have no category combination.
4. Click **Save**.

To remove approval from a data set, clear **Approval workflow** and save the data set. For the other settings of a data set, see [Create or edit a data set](#mm_create_data_set).

## See also { #mm_approval_see_also }

- [Approving data](#approving_data)
- [Understanding data approval](#understanding_data_approval)
- [Data Approval](#data_approval_app)
- [Acceptance required before approval](#system_general_settings) in the **System Settings** app

# Form state

We're using React Form Hook for managing our forms. As this is the first time
we use that library at DHIS2 and we don't know if the library provides all the
functionality that we need, we can fall back to React Final Form as we have
some experience with that library already.

## Decisions

-   [Managing form state with react-form-hook](./decisions/0002-form-state.md)

## Organisation unit group membership diff PoC (DHIS2-20613)

Existing organisation unit groups use `useOnSubmitOrganisationUnitGroup`.
It compares member IDs with the form's initial values through the reusable
`computeCollectionDiff` helper. Order and display properties do not affect membership.

Saving first PATCHes dirty non-member fields, if any. It excludes
`organisationUnits` and its nested fields from that PATCH. It then sends one
`POST organisationUnitGroups/{id}/organisationUnits` with
`{ additions: [{ id }], deletions: [{ id }] }`, only when membership changes.
A membership-only edit never PATCHes the group. Success uses the existing alert,
query invalidation and Save / Save and close navigation.

The requests are not atomic. A failed PATCH stops the save before membership
changes. A failed collection request keeps the form open and reports the error;
if other fields were saved, the error says so. There is no automatic retry or
rollback. Creating and cloning groups, other metadata sections, and loading the
member list remain unchanged. A non-member PATCH still uses the server's normal
metadata import path, so mixed edits do not avoid all large-group server costs.

To try this branch against a disposable 2.43 or master server:

1. Use the Node version in `.nvmrc`, install dependencies with `yarn install`,
   and run `yarn start`. For a remote server, use `yarn start --proxy <server-url>`
   and select the proxy URL printed by the dev server when logging in.
2. Open `#/organisationUnitGroups/<group-id>` with an account that can edit it.
   Open the browser Network panel, add a few members and remove a few, then save.
3. Check that the only write is the collection POST and its arrays contain only
   the added and removed IDs. Reload and check membership.
4. Change the name and membership together. Check that a name-only PATCH precedes
   the collection POST. Try unchanged membership, Save without closing, and Save
   and close. A second save after the form refresh should send no writes.
5. Block the collection request in browser developer tools to inspect the
   partial-save error. Unblock it before manually retrying or reloading.

The PoC includes helper and submit-hook unit tests. It has not been built,
formatted, linted, tested, or benchmarked as part of this implementation.

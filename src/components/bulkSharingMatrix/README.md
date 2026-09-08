# Bulk sharing matrix (prototype)

Throwaway prototype for an advanced bulk sharing editor. **Nothing here talks to
the API.** Entry point is the "Bulk sharing (prototype)" button on any metadata
list toolbar; delete this folder and the button in
`sectionList/toolbar/ToolbarNormal.tsx` to remove it.

The job it is built against: _see current sharing across a selection_ **and**
_change it either granularly or generically_. The existing
`sectionList/bulk/BulkSharing.tsx` only does the second half — it is write-only
and never reads current state.

## Decisions this implements

| #   | Decision                                             | Note                                                                                                                  |
| --- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 1   | Columns are objects, virtualised                     | Only ~6 fit on screen. Accepted with eyes open; see _Known risk_ below.                                               |
| 2   | Every row has a pinned, editable aggregate cell      | Recovers the at-a-glance read that virtualisation costs. Editing it writes down the whole row.                        |
| 3   | Two cell values + an orthogonal `touched` flag       | There is no "unset" access level. Save emits ops **only** for touched cells, so the matrix is safe as a partial view. |
| 4   | Public access is a pinned first row                  | `external` and `owner` are out of scope — neither is matrix-shaped.                                                   |
| 5   | Green = additive, red = removal, hue only            | Per sub-cell, since each axis is a total order. **Ship blocker** — see below.                                         |
| 6   | Revert row + discard all                             | No cell-level revert: a cell click is already the level picker.                                                       |
| 7   | Column menu leads with "Copy sharing to all objects" | The operation only a matrix can offer. Set-all lives on the Metadata/Data sub-headers, at the scope it applies to.    |
| 8   | Rows: public, then groups A–Z, then users A–Z        | Matches the single-object sharing dialog.                                                                             |
| 9   | Adversarial fixtures with a size switcher            | 8 / 40 / 100 objects, outliers buried past the visible columns.                                                       |

## Visual language

Level chips follow the Metabase permissions style: a rounded icon chip where
both glyph and colour encode the level (pencil = edit, eye = view, cross = no
access). Because the glyph carries the level, dense cells drop their text
labels, which is the only reason ~8 object columns fit on screen instead of ~6.

Four deliberate departures from the reference:

-   **No access is white with a dotted border, not a filled tint.** Most cells
    in a real selection are "no access", and it is the safe, empty state — it
    should recede furthest of the four, further than a light grey fill would.
    Painting the background state in a loud colour (as the reference's solid
    red does) inverts the hierarchy and drowns the outliers.
-   **Chips are a light tint with a coloured icon**, not a saturated fill with
    a white icon. Forty columns of saturated chips is exhausting to read, and
    the glyph already carries the level.
-   **Edit is green, view is blue.** Neither reads as a warning, which matters
    once mixed and diff states also need colours and there are only so many
    that don't.
-   **Mixed is a state, not an annotation.** An aggregate over 39 "View only"
    and one "Edit and view" is not "View only" — that label is false for the
    fortieth object, and the fortieth is the one you opened the drawer to find.
    Mixed rows get a static yellow chip with the "multiple" glyph and an
    italic "Mixed" label; exact counts are in the cell's tooltip. Yellow reads
    as "needs attention" rather than a fifth access level, since none of
    green, blue or grey describes "disagreement" — and it matches the by-object
    overview's deviation dot, which is the same signal from the other axis.

The diff treatment sits on a different layer from the level: a very pale field
plus a 4px rail on the cell, under the chip, so "what it is" and "what changed"
never compete for the same pixels. The field is 050-level precisely because the
chips are 100-level — otherwise an "edit" chip would vanish into an "added"
field.

## The three views

**Summary (default).** No frozen panes, no windowing, no horizontal scroll —
just rows, in a constrained centred column rather than a full-bleed grid. It is
modelled on a space-permissions settings page: avatar plus two-line identity,
a quiet text header instead of a filled bar, 60px rows, and full access labels.
The drawer title ("Update sharing for N objects") lives here too, on the same
line as the view switcher, rather than in the drawer's own header bar — the
drawer chrome only holds the prototype size switcher and the close button.
Bulk editing works fully here, because the aggregate cell _is_ the row control.

Only the matrix earns edge-to-edge width — a table that spans the whole drawer
signals "dense data to scan", which is wrong for a list of eighteen rows.
The level legend is likewise matrix-only (cells there are icon-only, so it is
needed); the diff legend appears only once something has actually changed.

**By object.** The same selection from the other direction, because people
conceptualise a batch either way: "what can this group reach?" versus "is this
object configured like the others?". It cannot be a transpose of the by-entity
view — a fixed entity has one level per object, but a fixed object has one level
per _entity_, so there is no single value for a cell. Instead a row carries the
level composition per axis plus a deviation flag, and its menu offers the
object-scoped actions (copy to all, clear).

This mirrors `RoleAccess` in the Programs form, which already lists program
stages flagged against their program's sharing with an "apply" action, using
`areSharingPropertiesSimilar`.

It also closes the gap left open by decision 1: the by-entity aggregate tells
you a row is Mixed but never which of the 40 objects is the odd one. The
by-object list answers exactly that, without horizontal scrolling.

**Full matrix.** Everything above: per-object columns, frozen panes, column
windowing, per-cell editing. The drill-down for either overview, and the only
view that can **transpose**.

Transposing swaps which axis is horizontal. It is one grid parameterised, not a
second grid: every underlying operation is already symmetric because a cell is
an `(entity, object)` pair either way, so only four content slots differ —
the frozen name, the frozen summary, the column-header menu and the row menu.
The grid mechanics (windowing, spacers, sticky panes, diff rendering) are
shared, which is what stops the two orientations from drifting apart.

Two things do _not_ survive the rotation symmetrically, and both follow from
the same asymmetry as the by-object overview:

-   **The frozen summary changes kind.** An entity row shows one editable
    aggregate level per axis; an object row shows the level composition,
    read-only, because it has one level per _entity_ and so no single value to
    set. Its bulk edits live in the row menu instead.
-   **Adding a user or group is hidden when transposed**, because it would add
    a _column_, and the add control is a row.

Transposing is usually the cheaper layout: it puts the larger axis on the
vertical, where scrolling is free. 40 objects × 18 entities is 40 rows and 18
columns transposed, versus 18 rows and 40 columns not.

That split maps onto the halves of the job: the overviews are _see and edit
generically_, the matrix is _edit granularly_.

Consistency is computed against the **most common configuration** in the
selection, not against a parent — a bulk selection has no parent object. When
every object is unique there is no majority, so nothing is marked consistent
rather than marking one arbitrary object as the reference.

Because the summary view has no per-object cells to colour, the aggregate cell
carries the diff itself. A row-axis can move both ways at once — set a mixed row
to "View only" and some objects gain access while others lose it — so there is a
third diff state (`both`, neutral blue) that no individual cell can ever show.

## Control shape

The level control (aggregate cell, column-header set-all) is **borderless**,
full width, with the chevron pinned to the cell's far edge via
`margin-inline-start: auto` on the chevron rather than any border on the
button. A bordered pill was tried first and reverted — stacked down a column
it reads as a wall of form fields, and it fights the diff tint, which is
itself a full-bleed background plus a rail (see below). Hover uses `outline`,
not a background tint, because a hover _background_ would outrank the plain
`.added`/`.removed` classes (a pseudo-class beats a plain class at equal
specificity) and mask the diff colour on hover.

## Known risk being tested

Whether a horizontally scrolling per-object matrix is navigable enough to
**find** an inconsistency. The aggregate cell tells you a row is `Mixed`; nothing
tells you which of the 40 columns is the odd one out.

The fixtures are hostile on purpose. In the 40-object preset the outliers sit at
columns 9, 24 and 36 — the one at column 24 is public access quietly escalated to
edit, which is the scenario the whole component exists for. If the prototype
feels fine, check that you actually found them.

The scroll track above the grid marks where **your own** changes are, so you can
navigate back to them. It deliberately does not mark the seeded outliers.

## Ship blockers if this becomes real

-   **Colour is the only channel carrying grant-vs-revoke.** ~8% of men have
    red-green deficiency, and green-for-grant paints the risky direction as
    success while a correct lockdown reads as a wall of errors. Needs a direction
    glyph or an old→new transition in the cell.
-   No handling of objects the current user lacks rights to re-share.
-   No partial-failure story for a save across N objects.
-   No review step between Apply and commit.

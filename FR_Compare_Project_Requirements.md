# FR Compare — Supplier Quotation Comparison System
## Complete Project Requirements & Development Blueprint

> **Project Type:** Full-Stack MERN Web Application  
> **Architecture:** MERN Stack + MVC-style Backend Structure  
> **Scope Rule:** Use only technologies and concepts covered in the course materials: HTML, CSS, Bootstrap, JavaScript/ES6, React, React Router, React Hooks/Context, Axios, LocalStorage, Node.js, Express.js, REST APIs, MongoDB, Mongoose, JWT, bcrypt/bcryptjs, middleware, Multer image upload, search, pagination, `.env`, and Postman/manual API testing.

---

# 1. Final Project Name

## **FR Compare**
**Supplier Quotation Comparison System**

The official project name selected for development is **FR Compare**.

Recommended full academic title:

> **FR Compare — Supplier Quotation Management and Comparison System**

Recommended short description:

> A full-stack MERN web application for managing suppliers, RFQs, supplier quotations, cost calculations, side-by-side offer comparison, savings analysis, and quotation selection.

---

# 2. Project Overview

**FR Compare** is a supplier quotation management and comparison system for small businesses, offices, purchasing teams, workshops, university departments, or any organization that requests prices from multiple suppliers.

Instead of comparing quotations manually using paper, WhatsApp messages, spreadsheets, or calculators, the user can:

1. Create suppliers.
2. Create a Request for Quotation (RFQ).
3. Add the products/items required.
4. Enter quotations received from different suppliers.
5. Enter each supplier's price for every requested item.
6. Automatically calculate totals.
7. Compare all quotations side-by-side.
8. Highlight the cheapest quotation.
9. Compare prices per item.
10. Select the preferred supplier.
11. Keep a history of RFQs and quotations.
12. Search, filter, and review previous purchasing decisions.

The project should look like a real business system, not a simple CRUD application.

---

# 3. Problem Statement

Businesses often receive multiple supplier quotations for the same purchasing request.

Typical problems include:

- Quotations arrive from different suppliers in different formats.
- Prices must be compared manually.
- Item quantities can make manual calculations difficult.
- The cheapest overall supplier may not have the cheapest price for every item.
- Old quotations are difficult to find.
- Supplier information is scattered.
- Purchasing decisions are not stored in an organized system.
- It is difficult to know how much money was saved by choosing one quotation over another.

**FR Compare solves this by centralizing suppliers, RFQs, quotations, calculations, and comparison results in one system.**

---

# 4. Project Objectives

The system must:

- Provide a secure user account system.
- Allow each logged-in user to manage only their own business data.
- Manage supplier information.
- Maintain a reusable item/product catalog for each logged-in user.
- Manage purchasing requests / RFQs.
- Manage multiple items inside each RFQ using catalog-linked item snapshots.
- Store quotations from multiple suppliers.
- Calculate quotation totals automatically.
- Compare quotations.
- Highlight the lowest total quotation.
- Show the lowest price per requested item.
- Calculate possible savings.
- Calculate a Split Award scenario using the cheapest supplier per item.
- Calculate a user-configurable Weighted Score to show Best Value in addition to Cheapest.
- Allow completed RFQs to create supplier ratings and notes.
- Show historical paid-price information for catalog items from completed purchasing decisions.
- Allow a quotation to be selected as the winner.
- Provide search and filtering.
- Provide pagination where lists become large.
- Support quotation/supplier images using Multer.
- Provide a responsive interface for desktop, tablet, and mobile.
- Demonstrate the concepts covered throughout the course.

---

# 5. Project Scope

## 5.1 Included in Version 1

### Authentication
- Register
- Login
- Logout
- JWT authentication
- Password hashing
- Protected API routes
- Logged-in user data ownership

### Supplier Management
- Create supplier
- View suppliers
- View supplier details
- Edit supplier
- Delete supplier
- Search suppliers
- Upload supplier logo/image
- View supplier average rating, rating count, and RFQ wins when data exists

### Item / Product Catalog
- Create reusable catalog items
- View/edit/delete catalog items
- Prevent duplicate item names for the same user through normalized naming
- Search/filter catalog items
- Reuse catalog items inside RFQs through a simple HTML/React autocomplete approach
- Preserve item snapshots inside RFQs so historical RFQs do not change when the catalog item is edited later

### RFQ Management
- Create RFQ
- Add multiple requested items
- Edit RFQ
- Delete RFQ
- View RFQ details
- Search/filter RFQs
- RFQ status management

### Quotation Management
- Add quotation to an RFQ
- Choose supplier
- Enter price for each requested item
- Add notes
- Add delivery time
- Add quotation date
- Add validity date
- Upload quotation image
- Edit quotation
- Delete quotation
- Mark quotation as selected/winner

### Comparison
- Compare quotations for one RFQ
- Calculate item line totals
- Calculate quotation grand total
- Find lowest total quotation
- Find highest total quotation
- Calculate savings
- Find cheapest supplier for each individual item
- Calculate Split Award / mixed-basket item total
- Compare Best Single Supplier with Split Award at subtotal level
- Calculate a Weighted Score for Best Value using user-defined price, delivery, and supplier-rating weights
- Display side-by-side comparison table

### Supplier Rating & Price History
- Rate the selected supplier after an RFQ is completed
- Rating is 1–5 plus an optional note
- One supplier rating per completed RFQ
- Show supplier average rating and RFQ win count
- Show the last paid price for a catalog item from previously selected quotations
- Optionally show historical minimum, maximum, and average paid item prices using normal Mongoose queries plus JavaScript calculations
- Do not require MongoDB Aggregation Pipeline / `aggregate()` for Version 1

### Dashboard
- Total suppliers
- Total RFQs
- Open RFQs
- Completed RFQs
- Total quotations
- Selected quotations
- Recent RFQs
- Basic purchasing/savings summary

### UI/UX
- Responsive layout
- Bootstrap forms, tables, buttons, cards, navbars, modals
- CSS Grid and Flexbox
- Search fields
- Filters
- Pagination
- Empty states
- Loading states
- Error messages
- Confirmation before destructive actions

---

# 6. Explicitly Out of Scope

To respect the requirement to use only course technologies/concepts, Version 1 will **not** require:

- AI / machine learning
- Chatbot
- Socket.io / real-time updates
- TypeScript
- Redux
- Next.js
- Angular
- Payment gateway
- Email notifications
- SMS notifications
- Push notifications
- QR codes
- Maps
- Cloudinary
- Firebase
- WebSockets
- GraphQL
- Complex role-based access control
- Supplier login portal
- Admin/employee multi-role workflow
- PDF generation
- Excel import/export
- External procurement APIs
- Advanced chart libraries

These can be future enhancements, but they are not required for the course project.

---

# 7. Primary User

Version 1 has one application user type:

## Business User / Purchasing User

The authenticated user can:

- Manage suppliers.
- Manage their reusable item/product catalog.
- Create RFQs.
- Add quotation data received from suppliers.
- Compare quotations using cheapest-offer, Split Award, and Weighted Score analysis.
- Select a winning quotation.
- Rate the selected supplier after completion.
- Review historical paid prices for catalog items.
- View their own dashboard and records.

Suppliers are stored as business records, not login accounts.

This keeps authentication and authorization aligned with the course's user-specific data pattern.

---

# 8. Main Business Workflow

```text
Register / Login
      |
      v
Dashboard
      |
      +-------------------+
      |                   |
      v                   v
Manage Suppliers      Create RFQ
                          |
                          v
                   Add Required Items
                          |
                          v
                   Save / Open RFQ
                          |
                          v
               Add Supplier Quotation
                          |
                          v
               Enter Item Unit Prices
                          |
                          v
                  Calculate Totals
                          |
                          v
                Add More Quotations
                          |
                          v
                Compare Quotations
                          |
                          v
               Select Best Quotation
                          |
                          v
                   Complete RFQ
```

---

# 9. RFQ Lifecycle

Recommended RFQ statuses:

```text
Draft
  ↓
Open
  ↓
Under Comparison
  ↓
Completed
```

Optional status:

```text
Cancelled
```

## Status Meaning

### Draft
The purchasing request is still being prepared.

### Open
The RFQ is ready and quotations can be entered.

### Under Comparison
At least two quotations exist and the user is reviewing the offers.

### Completed
A winning quotation has been selected and the purchasing decision is finished.

### Cancelled
The purchasing request was cancelled.

---

# 10. Quotation Lifecycle

Recommended quotation statuses:

- Received
- Selected
- Rejected

Only one quotation should normally be selected as the winner for an RFQ.

When a quotation becomes `Selected`, other quotations for the same RFQ may remain `Received` or be changed to `Rejected`.

---

# 11. Functional Requirements

## FR-01 — User Registration

The system shall allow a user to register using:

- Name
- Email
- Password
- Confirm Password

### Validation
- Name is required.
- Email is required.
- Email format must be valid.
- Password is required.
- Password and confirmation must match.
- Duplicate email addresses must not be allowed.
- Password must be hashed before saving.

---

## FR-02 — User Login

The system shall allow registered users to log in using:

- Email
- Password

If credentials are correct:

- Backend creates a JWT.
- Frontend stores the JWT in `localStorage`.
- User is redirected to the dashboard.

If credentials are incorrect:

- Display a clear error message.

---

## FR-03 — Logout

The user shall be able to log out.

Logout behavior:

- Remove JWT token from `localStorage`.
- Clear authentication state.
- Redirect to Login page.

---

## FR-04 — Protected Routes

Unauthenticated users must not access:

- Dashboard
- Suppliers
- RFQs
- Quotations
- Comparison pages

Protected API routes must verify the JWT using Express middleware.

---

## FR-05 — Data Ownership

Every supplier, RFQ, and relevant business record must belong to the logged-in user.

The backend shall use the authenticated user's ID when:

- Creating records.
- Reading records.
- Updating records.
- Deleting records.

A user must never be able to edit or delete another user's records.

---

# 12. Supplier Management Requirements

## FR-06 — Create Supplier

Supplier fields:

- Supplier Name *
- Contact Person
- Email
- Phone
- Address
- Category
- Notes
- Supplier Logo/Image
- Created Date
- Owner User ID

`*` = required

### Suggested Supplier Categories
- Electronics
- Office Supplies
- Furniture
- IT Equipment
- Maintenance
- Construction
- Food & Beverage
- General
- Other

Category can be a simple string/select list.

---

## FR-07 — Supplier List

Supplier page shall display:

- Supplier name
- Category
- Contact person
- Phone
- Email
- Number of quotations
- Actions

Actions:

- View
- Edit
- Delete

---

## FR-08 — Search Suppliers

The user shall be able to search suppliers by:

- Supplier name
- Contact person
- Email

---

## FR-09 — Supplier Details

Supplier details page shall display:

- Supplier information
- Image/logo
- Notes
- Number of quotations submitted
- Previous quotations associated with the supplier
- Average rating when ratings exist
- Number of ratings
- Number of completed RFQs won by this supplier
- Rating history/notes when available

---

## FR-10 — Edit Supplier

User may update supplier information.

---

## FR-11 — Delete Supplier

The user may delete a supplier after confirmation.

Recommended rule:

If the supplier is already referenced by quotations, either:

1. Prevent deletion and show a message, or
2. Allow deletion only after the user understands that related quotation history may be affected.

### Recommended Version 1 Behavior
**Prevent deleting a supplier that already has quotations.**

This preserves quotation history.

---

# 12A. Item / Product Catalog Requirements

## FR-11A — Create Catalog Item

Each authenticated user can maintain reusable purchasing items.

Catalog item fields:

- Item Name *
- Description
- Default Unit *
- Category
- Owner User ID
- Created Date

The backend shall also maintain a normalized name used only for duplicate prevention and matching.

Recommended normalization:

```text
trim whitespace
convert to lowercase
collapse repeated spaces
```

Example:

```text
" Laptop "
"laptop"
"LAPTOP"
```

shall be treated as the same catalog name for the same user.

This normalization does **not** attempt AI/semantic translation; for example, `Laptop` and `لابتوب` are not automatically considered the same item.

---

## FR-11B — Item Ownership

Every catalog item belongs to the logged-in user.

A user must never read, update, delete, or reuse another user's catalog items.

---

## FR-11C — Item Search / Reuse

The user can search catalog items by name and optionally filter by category.

The RFQ form should use a simple course-compatible autocomplete approach such as:

- HTML `<datalist>`, or
- filtering loaded item state in React.

No autocomplete package is required.

---

## FR-11D — RFQ Item Snapshot

When a catalog item is used inside an RFQ, the RFQ item stores:

- `itemId` reference to the catalog item when available
- item name snapshot
- description snapshot
- quantity
- unit snapshot
- notes

This preserves historical RFQ data even if the catalog item's current name, description, or default unit changes later.

---

## FR-11E — New Item During RFQ Creation

The RFQ form may allow the user to type an item name that does not yet exist in the catalog.

Recommended Version 1 behavior:

- Normalize the typed name.
- Reuse an existing owned catalog item when a normalized match exists.
- Otherwise create a new owned catalog item using the RFQ item's name/description/unit, then link the RFQ item to it.

This keeps the catalog useful without requiring the user to leave the RFQ form.

---

## FR-11F — Delete Catalog Item

To preserve price history and RFQ identity, prevent deleting a catalog item that is already referenced by an RFQ.

Editing the catalog item remains allowed because historical RFQs keep snapshots.

---

# 13. RFQ Requirements

## FR-12 — Create RFQ

RFQ fields:

- RFQ Title *
- RFQ Reference Number *
- Description
- Category
- Request Date *
- Required By Date
- Status
- Notes
- Items
- Owner User ID

Example:

```text
RFQ Title:
Office Laptop Purchase

Reference:
RFQ-2026-001

Description:
Purchase laptops for the development team.

Request Date:
2026-09-15

Required By:
2026-09-30
```

---

## FR-13 — RFQ Items

Each RFQ must contain one or more items.

Each item contains:

- Catalog Item ID (`itemId`) when linked to the user's catalog
- Item Name * — stored as a historical snapshot
- Description — stored as a historical snapshot
- Quantity *
- Unit * — stored as a historical snapshot
- Notes

The RFQ form should prefer selecting/reusing an owned catalog item, while still supporting creation of a new catalog item when needed.

Example:

| Item | Qty | Unit |
|---|---:|---|
| Dell Laptop | 10 | Piece |
| 24" Monitor | 10 | Piece |
| Wireless Mouse | 10 | Piece |

### Suggested Units
- Piece
- Box
- Pack
- Kg
- Meter
- Liter
- Set
- Other

---

## FR-14 — Dynamic Item Form

On the frontend:

- User can add another RFQ item.
- User can remove an item.
- User can edit item data before saving.

This shall be implemented using React state and array operations.

---

## FR-15 — View RFQs

RFQ list shall display:

- Reference number
- Title
- Category
- Request date
- Required date
- Status
- Number of items
- Number of quotations
- Actions

---

## FR-16 — RFQ Search

Search by:

- Title
- Reference number

---

## FR-17 — RFQ Filters

Filter by:

- Status
- Category

Optional:
- Request date

---

## FR-18 — RFQ Details

RFQ details page shall show:

- Full RFQ information
- Item table
- Existing quotations
- Lowest current quotation if available
- Button to add quotation
- Button to compare quotations

---

## FR-19 — Edit RFQ

The user can edit an RFQ.

Recommended rule:

If quotations already exist, item changes should be handled carefully.

### Version 1 Rule
Allow general RFQ data editing, but warn before modifying items after quotations have already been entered.

---

## FR-20 — Delete RFQ

User may delete RFQ after confirmation.

Deleting an RFQ should also remove its quotation records associated with that RFQ, or deletion can be blocked if quotations exist.

### Recommended Version 1 Behavior
Require confirmation and delete associated quotations.

---

# 14. Quotation Requirements

## FR-21 — Add Quotation

A quotation belongs to:

- One RFQ
- One Supplier
- One logged-in user

Fields:

- Supplier *
- RFQ *
- Quotation Reference
- Quotation Date *
- Valid Until
- Delivery Days
- Notes
- Quotation Image
- Item Prices
- Subtotal
- Additional Cost
- Discount
- Grand Total
- Status
- Owner User ID

---

## FR-22 — Quotation Item Prices

For every item in the RFQ, user enters:

- Unit Price
- Optional quotation note

The quotation item price should preserve:

- `rfqItemId`
- catalog `itemId` when the RFQ item is linked to the catalog
- item name snapshot
- RFQ quantity

The system automatically uses the RFQ quantity.

Example:

RFQ item:

```text
Laptop
Quantity = 10
```

Supplier quotation:

```text
Unit Price = 500 JD
Line Total = 10 × 500 = 5,000 JD
```

---

## FR-23 — Automatic Line Total

Formula:

```text
Line Total = Quantity × Unit Price
```

---

## FR-24 — Quotation Subtotal

Formula:

```text
Subtotal = Sum of all Line Totals
```

---

## FR-25 — Additional Cost

Optional numeric field.

Examples:

- Shipping
- Installation
- Delivery charge

---

## FR-26 — Discount

Optional numeric amount.

Version 1 uses a simple amount rather than percentage to keep logic clear.

---

## FR-27 — Grand Total

Formula:

```text
Grand Total = Subtotal + Additional Cost - Discount
```

Grand Total must never be negative.

---

## FR-28 — Quotation Image Upload

User can upload an image of the received quotation.

Implementation:

- React file input
- `FormData`
- Axios
- Multer in Express
- Save filename/path in MongoDB
- Store file in backend `/uploads`

Allowed initial formats:

- JPG
- JPEG
- PNG

---

## FR-29 — Edit Quotation

The user may edit:

- Supplier
- Quotation date
- Validity
- Delivery days
- Item prices
- Additional cost
- Discount
- Notes
- Image

Totals must be recalculated.

---

## FR-30 — Delete Quotation

Delete quotation after confirmation.

If the quotation is currently selected as winner:

- Display warning.
- Require confirmation.
- RFQ may return to `Under Comparison` or `Open`.

---

# 15. Quotation Comparison Engine

This is the most important module in the project.

## FR-31 — Comparison Requirement

An RFQ should have at least **two quotations** before the comparison page becomes meaningful.

If only one exists:

```text
"Add at least one more quotation to compare offers."
```

---

## FR-32 — Side-by-Side Comparison

Comparison table example:

| Item | Qty | Supplier A | Supplier B | Supplier C |
|---|---:|---:|---:|---:|
| Laptop | 10 | 500 | 480 | 510 |
| Monitor | 10 | 120 | 130 | 115 |
| Mouse | 10 | 15 | 17 | 14 |
| **Subtotal** | | 6350 | 6270 | 6390 |
| Shipping | | 100 | 50 | 0 |
| Discount | | 50 | 0 | 90 |
| **Grand Total** | | **6400** | **6320** | **6300** |

---

## FR-33 — Lowest Total

System calculates:

```text
Lowest Total = minimum quotation Grand Total
```

The lowest quotation should be visually highlighted.

Example:

```text
Best Price:
Supplier C — 6,300 JD
```

---

## FR-34 — Highest Total

System may display the highest quotation.

Example:

```text
Highest Offer:
Supplier A — 6,400 JD
```

---

## FR-35 — Savings

Formula:

```text
Savings = Highest Quotation Total - Lowest Quotation Total
```

Example:

```text
Potential Saving = 100 JD
```

---

## FR-36 — Cheapest Supplier Per Item

For each RFQ item:

```text
Find minimum Unit Price among all quotations.
```

Example:

```text
Laptop:
Supplier B = 480 JD → Cheapest

Monitor:
Supplier C = 115 JD → Cheapest
```

Highlight cheapest item price.

---

## FR-37 — Price Difference

Optional useful comparison:

```text
Difference = Supplier Price - Cheapest Price
```

Can be shown as simple text.

Example:

```text
Supplier A Laptop:
+20 JD above cheapest
```

---

## FR-38 — Delivery Comparison

If delivery days are entered:

- Display supplier delivery days.
- Highlight shortest delivery time.

The final decision remains manual.

---

## FR-39 — Select Winning Quotation

User can press:

```text
Select Quotation
```

System shall:

- Mark quotation as `Selected`.
- Mark RFQ as `Completed`.
- Store selected quotation ID on RFQ.
- Visually show the winner.

---

## FR-40 — Change Selected Quotation

User may change the winner after confirmation.

System shall:

- Remove Selected status from old quotation.
- Select new quotation.
- Update RFQ selectedQuotationId.

---

## FR-41 — Split Award Analysis

In addition to the cheapest complete quotation, the system shall calculate a mixed-basket scenario where each RFQ item is assigned to the supplier offering the lowest unit price for that item.

For each RFQ item:

```text
Split Item Line Total = RFQ Quantity × Lowest Unit Price for that item
```

Then:

```text
Split Award Item Total = Sum of all Split Item Line Totals
```

Version 1 comparison rule:

- `Best Single Supplier` remains based on the lowest quotation `grandTotal`.
- `Split Award Item Total` is compared against the selected best single supplier's `subtotal`, because quotation-level additional costs and discounts may not remain valid when only part of a supplier's offer is purchased.
- Display the difference clearly as an **item-subtotal comparison**, not guaranteed final savings.

```text
Split Difference = Best Single Supplier Subtotal - Split Award Item Total
```

The UI should also show which supplier wins each item.

No external library is required; use normal JavaScript array/object calculations.

---

## FR-42 — Weighted Score / Best Value

The comparison page shall optionally calculate a `Best Value` score in addition to the `Cheapest` result.

Default user-adjustable weights:

```text
Price = 60%
Delivery = 25%
Supplier Rating = 15%
```

Rules:

- Each weight must be between 0 and 100.
- The three weights must total exactly 100.
- Weights are comparison inputs and do not need to be stored permanently in Version 1.

Normalized scoring:

```text
Price Score = (Lowest Grand Total / Supplier Grand Total) × 100
Delivery Score = (Shortest Delivery Days / Supplier Delivery Days) × 100
Rating Score = (Supplier Average Rating / 5) × 100

Weighted Score =
(Price Score × Price Weight / 100) +
(Delivery Score × Delivery Weight / 100) +
(Rating Score × Rating Weight / 100)
```

Behavior for missing data:

- If Delivery Weight > 0, every compared quotation must have Delivery Days; otherwise show a clear validation message and do not calculate Best Value until delivery data is completed or delivery weight is set to 0.
- If a supplier has no ratings yet, use a transparent neutral rating value of `3 / 5` for Weighted Score only and display that the supplier is currently unrated.

The highest Weighted Score is labeled:

```text
Best Value
```

`Cheapest` and `Best Value` are separate results. The system must not automatically select a supplier based on Weighted Score; the final decision remains the user's.

---

## FR-43 — Supplier Rating After Completion

After an RFQ is `Completed`, the user may rate the supplier of the selected quotation.

Rating fields:

- RFQ ID
- Rating from 1 to 5
- Optional note
- Created Date

Rules:

- Only the supplier selected for that completed RFQ can be rated from that RFQ.
- Only one rating is allowed per completed RFQ.
- Rating must be an integer from 1 through 5.
- Rating data belongs to the logged-in user through the owned supplier/RFQ relationship.

Supplier Details should calculate and display:

```text
Average Rating = Sum of Ratings / Number of Ratings
Rating Count
RFQ Wins = number of completed RFQs whose selected quotation belongs to this supplier
```

Use normal Mongoose queries and JavaScript calculations.

---

## FR-44 — Item Price History

For catalog items, the system shall show historical **paid/selected** price information from completed RFQs.

When an item has previous purchasing history, display at minimum:

- Last paid unit price
- Supplier
- Quotation/RFQ date
- RFQ reference

Optional useful summary:

- Lowest historical paid unit price
- Highest historical paid unit price
- Average historical paid unit price
- Number of completed purchases containing the item

Important rule:

> Price History uses only quotations that were actually selected for completed RFQs. Other received quotations are comparison history, not a price the user paid.

Implementation must stay inside the course scope:

- Use normal Mongoose `find()` / `findOne()` / `sort()` queries.
- Extract matching quotation item rows in normal JavaScript.
- Calculate min/max/average using normal JavaScript logic.
- MongoDB Aggregation Pipeline / Mongoose `aggregate()` is **not required and should not be introduced for Version 1**.

---

# 16. Dashboard Requirements

Dashboard should contain summary cards.

## Cards

### Total Suppliers
Count user's suppliers.

### Total RFQs
Count user's RFQs.

### Open RFQs
Count RFQs with:

- Open
- Under Comparison

### Completed RFQs
Count Completed RFQs.

### Total Quotations
Count all quotations.

### Selected Quotations
Count winner quotations.

---

## Recent RFQs

Show latest RFQs:

- Reference
- Title
- Status
- Date
- View button

---

## Recent Quotations

Show:

- Supplier
- RFQ
- Total
- Status

---

## Savings Summary

For completed RFQs, system may calculate:

```text
Savings = highest quotation - selected quotation
```

Then show:

```text
Estimated Savings
```

No chart library is required.

Simple cards, progress indicators, tables, or CSS-based bars can be used.

---

# 17. Search Requirements

Search must be implemented for:

## Suppliers
- Name
- Contact person
- Email

## RFQs
- Title
- Reference

## Quotations
Optional search:
- Supplier name
- Quotation reference

---

# 18. Filter Requirements

## Supplier Filters
- Category

## RFQ Filters
- Status
- Category

## Quotation Filters
- Status
- Supplier

---

# 19. Pagination Requirements

Lists should use pagination when appropriate.

Recommended page size:

```text
6 or 10 records per page
```

Pages:

- Suppliers
- RFQs
- Quotations

Backend pattern:

```text
?page=1&limit=10&search=...
```

MongoDB/Mongoose:

- `skip()`
- `limit()`
- `countDocuments()`

---

# 20. Sorting Requirements

Keep sorting simple.

Recommended sorting options:

## Suppliers
- Name A-Z
- Newest

## RFQs
- Newest
- Oldest
- Required Date

## Quotations
- Lowest Total
- Highest Total
- Newest

Sorting may be done on frontend or backend depending on implementation simplicity.

---

# 21. MongoDB Data Model

Recommended collections:

```text
users
suppliers
items
rfqs
quotations
```

---

# 22. User Schema

```js
User {
  _id,
  name,
  email,
  password,
  createdAt
}
```

### Rules
- Email unique.
- Password stored hashed.
- Never return password to frontend.

---

# 23. Supplier Schema

```js
Supplier {
  _id,
  userId,
  name,
  contactPerson,
  email,
  phone,
  address,
  category,
  notes,
  image,

  ratings: [
    {
      rfqId,
      rating,
      note,
      createdAt
    }
  ],

  createdAt
}
```

Supplier average rating and RFQ win count are derived values and do not need to be permanently stored in Version 1.

---

# 23A. Item Catalog Schema

```js
Item {
  _id,
  userId,
  name,
  normalizedName,
  description,
  defaultUnit,
  category,
  createdAt
}
```

### Rules

- `userId` is required.
- `name` is required.
- `defaultUnit` is required.
- `normalizedName` is generated from the name and used for matching/duplicate prevention.
- Compound uniqueness is based on `userId + normalizedName`, not global item name uniqueness.

---

# 24. RFQ Schema

```js
RFQ {
  _id,
  userId,
  referenceNumber,
  title,
  description,
  category,
  requestDate,
  requiredByDate,
  status,
  notes,

  items: [
    {
      itemId,
      itemName,
      description,
      quantity,
      unit,
      notes
    }
  ],

  selectedQuotationId,
  createdAt
}
```

---

# 25. Quotation Schema

```js
Quotation {
  _id,
  userId,
  rfqId,
  supplierId,

  quotationReference,
  quotationDate,
  validUntil,
  deliveryDays,

  itemPrices: [
    {
      rfqItemId,
      itemId,
      itemName,
      quantity,
      unitPrice,
      lineTotal,
      notes
    }
  ],

  subtotal,
  additionalCost,
  discount,
  grandTotal,

  notes,
  image,
  status,

  createdAt
}
```

## Important Note

Because RFQ items may be embedded subdocuments, each item receives an `_id` automatically from Mongoose unless disabled.

That `_id` can be stored as `rfqItemId` inside quotation item prices.

---

# 26. Database Relationships

```text
User
 |
 +---- Supplier
 |      |
 |      +---- Ratings
 |
 +---- Item Catalog
 |
 +---- RFQ
 |      |
 |      +---- RFQ Items ---- optional link ----> Item Catalog
 |      |
 |      +---- Quotations
 |
 +---- Quotation
         |
         +---- Supplier
         +---- RFQ
```

Relationship summary:

- One User → Many Suppliers
- One User → Many Catalog Items
- One User → Many RFQs
- One RFQ → Many Quotations
- One Supplier → Many Quotations
- One RFQ → Many Item Snapshots
- One Catalog Item → Many historical RFQ item snapshots
- One Supplier → Many Ratings across completed RFQs

---

# 27. REST API Requirements

Base URL example:

```text
http://localhost:5000/api
```

---

# 28. Authentication Endpoints

```http
POST /api/auth/register
POST /api/auth/login
```

Optional:

```http
GET /api/auth/me
```

Only add `/me` if needed for current-user display.

---

# 29. Supplier Endpoints

```http
GET    /api/suppliers
GET    /api/suppliers/:id
POST   /api/suppliers
PUT    /api/suppliers/:id
DELETE /api/suppliers/:id
POST   /api/suppliers/:id/ratings
```

The rating endpoint is implemented only after winner-selection/completed-RFQ logic exists.

Example search:

```http
GET /api/suppliers?search=tech&page=1
```

---

# 29A. Item Catalog Endpoints

```http
GET    /api/items
GET    /api/items/:id
POST   /api/items
PUT    /api/items/:id
DELETE /api/items/:id
```

Examples:

```http
GET /api/items?search=laptop
GET /api/items?category=IT%20Equipment
```

Price history after quotation/winner functionality exists:

```http
GET /api/items/:id/price-history
```

---

# 30. RFQ Endpoints

```http
GET    /api/rfqs
GET    /api/rfqs/:id
POST   /api/rfqs
PUT    /api/rfqs/:id
DELETE /api/rfqs/:id
```

Example filters:

```http
GET /api/rfqs?status=Open&search=laptop&page=1
```

---

# 31. Quotation Endpoints

```http
GET    /api/quotations
GET    /api/quotations/:id
POST   /api/quotations
PUT    /api/quotations/:id
DELETE /api/quotations/:id
```

Get quotations for RFQ:

```http
GET /api/quotations?rfqId=RFQ_ID
```

Select quotation:

Recommended endpoint:

```http
PUT /api/quotations/:id/select
```

This remains a normal Express route/controller function.

---

# 32. Comparison Endpoint

Because FR Compare now includes Split Award and Weighted Score analysis, the recommended Version 1 approach is to keep comparison business calculations inside a focused backend controller using normal JavaScript.

Recommended endpoint:

```http
GET /api/rfqs/:id/comparison?priceWeight=60&deliveryWeight=25&ratingWeight=15
```

The comparison controller shall:

- verify RFQ ownership
- fetch the RFQ quotations
- require at least two quotations for a meaningful comparison
- calculate lowest/highest totals and potential savings
- calculate cheapest supplier per item
- calculate Split Award item total
- validate and calculate Weighted Score / Best Value
- return structured JSON for React to render

React remains responsible for presentation and interactive weight inputs, but the main comparison math stays centralized and testable in the backend controller.

No external calculation library is required.

---

# 33. Backend MVC-style Folder Structure

```text
backend/
│
├── config/
│   └── db.js
│
├── controllers/
│   ├── authController.js
│   ├── supplierController.js
│   ├── itemController.js
│   ├── rfqController.js
│   ├── quotationController.js
│   └── comparisonController.js
│
├── middleware/
│   ├── requireAuth.js
│   └── upload.js
│
├── models/
│   ├── User.js
│   ├── Supplier.js
│   ├── Item.js
│   ├── RFQ.js
│   └── Quotation.js
│
├── routes/
│   ├── authRoutes.js
│   ├── supplierRoutes.js
│   ├── itemRoutes.js
│   ├── rfqRoutes.js
│   └── quotationRoutes.js
│
├── uploads/
│
├── .env
├── package.json
└── server.js
```

---

# 34. Frontend Folder Structure

```text
frontend/
│
├── src/
│   │
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── SupplierCard.jsx
│   │   ├── RFQCard.jsx
│   │   ├── StatusBadge.jsx
│   │   ├── Pagination.jsx
│   │   ├── Loading.jsx
│   │   └── ConfirmModal.jsx
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   │
│   │   ├── Suppliers.jsx
│   │   ├── SupplierForm.jsx
│   │   ├── SupplierDetails.jsx
│   │   │
│   │   ├── Items.jsx
│   │   ├── ItemForm.jsx
│   │   │
│   │   ├── RFQs.jsx
│   │   ├── RFQForm.jsx
│   │   ├── RFQDetails.jsx
│   │   │
│   │   ├── QuotationForm.jsx
│   │   ├── QuotationDetails.jsx
│   │   └── CompareQuotations.jsx
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── App.css
│
└── package.json
```

Do not over-engineer the folder structure.

---

# 35. React Requirements

The project should demonstrate:

## Components
Reusable UI elements.

Examples:
- Navbar
- Cards
- Status Badge
- Pagination
- Confirmation Modal

## Props
Pass supplier/RFQ/quotation data to reusable components.

## useState
Used for:
- Forms
- Search
- Filters
- Modal state
- Dynamic items
- Pagination
- Comparison data

## useEffect
Used for:
- Fetch suppliers
- Fetch RFQs
- Fetch quotations
- Load details pages
- Load dashboard information

## useContext
Use for authentication information:

```text
user
loggedIn
login()
logout()
```

## Conditional Rendering
Examples:
- Loading
- No results
- Login state
- RFQ status
- Selected quotation
- Comparison available/not available

## Rendering Lists
Use `.map()` for:
- Suppliers
- Catalog items
- RFQ items
- RFQs
- Quotations
- Comparison columns/rows

## Routing
Use React Router.

## useNavigate
After:
- Login
- Register
- Create RFQ
- Save quotation
- Delete actions when needed

## useParams
For:

```text
/suppliers/:id
/rfqs/:id
/quotations/:id
/rfqs/:id/compare
```

---

# 36. JavaScript/ES6 Concepts to Apply

The project should intentionally demonstrate course JavaScript concepts.

## Variables
`let` and `const`

## Arrays
For:
- Catalog items
- RFQ items
- Quotations
- Comparison data

## Objects
For:
- Form state
- Supplier data
- Catalog item data
- RFQ data

## Functions
Reusable calculation and event-handler functions.

## Arrow Functions
React event handlers and array methods.

## Spread Operator

Example:

```js
setForm({
  ...form,
  title: e.target.value
});
```

## Destructuring

```js
const { title, status } = rfq;
```

## map()

Used to render and transform items.

## filter()

Used for frontend filters if appropriate.

## reduce()

Use for totals:

```js
const subtotal = items.reduce(
  (sum, item) => sum + item.lineTotal,
  0
);
```

## Async/Await
All Axios and backend database operations.

## JSON
REST API request/response format.

---

# 37. HTML Requirements

Although React generates the UI, HTML concepts must appear through JSX.

Use semantic/appropriate elements:

- `nav`
- `main`
- `section`
- `form`
- `label`
- `input`
- `select`
- `textarea`
- `datalist`
- `button`
- `table`
- headings
- images

Forms should use appropriate input types:

- text
- email
- password
- number
- date
- file

---

# 38. CSS Requirements

Use custom CSS in addition to Bootstrap.

Apply:

- Box Model
- Margin
- Padding
- Borders
- Shadows
- Typography
- CSS variables if desired
- Flexbox
- CSS Grid
- Media Queries
- Hover states
- Transitions
- Simple transforms
- Optional simple CSS animation

## Recommended Use

### CSS Grid
- Dashboard cards
- Supplier cards
- RFQ cards

### Flexbox
- Navbar
- Buttons
- Form rows
- Alignment

### Media Queries
Ensure layout works on:
- Mobile
- Tablet
- Laptop/Desktop

---

# 39. Bootstrap Requirements

Use Bootstrap for:

- Responsive containers
- Navbar
- Grid system
- Cards
- Forms
- Buttons
- Tables
- Badges
- Modals
- Spacing utilities
- Responsive utilities

Avoid using Bootstrap for everything.

Custom CSS should still be visible in the project.

---

# 40. Main Application Pages

Recommended route map:

```text
/
    Redirect based on authentication

/login
/register

/dashboard

/suppliers
/suppliers/new
/suppliers/:id
/suppliers/:id/edit

/items
/items/new
/items/:id/edit

/rfqs
/rfqs/new
/rfqs/:id
/rfqs/:id/edit

/rfqs/:id/quotation/new
/quotations/:id
/quotations/:id/edit

/rfqs/:id/compare
```

---

# 41. Login Page

Contents:

- Project logo/name
- Email
- Password
- Login button
- Link to Register
- Validation/error message

---

# 42. Register Page

Contents:

- Name
- Email
- Password
- Confirm Password
- Register button
- Link to Login

---

# 43. Dashboard Page

Recommended layout:

```text
------------------------------------------------
FR Compare                         User | Logout
------------------------------------------------

[Suppliers] [Total RFQs] [Open] [Completed]

[Total Quotations] [Selected] [Estimated Savings]

Recent RFQs
------------------------------------------------
Reference | Title | Status | Date | View

Recent Quotations
------------------------------------------------
Supplier | RFQ | Total | Status
```

---

# 44. Suppliers Page

Components:

- Page title
- Add Supplier button
- Search input
- Category filter
- Supplier list/cards/table
- Pagination
- Empty state

---

# 44A. Item Catalog Page

Components:

- Page title
- Add Item action
- Search input
- Optional category filter
- Item list/table
- Edit/Delete actions
- Empty state

RFQ forms reuse the user's item catalog through `<datalist>` or simple React state filtering.

---

# 45. RFQ List Page

Components:

- New RFQ button
- Search
- Status filter
- Category filter
- RFQ table/cards
- Status badges
- Pagination

---

# 46. Create RFQ Page

Sections:

## Basic Information
- Reference
- Title
- Description
- Category
- Dates

## Items
Dynamic item rows:

```text
Catalog Item / Item Name | Qty | Unit | Description | Remove
```

Item-name behavior:

- Suggest owned catalog items.
- Selecting a catalog item pre-fills its name/description/default unit where appropriate.
- A new typed item can be added to the catalog during RFQ creation according to FR-11E.

Buttons:

```text
+ Add Item
Save RFQ
Cancel
```

---

# 47. RFQ Details Page

Displays:

- RFQ header
- Status
- Basic information
- Item table
- Quotations received
- Add Quotation
- Compare Quotations
- Edit RFQ
- Delete RFQ

---

# 48. Add Quotation Page

Header:

```text
Add Quotation
RFQ: RFQ-2026-001 — Office Laptops
```

Fields:

- Supplier
- Quotation reference
- Date
- Valid until
- Delivery days
- Image
- Notes

Item table:

| Item | Qty | Unit Price | Line Total |
|---|---:|---:|---:|
| Laptop | 10 | Input | Auto |
| Monitor | 10 | Input | Auto |

Totals:

```text
Subtotal      6,200 JD
Additional      100 JD
Discount         50 JD
----------------------
Grand Total    6,250 JD
```

---

# 49. Compare Quotations Page

This is the showcase page.

Header:

```text
Quotation Comparison
RFQ-2026-001
Office Laptop Purchase
```

Summary cards:

```text
3 Quotations
Cheapest: 6,250 JD
Highest: 6,600 JD
Potential Saving: 350 JD
Split Award Item Total: 6,100 JD
Best Value: Supplier B — 91.4 / 100
```

Weight controls:

```text
Price Weight      [60]
Delivery Weight   [25]
Rating Weight     [15]
Total             100%
```

Comparison table:

- Each supplier as a column.
- Each item as a row.
- Lowest unit price highlighted.
- Grand totals displayed.
- Lowest overall quotation highlighted.
- Select Supplier button.
- Separate labels for Cheapest and Best Value.
- Split Award section showing cheapest supplier per item and item-subtotal difference.

---

# 50. UI Status Colors

Use Bootstrap badge concepts.

Suggested:

- Draft → Secondary
- Open → Primary
- Under Comparison → Warning
- Completed → Success
- Cancelled → Danger

Quotation:

- Received → Primary
- Selected → Success
- Rejected → Secondary/Danger

Exact custom colors can be defined later.

---

# 51. Input Validation Requirements

Validate on frontend and backend.

## Supplier
- Name required
- Valid email if provided

## Catalog Item
- Name required
- Default unit required
- Duplicate normalized name not allowed for the same user

## RFQ
- Reference required
- Title required
- Request date required
- At least one item
- Quantity > 0

## Quotation
- Supplier required
- Quotation date required
- Unit prices >= 0
- Additional cost >= 0
- Discount >= 0
- Delivery days >= 0

## Weighted Score
- Each weight must be 0–100
- Price + Delivery + Rating weights must equal 100
- Delivery data required for every compared quote when Delivery Weight > 0

## Supplier Rating
- RFQ must be Completed
- Supplier must be the selected supplier for that RFQ
- Rating must be integer 1–5
- One rating per completed RFQ

---

# 52. Backend Validation

Frontend validation is not enough.

Controllers must verify:

- Required fields.
- Record exists.
- Record belongs to logged-in user.
- Numeric values are valid.
- Supplier belongs to logged-in user.
- RFQ belongs to logged-in user.
- Quotation belongs to logged-in user.

Use appropriate HTTP responses.

---

# 53. HTTP Status Codes

Recommended:

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
404 Not Found
500 Internal Server Error
```

---

# 54. Error Handling

Backend returns JSON messages.

Example:

```json
{
  "error": "RFQ not found"
}
```

Frontend displays readable messages.

Avoid showing raw server stack traces to the user.

---

# 55. Authentication & Security Requirements

Use only techniques covered in the course.

## Passwords
Hash using:

```text
bcrypt / bcryptjs
```

## Authentication
Use:

```text
jsonwebtoken
```

## Token
Store token in:

```text
localStorage
```

## Protected API
Axios sends token in Authorization header.

Backend middleware verifies JWT.

## Secrets
Store in `.env`:

```text
PORT
MONGO_URI
JWT_SECRET
```

Never hard-code database credentials in source files.

---

# 56. Image Upload Requirements

Use:

```text
Multer
```

Possible images:

- Supplier logo
- Supplier image
- Scanned/photo quotation

Backend folder:

```text
/uploads
```

Expose it using Express static files.

When an image is replaced or a record deleted, image cleanup is recommended if implementation remains simple.

---

# 57. Suggested Backend Dependencies

```bash
npm install express mongoose cors dotenv bcryptjs jsonwebtoken multer
npm install --save-dev nodemon
```

If the course used `bcrypt` instead of `bcryptjs`, use the same one used during the course.

---

# 58. Suggested Frontend Dependencies

```bash
npm install axios react-router-dom bootstrap
```

Avoid adding unnecessary libraries.

---

# 59. Environment Variables

Backend `.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret
```

Frontend may use:

```env
VITE_SERVER=http://localhost:5000/api
```

if the project uses Vite environment variables as practiced in the course.

---

# 60. Calculation Rules

## Line Total

```text
quantity × unitPrice
```

## Subtotal

```text
sum(line totals)
```

## Grand Total

```text
subtotal + additionalCost - discount
```

## Lowest Offer

```text
min(all quotation grand totals)
```

## Highest Offer

```text
max(all quotation grand totals)
```

## Potential Savings

```text
highestTotal - lowestTotal
```

## Selected Savings

If user selects a quotation that is not the cheapest:

```text
highestTotal - selectedTotal
```

## Cheapest Item Price

For every RFQ item:

```text
min(unit price from all quotations)
```

## Split Award Item Total

```text
For each RFQ item:
  quantity × lowest unit price for that item

Split Award Item Total = sum(all split item line totals)
```

## Split Difference

```text
Best Single Supplier Subtotal - Split Award Item Total
```

Quotation-level additional costs and discounts are excluded from the Split Award item-subtotal comparison in Version 1 because they may depend on purchasing the supplier's complete offer.

## Weighted Score

```text
Price Score = (lowestGrandTotal / supplierGrandTotal) × 100
Delivery Score = (shortestDeliveryDays / supplierDeliveryDays) × 100
Rating Score = (averageSupplierRating / 5) × 100

Weighted Score =
(priceScore × priceWeight / 100) +
(deliveryScore × deliveryWeight / 100) +
(ratingScore × ratingWeight / 100)
```

Unrated supplier neutral value for Weighted Score only:

```text
3 / 5 = 60 / 100
```

## Supplier Average Rating

```text
sum(ratings) / ratingCount
```

## Historical Item Average Paid Price

Using selected quotations from completed RFQs only:

```text
sum(paid unit prices) / number of paid-price records
```

---

# 61. Important Business Rules

1. User must be logged in.
2. Supplier must belong to current user.
3. RFQ must belong to current user.
4. Quotation supplier and RFQ must both belong to current user.
5. RFQ must contain at least one item.
6. A quotation must contain a price for every RFQ item.
7. Quantity comes from the RFQ, not manually from the quotation.
8. Totals should be recalculated from item data.
9. Comparison requires at least two quotations.
10. Only one quotation should be the selected winner.
11. Completing an RFQ requires a selected quotation.
12. Negative prices are not allowed.
13. Duplicate RFQ reference numbers should not be allowed for the same user.
14. Search results must only include current user's data.
15. Pagination must only count current user's data.
16. Catalog items belong to the current user.
17. Catalog item normalized names must be unique per user.
18. RFQ item snapshots must preserve historical name/description/unit even when a catalog item changes later.
19. Catalog items already referenced by RFQs must not be deleted.
20. Split Award is an analysis scenario, not automatic supplier selection.
21. Split Award Version 1 compares item subtotals and does not assume quotation-level shipping/discount terms apply to partial purchases.
22. Weighted Score weights must total 100.
23. Cheapest and Best Value are separate outputs; the user makes the final selection.
24. Supplier rating is allowed only after completion and only for the selected supplier.
25. Only one supplier rating is allowed per completed RFQ.
26. Price History represents selected/paid quotations from completed RFQs only.
27. Version 1 Price History uses normal Mongoose queries plus JavaScript calculations, not MongoDB Aggregation Pipeline.

---

# 62. Responsive Design Requirements

The application must work on:

- Mobile phones
- Tablets
- Laptops
- Desktop monitors

## Mobile behavior
- Sidebar may become top navigation or collapsible layout.
- Cards stack vertically.
- Tables may use horizontal scrolling.
- Forms become single-column.
- Comparison table can scroll horizontally.

---

# 63. Loading States

Whenever API data is loading:

Display:

```text
Loading...
```

or Bootstrap spinner if already comfortable using it.

Important pages:

- Dashboard
- Suppliers
- RFQs
- RFQ details
- Comparison

---

# 64. Empty States

Examples:

## No Suppliers
```text
No suppliers yet.
Add your first supplier.
```

## No RFQs
```text
No RFQs found.
Create your first request for quotation.
```

## No Quotations
```text
No quotations received for this RFQ.
```

## Not Enough Comparison Data
```text
At least two quotations are required for comparison.
```

---

# 65. Confirmation Actions

Confirmation should be used before:

- Delete supplier
- Delete RFQ
- Delete quotation
- Change winning quotation
- Cancel RFQ

Can use:

- Bootstrap Modal
or
- Browser confirm() for an initial simple version

Recommended final version:
Bootstrap Modal.

---

# 66. Accessibility / Basic Usability

Use:

- Labels for form inputs.
- Meaningful button text.
- `alt` text for images.
- Clear validation messages.
- Proper heading hierarchy.
- Good contrast.
- Visible focus behavior.

---

# 67. Course Concept Mapping

This project intentionally applies the course.

| Course Topic | Project Usage |
|---|---|
| HTML | Forms, tables, input types, `<datalist>` item suggestions, semantic page structure |
| CSS | Custom design, spacing, layout, responsiveness |
| Flexbox | Navbar, actions, inline controls |
| CSS Grid | Dashboard/cards/layout |
| Media Queries | Mobile/tablet/desktop layouts |
| CSS Transitions | Hover/focus interactions |
| CSS Animation | Optional loading/status effect |
| Bootstrap | Navbar, cards, forms, tables, badges, modal, spacing |
| JavaScript | Totals, Split Award, Weighted Score, ratings, price-history calculations |
| Arrays | Catalog items, RFQ items, quotations, rating/history data |
| Objects | Form/data structures |
| Functions | Calculations and handlers |
| ES6 | Spread, destructuring, arrow functions |
| map() | Render items/lists |
| filter() | Filtering/search where appropriate |
| reduce() | Calculate quotation totals |
| async/await | API/database calls |
| JSON | REST request/response |
| React Components | Reusable UI |
| Props | Component data |
| useState | Forms/UI data |
| useEffect | Fetch API data |
| useContext | Authentication state |
| Conditional Rendering | Auth/status/loading/empty states |
| React Router | Multi-page SPA routing |
| useNavigate | Programmatic navigation |
| useParams | Detail pages |
| LocalStorage | JWT persistence |
| Axios | React ↔ backend API |
| Node.js | Server runtime |
| Express | REST API |
| Middleware | JWT authentication, upload |
| MVC-style Backend | Routes → Controllers → Models |
| MongoDB | Main database |
| Mongoose | Schemas/models/querying |
| CRUD | Suppliers, catalog items, RFQs, quotations |
| bcrypt | Password hashing |
| JWT | Authentication |
| Multer | Quotation/supplier images |
| Search | Supplier, item-catalog, and RFQ lists |
| Pagination | Large lists |
| .env | Secret/config values |
| Postman | API testing |

---

# 68. Development Phases

## Phase 1 — Project Setup
- Create frontend.
- Create backend.
- Install dependencies.
- Create MongoDB database.
- Configure `.env`.
- Connect backend to MongoDB.
- Configure CORS.
- Configure Express JSON middleware.

### Completion Criteria
- React runs.
- Backend runs.
- MongoDB connects.
- Frontend can call backend test endpoint.

---

## Phase 2 — Authentication
- User model
- Register controller
- Login controller
- Auth routes
- bcrypt
- JWT
- requireAuth middleware
- Login/Register UI
- AuthContext
- localStorage token
- Protected routes
- Logout

### Completion Criteria
User can register, login, refresh page, remain authenticated, access protected pages, and logout.

---

## Phase 3 — Supplier Module
- Supplier model
- CRUD backend
- Search
- Pagination
- Supplier pages
- Image upload
- Validation

### Completion Criteria
User can fully manage their own suppliers.

---

## Phase 4 — Item Catalog + RFQ Module
- Item catalog model and CRUD
- Item normalized-name duplicate prevention
- Item ownership/search/filter
- RFQ model and CRUD
- Dynamic RFQ items
- Catalog item suggestions using `<datalist>` or simple React filtering
- Link RFQ items to owned catalog items when available
- Create a new catalog item from a new RFQ item when needed
- Preserve RFQ item snapshots
- Search/filter/pagination
- RFQ details

### Completion Criteria
User can manage a reusable owned item catalog and create/manage an RFQ containing multiple catalog-linked item snapshots.

---

## Phase 5 — Quotation Module
- Quotation model
- CRUD
- Supplier selection
- Item price entry including catalog `itemId` snapshot/link
- Calculations
- Image upload
- Quotation details
- Complete Supplier deletion protection when quotations exist
- Warn before RFQ item changes when quotations exist
- Cascade/delete associated quotations when RFQ deletion is confirmed

### Completion Criteria
User can add multiple supplier quotations to one RFQ while preserving supplier/RFQ/item history integrity.

---

## Phase 6 — Advanced Comparison + Decision Support
- Comparison controller/endpoint
- Side-by-side comparison
- Lowest total
- Highest total
- Savings
- Cheapest item prices
- Delivery comparison
- Split Award / mixed-basket analysis
- User-configurable Weighted Score
- Separate Cheapest and Best Value results
- Winner selection
- Supplier rating after completed RFQ
- Supplier average rating and win count
- Item paid-price history from selected completed RFQs using normal Mongoose queries + JavaScript

### Completion Criteria
User can compare at least two supplier quotations using Cheapest, Split Award, and Best Value analysis, select a winner, rate the completed supplier, and review historical paid-price data.

---

## Phase 7 — Dashboard
- Counters
- Recent RFQs
- Recent quotations
- Savings summary

### Completion Criteria
Dashboard accurately reflects stored user data.

---

## Phase 8 — Responsive UI & Final Polish
- Bootstrap cleanup
- Custom CSS
- Grid/Flexbox
- Media queries
- Empty/loading/error states
- Modals
- Mobile testing

---

## Phase 9 — Testing
- Test APIs with Postman.
- Test authentication.
- Test ownership.
- Test CRUD.
- Test comparison calculations.
- Test search.
- Test filters.
- Test pagination.
- Test image upload.
- Test mobile/responsive behavior.

---

# 69. API Testing Checklist

## Auth
- Register valid user
- Register duplicate email
- Login correct password
- Login wrong password
- Protected route without token
- Protected route with token

## Supplier
- Create
- Read all
- Read one
- Update
- Delete
- Search
- Pagination
- Submit rating after completed selected RFQ

## Item Catalog
- Create
- Read all
- Read one
- Update
- Delete unused item
- Reject delete when referenced by RFQ
- Search
- Duplicate normalized-name protection
- Ownership
- Price history after completed selected quotations exist

## RFQ
- Create valid RFQ
- Reject RFQ without items
- Update
- Delete
- Search
- Filter
- Pagination

## Quotation
- Create
- Validate supplier/RFQ
- Preserve item links/snapshots
- Calculate totals
- Update
- Delete
- Upload image
- Select winner

## Advanced Comparison
- Split Award item total
- Split difference vs best single supplier subtotal
- Weight total validation = 100
- Weighted Score calculations
- Missing delivery-data validation
- Neutral unrated-supplier behavior
- Cheapest result remains separate from Best Value
- Supplier rating one-per-completed-RFQ rule
- Price history uses only selected quotations from completed RFQs

## Security
- User A cannot access User B records.

---

# 70. Manual UI Testing Checklist

- Register form works.
- Login form works.
- Logout works.
- Protected page redirect works.
- Supplier form validation works.
- Item catalog CRUD/search works.
- RFQ catalog suggestions work.
- RFQ dynamic items work.
- Quotation line totals update correctly.
- Grand total is correct.
- Comparison page identifies correct cheapest offer.
- Split Award result is correct.
- Weighted Score / Best Value result is correct.
- Winner selection works.
- Completed winner can be rated once.
- Item paid-price history shows the correct selected historical price.
- Search works.
- Filters work.
- Pagination works.
- Image upload/display works.
- Delete confirmation works.
- Responsive mobile layout works.

---

# 71. Example Demo Scenario

For final presentation, preload/demo:

## Suppliers

### TechSource
```text
Electronics Supplier
```

### Future Systems
```text
IT Equipment Supplier
```

### Smart Office
```text
Office Equipment Supplier
```

---

## RFQ

```text
Reference:
RFQ-2026-001

Title:
Developer Office Equipment

Items:
10 × Laptop
10 × Monitor
10 × Mouse
```

---

## Quotation A — TechSource

```text
Laptop = 500
Monitor = 120
Mouse = 15
Additional Cost = 100
Discount = 50
```

---

## Quotation B — Future Systems

```text
Laptop = 480
Monitor = 130
Mouse = 17
Additional Cost = 50
Discount = 0
```

---

## Quotation C — Smart Office

```text
Laptop = 510
Monitor = 115
Mouse = 14
Additional Cost = 0
Discount = 90
```

Then demonstrate:

1. Open RFQ.
2. View all quotations.
3. Open comparison.
4. Show cheapest prices.
5. Show lowest grand total.
6. Show savings.
7. Select winner.
8. RFQ becomes Completed.
9. Dashboard updates.

---

# 72. Definition of Done

The project is considered complete when:

- [ ] User can register.
- [ ] User can login.
- [ ] JWT authentication works.
- [ ] Passwords are hashed.
- [ ] Protected routes work.
- [ ] Each user sees only their own data.
- [ ] Supplier CRUD works.
- [ ] Supplier search works.
- [ ] Supplier pagination works.
- [ ] Item catalog CRUD works.
- [ ] Item duplicate normalization works per user.
- [ ] RFQ CRUD works.
- [ ] RFQ can contain multiple items.
- [ ] RFQ search/filter works.
- [ ] Quotation CRUD works.
- [ ] Supplier quotation images upload successfully.
- [ ] Quotation totals calculate correctly.
- [ ] Multiple quotations can belong to one RFQ.
- [ ] Comparison page works.
- [ ] Lowest total is identified.
- [ ] Highest total is identified.
- [ ] Potential savings are calculated.
- [ ] Cheapest supplier per item is identified.
- [ ] Split Award item total and difference are calculated.
- [ ] Weighted Score validates weights and identifies Best Value separately from Cheapest.
- [ ] Winning quotation can be selected.
- [ ] Selected supplier can be rated once after RFQ completion.
- [ ] Supplier average rating and win count are available.
- [ ] Catalog item paid-price history uses selected completed quotations only.
- [ ] RFQ can be completed.
- [ ] Dashboard statistics are correct.
- [ ] Loading states exist.
- [ ] Empty states exist.
- [ ] Error handling exists.
- [ ] Delete confirmation exists.
- [ ] Application is responsive.
- [ ] APIs are tested in Postman.
- [ ] No required feature depends on technology outside the course scope.

---

# 73. Recommended MVP

If development time becomes limited, the minimum complete version is:

1. Authentication
2. Supplier CRUD
3. Item Catalog CRUD
4. RFQ CRUD with catalog-linked multiple items
5. Quotation CRUD
6. Automatic totals
7. Comparison page
8. Select winning quotation
9. Dashboard
10. Responsive design

Search, pagination, image upload, filters, and enhanced dashboard should still be implemented because they are part of the planned full project, but the 10 items above define the core system.

---

# 74. Final Technology Stack

## Frontend

```text
HTML5 / JSX
CSS3
Bootstrap
JavaScript ES6+
React
React Router
React Hooks
Context API
Axios
LocalStorage
```

## Backend

```text
Node.js
Express.js
REST API
MVC-style folder structure
JWT
bcrypt / bcryptjs
Middleware
Multer
dotenv
CORS
```

## Database

```text
MongoDB
Mongoose
```

## Testing

```text
Postman
Manual browser testing
Chrome DevTools responsive testing
```

---

# 75. Final Architecture

```text
React Frontend
      |
      | Axios / REST / JSON
      v
Express Routes
      |
      v
Authentication Middleware
      |
      v
Controllers
      |
      v
Mongoose Models
      |
      v
MongoDB
```

Image flow:

```text
React File Input
      |
      v
FormData
      |
      v
Axios
      |
      v
Express + Multer
      |
      v
/uploads
      |
      v
Image filename/path stored in MongoDB
```

---

# 76. Recommended Final Project Identity

## Option A — Clear Academic Name

**FR Compare**  
**Supplier Quotation Comparison System**

## Option B — Strong Portfolio Name

**FR Compare**  
**Smart Supplier Quotation Management & Comparison**

## Option C — Business-Oriented Name

**QuoteMatrix**  
**Supplier Quotation Analysis Platform**

### Recommended

> **FR Compare — Supplier Quotation Comparison System**

Short description:

> A full-stack MERN web application that helps businesses manage suppliers and item catalogs, create RFQs, record quotations, compare offers using cheapest-price, Split Award, and Weighted Best Value analysis, review historical paid prices, rate suppliers, and select purchasing decisions.

---

# 77. Final Rule for Development

While building the project:

> **Do not add a new framework, library, service, architecture, or advanced feature unless it is already part of the course scope or explicitly approved first.**

For the approved advanced procurement features in this document, use the existing course stack and normal JavaScript/Mongoose queries. Do not introduce MongoDB Aggregation Pipeline / `aggregate()` unless it is explicitly approved later.

The purpose of FR Compare is to demonstrate mastery of the technologies covered in the course, not to make the project unnecessarily complex.

---

# 78. Next Implementation Step

The development should begin in this order:

```text
1. Create project folders
2. Setup React frontend
3. Setup Node/Express backend
4. Connect MongoDB
5. Build authentication
6. Build Supplier module
7. Build Item Catalog + RFQ module
8. Build Quotation module
9. Build Advanced Comparison: cheapest + Split Award + Weighted Score
10. Add winner selection, Supplier Rating, and Item Price History
11. Build Dashboard
12. Verify search/filter/pagination
13. Verify image upload
14. Finish responsive UI
15. Test APIs and full workflow
```

This sequence avoids building the UI before the core data flow is ready and keeps each phase testable.

# Security Specification: GlowCare Skincare & Retailer RBAC

## 1. Data Invariants
1. **User Identity Isolation**: A customer can only read and write their own `/users/{userId}` profile and `/carts/{userId}`. They cannot alter their role to `retailer`.
2. **Product Catalog Protection**: Only verified retailers/admins can create, update, or delete records in `/products/{productId}`. Customers and public visitors have read-only access.
3. **Inventory Integrity**: When an order is placed, stock decrements must be non-negative and controlled.
4. **Order Authorization**: Customers can only list and read orders where `resource.data.userId == request.auth.uid`. Retailers can view and list all orders to fulfill them.
5. **Order Mutation Boundaries**: Customers can only create an initial order with status `Order Placed` and their own `userId`. Status progressions (`Confirmed`, `Processing`, `Shipped`, `Out for Delivery`, `Delivered`) can strictly ONLY be mutated by authorized retailers.
6. **No Plaintext Credential Storage**: No passwords, raw CVVs, or unencrypted financial data can be written to Firestore.
7. **Admin Privilege Verification**: Admin access is verified through the trusted `/admins/$(request.auth.uid)` document lookup, or matching bootstrapping admin emails (`b92225202@gmail.com`, `retailer@glowcare.demo`).

## 2. The Dirty Dozen Attack Payloads (Must Return PERMISSION_DENIED)
1. **Unauthorized Product Insertion**: Non-admin customer attempts `create` on `/products/bad-prod` with arbitrary data.
2. **Unauthorized Product Deletion**: Normal authenticated user sends `delete` on `/products/{productId}`.
3. **Customer Privilege Escalation**: Normal user attempts `update` on `/users/{userId}` with `{ role: "retailer" }`.
4. **Admin Record Forgery**: Unauthenticated user or standard customer tries to write `/admins/{attackerUid}`.
5. **Foreign Cart Theft**: User A attempts to read or mutate `/carts/UserB_ID`.
6. **Cross-Customer Order Snooping**: User A runs a query or `get` on `/orders/OrderOfUserB`.
7. **Illegal Order Status Hijack**: Customer attempts to change their own order status to `Delivered` or `Cancelled` without retailer authorization.
8. **Negative Product Pricing**: Retailer or attacker attempts to set product `price: -500`.
9. **Volumetric Denial-of-Wallet Payload**: Attacker posts a product description exceeding 50,000 characters.
10. **Unauthenticated Order Placement**: Guest or unauthenticated client submits an order write to `/orders/{id}`.
11. **Review Impersonation**: User A submits a review on `/reviews/{reviewId}` with `userId: "UserB"`.
12. **Malformed Document ID Attack**: Attacker uses a 500-byte path variable or malicious SQL/script characters in document ID.

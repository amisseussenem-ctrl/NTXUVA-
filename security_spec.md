# Security Specification & Threat Model (Beira Marketplace)

## Data Invariants
1. **Catalog Integrity**: Only authenticated store owners or administrators can create or modify products. Products must contain valid price (>= 0), category, name, and storeId.
2. **Merchant Protection**: A merchant store profile can only be modified by its owner (`ownerUid == request.auth.uid`) or a platform administrator.
3. **Admin Exclusivity**: Admin stats, store approval/suspension status, and global commission parameters can only be altered by verified administrators (`amisseussenem@gmail.com` or admins in `/admins/{uid}`).
4. **Order Authorization**: Customers can create and read their own orders. Sellers can view and advance orders directed to their `storeId`. Admins can inspect and manage all orders.
5. **Customer Privacy**: PII such as customer phone and physical address in orders are restricted to the customer, the fulfilling store, and system admins.

## The Dirty Dozen Payloads (Attacks Prevented by Security Rules)
1. **Unauthenticated Product Injection**: Anonymous user attempts `setDoc` on `/products/p_hacked` -> REJECTED.
2. **Store Hijack**: User A attempts to update `ownerUid` or `phoneWhatsapp` of Store B -> REJECTED.
3. **Price Tampering by Non-Owner**: Regular user attempts `updateDoc` changing product price to 1 MT -> REJECTED.
4. **Admin Commission Override**: Non-admin attempts to zero out `commissionRatePercent` in `/stats/global` -> REJECTED.
5. **Store Status Escalation**: Suspended seller attempts to set their store `status` to `active` without admin approval -> REJECTED.
6. **Order Snooping**: User X attempts to query or read User Y's private delivery address and phone -> REJECTED.
7. **Negative Price Exploit**: Seller attempts to create product with negative price or stock -> REJECTED.
8. **Malicious ID Injection**: Attacker uses invalid path ID with SQL/Script injection chars -> REJECTED by `isValidId`.
9. **Fake Verification Badge**: Store attempts to set `verified: true` directly without admin approval -> REJECTED.
10. **Shadow Field Injection**: Attacker tries to inject hidden administrative bypass keys into user profiles -> REJECTED.
11. **Order Total Manipulation**: Attacker attempts to modify `total` on existing order in transit -> REJECTED.
12. **Admin Role Self-Assignment**: Non-admin attempts to create a document in `/admins/{uid}` -> REJECTED.

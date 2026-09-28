# GlowCare – Premium Skincare SaaS & E-Commerce Platform

A production-grade, SaaS-based e-commerce web application for a luxury skincare and cosmetics brand. Featuring a glassmorphism user interface, responsive design, secure authentication, role-based access control (RBAC), multi-factor authentication (MFA/2FA), real-time Firestore synchronization, and simulated Razorpay payments.

---

## 🌟 Key Features

### 🛍️ 1. Customer Experience
- **Hero & Landing Experience**: Modern glassmorphic hero ("Elevate Your Skincare, Naturally") with floating ingredient showcases, best sellers, and verified transformation reviews.
- **Product Catalog & Advanced Filters**: Real-time keyword search, category filter, dynamic price range slider, target skin-type filter (All, Oily, Dry, Combination, Sensitive, Normal), minimum star rating filter, and sorting.
- **Deep-Dive Product Pages**: High-resolution skincare visuals, active clinical ingredients, documented benefits, application instructions, stock availability, and verified customer review submissions.
- **Real-Time Shopping Cart**: Synchronized with Cloud Firestore per customer UID. Includes instant quantity modifiers, coupon code engine (`GLOW20`, `FIRSTCARE`, `GLOW10`, `FESTIVE15`), subtotal, free shipping calculator, and 5% GST breakdown.
- **Multi-Step Checkout & Razorpay Integration**:
  - Step 1: Customer contact verification
  - Step 2: Full shipping address & postal PIN
  - Step 3: Payment channel (UPI, Credit/Debit Cards, Net Banking, Wallets)
  - Simulated PCI-DSS compliant Razorpay checkout with test gateway authorization, bank decline simulator, and transaction cancellation.
- **Order Tracking Timeline**: Order Placed → Confirmed → Processing → Shipped → Out for Delivery → Delivered.

### 📊 2. Retailer SaaS Command Center (Admin Suite)
- **Role-Based Access Control (RBAC)**: Strict gatekeeping. Normal customers cannot access retailer routes; unauthorized requests are rejected.
- **Real-Time Business Metrics**:
  - Total Revenue (₹)
  - Total Orders Count
  - Total Verified Customers
  - Total Catalog SKUs
  - Low-Stock Alert System (units < 10)
- **Real-Time Analytics Visualizations**:
  - Live Revenue Velocity area chart with smooth gradient fills
  - Orders fulfillment pipeline breakdown
  - Sales distribution by skincare category
  - Top-selling skincare leaderboard
- **Product Catalog Management**:
  - Add new skincare product with formulas, skin type, stock, pricing, and Unsplash imagery
  - Edit existing product data
  - Inline stock replenishers (+10, +20, +50 units)
  - Delete product with confirmation modal
- **Customer Order Fulfillment**:
  - Instant status updater directly synchronized with customer's live tracking view via Firestore listeners
  - Detailed customer order receipts and delivery addresses

---

## 🔐 Authentication & Multi-Factor Security (MFA/2FA)

### Security Features
1. **Password Hashing & Token Sessions**: Handled securely via Firebase Authentication. No plaintext credentials stored.
2. **Two-Factor Authentication (MFA)**:
   - Required for Retailer/Admin accounts.
   - Dispatches a 6-digit OTP code with a 5-minute countdown expiry and resend functionality.
   - For demo testing, entering `123456` or the generated code verifies retailer privileges.
3. **Password Recovery**: Integrated password reset flow.

### Demo Testing Accounts
- **Customer Demo**:
  - Email: `customer@glowcare.demo`
  - Purpose: Browse catalog, add items to bag, apply coupons, simulate Razorpay payment, track orders.
- **Retailer Admin Demo**:
  - Email: `retailer@glowcare.demo`
  - Purpose: Full access to the Retailer Command Center, real-time analytics, inventory management, and order fulfillment.
- *Quick 1-Click Demo Profiles* are available directly on the login modal for instant testing.

---

## 🗄️ Database Structure (Cloud Firestore)

```text
/users/{userId}
  - id: string
  - name: string
  - email: string
  - phone: string
  - role: "customer" | "retailer"
  - createdAt: ISO timestamp

/products/{productId}
  - id: string
  - name: string
  - brand: string
  - description: string
  - category: "Face Care" | "Cleansers" | "Moisturizers" | "Serums" | "Sunscreens" | "Masks" | "Body Care"
  - price: number (INR)
  - discount: number (percentage)
  - stock: number
  - imageUrl: string
  - rating: number
  - ratingCount: number
  - ingredients: string
  - benefits: string
  - skinType: "All Skin Types" | "Oily" | "Dry" | "Combination" | "Sensitive" | "Normal"
  - howToUse: string
  - isBestSeller: boolean
  - isFeatured: boolean
  - createdAt: ISO timestamp

/orders/{orderId}
  - id: string (e.g. GLOW-2026-XXXXX)
  - userId: string
  - customerName: string
  - customerEmail: string
  - customerPhone: string
  - items: OrderItem[]
  - subtotal: number
  - discountAmount: number
  - couponCode: string
  - shippingFee: number
  - taxAmount: number
  - totalAmount: number
  - paymentMethod: "UPI" | "Credit Card" | "Debit Card" | "Net Banking" | "Wallets"
  - paymentStatus: "Paid" | "Pending" | "Failed"
  - paymentId: string
  - orderStatus: "Order Placed" | "Confirmed" | "Processing" | "Shipped" | "Out for Delivery" | "Delivered" | "Cancelled"
  - shippingAddress: string
  - city: string
  - state: string
  - pinCode: string
  - createdAt: ISO timestamp

/carts/{userId}
  - userId: string
  - items: { productId: string, quantity: number, price: number }[]
  - couponCode: string
  - updatedAt: ISO timestamp

/reviews/{reviewId}
  - id: string
  - productId: string
  - userId: string
  - userName: string
  - rating: number
  - comment: string
  - skinType: string
  - createdAt: ISO timestamp
```

---

## 💳 Razorpay Payment Integration Architecture

In a production environment:
1. **Frontend**: Calls the Razorpay Standard Checkout SDK (`https://checkout.razorpay.com/v1/checkout.js`).
2. **Backend**: A secure Node/Express endpoint (`/api/razorpay/order`) generates an official Razorpay Order ID using secret credentials (`RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`).
3. **Webhook Verification**: Upon successful checkout, the client receives `razorpay_payment_id` and `razorpay_signature`. The server verifies signature authenticity using crypto HMAC-SHA256 before marking the order as `Paid`.
4. **Demo Mode Sandbox**: Included directly in this codebase is an interactive Razorpay modal simulation that allows testing successful payments, bank declines, and cancellations without requiring live payment credentials.

---

## 🚀 Running Locally

1. Clone or download the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Ensure `firebase-applet-config.json` is located in the root directory.
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000` in your browser.

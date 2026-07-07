# FloraFetch Frontend - Quick Reference Guide

## 🏗️ Architecture Overview

### Context-Based State Management
```
App
├── AuthProvider (AuthContext)
│   ├── CartProvider (CartContext)
│   │   ├── Sonner Toaster
│   │   └── All Pages/Components
```

---

## 📌 Quick Usage

### In Any Component/Page:
```typescript
"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useCart } from "@/app/context/CartContext";
import { toast } from "sonner";

export default function MyComponent() {
  // Auth State
  const { user, isLoggedIn, isAdmin, login, logout } = useAuth();
  
  // Cart State
  const { items, total, itemCount, addToCart, removeFromCart } = useCart();
  
  // Notifications
  const handleAction = async () => {
    const id = toast.loading("Processing...");
    try {
      // Do something
      toast.dismiss(id);
      toast.success("Done!");
    } catch (error) {
      toast.dismiss(id);
      toast.error("Error: " + error.message);
    }
  };
}
```

---

## 🔐 Authentication Flow

### Login
```typescript
const { login } = useAuth();

await login("user@example.com", "password123");
// User is automatically logged in globally
// Navbar updates, Cart loads
// Redirects to shop
```

### Register
```typescript
const { register } = useAuth();

await register("user@example.com", "password123", "John Doe", "+1234567890");
// User account created
// Automatically logged in
// Cart initialized
```

### Logout
```typescript
const { logout } = useAuth();

await logout();
// Tokens cleared
// User state reset
// Cart cleared
// Redirects to login
```

### Check Auth
```typescript
const { isLoggedIn, isAdmin } = useAuth();

if (!isLoggedIn) {
  // Redirect to login
}

if (isAdmin) {
  // Show admin panel
}
```

---

## 🛒 Cart Operations

### Load Cart
```typescript
const { loadCart } = useCart();

// Automatically called on login
// Get all cart items from backend
```

### Add to Cart
```typescript
const { addToCart } = useCart();

const newItem = await addToCart(plantId, quantity);
// Backend synced
// Cart badge updates
// Toast shows success
```

### Update Quantity
```typescript
const { updateQuantity } = useCart();

await updateQuantity(cartItemId, newQuantity);
// Backend synced
// Total recalculated
```

### Remove Item
```typescript
const { removeFromCart } = useCart();

await removeFromCart(cartItemId);
// Backend synced
// Cart updates in real-time
```

### Clear Cart
```typescript
const { clearCart } = useCart();

await clearCart();
// Used after successful order
// Empties cart completely
```

### Get Cart Info
```typescript
const { items, total, itemCount } = useCart();

// items: CartItem[] - all items in cart
// total: number - total price
// itemCount: number - number of items (for badge)
```

---

## 🔔 Toast Notifications

### Success
```typescript
import { toast } from "sonner";

toast.success("Item added to cart!");
```

### Error
```typescript
toast.error("Failed to add item. Please try again.");
```

### Info
```typescript
toast.info("Cart has been updated");
```

### Loading
```typescript
const id = toast.loading("Processing order...");

// Later, dismiss and show result
toast.dismiss(id);
toast.success("Order placed!");
```

---

## 📁 File Structure

```
frontend/
├── app/
│   ├── context/
│   │   ├── AuthContext.tsx      ← Auth state
│   │   └── CartContext.tsx      ← Cart state
│   ├── providers.tsx            ← Wraps contexts
│   ├── layout.tsx               ← Root layout
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── shop/page.tsx
│   ├── cart/page.tsx
│   ├── admin/page.tsx
│   ├── profile/page.tsx
│   ├── orders/page.tsx
│   ├── checkout/page.tsx
│   └── ...
├── components/
│   ├── Navbar.tsx               ← Updated with contexts
│   └── ui/
├── lib/
│   └── api.ts                   ← API client
└── ...
```

---

## 🧪 Testing Checklist

```
Auth Flow:
[ ] Login with valid credentials
[ ] Logout clears state
[ ] Register creates account + auto-login
[ ] Auto-redirect when already logged in

Cart Operations:
[ ] Add to cart updates in real-time
[ ] Cart badge shows correct count
[ ] Update quantity works
[ ] Remove item works
[ ] Clear cart after order works

UI/Navigation:
[ ] Navbar shows correct items based on auth
[ ] Mobile menu works
[ ] Admin link only shows for admins
[ ] Profile/Orders/Cart links work

Notifications:
[ ] Success toasts appear
[ ] Error toasts appear
[ ] Loading toasts work
[ ] Toasts auto-dismiss

Persistence:
[ ] Auth persists after page refresh
[ ] Cart persists after page refresh
[ ] Can navigate between pages with state intact
```

---

## 🚨 Common Issues & Solutions

### Issue: Cart empty after refresh
**Solution**: Cart loads automatically on login via `loadCart()` in CartContext

### Issue: User state not updating
**Solution**: Use `useAuth()` hook - automatically subscribed to updates

### Issue: Toast not showing
**Solution**: Ensure `Toaster` is in `providers.tsx` and component is wrapped with providers

### Issue: Admin link not showing
**Solution**: Check `isAdmin` state from `useAuth()` - user must be logged in as admin

### Issue: Add to cart not working
**Solution**: Ensure `useCart()` is called (requires user to be logged in first)

---

## 📚 API Integration

### Login Endpoint
```typescript
POST /api/auth/login
Body: { email: string, password: string }
Response: { access_token, refresh_token, user }
```

### Register Endpoint
```typescript
POST /api/auth/register
Body: { email, password, full_name, phone }
Response: { access_token, refresh_token, user }
```

### Get Profile
```typescript
GET /api/users/profile
Headers: { Authorization: Bearer {token} }
Response: { user object }
```

### Cart Operations
```typescript
GET /api/cart - Get cart items
POST /api/cart - Add item
PUT /api/cart/{id} - Update quantity
DELETE /api/cart/{id} - Remove item
POST /api/cart/clear - Clear cart
```

---

## 🔑 Environment Variables

```env
# In .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## ✅ Implementation Status

| Feature | Status | File |
|---------|--------|------|
| Auth Context | ✅ Complete | `context/AuthContext.tsx` |
| Cart Context | ✅ Complete | `context/CartContext.tsx` |
| Navbar | ✅ Complete | `components/Navbar.tsx` |
| Login Page | ✅ Complete | `app/login/page.tsx` |
| Register Page | ✅ Complete | `app/register/page.tsx` |
| Shop Page | ✅ Complete | `app/shop/page.tsx` |
| Cart Page | ✅ Complete | `app/cart/page.tsx` |
| Admin Dashboard | ✅ Complete | `app/admin/page.tsx` |
| Profile Page | ✅ Complete | `app/profile/page.tsx` |
| Toaster Setup | ✅ Complete | `app/providers.tsx` |
| Documentation | ✅ Complete | `IMPLEMENTATION_SUMMARY.md` |

---

**Questions? Check `IMPLEMENTATION_SUMMARY.md` or `FRONTEND_IMPROVEMENTS.md` for detailed information.**

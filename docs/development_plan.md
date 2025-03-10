# 🏡 Flex Rent – Modern Rental Room Management System

A powerful web application for property owners to manage rental rooms with **flexible rental durations** (daily, weekly, monthly), **analytics dashboard**, **ID verification**, **Stripe payments**, and **subscription-based plans**. The system provides a **modern, responsive, and user-friendly UI** with **smooth user flow**.

---

## 🚀 Features

### 1️⃣ **Core Features**
- **Multi-Property Management**: Owners can manage multiple rental properties.  
- **Flexible Rentals**: Supports **daily, weekly, and monthly** rent.  
- **ID Verification**: Tenants must provide a **valid identity card or passport**.  
- **Online Payments**: **Stripe integration** for seamless transactions.  
- **Analytics Dashboard**: Business insights on **occupancy, earnings, and trends**.  

### 2️⃣ **Business Model**
- **Free Plan**: Owners can manage **up to 3 properties**.  
- **Subscription Plans**: Paid tiers allow managing **more properties**, unlocking **advanced analytics** and additional features.  

### 3️⃣ **Authentication & Role Management**
- **Session Management**: Secure **login persistence** across sessions.  
- **Password Reset**: Users can reset **forgotten passwords** via email.  
- **Authentication Management**: Handles **OAuth (Google, Facebook, etc.), email, and OTP login**.  
- **Role-Based Access Control (RBAC)**:  
  - **Tenant Role**: Book rentals, upload ID, make payments.  
  - **Owner Role**: Manage properties, set pricing, view analytics.  

### 4️⃣ **Additional Features**
- **Tenant Management**: Track tenant history, upcoming check-ins, and payments.  
- **Automated Rent Reminders**: Email or SMS notifications for due payments.  
- **Expense Tracking**: Owners can log maintenance and operational expenses.  
- **Property Reviews**: Tenants can leave reviews after their stay.  
- **Discount Codes**: Owners can offer discounts for long-term stays.  

---

## 🎨 **UI & UX Design Goals**
- **Modern & Responsive**: Works smoothly on **mobile, tablet, and desktop**.  
- **User-Friendly Flow**: Easy navigation for both **tenants & owners**.  
- **Dark Mode Support**: Enhancing **user experience** in all lighting conditions.  

---

## 🛠 **Tech Stack**
| **Category** | **Tech Stack** |
|-------------|---------------|
| **Frontend** | Next.js (App Router), TypeScript, shadcn/ui |
| **Backend** | Supabase (Auth, Postgres DB, Storage), Drizzle ORM |
| **Payments** | Stripe (One-time & Subscription Payments) |
| **Authentication** | Supabase Auth (Email, Social, OTP) |
| **State Management** | React Context / Zustand |
| **Deployment** | Vercel (Frontend), Supabase (Backend) |
| **CI/CD** | GitHub Actions |

---

## 📌 **Development Roadmap**
### ✅ **Phase 1: Planning & Setup**
- [ ] Set up **Next.js project with TypeScript**.  
- [ ] Configure **Supabase for authentication and database**.  
- [ ] Set up **Stripe for payment processing**.  
- [ ] Define data models in **Drizzle ORM** (User, Property, Rental, Payment, etc.).  

### ✅ **Phase 2: Authentication & Role-Based Access**
- [ ] Implement **Supabase Auth** (email, social login, OTP).  
- [ ] Develop **session management** to persist login.  
- [ ] Implement **password reset and authentication flow**.  
- [ ] Add **role-based redirection** (Tenant vs. Owner).  

### ✅ **Phase 3: Property Management & Booking System**
- [ ] Create **property listing and management dashboard**.  
- [ ] Implement **multi-property support for owners** (free plan **limited to 3 properties**).  
- [ ] Build **rental booking system** (daily, weekly, monthly).  
- [ ] Require **ID verification** (upload **identity card or passport**).  

### ✅ **Phase 4: Payments & Subscription Plans**
- [ ] Integrate **Stripe for rent payments**.  
- [ ] Implement **subscription plans for owners (free vs. premium)**.  

### ✅ **Phase 5: Analytics & Insights**
- [ ] Develop **analytics dashboard** (occupancy rate, earnings, trends).  

### ✅ **Phase 6: Additional Features & Deployment**
- [ ] Add **email notifications for payment reminders**.  
- [ ] Deploy **to Vercel & finalize testing**.  

---

## 🎯 **Final Thoughts**
Flex Rent provides a **seamless experience for both tenants and owners**, balancing ease of use with powerful features. **Next.js + Supabase** ensures **fast development, scalability, and real-time updates**. With **Stripe for payments and a flexible subscription model**, the system remains **sustainable and profitable**. 🚀  

---

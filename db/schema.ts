import {
  timestamp,
  text,
  pgTable,
  uuid,
  boolean,
  integer,
  jsonb,
  decimal,
  pgEnum,
  numeric
} from "drizzle-orm/pg-core";

// Enums
export const userRoleEnum = pgEnum("user_role", ["owner", "tenant"]);
export const propertyStatusEnum = pgEnum("property_status", ["available", "occupied", "maintenance"]);
export const rentalDurationEnum = pgEnum("rental_duration", ["daily", "weekly", "monthly"]);
export const subscriptionTierEnum = pgEnum("subscription_tier", ["free", "premium"]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  fullName: text("full_name").notNull(),
  role: userRoleEnum("role").notNull().default("tenant"),
  avatarUrl: text("avatar_url"),
  phoneNumber: text("phone_number"),
  stripeCustomerId: text("stripe_customer_id").unique(),
  subscriptionTier: subscriptionTierEnum("subscription_tier").default("free"),
  subscriptionId: text("subscription_id"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Properties table
export const properties = pgTable("properties", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  images: text("images").array().notNull(),
  amenities: text("amenities").array().notNull(),
  daily_rate: numeric("daily_rate").notNull(),
  weekly_rate: numeric("weekly_rate").notNull(),
  monthly_rate: numeric("monthly_rate").notNull(),
  status: text("status").notNull().default("available"),
  owner_id: uuid("owner_id").notNull().references(() => users.id),
  property_type: text("property_type").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  square_meters: integer("square_meters").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Rentals table
export const rentals = pgTable("rentals", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id").references(() => properties.id).notNull(),
  tenantId: uuid("tenant_id").references(() => users.id).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  duration: rentalDurationEnum("duration").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  isPaid: boolean("is_paid").default(false),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ID Verifications table
export const idVerifications = pgTable("id_verifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  documentType: text("document_type").notNull(), // passport, identity_card
  documentNumber: text("document_number").notNull(),
  documentImageUrl: text("document_image_url").notNull(),
  isVerified: boolean("is_verified").default(false),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id").references(() => properties.id).notNull(),
  tenantId: uuid("tenant_id").references(() => users.id).notNull(),
  booking_id: uuid("booking_id").notNull().references(() => bookings.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Expenses table
export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id").references(() => properties.id).notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  category: text("category").notNull(), // maintenance, utilities, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  property_id: uuid("property_id").references(() => properties.id).notNull(),
  tenant_id: uuid("tenant_id").references(() => users.id).notNull(),
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date").notNull(),
  duration: text("duration").notNull(), // 'daily', 'weekly', 'monthly'
  total_amount: numeric("total_amount").notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'confirmed', 'cancelled', 'completed'
  payment_status: text("payment_status").notNull().default("pending"), // 'pending', 'paid', 'refunded'
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Property Analytics table
export const propertyAnalytics = pgTable("property_analytics", {
  id: uuid("id").primaryKey().defaultRandom(),
  property_id: uuid("property_id").references(() => properties.id).notNull(),
  total_bookings: integer("total_bookings").notNull().default(0),
  total_revenue: numeric("total_revenue").notNull().default('0'),
  occupancy_rate: numeric("occupancy_rate").notNull().default('0'),
  average_rating: numeric("average_rating"),
  monthly_stats: jsonb("monthly_stats").notNull().default("{}"),
  last_updated: timestamp("last_updated").defaultNow().notNull(),
}); 
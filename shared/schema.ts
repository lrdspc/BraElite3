import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Non-conformity categories and types
export const nonConformityCategories = [
  "structural",
  "installation",
  "material",
  "aesthetic",
  "water_infiltration",
  "other"
] as const;

export const standardNonConformities = [
  "broken_tiles",
  "misaligned_tiles",
  "incorrect_overlap",
  "missing_fasteners",
  "improper_sealing",
  "water_damage",
  "color_variation",
  "cracked_ridge",
  "inadequate_slope",
  "damaged_flashing",
  "incorrect_spacing",
  "thermal_expansion_issues",
  "improper_ventilation",
  "structural_overload"
] as const;

export const weatherConditions = [
  "sunny",
  "cloudy",
  "partly_cloudy",
  "rainy",
  "stormy",
  "windy",
  "foggy",
  "snowy"
] as const;

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("technician"),
  avatar: text("avatar"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Client schema
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // "person" or "company"
  document: text("document"), // CPF or CNPJ
  contactName: text("contact_name"),
  contactPhone: text("contact_phone"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Project schema (empreendimentos)
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  number: text("number"),
  complement: text("complement"),
  neighborhood: text("neighborhood"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Inspection schema (vistorias)
export const inspections = pgTable("inspections", {
  id: serial("id").primaryKey(),
  protocolNumber: text("protocol_number").notNull().unique(),
  userId: integer("user_id").notNull(),
  clientId: integer("client_id").notNull(),
  projectId: integer("project_id").notNull(),
  status: text("status").notNull().default("draft"), // draft, in_progress, completed, reviewed
  scheduledDate: timestamp("scheduled_date"),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  // Geolocation data
  startLatitude: text("start_latitude"),
  startLongitude: text("start_longitude"),
  endLatitude: text("end_latitude"),
  endLongitude: text("end_longitude"),
  // Weather conditions
  weatherCondition: text("weather_condition"),
  temperature: real("temperature"),
  humidity: real("humidity"),
  windSpeed: real("wind_speed"),
  // Roof details
  roofModel: text("roof_model"),
  quantity: integer("quantity"),
  area: integer("area"),
  installationDate: timestamp("installation_date"),
  warranty: text("warranty"),
  invoice: text("invoice"),
  technicalAnalysis: jsonb("technical_analysis"),
  conclusion: text("conclusion"),
  recommendation: text("recommendation"),
  signature: text("signature"),
  clientSignature: text("client_signature"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertInspectionSchema = createInsertSchema(inspections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Evidence schema (photos, documents, etc.)
export const evidences = pgTable("evidences", {
  id: serial("id").primaryKey(),
  inspectionId: integer("inspection_id").notNull(),
  type: text("type").notNull(), // photo, document, etc.
  // Non-conformity details
  category: text("category"), // category of non-conformity (from nonConformityCategories)
  nonConformityType: text("non_conformity_type"), // type of non-conformity (from standardNonConformities)
  severity: text("severity"), // low, medium, high
  // File details
  fileUrl: text("file_url").notNull(),
  thumbnailUrl: text("thumbnail_url"), // compressed thumbnail for faster loading
  fileSize: integer("file_size"), // size in bytes
  // Annotations
  annotations: jsonb("annotations"), // JSON data for annotations (arrows, circles, measurements)
  // Metadata
  notes: text("notes"),
  location: text("location"), // specific location within the project
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEvidenceSchema = createInsertSchema(evidences).omit({
  id: true,
  createdAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Inspection = typeof inspections.$inferSelect;
export type InsertInspection = z.infer<typeof insertInspectionSchema>;

export type Evidence = typeof evidences.$inferSelect;
export type InsertEvidence = z.infer<typeof insertEvidenceSchema>;

// Zod schemas for enums
export const nonConformityCategorySchema = z.enum(nonConformityCategories);
export const standardNonConformitySchema = z.enum(standardNonConformities);
export const weatherConditionSchema = z.enum(weatherConditions);
export const severitySchema = z.enum(["low", "medium", "high"]);

// Extended validation schemas
export const weatherDataSchema = z.object({
  weatherCondition: weatherConditionSchema.optional(),
  temperature: z.number().optional(),
  humidity: z.number().optional(),
  windSpeed: z.number().optional(),
});

export const geolocationSchema = z.object({
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

export const annotationSchema = z.object({
  type: z.enum(["arrow", "circle", "rectangle", "text", "measurement"]),
  points: z.array(z.object({ x: z.number(), y: z.number() })),
  color: z.string().optional(),
  text: z.string().optional(),
  width: z.number().optional(),
  measurement: z.number().optional(),
  unit: z.string().optional(),
});

export const nonConformitySchema = z.object({
  category: nonConformityCategorySchema,
  type: standardNonConformitySchema,
  severity: severitySchema,
  description: z.string().optional(),
});

// Validation schemas (extended from insert schemas)
export const loginSchema = z.object({
  username: z.string().min(1, "Usuário é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

// Export types for the new schemas
export type NonConformityCategory = z.infer<typeof nonConformityCategorySchema>;
export type StandardNonConformity = z.infer<typeof standardNonConformitySchema>;
export type WeatherCondition = z.infer<typeof weatherConditionSchema>;
export type Severity = z.infer<typeof severitySchema>;
export type WeatherData = z.infer<typeof weatherDataSchema>;
export type Geolocation = z.infer<typeof geolocationSchema>;
export type Annotation = z.infer<typeof annotationSchema>;
export type NonConformity = z.infer<typeof nonConformitySchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;

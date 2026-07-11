import { z } from "zod";

export const JOB_STATUS_VALUES = [
  "PENDING",
  "SITE_VISITED",
  "REVISIT_REQUIRED",
  "POSTPONED",
  "QUOTATION_SENT",
  "COMPLETED",
  "CANCELLED",
] as const;

export const QUOTATION_STATUS_VALUES = [
  "NOT_SENT",
  "SENT",
  "APPROVED",
  "REJECTED",
] as const;

export const DOC_TYPE_VALUES = ["QUOTATION", "CONTRACT", "INVOICE", "OTHER"] as const;

export const siteSchema = z.object({
  engineer: z.string().trim().min(1, "Engineer / telecom location is required"),
  microbusinessManager: z.string().trim().min(1, "Microbusiness manager is required"),
  customerName: z.string().trim().min(1, "Customer name is required"),
  address: z.string().trim().min(1, "Address is required"),
  contactNumber: z.string().trim().optional().nullable(),
  scope: z.string().trim().optional().nullable(),
  jobStatus: z.enum(JOB_STATUS_VALUES).default("PENDING"),
  jobStatusNote: z.string().trim().optional().nullable(),
  quotationStatus: z.enum(QUOTATION_STATUS_VALUES).default("NOT_SENT"),
  solutionDetailsLochana: z.string().trim().optional().nullable(),
  solutionDetailsBuddika: z.string().trim().optional().nullable(),
});

export type SiteInput = z.infer<typeof siteSchema>;

export const bomItemSchema = z.object({
  category: z.string().trim().min(1, "Category is required"),
  item: z.string().trim().min(1, "Item is required"),
  quantity: z.string().trim().min(1, "Quantity is required"),
});

export type BomItemInput = z.infer<typeof bomItemSchema>;

export const taskSchema = z.object({
  description: z.string().trim().min(1, "Description is required"),
});

export type TaskInput = z.infer<typeof taskSchema>;

export const travelExpenseSchema = z.object({
  siteId: z.string().trim().optional().nullable(),
  date: z.string().trim().min(1, "Date is required"),
  purpose: z.string().trim().min(1, "Purpose is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  distanceKm: z.coerce.number().nonnegative().optional().nullable(),
});

export type TravelExpenseInput = z.infer<typeof travelExpenseSchema>;

export const userSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Enter a valid email"),
  role: z.enum(["ADMIN", "STAFF"]).default("STAFF"),
});

export type UserInput = z.infer<typeof userSchema>;

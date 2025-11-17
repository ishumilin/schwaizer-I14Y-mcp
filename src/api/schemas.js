/**
 * Zod schemas for I14Y API validation
 * @module api/schemas
 */

import { z } from "zod";

/**
 * Common schemas
 */
export const LanguageSchema = z.enum(["de", "fr", "it", "en", "rm"]);

export const PaginationSchema = z.object({
  page: z.number().int().min(0).default(0),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export const MultilingualTextSchema = z.object({
  de: z.string().optional(),
  fr: z.string().optional(),
  it: z.string().optional(),
  en: z.string().optional(),
  rm: z.string().optional(),
});

/**
 * Catalog schemas
 */
export const CatalogIdSchema = z.string().min(1);

export const SearchQuerySchema = z.object({
  query: z.string().min(1).describe("Search query text"),
  page: z.number().int().min(0).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export const ExportCatalogSchema = z.object({
  format: z.enum(["rdf", "ttl"]).describe("Export format (RDF or Turtle)"),
  language: LanguageSchema.optional().describe("Language for the export"),
});

/**
 * Concept schemas
 */
export const ConceptIdSchema = z.string().min(1);

export const searchConceptsSchema = z.object({
  conceptIdentifier: z.string().optional().describe("Concept identifier filter"),
  publisherIdentifier: z.string().optional().describe("Publisher identifier filter"),
  version: z.string().optional().describe("Version filter"),
  publicationLevel: z.enum(["Internal", "Public"]).optional().describe("Publication level"),
  registrationStatus: z.enum([
    "Incomplete",
    "Candidate",
    "Recorded",
    "Qualified",
    "Standard",
    "PreferredStandard",
    "Superseded",
    "Retired"
  ]).optional().describe("Concept registration status filter"),
  page: z.number().int().min(1).default(1).describe("Page number (1-indexed)"),
  pageSize: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(25)
    .describe("Items per page"),
});

export const getConceptSchema = z.object({
  id: z.string().uuid().describe("Concept ID"),
});

export const getCodeListEntriesSchema = z.object({
  id: z.string().uuid().describe("Code list concept ID"),
  page: z.number().int().min(1).default(1).describe("Page number"),
  pageSize: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(25)
    .describe("Items per page"),
});

export const ExportConceptSchema = z.object({
  id: z.string().describe("Concept ID to export"),
  format: z.enum(["json", "csv"]).describe("Export format"),
  language: LanguageSchema.optional().describe("Language for export"),
});

/**
 * Dataset schemas
 */
export const DatasetIdSchema = z.string().min(1);

export const searchDatasetsSchema = z.object({
  accessRights: z.string().optional().describe("Access rights code"),
  datasetIdentifier: z.string().optional().describe("Dataset identifier filter"),
  publisherIdentifier: z.string().optional().describe("Publisher identifier filter"),
  publicationLevel: z.string().optional().describe("Publication level"),
  registrationStatus: z.string().optional().describe("Registration status"),
  page: z.number().int().min(1).default(1).describe("Page number"),
  pageSize: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(25)
    .describe("Items per page"),
});

export const getDatasetSchema = z.object({
  id: z.string().describe("Dataset ID"),
  language: z.string().optional().describe("Language code (e.g., de, fr, it, en)"),
});

export const getDatasetStructureSchema = z.object({
  id: z.string().describe("Dataset ID"),
  language: z.string().optional().describe("Language code (e.g., de, fr, it, en)"),
});

export const exportDatasetStructureSchema = z.object({
  id: z.string().describe("Dataset ID"),
  format: z.string().describe("Export format (e.g., json, xml)"),
  language: z.string().optional().describe("Language code (e.g., de, fr, it, en)"),
});

export const listDatasetDistributionsSchema = z.object({
  id: z.string().describe("Dataset ID"),
  language: z.string().optional().describe("Language code (e.g., de, fr, it, en)"),
});

/**
 * Data Service schemas
 */
export const DataServiceIdSchema = z.string().min(1);

export const searchDataServicesSchema = z.object({
  accessRights: z.string().optional(),
  dataServiceIdentifier: z.string().optional(),
  publisherIdentifier: z.string().optional(),
  publicationLevel: z.string().optional(),
  registrationStatus: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(25),
});

export const getDataServiceSchema = z.object({
  id: z.string().uuid().describe("Data service UUID"),
});

/**
 * Public Service schemas
 */
export const PublicServiceIdSchema = z.string().min(1);

export const searchPublicServicesSchema = z.object({
  publicServiceIdentifier: z.string().optional(),
  publisherIdentifier: z.string().optional(),
  publicationLevel: z.string().optional(),
  registrationStatus: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(25),
});

export const getPublicServiceSchema = z.object({
  id: z.string().uuid().describe("Public service UUID"),
});

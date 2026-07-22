export type DocumentId = string;
export type ProjectId = string;
export type UserId = string;
export type DocumentVersion = number;

export enum DocumentType {
  CUSTOM = "CUSTOM",
  PRD = "PRD",
  API_SPEC = "API_SPEC",
  DATABASE_SCHEMA = "DATABASE_SCHEMA",
  USER_STORIES = "USER_STORIES",
  TEST_CASES = "TEST_CASES",
  SPRINT_PLAN = "SPRINT_PLAN",
  PULL_REQUEST = "PULL_REQUEST",
  COMMIT = "COMMIT",
}

export enum DocumentStatus {
  DRAFT = "DRAFT",
  GENERATING = "GENERATING",
  READY = "READY",
  FAILED = "FAILED",
  ARCHIVED = "ARCHIVED",
}

export enum DocumentFreshness {
  UP_TO_DATE = "UP_TO_DATE",
  OUTDATED = "OUTDATED",
  UNKNOWN = "UNKNOWN",
}

export enum RegenerationStatus {
  IDLE = "IDLE",
  QUEUED = "QUEUED",
  GENERATING = "GENERATING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export interface DocumentMetadata {
  [key: string]: any;
}

export interface Document {
  id: DocumentId;
  projectId: ProjectId;
  title: string;
  type: DocumentType;
  status: DocumentStatus;
  version: DocumentVersion;
  content: any;
  icon: string;
  isFavorite: boolean;
  sortOrder: number;
  createdByAi: boolean;
  parentDocumentId: DocumentId | null;
  lastGeneratedAt: string | null;
  createdAt: string;
  updatedAt: string;
  metadata?: DocumentMetadata;
}

export function incrementVersion(version: DocumentVersion): DocumentVersion {
  return version + 1;
}

export function resetVersion(): DocumentVersion {
  return 1;
}

export function mapDbDocumentToDomain(doc: any): Document {
  if (!doc) return doc;
  return {
    id: doc.id,
    projectId: doc.project_id !== undefined ? doc.project_id : doc.projectId,
    title: doc.title,
    type: doc.type,
    status: doc.status,
    version: doc.version !== undefined ? doc.version : doc.version,
    content: doc.content,
    icon: doc.icon,
    isFavorite: doc.is_favorite !== undefined ? doc.is_favorite : doc.isFavorite,
    sortOrder: doc.sort_order !== undefined ? doc.sort_order : doc.sortOrder,
    createdByAi: doc.created_by_ai !== undefined ? doc.created_by_ai : doc.createdByAi,
    parentDocumentId: doc.parent_document_id !== undefined ? doc.parent_document_id : doc.parentDocumentId,
    lastGeneratedAt: doc.last_generated_at !== undefined ? doc.last_generated_at : doc.lastGeneratedAt,
    createdAt: doc.created_at !== undefined ? doc.created_at : doc.createdAt,
    updatedAt: doc.updated_at !== undefined ? doc.updated_at : doc.updatedAt,
    metadata: doc.metadata,
  };
}

export interface DocumentRelationshipViewModel {
  parent: Document | null;
  children: Document[];
  siblings: Document[];
  ancestors: Document[];
  descendants: Document[];
}

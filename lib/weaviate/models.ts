// src/lib/weaviate/models.ts
// Types for data models

export interface Project {
    id?: string;
    name: string;
    description?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    createdAt?: string; // ISO date string
    updatedAt?: string; // ISO date string
    clerkOrgId: string;
}

export interface Subcontractor {
    id?: string;
    name: string;
    contactName?: string;
    email?: string;
    phone?: string;
    address?: string;
    unitNumber?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    taxId?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Worker {
    id?: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    subcontractorId: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface WorkerProject {
    workerId: string;
    projectId: string;
    assignedAt?: string;
}

export interface WorkerIdentification {
    id?: string;
    fileName: string;
    filePath: string;
    fileType: string;
    fileSize?: number;
    issueDate?: string;
    expiryDate?: string;
    workerId: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Report {
    id?: string;
    title?: string;
    filePath: string;
    fileType: string;
    fileSize?: number;
    reportDate: string;
    projectId: string;
    workerId: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Blueprint {
    id?: string;
    title: string;
    filePath: string;
    fileType: string;
    fileSize?: number;
    projectId: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ChatSession {
    id?: string;
    title: string;
    messages: string; // JSON string
    userId: string;
    organizationId: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ClassReference {
    fromClass: string;
    toClass: string;
    referenceName: string;
}
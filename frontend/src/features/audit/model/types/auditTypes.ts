export type AuditAction = 'UPLOAD' | 'REPLACE' | 'DELETE' | 'DOWNLOAD';

export interface AuditLog {
    id: string;
    timestamp: string;
    userId: string;
    userName: string;
    userRole: 'admin' | 'teacher' | 'student';
    action: AuditAction;
    labId: string;
    labName: string;
    fileName: string;
    fileSize: number;
}

export interface AuditResponse {
    items: AuditLog[];
    total: number;
}

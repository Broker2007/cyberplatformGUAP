export interface LabTemplateDescription{
    overview:string;
    objectives:string[];
    resources:{
        title:string;
        url:string;
    }[]
}

export interface LabTemplate {
    id: string;
    name: string;
    description: LabTemplateDescription;
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];
    eveNgTopologyId: string;
    createdAt: string;
}

export interface PageMeta {
    page: number;
    perPage: number;
    total: number;
}
export interface LabsSchema {
    items?: LabTemplate[];
    isLoading: boolean;
    error?: string | undefined;
    meta: PageMeta | null;
    currentLab: LabTemplate | null;
    isLoadingCurrent: boolean
}
export interface LabsResponse {
    items: LabTemplate[];
    meta: PageMeta;
}

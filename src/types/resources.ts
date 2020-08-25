export interface Resources {
    Config: Config,
    Languages: Language[],
    Packages: Package[],
    User: User,
    ApiGroups: ApiGroup[],        
}

export interface Config {
    allowPublic: boolean;
    description: string;
    name: string;
    role: string;
    languageServer: {
        enabled: boolean;
        port: number;
    };
}

export interface User {
    email: string;
    language: string;
    name: string;
    username: string;
}

export interface Language {
    ISOCODE: string;
    NAME: string;
}

export interface Package {
    id: string;
    name: string;
}

export interface ApiGroup {
    id: string;
    name: string;
    description: string;
    apis: Api[];
}

export interface Api {
    id: string;
    name: string;
    description: string;
    apiType: string;
    paths: ApiPath[];
}

export interface ApiPath {
    id: string;
    description: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string;
}
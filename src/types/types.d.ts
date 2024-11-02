declare module '@/policies/userSchema' {
    export const userSchema: any;
}

export interface User {
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}
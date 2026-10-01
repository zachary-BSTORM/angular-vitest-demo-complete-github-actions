export interface LoginForm {
    email : string;
    password : string;
}

export interface RegisterForm {
    email: string;
    password: string;
    name?: string; 
    role  : 'user' | 'admin'
}
export interface LoginResponse {
    accessToken: string;
    user: {
        id: number;
        email: string;
        role : string;
    }
}
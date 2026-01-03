// Authentication service for managing JWT tokens

const TOKEN_KEY = 'splitwise_auth_token';
const USER_KEY = 'splitwise_user';

export interface AuthUser {
    id: number;
    email: string;
    name: string;
}

export const authService = {
    saveToken(token: string): void {
        localStorage.setItem(TOKEN_KEY, token);
    },

    getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    },

    removeToken(): void {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem('userId');
    },

    isAuthenticated(): boolean {
        return !!this.getToken();
    },

    saveUser(user: AuthUser): void {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        localStorage.setItem('userId', user.id.toString());
    },

    getUser(): AuthUser | null {
        const userStr = localStorage.getItem(USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    },

    getAuthHeader(): { Authorization: string } | {} {
        const token = this.getToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
    }
};

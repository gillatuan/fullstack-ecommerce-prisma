import { createContext } from "react";

export type AuthUser = {
	userId: string;
	email: string;
	roles?: string[];
	permissions?: string[];
	iat?: number;
	exp?: number;
};

export type AuthContextValue = {
	user: AuthUser | null;
	setUser: (u: AuthUser | null) => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
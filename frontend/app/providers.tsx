"use client";

import { ThemeProvider } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { ReactElement, useState } from "react";
import darkTheme from "./dark.theme";
import { AuthContext, AuthUser } from "./auth/auth-context";

interface ProviderProps {
  children: ReactElement[];
  initialUser: AuthUser | null;
}

export default function Providers({ children, initialUser }: ProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={darkTheme}>
        <AuthContext.Provider value={{ user, setUser }}>
          {children}
        </AuthContext.Provider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
"use client";

import { AuthContext } from "@/app/auth/auth-context";
import AppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import { useContext } from "react";
import { Settings } from "./settings";
import { MenuPage } from "./MenuPage";

export default function Header () {
  const isAuthenticated = useContext( AuthContext );

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <MenuPage />
          
          {isAuthenticated && <Settings />}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
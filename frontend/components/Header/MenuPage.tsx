
import { AuthContext } from "@/app/auth/auth-context";
import { authenticatedRoutes, unauthenticatedRoutes } from "@/common/constants/routes";
import MenuIcon from "@mui/icons-material/Menu";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { redirect } from "next/navigation";
import { MouseEvent, useContext, useState } from "react";

export const MenuPage = () => {
  const isAuthenticated = useContext( AuthContext );

  const [ anchorElNav, setAnchorElNav ] = useState<null | HTMLElement>(
    null
  );

  const handleOpenNavMenu = ( event: MouseEvent<HTMLElement> ) => {
    setAnchorElNav( event.currentTarget );
  };

  const handleCloseNavMenu = ( url: string ) => {
    setAnchorElNav( null );

    redirect( url );
  };

  const pages = isAuthenticated ? authenticatedRoutes : unauthenticatedRoutes
  return (
    <>
      <ShoppingBasketIcon
        sx={{ display: { xs: "none", md: "flex" }, mr: 1 }}
      />
      <Typography
        variant="h6"
        noWrap
        component={Link}
        href="/"
        sx={{
          mr: 2,
          display: { xs: "none", md: "flex" },
          fontFamily: "monospace",
          fontWeight: 700,
          letterSpacing: ".3rem",
          color: "inherit",
          textDecoration: "none",
        }}
      >
        Shoppy
      </Typography>

      <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleOpenNavMenu}
          color="inherit"
        >
          <MenuIcon />
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorElNav}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          open={Boolean( anchorElNav )}
          onClose={handleCloseNavMenu}
          sx={{
            display: { xs: "block", md: "none" },
          }}
        >
          {pages.map( ( page ) => (
            page.title && ( <MenuItem key={page.title} onClick={() => handleCloseNavMenu( page.path )}>
              <Typography textAlign="center">{page.title}</Typography>
            </MenuItem> )
          ) )}
        </Menu>
      </Box>
      <ShoppingBasketIcon
        sx={{ display: { xs: "flex", md: "none" }, mr: 1 }}
      />
      <Typography
        variant="h5"
        noWrap
        component={Link}
        href="/"
        sx={{
          mr: 2,
          display: { xs: "flex", md: "none" },
          flexGrow: 1,
          fontFamily: "monospace",
          fontWeight: 700,
          letterSpacing: ".3rem",
          color: "inherit",
          textDecoration: "none",
        }}
      >
        Shoppy
      </Typography>
      <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
        {pages.map( ( page ) => (
          page.title && ( <Button
            key={page.title}
            onClick={() => handleCloseNavMenu( page.path )}
            sx={{ my: 2, color: "white", display: "block" }}
          >
            {page.title}
          </Button>
          ) ) )}
      </Box>
    </>
  )
}
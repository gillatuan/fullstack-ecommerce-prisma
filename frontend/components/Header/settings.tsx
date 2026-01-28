import { settings } from "constants/menu";
import { Avatar, Box, IconButton, Menu, MenuItem, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/auth/logout";

export const Settings = () => {
  const router = useRouter();
  const [ anchorElUser, setAnchorElUser ] = useState<null | HTMLElement>(
    null
  );

  const handleOpenUserMenu = ( event: React.MouseEvent<HTMLElement> ) => {
    setAnchorElUser( event.currentTarget );
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser( null );
  };

  return (
    <Box sx={{ flexGrow: 0 }}>
      <Tooltip title="Open settings">
        <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
          <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
        </IconButton>
      </Tooltip>
      <Menu
        sx={{ mt: "45px" }}
        id="menu-appbar"
        anchorEl={anchorElUser}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={Boolean( anchorElUser )}
        onClose={handleCloseUserMenu}
      >
        {settings.map( ( setting ) => (
          <MenuItem key={setting.title} onClick={() => {
            handleCloseUserMenu();
            if ( setting.title === "Logout" ) {
              // Implement your logout logic here
              logout();
            } else {
              router.push( setting.url );
            }
          }}>
            <Typography textAlign="center">{setting.title}</Typography>
          </MenuItem>
        ) )}
      </Menu>
    </Box>
  );
};
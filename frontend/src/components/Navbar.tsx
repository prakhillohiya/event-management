import { Icon } from "@iconify/react";
import { AppBar, Container, Toolbar, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const Navbar = () => {
  return (
    <AppBar position="static" color="success">
      <Container
        maxWidth="xl"
        sx={{
          "&.MuiContainer-root": {
            display: "flex",
            justifyContent: "space-between",
            padding:"1rem"
          },
        }}
      >
        <Toolbar disableGutters>
          <Icon icon="material-symbols:event-outline" width="50" height="50"/>
          <Typography
            variant="h6"
            noWrap
            sx={{
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".1rem",
              color: "inherit",
              textDecoration: "none",
              alignItems: "center",
              marginLeft:"1rem"
            }}
          >
            Event Management
          </Typography>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;

import React from "react";
import { Box } from "@mui/material";
import { Locale } from "@churchapps/apphelper";

export const Footer: React.FC = () => (
  <div id="footer">
    <Box sx={{ textAlign: "center" }}>
      <img src="/images/logo.png" alt="logo" />
      <p>Contact: info@lifereformationcentre.org</p>
      <p>© {new Date().getFullYear()} Life Reformation Centre. {Locale.label("components.footer.rights")}</p>
    </Box>
  </div>
);

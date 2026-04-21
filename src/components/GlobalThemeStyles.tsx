import React, { useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";

const lightenColor = (color: string, percent: number): string => {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return `#${(
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  )
    .toString(16)
    .slice(1)}`;
};

const darkenColor = (color: string, percent: number): string => {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = ((num >> 8) & 0x00ff) - amt;
  const B = (num & 0x0000ff) - amt;
  return `#${(
    0x1000000 +
    (R > 0 ? R : 0) * 0x10000 +
    (G > 0 ? G : 0) * 0x100 +
    (B > 0 ? B : 0)
  )
    .toString(16)
    .slice(1)}`;
};

export const GlobalThemeStyles: React.FC = () => {
  const { colors, logoUrl } = useTheme();

  useEffect(() => {
    const styleId = "church-global-theme-styles";
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    const primary = colors.primary || "#0066FF";
    const secondary = colors.secondary || "#1A1F36";
    const accent = colors.accent || "#00D4AA";

    const primaryLight = lightenColor(primary, 20);
    const primaryLightAlt = lightenColor(primary, 10);
    const primaryDark = darkenColor(primary, 10);
    const primaryDarkAlt = darkenColor(primary, 20);
    const secondaryLight = lightenColor(secondary, 20);
    const secondaryLightAlt = lightenColor(secondary, 10);
    const secondaryDark = darkenColor(secondary, 10);
    const secondaryDarkAlt = darkenColor(secondary, 20);

    let css = `
      /* Override SiteHeader variables */
      #site-header {
        --c1: ${primary} !important;
        --c1l1: ${primaryLightAlt} !important;
        --c1l2: ${primaryLight} !important;
        --c1d1: ${primaryDark} !important;
        --c1d2: ${primaryDarkAlt} !important;
        --church-secondary: ${secondary} !important;
        --church-accent: ${accent} !important;
        background-color: ${primary} !important;
        color: #ffffff !important;
      }

      #site-app-bar,
      #site-toolbar,
      #site-header .MuiAppBar-root,
      .MuiAppBar-root#site-app-bar {
        background-color: ${primary} !important;
        background-image: none !important;
        color: #ffffff !important;
      }

      #site-toolbar .MuiTab-root,
      #site-toolbar .MuiButtonBase-root,
      #site-toolbar .MuiIconButton-root {
        color: rgba(255, 255, 255, 0.92) !important;
      }

      #site-toolbar .MuiTab-root.Mui-selected {
        color: #ffffff !important;
      }

      #site-toolbar .MuiTab-root.Mui-selected::after {
        border-bottom-color: #ffffff !important;
      }

      .MuiButton-containedPrimary,
      .MuiButton-containedPrimary:hover {
        background-color: ${primary} !important;
      }

      .MuiChip-colorPrimary,
      .MuiChip-colorPrimary .MuiChip-label {
        background-color: ${primary} !important;
        color: #ffffff !important;
      }

      /* Dashboard page banner */
      #page-header {
        --c1: ${secondary} !important;
        --c1l1: ${secondaryLightAlt} !important;
        --c1l2: ${secondaryLight} !important;
        --c1d1: ${secondaryDark} !important;
        --c1d2: ${secondaryDarkAlt} !important;
        background-color: ${secondary} !important;
      }

      #page-header-title,
      #page-header-subtitle,
      #page-header .MuiTypography-root {
        color: #ffffff !important;
      }

      #page-header-icon {
        background-color: rgba(255, 255, 255, 0.2) !important;
        border-radius: 12px !important;
      }
    `;

    if (logoUrl) {
      css += `
        #site-toolbar::before {
          content: '';
          display: inline-block;
          width: 32px;
          height: 32px;
          background-image: url('${logoUrl}');
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          margin-right: 12px;
        }
      `;
    } else {
      css += `
        #site-toolbar::before {
          content: none;
        }
      `;
    }

    styleElement.textContent = css;

    console.log("🎨 GlobalThemeStyles: Applied theme CSS", { colors, logoUrl });
  }, [colors, logoUrl]);

  return null;
};

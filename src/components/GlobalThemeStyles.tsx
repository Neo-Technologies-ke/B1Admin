import { useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";

export const GlobalThemeStyles: React.FC = () => {
  const { colors, logoUrl } = useTheme();

  useEffect(() => {
    // Create or update the global theme style element
    const styleId = 'church-global-theme-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    // Build CSS with church branding
    let css = `
      /* Apply church primary color to header */
      #banner,
      header#banner,
      .MuiAppBar-root#banner,
      body #banner,
      body header#banner {
        background-color: ${colors.primary} !important;
        background-image: none !important;
      }
      
      /* Style navigation tabs */
      #banner .MuiTab-root {
        color: rgba(255, 255, 255, 0.9) !important;
      }
      
      #banner .MuiTab-root.Mui-selected {
        color: white !important;
        border-bottom-color: white !important;
      }
      
      /* Style icon buttons */
      #banner .MuiIconButton-root {
        color: rgba(255, 255, 255, 0.9) !important;
      }
      
      /* Style buttons with primary color */
      .MuiButton-containedPrimary {
        background-color: ${colors.primary} !important;
      }
      
      .MuiButton-containedPrimary:hover {
        background-color: ${colors.primary} !important;
        filter: brightness(0.9);
      }
    `;

    // Add logo if available
    if (logoUrl) {
      css += `
        /* Display church logo in header */
        #banner::before {
          content: '';
          display: inline-block;
          width: 32px;
          height: 32px;
          background-image: url('${logoUrl}');
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          margin-right: 12px;
          vertical-align: middle;
        }
      `;
    }

    styleElement.textContent = css;
    
    console.log('🎨 GlobalThemeStyles: Applied theme CSS', { colors, logoUrl });
  }, [colors, logoUrl]);

  return null;
};

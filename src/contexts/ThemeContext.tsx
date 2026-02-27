import React, { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ApiHelper, UserHelper } from "@churchapps/apphelper";

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
}

interface ThemeContextType {
  colors: ThemeColors;
  logoUrl: string | null;
  refreshTheme: () => void;
  isLoading: boolean;
}

const defaultColors: ThemeColors = {
  primary: "#0066FF",
  secondary: "#1A1F36",
  accent: "#00D4AA"
};

const ThemeContext = createContext<ThemeContextType>({
  colors: defaultColors,
  logoUrl: null,
  refreshTheme: () => {},
  isLoading: true
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [colors, setColors] = useState<ThemeColors>(defaultColors);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadTheme = async () => {
    try {
      const churchId = UserHelper.currentUserChurch?.church?.id;
      
      console.log("🎨 ThemeContext: Loading theme for churchId:", churchId);
      console.log("🎨 ThemeContext: UserHelper.currentUserChurch:", UserHelper.currentUserChurch);
      
      if (!churchId) {
        console.log("🎨 ThemeContext: No churchId found, skipping theme load");
        setIsLoading(false);
        return;
      }

      // Load public settings for the church with cache-busting
      const cacheBuster = `?t=${Date.now()}`;
      const settings = await ApiHelper.getAnonymous(
        `/settings/public/${churchId}${cacheBuster}`,
        "MembershipApi"
      );

      console.log("🎨 ThemeContext: Loaded settings:", settings);
      console.log("🎨 ThemeContext: Settings keys:", settings ? Object.keys(settings) : "null");

      if (settings) {
        const newColors = { ...defaultColors };
        
        if (settings.brandPrimaryColor) {
          console.log("🎨 ThemeContext: Found brandPrimaryColor:", settings.brandPrimaryColor);
          newColors.primary = settings.brandPrimaryColor;
        }
        if (settings.brandSecondaryColor) {
          console.log("🎨 ThemeContext: Found brandSecondaryColor:", settings.brandSecondaryColor);
          newColors.secondary = settings.brandSecondaryColor;
        }
        if (settings.brandAccentColor) {
          console.log("🎨 ThemeContext: Found brandAccentColor:", settings.brandAccentColor);
          newColors.accent = settings.brandAccentColor;
        }
        
        console.log("🎨 ThemeContext: Applying colors:", newColors);
        setColors(newColors);
        
        // Load logo - check both brandLogoUrl (new) and logoLight (existing)
        if (settings.brandLogoUrl) {
          console.log("🎨 ThemeContext: Setting logo from brandLogoUrl:", settings.brandLogoUrl);
          setLogoUrl(settings.brandLogoUrl);
        } else if (settings.logoLight) {
          console.log("🎨 ThemeContext: Setting logo from logoLight:", settings.logoLight);
          setLogoUrl(settings.logoLight);
        } else {
          console.log("🎨 ThemeContext: No logo found in settings");
        }
        
        // Apply CSS custom properties
        applyThemeColors(newColors);
        console.log("🎨 ThemeContext: Theme applied successfully");
        console.log("🎨 ThemeContext: CSS variables set on :root");
      } else {
        console.log("🎨 ThemeContext: No settings returned from API");
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("🎨 ThemeContext: Error loading theme:", error);
      setIsLoading(false);
    }
  };

  const applyThemeColors = (themeColors: ThemeColors) => {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty("--church-primary", themeColors.primary);
    root.style.setProperty("--church-secondary", themeColors.secondary);
    root.style.setProperty("--church-accent", themeColors.accent);
    
    // Apply to existing color variables (for backward compatibility)
    root.style.setProperty("--c1", themeColors.primary);
    root.style.setProperty("--c1l1", lightenColor(themeColors.primary, 10));
    root.style.setProperty("--c1l2", lightenColor(themeColors.primary, 20));
    root.style.setProperty("--c1d1", darkenColor(themeColors.primary, 10));
    root.style.setProperty("--c1d2", darkenColor(themeColors.primary, 20));
  };

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

  const refreshTheme = () => {
    loadTheme();
  };

  useEffect(() => {
    loadTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ colors, logoUrl, refreshTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

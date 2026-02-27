import React, { useState, useEffect } from "react";
import { Box, Grid, Typography, TextField, Stack, Card, CardContent, alpha, Button } from "@mui/material";
import { Palette as PaletteIcon, Refresh as RefreshIcon, CloudUpload as CloudUploadIcon, Image as ImageIcon } from "@mui/icons-material";
import { ApiHelper, ArrayHelper, Locale, ImageEditor } from "@churchapps/apphelper";
import type { GenericSettingInterface } from "@churchapps/helpers";
import Resizer from "react-image-file-resizer";

interface Props {
  churchId: string;
  saveTrigger: Date | null;
  onError?: (errors: string[]) => void;
}

export const ChurchBrandingEdit: React.FC<Props> = ({ churchId, saveTrigger, onError }) => {
  const [settings, setSettings] = useState<GenericSettingInterface[]>([]);
  const [primaryColor, setPrimaryColor] = useState("#0066FF");
  const [secondaryColor, setSecondaryColor] = useState("#1A1F36");
  const [accentColor, setAccentColor] = useState("#00D4AA");
  const [isLoading, setIsLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [editLogo, setEditLogo] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("about:blank");

  const loadSettings = async () => {
    try {
      const data = await ApiHelper.get("/settings", "MembershipApi");
      setSettings(data || []);
      
      // Load existing colors
      const primary = ArrayHelper.getOne(data, "keyName", "brandPrimaryColor");
      const secondary = ArrayHelper.getOne(data, "keyName", "brandSecondaryColor");
      const accent = ArrayHelper.getOne(data, "keyName", "brandAccentColor");
      const logo = ArrayHelper.getOne(data, "keyName", "brandLogoUrl");
      
      if (primary?.value) setPrimaryColor(primary.value);
      if (secondary?.value) setSecondaryColor(secondary.value);
      if (accent?.value) setAccentColor(accent.value);
      if (logo?.value) setLogoUrl(logo.value);
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading branding settings:", error);
      setIsLoading(false);
    }
  };

  const updateSetting = (keyName: string, value: string) => {
    const updatedSettings = [...settings];
    const existing = updatedSettings.find(s => s.keyName === keyName);
    
    if (existing) {
      existing.value = value;
    } else {
      updatedSettings.push({
        keyName,
        value,
        public: 1,
        churchId
      });
    }
    
    setSettings(updatedSettings);
  };

  const handleColorChange = (colorType: string, value: string) => {
    switch (colorType) {
      case "primary":
        setPrimaryColor(value);
        updateSetting("brandPrimaryColor", value);
        break;
      case "secondary":
        setSecondaryColor(value);
        updateSetting("brandSecondaryColor", value);
        break;
      case "accent":
        setAccentColor(value);
        updateSetting("brandAccentColor", value);
        break;
    }
  };

  const resetToDefaults = () => {
    setPrimaryColor("#0066FF");
    setSecondaryColor("#1A1F36");
    setAccentColor("#00D4AA");
    updateSetting("brandPrimaryColor", "#0066FF");
    updateSetting("brandSecondaryColor", "#1A1F36");
    updateSetting("brandAccentColor", "#00D4AA");
  };

  const resizeImage = (file: File, width: number, height: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        Resizer.imageFileResizer(
          file,
          width,
          height,
          "PNG",
          100,
          0,
          (uri: any) => { resolve(uri.toString()); },
          "base64",
          width,
          height
        );
      } catch (err) {
        console.error("Error resizing image:", err);
        reject(err);
      }
    });
  };

  const dataUrlToFile = async (dataUrl: string, fileName: string): Promise<File> => {
    const res: Response = await fetch(dataUrl);
    const blob: Blob = await res.blob();
    return new File([blob], fileName, { type: "image/png" });
  };

  const handleLogoUpdate = async (dataUrl: string) => {
    if (dataUrl) {
      try {
        const file = await dataUrlToFile(dataUrl, "church-logo.png");
        const resizedUri = await resizeImage(file, 200, 200);
        setLogoUrl(resizedUri);
        updateSetting("brandLogoUrl", resizedUri);
      } catch (error) {
        console.error("Error processing logo:", error);
      }
    }
    setEditLogo(false);
    setCurrentUrl("about:blank");
  };

  const handleLogoClick = () => {
    setCurrentUrl(logoUrl || "about:blank");
    setEditLogo(true);
  };

  const handleSave = async () => {
    try {
      const brandingSettings = settings.filter(s => 
        s.keyName?.startsWith("brand")
      );
      
      if (brandingSettings.length > 0) {
        // Backend will handle image storage automatically when it detects data:image/ URLs
        await ApiHelper.post("/settings", brandingSettings, "MembershipApi");
      }
      
      if (onError) onError([]);
    } catch (error) {
      console.error("Error saving branding settings:", error);
      if (onError) onError(["Failed to save branding settings"]);
    }
  };

  useEffect(() => {
    if (churchId) loadSettings();
  }, [churchId]);

  useEffect(() => {
    if (saveTrigger) handleSave();
  }, [saveTrigger]);

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="text.secondary">Loading branding settings...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              backgroundColor: alpha(primaryColor, 0.1),
              borderRadius: "8px",
              p: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
            <PaletteIcon sx={{ fontSize: 24, color: primaryColor }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {Locale.label("settings.branding.title") || "Branding & Theme"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Locale.label("settings.branding.subtitle") || "Customize your church's colors and branding"}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Box
            component="button"
            onClick={resetToDefaults}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 1,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              backgroundColor: "transparent",
              cursor: "pointer",
              "&:hover": { backgroundColor: "action.hover" }
            }}>
            <RefreshIcon sx={{ fontSize: 18 }} />
            <Typography variant="body2">Reset to Defaults</Typography>
          </Box>
        </Stack>
      </Stack>

      {/* Logo Editor Modal */}
      {editLogo && (
        <ImageEditor
          photoUrl={currentUrl}
          onUpdate={handleLogoUpdate}
          onCancel={() => { setEditLogo(false); setCurrentUrl("about:blank"); }}
          aspectRatio={1}
          outputWidth={200}
          outputHeight={200}
        />
      )}

      {/* Logo Upload Section */}
      <Card sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Box
              sx={{
                backgroundColor: alpha(primaryColor, 0.1),
                borderRadius: "8px",
                p: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
              <ImageIcon sx={{ fontSize: 24, color: primaryColor }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Church Logo
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upload your church logo to display in the dashboard header
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  border: "2px dashed",
                  borderColor: logoUrl ? primaryColor : "divider",
                  borderRadius: 2,
                  p: 3,
                  textAlign: "center",
                  backgroundColor: logoUrl ? alpha(primaryColor, 0.05) : "transparent",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: primaryColor,
                    backgroundColor: alpha(primaryColor, 0.05)
                  }
                }}
                onClick={handleLogoClick}>
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Church Logo"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "120px",
                      objectFit: "contain"
                    }}
                  />
                ) : (
                  <Stack spacing={1} alignItems="center">
                    <CloudUploadIcon sx={{ fontSize: 48, color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary">
                      Click to upload logo
                    </Typography>
                  </Stack>
                )}
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Recommended specifications:</strong>
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                  <Typography component="li" variant="body2" color="text.secondary">
                    Square image (200×200px recommended)
                  </Typography>
                  <Typography component="li" variant="body2" color="text.secondary">
                    Transparent background (PNG format)
                  </Typography>
                  <Typography component="li" variant="body2" color="text.secondary">
                    Clear and simple design for small sizes
                  </Typography>
                  <Typography component="li" variant="body2" color="text.secondary">
                    Will appear next to church name in header
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={logoUrl ? <ImageIcon /> : <CloudUploadIcon />}
                  onClick={handleLogoClick}
                  sx={{ alignSelf: "flex-start" }}>
                  {logoUrl ? "Change Logo" : "Upload Logo"}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Color Pickers */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Color Palette
              </Typography>
              
              <Stack spacing={3}>
                {/* Primary Color */}
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Primary Color
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 2,
                        backgroundColor: primaryColor,
                        border: "2px solid",
                        borderColor: "divider",
                        cursor: "pointer",
                        position: "relative",
                        overflow: "hidden"
                      }}>
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => handleColorChange("primary", e.target.value)}
                        style={{
                          position: "absolute",
                          width: "100%",
                          height: "100%",
                          opacity: 0,
                          cursor: "pointer"
                        }}
                      />
                    </Box>
                    <TextField
                      fullWidth
                      value={primaryColor}
                      onChange={(e) => handleColorChange("primary", e.target.value)}
                      placeholder="#0066FF"
                      size="small"
                      inputProps={{ style: { fontFamily: "monospace" } }}
                    />
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                    Used for buttons, links, and primary actions
                  </Typography>
                </Box>

                {/* Secondary Color */}
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Secondary Color
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 2,
                        backgroundColor: secondaryColor,
                        border: "2px solid",
                        borderColor: "divider",
                        cursor: "pointer",
                        position: "relative",
                        overflow: "hidden"
                      }}>
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => handleColorChange("secondary", e.target.value)}
                        style={{
                          position: "absolute",
                          width: "100%",
                          height: "100%",
                          opacity: 0,
                          cursor: "pointer"
                        }}
                      />
                    </Box>
                    <TextField
                      fullWidth
                      value={secondaryColor}
                      onChange={(e) => handleColorChange("secondary", e.target.value)}
                      placeholder="#1A1F36"
                      size="small"
                      inputProps={{ style: { fontFamily: "monospace" } }}
                    />
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                    Used for headers, navigation, and text
                  </Typography>
                </Box>

                {/* Accent Color */}
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Accent Color
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 2,
                        backgroundColor: accentColor,
                        border: "2px solid",
                        borderColor: "divider",
                        cursor: "pointer",
                        position: "relative",
                        overflow: "hidden"
                      }}>
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => handleColorChange("accent", e.target.value)}
                        style={{
                          position: "absolute",
                          width: "100%",
                          height: "100%",
                          opacity: 0,
                          cursor: "pointer"
                        }}
                      />
                    </Box>
                    <TextField
                      fullWidth
                      value={accentColor}
                      onChange={(e) => handleColorChange("accent", e.target.value)}
                      placeholder="#00D4AA"
                      size="small"
                      inputProps={{ style: { fontFamily: "monospace" } }}
                    />
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                    Used for highlights, success states, and emphasis
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Live Preview */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Live Preview
              </Typography>
              
              <Box sx={{ p: 3, backgroundColor: "#F5F5F5", borderRadius: 2 }}>
                {/* Preview Header */}
                <Box
                  sx={{
                    backgroundColor: secondaryColor,
                    color: "#FFF",
                    p: 2,
                    borderRadius: 1,
                    mb: 2
                  }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Dashboard Header
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Your church name
                  </Typography>
                </Box>

                {/* Preview Buttons */}
                <Stack spacing={2}>
                  <Box
                    sx={{
                      backgroundColor: primaryColor,
                      color: "#FFF",
                      p: 1.5,
                      borderRadius: 1,
                      textAlign: "center",
                      fontWeight: 600
                    }}>
                    Primary Button
                  </Box>
                  
                  <Box
                    sx={{
                      backgroundColor: "#FFF",
                      border: "2px solid",
                      borderColor: primaryColor,
                      color: primaryColor,
                      p: 1.5,
                      borderRadius: 1,
                      textAlign: "center",
                      fontWeight: 600
                    }}>
                    Secondary Button
                  </Box>

                  <Box
                    sx={{
                      backgroundColor: accentColor,
                      color: "#FFF",
                      p: 1.5,
                      borderRadius: 1,
                      textAlign: "center",
                      fontWeight: 600
                    }}>
                    Accent Button
                  </Box>
                </Stack>

                {/* Preview Card */}
                <Box
                  sx={{
                    backgroundColor: "#FFF",
                    p: 2,
                    borderRadius: 1,
                    mt: 2,
                    borderLeft: "4px solid",
                    borderLeftColor: accentColor
                  }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Sample Card
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This is how your content will look with the selected colors.
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, p: 2, backgroundColor: alpha(accentColor, 0.1), borderRadius: 2, border: "1px solid", borderColor: alpha(accentColor, 0.3) }}>
        <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
          💡 Pro Tip
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Choose colors that represent your church's identity and ensure good contrast for readability. 
          These colors will be applied across the entire dashboard for all church members.
        </Typography>
      </Box>
    </Box>
  );
};

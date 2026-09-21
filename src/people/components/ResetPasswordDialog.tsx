import { useState } from "react";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import { ContentCopy as CopyIcon } from "@mui/icons-material";
import { ApiHelper } from "@churchapps/apphelper";

interface Props {
  personId: string;
  personName: string;
  userEmail: string;
  onClose: () => void;
}

export const ResetPasswordDialog = ({ personId, personName, userEmail, onClose }: Props) => {
  const [tempPassword, setTempPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    setError("");
    try {
      const resp: { success?: boolean; tempPassword?: string; errors?: any[] } = await ApiHelper.post("/users/adminResetPassword", { personId }, "MembershipApi");
      if (resp?.success && resp.tempPassword) setTempPassword(resp.tempPassword);
      else setError(resp?.errors?.[0]?.msg || resp?.errors?.[0]?.toString() || "Could not reset the password.");
    } catch (e: any) {
      setError(e?.toString?.() || "Could not reset the password.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable; password remains visible for manual copy */
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Reset Password</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {tempPassword ? (
          <>
            <Alert severity="success" sx={{ mb: 2 }}>
              Password reset for <b>{userEmail}</b>. Share this temporary password with {personName}. They will be required to set a new password at next sign in.
            </Alert>
            <TextField
              label="Temporary password"
              value={tempPassword}
              fullWidth
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleCopy} edge="end" aria-label="Copy temporary password">
                      <CopyIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              onFocus={(e) => e.target.select()}
            />
            {copied && <Typography variant="caption" color="success.main">Copied to clipboard</Typography>}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              This password is shown only once. Their previous password no longer works.
            </Typography>
          </>
        ) : (
          <Typography variant="body2">
            This will reset the password for <b>{userEmail}</b> and generate a temporary password. {personName} will be required to set a new password the next time they sign in.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{tempPassword ? "Done" : "Cancel"}</Button>
        {!tempPassword && (
          <Box component="span">
            <Button variant="contained" color="warning" onClick={handleReset} disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </Box>
        )}
      </DialogActions>
    </Dialog>
  );
};

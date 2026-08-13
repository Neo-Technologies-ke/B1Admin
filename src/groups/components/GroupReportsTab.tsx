import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box, Button, Card, CardContent, CardHeader, Chip, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, IconButton, Stack, TextField,
  Tooltip, Typography
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Article as ReportIcon } from "@mui/icons-material";
import { type GroupInterface } from "@churchapps/helpers";
import { ApiHelper, UserHelper, Permissions, Locale } from "@churchapps/apphelper";

interface GroupReport {
  id?: string;
  churchId?: string;
  groupId?: string;
  personId?: string;
  title?: string;
  content?: string;
  reportDate?: string;
  status?: string;
  person?: { displayName?: string };
  group?: { name?: string };
}

interface Props {
  group: GroupInterface;
}

const statusColor = (status: string): "default" | "warning" | "success" => {
  if (status === "read") return "success";
  if (status === "submitted") return "warning";
  return "default";
};

export const GroupReportsTab = ({ group }: Props) => {
  const queryClient = useQueryClient();
  const canEditAll = UserHelper.checkAccess(Permissions.membershipApi.groupMembers.edit);
  // Check if user is a leader of this group
  const isGroupLeader = UserHelper.userChurch?.groups?.some((g: any) => g.id === group?.id && g.leader);
  const canEdit = canEditAll || isGroupLeader;

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<GroupReport | null>(null);
  const [form, setForm] = React.useState({ title: "", content: "", reportDate: new Date().toISOString().split("T")[0] });

  const reports = useQuery<GroupReport[]>({
    queryKey: [`/groupReports?groupId=${group?.id}`, "MembershipApi"],
    enabled: !!group?.id && (canEditAll || isGroupLeader)
  });

  const saveMutation = useMutation({
    mutationFn: (data: GroupReport) => ApiHelper.post("/groupReports", data, "MembershipApi"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/groupReports?groupId=${group?.id}`, "MembershipApi"] });
      handleClose();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ApiHelper.delete(`/groupReports/${id}`, "MembershipApi"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/groupReports?groupId=${group?.id}`, "MembershipApi"] });
    }
  });

  const handleOpen = (report?: GroupReport) => {
    if (report) {
      setEditing(report);
      setForm({ title: report.title || "", content: report.content || "", reportDate: report.reportDate || new Date().toISOString().split("T")[0] });
    } else {
      setEditing(null);
      setForm({ title: "", content: "", reportDate: new Date().toISOString().split("T")[0] });
    }
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditing(null);
  };

  const handleSave = () => {
    const payload: GroupReport = { ...form, groupId: group.id };
    if (editing?.id) payload.id = editing.id;
    saveMutation.mutate(payload);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(Locale.label("groups.groupReportsTab.deleteConfirm"))) deleteMutation.mutate(id);
  };

  const reportList: GroupReport[] = (reports.data as any) || [];

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>{Locale.label("groups.groupReportsPage.title")}</Typography>
        {canEdit && (
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => handleOpen()}>
            {Locale.label("groups.groupReportsTab.writeReport")}
          </Button>
        )}
      </Stack>

      {reportList.length === 0 && !reports.isLoading && (
        <Card variant="outlined">
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <ReportIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
            <Typography color="text.secondary">{Locale.label("groups.groupReportsPage.emptyAll")}</Typography>
            {canEdit && (
              <Button sx={{ mt: 2 }} variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => handleOpen()}>
                {Locale.label("groups.groupReportsTab.writeFirstReport")}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <Stack spacing={2}>
        {reportList.map((r) => (
          <Card key={r.id} variant="outlined">
            <CardHeader
              title={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{r.title}</Typography>
                  <Chip label={r.status || "submitted"} size="small" color={statusColor(r.status)} />
                </Stack>
              }
              subheader={
                <Typography variant="caption" color="text.secondary">
                  {r.person?.displayName || "Unknown"} &middot; {r.reportDate ? new Date(r.reportDate).toLocaleDateString() : ""}
                </Typography>
              }
              action={
                canEdit && (
                  <Stack direction="row">
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleOpen(r)}><EditIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDelete(r.id)}><DeleteIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </Stack>
                )
              }
            />
            <Divider />
            <CardContent>
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{r.content}</Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? Locale.label("groups.groupReportsTab.editReport") : Locale.label("groups.groupReportsTab.writeGroupReport")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Report Date"
              type="date"
              value={form.reportDate}
              onChange={(e) => setForm({ ...form, reportDate: e.target.value })}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              fullWidth
              placeholder="e.g. Weekly Group Update - July 2026"
            />
            <TextField
              label="Report Content"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              multiline
              rows={8}
              fullWidth
              placeholder="Share what happened in the group this week, prayer requests, attendance notes, etc."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.title || !form.content || saveMutation.isPending}>
            {saveMutation.isPending ? Locale.label("common.saving") : Locale.label("groups.groupReportsTab.submitReport")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

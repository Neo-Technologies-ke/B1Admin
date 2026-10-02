import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert, Box, Button, Card, CardContent, CardHeader, Chip, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, FormControl, IconButton, InputLabel, MenuItem,
  Select, Stack, TextField, Tooltip, Typography
} from "@mui/material";
import { Add, Article, Delete, Edit } from "@mui/icons-material";
import { type GroupInterface } from "@churchapps/helpers";
import { ApiHelper, UserHelper, Permissions } from "@churchapps/apphelper";

interface ReportTemplate { id?: string; name: string; description?: string; content: string; active?: boolean; }
interface GroupReport {
  id?: string; groupId?: string; templateId?: string; title?: string; content?: string; reportDate?: string;
  status?: string; createdAt?: string; updatedAt?: string; submittedAt?: string; response?: string; respondedAt?: string;
  respondedByPerson?: { displayName?: string };
}
interface Props { group: GroupInterface; }
const formatDateTime = (value?: string) => value ? new Date(value).toLocaleString() : "—";

export const GroupReportsTab = ({ group }: Props) => {
  const queryClient = useQueryClient();
  const canEditAll = UserHelper.checkAccess(Permissions.membershipApi.groupMembers.edit);
  const isGroupLeader = UserHelper.userChurch?.groups?.some((item: any) => item.id === group?.id && item.leader);
  const canWrite = canEditAll || isGroupLeader;
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<GroupReport | null>(null);
  const [form, setForm] = React.useState({ templateId: "", title: "", content: "", reportDate: new Date().toISOString().split("T")[0] });

  const queryKey = [`/groupReports?groupId=${group?.id}`, "MembershipApi"];
  const reports = useQuery<GroupReport[]>({ queryKey, enabled: !!group?.id && canWrite });
  const templates = useQuery<ReportTemplate[]>({ queryKey: ["/groupReports/templates", "MembershipApi"], enabled: canWrite });
  const saveMutation = useMutation({
    mutationFn: (data: GroupReport) => ApiHelper.post("/groupReports", data, "MembershipApi"),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); setDialogOpen(false); }
  });
  const deleteMutation = useMutation({ mutationFn: (id: string) => ApiHelper.delete(`/groupReports/${id}`, "MembershipApi"), onSuccess: () => queryClient.invalidateQueries({ queryKey }) });

  const open = (report?: GroupReport) => {
    setEditing(report || null);
    setForm(report ? { templateId: report.templateId || "", title: report.title || "", content: report.content || "", reportDate: report.reportDate?.slice(0, 10) || new Date().toISOString().split("T")[0] } : { templateId: "", title: "", content: "", reportDate: new Date().toISOString().split("T")[0] });
    setDialogOpen(true);
  };
  const chooseTemplate = (id: string) => {
    const selected = (templates.data || []).find((item) => item.id === id);
    setForm({ ...form, templateId: id, content: selected?.content || form.content, title: form.title || selected?.name || "" });
  };
  const save = (status: "draft" | "submitted") => saveMutation.mutate({ ...form, id: editing?.id, groupId: group.id, status });
  const reportList = reports.data || [];

  if (!canWrite) return <Alert severity="info">Only group leaders and users with report-writing rights can write reports for this group.</Alert>;

  return <Box sx={{ p: 2 }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}><Box><Typography variant="h6" fontWeight={600}>Group reports</Typography><Typography variant="body2" color="text.secondary">Write from a template, save drafts, and review submitted report history.</Typography></Box><Button variant="contained" startIcon={<Add />} onClick={() => open()}>Write report</Button></Stack>
    {reportList.length === 0 && !reports.isLoading && <Card variant="outlined"><CardContent sx={{ py: 5, textAlign: "center" }}><Article sx={{ fontSize: 48, color: "text.disabled" }} /><Typography color="text.secondary">No drafts or submitted reports yet.</Typography></CardContent></Card>}
    <Stack spacing={2}>{reportList.map((report) => <Card key={report.id} variant="outlined"><CardHeader title={<Stack direction="row" spacing={1} alignItems="center"><Typography fontWeight={600}>{report.title}</Typography><Chip size="small" label={report.status || "draft"} color={report.status === "draft" ? "default" : report.status === "responded" ? "success" : "warning"} /></Stack>}
      subheader={report.status === "draft" ? `Last saved ${formatDateTime(report.updatedAt || report.createdAt)}` : `Submitted ${formatDateTime(report.submittedAt || report.createdAt)}`}
      action={report.status === "draft" && <Stack direction="row"><Tooltip title="Edit draft"><IconButton onClick={() => open(report)}><Edit /></IconButton></Tooltip><Tooltip title="Delete draft"><IconButton color="error" onClick={() => report.id && window.confirm("Delete this draft?") && deleteMutation.mutate(report.id)}><Delete /></IconButton></Tooltip></Stack>} />
      <Divider /><CardContent><Typography sx={{ whiteSpace: "pre-wrap" }}>{report.content}</Typography>{report.response && <Alert severity="success" sx={{ mt: 2 }}><Typography fontWeight={600}>Leader response</Typography><Typography sx={{ whiteSpace: "pre-wrap" }}>{report.response}</Typography><Typography variant="caption">{report.respondedByPerson?.displayName} · {formatDateTime(report.respondedAt)}</Typography></Alert>}</CardContent></Card>)}</Stack>

    <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth><DialogTitle>{editing ? "Edit report draft" : "Write group report"}</DialogTitle><DialogContent><Stack spacing={2} sx={{ mt: 1 }}>
      <FormControl fullWidth><InputLabel>Reporting template</InputLabel><Select value={form.templateId} label="Reporting template" onChange={(e) => chooseTemplate(e.target.value)}><MenuItem value="">No template</MenuItem>{(templates.data || []).filter((item) => item.active !== false).map((item) => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}</Select></FormControl>
      <TextField label="Report date" type="date" value={form.reportDate} onChange={(e) => setForm({ ...form, reportDate: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
      <TextField label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <TextField label="Report content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} multiline minRows={12} />
      {saveMutation.isError && <Alert severity="error">The report could not be saved. Check your permissions and try again.</Alert>}
    </Stack></DialogContent><DialogActions><Button onClick={() => setDialogOpen(false)}>Cancel</Button><Button disabled={!form.title.trim() || !form.content.trim() || saveMutation.isPending} onClick={() => save("draft")}>Save draft</Button><Button variant="contained" disabled={!form.title.trim() || !form.content.trim() || saveMutation.isPending} onClick={() => save("submitted")}>Submit report</Button></DialogActions></Dialog>
  </Box>;
};

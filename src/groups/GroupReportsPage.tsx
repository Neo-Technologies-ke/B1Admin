import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box, Button, Card, CardContent, CardHeader, Checkbox, Chip, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, FormControl, FormControlLabel, IconButton,
  InputLabel, MenuItem, Select, Stack, Tab, Tabs, TextField, Tooltip, Typography
} from "@mui/material";
import { Add, Article, Delete, Edit, Reply } from "@mui/icons-material";
import { ApiHelper, PageHeader } from "@churchapps/apphelper";

interface ReportQuestion {
  id: string; label: string; type: "text" | "textarea" | "radio" | "select" | "ratings" | "group";
  required?: boolean; options?: string[]; scale?: string[]; helpText?: string;
}
const QUESTION_TYPES: { value: ReportQuestion["type"]; label: string }[] = [
  { value: "text", label: "Short answer" },
  { value: "textarea", label: "Long answer" },
  { value: "radio", label: "Single choice (radio)" },
  { value: "select", label: "Dropdown" },
  { value: "ratings", label: "Ratings (per area)" },
  { value: "group", label: "Village (auto-filled)" }
];
const newQuestion = (index: number): ReportQuestion => ({ id: `q${Date.now().toString(36)}${index}`, label: "", type: "textarea", required: true, options: [] });

interface ReportTemplate { id?: string; name: string; description?: string; content: string; questions?: ReportQuestion[]; active?: boolean; }
interface GroupReport {
  id?: string; groupId?: string; title?: string; content?: string; reportDate?: string; status?: string;
  createdAt?: string; submittedAt?: string; readAt?: string; response?: string; respondedAt?: string;
  person?: { displayName?: string }; group?: { name?: string }; respondedByPerson?: { displayName?: string };
}

const formatDateTime = (value?: string) => value ? new Date(value).toLocaleString() : "—";

export const GroupReportsPage = () => {
  const queryClient = useQueryClient();
  const [tab, setTab] = React.useState(0);
  const [filterGroup, setFilterGroup] = React.useState("all");
  const [selected, setSelected] = React.useState<GroupReport | null>(null);
  const [response, setResponse] = React.useState("");
  const [templateOpen, setTemplateOpen] = React.useState(false);
  const [template, setTemplate] = React.useState<ReportTemplate>({ name: "", description: "", content: "", active: true });

  const reports = useQuery<GroupReport[]>({ queryKey: ["/groupReports", "MembershipApi"] });
  const templates = useQuery<ReportTemplate[]>({ queryKey: ["/groupReports/templates", "MembershipApi"] });
  const invalidateReports = () => queryClient.invalidateQueries({ queryKey: ["/groupReports", "MembershipApi"] });
  const invalidateTemplates = () => queryClient.invalidateQueries({ queryKey: ["/groupReports/templates", "MembershipApi"] });

  const readMutation = useMutation({ mutationFn: (id: string) => ApiHelper.post(`/groupReports/${id}/read`, {}, "MembershipApi"), onSuccess: invalidateReports });
  const respondMutation = useMutation({
    mutationFn: ({ id, responseText }: { id: string; responseText: string }) => ApiHelper.post(`/groupReports/${id}/respond`, { response: responseText }, "MembershipApi"),
    onSuccess: () => { invalidateReports(); setSelected(null); setResponse(""); }
  });
  const templateMutation = useMutation({
    mutationFn: (value: ReportTemplate) => ApiHelper.post("/groupReports/templates", value, "MembershipApi"),
    onSuccess: () => { invalidateTemplates(); setTemplateOpen(false); }
  });
  const deleteTemplateMutation = useMutation({
    mutationFn: (id: string) => ApiHelper.delete(`/groupReports/templates/${id}`, "MembershipApi"),
    onSuccess: invalidateTemplates
  });

  const reportList = reports.data || [];
  const templateList = templates.data || [];
  const groups = Array.from(new Map(reportList.filter((r) => r.groupId).map((r) => [r.groupId, r.group?.name || "Unknown group"])).entries());
  const filtered = filterGroup === "all" ? reportList : reportList.filter((r) => r.groupId === filterGroup);

  const openReport = (report: GroupReport) => {
    setSelected(report);
    setResponse(report.response || "");
    if (report.id && report.status === "submitted") readMutation.mutate(report.id);
  };
  const openTemplate = (value?: ReportTemplate) => {
    setTemplate(value ? { ...value, questions: value.questions || [] } : { name: "", description: "", content: "", questions: [], active: true });
    setTemplateOpen(true);
  };
  const updateQuestion = (id: string, patch: Partial<ReportQuestion>) =>
    setTemplate((t) => ({ ...t, questions: (t.questions || []).map((q) => q.id === id ? { ...q, ...patch } : q) }));

  return <>
    <PageHeader title="Group Reports" subtitle="Review group leader submissions, respond, and manage report-writing templates." />
    <Box sx={{ px: 3, py: 2 }}>
      <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 3 }}>
        <Tab label={`Submissions (${reportList.length})`} />
        <Tab label={`Templates (${templateList.length})`} />
      </Tabs>

      {tab === 0 && <>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Typography color="text.secondary">Select a report to read it and respond to the submitting group leader.</Typography>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Filter by group</InputLabel>
            <Select value={filterGroup} label="Filter by group" onChange={(e) => setFilterGroup(e.target.value)}>
              <MenuItem value="all">All groups</MenuItem>
              {groups.map(([id, name]) => <MenuItem key={id} value={id}>{name}</MenuItem>)}
            </Select>
          </FormControl>
        </Stack>
        {filtered.length === 0 && <Card variant="outlined"><CardContent sx={{ py: 6, textAlign: "center" }}><Article sx={{ fontSize: 52, color: "text.disabled" }} /><Typography color="text.secondary">No submitted reports found.</Typography></CardContent></Card>}
        <Stack spacing={2}>{filtered.map((report) => <Card key={report.id} variant="outlined" onClick={() => openReport(report)} sx={{ cursor: "pointer", borderColor: report.status === "submitted" ? "primary.light" : "divider" }}>
          <CardHeader title={<Stack direction="row" spacing={1} alignItems="center"><Typography fontWeight={600}>{report.title}</Typography><Chip size="small" label={report.status || "submitted"} color={report.status === "submitted" ? "warning" : report.status === "responded" ? "success" : "default"} /></Stack>}
            subheader={`${report.group?.name || "Unknown group"} · ${report.person?.displayName || "Unknown leader"} · Submitted ${formatDateTime(report.submittedAt || report.createdAt)}`} />
          <Divider /><CardContent><Typography noWrap>{report.content}</Typography>{report.response && <Typography color="success.main" sx={{ mt: 1 }}>Response sent {formatDateTime(report.respondedAt)}</Typography>}</CardContent>
        </Card>)}</Stack>
      </>}

      {tab === 1 && <>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}><Typography color="text.secondary">Templates persist for future reports and guide every group leader.</Typography><Button variant="contained" startIcon={<Add />} onClick={() => openTemplate()}>New template</Button></Stack>
        <Stack spacing={2}>{templateList.map((item) => <Card key={item.id} variant="outlined"><CardHeader title={<Stack direction="row" spacing={1} alignItems="center"><Typography fontWeight={600}>{item.name}</Typography>{item.active === false && <Chip label="Inactive" size="small" />}</Stack>} subheader={item.description}
          action={<Stack direction="row"><Tooltip title="Edit"><IconButton onClick={() => openTemplate(item)}><Edit /></IconButton></Tooltip><Tooltip title="Delete"><IconButton color="error" onClick={() => item.id && window.confirm("Delete this reporting template?") && deleteTemplateMutation.mutate(item.id)}><Delete /></IconButton></Tooltip></Stack>} /><Divider /><CardContent>
            {item.questions?.length ? <Stack spacing={0.5}>{item.questions.map((q, i) => <Typography key={q.id} variant="body2">{i + 1}. {q.label} <Typography component="span" variant="caption" color="text.secondary">({QUESTION_TYPES.find((t) => t.value === q.type)?.label}{q.required === false ? ", optional" : ""})</Typography></Typography>)}{item.content && <Typography variant="body2" color="text.secondary" sx={{ mt: 1, whiteSpace: "pre-wrap" }}>{item.content}</Typography>}</Stack>
              : <Typography sx={{ whiteSpace: "pre-wrap" }}>{item.content}</Typography>}
          </CardContent></Card>)}</Stack>
      </>}
    </Box>

    <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="md" fullWidth>
      <DialogTitle>{selected?.title}</DialogTitle><DialogContent><Stack spacing={2} sx={{ mt: 1 }}>
        <Typography variant="body2" color="text.secondary">{selected?.group?.name} · {selected?.person?.displayName} · {formatDateTime(selected?.submittedAt || selected?.createdAt)}</Typography>
        <Typography sx={{ whiteSpace: "pre-wrap" }}>{selected?.content}</Typography><Divider />
        {selected?.response && <Box><Typography fontWeight={600}>Previous response</Typography><Typography sx={{ whiteSpace: "pre-wrap" }}>{selected.response}</Typography><Typography variant="caption" color="text.secondary">{selected.respondedByPerson?.displayName} · {formatDateTime(selected.respondedAt)}</Typography></Box>}
        <TextField label="Response to group leader" multiline minRows={4} value={response} onChange={(e) => setResponse(e.target.value)} />
      </Stack></DialogContent><DialogActions><Button onClick={() => setSelected(null)}>Close</Button><Button variant="contained" startIcon={<Reply />} disabled={!response.trim() || respondMutation.isPending} onClick={() => selected?.id && respondMutation.mutate({ id: selected.id, responseText: response })}>Send response</Button></DialogActions>
    </Dialog>

    <Dialog open={templateOpen} onClose={() => setTemplateOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle>{template.id ? "Edit reporting template" : "Create reporting template"}</DialogTitle><DialogContent><Stack spacing={2} sx={{ mt: 1 }}>
        <TextField label="Template name" value={template.name} onChange={(e) => setTemplate({ ...template, name: e.target.value })} />
        <TextField label="Description" value={template.description || ""} onChange={(e) => setTemplate({ ...template, description: e.target.value })} />
        <Divider textAlign="left"><Typography variant="subtitle2" color="text.secondary">Questions</Typography></Divider>
        {(template.questions || []).map((q, i) => <Card key={q.id} variant="outlined"><CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}><Stack spacing={1.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography color="text.secondary" sx={{ minWidth: 20 }}>{i + 1}.</Typography>
            <TextField size="small" fullWidth label="Question" value={q.label} onChange={(e) => updateQuestion(q.id, { label: e.target.value })} />
            <FormControl size="small" sx={{ minWidth: 190 }}><InputLabel>Type</InputLabel><Select value={q.type} label="Type" onChange={(e) => updateQuestion(q.id, { type: e.target.value as ReportQuestion["type"] })}>{QUESTION_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}</Select></FormControl>
            <Tooltip title="Remove question"><IconButton color="error" onClick={() => setTemplate({ ...template, questions: (template.questions || []).filter((item) => item.id !== q.id) })}><Delete /></IconButton></Tooltip>
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControlLabel control={<Checkbox size="small" checked={q.required !== false && q.type !== "group"} disabled={q.type === "group"} onChange={(e) => updateQuestion(q.id, { required: e.target.checked })} />} label="Required" />
            {(q.type === "radio" || q.type === "select") && <TextField size="small" fullWidth label="Options (comma separated)" value={(q.options || []).join(", ")} onChange={(e) => updateQuestion(q.id, { options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />}
            {q.type === "ratings" && <>
              <TextField size="small" fullWidth label="Areas to rate (comma separated)" value={(q.options || []).join(", ")} onChange={(e) => updateQuestion(q.id, { options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
              <TextField size="small" fullWidth label="Rating scale (comma separated)" value={(q.scale || []).join(", ")} placeholder="Poor, Average, Good, Excellent" onChange={(e) => updateQuestion(q.id, { scale: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
            </>}
            {q.type === "group" && <Typography variant="caption" color="text.secondary">The reporter's village is filled in automatically — this question is never required.</Typography>}
          </Stack>
        </Stack></CardContent></Card>)}
        <Button variant="outlined" startIcon={<Add />} onClick={() => setTemplate({ ...template, questions: [...(template.questions || []), newQuestion((template.questions || []).length)] })}>Add question</Button>
        <TextField label="Additional guidance shown above the form (optional)" multiline minRows={3} value={template.content} onChange={(e) => setTemplate({ ...template, content: e.target.value })} placeholder="Instructions or context for the leader writing this report" />
        <FormControl><InputLabel>Status</InputLabel><Select value={template.active === false ? "inactive" : "active"} label="Status" onChange={(e) => setTemplate({ ...template, active: e.target.value === "active" })}><MenuItem value="active">Active</MenuItem><MenuItem value="inactive">Inactive</MenuItem></Select></FormControl>
      </Stack></DialogContent><DialogActions><Button onClick={() => setTemplateOpen(false)}>Cancel</Button><Button variant="contained" disabled={!template.name.trim() || (!template.content.trim() && !template.questions?.length) || templateMutation.isPending} onClick={() => templateMutation.mutate(template)}>Save template</Button></DialogActions>
    </Dialog>
  </>;
};

import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert, Box, Button, Card, CardContent, CardHeader, Chip, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, FormControl, FormControlLabel, FormLabel,
  IconButton, InputLabel, MenuItem, Radio, RadioGroup, Select, Stack, TextField,
  Tooltip, Typography
} from "@mui/material";
import { Add, Article, Delete, Edit } from "@mui/icons-material";
import { type GroupInterface } from "@churchapps/helpers";
import { ApiHelper, UserHelper, Permissions } from "@churchapps/apphelper";

interface ReportQuestion {
  id: string; label: string; type: "text" | "textarea" | "radio" | "select" | "ratings" | "group";
  required?: boolean; options?: string[]; scale?: string[]; helpText?: string;
}
interface ReportTemplate { id?: string; name: string; description?: string; content: string; questions?: ReportQuestion[]; active?: boolean; }
interface GroupReport {
  id?: string; groupId?: string; templateId?: string; title?: string; content?: string; answers?: Record<string, any>; reportDate?: string;
  status?: string; createdAt?: string; updatedAt?: string; submittedAt?: string; response?: string; respondedAt?: string;
  respondedByPerson?: { displayName?: string };
}
interface Props { group: GroupInterface; }
const formatDateTime = (value?: string) => value ? new Date(value).toLocaleString() : "—";
const DEFAULT_SCALE = ["Poor", "Average", "Good", "Excellent"];

const answerText = (q: ReportQuestion, value: any, groupName?: string): string => {
  if (q.type === "group") return groupName || "";
  if (q.type === "ratings") return (q.options || []).map((area) => `  - ${area}: ${value?.[area] || "—"}`).join("\n");
  return (value as string) || "";
};

const composeContent = (questions: ReportQuestion[], answers: Record<string, any>, groupName?: string) =>
  questions.map((q, i) => `${i + 1}. ${q.label}\n${answerText(q, answers[q.id], groupName)}`).join("\n\n");

const missingRequired = (questions: ReportQuestion[], answers: Record<string, any>): string[] =>
  questions.filter((q) => {
    if (!q.required || q.type === "group") return false;
    const value = answers[q.id];
    if (q.type === "ratings") return (q.options || []).some((area) => !value?.[area]);
    return !value?.toString().trim();
  }).map((q) => q.label);

export const GroupReportsTab = ({ group }: Props) => {
  const queryClient = useQueryClient();
  const canEditAll = UserHelper.checkAccess(Permissions.membershipApi.groupMembers.edit);
  const isGroupLeader = UserHelper.userChurch?.groups?.some((item: any) => item.id === group?.id && item.leader);
  const canWrite = canEditAll || isGroupLeader;
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<GroupReport | null>(null);
  const [form, setForm] = React.useState({ templateId: "", title: "", content: "", reportDate: new Date().toISOString().split("T")[0] });
  const [answers, setAnswers] = React.useState<Record<string, any>>({});

  const queryKey = [`/groupReports?groupId=${group?.id}`, "MembershipApi"];
  const reports = useQuery<GroupReport[]>({ queryKey, enabled: !!group?.id && canWrite });
  const templates = useQuery<ReportTemplate[]>({ queryKey: ["/groupReports/templates", "MembershipApi"], enabled: canWrite });
  const saveMutation = useMutation({
    mutationFn: (data: GroupReport) => ApiHelper.post("/groupReports", data, "MembershipApi"),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); setDialogOpen(false); }
  });
  const deleteMutation = useMutation({ mutationFn: (id: string) => ApiHelper.delete(`/groupReports/${id}`, "MembershipApi"), onSuccess: () => queryClient.invalidateQueries({ queryKey }) });

  const selectedTemplate = (templates.data || []).find((item) => item.id === form.templateId);
  const questions = selectedTemplate?.questions?.length ? selectedTemplate.questions : null;

  const open = (report?: GroupReport) => {
    setEditing(report || null);
    setForm(report ? { templateId: report.templateId || "", title: report.title || "", content: report.content || "", reportDate: report.reportDate?.slice(0, 10) || new Date().toISOString().split("T")[0] } : { templateId: "", title: "", content: "", reportDate: new Date().toISOString().split("T")[0] });
    setAnswers(report?.answers || {});
    setDialogOpen(true);
  };
  const chooseTemplate = (id: string) => {
    const selected = (templates.data || []).find((item) => item.id === id);
    if (selected?.questions?.length) {
      setForm({ ...form, templateId: id, title: form.title || selected.name, content: "" });
      setAnswers({});
    } else {
      setForm({ ...form, templateId: id, content: selected?.content || form.content, title: form.title || selected?.name || "" });
      setAnswers({});
    }
  };
  const setAnswer = (id: string, value: any) => setAnswers((prev) => ({ ...prev, [id]: value }));
  const setRating = (id: string, area: string, value: string) => setAnswers((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), [area]: value } }));
  const missing = questions ? missingRequired(questions, answers) : [];
  const save = (status: "draft" | "submitted") => {
    const payload: GroupReport = { ...form, id: editing?.id, groupId: group.id, status };
    if (questions) {
      payload.answers = answers;
      payload.content = composeContent(questions, answers, group.name);
    }
    saveMutation.mutate(payload);
  };
  const reportList = reports.data || [];

  if (!canWrite) return <Alert severity="info">Only group leaders and users with report-writing rights can write reports for this group.</Alert>;

  return <Box sx={{ p: 2 }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}><Box><Typography variant="h6" fontWeight={600}>Group reports</Typography><Typography variant="body2" color="text.secondary">Write from a template, save drafts, and review submitted report history.</Typography></Box><Button variant="contained" startIcon={<Add />} onClick={() => open()}>Write report</Button></Stack>
    {reportList.length === 0 && !reports.isLoading && <Card variant="outlined"><CardContent sx={{ py: 5, textAlign: "center" }}><Article sx={{ fontSize: 48, color: "text.disabled" }} /><Typography color="text.secondary">No drafts or submitted reports yet.</Typography></CardContent></Card>}
    <Stack spacing={2}>{reportList.map((report) => <Card key={report.id} variant="outlined"><CardHeader title={<Stack direction="row" spacing={1} alignItems="center"><Typography fontWeight={600}>{report.title}</Typography><Chip size="small" label={report.status || "draft"} color={report.status === "draft" ? "default" : report.status === "responded" ? "success" : "warning"} /></Stack>}
      subheader={report.status === "draft" ? `Last saved ${formatDateTime(report.updatedAt || report.createdAt)}` : `Submitted ${formatDateTime(report.submittedAt || report.createdAt)}`}
      action={report.status === "draft" && <Stack direction="row"><Tooltip title="Edit draft"><IconButton onClick={() => open(report)}><Edit /></IconButton></Tooltip><Tooltip title="Delete draft"><IconButton color="error" onClick={() => report.id && window.confirm("Delete this draft?") && deleteMutation.mutate(report.id)}><Delete /></IconButton></Tooltip></Stack>} />
      <Divider /><CardContent><Typography sx={{ whiteSpace: "pre-wrap" }}>{report.content}</Typography>{report.response && <Alert severity="success" sx={{ mt: 2 }}><Typography fontWeight={600}>Leader response</Typography><Typography sx={{ whiteSpace: "pre-wrap" }}>{report.response}</Typography><Typography variant="caption">{report.respondedByPerson?.displayName} · {formatDateTime(report.respondedAt)}</Typography></Alert>}</CardContent></Card>)}</Stack>

    <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth><DialogTitle>{editing ? "Edit report draft" : "Write group report"}</DialogTitle><DialogContent><Stack spacing={3} sx={{ mt: 1 }}>
      <FormControl fullWidth><InputLabel>Reporting template</InputLabel><Select value={form.templateId} label="Reporting template" onChange={(e) => chooseTemplate(e.target.value)}><MenuItem value="">No template</MenuItem>{(templates.data || []).filter((item) => item.active !== false).map((item) => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}</Select></FormControl>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField label="Report date" type="date" value={form.reportDate} onChange={(e) => setForm({ ...form, reportDate: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField label="Title" fullWidth value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </Stack>
      {questions ? <>
        {selectedTemplate?.content && <Alert severity="info" sx={{ whiteSpace: "pre-wrap" }}>{selectedTemplate.content}</Alert>}
        {questions.map((q, i) => <FormControl key={q.id} fullWidth required={q.required && q.type !== "group"}>
          {q.type === "group" && <TextField label={`${i + 1}. ${q.label}`} value={group.name} disabled helperText="Automatically selected from your group" />}
          {q.type === "text" && <TextField label={`${i + 1}. ${q.label}`} value={answers[q.id] || ""} onChange={(e) => setAnswer(q.id, e.target.value)} helperText={q.helpText} />}
          {q.type === "textarea" && <TextField label={`${i + 1}. ${q.label}`} value={answers[q.id] || ""} onChange={(e) => setAnswer(q.id, e.target.value)} multiline minRows={3} helperText={q.helpText} />}
          {q.type === "radio" && <>
            <FormLabel>{i + 1}. {q.label}</FormLabel>
            <RadioGroup value={answers[q.id] || ""} onChange={(e) => setAnswer(q.id, e.target.value)}>{(q.options || []).map((opt) => <FormControlLabel key={opt} value={opt} control={<Radio />} label={opt} />)}</RadioGroup>
          </>}
          {q.type === "select" && <>
            <InputLabel>{i + 1}. {q.label}</InputLabel>
            <Select value={answers[q.id] || ""} label={`${i + 1}. ${q.label}`} onChange={(e) => setAnswer(q.id, e.target.value)}><MenuItem value=""><em>Select…</em></MenuItem>{(q.options || []).map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}</Select>
          </>}
          {q.type === "ratings" && <Box>
            <FormLabel>{i + 1}. {q.label}</FormLabel>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 1 }}>{(q.options || []).map((area) => <FormControl key={area} fullWidth size="small" required={q.required}>
              <InputLabel>{area}</InputLabel>
              <Select value={answers[q.id]?.[area] || ""} label={area} onChange={(e) => setRating(q.id, area, e.target.value)}>{(q.scale?.length ? q.scale : DEFAULT_SCALE).map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}</Select>
            </FormControl>)}</Stack>
          </Box>}
        </FormControl>)}
        {missing.length > 0 && <Alert severity="warning">Required before submitting: {missing.join(", ")}</Alert>}
      </> : <TextField label="Report content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} multiline minRows={12} />}
      {saveMutation.isError && <Alert severity="error">The report could not be saved. Check your permissions and try again.</Alert>}
    </Stack></DialogContent><DialogActions><Button onClick={() => setDialogOpen(false)}>Cancel</Button><Button disabled={!form.title.trim() || (!questions && !form.content.trim()) || saveMutation.isPending} onClick={() => save("draft")}>Save draft</Button><Button variant="contained" disabled={!form.title.trim() || (!questions && !form.content.trim()) || missing.length > 0 || saveMutation.isPending} onClick={() => save("submitted")}>Submit report</Button></DialogActions></Dialog>
  </Box>;
};

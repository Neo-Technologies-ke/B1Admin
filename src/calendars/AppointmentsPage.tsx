import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ApiHelper, Loading, PageHeader, UserHelper } from "@churchapps/apphelper";
import { Alert, Box, Button, Card, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import { Add as AddIcon, Block as BlockIcon, Check as CheckIcon, Close as CloseIcon, Schedule as ScheduleIcon } from "@mui/icons-material";

interface Leader { id?: string; personId?: string; displayName?: string; email?: string; title?: string; isActive?: boolean; appointmentDuration?: number; bufferDuration?: number; timezone?: string; }
interface Period { id?: string; dayOfWeek: number; startTime: string; endTime: string; isActive: boolean; }
interface Exception { id?: string; start: string; end: string; reason?: string; }
interface Appointment { id: string; userName: string; leaderName?: string; reason: string; notes?: string; start: string; end: string; status: string; rejectionReason?: string; rescheduleReason?: string; }

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const statusColor: Record<string, "default" | "warning" | "success" | "error" | "info"> = { pending: "warning", confirmed: "success", rejected: "error", awaitingUserConfirmation: "info", rescheduled: "success", cancelled: "default", completed: "success", noShow: "error", rescheduleRequested: "warning" };
const formatDate = (value: string) => new Date(value).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const toLocalInput = (value: Date) => { const offset = value.getTimezoneOffset() * 60000; return new Date(value.getTime() - offset).toISOString().slice(0, 16); };

export const AppointmentsPage = () => {
  const person = UserHelper.person;
  const [leader, setLeader] = useState<Leader | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pending");
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [action, setAction] = useState<"reject" | "reschedule" | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [proposedStart, setProposedStart] = useState(toLocalInput(new Date(Date.now() + 86400000)));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [blockStart, setBlockStart] = useState(toLocalInput(new Date(Date.now() + 86400000)));
  const [blockEnd, setBlockEnd] = useState(toLocalInput(new Date(Date.now() + 90000000)));
  const [blockReason, setBlockReason] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const leaders: Leader[] = await ApiHelper.get("/appointments/leaders", "ContentApi");
      const mine = (leaders || []).find((item) => item.personId === person?.id) || null;
      setLeader(mine);
      if (mine?.id) {
        const [items, availability] = await Promise.all([
          ApiHelper.get("/appointments/leader", "ContentApi"),
          ApiHelper.get(`/appointments/leaders/${mine.id}/availability`, "ContentApi")
        ]);
        setAppointments(items || []); setPeriods(availability?.periods || []); setExceptions(availability?.exceptions || []);
      } else { setAppointments([]); setPeriods([]); setExceptions([]); }
    } catch (e: any) { setError(e?.message || "Unable to load appointments."); } finally { setLoading(false); }
  }, [person?.id]);

  useEffect(() => { load(); }, [load]);

  const setupLeader = async () => {
    setSaving(true);
    try {
      await ApiHelper.post("/appointments/leaders", { personId: person?.id, displayName: person?.name?.display || "Leader", email: person?.contactInfo?.email || "", title: "Pastor", isActive: true, appointmentDuration: 30, bufferDuration: 0, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Africa/Nairobi" }, "ContentApi");
      await load();
    } finally { setSaving(false); }
  };

  const categorized = useMemo(() => appointments.filter((item) => {
    if (tab === "pending") return item.status === "pending";
    if (tab === "upcoming") return ["confirmed", "rescheduled"].includes(item.status) && new Date(item.start) >= new Date();
    if (tab === "reschedule") return ["awaitingUserConfirmation", "rescheduleRequested"].includes(item.status);
    if (tab === "completed") return ["completed", "noShow"].includes(item.status);
    return ["cancelled", "rejected"].includes(item.status);
  }), [appointments, tab]);

  const runAction = async (name: string, body: any = {}) => {
    if (!selected) return;
    setSaving(true); setError("");
    try {
      await ApiHelper.post(`/appointments/${selected.id}/leader-action/${name}`, body, "ContentApi");
      setSelected(null); setAction(null); setActionReason(""); await load();
    } catch (e: any) { setError(e?.message || "Unable to update appointment."); } finally { setSaving(false); }
  };

  const saveAvailability = async () => {
    if (!leader?.id) return;
    setSaving(true);
    try { await ApiHelper.put(`/appointments/leaders/${leader.id}/availability`, { periods }, "ContentApi"); await load(); } catch (e: any) { setError(e?.message || "Unable to save availability."); } finally { setSaving(false); }
  };

  const saveSettings = async () => {
    if (!leader) return;
    setSaving(true);
    try { await ApiHelper.post("/appointments/leaders", leader, "ContentApi"); await load(); } catch (e: any) { setError(e?.message || "Unable to save settings."); } finally { setSaving(false); }
  };

  const addBlock = async () => {
    if (!leader?.id) return;
    setSaving(true);
    try { await ApiHelper.post(`/appointments/leaders/${leader.id}/exceptions`, { start: new Date(blockStart).toISOString(), end: new Date(blockEnd).toISOString(), type: "blocked", reason: blockReason }, "ContentApi"); setBlockReason(""); await load(); } catch (e: any) { setError(e?.message || "Unable to block time."); } finally { setSaving(false); }
  };

  if (loading) return <Loading />;
  if (!leader) return <><PageHeader title="Appointments" subtitle="Manage meetings with church members" /><Card sx={{ p: 3 }}><Typography variant="h6">Enable Leader Appointments</Typography><Typography color="text.secondary" sx={{ my: 1 }}>Create your leader profile, then configure meeting availability.</Typography><Button variant="contained" onClick={setupLeader} disabled={saving}>Enable Appointments</Button></Card></>;

  return <>
    <PageHeader title="Leader Appointments" subtitle="Review requests, manage availability, and keep your calendar organized" />
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, lg: 8 }}>
        <Card sx={{ p: 2 }}>
          <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable">
            <Tab value="pending" label={`Pending (${appointments.filter((a) => a.status === "pending").length})`} />
            <Tab value="upcoming" label="Upcoming" /><Tab value="reschedule" label="Rescheduling" /><Tab value="completed" label="Completed" /><Tab value="closed" label="Cancelled / Rejected" />
          </Tabs>
          <Stack spacing={1.5} mt={2}>
            {categorized.length === 0 && <Typography color="text.secondary" sx={{ py: 3, textAlign: "center" }}>No appointments in this category.</Typography>}
            {categorized.map((item) => <Card key={item.id} variant="outlined" sx={{ p: 2, cursor: "pointer" }} onClick={() => setSelected(item)}>
              <Stack direction="row" justifyContent="space-between" gap={1}><Box><Typography fontWeight={700}>{item.userName}</Typography><Typography variant="body2" color="text.secondary">{formatDate(item.start)}</Typography></Box><Chip color={statusColor[item.status] || "default"} label={item.status.replace(/([A-Z])/g, " $1")} /></Stack>
              <Typography sx={{ mt: 1 }}>{item.reason}</Typography>
            </Card>)}
          </Stack>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, lg: 4 }}><Stack spacing={2}>
        <Card sx={{ p: 2 }}><Typography variant="h6">Appointment Settings</Typography><Stack spacing={1.5} mt={1.5}>
          <TextField label="Title" value={leader.title || ""} onChange={(e) => setLeader({ ...leader, title: e.target.value })} />
          <TextField type="number" label="Duration (minutes)" value={leader.appointmentDuration || 30} onChange={(e) => setLeader({ ...leader, appointmentDuration: Number(e.target.value) })} />
          <TextField type="number" label="Buffer (minutes)" value={leader.bufferDuration || 0} onChange={(e) => setLeader({ ...leader, bufferDuration: Number(e.target.value) })} />
          <TextField label="Time zone" value={leader.timezone || "Africa/Nairobi"} onChange={(e) => setLeader({ ...leader, timezone: e.target.value })} />
          <Button variant="outlined" onClick={saveSettings} disabled={saving}>Save Settings</Button>
        </Stack></Card>
        <Card sx={{ p: 2 }}><Typography variant="h6">Weekly Availability</Typography><Stack spacing={1.25} mt={1.5}>
          {periods.map((period, index) => <Stack key={`${period.dayOfWeek}-${index}`} direction="row" spacing={1} alignItems="center"><TextField select size="small" value={period.dayOfWeek} onChange={(e) => setPeriods(periods.map((row, i) => i === index ? { ...row, dayOfWeek: Number(e.target.value) } : row))} sx={{ minWidth: 120 }}>{days.map((day, i) => <MenuItem key={day} value={i}>{day}</MenuItem>)}</TextField><TextField size="small" type="time" value={period.startTime.slice(0, 5)} onChange={(e) => setPeriods(periods.map((row, i) => i === index ? { ...row, startTime: e.target.value } : row))} /><TextField size="small" type="time" value={period.endTime.slice(0, 5)} onChange={(e) => setPeriods(periods.map((row, i) => i === index ? { ...row, endTime: e.target.value } : row))} /><Button color="error" onClick={() => setPeriods(periods.filter((_, i) => i !== index))}><CloseIcon /></Button></Stack>)}
          <Button startIcon={<AddIcon />} onClick={() => setPeriods([...periods, { dayOfWeek: 1, startTime: "09:00", endTime: "12:00", isActive: true }])}>Add Period</Button><Button variant="contained" onClick={saveAvailability} disabled={saving}>Save Availability</Button>
        </Stack></Card>
        <Card sx={{ p: 2 }}><Typography variant="h6">Block Date or Time</Typography><Stack spacing={1.25} mt={1.5}><TextField type="datetime-local" label="From" value={blockStart} onChange={(e) => setBlockStart(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} /><TextField type="datetime-local" label="To" value={blockEnd} onChange={(e) => setBlockEnd(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} /><TextField label="Reason" value={blockReason} onChange={(e) => setBlockReason(e.target.value)} /><Button startIcon={<BlockIcon />} variant="outlined" onClick={addBlock} disabled={saving}>Block Time</Button>{exceptions.map((item) => <Typography key={item.id} variant="caption">{formatDate(item.start)} — {item.reason || "Blocked"}</Typography>)}</Stack></Card>
      </Stack></Grid>
    </Grid>

    <Dialog open={!!selected} onClose={() => setSelected(null)} fullWidth maxWidth="sm"><DialogTitle>Appointment Request</DialogTitle><DialogContent>{selected && <Stack spacing={1.25} mt={1}><Typography><strong>Member:</strong> {selected.userName}</Typography><Typography><strong>Time:</strong> {formatDate(selected.start)}</Typography><Typography><strong>Reason:</strong> {selected.reason}</Typography>{selected.notes && <Typography><strong>Notes:</strong> {selected.notes}</Typography>}</Stack>}</DialogContent><DialogActions sx={{ flexWrap: "wrap" }}>{selected?.status === "pending" && <><Button startIcon={<CheckIcon />} onClick={() => runAction("approve")} disabled={saving}>Confirm</Button><Button color="error" startIcon={<CloseIcon />} onClick={() => setAction("reject")}>Reject</Button><Button startIcon={<ScheduleIcon />} onClick={() => setAction("reschedule")}>Reschedule</Button></>}{selected && ["confirmed", "rescheduled"].includes(selected.status) && <><Button onClick={() => runAction("complete")} disabled={saving}>Mark Completed</Button><Button onClick={() => runAction("noShow")} disabled={saving}>No Show</Button><Button color="error" onClick={() => runAction("cancel")} disabled={saving}>Cancel</Button></>}<Button onClick={() => setSelected(null)}>Close</Button></DialogActions></Dialog>

    <Dialog open={!!action} onClose={() => setAction(null)} fullWidth maxWidth="xs"><DialogTitle>{action === "reject" ? "Reject Appointment" : "Propose New Time"}</DialogTitle><DialogContent><Stack spacing={2} mt={1}>{action === "reschedule" && <TextField type="datetime-local" label="New date and time" value={proposedStart} onChange={(e) => setProposedStart(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />}<TextField required multiline label="Reason" value={actionReason} onChange={(e) => setActionReason(e.target.value)} /></Stack></DialogContent><DialogActions><Button onClick={() => setAction(null)}>Cancel</Button><Button variant="contained" color={action === "reject" ? "error" : "primary"} disabled={!actionReason.trim() || saving} onClick={() => action === "reject" ? runAction("reject", { reason: actionReason }) : runAction("reschedule", { reason: actionReason, start: new Date(proposedStart).toISOString(), end: new Date(new Date(proposedStart).getTime() + (leader.appointmentDuration || 30) * 60000).toISOString() })}>{action === "reject" ? "Reject" : "Send Proposal"}</Button></DialogActions></Dialog>
  </>;
};

export default AppointmentsPage;

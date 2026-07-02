import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box, Card, CardContent, CardHeader, Chip, Divider, FormControl,
  InputLabel, MenuItem, Select, Stack, Typography
} from "@mui/material";
import { Article as ReportIcon } from "@mui/icons-material";
import { PageHeader } from "@churchapps/apphelper";
import { ApiHelper } from "@churchapps/apphelper";

interface GroupReport {
  id?: string;
  groupId?: string;
  personId?: string;
  title?: string;
  content?: string;
  reportDate?: string;
  status?: string;
  person?: { displayName?: string };
  group?: { name?: string };
}

const statusColor = (status: string): "default" | "warning" | "success" => {
  if (status === "read") return "success";
  if (status === "submitted") return "warning";
  return "default";
};

export const GroupReportsPage = () => {
  const queryClient = useQueryClient();
  const [filterGroup, setFilterGroup] = React.useState<string>("all");

  const reports = useQuery<GroupReport[]>({
    queryKey: ["/membership/groupReports", "MembershipApi"]
  });

  const markReadMutation = useMutation({
    mutationFn: (report: GroupReport) =>
      ApiHelper.post("/membership/groupReports", { ...report, status: "read" }, "MembershipApi"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/membership/groupReports", "MembershipApi"] });
    }
  });

  const reportList: GroupReport[] = (reports.data as any) || [];

  const groups = React.useMemo(() => {
    const seen = new Map<string, string>();
    reportList.forEach((r) => {
      if (r.groupId && r.group?.name) seen.set(r.groupId, r.group.name);
    });
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }, [reportList]);

  const filtered = filterGroup === "all" ? reportList : reportList.filter((r) => r.groupId === filterGroup);

  const unreadCount = reportList.filter((r) => r.status !== "read").length;

  const handleMarkRead = (report: GroupReport) => {
    if (report.status !== "read") markReadMutation.mutate(report);
  };

  return (
    <>
      <PageHeader title="Group Reports" subtitle="Written reports submitted by group leaders" />

      <Box sx={{ px: 3, py: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2} sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <ReportIcon color="action" />
            <Typography variant="body2" color="text.secondary">
              {reportList.length} total &middot; <strong>{unreadCount}</strong> unread
            </Typography>
          </Stack>

          {groups.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Group</InputLabel>
              <Select value={filterGroup} label="Filter by Group" onChange={(e) => setFilterGroup(e.target.value)}>
                <MenuItem value="all">All Groups</MenuItem>
                {groups.map((g) => (
                  <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Stack>

        {filtered.length === 0 && !reports.isLoading && (
          <Card variant="outlined">
            <CardContent sx={{ textAlign: "center", py: 6 }}>
              <ReportIcon sx={{ fontSize: 56, color: "text.disabled", mb: 1 }} />
              <Typography color="text.secondary">
                {filterGroup === "all" ? "No group reports have been submitted yet." : "No reports for this group."}
              </Typography>
            </CardContent>
          </Card>
        )}

        <Stack spacing={2}>
          {filtered.map((r) => (
            <Card
              key={r.id}
              variant="outlined"
              sx={{ cursor: r.status !== "read" ? "pointer" : "default", borderColor: r.status !== "read" ? "primary.light" : "divider" }}
              onClick={() => handleMarkRead(r)}
            >
              <CardHeader
                title={
                  <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{r.title}</Typography>
                    <Chip label={r.status === "read" ? "Read" : "Unread"} size="small" color={statusColor(r.status)} />
                  </Stack>
                }
                subheader={
                  <Stack direction="row" spacing={2} sx={{ mt: 0.5 }} flexWrap="wrap">
                    <Typography variant="caption" color="text.secondary">
                      <strong>Group:</strong> {r.group?.name || "Unknown group"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      <strong>Leader:</strong> {r.person?.displayName || "Unknown"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      <strong>Date:</strong> {r.reportDate ? new Date(r.reportDate).toLocaleDateString() : "—"}
                    </Typography>
                  </Stack>
                }
              />
              <Divider />
              <CardContent>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{r.content}</Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    </>
  );
};

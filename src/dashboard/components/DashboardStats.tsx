import React from "react";
import { Grid, Paper, Stack, Typography, alpha } from "@mui/material";
import { Groups, HowToReg, ListAlt, People } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { UserHelper, Permissions } from "@churchapps/apphelper";
import { ownGroups } from "../../helpers/GroupAccessHelper";
import { GRID_SIZES } from "../../components/ui/layoutPresets";

interface StatDef {
  label: string;
  icon: React.ReactNode;
  queryKey: [string, string];
  link: string;
  color: string;
  show: boolean;
}

const useCount = (stat: StatDef) =>
  useQuery({
    queryKey: stat.queryKey,
    enabled: stat.show,
    select: (data) => (Array.isArray(data) ? data.length : 0),
    placeholderData: []
  });

export const DashboardStats: React.FC = () => {
  const navigate = useNavigate();

  const canViewGroups =
    UserHelper.checkAccess(Permissions.membershipApi.groups.edit) ||
    UserHelper.checkAccess(Permissions.membershipApi.groupMembers.view) ||
    UserHelper.checkAccess(ownGroups.view);

  const stats: StatDef[] = [
    {
      label: "Members",
      icon: <People />,
      queryKey: ["/people", "MembershipApi"],
      link: "/people",
      color: "#2563eb",
      show: UserHelper.checkAccess(Permissions.membershipApi.people.view)
    },
    {
      label: "Groups",
      icon: <Groups />,
      queryKey: ["/groups", "MembershipApi"],
      link: "/groups",
      color: "#7c3aed",
      show: canViewGroups
    },
    {
      label: "Pending Requests",
      icon: <HowToReg />,
      queryKey: ["/groupjoinrequests/pending", "MembershipApi"],
      link: "/groups/pending",
      color: "#d97706",
      show: canViewGroups
    },
    {
      label: "Open Tasks",
      icon: <ListAlt />,
      queryKey: ["/tasks", "DoingApi"],
      link: "/serving/tasks",
      color: "#059669",
      show: true
    }
  ];

  const visible = stats.filter((s) => s.show);
  const counts = [
    useCount(stats[0]),
    useCount(stats[1]),
    useCount(stats[2]),
    useCount(stats[3])
  ];

  if (visible.length === 0) return null;

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {stats.map((stat, i) => {
        if (!stat.show) return null;
        const count = counts[i].data as number;
        return (
          <Grid key={stat.label} size={GRID_SIZES.fourColumn}>
            <Paper
              role="button"
              tabIndex={0}
              onClick={() => navigate(stat.link)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(stat.link); } }}
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                cursor: "pointer",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
                "&:hover": { transform: "translateY(-2px)", boxShadow: 3 }
              }}>
              <Stack
                alignItems="center"
                justifyContent="center"
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  flexShrink: 0,
                  color: stat.color,
                  bgcolor: alpha(stat.color, 0.12)
                }}>
                {stat.icon}
              </Stack>
              <Stack sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 22, fontWeight: 700, lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>
                  {counts[i].isLoading ? "–" : count}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {stat.label}
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
};

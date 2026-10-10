import React from "react";
import { Grid } from "@mui/material";
import { Article, CameraAlt, Event, Groups, HowToReg, ListAlt, Person, VolunteerActivism } from "@mui/icons-material";
import { UserHelper, Permissions, Locale } from "@churchapps/apphelper";
import { QuickActionItem } from "./QuickActionItem";
import { EnvironmentHelper } from "../../helpers/EnvironmentHelper";
import { ownGroups } from "../../helpers/GroupAccessHelper";
import { GRID_SIZES } from "../../components/ui/layoutPresets";

export const MemberWelcome: React.FC = () => {
  const subDomain = UserHelper.currentUserChurch?.church?.subDomain || "";
  const b1Url = EnvironmentHelper.B1Url.replace("{subdomain}", subDomain);

  const canViewGroups =
    UserHelper.checkAccess(Permissions.membershipApi.groups.edit)
    || UserHelper.checkAccess(Permissions.membershipApi.groupMembers.view)
    || UserHelper.checkAccess(ownGroups.view);
  const canEditGroups =
    UserHelper.checkAccess(Permissions.membershipApi.groups.edit)
    || UserHelper.checkAccess(Permissions.membershipApi.groupMembers.edit)
    || UserHelper.checkAccess(ownGroups.edit);
  const canViewReports =
    UserHelper.checkAccess({ api: "MembershipApi", contentType: "Group Reports", action: "View" })
    || canEditGroups;

  const items = [
    { icon: <CameraAlt fontSize="small" />, title: Locale.label("dashboard.memberWelcome.setPhotoTitle"), linkUrl: b1Url + "/mobile/community?id=" + UserHelper.person?.id + "#edit", external: true, show: true },
    { icon: <Person fontSize="small" />, title: Locale.label("dashboard.memberWelcome.findPeopleTitle"), linkUrl: "/people", show: UserHelper.checkAccess(Permissions.membershipApi.people.view) },
    { icon: <Groups fontSize="small" />, title: "My Groups", linkUrl: "/groups", show: canViewGroups },
    { icon: <HowToReg fontSize="small" />, title: "Pending Join Requests", linkUrl: "/groups/pending", show: canEditGroups },
    { icon: <Article fontSize="small" />, title: "Group Reports", linkUrl: "/groups/reports", show: canViewReports },
    { icon: <ListAlt fontSize="small" />, title: "My Tasks", linkUrl: "/serving/tasks", show: true },
    { icon: <VolunteerActivism fontSize="small" />, title: Locale.label("dashboard.memberWelcome.onlineGivingTitle"), linkUrl: b1Url + "/donate", external: true, show: true },
    { icon: <Event fontSize="small" />, title: Locale.label("dashboard.memberWelcome.upcomingEventsTitle"), linkUrl: b1Url, external: true, show: true }
  ];

  return (
    <Grid container spacing={1}>
      {items.filter((item) => item.show).map((item) => (
        <Grid key={item.title} size={GRID_SIZES.threeColumn}>
          <QuickActionItem icon={item.icon} title={item.title} linkUrl={item.linkUrl} external={item.external} />
        </Grid>
      ))}
    </Grid>
  );
};

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserHelper, Permissions } from "@churchapps/apphelper";
import { type IApiPermission } from "@churchapps/helpers";

// "Own Groups" permissions — group-scoped admin access driven by the group leader flag
export const ownGroups: { view: IApiPermission; edit: IApiPermission } = {
  view: { api: "MembershipApi", contentType: "Own Groups", action: "View" },
  edit: { api: "MembershipApi", contentType: "Own Groups", action: "Edit" }
};

export const isGroupLeader = (groupId?: string) =>
  !!groupId && !!UserHelper.userChurch?.groups?.some((g: any) => g.id === groupId && g.leader);

// Church-wide access, or scoped access when the user leads this specific group
export const canViewGroup = (groupId?: string) =>
  UserHelper.checkAccess(Permissions.membershipApi.groupMembers.view) || (UserHelper.checkAccess(ownGroups.view) && isGroupLeader(groupId));

export const canEditGroup = (groupId?: string) =>
  UserHelper.checkAccess(Permissions.membershipApi.groupMembers.edit) || (UserHelper.checkAccess(ownGroups.edit) && isGroupLeader(groupId));

export const isScopedGroupAdmin = () =>
  !UserHelper.checkAccess(Permissions.membershipApi.groupMembers.view) && UserHelper.checkAccess(ownGroups.view);

// Live leader-group ids: union of session flags and actual membership rows. Session data can
// lag behind reality, so the API list (shared cache with the My Groups panel) is authoritative.
export const useLedGroupIds = () => {
  const personId = UserHelper.person?.id || "";
  const memberships = useQuery({
    queryKey: [`/groupmembers?personId=${personId}`, "MembershipApi"],
    enabled: !!personId,
    placeholderData: []
  });

  return useMemo(() => {
    const ids = new Set<string>();
    ((memberships.data as any[]) || []).forEach((m) => { if (m?.groupId && m.leader) ids.add(m.groupId); });
    (UserHelper.userChurch?.groups || []).forEach((g: any) => { if (g?.id && g.leader) ids.add(g.id); });
    return ids;
  }, [memberships.data]);
};

export const useGroupAccess = (groupId?: string) => {
  const ledIds = useLedGroupIds();
  const isLeader = !!groupId && ledIds.has(groupId);
  return {
    isLeader,
    canView: UserHelper.checkAccess(Permissions.membershipApi.groupMembers.view) || (UserHelper.checkAccess(ownGroups.view) && isLeader) || isLeader,
    canEdit: UserHelper.checkAccess(Permissions.membershipApi.groupMembers.edit) || (UserHelper.checkAccess(ownGroups.edit) && isLeader)
  };
};

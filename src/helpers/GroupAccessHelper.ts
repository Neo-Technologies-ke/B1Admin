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

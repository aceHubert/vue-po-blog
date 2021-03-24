import { UserRole, UserRoleCapability } from './enums';

export type UserRoles = {
  [role: string]: {
    name: string;
    capabilities: UserRoleCapability[];
  };
};

export const UserRoles = {
  [UserRole.Administrator]: {
    name: 'Administrator',
    capabilities: Object.values(UserRoleCapability),
  },
  [UserRole.Editor]: {
    name: 'Editor',
    capabilities: [
      UserRoleCapability.EditThemes,
      UserRoleCapability.EditPlugins,
      UserRoleCapability.ModerateComments,
      UserRoleCapability.ManageLinks,
      UserRoleCapability.ManageCategories,
      UserRoleCapability.ManageTags,
      UserRoleCapability.EditPosts,
      UserRoleCapability.EditOthersPosts,
      UserRoleCapability.EditPublishedPosts,
      UserRoleCapability.EditPrivatePosts,
      UserRoleCapability.DeletePosts,
      UserRoleCapability.DeleteOthersPosts,
      UserRoleCapability.DeletePublishedPosts,
      UserRoleCapability.DeletePrivatePosts,
      UserRoleCapability.EditPages,
      UserRoleCapability.EditOthersPages,
      UserRoleCapability.EditPublishedPages,
      UserRoleCapability.EditPrivatePages,
      UserRoleCapability.DeletePages,
      UserRoleCapability.DeleteOthersPages,
      UserRoleCapability.DeletePublishedPages,
      UserRoleCapability.DeletePrivatePages,
      UserRoleCapability.UploadFiles,
      UserRoleCapability.Read,
      UserRoleCapability.ReadPrivatePosts,
      UserRoleCapability.ReadPrivatePages,
    ],
  },
  [UserRole.Author]: {
    name: 'Author',
    capabilities: [
      UserRoleCapability.EditPosts,
      UserRoleCapability.EditPublishedPages,
      UserRoleCapability.DeletePosts,
      UserRoleCapability.DeletePublishedPosts,
      UserRoleCapability.UploadFiles,
      UserRoleCapability.Read,
    ],
  },
  [UserRole.Contributor]: {
    name: 'Contributor',
    capabilities: [UserRoleCapability.EditPosts, UserRoleCapability.DeletePosts, UserRoleCapability.Read],
  },
  [UserRole.Subscriber]: {
    name: 'Subscriber',
    capabilities: [UserRoleCapability.Read],
  },
};

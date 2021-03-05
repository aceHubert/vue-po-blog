import { UserRole, UserRoleCapabilities } from './enums';

const UserRoles = {
  [UserRole.Administrator]: {
    name: 'Administrator',
    capabilities: Object.values(UserRoleCapabilities),
  },
  [UserRole.Editor]: {
    name: 'Editor',
    capabilities: [
      UserRoleCapabilities.EditThemes,
      UserRoleCapabilities.EditPlugins,
      UserRoleCapabilities.ModerateComments,
      UserRoleCapabilities.ManageLinks,
      UserRoleCapabilities.ManageCategories,
      UserRoleCapabilities.ManageTags,
      UserRoleCapabilities.EditPosts,
      UserRoleCapabilities.EditOthersPosts,
      UserRoleCapabilities.EditPublishedPosts,
      UserRoleCapabilities.EditPrivatePosts,
      UserRoleCapabilities.DeletePosts,
      UserRoleCapabilities.DeleteOthersPosts,
      UserRoleCapabilities.DeletePublishedPosts,
      UserRoleCapabilities.DeletePrivatePosts,
      UserRoleCapabilities.EditPages,
      UserRoleCapabilities.EditOthersPages,
      UserRoleCapabilities.EditPublishedPages,
      UserRoleCapabilities.EditPrivatePages,
      UserRoleCapabilities.DeletePages,
      UserRoleCapabilities.DeleteOthersPages,
      UserRoleCapabilities.DeletePublishedPages,
      UserRoleCapabilities.DeletePrivatePages,
      UserRoleCapabilities.UploadFiles,
      UserRoleCapabilities.Read,
      UserRoleCapabilities.ReadPrivatePosts,
      UserRoleCapabilities.ReadPrivatePages,
    ],
  },
  [UserRole.Author]: {
    name: 'Author',
    capabilities: [
      UserRoleCapabilities.EditPosts,
      UserRoleCapabilities.EditPublishedPages,
      UserRoleCapabilities.DeletePosts,
      UserRoleCapabilities.DeletePublishedPosts,
      UserRoleCapabilities.UploadFiles,
      UserRoleCapabilities.Read,
    ],
  },
  [UserRole.Contributor]: {
    name: 'Contributor',
    capabilities: [UserRoleCapabilities.EditPosts, UserRoleCapabilities.DeletePosts, UserRoleCapabilities.Read],
  },
  [UserRole.Subscriber]: {
    name: 'Subscriber',
    capabilities: [UserRoleCapabilities.Read],
  },
};

export default UserRoles;

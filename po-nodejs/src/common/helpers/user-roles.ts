import { UserRole } from './enums';
import { UserCapability } from './user-capability';

export type UserRoles = {
  [role: string]: {
    name: string;
    capabilities: UserCapability[];
  };
};

export const UserRoles = {
  [UserRole.Administrator]: {
    name: 'Administrator',
    capabilities: Object.values(UserCapability),
  },
  [UserRole.Editor]: {
    name: 'Editor',
    capabilities: [
      UserCapability.ManageLinks,
      UserCapability.ManageCategories,
      UserCapability.ManageTags,
      UserCapability.EditPosts,
      UserCapability.EditOthersPosts,
      UserCapability.EditPublishedPosts,
      UserCapability.EditPrivatePosts,
      UserCapability.DeletePosts,
      UserCapability.DeleteOthersPosts,
      UserCapability.DeletePublishedPosts,
      UserCapability.DeletePrivatePosts,
      UserCapability.PublishPosts,
      UserCapability.ModerateComments,
      UserCapability.EditPages,
      UserCapability.EditOthersPages,
      UserCapability.EditPublishedPages,
      UserCapability.EditPrivatePages,
      UserCapability.DeletePages,
      UserCapability.DeleteOthersPages,
      UserCapability.DeletePublishedPages,
      UserCapability.DeletePrivatePages,
      UserCapability.PublishPages,
      UserCapability.UploadFiles,
      UserCapability.Read,
      UserCapability.ReadPrivatePosts,
      UserCapability.ReadPrivatePages,
    ],
  },
  [UserRole.Author]: {
    name: 'Author',
    capabilities: [
      UserCapability.EditPosts,
      UserCapability.EditPublishedPosts,
      UserCapability.DeletePosts,
      UserCapability.DeletePublishedPosts,
      UserCapability.PublishPosts,
      UserCapability.UploadFiles,
      UserCapability.Read,
    ],
  },
  [UserRole.Contributor]: {
    name: 'Contributor',
    capabilities: [UserCapability.EditPosts, UserCapability.DeletePosts, UserCapability.Read],
  },
  [UserRole.Subscriber]: {
    name: 'Subscriber',
    capabilities: [UserCapability.Read],
  },
};

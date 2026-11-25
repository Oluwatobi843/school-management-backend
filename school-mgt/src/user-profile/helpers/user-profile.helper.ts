import { UserProfile } from '../entities/user-profile.entity';

export class UserProfileHelper {
  static sanitizeProfile(profile: UserProfile) {
    if (!profile) {
      return profile;
    }

    const { user, ...safeProfile } = profile;

    return safeProfile;
  }
}

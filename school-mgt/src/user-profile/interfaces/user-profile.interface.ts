
import { ProfileGender } from '../enums/profile-gender.enum';

export interface IUserProfile {
  id: number;
  userId: number;
  phoneNumber?: string;
  profilePicture?: string;
  dateOfBirth?: Date | string;
  gender?: ProfileGender;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  createdAt: Date;
  updatedAt: Date;
}

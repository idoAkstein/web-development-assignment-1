import { User, userModel } from '../models';

export const createUser = async (user: User) => await userModel.create(user);

export const editUser = async (user: Partial<User>, id: string) => await userModel.findByIdAndUpdate(id, user);

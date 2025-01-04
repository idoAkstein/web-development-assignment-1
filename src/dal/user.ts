import { User, userModel } from '../models';

export const createUser = async (user: User) => await userModel.create(user);

export const editUser = async (user: Partial<User>, id: string) => await userModel.findByIdAndUpdate(id, user);

export const deleteUser = async (id: string) => await userModel.deleteOne({ _id: id });

export const getUserById = async (id: string) => await userModel.findById(id);

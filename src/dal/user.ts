import { commentModel, postModel, User, userModel } from '../models';

export const createUser = async (user: User) => await userModel.create(user);

export const editUser = async (user: Partial<User>, id: string) => await userModel.findByIdAndUpdate(id, user);

export const deleteUser = async (id: string) => {
    await userModel.deleteOne({ _id: id });
    await postModel.deleteMany({ sender: id });
    await commentModel.deleteMany({ sender: id });
};

export const getUserById = async (id: string) => await userModel.findById(id);

export const getAllUsers = async () => await userModel.find().select('-__v -password');

export const isUsernameExists = async (username: string) => (await userModel.countDocuments({ username })) > 0;

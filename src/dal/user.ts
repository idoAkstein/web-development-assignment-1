import { User, userModel } from '../models';

export const createUser = async (user: User) => await userModel.create(user);

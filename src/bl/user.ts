import { genSalt, hash } from 'bcrypt';
import { createUserInDB } from '../dal';
import { User } from '../models';

export const createUser = async ({ password, ...user }: Omit<User, 'tokens'>) => {
    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);

    return await createUserInDB({ ...user, password: hashedPassword });
};

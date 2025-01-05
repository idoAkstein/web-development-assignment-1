import mongoose from 'mongoose';
import { getConfig } from './config';

export const initDBConnection = async () => {
    const { databaseURL } = getConfig();

    await mongoose.connect(databaseURL);

    mongoose.connection.on('error', (error) => {
        console.error(error);
    });
    mongoose.connection.once('open', () => {
        console.log('Connected to database');
    });
};

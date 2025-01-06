import express, { Express } from 'express';
import { initApp } from '../server/initApp';

// Declare globals for Jest to use in test files
declare global {
    var initTestServer: () => Promise<Express>;
    var closeTestServer: () => Promise<void>;
}

let a: Express | null = null;
let server: any = null;

global.initTestServer = async (): Promise<Express> => {
    if (!a) {
        const { server: serv, app: application } = await initApp();
        a = application;
        server = serv;
    }

    return a;
};

global.closeTestServer = async (): Promise<void> => {
    if (server) {
        server.close();
        server = null;
        a = null;
    }
};

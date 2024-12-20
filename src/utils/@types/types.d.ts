import express from 'express';

declare global {
    namespace Express {
        interface Request {
            session?: {
                isCreatingBill?: boolean;
                isCreatingBillDetails?: boolean;
            };
        }
    }
}

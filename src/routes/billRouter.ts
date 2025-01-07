import express, { Request, Response } from 'express';
import BillController from '../controllers/BillController';

const router = express.Router();

// Create a new billing record
router.post('/', (req: Request, res: Response) => {
    BillController.createBillingRecord(req, res);
});

// Get billing details by userId
router.get('/:userId', (req: Request, res: Response) => {
    BillController.getBillingDetails(req, res);
});

// Update payment status for a specific billing record
router.put('/update-status', (req: Request, res: Response) => {
    BillController.updatePaymentStatus(req, res);
});

// Update the billing address for a specific user
router.put('/:userId/update-address', (req: Request, res: Response) => {
    BillController.updateBillingAddress(req, res);
});

router.delete('/:id',(req:Request,res:Response) =>{
    BillController.deleteBillingRecord(req,res);
});


export default router;

import { Request, Response } from 'express';
import Billing from '../models/Bill';  // Import the Billing model

class BillController {
  
    // Create a new billing record
    static async createBillingRecord(req: Request, res: Response): Promise<Response> {
        try {
            const { userId, billingAddress, paymentMethod, amount, status } = req.body;
    
            // Validate inputs (could be improved with libraries like joi or express-validator)
            if (!userId || !billingAddress || !paymentMethod || !amount || !status) {
                return res.status(400).json({
                    message: 'Missing required fields',
                });
            }

            // Create a new billing record
            const newBilling = new Billing({
                userId,
                billingAddress,
                paymentMethod,
                amount,
                status,
            });
    
            // Save the new billing record to the database
            await newBilling.save();
    
            return res.status(201).json({
                message: 'Billing record created successfully!',
                data: newBilling,
            });
        } catch (error: any) {
            console.error('Error creating billing record:', error);
            return res.status(500).json({
                message: 'Error creating billing record',
                error: error.message,
            });
        }
    }
  
    // Get billing details by userId
    static async getBillingDetails(req: Request, res: Response): Promise<Response> {
        try {
            const userId = req.params.userId;
    
            if (!userId) {
                return res.status(400).json({
                    message: 'User ID is required',
                });
            }
    
            // Find the billing record by userId
            const billingDetails = await Billing.findOne({ userId });
    
            if (!billingDetails) {
                return res.status(404).json({
                    message: 'Billing record not found for this user',
                });
            }
    
            return res.status(200).json({
                message: 'Billing details retrieved successfully',
                data: billingDetails,
            });
        } catch (error: any) {
            console.error('Error fetching billing details:', error);
            return res.status(500).json({
                message: 'Error fetching billing details',
                error: error.message,
            });
        }
    }
  
    // Update payment status for a specific billing record
    static async updatePaymentStatus(req: Request, res: Response): Promise<Response> {
        try {
            const { userId, status } = req.body;
    
            if (!userId || !status) {
                return res.status(400).json({
                    message: 'Missing required fields',
                });
            }
    
            // Find the billing record by userId
            const billingRecord = await Billing.findOne({ userId });
    
            if (!billingRecord) {
                return res.status(404).json({
                    message: 'Billing record not found for this user',
                });
            }
    
            // Update the payment status
            billingRecord.status = status;
    
            // Save the updated billing record
            await billingRecord.save();
    
            return res.status(200).json({
                message: 'Payment status updated successfully',
                data: billingRecord,
            });
        } catch (error: any) {
            console.error('Error updating payment status:', error);
            return res.status(500).json({
                message: 'Error updating payment status',
                error: error.message,
            });
        }
    }
  
    // Update the billing address for a specific user
    static async updateBillingAddress(req: Request, res: Response): Promise<Response> {
        try {
            const userId = req.params.userId;
            const { billingAddress } = req.body;
    
            if (!userId || !billingAddress) {
                return res.status(400).json({
                    message: 'Missing required fields',
                });
            }
    
            // Find the billing record by userId
            const billingRecord = await Billing.findOne({ userId });
    
            if (!billingRecord) {
                return res.status(404).json({
                    message: 'Billing record not found for this user',
                });
            }
    
            // Update the billing address
            billingRecord.billingAddress = billingAddress;
    
            // Save the updated billing record
            await billingRecord.save();
    
            return res.status(200).json({
                message: 'Billing address updated successfully',
                data: billingRecord,
            });
        } catch (error: any) {
            console.error('Error updating billing address:', error);
            return res.status(500).json({
                message: 'Error updating billing address',
                error: error.message,
            });
        }
    }
}

export default BillController;

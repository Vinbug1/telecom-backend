import { Request, Response } from 'express';
import Billing from '../models/Bill';  // Import the Billing model
import Ticket from '../models/Ticket'; // Import the Ticket model (you need to import the Ticket model here)
import User from '../models/User'; // Assuming you have a User model
import { ObjectId } from 'mongodb';  // Import ObjectId

class BillController {

    static async createBillingRecord(req: Request, res: Response): Promise<Response> {
        try {
            console.log("Received payload:", req.body);
    
            const { userId, billingAddress, amount, status, description } = req.body;
    
            console.log("userId:", userId);
            console.log("billingAddress:", billingAddress);
            console.log("amount:", amount);
            console.log("status:", status);
    
            // Validate required fields
            if (!userId || !billingAddress || !amount || !status || !description) {
                console.error("Validation error: Missing required fields");
                return res.status(400).json({
                    message: "Missing required fields",
                });
            }
    
            // Validate status field
            const validStatuses = ['open', 'paid', 'unpaid', 'pending'];
            if (!validStatuses.includes(status)) {
                console.error("Validation error: Invalid status value");
                return res.status(400).json({
                    message: "Invalid status value. Allowed values are: 'open', 'paid', 'unpaid', 'pending'.",
                });
            }
    
            // Check if a billing record already exists with the same userId and description
            const existingBilling = await Billing.findOne({ userId, description });
            if (existingBilling) {
                console.log("Billing record already exists.");
                return res.status(400).json({
                    message: "Billing record already exists",
                });
            }
    
            // Check if a ticket already exists for the same user and description
            const existingTicket = await Ticket.findOne({ userId, description: `Billing record created: ${description}` });
            if (existingTicket) {
                console.log("Ticket already exists.");
                return res.status(400).json({
                    message: "Ticket already exists",
                });
            }
    
            // Create the ticket only if it doesn't exist
            const newTicket = new Ticket({
                userId,
                description: `Billing record created: ${description}`,
                status: 'open',
            });
    
            const savedTicket = await newTicket.save();
            if (!savedTicket) {
                console.log("Failed to create ticket.");
                return res.status(500).json({
                    message: "Failed to create ticket",
                });
            }
            console.log("Ticket created successfully:", savedTicket);
    
            // Create the billing record
            const newBilling = new Billing({
                userId,
                billingAddress,
                amount,
                status,
                description,
                ticketId: savedTicket._id,  // Associate the ticket with the billing record
            });
    
            // Save the billing record and ensure it is only created once
            const savedBilling = await newBilling.save();
            if (!savedBilling) {
                console.log("Failed to save billing record.");
                return res.status(500).json({
                    message: "Failed to save billing record",
                });
            }
    
            console.log("Billing record successfully saved:", savedBilling);
    
            // Return success response with both the billing and ticket
            return res.status(201).json({
                message: "Billing record and ticket created successfully!",
                data: { billing: savedBilling, ticket: savedTicket },
            });
    
        } catch (error: any) {
            console.error("Error creating billing record:", error);
            return res.status(500).json({
                message: "Error creating billing record",
                error: error.message,
            });
        }
    }
    

    
    static async getAllBillingDetails(req: Request, res: Response): Promise<Response> {
        try {
          // Fetch all billing records
          const billingDetails = await Billing.find();
          if (billingDetails.length === 0) {
            return res.status(404).json({
              message: 'No billing records found',
            });
          }
      
          // Fetch user details for each billing record
          const userPromises = billingDetails.map((billing) => {
            return User.findById(billing.userId);
          });
          
          const users = await Promise.all(userPromises);
      
          // Fetch related tickets for each billing record (assuming one ticket per billing)
          const ticketPromises = billingDetails.map(async (billing) => {
            return await Ticket.findOne({ userId: billing.userId, description: `Billing record created: ${billing.description}` });
          });
      
          const tickets = await Promise.all(ticketPromises);
      
          // Modify the response to include user and ticket details along with billing information
          const responseData = billingDetails.map((billing, index) => ({
            user: users[index],    // User details
            billing,               // Billing details
            ticketId: tickets[index]?._id || null,  // Ticket ID if it exists
          }));
      
          return res.status(200).json({
            message: 'Billing details retrieved successfully',
            data: responseData,
          });
        } catch (error: any) {
          console.error('Error fetching billing details:', error);
          return res.status(500).json({
            message: 'Error fetching billing details',
            error: error.message,
          });
        }
      };
      
     // Get billing details by userId
    static async getBillingDetails(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.params.userId;

      if (!userId) {
        return res.status(400).json({
          message: 'User ID is required',
        });
      }

      // Find the billing records by userId (considering there could be multiple)
      const billingDetails = await Billing.find({ userId });
      if (billingDetails.length === 0) {
        return res.status(404).json({
          message: 'No billing records found for this user',
        });
      }

      // Fetch user details based on the userId
      const userDetails = await User.findById(userId);
      if (!userDetails) {
        return res.status(404).json({
          message: 'User not found',
        });
      }

      // Fetch related tickets for the billing records (assuming one ticket per billing)
      const ticketPromises = billingDetails.map(async (billing) => {
        return await Ticket.findOne({ userId, description: `Billing record created: ${billing.description}` });
      });

      const tickets = await Promise.all(ticketPromises);

      // Modify the response to include ticket details along with the billing information
      const responseData = billingDetails.map((billing, index) => ({
        user: userDetails,  // Send user details
        billing,             // Send billing details
        ticketId: tickets[index]?._id || null,  // Include ticket ID if exists
      }));

      return res.status(200).json({
        message: 'Billing details retrieved successfully',
        data: responseData,
      });
    } catch (error: any) {
      console.error('Error fetching billing details:', error);
      return res.status(500).json({
        message: 'Error fetching billing details',
        error: error.message,
      });
    }
    };  

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

import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET ?? 'your_jwt_secret';

class UserController {
    // Helper method for error handling
    private static handleError(res: Response, error: any, statusCode = 500) {
        return res.status(statusCode).json({ error: error.message || 'An error occurred' });
    }

    // Register a new user
static async register(req: Request, res: Response): Promise<Response | void> {
    const { username, email, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = new User({ username, email, password: hashedPassword,role: role });
        await newUser.save();
        console.log(`User registered: ${username}, Email: ${email}`);
        return res.status(201).json({ message: 'User registered successfully' });
    } catch (error: any) {
        return UserController.handleError(res, error, 400);
    }
}

// Login a user
static async login(req: Request, res: Response): Promise<Response | void> {
    const { email, password } = req.body;
    try {
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: 'User not found' });

      // Compare the provided password with the stored hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

      // Generate a JWT token
      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

      // Exclude the password field from the user object
      const { password: _, ...userData } = user.toObject();

      // Return the token and user details
      return res.json({ token, user: userData });
    } catch (error: any) {
      // Handle any errors
      return res.status(500).json({ error: error.message || 'An error occurred' });
    }
  }


// Get all users
static async getAllUsers(req: Request, res: Response): Promise<Response | void> {
    try {
        const users = await User.find();  // Fetch all users from the database
        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'No users found' });  // Handle case if no users exist
        }
        return res.json(users);  // Return the list of users
    } catch (error: any) {
        UserController.handleError(res, error);  // Use existing error handler
    }
}
    // Get user by ID
    static async getUser(req: Request, res: Response): Promise<Response | void>{
        const { id } = req.params;
        try {
            const user = await User.findById(id);
            if (!user) return res.status(404).json({ message: 'User not found' });
            res.json(user);
        } catch (error: any) {
            UserController.handleError(res, error);
        }
    }

    // Update user details
    static async updateUser(req: Request, res: Response): Promise<Response | void> {
        const { id } = req.params;
        const { username, email, password } = req.body;
        try {
            const hashedPassword = password ? await bcrypt.hash(password, saltRounds) : undefined;

            const updatedUser = await User.findByIdAndUpdate(
                id,
                { username, email, ...(hashedPassword && { password: hashedPassword }) },
                { new: true } // Return updated document
            );

            if (!updatedUser) return res.status(404).json({ message: 'User not found' });
            res.json(updatedUser);
        } catch (error: any) {
            UserController.handleError(res, error, 400);
        }
    }

    // Delete a user
    static async deleteUser(req: Request, res: Response): Promise<Response | void> {
        const { id } = req.params;
        try {
            const deletedUser = await User.findByIdAndDelete(id);
            if (!deletedUser) return res.status(404).json({ message: 'User not found' });
            res.json({ message: 'User deleted successfully' });
        } catch (error: any) {
            UserController.handleError(res, error);
        }
    }

    // Forget Password
    static async forgetPassword(req: Request, res: Response): Promise<Response | void> {
        const { email } = req.body;
        try {
            const user = await User.findOne({ email });
            if (!user) return res.status(404).json({ message: 'User not found' });

            const resetToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '15m' });
            // Placeholder for sending resetToken to user's email
            res.json({ message: 'Password reset link has been sent', resetToken });
        } catch (error: any) {
            UserController.handleError(res, error);
        }
    }

    // Reset Password
    static async resetPassword(req: Request, res: Response): Promise<void> {
        const { resetToken, newPassword } = req.body;
        try {
            const decoded: any = jwt.verify(resetToken, JWT_SECRET);
            const userId = decoded.id;

            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
            await User.findByIdAndUpdate(userId, { password: hashedPassword });

            res.json({ message: 'Password reset successfully' });
        } catch (error: any) {
            const status = error.name === 'TokenExpiredError' ? 400 : 500;
            UserController.handleError(res, error, status);
        }
    }
}

export default UserController;

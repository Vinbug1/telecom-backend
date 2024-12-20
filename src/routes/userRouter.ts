import express, { Request, Response } from 'express';
import UserController from '../controllers/UserController';

const router = express.Router();

// Register a new user
router.post('/register', (req: Request, res: Response) => {
    UserController.register(req, res);
});

// Login a user
router.post('/login', (req: Request, res: Response) => {
    UserController.login(req, res);
});

router.get('/', (req: Request, res: Response) => {
    UserController.getAllUsers(req, res);
});

// Get user by ID
router.get('/:id', (req: Request, res: Response) => {
    UserController.getUser(req, res);
});

// Update user details
router.put('/:id', (req: Request, res: Response) => {
    UserController.updateUser(req, res);
});

// Delete a user
router.delete('/:id', (req: Request, res: Response) => {
    UserController.deleteUser(req, res);
});

// Forget Password
router.post('/forget-password', (req: Request, res: Response) => {
    UserController.forgetPassword(req, res);
});

// Reset Password
router.post('/reset-password', (req: Request, res: Response) => {
    UserController.resetPassword(req, res);
});

export default router;

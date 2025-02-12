import express from "express";
import { subscribeUser, getUserSubscription } from "../controllers/subscriptionController.js";

const router = express.Router();

router.post("/subscribe", subscribeUser);
router.get("/my-subscription", getUserSubscription);

export default router;

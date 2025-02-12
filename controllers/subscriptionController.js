import Subscription from "../models/Subscription.js";

/**
 * @desc Subscribe user after payment
 * @route POST /api/subscriptions/subscribe
 */
export const subscribeUser = async (req, res) => {
  try {
    const { userEmail, selectedCategories, selectedCountries, subscriptionType, paymentRef } = req.body;

    if (!userEmail || !selectedCategories.length || !selectedCountries.length || !subscriptionType || !paymentRef) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const endDate = new Date();
    subscriptionType === "monthly" ? endDate.setMonth(endDate.getMonth() + 1) : endDate.setFullYear(endDate.getFullYear() + 1);

    const subscription = new Subscription({
      userEmail,
      selectedCategories,
      selectedCountries,
      subscriptionType,
      endDate,
      paymentRef,
    });

    await subscription.save();
    res.status(201).json({ message: "Subscription successful", subscription });
  } catch (error) {
    res.status(500).json({ message: "Error subscribing", error: error.message });
  }
};

/**
 * @desc Get user's active subscription
 * @route GET /api/subscriptions/my-subscription
 */
export const getUserSubscription = async (req, res) => {
  const { userEmail } = req.query;

  try {
    const subscription = await Subscription.findOne({ userEmail, isActive: true, endDate: { $gte: new Date() } });

    if (!subscription) {
      return res.status(404).json({ message: "No active subscription found" });
    }

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: "Error fetching subscription", error: error.message });
  }
};

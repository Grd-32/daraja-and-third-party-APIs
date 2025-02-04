import NotificationPreference from '../models/NotificationPreference.js';
import Flutterwave from 'flutterwave-node-v3';

// Configure Flutterwave
const flw = new Flutterwave('FLUTTERWAVE_PUBLIC_KEY', 'FLUTTERWAVE_SECRET_KEY');

// Save notification preferences and initiate payment
export const savePreferences = async (req, res) => {
  try {
    const {
      userId,
      notificationMethod,
      subscriptionType,
      selectedCategories,
      selectedCountries,
      contactDetail,
      charge,
    } = req.body;

    // Validate request body
    if (!notificationMethod || !subscriptionType || !selectedCategories.length || !selectedCountries.length || !contactDetail) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Save preferences to database
    const newPreference = new NotificationPreference({
      userId,
      notificationMethod,
      subscriptionType,
      selectedCategories,
      selectedCountries,
      contactDetail,
      charge,
    });

    const savedPreference = await newPreference.save();

    // Create payment payload
    const paymentPayload = {
      tx_ref: `txn_${savedPreference._id}`,
      amount: charge,
      currency: 'KES',
      redirect_url: 'https://biddersportal.com/payment/callback', // Update with your actual frontend callback URL
      customer: {
        email: notificationMethod === 'email' ? contactDetail : undefined,
        phone_number: notificationMethod === 'sms' ? contactDetail : undefined,
        name: notificationMethod === 'in-app' ? contactDetail : undefined,
      },
      meta: {
        subscriptionId: savedPreference._id,
      },
      customizations: {
        title: 'Tender Notifications Subscription',
        description: `Payment for ${subscriptionType} subscription`,
      },
    };

    // Initiate payment with Flutterwave
    const response = await flw.PaymentLink.create(paymentPayload);

    if (response.status === 'success') {
      return res.status(200).json({
        message: 'Preferences saved and payment initiated.',
        data: {
          link: response.data.link, // Redirect link to Flutterwave payment page
        },
      });
    } else {
      return res.status(500).json({ message: 'Failed to initiate payment.' });
    }
  } catch (error) {
    console.error('Error saving preferences:', error);
    return res.status(500).json({ message: 'Error saving preferences.', error });
  }
};

// Handle payment callback (optional)
export const handlePaymentCallback = async (req, res) => {
  const { tx_ref, status } = req.body;

  try {
    if (status === 'successful') {
      const preference = await NotificationPreference.findOne({ tx_ref });

      if (preference) {
        preference.paymentStatus = 'completed';
        await preference.save();
        return res.status(200).json({ message: 'Payment successful and preferences updated.' });
      } else {
        return res.status(404).json({ message: 'Subscription not found.' });
      }
    } else {
      return res.status(400).json({ message: 'Payment not successful.' });
    }
  } catch (error) {
    console.error('Error handling payment callback:', error);
    return res.status(500).json({ message: 'Error handling payment callback.', error });
  }
};

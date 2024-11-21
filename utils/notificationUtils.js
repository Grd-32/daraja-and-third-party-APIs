import Notification from '../models/Notification.js';

export const sendNotification = async (userId, message) => {
  try {
    await Notification.create({ userId, message });
    console.log(`Notification sent to user ${userId}`);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

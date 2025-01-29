import { paypalClient } from "../config/paypalConfig.js";

/**
 * Create an order
 */
export const createOrder = async (req, res) => {
  const { amount } = req.body; // Expect amount in the request payload
  try {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: amount, // Use the amount from the client
          },
        },
      ],
    });

    const order = await paypalClient.execute(request);
    res.status(201).json({
      id: order.result.id, // Send the PayPal order ID to the client
    });
  } catch (error) {
    console.error("Error creating PayPal order:", error);
    res.status(500).json({ error: "Failed to create PayPal order" });
  }
};

/**
 * Capture an order
 */
export const captureOrder = async (req, res) => {
  const { orderId } = req.body; // Expect order ID from the client
  try {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const capture = await paypalClient.execute(request);
    res.status(200).json({
      status: "success",
      capture: capture.result, // Send the capture result to the client
    });
  } catch (error) {
    console.error("Error capturing PayPal order:", error);
    res.status(500).json({ error: "Failed to capture PayPal order" });
  }
};

const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());

// NOT SURE ABOUT THIS PATH
app.post("/webhook", async (req, res) => {
  try {
    // Verify the request
    const isVerified = verifySumUpWebhook(req);

    if (!isVerified) {
      return res.status(403).json({ error: "Webhook verification failed" });
    }
    // HOW CAN I VERIIFY THIS!

    // Process the webhook payload
    const { event_type, id } = req.body;

    // FOR NOW I SHOUDL IGNORE OTHER EVENT_TYPES
    if (event_type === "CHECKOUT_STATUS_CHANGED") {
      // Fetch information about the checkout (status, customer_id, transaction)
      const checkoutInfo = await fetchCheckoutInformation(id);

      //   check if status of checkout is set to PAID
      //   if so fetch data about transaction (products ) DO I NEED TO GET STATUS? WHAT WITH CANCELLATION
      const transactionInfo = await fetchTransactionInformation(id);

      // Send POST request to third-party with order information

      await sendToThirdParty(transactionInfo);

      // DO I NEED to perform other actions based on the checkout status change?
      // DO I NEED TO KEEP SOME RECORDS IN DATABASE? DO I NEED SEND SOME NOTIFICATIONS?
      console.log(`Checkout status changed for checkout ID: ${id}`);
    }

    // Return a valid, empty response with a 2xx status code
    return res.status(200).json({});
  } catch (error) {
    console.error(`Error handling webhook: ${error.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
});

const verifySumUpWebhook = (req) => {
  // CAN I VERIFY SUMUP WEBHOOK? HOW? WHAT TO DO, CHECK?

  // Return true if verification is successful, false otherwise.
  return true;
};

const fetchCheckoutInformation = async (checkoutId) => {
  try {
    const response = await axios.get(
      `https://api.sumup.com/v0.1/checkouts/${checkoutId}`
    );
    console.log("checkout dtails:", response.data);
  } catch (err) {
    console.error("Error retriving checkout information:", err.message);
    throw err;
  }
};

const fetchTransactionInformation = async (transactionId) => {
  try {
    const response = await axios.get(
      // CHECK THIS IN DOCUMENTATION, THIS IS JUST A PLAN
      `https://api.sumup.com/v0.1/me/transactions/${transactionId}`
    );
    console.log("transaction dtails:", response.data);
  } catch (err) {
    console.error("Error retriving transaction information:", err.message);
    throw err;
  }
};

const sendToThirdParty = async (orderInfo) => {
  try {
    // IN PROCESS, NEED TO CHECK WHAT GELATO API STATES,
    // NEED TO PREPARE ORDERINFO, AS NOW IT WILL GET TRANSACTION DETAILS AS ARGUMENT ONLY
    // IT NEEDS TO BE COMBINE WITH CUSTOMER DETAILS, AND WHATEVER ELSE THE DOCUMENTATION SAYS
    const thirdPartyUrl = "https://example.com/third-party-endpoint";

    // Send a POST request to the third-party with order information
    const response = await axios.post(thirdPartyUrl, orderInfo);

    console.log("Third-party response:", response.data);
  } catch (error) {
    console.error("Error sending to third-party:", error.message);
    throw error;
  }
};

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

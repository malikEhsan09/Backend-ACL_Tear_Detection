//! stripe integeration
import Stripe from "stripe";
import Payment from "../models/payment.model.js";
// import User from "../models/user.model.js";
import Player from "../models/player.model.js";
import User from "../models/user.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const { userId, amount } = req.body;

    // Validate input
    if (!userId || !amount) {
      return res
        .status(400)
        .json({ message: "User ID and amount are required" });
    }

    // Fetch user and player details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const player = await Player.findOne({ userID: user._id }); // Assuming userID is linked to Player
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    // Create a Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Payment for MRI Report",
              description: "Access to MRI report",
            },
            unit_amount: amount, // Ensure this is in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/player/successPayment?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    // Save the payment in MongoDB with user and playerId
    const payment = new Payment({
      user: user._id, // Include user ID here
      playerId: player._id, // Include player ID here
      amount,
      stripeSessionId: session.id,
      paymentStatus: "pending",
    });

    await payment.save();

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating Stripe session:", error);
    res.status(500).json({
      message: "Failed to create checkout session",
      error: error.message,
    });
  }
};

export const paymentSuccess = async (req, res) => {
  const { session_id } = req.query;

  try {
    const payment = await Payment.findOne({ stripeSessionId: session_id });

    if (!payment) return res.status(404).json({ message: "Payment not found" });

    // Check if the Stripe session was successful by retrieving the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);
    console.log(`Session is ${session.payment_status}`)

    if (session.payment_status === "paid") {
      // Update the paymentStatus to 'succeeded' in your MongoDB
      payment.paymentStatus = "succeeded";
      await payment.save();


      // Add the check that payment succeeded
      console.log("payment succeeded")

      return res.json({ message: "Payment succeeded!" });
    } else {
      // If the payment was not successful, update the status accordingly
      payment.paymentStatus = "failed";
      await payment.save();

      return res.json({ message: "Payment failed or is still pending." });
    }
  } catch (error) {
    console.error("Error updating payment status:", error);
    res
      .status(500)
      .json({ message: "Payment update failed", error: error.message });
  }
};

export const getPaymentByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    // Validate userId
    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const payments = await Payment.find({ user: userId }); // Fetch payments for the specific user
    if (!payments.length) {
      return res
        .status(404)
        .json({ message: "No payments found for this user." });
    }
    res.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPaymentDetails = async (req,res) =>{

  const {paymentId} = req.params;
  console.log("paymentID",paymentId)

  try{
    const payment = await Payment.findById({_id:paymentId}).populate('user');
    if (payment) {
      const paymentDetails = {
          paymentId: payment._id,
          amount: payment.amount,
          stripeSessionId: payment.stripeSessionId,
          paymentStatus: payment.paymentStatus,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt,
          user: {
              userName: payment.user.userName,
              email: payment.user.email
          }
      };
  
      // Send the response
      res.json({ payment: paymentDetails });
  } else {
      res.status(404).json({ message: "Payment not found" });
  }

  }catch(error){
    console.log(error);
    res.status(500).json({
      message:"Details not found"    })
  }

}
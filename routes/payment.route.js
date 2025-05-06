import express from "express";
import {
  createCheckoutSession,
  getPaymentByUserId,
  getPaymentDetails,
  paymentSuccess,
} from "../controllers/payment.controller.js";
import { verifyToken } from "../middleware/auth.mw.js";
import Payment from "../models/payment.model.js";
import PDFDocument from "pdfkit";

const router = express.Router();


//! NEW
router.post("/create-checkout-session", verifyToken, createCheckoutSession);
router.get("/payment-success", paymentSuccess);
router.get("/payments/:userId", getPaymentByUserId);

// Utils function
const createPDF = (payment) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    let buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    doc.fontSize(25).text("Receipt", { align: "center" });
    doc.text(`Amount: $${payment.amount / 100}`);
    doc.text(`Status: ${payment.paymentStatus}`);

    // Add more detail if needed
    doc.end();
  });
};

router.get("/:paymentId",getPaymentDetails)

// Download pdf
router.get("/download-receipt/:paymentId", async (req, res) => {
  const { paymentId } = req.params;

  try {
    const payment = await Payment.findById(paymentId).populate("user");
    console.log(payment);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }

    // Generate PDF receipt (implement createPDF according to your needs)
    const pdfBuffer = await createPDF(payment);

    // Set headers for PDF download
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=receipt-${paymentId}.pdf`,
      "Content-Length": pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error downloading receipt:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;

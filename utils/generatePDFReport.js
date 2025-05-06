import fs from "fs";
import PDFDocument from "pdfkit";
import path from "path";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const generatePieChart = async (result) => {
  const width = 200;
  const height = 200;
  const chartCallback = (ChartJS) => {
    ChartJS.defaults.responsive = true;
    ChartJS.defaults.maintainAspectRatio = false;
  };
  const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width,
    height,
    chartCallback,
  });

  const data = {
    datasets: [
      {
        data:
          result === "Healthy"
            ? [1, 0, 0]
            : result === "Partial Tear"
            ? [0, 1, 0]
            : [0, 0, 1],
        backgroundColor: ["#00A86B", "#FFA500", "#FF0000"],
      },
    ],
  };

  const configuration = {
    type: "doughnut",
    data: data,
    options: {
      plugins: {
        legend: {
          display: false,
        },
      },
      cutout: "40%",
    },
  };

  const image = await chartJSNodeCanvas.renderToBuffer(configuration);
  return image;
};

const generatePDFReport = async (
  assessmentResult,
  playerDetails,
  mriFileId
) => {
  console.log("hiii",assessmentResult,playerDetails,mriFileId)
  if (!mriFileId) {
    throw new Error("mriFileId is undefined");
  }

  const reportsDir = path.join(__dirname, "../reports");
  ensureDirectoryExists(reportsDir);

  const pdfFileName = `MRI_Report_${mriFileId}.pdf`;
  const pdfFilePath = path.join(reportsDir, pdfFileName);

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  doc.pipe(fs.createWriteStream(pdfFilePath));

  // Adjusting the Report ID and Date to avoid overlap
  const currentDate = new Date().toLocaleDateString();

  // Header with larger logo and aligned correctly
  doc
    .image(path.join(__dirname, "../public/assets/logo.png"), 60, 60, {
      width: 70,
    })
    .fontSize(24)
    .fillColor("#000080")
    .text("ACL TEAR DETECTOR", 150, 50) // Properly aligned header
    .fontSize(16)
    .font("Helvetica-Bold")
    .fillColor("#000000")
    .text("MRI ASSESSMENT REPORT", 150, 80) // Moved a bit lower
    .moveDown(0.5);

  // Add Report ID and Date below the title, properly spaced
  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text(`Report ID: ${mriFileId}`, 150, 110, { align: "right" }) // Properly positioned Report ID
    .moveDown(0.2)
    .text(`Report Date: ${currentDate}`, 150, 125, { align: "right" }); // Properly positioned Report Date

  doc.moveTo(50, 140).lineTo(545, 140).stroke();

  // Player Details Table
  const tableTop = 160;
  const tableLeft = 50;
  const rowHeight = 30;
  const colWidth = 240;

  doc
    .lineWidth(1)
    .rect(tableLeft, tableTop, 495, rowHeight * 6) // Updated to have 6 rows
    .stroke();

  const addTableRow = (label, value, rowIndex) => {
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#000000")
      .text(label, tableLeft + 10, tableTop + rowIndex * rowHeight + 10, {
        width: colWidth - 10,
      });

    doc
      .font("Helvetica")
      .text(
        value || "N/A",
        tableLeft + colWidth + 10,
        tableTop + rowIndex * rowHeight + 10,
        { width: colWidth - 10 }
      );

    if (rowIndex < 5) {
      doc
        .moveTo(tableLeft, tableTop + (rowIndex + 1) * rowHeight)
        .lineTo(tableLeft + 495, tableTop + (rowIndex + 1) * rowHeight)
        .stroke();
    }
  };

  // Adding the Player Information from the provided structure
  addTableRow(
    "Player Name",
    `${playerDetails.firstName || "N/A"} ${playerDetails.lastName || "N/A"}`,
    0
  );
  addTableRow(
    "Date of Birth",
    playerDetails.dateOfBirth
      ? playerDetails.dateOfBirth.toISOString().split("T")[0]
      : "N/A",
    1
  );
  addTableRow("Address", playerDetails.address || "N/A", 2);
  addTableRow("Phone", playerDetails.phoneNumber || "N/A", 3);
  addTableRow("Email", playerDetails.userID.email || "N/A", 4); // Using the user's email from userID
  addTableRow("Username", playerDetails.userID.userName || "N/A", 5); // Using the user's username from userID

  doc
    .moveTo(tableLeft + colWidth, tableTop)
    .lineTo(tableLeft + colWidth, tableTop + 6 * rowHeight)
    .stroke();

  // Assessment Result with proper color coding
  let resultColor = "#000000"; // Default color for unknown results
  if (assessmentResult === "Healthy") {
    resultColor = "#00A86B"; // Green for Healthy
  } else if (
    assessmentResult === "Partial ACL Tear" ||
    assessmentResult === "Partially Injured"
  ) {
    resultColor = "#FFA500"; // Yellow for Partial Tear
  } else if (
    assessmentResult === "Complete Tear" ||
    assessmentResult === "ACL Tear"
  ) {
    resultColor = "#FF0000"; // Red for Complete Tear or ACL Tear
  }

  doc
    .moveDown(2)
    .fontSize(16)
    .fillColor("#000000")
    .text("ASSESSMENT RESULT:", 50, 340)
    .moveDown(0.5)
    .fillColor(resultColor) // Apply color based on the result
    .text(assessmentResult.toUpperCase(), 250, 340);

  // Legend
  const legendY = 400;
  doc.fontSize(12).fillColor("#000000");
  ["Healthy", "Partial Tear", "Complete Tear"].forEach((label, index) => {
    const color = ["#00A86B", "#FFA500", "#FF0000"][index];
    doc.rect(50, legendY + index * 25, 15, 15).fill(color);
    doc.text(label, 70, legendY + index * 25 + 2);
  });

  // Pie Chart
  const chartImage = await generatePieChart(assessmentResult);
  doc.image(chartImage, 150, 450, { width: 250, height: 250 });

  // Disclaimer
  doc
    .moveDown(2)
    .fontSize(10)
    .fillColor("#000000")
    .text(
      "Disclaimer: These results are only for reference. Please consult a doctor.",
      50,
      750,
      { align: "center" }
    );

  doc.end();
  return pdfFileName;
};

export default generatePDFReport;

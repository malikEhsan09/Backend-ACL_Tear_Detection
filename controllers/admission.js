import Admission from "../models/admission.model.js";
import Student from "../models/player.model.js";

// Create a new admission form
export const submitAdmissionForm = async (req, res) => {
  try {
    // Extract all fields from the request body
    const formData = req.body;

    // Create a new admission instance using the Admission schema
    const newAdmission = new Admission(formData);

    // Save the admission form data to the database
    await newAdmission.save();

    // Send a success response
    res.status(201).json({ message: "Admission form submitted successfully" });
  } catch (error) {
    // Handle errors and send an error response
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all admission forms
export const getAllAdmissions = async (req, res) => {
  try {
    // Fetch admissions where 'isDeleted' is either false or not set
    const admissions = await Admission.find({
      $or: [
        { isDeleted: { $ne: true } }, // Exclude documents where isDeleted is true
        { isDeleted: { $exists: false } }, // Include documents where isDeleted field does not exist
      ],
    });
    res.status(200).json(admissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Fetch admissions where 'isDeleted' is true
export const getDeletedAdmissions = async (req, res) => {
  try {
    const admissions = await Admission.find({ isDeleted: true });
    res.status(200).json(admissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get a specific admission form by ID
export const getAdmissionById = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);
    if (!admission) {
      return res.status(404).json({ message: "Admission not found" });
    }
    res.status(200).json(admission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update a specific admission form by ID
export const updateAdmissionById = async (req, res) => {
  try {
    const admission = await Admission.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!admission) {
      return res.status(404).json({ message: "Admission not found" });
    }

    res.status(200).json(admission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a specific admission form by ID
export const deleteAdmissionById = async (req, res) => {
  try {
    // Find the admission document by ID
    const admission = await Admission.findById(req.params.id);

    if (!admission) {
      return res.status(404).json({ message: "Admission not found" });
    }

    // Check if the admission document has the isDeleted field
    if (!admission.isDeleted) {
      // If isDeleted field doesn't exist, create one and set it to true
      admission.isDeleted = true;
      await admission.save();
    } else {
      // If isDeleted field exists, update it to true
      admission.isDeleted = true;
      await admission.save();
    }

    // Admission "soft deleted" successfully, sending a status code 200 with a message
    res.status(200).json({ message: 'Admission "soft deleted" successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// recover admission by id
export const recoverAdmissionById = async (req, res) => {
  try {
    // Find the admission document by ID
    const admission = await Admission.findById(req.params.id);

    if (!admission) {
      return res.status(404).json({ message: "Admission not found" });
    }

    // Check if the admission document has the isDeleted field
    if (admission.isDeleted) {
      // If isDeleted field is true, set it to false
      admission.isDeleted = false;
      await admission.save();
    } else {
      // If isDeleted field is already false, return a message indicating it's already recovered
      return res
        .status(400)
        .json({ message: "Admission is already recovered" });
    }

    // Admission recovered successfully, sending a status code 200 with a message
    res.status(200).json({ message: "Admission recovered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete multiple admission forms by IDs
export const deleteAdmissionsByIds = async (req, res) => {
  try {
    const admissionIds = req.body.ids;

    // Validate if admissionIds is an array and not empty
    if (!Array.isArray(admissionIds) || admissionIds.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid admission IDs provided" });
    }

    const deletedAdmissions = await Admission.deleteMany({
      _id: { $in: admissionIds },
    });

    // Check if any admission forms were deleted
    if (deletedAdmissions.deletedCount === 0) {
      return res.status(404).json({ message: "Admissions not found" });
    }

    // Admission forms deleted successfully, and sending a status code 200 with a message
    res.status(200).json({ message: "Admissions deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all admission forms with status "Enrolled"
export const getEnrolledAdmissions = async (req, res) => {
  try {
    const enrolledAdmissions = await Admission.find({ status: "Enrolled" });
    res.status(200).json(enrolledAdmissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const moveAdmissionToStudent = async (req, res) => {
  try {
    // Find the admission by ID
    const admission = await Admission.findById(req.params.id);

    if (!admission) {
      return res.status(404).json({ message: "Admission not found" });
    }

    // Extract values from admission
    const {
      name,
      prevSchool,
      grade,
      dob,
      fname,
      fcnic,
      fcell,
      femail,
      foccupation,
      mname,
      moccupation,
      mcell,
      address,
      others,
    } = admission;

    // Create a new student using extracted values
    const student = new Student({
      personalInfo: {
        name,
        prevSchool,
        dateOfBirth: dob,
        address,
        contactInfo: {
          email: femail,
          phone: fcell,
        },
      },
      guardianInfo: {
        guardianName: fname,
        guardianOccupation: foccupation,
        guardianContact: {
          phone: fcell,
          email: femail,
        },
      },
      classInfo: {
        className: grade,
      },
    });

    // Save the new student
    await student.save();

    // Update the admission status
    admission.status = "Enrolled";
    await admission.save();

    // Optionally, you may want to delete the admission from the Admission collection
    // await Admission.findByIdAndDelete(req.params.id);

    res
      .status(200)
      .json({ message: "Admission moved to student successfully", student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete all admissions with status "Enrolled"
export const deleteEnrolledAdmissions = async (req, res) => {
  try {
    const deletedAdmissions = await Admission.deleteMany({
      status: "Enrolled",
    });

    // Check if any admission forms were deleted
    if (deletedAdmissions.deletedCount === 0) {
      return res.status(404).json({ message: "No enrolled admissions found" });
    }

    // Admissions deleted successfully, and sending a status code 200 with a message
    res
      .status(200)
      .json({ message: "Enrolled admissions deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete all admissions with status "Waiting"
export const deleteWaitingAdmissions = async (req, res) => {
  try {
    // Update admissions where status is 'Waiting' by setting 'isDeleted' to true
    const updatedAdmissions = await Admission.updateMany(
      { status: "Waiting" },
      { $set: { isDeleted: true } },
      { multi: true } // This option ensures that the query will update all documents that match the condition
    );

    // Check if any admission forms were updated
    if (updatedAdmissions.matchedCount === 0) {
      return res.status(404).json({ message: "No waiting admissions found" });
    }

    // Admissions marked as deleted successfully, and sending a status code 200 with a message
    res
      .status(200)
      .json({ message: "Waiting admissions marked as deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Transfer All students from admission collection to student

export const transferAndAssignSections = async (req, res, next) => {
  try {
    const enrolledStudents = await Admission.find({
      status: "Enrolled",
      $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
    }).sort("createdAt");

    const sectionsForGrade = ["Red", "Green", "Blue", "Yellow"];
    const sectionsForOthers = ["Dove", "Swan", "Dolphin"];

    const latestStudent = await Student.findOne().sort({
      "classInfo.admissionNumber": -1,
    });
    let lastAdmissionNumber = latestStudent
      ? parseInt(latestStudent.classInfo.admissionNumber)
      : 1000;
    const currentYear = new Date().getFullYear();

    let sectionCount =
      (await Student.countDocuments({
        "classInfo.section": sectionsForOthers[0],
      })) % 25;
    const transferredStudents = [];
    for (let i = 0; i < enrolledStudents.length; i++) {
      const student = enrolledStudents[i];
      let sections =
        student.grade && student.grade.includes("Grade")
          ? sectionsForGrade
          : sectionsForOthers;
      const sectionIndex = Math.floor(sectionCount / 25) % sections.length;
      const newStudent = new Student({
        feeID: student.feeID || " ",
        personalInfo: {
          name: student.name || " ",
          prevSchool: student.prevSchool || " ",
          dateOfBirth: student.dob || " ",
          address: student.address || " ",
          gender: student.gender || " ",
          nationality: student.sNationality || " ",
        },
        classInfo: {
          className: student.grade || " ",
          section: sections[sectionIndex],
          admissionNumber: `${++lastAdmissionNumber}`,
          academicYear: `${currentYear}`,
        },
        guardianInfo: {
          guardianName: {
            motherName: student.mname || " ",
            fatherName: student.fname || " ",
          },
          guardianOccupation: {
            fatherOcc: student.foccupation || " ",
            motherOcc: student.moccupation || " ",
            motherCom: student.mcompany || " ",
            fatherCom: student.fcompany || " ",
          },
          guardianContact: {
            fatherCell: student.fcell || " ",
            motherCell: student.mcell || " ",
            fatherCNIC: student.fcnic || " ",
            fatherEmail: student.femail || " ",
            fatherNationality: student.fnationality || " ",
          },
          otherInfo: {
            flang: student.flang || " ",
            olang: student.olang || " ",
          },
        },
        interestIn: {
          sports: student.selectedSports || [],
          clubs: student.selectedClubs || [],
        },
        siblings: {
          siblingOne: student.siblings?.siblingOne
            ? {
                name: student.siblings.siblingOne.name || "N/A",
                grade: student.siblings.siblingOne.grade || "N/A",
                section: student.siblings.siblingOne.section || "N/A",
              }
            : {},
          siblingTwo: student.siblings?.siblingTwo
            ? {
                name: student.siblings.siblingTwo.name || "N/A",
                grade: student.siblings.siblingTwo.grade || "N/A",
                section: student.siblings.siblingTwo.section || "N/A",
              }
            : {},
          siblingThree: student.siblings?.siblingThree
            ? {
                name: student.siblings.siblingThree.name || "N/A",
                grade: student.siblings.siblingThree.grade || "N/A",
                section: student.siblings.siblingThree.section || "N/A",
              }
            : {},
          siblingFour: student.siblings?.siblingFour
            ? {
                name: student.siblings.siblingFour.name || "N/A",
                grade: student.siblings.siblingFour.grade || "N/A",
                section: student.siblings.siblingFour.section || "N/A",
              }
            : {},
        },
        medicalHistory: {
          allergies: student.medicalHistory.allergies || "N/A",
          asthma: student.medicalHistory.asthma || "N/A",
          speechDefect: student.medicalHistory.speechDefect || "N/A",
          visionProblem: student.medicalHistory.visionProblem || "N/A",
          hearingProblem: student.medicalHistory.hearingProblem || "N/A",
          learningProblem: student.medicalHistory.learningProblem || "N/A",
          compulsiveDisorder:
            student.medicalHistory.compulsiveDisorder || "N/A",
          meditation: student.medicalHistory.meditation || "N/A",
          otherCondition: student.medicalHistory.otherCondition || "N/A",
        },
      });

      await newStudent.save();
      transferredStudents.push(newStudent);
      sectionCount++;

      await Admission.findByIdAndUpdate(student._id, { isDeleted: true });
    }

    res.status(200).json({
      message: "Students transferred and assigned to sections successfully",
      transferredStudents,
    });
  } catch (err) {
    res.status(500).json({
      message: "An error occurred while transferring students",
      error: err.message,
    });
  }
};

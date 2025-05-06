import aclRehab from "../models/aclRehab.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";

export const getExercisesBasedOnInjury = async (req, res) => {
  try {
    const { injuryType } = req.params;
    const exercises = await aclRehab.find({
      injuryType,
    });

    // check to find the exerciss
    if (!exercises) {
      res.status(400).json({ msg: "Exercises not found " });
    }

    res.status(200).json(exercises);
  } catch (error) {
    res.status(500).json({ message: "Error fetching exercises" });
  }
};

// Admin can uplaod this
export const uploadAclRehabExercises = async (req, res) => {
  const { title, description, steps, injuryType, createdBy } = req.body;

  try {
    // Validate input
    if (!title || !description || !steps || !injuryType) {
      return res.status(400).json({
        msg: "All fields are required",
      });
    }

    let imageUrl = null;
    if (req.file) {
      const result = await uploadCloudinary(req.file.path, {
        resource_type: "image",
      });
      imageUrl = result.secure_url;
    }

    const newRehabExercise = new aclRehab({
      title,
      description,
      imageSrc: imageUrl,
      steps: JSON.parse(steps),
      injuryType,
    });

    // check
    if (!newRehabExercise) {
      return res.status(400).json({
        msg: "Invalid exercise description or exercise type or any of the data you provide",
      });
    }

    let newExercise = await newRehabExercise.save();
    res.status(201).json({
      message: "New ACL Rehab Exercise added successfully",
      newExercise,
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding exercise" });
  }
};

export const getAllRehabExercisesForAdmin = async (req, res) => {
  try {
    const exercises = await aclRehab.find();
    if (!exercises) {
      return res.status(404).json({ msg: "No exercises found" });
    }
    res.status(200).json(exercises);
  } catch (error) {
    res.status(500).json({ message: "Error fetching exercises" });
  }
};

// Update an existing exercise
export const updateAclRehabExercise = async (req, res) => {
  const { id } = req.params;
  const { title, description, steps, injuryType } = req.body;

  try {
    let exercise = await aclRehab.findById(id);

    if (!exercise) {
      return res.status(404).json({ msg: "Exercise not found" });
    }

    let imageUrl = exercise.imageSrc; // Retain existing image if not updated

    if (req.file) {
      const result = await uploadCloudinary(req.file.path, {
        resource_type: "image",
      });
      imageUrl = result.secure_url;
    }

    exercise.title = title || exercise.title;
    exercise.description = description || exercise.description;
    exercise.steps = steps ? JSON.parse(steps) : exercise.steps;
    exercise.injuryType = injuryType || exercise.injuryType;
    exercise.imageSrc = imageUrl;

    const updatedExercise = await exercise.save();

    res.status(200).json({
      message: "Exercise updated successfully",
      updatedExercise,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating exercise" });
  }
};

// Delete an existing exercise
export const deleteAclRehabExercise = async (req, res) => {
  const { id } = req.params;

  try {
    const exercise = await aclRehab.findById(id);

    if (!exercise) {
      return res.status(404).json({ msg: "Exercise not found" });
    }

    await exercise.remove();

    res.status(200).json({ message: "Exercise deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting exercise" });
  }
};

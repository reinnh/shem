import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVolunteer extends Document {
  fullName: string;
  phoneNumber: string;
  ward: string;
  pollingStation: string;
  status: "verified" | "active" | "flagged";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VolunteerSchema = new Schema<IVolunteer>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      index: true,
    },
    ward: {
      type: String,
      required: [true, "Ward is required"],
      enum: ["Koyonzo", "Mayoni", "Namamali"],
      index: true,
    },
    pollingStation: {
      type: String,
      required: [true, "Polling station is required"],
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["verified", "active", "flagged"],
      default: "active",
      index: true,
    },
    notes: {
      type: String,
      maxlength: 500,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique volunteer per ward/station + phone prevention if needed
VolunteerSchema.index({ phoneNumber: 1, ward: 1 });
VolunteerSchema.index({ createdAt: -1 });

export const VolunteerModel: Model<IVolunteer> =
  mongoose.models.Volunteer ||
  mongoose.model<IVolunteer>("Volunteer", VolunteerSchema);

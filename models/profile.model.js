import mongoose from "mongoose";
const UUID_V7_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const profileSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: (value) => UUID_V7_REGEX.test(value),
            message: "id must be a valid UUID v7",
        },
    },
    name: { type: String, required: true },
    gender: {
        type: String,
        required: true,
        enum: ["male", "female"],
    },
    gender_probability: { type: Number, required: true, min: 0, max: 1 },
    age: {
        type: Number,
        required: true,
        validate: {
            validator: Number.isInteger,
            message: "age must be an integer",
        },
    },
    age_group: { type: String, required: true, enum: ["child", "teenager", "adult", "senior"] },
    country_id: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        minlength: 2,
        maxlength: 2,
        match: [/^[A-Z]{2}$/, "country_id must be a 2-letter ISO code"],
    },
    country_name: { type: String, required: true },
    country_probability: { type: Number, required: true, min: 0, max: 1 },
    created_at: {
        type: Date,
        default: Date.now,
    },
});
profileSchema.index({ id: 1 }, { unique: true });
profileSchema.index({ name: 1 }, { unique: true });
profileSchema.index({ gender: 1 });
profileSchema.index({ age_group: 1 });
profileSchema.index({ country_id: 1 });
profileSchema.index({ age: 1 });
profileSchema.index({ gender_probability: 1 });
profileSchema.index({ country_probability: 1 });
profileSchema.index({ created_at: -1 });
const Profile = mongoose.model("Profile", profileSchema);
export default Profile;

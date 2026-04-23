import Profile from "../models/profile.model.js";
const getProfiles = async (req, res) => {
    try {
        const { gender, age_group, country_id, min_age, max_age, min_gender_probability, min_country_probability, sort_by, order, page, limit, } = req.query;
        // STEP 1: Build filter object for database query
        const filter = {};
        if (gender !== undefined) {
            if (typeof gender !== "string" || !["male", "female"].includes(gender)) {
                return res.status(422).json({ status: "error", message: "Invalid query parameters" });
            }
            filter.gender = gender;
        }
        if (age_group !== undefined) {
            if (typeof age_group !== "string" ||
                !["child", "teenager", "adult", "senior"].includes(age_group)) {
                return res.status(422).json({ status: "error", message: "Invalid query parameters" });
            }
            filter.age_group = age_group;
        }
        if (country_id !== undefined) {
            if (typeof country_id !== "string" || !/^[a-zA-Z]{2}$/.test(country_id)) {
                return res.status(422).json({ status: "error", message: "Invalid query parameters" });
            }
            filter.country_id = country_id.toUpperCase();
        }
        if (min_age !== undefined || max_age !== undefined) {
            filter.age = {};
            if (min_age !== undefined) {
                const minAgeNumber = Number(min_age);
                if (!Number.isFinite(minAgeNumber)) {
                    return res.status(422).json({ status: "error", message: "Invalid query parameters" });
                }
                filter.age.$gte = minAgeNumber;
            }
            if (max_age !== undefined) {
                const maxAgeNumber = Number(max_age);
                if (!Number.isFinite(maxAgeNumber)) {
                    return res.status(422).json({ status: "error", message: "Invalid query parameters" });
                }
                filter.age.$lte = maxAgeNumber;
            }
            if (filter.age.$gte !== undefined &&
                filter.age.$lte !== undefined &&
                filter.age.$gte > filter.age.$lte) {
                return res.status(422).json({ status: "error", message: "Invalid query parameters" });
            }
        }
        if (min_gender_probability !== undefined) {
            const minGenderProbability = Number(min_gender_probability);
            if (!Number.isFinite(minGenderProbability)) {
                return res.status(422).json({ status: "error", message: "Invalid query parameters" });
            }
            filter.gender_probability = { $gte: minGenderProbability };
        }
        if (min_country_probability !== undefined) {
            const minCountryProbability = Number(min_country_probability);
            if (!Number.isFinite(minCountryProbability)) {
                return res.status(422).json({ status: "error", message: "Invalid query parameters" });
            }
            filter.country_probability = { $gte: minCountryProbability };
        }
        // STEP 2: Build sort object
        // sortObj will look like { age: 1 } or { created_at: -1 }
        // 1 = ascending, -1 = descending
        const sortObj = {};
        const validSortFields = ["age", "created_at", "gender_probability"];
        if (sort_by !== undefined || order !== undefined) {
            // If user provides either sort_by or order, both must be provided
            if (sort_by === undefined || order === undefined) {
                return res.status(422).json({ status: "error", message: "Invalid query parameters" });
            }
            if (!validSortFields.includes(sort_by)) {
                return res.status(422).json({ status: "error", message: "Invalid query parameters" });
            }
            if (order !== "asc" && order !== "desc") {
                return res.status(422).json({ status: "error", message: "Invalid query parameters" });
            }
            sortObj[sort_by] = order === "asc" ? 1 : -1;
        }
        // STEP 3: Parse and validate pagination parameters
        // Default: page=1, limit=10, max_limit=50
        let pageNumber = 1;
        let pageLimit = 10;
        if (page !== undefined) {
            const parsedPage = Number(page);
            if (!Number.isFinite(parsedPage) || parsedPage < 1) {
                return res.status(422).json({ status: "error", message: "Invalid query parameters" });
            }
            pageNumber = parsedPage;
        }
        if (limit !== undefined) {
            const parsedLimit = Number(limit);
            if (!Number.isFinite(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
                return res.status(422).json({ status: "error", message: "Invalid query parameters" });
            }
            pageLimit = parsedLimit;
        }
        // STEP 4: Calculate skip for database query
        // skip tells Mongo how many documents to skip before returning results
        // Example: page=2, limit=10 means skip 10 documents (show page 2)
        const skip = (pageNumber - 1) * pageLimit;
        // STEP 5: Query database
        // countDocuments = total count of matching records (for "total" field)
        // find = get the filtered data
        // sort = apply sorting
        // skip = skip the first N records
        // limit = return only N records
        const total = await Profile.countDocuments(filter);
        const profiles = await Profile.find(filter).sort(sortObj).skip(skip).limit(pageLimit);
        return res.status(200).json({
            status: "success",
            page: pageNumber,
            limit: pageLimit,
            total,
            data: profiles,
        });
    }
    catch (error) {
        return res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
export { getProfiles };

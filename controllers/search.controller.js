import Profile from "../models/profile.model.js";
// Country name to ISO code mapping
const countryMap = {
    nigeria: "NG",
    ng: "NG",
    angola: "AO",
    ao: "AO",
    kenya: "KE",
    ke: "KE",
    tanzania: "TZ",
    tz: "TZ",
    uganda: "UG",
    ug: "UG",
    sudan: "SD",
    sd: "SD",
};
// Parse natural language query into filters
const parseNaturalLanguageQuery = (queryString) => {
    const query = queryString.toLowerCase().trim();
    const filter = {};
    // Parse gender (male/female)
    if (query.includes("male") && !query.includes("female")) {
        filter.gender = "male";
    }
    else if (query.includes("female")) {
        filter.gender = "female";
    }
    // Parse age groups
    if (query.includes("teenager") || query.includes("teenagers")) {
        filter.age_group = "teenager";
    }
    else if (query.includes("adult") || query.includes("adults")) {
        filter.age_group = "adult";
    }
    else if (query.includes("child") || query.includes("children")) {
        filter.age_group = "child";
    }
    else if (query.includes("senior") || query.includes("seniors")) {
        filter.age_group = "senior";
    }
    // Parse age ranges
    // "young" = 16-24
    if (query.includes("young")) {
        filter.age = { $gte: 16, $lte: 24 };
    }
    // "above X", "over X", "X+" patterns
    const aboveMatch = query.match(/above\s+(\d+)|over\s+(\d+)|(\d+)\+/);
    if (aboveMatch) {
        const ageValue = aboveMatch[1] || aboveMatch[2] || aboveMatch[3];
        if (ageValue) {
            const minAge = Number(ageValue);
            if (!filter.age) {
                filter.age = {};
            }
            filter.age.$gte = minAge;
        }
    }
    // "below X", "under X" patterns
    const belowMatch = query.match(/below\s+(\d+)|under\s+(\d+)/);
    if (belowMatch) {
        const ageValue = belowMatch[1] || belowMatch[2];
        if (ageValue) {
            const maxAge = Number(ageValue);
            if (!filter.age) {
                filter.age = {};
            }
            filter.age.$lte = maxAge;
        }
    }
    // Parse country
    for (const [countryName, countryCode] of Object.entries(countryMap)) {
        if (query.includes(countryName)) {
            filter.country_id = countryCode;
            break;
        }
    }
    return filter;
};
const searchProfiles = async (req, res) => {
    try {
        const { q, page, limit } = req.query;
        // Validate query parameter exists
        if (q === undefined || typeof q !== "string" || q.trim() === "") {
            return res.status(400).json({ status: "error", message: "Missing or empty parameter" });
        }
        // Parse the natural language query
        const filter = parseNaturalLanguageQuery(q);
        // If no valid filters were extracted, return error
        if (Object.keys(filter).length === 0) {
            return res.status(200).json({
                status: "error",
                message: "Unable to interpret query",
            });
        }
        // Parse pagination
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
        // Calculate skip
        const skip = (pageNumber - 1) * pageLimit;
        // Query database
        const total = await Profile.countDocuments(filter);
        const profiles = await Profile.find(filter).skip(skip).limit(pageLimit);
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
export { searchProfiles };

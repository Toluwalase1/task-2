import express from 'express';
import { getProfiles } from "../controllers/profile.controller.js";
import { searchProfiles } from "../controllers/search.controller.js";
const Router = express.Router();
// GET /api/profiles - filtering, sorting, pagination
Router.get("/", getProfiles);
// GET /api/profiles/search - natural language search
Router.get("/search", searchProfiles);
export default Router;

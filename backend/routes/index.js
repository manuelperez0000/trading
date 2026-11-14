import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Welcomex to the backend API!" });
});

export default router;
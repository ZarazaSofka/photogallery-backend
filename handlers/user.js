import {
  read,
  register,
  authenticate,
  update,
  deleteUser,
} from "../services/user";
import { Router } from "express";
const router = Router();

router.get("/:userId", async (req, res) => {
  const user = await read(req.params.userId);
  if (user) {
    res.json(user);
  } else {
    res.sendStatus(404);
  }
});

router.post("/", async (req, res) => {
  const user = await register(req.body);
  res.json(user);
});

router.post("/auth", async (req, res) => {
  const user = await authenticate(req.body);
  if (user) {
    res.json(user);
  } else {
    res.sendStatus(401);
  }
});

router.put("/:userId", async (req, res) => {
  const user = await update(req.body);
  if (user) {
    res.json(user);
  } else {
    res.sendStatus(404);
  }
});

router.delete("/", async (req, res) => {
  const { admin, user } = req.query;
  const deleted = await deleteUser(admin, user);
  if (deleted) {
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

export default router;

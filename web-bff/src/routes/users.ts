import { Router, Request, Response } from "express";
import axios from "axios";
import { USER_SERVICE_URL } from "../config";

export const usersRouter = Router();

usersRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const { data } = await axios.get(`${USER_SERVICE_URL}/users`);
    return res.json(data);
  } catch (err: any) {
    return res.status(err.response?.status || 500).json(err.response?.data || { error: "Napaka" });
  }
});

usersRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const { data } = await axios.get(`${USER_SERVICE_URL}/users/${req.params.id}`);
    return res.json(data);
  } catch (err: any) {
    return res.status(err.response?.status || 404).json(err.response?.data || { error: "Ni najdeno" });
  }
});

usersRouter.put("/:id", async (req: Request, res: Response) => {
  try {
    const { data } = await axios.put(`${USER_SERVICE_URL}/users/${req.params.id}`, req.body);
    return res.json(data);
  } catch (err: any) {
    return res.status(err.response?.status || 500).json(err.response?.data || { error: "Napaka" });
  }
});

usersRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    await axios.delete(`${USER_SERVICE_URL}/users/${req.params.id}`);
    return res.status(204).send();
  } catch (err: any) {
    return res.status(err.response?.status || 500).json(err.response?.data || { error: "Napaka" });
  }
});

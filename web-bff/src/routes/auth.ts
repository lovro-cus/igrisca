import { Router, Request, Response } from "express";
import axios from "axios";
import { USER_SERVICE_URL } from "../config";

export const authRouter = Router();

authRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const { data } = await axios.post(`${USER_SERVICE_URL}/users/register`, req.body);
    return res.status(201).json(data);
  } catch (err: any) {
    return res.status(err.response?.status || 500).json(err.response?.data || { error: "Napaka pri registraciji" });
  }
});

authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { data } = await axios.post(`${USER_SERVICE_URL}/users/login`, req.body);
    return res.json(data);
  } catch (err: any) {
    return res.status(err.response?.status || 401).json(err.response?.data || { error: "Napaka pri prijavi" });
  }
});

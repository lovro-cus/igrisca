import express from "express";
import { authRouter } from "./routes/auth";
import { bookingsRouter } from "./routes/bookings";
import { usersRouter } from "./routes/users";

export const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", gateway: "web-bff" });
});

app.use("/api/auth", authRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/users", usersRouter);

if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`Web BFF running on port ${PORT}`));
}

import express, { json } from "express";
import bodyParser from "body-parser";
import { handleWebhook } from "./handleWebhook";

const app = express();

app.use(json({ limit: "2mb" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/webhook", handleWebhook);

app.use("/", (req: any, res: any) => {
  return res.send("Welcome to My Auto Trader");
});

// errors & edge cases
app.use((err: any, req: any, res: any, _: any) => {
  res.status(err.status || 500);
  res.json({
    err: {
      message: err.message,
    },
  });
});

app.use((req, res, next) => {
  const error = new Error("Route Not Found");
  error.message = "404";
  next(error);
  return res.status(404).send({
    message: "Route Not Found",
  });
});

export default app;

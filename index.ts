require("dotenv").config();
import express, { Request, Response } from "express";
import * as crypto from "crypto";

const app = express();
app.use(express.json());
app.post("/webhook", (req: Request, res: Response) => {
  const signature = req.header("x-icr-signature-256");
  const verified = verify_signature(signature ?? "", req.body);
  if (!verified) return res.status(403).send("Forbidden");
  res.status(202).send("Accepted");

  console.log("SIGNATURE:", signature);
  console.log("EVENT:", req.body.event);
  console.log("Installation:", req.body.installation);
  console.log("Organization:", req.body.installation.organization);
  console.log("Sender:", req.body.sender);
});

const verify_signature = (signature: string, body: unknown) => {
  const signatureCheck = crypto
    .createHmac("sha256", process.env.WEBHOOK_SECRET ?? "")
    .update(JSON.stringify(body))
    .digest("hex");
  const trusted = Buffer.from(`sha256=${signatureCheck}`, "ascii");
  const untrusted = Buffer.from(signature, "ascii");
  try {
    return crypto.timingSafeEqual(trusted, untrusted);
  } catch (error) {
    return false;
  }
};

app.listen(4040, () => {
  console.log("Server is listening on port 4040");
});

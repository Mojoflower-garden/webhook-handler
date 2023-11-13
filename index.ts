import express, { Request, Response } from "express";

const app = express();

app.post("/webhook", (req: Request, res: Response) => {
  // Handle webhook logic here
});

app.listen(4040, () => {
  console.log("Server is listening on port 4040");
});

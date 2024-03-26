require("dotenv").config();
import express, { Request, Response } from "express";
import * as crypto from "crypto";

const app = express();
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  console.log("GET /");
  res.send("Hello World");
});

app.post("/webhook", (req: Request, res: Response) => {
  const signature = req.header("x-icr-signature-256");
  const signedData = req.body.signedData;
  const verified = verify_signature(signature ?? "", signedData ?? "");

  if (!verified) return res.status(403).send("Forbidden");
  res.status(202).send("Accepted");

  console.log("SIGNATURE:", signature);
  console.log("EVENT:", req.body.event);
  console.log("Installation:", req.body.installation);
  console.log("Organization:", req.body.installation.organization);
  console.log("Sender:", req.body.sender);

  const signedDataDecoded = Buffer.from(signedData ?? "", "base64").toString();
  const signedPayload = JSON.parse(signedDataDecoded);
  console.log("Signed Payload:", signedPayload);
});

const verify_signature = (signature: string, signedData: string) => {
  const signatureCheck = crypto
    .createHmac("sha256", process.env.WEBHOOK_SECRET ?? "")
    .update(signedData)
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

// const test = async () => {
//   const body = {
//     event: "uninstalled",
//     sender: {
//       id: "289a98f7-5317-4e62-bbdf-029331b4312b",
//       url: "undefined/users/289a98f7-5317-4e62-bbdf-029331b4312b",
//       email: "isabel.ordas@climatetrade.com",
//       fullName: "Isabel Ordás",
//       profilePicture: null,
//     },
//     installation: {
//       id: "88f89df1-0a53-41c5-974d-dd99708b2f9f",
//       appId: "d23967cc-dd16-452b-8af4-869965745978",
//       appNameId: "climatetrade-connector",
//       createdAt: "2024-03-26T08:47:15.356Z",
//       updatedAt: "2024-03-26T08:47:15.356Z",
//       permissions: { organization_info: "VIEW" },
//       organization: {
//         id: "e3f779a2-b502-492a-a74c-599723f24c81",
//         url: "undefined/organizations/e3f779a2-b502-492a-a74c-599723f24c81",
//         zip: "",
//         city: "",
//         logo: "https://mojo-development.fra1.digitaloceanspaces.com/users/289a98f7-5317-4e62-bbdf-029331b4312b/files/1710412716100undefined",
//         type: "projectDeveloper",
//         website: "",
//         fullName: "MyFavouriteProjectDeveloper",
//         isPublic: true,
//         createdAt: "2024-03-14T10:38:35.501Z",
//         updatedAt: "2024-03-14T10:38:35.501Z",
//         countryCode: "CR",
//         physicalAddress: "",
//         registrationNumber: "",
//         organizationIndustries: null,
//       },
//       accessTokensUrl:
//         "undefined/app/installations/88f89df1-0a53-41c5-974d-dd99708b2f9f/accessTokens",
//     },
//   };
//   const m = verify_signature(
//     "sha256=9cefa17b131bd5a3427d90dde00dada26ac6ee778f6aa514177afc4296737fbc",
//     body
//   );

//   console.log(m);
// };
// test();

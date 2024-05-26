import "dotenv/config";
import express from "express";
import cors from "cors";

import { connectDB } from "./config/db";
import routes from "./routes/index.routes";


const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN!);
  res.header("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());



//SERVERLESS
// routes(app);

// const initializeApp = async () => {
//   try {
//     await connectDB();
//   } catch (error) {
//     console.log(error);
//     process.exit(1);
//   }
// };

// initializeApp();

// export default app;
//SERVERLESS


//SERVER
app.listen(process.env.PORT, async () => {
  try {
    await connectDB();
    routes(app);
    console.log(`Server Running on ${process.env.PORT}`);
  } catch (error) {
    console.log(error);
  }
});
//SERVER


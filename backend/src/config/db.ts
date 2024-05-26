import { connect } from "mongoose";


//SERVERLESS
// export const connectDB = async () => {
//   try {
//     await connect(process.env.MONGO_URL!, {
//       maxPoolSize: 10,
//     });
//     console.log("MongoDB connected");
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// };
//SERVERLESS

//SERVER
export const connectDB = async () => {
  try {
    await connect(process.env.MONGO_URL!);
  } catch (error) {
    console.log(error);
    throw error;
  }
};
//SERVER
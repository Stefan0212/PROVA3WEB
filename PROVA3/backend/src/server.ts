import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import connectDB  from "./config/database";

connectDB();

app.listen(process.env.PORT, () => {
  console.log("Servidor rodando na porta " + process.env.PORT);
});
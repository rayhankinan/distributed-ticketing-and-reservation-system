import { z } from "zod";

export const getToken = () => {
  const token = localStorage.getItem("token");
  const stringSchema = z.string();

  const parsedToken = stringSchema.safeParse(token);

  if (!parsedToken.success) {
    return "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI4MzZmNzk3Ni05NjE1LTRlZjctYmI0MS1lZWExYTcwYTY0MWUiLCJyb2xlIjoiVVNFUiJ9.xEokq-uYYmQZszZ9uHw2mumJVgGMApkByhdQ557o4wg";
  }
  return parsedToken.data;
};

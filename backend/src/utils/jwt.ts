import jwt from "jsonwebtoken";

const JWT_SECRET = (process.env.JWT_SECRET || "dev_secret") as any;

export const signToken = (payload: object, expiresIn = "7d") => {
  return jwt.sign(payload as any, JWT_SECRET as any, { expiresIn } as any);
};

export const verifyToken = (token: string) => {
  return jwt.verify(token as any, JWT_SECRET as any) as any;
};

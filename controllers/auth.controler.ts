import bcrypt from "bcrypt";
import prisma from "../lib/prisma";

import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    //hash the password
    const hashedpassword = await bcrypt.hash(password, 10);
    console.log(hashedpassword);

    //create a new user and save to database
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedpassword,
      },
    });

    console.log(newUser);

    res.status(201).json({ message: "User created succesfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to create user" });
  }
};
export const login = async (req, res) => {
  const { username, password } = req.body;

  //check if the user exists

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    //check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid credentials" });

    //generate a cookie token and send it to the user
    const age = 1000 * 60 * 60 * 24 * 7;
    const token = jwt.sign(
      {
        id: user.id,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: age }
    );
    res
      .cookie("token", token, {
        httpOnly: true,
        // secure: true,
        maxAge: age,
      })
      .status(200)
      .json({ message: "Login Succesful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to login" });
  }
};
export const logout = (req, res) => {};

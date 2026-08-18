"use server";

import { cookies } from "next/headers";
import { api } from "./api";
import { User } from "@nysc/types";

export const getUser = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  try {
    const response = await api.get<{ message: string; data: User }>("/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
};

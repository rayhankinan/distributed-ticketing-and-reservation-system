import { useAppSelector, useAppDispatch } from "@/redux/store";
import { useEffect } from "react";
import Router from "next/router";
import { logout } from "@/redux/slices/user";

export const useAuth = () => {
  const token = useAppSelector((state) => state.user.token);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!token) {
      Router.push("/");
    }
  }, [token]);

  const logOut = () => {
    dispatch(logout());
    Router.push("/");
  };

  return { logOut };
};

import { login } from "@/redux/slices/user";
import { RootState, useAppDispatch, useAppSelector } from "@/redux/store";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Input,
} from "@nextui-org/react";
import axios from "axios";
import Link from "next/link";

import Router from "next/router";
import { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

type LoginSchemaType = z.infer<typeof loginSchema>;

export default function Page() {
  const [isLoading, setIsLoading] = useState(false);

  const token = useAppSelector((state) => state.user.token);
  const dispatch = useAppDispatch();

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onLogin: SubmitHandler<LoginSchemaType> = async (data) => {
    try {
      setIsLoading(true);

      const res = await axios.post(
        `http://api.client-service.localhost/v1/client/login`,
        {
          username: data.username,
          password: data.password,
        }
      );
      const loginResponseSchema = z.object({
        token: z.string(),
      });
      const loginResponse = loginResponseSchema.parse(res.data);

      dispatch(login(loginResponse.token));

      toast.success("Berhasil masuk ke dalam sistem!", {
        duration: 2000,
      });

      Router.push("/");
    } catch (error) {
      console.log(error);
      toast.error("Gagal melakukan login.", { duration: 2000 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[1160px] mx-auto p-[1rem] min-h-screen flex items-center">
      <Card className="p-[1rem] w-full">
        <CardHeader className="flex flex-col gap-[0.5rem] items-start">
          <h1 className="font-bold text-[2rem]">
            Pemesanan Tiket Terdistribusi
          </h1>
          <p>Masuk ke dalam aplikasi untuk melakukan pemesanan tiket!</p>
        </CardHeader>
        <Divider className="my-[1rem]" />
        <CardBody>
          <div className="flex flex-col gap-[1rem]">
            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, value } }) => (
                <Input
                  type="text"
                  label="Username"
                  placeholder="johndoe"
                  value={value}
                  onValueChange={onChange}
                  className="w-full"
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Input
                  type="password"
                  label="Password"
                  value={value}
                  onValueChange={onChange}
                  className="w-full"
                />
              )}
            />
            <Button
              onClick={() => {
                handleSubmit(onLogin)();
              }}
              isDisabled={!isValid || isLoading}
              className="w-full"
            >
              Log in
            </Button>
          </div>
        </CardBody>
        <CardFooter>
          <p>
            Belum punya akun?{" "}
            <Link className="text-primary" href="/register">
              Buat akun
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

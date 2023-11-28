import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Divider, Button, CardFooter } from "@nextui-org/react";
import { Card, CardHeader, CardBody } from "@nextui-org/react";
import Link from "next/link";

import Router from "next/router";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

type LoginSchemaType = z.infer<typeof loginSchema>;

export default function Page() {
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const handleLogIn = () => {
    Router.push("/home");
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
                handleLogIn();
              }}
              isDisabled={!isValid}
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

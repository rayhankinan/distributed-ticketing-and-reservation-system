import { useAppSelector } from "@/redux/store";
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
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const registerSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

type RegisterSchemaType = z.infer<typeof registerSchema>;

export default function Page() {
  const [isLoading, setIsLoading] = useState(false);

  const token = useAppSelector((state) => state.user.token);

  useEffect(() => {
    if (token) {
      Router.push("/home");
    }
  }, [token]);

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const onRegister: SubmitHandler<RegisterSchemaType> = async (data) => {
    try {
      setIsLoading(true);

      await axios.post(`http://api.client-service.localhost/v1/client`, {
        username: data.username,
        password: data.password,
      });

      toast.success("Akun berhasil dibuat! Silakan melakukan login.", {
        duration: 2000,
      });

      Router.push("/");
    } catch (error) {
      console.log(error);
      toast.error("Akun gagal dibuat.", { duration: 2000 });
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
          <p>Buat akun terlebih dahulu untuk melakukan pemesanan tiket!</p>
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
                handleSubmit(onRegister)();
              }}
              isDisabled={!isValid || isLoading}
              className="w-full"
            >
              Buat akun
            </Button>
          </div>
        </CardBody>
        <CardFooter>
          <p>
            Sudah punya akun?{" "}
            <Link className="text-primary" href="/">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

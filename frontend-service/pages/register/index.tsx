import { Input, Divider, Button, CardFooter } from "@nextui-org/react";
import { Card, CardHeader, CardBody } from "@nextui-org/react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";

const registerSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

type RegisterSchemaType = z.infer<typeof registerSchema>;

export default function Page() {
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const onRegister: SubmitHandler<RegisterSchemaType> = (data) => {
    console.log(data);
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
              isDisabled={!isValid}
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

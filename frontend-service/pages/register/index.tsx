import { Input, Divider, Button, CardFooter } from "@nextui-org/react";
import { Card, CardHeader, CardBody } from "@nextui-org/react";
import Link from "next/link";

import Router from "next/router";

export default function Page() {
  const handleRegister = () => {
    Router.push("/home");
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
            <Input type="text" label="Username" placeholder="johndoe" />
            <Input type="password" label="Password" />
            <Button
              onClick={() => {
                handleRegister();
              }}
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

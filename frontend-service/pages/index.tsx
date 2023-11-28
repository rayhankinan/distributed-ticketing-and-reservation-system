import { Input, Divider, Button } from "@nextui-org/react";
import { Card, CardHeader, CardBody } from "@nextui-org/react";

import Router from "next/router";

export default function Page() {
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
            <Input type="text" label="Username" placeholder="johndoe" />
            <Input type="password" label="Password" />
            <Button
              onClick={() => {
                handleLogIn();
              }}
            >
              Log in
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

import { useAuth } from "@/hooks/use-auth";
import { Divider, Button, CardFooter } from "@nextui-org/react";
import { Card, CardHeader, CardBody } from "@nextui-org/react";
import Link from "next/link";

export default function Page() {
  const { logOut } = useAuth();

  return (
    <div className="max-w-[1160px] mx-auto p-[1rem] min-h-screen flex items-center">
      <Card className="p-[1rem] w-full">
        <CardHeader className="flex flex-col gap-[0.5rem] items-start">
          <h1 className="font-bold text-[2rem]">
            Pemesanan Tiket Terdistribusi
          </h1>
          <p>Apa yang ingin Anda lakukan?</p>
        </CardHeader>
        <Divider className="my-[1rem]" />
        <CardBody>
          <div className="flex flex-col gap-[1rem]">
            <Link href="/ticket" className="block">
              <Button className="w-full">Pesan tiket</Button>
            </Link>
            <Link href="/booking" className="block">
              <Button className="w-full">Lihat riwayat pemesanan</Button>
            </Link>
          </div>
        </CardBody>
        <Divider className="my-[1rem]" />
        <CardFooter>
          <Button onClick={() => logOut()}>Log out</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

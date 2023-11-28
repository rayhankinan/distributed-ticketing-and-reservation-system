import { Divider, Button, Card, CardBody, CardHeader } from "@nextui-org/react";
import { Select, SelectItem } from "@nextui-org/react";

const dummyEvents = [
  {
    id: 1,
    name: "Coldplay",
  },
  {
    id: 2,
    name: "YOASOBI",
  },
  {
    id: 3,
    name: "Eve",
  },
];

const dummySeats = [
  {
    id: 1,
    name: "A1",
  },
  {
    id: 2,
    name: "A2",
  },
  {
    id: 3,
    name: "A3",
  },
];

export default function Page() {
  return (
    <div className="max-w-[1160px] mx-auto p-[1rem] py-[2rem] min-h-screen flex items-center">
      <Card className="p-[1rem] w-full">
        <CardHeader>
          <div className="flex flex-col gap-[0.5rem]">
            <h1 className="font-bold text-[2rem]">
              Pemesanan Tiket Terdistribusi
            </h1>
            <p>
              Pilih suatu event, lalu pilih seat yang Anda inginkan untuk
              memesan tiket!
            </p>
          </div>
        </CardHeader>
        <Divider className="my-[1rem]" />
        <CardBody>
          <Select
            label="Pilih event"
            className="dark"
            classNames={{
              listboxWrapper: "dark",
              listbox: "dark",
              popoverContent: "dark",
            }}
          >
            {dummyEvents.map((e) => {
              return (
                <SelectItem
                  key={e.id}
                  value={e.id}
                  className="dark text-foreground"
                >
                  {e.name}
                </SelectItem>
              );
            })}
          </Select>
          <Divider className="my-[1rem]" />
          <Select
            label="Pilih seat"
            className="dark"
            classNames={{
              listboxWrapper: "dark",
              listbox: "dark",
              popoverContent: "dark",
            }}
          >
            {dummySeats.map((e) => {
              return (
                <SelectItem
                  key={e.id}
                  value={e.id}
                  className="dark text-foreground"
                >
                  {e.name}
                </SelectItem>
              );
            })}
          </Select>
          <Button className="mt-[1rem] w-full">Reservasi seat</Button>
        </CardBody>
      </Card>
    </div>
  );
}

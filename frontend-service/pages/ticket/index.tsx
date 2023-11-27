import { Divider, Button } from "@nextui-org/react";
import { Select, SelectItem } from "@nextui-org/react";
import Link from "next/link";

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

export default function Page() {
  return (
    <div className="max-w-[1160px] mx-auto p-[1rem] py-[2rem] min-h-screen">
      <div className="flex flex-col gap-[0.5rem]">
        <h1 className="font-bold text-[2rem]">Pemesanan Tiket Terdistribusi</h1>
        <p>
          Pilih suatu event, lalu pilih seat yang Anda inginkan untuk memesan
          tiket!
        </p>
      </div>
      <Divider className="mt-[1rem]" />
      <Select
        label="Pilih event"
        className=""
      >
        {dummyEvents.map((e) => {
          return (
            <SelectItem
              key={e.id}
              value={e.id}
              className=""
            >
              {e.name}
            </SelectItem>
          );
        })}
      </Select>
    </div>
  );
}

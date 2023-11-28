import { Divider, Button, Card, CardBody, CardHeader } from "@nextui-org/react";
import { Select, SelectItem } from "@nextui-org/react";
import { useEvents } from "@/hooks/use-events";
import { useSeats } from "@/hooks/use-seats";
import { useState, useEffect } from "react";
import { seatStatuses } from "@/constants";
import axios from "axios";
import { getToken } from "@/utils/getToken";
import { toast } from "sonner";

export default function Page() {
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedSeatId, setSelectedSeatId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { events } = useEvents();
  const { seats } = useSeats(selectedEventId);

  useEffect(() => {
    setSelectedSeatId("");
  }, [selectedEventId]);

  const onBookSeat = async () => {
    try {
      setIsLoading(true);

      await axios.post(
        `http://api.ticket-service.localhost/seat/reserve`,
        {
          id: selectedSeatId,
        },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      setSelectedSeatId("");
      setSelectedEventId("");

      toast.success("Berhasil melakukan booking seat!", { duration: 2000 });
    } catch (error) {
      toast.error("Gagal melakukan booking seat.", { duration: 2000 });
    } finally {
      setIsLoading(false);
    }
  };

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
            selectedKeys={[selectedEventId]}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            {events.map((e) => {
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
            isDisabled={!selectedEventId}
            placeholder={!selectedEventId ? "Pilih event terlebih dahulu" : ""}
            selectedKeys={[selectedSeatId]}
            onChange={(e) => setSelectedSeatId(e.target.value)}
          >
            {seats
              .filter((s) => s.status === seatStatuses.open)
              .map((s) => {
                return (
                  <SelectItem
                    key={s.id}
                    value={s.id}
                    className="dark text-foreground"
                  >
                    {s.name}
                  </SelectItem>
                );
              })}
          </Select>
          <Button
            className="mt-[1rem] w-full"
            isDisabled={!selectedEventId || !selectedSeatId || isLoading}
            onClick={() => onBookSeat()}
          >
            {isLoading ? "..." : "Reservasi seat"}
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}

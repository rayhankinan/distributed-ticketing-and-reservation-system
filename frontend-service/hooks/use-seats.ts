import useSWR from "swr";
import axios from "axios";
import { z } from "zod";
import { getToken } from "@/utils/getToken";

const seatSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  name: z.string(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

type Seat = z.infer<typeof seatSchema>;

type SeatResponse = {
  data: Seat[];
};

export const useSeats = (eventId: string) => {
  const fetcher = (url: string) =>
    axios
      .get<SeatResponse>(url, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      })
      .then((res) => res.data);

  const { data, error, isLoading } = useSWR(
    eventId
      ? `http://api.ticket-service.localhost/seat?eventId=${eventId}`
      : null,
    eventId ? fetcher : null
  );

  return {
    seats: data?.data ?? [],
    error,
    isLoading,
  };
};

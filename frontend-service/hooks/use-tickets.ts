import { TicketStatus } from "@/enum";
import { useAppSelector } from "@/redux/store";
import axios from "axios";
import useSWR from "swr";
import { z } from "zod";

const ticketSchema = z.object({
  ID: z.string().uuid(),
  UID: z.string().uuid(),
  SeatID: z.string().uuid(),
  Status: z.nativeEnum(TicketStatus),
  Link: z.string().url(),
});

type Ticket = z.infer<typeof ticketSchema>;

type TicketsResponse = {
  data: Ticket[];
};

export const useTickets = () => {
  const token = useAppSelector((state) => state.user.token);

  const fetcher = (url: string) =>
    axios
      .get<TicketsResponse>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => res.data);

  const { data, error, isLoading } = useSWR(
    `http://api.client-service.localhost/v1/ticket`,
    fetcher
  );

  return {
    tickets: data?.data ?? [],
    error,
    isLoading,
  };
};

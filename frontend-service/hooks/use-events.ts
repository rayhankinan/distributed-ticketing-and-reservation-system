import { useAppSelector } from "@/redux/store";
import axios from "axios";
import useSWR from "swr";
import { z } from "zod";

const eventSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  lineup: z.array(z.string()),
  description: z.string().nullable(),
  homepage: z.string().nullable(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

type Event = z.infer<typeof eventSchema>;

type EventResponse = {
  data: Event[];
};

export const useEvents = () => {
  const token = useAppSelector((state) => state.user.token);

  const fetcher = (url: string) =>
    axios
      .get<EventResponse>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => res.data);

  const { data, error, isLoading } = useSWR(
    `http://api.ticket-service.localhost/event`,
    fetcher
  );

  return {
    events: data?.data ?? [],
    error,
    isLoading,
  };
};

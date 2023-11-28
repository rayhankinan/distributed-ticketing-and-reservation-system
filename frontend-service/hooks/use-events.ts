import useSWR from "swr";
import axios from "axios";
import { z } from "zod";
import { getToken } from "@/utils/getToken";

const eventSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  lineup: z.array(z.string()),
  description: z.string().nullable(),
  homepage: z.string().nullable(),
  startTime: z.string(),
  endTime: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

type Event = z.infer<typeof eventSchema>;

type EventResponse = {
  data: Event[];
};

export const useEvents = () => {
  const fetcher = (url: string) =>
    axios
      .get<EventResponse>(url, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
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

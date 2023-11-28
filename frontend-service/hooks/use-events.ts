import useSWR from "swr";
import axios from "axios";
import { z } from "zod";

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
  const getToken = () => {
    const token = localStorage.getItem("token");
    const stringSchema = z.string();

    const parsedToken = stringSchema.safeParse(token);

    if (!parsedToken.success) {
      return "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI4MzZmNzk3Ni05NjE1LTRlZjctYmI0MS1lZWExYTcwYTY0MWUiLCJyb2xlIjoiQURNSU4ifQ.u5PjsxY_elsV1ULP-bzKUC8AAZDlUCkearPYCPujWfg";
    }
    return parsedToken.data;
  };

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

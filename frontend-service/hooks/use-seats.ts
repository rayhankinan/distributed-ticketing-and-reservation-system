import useSWR from "swr";
import axios from "axios";
import { z } from "zod";

/**
 *     "data": [
        {
            "id": "9847a9c7-8be0-492f-b546-12e5ca732b76",
            "eventId": "3b0a6c95-738d-4735-9351-9d8575c9771f",
            "name": "1A",
            "status": "BOOKED",
            "createdAt": "2023-11-27T11:24:19.120Z",
            "updatedAt": "2023-11-27T11:27:03.161Z"
        },
        {
            "id": "fb1411aa-99a5-4e02-86d5-d68046e8564c",
            "eventId": "3b0a6c95-738d-4735-9351-9d8575c9771f",
            "name": "1B",
            "status": "OPEN",
            "createdAt": "2023-11-27T11:24:22.985Z",
            "updatedAt": "2023-11-27T11:24:22.985Z"
        },
        {
            "id": "3a78daae-a516-497e-96eb-6f3297713dd5",
            "eventId": "3b0a6c95-738d-4735-9351-9d8575c9771f",
            "name": "1C",
            "status": "BOOKED",
            "createdAt": "2023-11-27T11:24:26.370Z",
            "updatedAt": "2023-11-27T11:34:41.327Z"
        },
        {
            "id": "cb99b2c9-0ec2-468f-98cb-2b74a28af17c",
            "eventId": "3b0a6c95-738d-4735-9351-9d8575c9771f",
            "name": "1D",
            "status": "OPEN",
            "createdAt": "2023-11-27T11:24:29.024Z",
            "updatedAt": "2023-11-27T11:24:29.024Z"
        }
    ],
 */

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

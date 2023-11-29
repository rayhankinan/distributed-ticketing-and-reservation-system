import { TicketStatus } from "@/enum";
import { useAuth } from "@/hooks/use-auth";
import { useTickets } from "@/hooks/use-tickets";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import axios from "axios";
import Link from "next/link";
import { toast } from "sonner";

export default function Page() {
  const { logOut, token } = useAuth();
  const { tickets } = useTickets();

  return (
    <div className="max-w-[1160px] mx-auto p-[1rem] min-h-screen flex items-center">
      <Card className="p-[1rem] w-full">
        <CardHeader className="flex flex-col gap-[0.5rem] items-start">
          <h1 className="font-bold text-[2rem]">
            Pemesanan Tiket Terdistribusi
          </h1>
          <p>Berikut adalah riwayat pemesanan yang pernah Anda lakukan.</p>
        </CardHeader>
        <Divider className="my-[1rem]" />
        <CardBody>
          <Table aria-label="Example static collection table">
            <TableHeader>
              <TableColumn>ID</TableColumn>
              <TableColumn>Status</TableColumn>
              <TableColumn>Tiket</TableColumn>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => {
                return (
                  <TableRow key={ticket.ID}>
                    <TableCell>{ticket.ID}</TableCell>
                    <TableCell>{ticket.Status}</TableCell>
                    <TableCell>
                      {ticket.Status === TicketStatus.SUCCESS && (
                        <div className="flex gap-[3rem] items-center">
                          <Link
                            href={ticket.Link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary"
                          >
                            Cetak tiket
                          </Link>
                          <Button
                            onClick={async () => {
                              try {
                                await axios.post(
                                  `http://api.client-service.localhost/v1/ticket/${ticket.ID}/refund`,
                                  {},
                                  {
                                    headers: {
                                      Authorization: `Bearer ${token}`,
                                    },
                                  }
                                );

                                toast.success("Tiket berhasil direfund!", {
                                  duration: 2000,
                                });
                              } catch (error) {
                                console.log(error);
                                toast.error("Tiket gagal direfund.", {
                                  duration: 2000,
                                });
                              }
                            }}
                          >
                            Refund tiket
                          </Button>
                        </div>
                      )}
                      {(ticket.Status === TicketStatus.FAILED ||
                        ticket.Status === TicketStatus.REFUNDED) && (
                        <Link
                          href={ticket.Link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary"
                        >
                          Periksa tiket
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardBody>
        <Divider className="my-[1rem]" />
        <CardFooter>
          <Button onClick={() => logOut()}>Log out</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

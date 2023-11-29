# Payment App

## API Docs

### HTTP APIs

#### Event/seat related

| HTTP Method | Endpoint               | Description    |
| ----------- | ---------------------- | -------------- |
| GET         | /event                 | Get all events |
| GET         | /seat?eventId=:eventId | Get seats      |
| POST        | /event                 | Create event   |
| POST        | /seat                  | Create seat    |
| PUT         | /event/:id             | Update event   |
| PUT         | /seat/:id              | Update seat    |
| DELETE      | /event/:id             | Delete event   |
| DELETE      | /seat/:id              | Delete seat    |

#### Booking related

| HTTP Method | Endpoint              | Description                    |
| ----------- | --------------------- | ------------------------------ |
| POST        | /seat/reserve         | Reserve seat                   |
| POST        | /seat/cancel          | Cancel reservation             |
| POST        | /seat/webhook-success | Webhook for successful payment |
| POST        | /seat/webhook-refund  | Webhook for failed payment     |
| POST        | /seat/webhook-failed  | Webhook for refunds            |

The body and header for all APIs can be seen in the Postman collection inside `ticket-service` folder.

## How To Start

From the root of this repository, run `docker-compose up`.

To run the migration, make sure `bun` is installed. Then, simply do `bun install` and `bun prisma migrate-dev`.

_Make sure the container for ticket database is up first!_

To run the seeding, make sure that the ticket-database container is already running, then simply do `bun seed`

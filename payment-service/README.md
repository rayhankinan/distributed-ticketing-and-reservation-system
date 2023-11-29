# Payment App

## API Docs

### HTTP APIs

| HTTP Method | Endpoint   | Description              |
| ----------- | ---------- | ------------------------ |
| POST        | /invoice   | Create payment request   |
| POST        | /refund    | Create refund request    |

Both API will expect a body of:
```
{
  "id": "<any-valid-uuid>"
}
```
where "id" is the seat ID to paid for.

## How To Start

From the root of this repository, run `docker-compose up`. You don't need to run any migration for this service.
# Payment App

## API Docs

### HTTP APIs

| HTTP Method | Endpoint | Description            |
| ----------- | -------- | ---------------------- |
| POST        | /invoice | Create payment request |
| POST        | /refund  | Create refund request  |

The body and header for all APIs can be seen in the Postman collection inside `payment-service` folder.

## How To Start

From the root of this repository, run `docker-compose up`. You don't need to run any migration for this service.

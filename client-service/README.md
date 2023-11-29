# Client App

## API Docs

### HTTP APIs

#### Client related

| HTTP Method | Endpoint | Description |
| ----------- | -------- | ----------- |
| GET | /v1/client | Get client based on ID |
| POST | /v1/client | Create client |
| POST | /v1/client/login | Log In Functionality |
| PATCH | /v1/client/:id | Update client |
| DELETE | /v1/client/:id | Delete client |

#### Ticket related
| HTTP Method | Endpoint | Description |
| ----------- | -------- | ----------- |
| GET | /v1/ticket | Get all ticket for an user |
| POST | /v1/ticket | Create ticket |
| POST | /v1/ticket/:id/refund | Refund a bought ticket |
| PATCH | /v1/ticket/:id | Update ticket |
| PATCH | /v1/ticket/webhook| Webhook for booking status |
| DELETE | /v1/ticket/:id | Delete ticket |

The body and header for all APIs can be seen in the Postman collection inside `client-service` folder.
## How To Start

From the root of this repository, run `docker-compose up`.

To run the migration, make sure `go` is installed. Then, simply do `make migrate-up`
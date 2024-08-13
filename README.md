# Sleep Tracker App

This is the Sleep Tracker application.

## Good to have

These are some possible improvements to the codebase/app:

- Improve UI/UX (Figma)
- Modularize code and prepare/write unit tests (Jest)
- Frontend e2e tests (Cypress, Playright)
- Add comments (inline documentation) and API documentation (OpenAPIv3, SwaggerUI)
- Better CI/CD pipeline and cloud infrastructure; Finding bottlenecks in the application that would affect its performance when trying scaling up.
- Integration with wearable devices, to collect rich data on the user's sleep cycle ([WearOS](https://developer.android.com/training/wearables), [WatchOS](https://developer.apple.com/watchos/))
- Add AI powered recommendations to improve user's sleep schedule ([example](https://link.springer.com/article/10.1007/s00521-023-09310-5))

## Run Locally

### Server

- Navigate to server application `cd /server` in terminal
- Install dependencies by running `npm i` in terminal
- Start the DB (Postgresql) container with `docker compose up`
- Create .env file and put the following definition for DB url
  ```js
  DATABASE_URL = "postgresql://root:root@localhost:5432/sleeper";
  ```
- Run `npx prisma migrate deploy` to apply DB migrations.
- Finally start the server with `npm run dev`

### Client

- Navigate to client application folder `cd /client`
- Install dependencies by running `npm i`
- Run `npm run dev` in terminal

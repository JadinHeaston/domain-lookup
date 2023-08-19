# Domain Query

Domain query is a simple tool meant to pull together several APIs  is meant to create a simple dashboard for the Tyler ESS dashboard and Tyler Executime clocking in/out system.

## Configuration

All configuration is done via the ```./backend/environment.json``` file.
Most values are left empty and are **required** before deployment.

| Key            | Description                                                                                                       | Default Value     |
| -------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------- |
| MODE           | Sets whether the application is running in a development environment or production. Use **dev** or **prod** here. | dev               |
| PORT           | Sets the listening and operational port within the docker container. This port will be exposed.                   | 80                |
| TIMEZONE       | Sets the Docker containers [timezone](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List).         | "America/Chicago" |
| MYSQL_HOST     |                                                                                                                   |                   |
| MYSQL_PORT     |                                                                                                                   | 3306              |
| MYSQL_USERNAME |                                                                                                                   |                   |
| MYSQL_PASSWORD |                                                                                                                   |                   |

## APIs

| Name | Description |
| ---- | ----------- |
|      |             |

## Installation

Docker is the preferred installation method.

### Docker

#### Docker Compose Installation

Utilizing Docker Compose is the preferred method.

1. Download the source files.
2. Navigate to the source files root.
3. Edit the docker-compose.yml

## Usage

Ensure that [Node and NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) are installed. Installation is beyond the scope of this documentation.

Use ```npm install``` to install all dependencies.  
To run the node server, use: ```npm run start``` (or ```npm run dev``` for utilizing nodemon)
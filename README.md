# abc-scraper
Scraper for information about specific ABC products.

The project is separated into two major folders:
1) frontend
2) backend

## Frontend

Allows the user to login and view the abc products they are interested in.

## Backend

Code for creating the infra and maintaining a status check for each user for the available product.

### Deploying backend

First, install AWS SAM CLI.

Then within the backend folder, run the following:
`sam deploy cloudformation --stack-name ABC-Scraper-Stack -t template.yaml`
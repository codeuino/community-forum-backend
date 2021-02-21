# Spansberry-Backend
Spansberry aims to provide communities with a discussion platform via which they can hassle-free organize all the ongoing discussions under different categories and topics thereby keeping track of everything without getting lost in the abundance of it. This helps to manage the cluttered communication process, focus on the important ones and turn them into impactful actions.
You can use [this](https://www.getpostman.com/collections/be6f85df67f7b4de916f) postman collection to manually test the API endpoints.

## Technologies Involved
Spansberry backend application is built on the following technologies:
1. NodeJS 
2. ExpressJS 
3. GraphQL
4. Socket.io
5. MongoDB (Mongoose)

##  Setting up the Project
(Make sure you have NodeJS and NPM installed on your machine. Further for the database you can either have a separate MongoDB server running on your local machine or can use external services like MongoDB Atlas.)
1. Fork this repository
2. Clone this forked repository on your local machine using: 
`git clone https://github.com/<username>/community-forum-backend.git`. (Replace username with your own username)
3. Install all the dependencies using `npm install`.
4. Copy `example.env` and rename it to `.env` (Avoid removing `example.env`). Then, setup database details in the `.env` file.
5. Start the application using `npm start`.

You are good to go now, make sure your frontend application is running simultaneously on port `3000`.

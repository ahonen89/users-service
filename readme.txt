1. Problem to solve:

We have a number of users that we need to keep track of, we also wish to keep track of the
connections between users. The term ‘connection’ is used here as a synonym of ‘relationship’. 

Solution
We would like you to build a web app or service that allows:
Multiple users to register.
Registered users to search for other users, but not see the who the users are connected to.
Registered users to form a connection with alternative users.
An admin user to see the list of users with connections.

Restrictions
Backend should be written in NodeJS.
Your code should have Unit tests. 
You may use any database of your choice.
Consider that your solution should come with deployment instructions.


2. Solving the problem:
I have build a service - represented by a REST API. 
It can be also extended with an UI - to be considered a full web app, but for now, it is just the API. 
It also has a index page which can be reached by following the URL: http://localhost:8000
The app was built in node.js, using express web framework.

I have used mongoDB as the database.
The solution comes with corresponding unit and integration (api) tests.
Please also see the deployment.txt file.


3. App structure
The app was structured (organized):
/
/app_api (represents the API)
/app_client (client application - angular/react/etc)
/app_server (server application - currently it just serves the index page)
/test (folder containing unit and integration tests)
/public (folder for static content and assets)
/bin/www.js (entry-point)
app.js (express application)
package.json (specifies app meta-data and dependencies)

app_api, app_cliet, app_server are all organized to contain separete folders for different components
of the application: controllers, routes, views, models, etc


4. Endpoints

GET host:8000 / (index page)
POST host:8000 /api/users (create/register new user)
GET host:8000 /api/users/search/:userId?filter=name (userId searches for other users)
PUT host:8000 /api/users/connect/:userId (userId connects to other user) - body must contain "connectUserName" param
GET host:8000 /api/users/:userId (userId - only an admin - searches other users)
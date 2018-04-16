# Starting the servers

Ensure you have docker and docker-compose installed in your system,
change directory to this repo and run the following commands:

```
docker-compose build
docker-compose up
```

Then you will be able to access the accounts service on port 8081,
the habits service on port 8082, the tasks service on port 8083
and the reports service on port 8084.

If you would like to play around inside a service container you must
first find out its container id, you can find it by doing

```
docker ps
```

You will get something like this

```
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS                    NAMES
c3e358878c33        code_habits         "npm start"         2 minutes ago       Up 2 minutes        0.0.0.0:8082->8082/tcp   code_habits_1
21aa51ba770e        code_reports        "npm start"         2 minutes ago       Up 2 minutes        0.0.0.0:8084->8084/tcp   code_reports_1
7bd066d57bfa        code_tasks          "npm start"         2 minutes ago       Up 2 minutes        0.0.0.0:8083->8083/tcp   code_tasks_1
4630fe142e70        code_accounts       "npm start"         2 minutes ago       Up 2 minutes        0.0.0.0:8081->8081/tcp   code_accounts_1
```

Knowing the container id you can enter its console by doing something like the
following (this would get you into the habits container)

```
docker exec -ti c3e358878c33 bash
```

To exit a container without tearing it down you may do `C-p q`

# Examples on using the api

You may look at the REST file of each service subdirectory to find out examples
of how to use the API. These files are written for an emacs editor mode that
can execute API calls, but it's pretty self evident what they are doing so
that you may translate them to your tool of choice.

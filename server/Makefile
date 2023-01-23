build:
	docker build -t api-server .

run:
	docker run -p 3000:3000 -v $PWD:/app/server -v /app/server/node_modules api-server nodemon index.js
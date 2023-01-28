build:
	cd server && $(MAKE) build
	cd client && $(MAKE) build

run:
	docker-compose --env-file ./.env up

stop:
	docker-compose down
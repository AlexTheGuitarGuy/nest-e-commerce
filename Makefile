PROFILE ?=infrastructure

serve:
	make -j2 watch up

restart:
	make destroy && make serve

up:
	docker compose --file ./docker/compose.yml --env-file=./docker/container.env --profile=${PROFILE} up --build

destroy:
	docker compose --file ./docker/compose.yml --env-file=./docker/container.env --profile=${PROFILE} down --volumes

watch:
	docker compose --file ./docker/compose.yml --env-file=./docker/container.env --profile=${PROFILE} watch --no-up

serve-dev-doppler:
	dopple run -- pnpm start:dev

# create start script
start-local-dev:
	yarn start:dev 

start-local-dev-minio:
	minio server ~/minio --console-address :9090

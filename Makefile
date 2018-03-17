# DevOps Little Helper
# Author: Manuel Bernal-Llinares <mbdebian@gmail.com>

# Environment
docker_compose_development_file = docker-compose-development.yml
folder_build = build
folder_dist = dist
folder_src = src
file_lib_entry_point = index.js
target_file_name_library = identifiers.js
tag_version = $(shell cat VERSION)

# Default target
all: deploy

release: deploy set_next_development_version
	@echo "<===|DEVOPS|===> [RELEASE] New Release of the library"

sync_project_version:
	@echo "<===|DEVOPS|===> [SYNC] Synchronizing project version to version '${tag_version}'"
	@# TODO

set_next_development_version:
	@echo "<===|DEVOPS|===> [SYNC] Setting the new development version, current ${tag_version}"
	@# TODO

deploy: clean distribution
	@echo "<===|DEVOPS|===> [DEPLOY] Deploying library, version ${tag_version}"
	@# TODO

development_env_up:
	@echo "<===|DEVOPS|===> [ENVIRONMENT] Bringing development environment UP"
	@docker-compose -f $(docker_compose_development_file) up -d
	@# TODO Clean this way of referencing the target name in future iterations
	@rm -f development_env_down
	@touch development_env_up

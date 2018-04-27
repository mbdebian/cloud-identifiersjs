# DevOps Little Helper
# Author: Manuel Bernal-Llinares <mbdebian@gmail.com>

# Environment
docker_compose_development_file = docker-compose-development.yml
folder_build = build
folder_dist = dist
folder_src = src
file_lib_entry_point = index.js
target_file_name_library = identifiers.js
s3_target = s3://js-identifiers-org/identifiersjs/
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
	@#aws s3 rm ${s3_target} --recursive
	@aws s3 cp dist ${s3_target} --recursive

development_env_up:
	@echo "<===|DEVOPS|===> [ENVIRONMENT] Bringing development environment UP"
	@docker-compose -f $(docker_compose_development_file) up -d
	@# TODO Clean this way of referencing the target name in future iterations
	@rm -f development_env_down
	@touch development_env_up

development_env_down:
	@echo "<===|DEVOPS|===> [ENVIRONMENT] Bringing development environment DOWN"
	@docker-compose -f $(docker_compose_development_file) down
	@# TODO Clean this way of referencing the target name in future iterations
	@rm -f development_env_up
	@touch development_env_down

development_run_tests: development_env_up
	@echo "<===|DEVOPS|===> [TESTS] Running Unit Tests"
	@# TODO

build_lib:
	@echo "<===|DEVOPS|===> [BUILD] Building Library"
	@# I won't even minify the library at the beginning, sorry

distribution: dist build
	@echo "<===|DEVOPS|===> [DISTRIBUTION] Preparing distribution components of the library"
	@# TODO - this should be the place for minifying the library
	@cp ${folder_src}/${file_lib_entry_point} ${folder_dist}/${target_file_name_library}

dist:
	@echo "<===|DEVOPS|===> [FOLDER] Creating distribution folder"
	@mkdir -p ${folder_dist}

clean: clean_tmp
	@echo "<===|DEVOPS|===> [CLEAN] Cleaning the space"
	@rm -rf ${folder_dist}

	# Folders
tmp:
	@echo "<===|DEVOPS|===> [FOLDER] Creating temporary folders"
	@mkdir -p tmp/fakesmtp

clean_tmp:
	@echo "<===|DEVOPS|===> [HOUSEKEEPING] Cleaning temporary folders"
	@rm -rf tmp

.PHONY: all clean clean_tmp build_lib distribution deploy release sync_project_version set_next_development_version

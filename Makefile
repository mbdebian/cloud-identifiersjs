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

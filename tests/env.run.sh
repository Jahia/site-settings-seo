#!/bin/bash
# This script can be used to warmup the environment and execute the tests
# It is used by the docker image at startup

source ./set-env.sh

#!/usr/bin/env bash
START_TIME=$SECONDS
RUN=${RUN:-ci}
echo " env.run.sh == Printing the most important environment variables"
echo " MANIFEST: ${MANIFEST}"
echo " TESTS_IMAGE: ${TESTS_IMAGE}"
echo " JAHIA_IMAGE: ${JAHIA_IMAGE}"
echo " JAHIA_CLUSTER_ENABLED: ${JAHIA_CLUSTER_ENABLED}"
echo " MODULE_ID: ${MODULE_ID}"
echo " JAHIA_URL: ${JAHIA_URL}"
echo " JAHIA_HOST: ${JAHIA_HOST}"
echo " JAHIA_PORT: ${JAHIA_PORT}"
echo " JAHIA_USERNAME: ${JAHIA_USERNAME}"
echo " JAHIA_PASSWORD: ${JAHIA_PASSWORD}"
echo " JAHIA_USERNAME_TOOLS: ${JAHIA_USERNAME_TOOLS}"
echo " JAHIA_PASSWORD_TOOLS: ${JAHIA_PASSWORD_TOOLS}"
echo " SUPER_USER_PASSWORD: ${SUPER_USER_PASSWORD}"
echo " CYPRESS_BROWSER: ${CYPRESS_BROWSER}"
echo " TIMEZONE: ${TIMEZONE}"
echo " RUN: ${RUN}"
echo " == Using Node version: $(node -v)"
echo " == Using yarn version: $(yarn -v)"

echo " == Waiting for Jahia to startup"
while [[ "$(curl -s -o /dev/null -w ''%{http_code}'' ${JAHIA_URL}/cms/login)" != "200" ]];
  do sleep 5;
done

ELAPSED_TIME=$(($SECONDS - $START_TIME))
echo " == Jahia became alive in ${ELAPSED_TIME} seconds"

echo "$(date +'%d %B %Y - %k:%M') [JAHIA_CLUSTER_ENABLED] == Value: ${JAHIA_CLUSTER_ENABLED} =="
if [[ "${JAHIA_CLUSTER_ENABLED}" == "true" ]]; then
    echo "$(date +'%d %B %Y - %k:%M') [JAHIA_CLUSTER_ENABLED] == Jahia is running in cluster =="
    echo "$(date +'%d %B %Y - %k:%M') [JAHIA_CLUSTER_ENABLED] == Pausing for 60s to give cluster nodes time to start =="
    sleep 60
fi

mkdir -p ./run-artifacts
mkdir -p ./results

# Add the credentials to a temporary manifest for downloading files
# Execute jobs listed in the manifest
# If the file doesn't exist, we assume it is a URL and we download it locally
if [[ -e ${MANIFEST} ]]; then
  cp ${MANIFEST} ./run-artifacts
else
  echo "Downloading: ${MANIFEST}"
  curl ${MANIFEST} --output ./run-artifacts/curl-manifest
  MANIFEST="curl-manifest"
fi


if [[ -d provisioning/ ]]; then
  cd provisioning/ || exit 1
  for f in *.yaml ; do
    echo "$(date +'%d %B %Y - %k:%M') == Executing provisioning: ${f} =="
    curl -u root:${SUPER_USER_PASSWORD} -X POST ${JAHIA_URL}/modules/api/provisioning --form script="@./${f};type=text/yaml"
  done
  cd ..
fi

echo "$(date +'%d %B %Y - %k:%M') == Executing manifest: ${MANIFEST} =="
curl -u root:${SUPER_USER_PASSWORD} -X POST ${JAHIA_URL}/modules/api/provisioning --form script="@./run-artifacts/${MANIFEST};type=text/yaml"
echo
if [[ $? -eq 1 ]]; then
  echo "PROVISIONING FAILURE - EXITING SCRIPT, NOT RUNNING THE TESTS"
  echo "failure" > ./results/test_failure
  exit 1
fi

if [[ -d artifacts/ && $MANIFEST == *"build"* ]]; then
  # If we're building the module (and manifest name contains build), then we'll end up pushing that module individually
  # The artifacts folder is created by the build stage, when running in snapshot the docker container is not going to contain that folder
  cd artifacts/
  echo "$(date +'%d %B %Y - %k:%M') == Content of the artifacts/ folder"
  ls -lah
  echo "$(date +'%d %B %Y - %k:%M') [MODULE_INSTALL] == Will start submitting files"
  for file in $(ls -1 *-SNAPSHOT.jar | sort -n)
  do
    echo "$(date +'%d %B %Y - %k:%M') [MODULE_INSTALL] == Submitting module from: $file =="
    curl -u root:${SUPER_USER_PASSWORD} -X POST ${JAHIA_URL}/modules/api/provisioning --form script='[{"installAndStartBundle":"'"$file"'", "forceUpdate":true}]' --form file=@$file
    echo
    echo "$(date +'%d %B %Y - %k:%M') [MODULE_INSTALL] == Module submitted =="
  done
  cd ..
fi

echo "$(date +'%d %B %Y - %k:%M') == Executing configuration manifest: provisioning-manifest-configure.yml =="
curl -u root:${SUPER_USER_PASSWORD} -X POST ${JAHIA_URL}/modules/api/provisioning --form script="@./provisioning-manifest-configure.yml;type=text/yaml"
if [[ $? -eq 1 ]]; then
  echo "PROVISIONING FAILURE - EXITING SCRIPT, NOT RUNNING THE TESTS"
  echo "failure" > ./results/test_failure
  exit 1
fi

echo "$(date +'%d %B %Y - %k:%M') == Fetching the list of installed modules =="
~/node_modules/@jahia/jahia-reporter/bin/run utils:modules \
  --moduleId="${MODULE_ID}" \
  --jahiaUrl="${JAHIA_URL}" \
  --jahiaPassword="${SUPER_USER_PASSWORD}" \
  --filepath="results/installed-jahia-modules.json"
echo "$(date +'%d %B %Y - %k:%M') == Modules fetched =="
INSTALLED_MODULE_VERSION=$(cat results/installed-jahia-modules.json | jq '.module.version')
if [[ $INSTALLED_MODULE_VERSION == "UNKNOWN" ]]; then
  echo "$(date +'%d %B %Y - %k:%M') ERROR: Unable to detect module: ${MODULE_ID} on the remote system "
  echo "$(date +'%d %B %Y - %k:%M') ERROR: The Script will exit"
  echo "$(date +'%d %B %Y - %k:%M') ERROR: Tests will NOT run"
  echo "failure" > ./results/test_failure
  exit 1
fi

CYPRESS_CONFIG="cypress.config.ts"

echo "$(date +'%d %B %Y - %k:%M') == Run tests with config: ${CYPRESS_CONFIG} =="
if [[ "${JAHIA_CLUSTER_ENABLED}" == "true" ]]; then
  echo "$(date +'%d %B %Y - %k:%M') == Run ALL specs with cluster enabled =="
  yarn e2e:${RUN} --config-file ${CYPRESS_CONFIG}
else
  echo "$(date +'%d %B %Y - %k:%M') == Run REDUCED specs with cluster disabled =="
  yarn e2e:ci:standalone --config-file ${CYPRESS_CONFIG}
fi

if [[ $? -eq 0 ]]; then
  echo "$(date +'%d %B %Y - %k:%M') == Full execution successful =="
  echo "success" > ./results/test_success
  yarn report:merge; yarn report:html
  exit 0
else
  echo "$(date +'%d %B %Y - %k:%M') == One or more failed tests =="
  echo "failure" > ./results/test_failure
  yarn report:merge; yarn report:html
  exit 1
fi

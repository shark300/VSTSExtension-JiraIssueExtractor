MESSAGES=$(curl -s -H "Authorization: Bearer $SYSTEM_ACCESSTOKEN" -H "Content-Type: application/json" "https://dev.azure.com/$ORG/$SYSTEM_TEAMPROJECT/_apis/build/builds/$BUILD_BUILDID/changes?api-version=6.0" | jq -r ".value[].message")
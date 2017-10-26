#!/bin/bash

if [ $# -eq 4 ]
then
    NIFI_KYLO_FOLDER=$1
    HDF_NIFI_HOME_FOLDER=$2
    NIFI_USER=$3
    NIFI_GROUP=$4
else
    echo "Unknown arguments. You must pass in the nifi-kylo setup folder location, the HDF NiFI Home folder location, and user:group names. For example: /opt/nifi-kylo /usr/hdp/current/nifi nifi:nifi"
    exit 1
fi

mkdir $HDF_NIFI_HOME_FOLDER/lib/app

echo "Creating symbolic links"
ln -f -s $NIFI_KYLO_FOLDER/lib/kylo-nifi-core-service-nar-*.nar $HDF_NIFI_HOME_FOLDER/lib/kylo-nifi-core-service-nar.nar
ln -f -s $NIFI_KYLO_FOLDER/lib/kylo-nifi-standard-services-nar-*.nar $HDF_NIFI_HOME_FOLDER/lib/kylo-nifi-standard-services-nar.nar
ln -f -s $NIFI_KYLO_FOLDER/lib/kylo-nifi-core-v1-nar-*.nar $HDF_NIFI_HOME_FOLDER/lib/kylo-nifi-core-nar.nar
ln -f -s $NIFI_KYLO_FOLDER/lib/kylo-nifi-spark-v1-nar-*.nar $HDF_NIFI_HOME_FOLDER/lib/kylo-nifi-spark-nar.nar
ln -f -s $NIFI_KYLO_FOLDER/lib/kylo-nifi-hadoop-v1-nar-*.nar $HDF_NIFI_HOME_FOLDER/lib/kylo-nifi-hadoop-nar.nar
ln -f -s $NIFI_KYLO_FOLDER/lib/kylo-nifi-hadoop-service-v1-nar-*.nar $HDF_NIFI_HOME_FOLDER/lib/kylo-nifi-hadoop-service-nar.nar
ln -f -s $NIFI_KYLO_FOLDER/lib/kylo-nifi-provenance-repo-v1-nar-*.nar $HDF_NIFI_HOME_FOLDER/lib/kylo-nifi-provenance-repo-nar.nar
ln -f -s $NIFI_KYLO_FOLDER/lib/kylo-nifi-core-service-nar-*.nar $HDF_NIFI_HOME_FOLDER/lib/kylo-nifi-core-service-nar.nar

ln -f -s $NIFI_KYLO_FOLDER/lib/app/kylo-spark-validate-cleanse-spark-v2-*-jar-with-dependencies.jar $HDF_NIFI_HOME_FOLDER/lib/app/kylo-spark-validate-cleanse-jar-with-dependencies.jar
ln -f -s $NIFI_KYLO_FOLDER/lib/app/kylo-spark-job-profiler-spark-v2-*-jar-with-dependencies.jar $HDF_NIFI_HOME_FOLDER/lib/app/kylo-spark-job-profiler-jar-with-dependencies.jar
ln -f -s $NIFI_KYLO_FOLDER/lib/app/kylo-spark-interpreter-spark-v2-*-jar-with-dependencies.jar $HDF_NIFI_HOME_FOLDER/lib/app/kylo-spark-interpreter-jar-with-dependencies.jar

echo "Updating permissions for the nifi sym links"
chown -h nifi:nifi $HDF_NIFI_HOME_FOLDER/lib/kylo*.nar
chown -h nifi:nifi $HDF_NIFI_HOME_FOLDER/lib/app/kylo*.jar


sed -i "s|kylo.provenance.cache.location=\/opt\/nifi\/feed-event-statistics.gz|kylo.provenance.cache.location=$NIFI_KYLO_FOLDER\/feed-event-statistics.gz|" $NIFI_KYLO_FOLDER/ext-config/config.properties

chown -R $NIFI_USER:$NIFI_GROUP $NIFI_KYLO_FOLDER/

echo "Update complete"
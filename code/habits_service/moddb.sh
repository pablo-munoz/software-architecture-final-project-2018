#!/bin/bash

DB="test.bak"
TABLE="habit"
FIELD="score"
OLD="INTEGER NOT NULL DEFAULT 0"
NEW="DOUBLE NOT NULL DEFAULT 0.0"
TMP="/tmp/sqlite_${TABLE}.sql"

echo "### create dump"
#echo ".dump '$TABLE'" | sqlite3 "$DB" >$TMP

echo "### editing the create statement"
#sed -i "s|$FIELD $OLD|$FIELD $NEW|g" $TMP

read -rsp $'Press any key to continue deleting and recreating the table $TABLE ...\n' -n1 key 

echo "### rename the original to '$TABLE"_backup"'"
sqlite3 "$DB" "PRAGMA busy_timeout=20000; ALTER TABLE '$TABLE' RENAME TO '$TABLE"_backup"'"

echo "### delete the old indexes"
for idx in $(echo "SELECT name FROM sqlite_master WHERE type == 'index' AND tbl_name LIKE '$TABLE""%';" | sqlite3 $DB); do
  echo "DROP INDEX '$idx';" | sqlite3 $DB
done

echo "### reinserting the edited table"
cat $TMP | sqlite3 $DB


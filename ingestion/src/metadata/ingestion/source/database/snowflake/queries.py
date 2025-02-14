#  Copyright 2021 Collate
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#  http://www.apache.org/licenses/LICENSE-2.0
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
"""
SQL Queries used during ingestion
"""

import textwrap

SNOWFLAKE_SQL_STATEMENT = textwrap.dedent(
    """
    SELECT
      query_type,
      query_text,
      user_name,
      database_name,
      schema_name,
      start_time,
      end_time,
      total_elapsed_time/1000 duration
    from snowflake.account_usage.query_history
    WHERE query_text NOT LIKE '/* {{"app": "OpenMetadata", %%}} */%%'
    AND query_text NOT LIKE '/* {{"app": "dbt", %%}} */%%'
    AND start_time between to_timestamp_ltz('{start_time}') and to_timestamp_ltz('{end_time}')
    {filters}
    LIMIT {result_limit}
    """
)

SNOWFLAKE_SESSION_TAG_QUERY = 'ALTER SESSION SET QUERY_TAG="{query_tag}"'

SNOWFLAKE_FETCH_ALL_TAGS = textwrap.dedent(
    """
    select TAG_NAME, TAG_VALUE, OBJECT_DATABASE, OBJECT_SCHEMA, OBJECT_NAME, COLUMN_NAME
    from snowflake.account_usage.tag_references
    where OBJECT_DATABASE = '{database_name}'
      and OBJECT_SCHEMA = '{schema_name}'
"""
)

SNOWFLAKE_GET_TABLE_NAMES = """
select TABLE_NAME from information_schema.tables 
where TABLE_SCHEMA = '{}' and TABLE_TYPE = 'BASE TABLE'
"""

SNOWFLAKE_GET_EXTERNAL_TABLE_NAMES = """
select TABLE_NAME from information_schema.tables 
where TABLE_SCHEMA = '{}' AND TABLE_TYPE = 'EXTERNAL TABLE'
"""


SNOWFLAKE_GET_WITHOUT_TRANSIENT_TABLE_NAMES = """
select TABLE_NAME from information_schema.tables 
where TABLE_SCHEMA = '{}' 
AND TABLE_TYPE = 'BASE TABLE' 
AND IS_TRANSIENT != 'YES'
"""

SNOWFLAKE_GET_VIEW_NAMES = """
select TABLE_NAME from information_schema.tables 
where TABLE_SCHEMA = '{}' and TABLE_TYPE = 'VIEW'
"""
SNOWFLAKE_GET_TRANSIENT_NAMES = """
select TABLE_NAME from information_schema.tables 
where TABLE_SCHEMA = '{}' 
AND TABLE_TYPE = 'BASE TABLE' 
AND IS_TRANSIENT = 'YES'
"""

SNOWFLAKE_GET_COMMENTS = textwrap.dedent(
    """
  select
    TABLE_SCHEMA "schema",
    TABLE_NAME "table_name",
    COMMENT "table_comment"
from information_schema.TABLES
where TABLE_SCHEMA <> 'INFORMATION_SCHEMA'
and comment is not null
"""
)

SNOWFLAKE_GET_CLUSTER_KEY = """
  select CLUSTERING_KEY,
          TABLE_SCHEMA,
          TABLE_NAME
  from   information_schema.tables 
  where  TABLE_TYPE = 'BASE TABLE'
  and CLUSTERING_KEY is not null
"""


SNOWFLAKE_GET_SCHEMA_COMMENTS = """
SELECT 
      catalog_name DATABASE_NAME,
      SCHEMA_NAME,
      COMMENT 
FROM information_schema.schemata
"""


SNOWFLAKE_GET_DATABASE_COMMENTS = """
select DATABASE_NAME,COMMENT from information_schema.databases
"""

SNOWFLAKE_TEST_FETCH_TAG = """
select TAG_NAME from snowflake.account_usage.tag_references limit 1
"""

SNOWFLAKE_TEST_GET_QUERIES = """
SELECT query_text from snowflake.account_usage.query_history limit 1
"""

SNOWFLAKE_TEST_GET_TABLES = """
SELECT TABLE_NAME FROM information_schema.tables LIMIT 1 
"""

SNOWFLAKE_GET_DATABASES = "SHOW DATABASES"


SNOWFLAKE_GET_SCHEMA_COLUMNS = """
SELECT /* sqlalchemy:_get_schema_columns */
        ic.table_name,
        ic.column_name,
        ic.data_type,
        ic.character_maximum_length,
        ic.numeric_precision,
        ic.numeric_scale,
        ic.is_nullable,
        ic.column_default,
        ic.is_identity,
        ic.comment,
        ic.identity_start,
        ic.identity_increment
    FROM information_schema.columns ic
    WHERE ic.table_schema=:table_schema
    ORDER BY ic.ordinal_position
"""

SNOWFLAKE_GET_CURRENT_REGION = "SELECT CURRENT_REGION() AS region"

SNOWFLAKE_GET_CURRENT_ACCOUNT = "SELECT CURRENT_ACCOUNT() AS account"

SNOWFLAKE_LIFE_CYCLE_QUERY = textwrap.dedent(
    """
select 
table_name as table_name,
created as created_at,
deleted as deleted_at
from snowflake.account_usage.tables
where table_schema = '{schema_name}'
and table_catalog = '{database_name}'
"""
)

SNOWFLAKE_GET_STORED_PROCEDURES = textwrap.dedent(
    """
SELECT 
  PROCEDURE_NAME AS name,
  PROCEDURE_OWNER AS owner,
  PROCEDURE_LANGUAGE AS language,
  PROCEDURE_DEFINITION AS definition,
  ARGUMENT_SIGNATURE AS signature,
  COMMENT as comment
FROM INFORMATION_SCHEMA.PROCEDURES
WHERE PROCEDURE_CATALOG = '{database_name}'
  AND PROCEDURE_SCHEMA = '{schema_name}'
    """
)

SNOWFLAKE_GET_STORED_PROCEDURE_QUERIES = textwrap.dedent(
    """
WITH SP_HISTORY AS (
    SELECT
      QUERY_ID,
      QUERY_TEXT,
      SESSION_ID,
      START_TIME,
      END_TIME
    FROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY SP
    WHERE QUERY_TYPE = 'CALL'
      AND START_TIME >= '{start_date}' 
      AND WAREHOUSE_NAME = '{warehouse}'
      AND SCHEMA_NAME = '{schema_name}'
      AND DATABASE_NAME = '{database_name}'
),
Q_HISTORY AS (
    SELECT
      QUERY_ID,
      QUERY_TYPE,
      QUERY_TEXT,
      SESSION_ID,
      START_TIME,
      END_TIME,
      TOTAL_ELAPSED_TIME/1000 AS DURATION,
      USER_NAME
    FROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY SP
    WHERE QUERY_TYPE <> 'CALL'
      AND QUERY_TEXT NOT LIKE '/* {{"app": "OpenMetadata", %%}} */%%'
      AND QUERY_TEXT NOT LIKE '/* {{"app": "dbt", %%}} */%%'
      AND START_TIME >= '{start_date}' 
      AND WAREHOUSE_NAME = '{warehouse}'
      AND SCHEMA_NAME = '{schema_name}'
      AND DATABASE_NAME = '{database_name}'
)
SELECT
  SP.QUERY_ID AS PROCEDURE_ID,
  Q.QUERY_ID AS QUERY_ID,
  Q.QUERY_TYPE AS QUERY_TYPE,
  SP.QUERY_TEXT AS PROCEDURE_TEXT,
  SP.START_TIME AS PROCEDURE_START_TIME,
  SP.END_TIME AS PROCEDURE_END_TIME,
  Q.START_TIME AS QUERY_START_TIME,
  Q.DURATION AS QUERY_DURATION,
  Q.QUERY_TEXT AS QUERY_TEXT,
  Q.USER_NAME AS QUERY_USER_NAME
FROM SP_HISTORY SP
JOIN Q_HISTORY Q
  ON SP.SESSION_ID = Q.SESSION_ID
 AND (
   Q.START_TIME BETWEEN SP.START_TIME AND SP.END_TIME
   OR Q.END_TIME BETWEEN SP.START_TIME AND SP.END_TIME
   )
ORDER BY PROCEDURE_START_TIME DESC
    """
)

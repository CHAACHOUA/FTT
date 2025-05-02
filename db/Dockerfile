
FROM mysql:8.0
COPY ./sql/init_db.sql /docker-entrypoint-initdb.d/
EXPOSE 3306
CMD ["mysqld"]

# Stage 1: Build stage
FROM maven:3.8.4-openjdk-17-slim AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline

# Cache the Maven dependencies to speed up builds if the pom.xml hasn't changed
RUN mvn verify clean --fail-never

# Copy the rest of the application code
COPY src ./src
RUN mvn package -DskipTests

# Stage 2: Runtime stage
FROM openjdk:17-jdk-alpine3.14
WORKDIR /app

# Copy the JAR file built in the previous stage
COPY --from=build /app/target/yourTodayTip-0.0.1-SNAPSHOT.jar /app/yourTodayTip.jar

# Expose the port that the Spring Boot application will run on
EXPOSE 8080

# Specify the command to run the Spring Boot application when the container starts
CMD ["java", "-jar", "yourTodayTip.jar"]
# Set the default Spring profile to 'default' (or any other profile you want to use by default)
ENV SPRING_PROFILES_ACTIVE=render
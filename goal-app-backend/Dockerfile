# Multi-stage build for Spring Boot microservices
FROM maven:3.9.11-eclipse-temurin-17-noble AS build

# Set working directory
WORKDIR /app

# Copy parent pom.xml first for better caching
COPY pom.xml .

# Copy all module pom.xml files
COPY common/pom.xml ./common/
COPY user-service/pom.xml ./user-service/
COPY goal-service/pom.xml ./goal-service/
COPY points-service/pom.xml ./points-service/
COPY notification-service/pom.xml ./notification-service/
COPY api-gateway/pom.xml ./api-gateway/
COPY challenge-service/pom.xml ./challenge-service/

# Download dependencies (this layer will be cached if pom.xml files don't change)
RUN mvn dependency:go-offline -B

# Copy source code
COPY . .

# Build the application
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-jammy

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create app user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set working directory
WORKDIR /app

# Copy the jar file from build stage
ARG SERVICE_NAME
COPY --from=build /app/${SERVICE_NAME}/target/*.jar app.jar

# Change ownership to app user
RUN chown -R appuser:appuser /app
USER appuser

# Expose port (will be set by environment variable SERVER_PORT)
EXPOSE 8080 8081 8082 8083 8084 8085

# Health check (uses SERVER_PORT environment variable)
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:${SERVER_PORT:-8080}/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
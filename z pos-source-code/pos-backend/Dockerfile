# Use a lightweight JRE for the final image
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy the JAR from your local target folder 
# (Make sure you ran 'mvn package' locally first!)
COPY target/*.jar app.jar

EXPOSE 5000

ENTRYPOINT ["java", "-Xmx512m", "-jar", "app.jar"]

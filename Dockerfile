# Stage 1: Build the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /app

# Copy the project file(s) and restore dependencies
COPY *.csproj ./
RUN dotnet restore

# Copy the rest of the code
COPY . ./

# Publish the app to the /out folder
RUN dotnet publish -c Release -o /out








# Stage 2: Create the runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /out ./

# Expose the port the app runs on
EXPOSE 5000

# Start the app
ENTRYPOINT ["dotnet", "ProjectMaVe.dll"]


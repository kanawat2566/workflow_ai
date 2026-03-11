FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY Parser.sln .
COPY Parser.API/Parser.API.csproj Parser.API/
COPY Parser.Tests/Parser.Tests.csproj Parser.Tests/
RUN dotnet restore

COPY . .
RUN dotnet build -c Release --no-restore
RUN dotnet test --no-build -c Release

FROM build AS publish
RUN dotnet publish Parser.API/Parser.API.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
EXPOSE 5100
ENV ASPNETCORE_URLS=http://+:5100
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Parser.API.dll"]

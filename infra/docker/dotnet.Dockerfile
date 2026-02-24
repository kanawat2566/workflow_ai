FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY Parser.API/Parser.API.csproj Parser.API/
RUN dotnet restore Parser.API/Parser.API.csproj

COPY Parser.API/ Parser.API/
RUN dotnet publish Parser.API/Parser.API.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 5100
ENTRYPOINT ["dotnet", "Parser.API.dll"]

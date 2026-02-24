using Microsoft.AspNetCore.Diagnostics;
using Parser.API.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddScoped<IRoslynParserService, RoslynParserService>();
builder.Services.AddScoped<IRouteMapService, RouteMapService>();

var app = builder.Build();

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var feature = context.Features.Get<IExceptionHandlerFeature>();
        var logger = context.RequestServices
            .GetRequiredService<ILogger<Program>>();

        logger.LogError(feature?.Error, "Unhandled exception");
        context.Response.StatusCode = 500;
        await context.Response.WriteAsJsonAsync(new { error = "Internal error" });
    });
});

app.MapControllers();
await app.RunAsync();

public partial class Program
{
    protected Program() { }
}

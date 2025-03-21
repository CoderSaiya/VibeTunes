using System.Text.Json;
using System.Text.Json.Serialization;
using Amazon.S3;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Models;
using VibeTunes.Application.UseCases.Authentication.Commands;
using VibeTunes.Domain.Common;
using VibeTunes.Infrastructure.Configuration;
using VibeTunes.Infrastructure.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Add Service to container DI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "VibeTunes", Version = "v1" }));

builder.Services.AddSwaggerGen(c =>
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter token",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "Bearer"
    }));
builder.Services.AddSwaggerGen(c =>
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    }));

// register AWS
builder.Services.Configure<AWSOptions>(builder.Configuration.GetSection("AWS"));
builder.Services.AddAWSService<IAmazonS3>();

builder.Services.AddHttpContextAccessor();

builder.Services.Configure<JsonOptions>(options =>
{
    options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
});

builder.Services.AddControllers();

// register MediatR
builder.Services.AddMediatR(
    typeof(Program).Assembly,
    typeof(RegisterUserCommand).Assembly
);

// Configure Dependency Injection
builder.Services.AddInfrastructure(builder.Configuration);
// builder.Services.AddApplication();

var app = builder.Build();

// Config pipeline HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// // config authen
// app.UseAuthentication();
// app.UseAuthorization();

app.MapHub<NotificationHub>("/notificationHub");

app.MapControllers();

app.UseHttpsRedirection();

app.Run();
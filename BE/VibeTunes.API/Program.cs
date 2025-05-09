using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Amazon.S3;
using BE.Middleware;
using MediatR;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
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

var jwtConfig = builder.Configuration.GetSection("Jwt");
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtConfig["Key"]!));

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtConfig["Issuer"],
            ValidAudience = jwtConfig["Audience"],
            IssuerSigningKey = signingKey,
            NameClaimType = ClaimTypes.NameIdentifier
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken)
                    && path.StartsWithSegments("/api/musicHub"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

// Configure CORS policy
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
                "http://localhost:8081", 
                "http://localhost:5554", 
                "http://localhost:3000", 
                "https://localhost:3000",
                "http://10.0.2.2:8081",
                "http://10.0.2.2:5554",
                "http://192.168.1.5:19000",
                "http://192.168.1.5:19006",
                "http://127.0.0.1:5500",
                "http://127.0.0.1:5501",
                "http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// register AWS
builder.Services.Configure<AWSOptions>(builder.Configuration.GetSection("AWS"));
builder.Services.AddAWSService<IAmazonS3>();

// Options pattern for Stripe
builder.Services.Configure<StripeOptions>(builder.Configuration.GetSection("Stripe"));

// Options pattern for MoMo
builder.Services.Configure<MoMoOptions>(builder.Configuration.GetSection("MoMo"));

builder.Services.AddHttpContextAccessor();

builder.Services.Configure<JsonOptions>(options =>
{
    options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.JsonSerializerOptions.NumberHandling = JsonNumberHandling.AllowNamedFloatingPointLiterals;
});

builder.Services.AddControllers();

// register MediatR
builder.Services.AddMediatR(
    typeof(Program).Assembly,
    typeof(RegisterUserCommand).Assembly
);

builder.Services.AddSignalR();

builder.Services
    .AddAuthentication("QueryString")
    .AddScheme<AuthenticationSchemeOptions, QueryStringAuthHandler>("QueryString", _ => { });
builder.Services.AddAuthorization();

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

else
{
    app.UseHttpsRedirection();   
}

app.UseCors();

// config authen
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapHub<NotificationHub>("/api/notificationHub");
app.MapHub<MusicHub>("/api/musicHub");

app.MapControllers();

app.Run();
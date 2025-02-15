using VibeTunes.Infrastructure.Configuration;

var builder = WebApplication.CreateBuilder(args);

// Add Service to container DI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure Dependency Injection
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApplication();

var app = builder.Build();

// Config pipeline HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.Run();
using Microsoft.EntityFrameworkCore;
using VibeTunes.Infrastructure.Persistence.Data;

var builder = WebApplication.CreateBuilder(args);

// Add Service to container DI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure Entity Framework
builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlServer(
            connectionString: "Data Source=DESKTOP-1FAVEMH\\SQLEXPRESS;Initial Catalog=VibeTunesDb;Integrated Security=True;trusted_connection=true;encrypt=false;",
            sqlServerOptionsAction: sqlOptions =>
            {
                sqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorNumbersToAdd: null);
            }),
    contextLifetime: ServiceLifetime.Scoped,
    optionsLifetime: ServiceLifetime.Singleton
);


var app = builder.Build();

// Config pipeline HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.Run();
using Microsoft.EntityFrameworkCore;
using ProjectMaVe.Data;
using ProjectMaVe.Interfaces;
using ProjectMaVe.Services;

var builder = WebApplication.CreateBuilder(args);

string googleApiKey = Environment.GetEnvironmentVariable("GOOGLE_API_KEY")!;

// Connect database service
var connectionString = builder.Configuration.GetConnectionString("MaVe");
builder.Services.AddDbContext<DBContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString))
);

// connect API for Google AI
builder.Services.AddScoped<IAIService>(_ => new AIService(googleApiKey));

// Add services to the container.
builder.Services.AddRazorPages();
builder.Services.AddControllers();

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IUserStore, UserStore>();
builder.Services.AddScoped<IAuthenticationService, AuthenticationService>();
builder.Services.AddScoped<IWidgetStore, WidgetStore>();
builder.Services.AddScoped<IWorkoutStore, WorkoutStore>();
builder.Services.AddScoped<IExerciseStore, ExerciseStore>();
builder.Services.AddScoped<IWorkoutExerciseStore, WorkoutExerciseStore>();
builder.Services.AddScoped<IExerciseStore, ExerciseStore>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

// app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.MapRazorPages();
app.MapControllers();

app.Run();

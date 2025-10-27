using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using ProjectMaVe.Data;
using ProjectMaVe.Interfaces;
using ProjectMaVe.Middleware;
using ProjectMaVe.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme).AddCookie(options =>
{
    options.LoginPath = "/LogIn"; //This is the name of the login page to direct user if not logged in.
    options.ExpireTimeSpan = TimeSpan.FromMinutes(30); //Sets the Expiration Time for the cookie
    options.SlidingExpiration = true; //each time you make an authentication request, it resets the time.
});

// Connect database service
var connectionString = builder.Configuration.GetConnectionString("MaVe");
builder.Services.AddDbContext<DBContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString))
); 


// Add services to the container.
builder.Services.AddRazorPages();

builder.Services.AddTransient<AuthenticationMiddleware>();

builder.Services.AddScoped<IUserStore, UserStore>();
builder.Services.AddScoped<IAuthenticationService, AuthenticationService>();
//builder.Services.AddScoped<DBContext, DbContext>();

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

app.UseMaVeAuthentication();

app.MapRazorPages();

app.Run();

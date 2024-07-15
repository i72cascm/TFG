
using System.Text;
using Amazon.S3;
using Backend.Controllers;
using Backend.DTOs;
using Backend.Filters;
using Backend.Models;
using Backend.Services;
using Backend.Validators;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Backend
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            // Connect to the data base
            builder.Services.AddDbContext<DBContext>(options =>
            {
                options.UseSqlServer(builder.Configuration.GetConnectionString("RecipeAppConnection"));
                options.LogTo(Console.WriteLine, LogLevel.Warning);
            });

            // JWT
            builder.Services.AddAuthentication(x =>
            {
                x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                x.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(x =>
            {
                x.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = builder.Configuration["Jwt:Issuer"],
                    ValidAudience = builder.Configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
                };
            });
            builder.Services.AddAuthorization();

            // Email Service
            builder.Services.AddTransient<IEmailService, EmailService>();

            // Add Validators
            builder.Services.AddScoped<IValidator<UserInsertDto>, UserInsertValidator>();

            // Add Services
            builder.Services.AddScoped<IAuthService, AuthService>();

            // Register the ValidateTokenAttribute
            builder.Services.AddScoped<ValidateTokenAttribute>();

            // Register RecipeController and its dependencies
            builder.Services.AddScoped<RecipeController>();

            // Configure controllers
            builder.Services.AddControllers();

            // Swagger
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // AWS S3
            builder.Services.AddDefaultAWSOptions(builder.Configuration.GetAWSOptions());
            builder.Services.AddAWSService<IAmazonS3>();

            // CORS config
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("Origins",
                builder =>
                {
                    builder.WithOrigins("http://localhost:5173")
                        .AllowAnyHeader()
                        .AllowAnyMethod();
                });
            });

            // Edamam Config
            builder.Services.Configure<EdamamOptions>(builder.Configuration.GetSection("Edamam"));
            builder.Services.AddHttpClient<EdamamService>();

            var app = builder.Build();

            // Use CORS with Policy
            app.UseCors("Origins");

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
